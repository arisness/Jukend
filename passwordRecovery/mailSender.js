import nodemailer from 'nodemailer';
import fs from 'fs';
const config = JSON.parse(fs.readFileSync('./config/mail.json'));
const transporter = nodemailer.createTransport(config.smtp);
const htmlTemplate = fs.readFileSync('./passwordRecovery/mailTemplate.html', 'utf8');

export const sendMail = async (username, user, ip, port, token) =>
{
    const passwordLink = `https://${ip}:${port}/reset-password/:${token}`;
    const htmlEmail = htmlTemplate.replace(/{{user}}/g, username).replace(/{{passwordLink}}/g, passwordLink);
    const mailOptions =
    {
        from: config.smtp.auth.user,
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