import express from 'express';
import https from 'https';
import fs from 'fs';
import cors from 'cors';
import path from 'path';
import * as classes from './modules/classesIndex.js';
import {runQuery} from './DBComponent.js';
import {executeMethod} from './executeMethod.js';
import {addTokens, findTokens, verifyTokens} from './passwordRecovery/tokenManager.js';
const app = express();
const ip = 'localhost';
const port = 3000;
const frontendPath = path.join(import.meta.dirname, '..', 'frontend', 'dist');
const credentials = {key: fs.readFileSync('../https_certs/key.pem'), cert: fs.readFileSync('../https_certs/cert.pem')};
const queries = JSON.parse(fs.readFileSync('./config/queries.json'));
global.runQuery = runQuery;
global.queries = queries;
global.sessionHandler = new classes.Session(app);
global.security = new classes.Security();
global.logger = new classes.Logger();

app.use(express.json());
app.use(cors({origin: `https://${ip}:5173`, credentials: true}));
app.use(express.static(frontendPath));

app.get('*', (req, res) => res.sendFile(path.join(frontendPath, 'index.html')));
app.post('/login', async (req, res) =>
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

app.post('/logout', (req, res) =>
{
    if (req.session && req.session.user)
    {
        if (sessionHandler.closeSession(req, res)) return res.status(200).json({status: "success", message: "Session destroyed"});
        else return res.status(500).json({status: "error", message: "Failed to destroy session"});
    }
    else return res.status(200).json({status: "success", message: "No active session to destroy."});
});

app.post('/checkAuth', (req, res) =>
{
    if (sessionHandler.checkSession(req)) return res.status(200).json({isAuthenticated: true, user: req.session.user,
        profile: req.session.profile});
    else return res.status(401).json({isAuthenticated: false, user: '', profile: ''});
});

app.post('/getOpts', (req, res) =>
{
    const optsArr = security.filterOptions(req);
    return res.status(200).json({status: "success", message: "Sent options to front.", options: optsArr});
});

app.post("/recoverPass", async (req, res) =>
{
    const user = await security.checkUser(req.body.email);
    if (user)
    {
        if (addTokens(user.username, user.email, ip, port)) res.status(200).json({status: "success",
            message: "Password reset email sent."});
        else return res.status(404).json({status: "error", message: "Error sending email."});
    }
    else return res.status(404).json({status: "error", message: "No such user exists."});
});

app.post('/reset-password/:tokenTest', (req, res) =>
{
    const {tokenTest} = req.params;
    if (findTokens(tokenTest)) return res.status(200).json({status: "success", message : "Token is valid."})
    else res.status(404).json({status: "error", message: "Invalid or expired token"});
});

app.post('/reset-password', async (req, res) =>
{
    const {token, password} = req.body;
    const {sts, msg} = await verifyTokens(token, password);
    if (sts === 'success') return res.status(200).json({status: sts, message: msg});
    else return res.status(404).json({status: sts, message: msg});
});

app.post('/toProcess', async (req, res) =>
{
    if (!sessionHandler.checkSession(req))
    {
        logger.error("No session!");
        return res.status(400).json({status: 'error', message: 'User does not have a valid session.'});
    }
    else
    {
        try
        {
            const permsCheck = security.getPermission(req);
            if (permsCheck)
            {
                const executeReq = {...permsCheck, params: req.body.params || []};
                const results = await executeMethod(executeReq);
                return res.status(200).json({message: "Results sent!", output: results});
            }
            else
            {
                logger.error("No permissions!");
                return res.status(401).json({message: "No permissions to run this."});
            }
        }
        catch (error)
        {
            logger.error(`Server error while running toProcess: ${error}`);
            return res.status(404).json({message: 'Internal server error during operation.'});
        }
    }
});

const httpsServer = https.createServer(credentials, app);
httpsServer.listen(port, () => {console.clear(); console.log(`Server running on https://${ip}:${port}`);});