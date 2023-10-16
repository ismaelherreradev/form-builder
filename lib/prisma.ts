import { PrismaClient } from '@prisma/client/edge'

const prismaClientSingleton = () => new PrismaClient()

type prismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: prismaClientSingleton | undefined
}

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
