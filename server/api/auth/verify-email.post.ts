import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
    const { prisma } = useNitroApp()
    const { email, code } = await readBody(event)

    const user = await prisma.user.findUnique({ where: { email } })
    console.log("verify email", {user})
    if (!user || user.verificationCode !== code || user.verificationCodeExpires && user.verificationCodeExpires < new Date()) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid or expired verification code'
        })
    }

    await prisma.user.update({
        where: { id: user.id },
        data: {
            isEmailVerified: true,
            verificationCode: null,
            verificationCodeExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
    })

    return { message: 'Email verified successfully' }
})