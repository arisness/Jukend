import crypto from 'crypto';
import {sendMail} from './mailSender.js';
const passwordResetTokens = [];

const removeToken = (index, msg) =>
{
    if (index > -1) passwordResetTokens.splice(index, 1);
    if (msg) console.log(msg);
}

export const addTokens = (username, email) =>
{
    const token = crypto.randomInt(0, 1000000).toString().padStart(6, '0');
    const expirationTime = Date.now() + (3600000 * 24);
        
    for (let i = 0; i < passwordResetTokens.length; i++)
    {
        if (passwordResetTokens[i].email === email)
        {
            passwordResetTokens.splice(i, 1);
            i--;
        }
    }
    passwordResetTokens.push({token: token, expireDate: expirationTime, email: email});
    if (sendMail(username, email, token)) return true;
    else return false;
}

export const findTokens = (tokenTest) =>
{
    const foundToken = passwordResetTokens.find(t => t.token === tokenTest);
    if (foundToken && foundToken.expireDate > new Date()) return true;
    else return false;
}

export const verifyTokens = async (token, password) =>
{
    let resetTokenIndex = -1;
    const foundToken = passwordResetTokens.find((t, index) =>
    {
        if (t.token === token)
        {
            resetTokenIndex = index;
            return true;
        }
        return false;
    });

    if (!foundToken || foundToken.expireDate < new Date())
    {
        removeToken(resetTokenIndex, `Token ${token} removed because it was invalid/expired.`);
        return {sts: "error", msg: "Invalid or expired token. Please request a new password reset."};
    }

    const userToReset = passwordResetTokens[resetTokenIndex].email;
    if (!userToReset)
    {
        console.error(`User with email ${foundToken.email} not found for password reset.`);
        removeToken(resetTokenIndex);
        return {sts: "error", msg: "An error occurred during password reset. Please try again."};
    }

    try
    {
        const message = await security.resetPassword(password, userToReset);
        if (message !== "Password updated successfully.")
        {
            removeToken(resetTokenIndex, message);
            return {sts: "error", msg: message};
        }
        else
        {
            await security.resetPassword(password, userToReset);
            removeToken(resetTokenIndex, `Token ${token} deleted after successful password update.`);
    
            console.log(`Password for user ${userToReset} updated successfully.`);
            return {sts: "success", msg: "Password updated successfully"};
        }
    }
    catch (error)
    {
        console.error("Error processing password reset:", error);
        return {sts: "error", msg: "An error occurred during password reset. Please try again."};
    }
}