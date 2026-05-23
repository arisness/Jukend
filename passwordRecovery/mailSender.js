import nodemailer from 'nodemailer';
import fs from 'fs';
import { loadEnvFile } from 'process';
loadEnvFile('./config/.env');
const htmlTemplate = fs.readFileSync('./passwordRecovery/mailTemplate.html', 'utf8');
const transporter = nodemailer.createTransport({
    service: process.env.NM_SERVICE,
    auth: {
        type: 'OAuth2',
        user: process.env.NM_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN
    },
});

export const sendMail = async (username, user, token) =>
{
    const passwordLink = `https://${process.env.HOST_IP}:${process.env.HOST_PORT}/reset-password/:${token}`;
    const htmlEmail = htmlTemplate.replace(/{{user}}/g, username).replace(/{{passwordLink}}/g, passwordLink);
    const mailOptions =
    {
        from: process.env.NM_USER,
        to: user,
        subject: 'Password Reset',
        html: htmlEmail
    };

    transporter.sendMail(mailOptions, (error, info) =>
    {
        if (error)
        {
            console.log(error);
            return false;
        }
        else
        {
            console.log(`Email sent: ${info.response}`);
            return true;
        }
    });
}