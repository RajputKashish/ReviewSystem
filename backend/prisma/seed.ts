import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Create admin user
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@storereviewer.com' },
        update: {},
        create: {
            name: 'System Administrator Account',
            email: 'admin@storereviewer.com',
            password: adminPassword,
            address: '123 Admin Street, Admin City, Admin Country',
            role: 'ADMIN',
        },
    });
    console.log('Created admin user:', admin.email);

    // Create some sample users
    const userPassword = await bcrypt.hash('User@123', 10);
    const user1 = await prisma.user.upsert({
        where: { email: 'john.doe@example.com' },
        update: {},
        create: {
            name: 'John Doe Regular User',
            email: 'john.doe@example.com',
            password: userPassword,
            address: '456 User Lane, User City, User Country',
            role: 'USER',
        },
    });
    console.log('Created user:', user1.email);

    const user2 = await prisma.user.upsert({
        where: { email: 'jane.smith@example.com' },
        update: {},
        create: {
            name: 'Jane Smith Regular User',
            email: 'jane.smith@example.com',
            password: userPassword,
            address: '789 Customer Road, Customer Town, Customer State',
            role: 'USER',
        },
    });
    console.log('Created user:', user2.email);

    // Create store owners and their stores
    const ownerPassword = await bcrypt.hash('Owner@123', 10);
    const storeOwner1 = await prisma.user.upsert({
        where: { email: 'owner1@techstore.com' },
        update: {},
        create: {
            name: 'Tech Store Owner Account',
            email: 'owner1@techstore.com',
            password: ownerPassword,
            address: '100 Tech Avenue, Silicon Valley, California',
            role: 'STORE_OWNER',
        },
    });
    console.log('Created store owner:', storeOwner1.email);

    const store1 = await prisma.store.upsert({
        where: { email: 'contact@techstore.com' },
        update: {},
        create: {
            name: 'Tech Gadgets Electronics Store',
            email: 'contact@techstore.com',
            address: '100 Tech Avenue, Silicon Valley, California, USA 94000',
            ownerId: storeOwner1.id,
        },
    });
    console.log('Created store:', store1.name);

    const storeOwner2 = await prisma.user.upsert({
        where: { email: 'owner2@fashionhub.com' },
        update: {},
        create: {
            name: 'Fashion Hub Store Owner',
            email: 'owner2@fashionhub.com',
            password: ownerPassword,
            address: '200 Fashion Street, New York City, New York',
            role: 'STORE_OWNER',
        },
    });
    console.log('Created store owner:', storeOwner2.email);

    const store2 = await prisma.store.upsert({
        where: { email: 'contact@fashionhub.com' },
        update: {},
        create: {
            name: 'Fashion Hub Clothing Store',
            email: 'contact@fashionhub.com',
            address: '200 Fashion Street, New York City, New York, USA 10001',
            ownerId: storeOwner2.id,
        },
    });
    console.log('Created store:', store2.name);

    const storeOwner3 = await prisma.user.upsert({
        where: { email: 'owner3@bookworm.com' },
        update: {},
        create: {
            name: 'Bookworm Paradise Store Owner',
            email: 'owner3@bookworm.com',
            password: ownerPassword,
            address: '300 Literary Lane, Boston, Massachusetts',
            role: 'STORE_OWNER',
        },
    });
    console.log('Created store owner:', storeOwner3.email);

    const store3 = await prisma.store.upsert({
        where: { email: 'contact@bookworm.com' },
        update: {},
        create: {
            name: 'Bookworm Paradise Bookstore',
            email: 'contact@bookworm.com',
            address: '300 Literary Lane, Boston, Massachusetts, USA 02101',
            ownerId: storeOwner3.id,
        },
    });
    console.log('Created store:', store3.name);

    // Create some sample ratings
    await prisma.rating.upsert({
        where: { userId_storeId: { userId: user1.id, storeId: store1.id } },
        update: {},
        create: {
            userId: user1.id,
            storeId: store1.id,
            rating: 5,
        },
    });

    await prisma.rating.upsert({
        where: { userId_storeId: { userId: user1.id, storeId: store2.id } },
        update: {},
        create: {
            userId: user1.id,
            storeId: store2.id,
            rating: 4,
        },
    });

    await prisma.rating.upsert({
        where: { userId_storeId: { userId: user2.id, storeId: store1.id } },
        update: {},
        create: {
            userId: user2.id,
            storeId: store1.id,
            rating: 4,
        },
    });

    await prisma.rating.upsert({
        where: { userId_storeId: { userId: user2.id, storeId: store3.id } },
        update: {},
        create: {
            userId: user2.id,
            storeId: store3.id,
            rating: 5,
        },
    });

    console.log('Created sample ratings');
    console.log('Database seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
