import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineNitroPlugin(async (nitroApp) => {
  await prisma.$connect()

  nitroApp.prisma = prisma

  nitroApp.hooks.hook('close', async () => {
    await prisma.$disconnect()
  })
})
