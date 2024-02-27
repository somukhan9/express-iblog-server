import nodemailer from "nodemailer"

type TOptions = {
  email: string
  subject: string
  message: string
}

export const sendEmail = (options: TOptions) => {
  const transporter = nodemailer.createTransport({
    // host: process.env.SMTP_HOST,
    // port: process.env.SMTP_PORT,
    // service: process.env.SMTP_SERVICE,
    // @ts-ignore
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  })

  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: options.email,
    subject: options.subject,
    text: options.message,
  }

  transporter.sendMail(mailOptions)
}
