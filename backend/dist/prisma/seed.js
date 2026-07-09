"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const bcrypt = __importStar(require("bcrypt"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const connectionString = process.env.DATABASE_URL;
const pool = new pg_1.Pool({ connectionString });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('Seeding database...');
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
            role: client_1.Role.ADMIN,
        },
    });
    const seller = await prisma.user.upsert({
        where: { email: 'seller@smallstore.com' },
        update: {},
        create: {
            email: 'seller@smallstore.com',
            name: 'John Seller',
            password: sellerPassword,
            role: client_1.Role.SELLER,
        },
    });
    console.log('Users created:', { admin: admin.email, seller: seller.email });
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
                stock: 3,
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
//# sourceMappingURL=seed.js.map