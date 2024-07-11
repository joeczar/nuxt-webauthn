import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string)

export async function sendVerificationEmail(to: string, code: string) {
  const msg = {
    to: to,
    from: process.env.FROM_EMAIL as string,
    subject: 'Email Verification',
    text: `Your verification code is: ${code}. This code will expire in 24 hours.`,
    html: `<p>Your verification code is: <strong>${code}</strong>. This code will expire in 24 hours.</p>`,
  }

  try {
    await sgMail.send(msg)
    console.info('Verification email sent successfully')
  } catch (error) {
    console.error('Error sending verification email:', error)
    throw new Error('Failed to send verification email')
  }
}
