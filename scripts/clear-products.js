const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  console.log('Todos los productos eliminados.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
