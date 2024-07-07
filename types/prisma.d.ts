import { PrismaClient } from '@prisma/client'

declare module 'nitropack' {
    interface NitroApp {
        prisma: PrismaClient
    }
}