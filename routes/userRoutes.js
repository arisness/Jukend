import express from 'express';
import {addTokens, findTokens, verifyTokens} from '../passwordRecovery/tokenManager.js';
import userManagement from '../basicObjects/UserManagement.js';

const router = express.Router();

router.post('/login', async (req, res) =>
{
    if (sessionHandler.checkSession(req))
    {
        logger.error("Session already exists for this user.");
        return res.status(200).json({status: 'success', message: 'User already has an active session.'});
    }
    else
    {
        const authResult = await sessionHandler.authenticate(req);
        if (authResult.success)
        {
            console.log(req.session);
            return res.status(200).json({status: 'success', message: authResult.message, user: req.session.user,
                profile: req.session.profile});
        }
        else return res.status(401).json({status: 'error', message: authResult.message, user: '', profile: ''});
    }
});

router.post('/register', async (req, res) =>
{
    try
    {
        const {username, email, password} = req.body;
        const r = await runQuery([[queries.user.registerGeneralUser, [username, email, password]]]);
        return res.status(201).json({status: 'success', message: 'User registered successfully.'});
    }
    catch (error)
    {
        logger.error(`Error during registration: ${error}`);
        return res.status(500).json({status: 'error', message: 'Internal server error during registration.'});
    }
});

router.post('/logout', (req, res) =>
{
    if (req.session && req.session.user)
    {
        if (sessionHandler.closeSession(req, res)) return res.status(200).json({status: "success", message: "Session destroyed"});
        else return res.status(500).json({status: "error", message: "Failed to destroy session"});
    }
    else return res.status(200).json({status: "success", message: "No active session to destroy."});
});

router.post('/checkAuth', (req, res) =>
{
    if (sessionHandler.checkSession(req)) return res.status(200).json({isAuthenticated: true, user: req.session.user,
        profile: req.session.profile});
    else return res.status(401).json({isAuthenticated: false, user: '', profile: ''});
});

router.post("/recoverPass", async (req, res) =>
{
    const user = await security.checkUser(req.body.email);
    if (user)
    {
        if (addTokens(user.username, user.email)) res.status(200).json({status: "success",
            message: "Password reset email sent."});
        else return res.status(404).json({status: "error", message: "Error sending email."});
    }
    else return res.status(404).json({status: "error", message: "No such user exists."});
});

router.post('/reset-password/:tokenTest', (req, res) =>
{
    const {tokenTest} = req.params;
    if (findTokens(tokenTest)) return res.status(200).json({status: "success", message : "Token is valid."})
    else res.status(404).json({status: "error", message: "Invalid or expired token"});
});

router.post('/reset-password', async (req, res) =>
{
    const {token, password} = req.body;
    const {sts, msg} = await verifyTokens(token, password);
    if (sts === 'success') return res.status(200).json({status: sts, message: msg});
    else return res.status(404).json({status: sts, message: msg});
});

router.post('/update-user', async (req, res) =>{

    if (sessionHandler.checkSession(req)){
        const options = ['name', 'email'];
        if(req.body.option == 0 || req.body.option == 1){
            const userChecked = await userManagement.getUser(req.body.value);
            if (userChecked.length > 0){
                return res.status(400).json({status: 'error', message: 'User already exists with this email or username.'});
            }
        }
        const query = queries.user.updateValue.replace('{{var}}', options[req.body.option]);
        try{
            await runQuery([[query, [req.body.value, req.session.user]]]);
            return res.status(200).json({status: 'success', message: 'User information updated successfully.'});
        }
        catch (error)
        {
            logger.error(`Error updating user information: ${error}`);
            return res.status(500).json({status: 'error', message: 'Internal server error while updating user information.'});
        }
    }
    else return res.status(401).json({status: 'error', message: 'Unauthorized. Please log in to update your information.'});
});

export default router;