import { createTransport } from "nodemailer"

const sendMail = async (email, text, subject) => {

    const transport = createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        }
    })

    await transport.sendMail({
        from: process.env.MAIL_USER,
        to: email,
        subject: subject,
        text
    })
}

export default sendMail;