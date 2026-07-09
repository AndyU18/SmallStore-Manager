import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Admin and Seller Users
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('admin123', salt);
  const sellerPassword = await bcrypt.hash('seller123', salt);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@smallstore.com' },
    update: {},
    create: {
      email: 'admin@smallstore.com',
      name: 'Administrator',
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  const seller = await prisma.user.upsert({
    where: { email: 'seller@smallstore.com' },
    update: {},
    create: {
      email: 'seller@smallstore.com',
      name: 'John Seller',
      password: sellerPassword,
      role: Role.SELLER,
    },
  });

  console.log('Users created:', { admin: admin.email, seller: seller.email });

  // 2. Create Categories
  const categoriesData = [
    { name: 'Tecnología', description: 'Dispositivos electrónicos, accesorios y gadgets' },
    { name: 'Belleza', description: 'Cuidado personal, maquillaje y perfumes' },
    { name: 'Hogar', description: 'Artículos para cocina, decoración y organización' },
    { name: 'Accesorios', description: 'Bolsos, relojes, joyería y complementos' },
    { name: 'Otros', description: 'Productos generales sin categoría específica' },
  ];

  const categories = [];
  for (const cat of categoriesData) {
    const createdCat = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
    categories.push(createdCat);
  }
  console.log(`${categories.length} categories seeded.`);

  // 3. Create Products
  const techCat = categories.find(c => c.name === 'Tecnología');
  const beautyCat = categories.find(c => c.name === 'Belleza');

  if (techCat && beautyCat) {
    const productsData = [
      {
        name: 'Audífonos Bluetooth',
        sku: 'AUD-BLU-001',
        description: 'Audífonos inalámbricos con cancelación de ruido',
        purchasePrice: 55.0,
        salePrice: 90.0,
        stock: 15,
        minStock: 5,
        categoryId: techCat.id,
      },
      {
        name: 'Cargador Rápido 20W',
        sku: 'CAR-RAP-20W',
        description: 'Cargador USB-C de pared para carga rápida',
        purchasePrice: 20.0,
        salePrice: 35.0,
        stock: 30,
        minStock: 8,
        categoryId: techCat.id,
      },
      {
        name: 'Mouse Inalámbrico',
        sku: 'MOU-INA-XYZ',
        description: 'Mouse óptico ergonómico con receptor USB',
        purchasePrice: 30.0,
        salePrice: 50.0,
        stock: 3, // Low stock on purpose
        minStock: 5,
        categoryId: techCat.id,
      },
      {
        name: 'Serum de Ácido Hialurónico',
        sku: 'BEL-SER-HYA',
        description: 'Serum hidratante facial de 30ml',
        purchasePrice: 45.0,
        salePrice: 80.0,
        stock: 12,
        minStock: 4,
        categoryId: beautyCat.id,
      },
    ];

    for (const prod of productsData) {
      await prisma.product.upsert({
        where: { sku: prod.sku },
        update: {},
        create: prod,
      });
    }
    console.log('Products seeded.');
  }

  // 4. Create Customers
  const customersData = [
    { name: 'Consumidor Final', email: 'consumidor@final.com', phone: '00000000' },
    { name: 'Maria Gomez', email: 'maria.gomez@gmail.com', phone: '77123456' },
    { name: 'Carlos Perez', email: 'carlos.perez@hotmail.com', phone: '60123456' },
  ];

  for (const cust of customersData) {
    await prisma.customer.create({
      data: cust,
    });
  }
  console.log('Customers seeded.');

  console.log('Database seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
