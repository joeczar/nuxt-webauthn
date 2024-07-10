// File: server/api/debug/users.get.ts

import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
    // IMPORTANT: Remove this check in production
    if (process.env.NODE_ENV === 'production') {
        throw createError({
            statusCode: 403,
            statusMessage: 'This route is not available in production'
        })
    }

    const { prisma } = useNitroApp()

    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                isEmailVerified: true,
                createdAt: true,
                updatedAt: true,
                // Add any other fields you want to display
                // Avoid including sensitive information like passwords or tokens
            }
        })

        console.log(`Retrieved ${users.length} users`)

        return users
    } catch (error) {
        console.error('Error fetching users:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'An error occurred while fetching users'
        })
    }
})