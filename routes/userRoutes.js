import express from 'express';
import {addTokens, findTokens, verifyTokens} from '../passwordRecovery/tokenManager.js';
import userManagement from '../basicObjects/UserManagement.js';

const router = express.Router();

router.post('/login', async (req, res) =>{
    return sessionHandler.login(req, res);
});

router.post('/register', async (req, res) =>{
    return userManagement.addGeneralUser(req, res);
});

router.post('/logout', (req, res) =>{
    return sessionHandler.closeSession(req, res);
});

router.post('/checkAuth', (req, res) =>
{
    if (sessionHandler.checkSession(req)) return res.status(200).json({isAuthenticated: true, user: req.session.user,
        profile: req.session.profile});
    else return res.status(401).json({isAuthenticated: false, user: '', profile: ''});
});

router.post("/recoverPass", async (req, res) =>
{
    const user = await userManagement.checkUser(req.body.email);
    if (user){
        if (addTokens(user.username, user.email)) res.status(200).json({status: "success", message: "Password reset email sent."});
        else return res.status(404).json({status: "error", message: "Error sending email."});
    }
    else return res.status(404).json({status: "error", message: "No such user exists."});
});

router.post('/reset-password/:tokenTest', (req, res) =>{
    const {tokenTest} = req.params;
    if (findTokens(tokenTest)) return res.status(200).json({status: "success", message : "Token is valid."})
    else res.status(404).json({status: "error", message: "Invalid or expired token"});
});

router.post('/reset-password', async (req, res) =>{
    return userManagement.resetPassword(req, res);
});

router.post('/update-user', async (req, res) =>{
    return userManagement.updateUserValues(req, res);
});

export default router;