import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('SmallStore Manager core flows (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let token: string;
  const suffix = Date.now();
  let categoryId: string;
  let productId: string;
  let saleId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    if (saleId) {
      await prisma.saleItem.deleteMany({ where: { saleId } });
      await prisma.sale.deleteMany({ where: { id: saleId } });
    }
    if (productId) {
      await prisma.stockMovement.deleteMany({ where: { productId } });
      await prisma.product.deleteMany({ where: { id: productId } });
    }
    if (categoryId) {
      await prisma.category.deleteMany({ where: { id: categoryId } });
    }
    await prisma.$disconnect();
    await app.close();
  });

  it('authenticates admin and rejects unauthenticated private routes', async () => {
    await request(app.getHttpServer()).get('/products').expect(401);

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@smallstore.com', password: 'admin123' })
      .expect(201);

    expect(response.body.accessToken).toBeDefined();
    expect(response.body.user.role).toBe('ADMIN');
    token = response.body.accessToken;
  });

  it('creates a category and a low-stock product with an initial stock movement', async () => {
    const categoryResponse = await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: `QA Regresion ${suffix}`, description: 'Categoria temporal de pruebas' })
      .expect(201);

    categoryId = categoryResponse.body.id;

    const productResponse = await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: `Producto Regresion ${suffix}`,
        sku: `QA-${suffix}`,
        description: 'Producto temporal de pruebas',
        purchasePrice: 10,
        salePrice: 18,
        stock: 2,
        minStock: 2,
        categoryId,
      })
      .expect(201);

    productId = productResponse.body.id;

    const lowStockResponse = await request(app.getHttpServer())
      .get('/products?lowStock=true')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(lowStockResponse.body.some((product: { id: string }) => product.id === productId)).toBe(true);

    const movements = await prisma.stockMovement.findMany({ where: { productId } });
    expect(movements.some((movement) => movement.type === 'IN' && movement.quantity === 2)).toBe(true);
  });

  it('registers a sale, discounts stock, creates OUT movement, and cancel returns stock', async () => {
    const saleResponse = await request(app.getHttpServer())
      .post('/sales')
      .set('Authorization', `Bearer ${token}`)
      .send({ items: [{ productId, quantity: 1 }] })
      .expect(201);

    saleId = saleResponse.body.id;
    expect(saleResponse.body.total).toBe(18);
    expect(saleResponse.body.profit).toBe(8);

    const afterSale = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
    expect(afterSale.stock).toBe(1);

    const outMovement = await prisma.stockMovement.findFirst({ where: { productId, type: 'OUT' } });
    expect(outMovement?.previousStock).toBe(2);
    expect(outMovement?.newStock).toBe(1);

    const cancelResponse = await request(app.getHttpServer())
      .post(`/sales/${saleId}/cancel`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    expect(cancelResponse.body.status).toBe('CANCELLED');

    const afterCancel = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
    expect(afterCancel.stock).toBe(2);

    const returnMovement = await prisma.stockMovement.findFirst({ where: { productId, type: 'RETURN' } });
    expect(returnMovement?.previousStock).toBe(1);
    expect(returnMovement?.newStock).toBe(2);
  });

  it('serves dashboard and report data excluding cancelled sales from financial totals', async () => {
    const dashboardResponse = await request(app.getHttpServer())
      .get('/dashboard')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(dashboardResponse.body.lowStockProducts).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(dashboardResponse.body.salesLast7Days)).toBe(true);
    expect(dashboardResponse.body.salesLast7Days).toHaveLength(7);

    const today = new Date().toISOString().slice(0, 10);
    const reportResponse = await request(app.getHttpServer())
      .get(`/reports?startDate=${today}&endDate=${today}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(reportResponse.body.summary.total).toBeGreaterThanOrEqual(0);
    expect(reportResponse.body.sales.every((sale: { status: string }) => sale.status === 'COMPLETED')).toBe(true);
    expect(Array.isArray(reportResponse.body.lowStockProducts)).toBe(true);
  });

  it('rejects invalid report date ranges', async () => {
    await request(app.getHttpServer())
      .get('/reports?startDate=2030-01-02&endDate=2030-01-01')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);
  });
});
