import { defineEventHandler, readBody } from 'h3'
import { sendVerificationEmail } from '~/server/services/emailService'
import { generateVerificationCode } from '~/server/utils/auth/generateCode'


export default defineEventHandler(async (event) => {
    const { prisma } = useNitroApp()
    const { email } = await readBody(event)

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Email already registered'
        })
    }

    const verificationCode = generateVerificationCode()
    const user = await prisma.user.create({
        data: {
            email,
            verificationCode,
            verificationCodeExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
        }
    })

    await sendVerificationEmail(email, verificationCode)

    return { message: 'Registration successful. Please check your email for verification.' }
})