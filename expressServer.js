import express from 'express';
import userRoutes from './routes/userRoutes.js';
import {runQuery} from './DBComponent.js';
import * as classes from './modules/classesIndex.js';
import {executeMethod} from './executeMethod.js';
import fs from 'fs';
import { loadEnvFile } from 'process';
loadEnvFile('./config/.env');
const app = express();
const {HOST_IP, HOST_PORT} = process.env;

//import https from 'https';
//import cors from 'cors';
//import path from 'path';

//const frontendPath = path.join(import.meta.dirname, '..', 'frontend', 'dist');
//const credentials = {key: fs.readFileSync('../https_certs/key.pem'), cert: fs.readFileSync('../https_certs/cert.pem')};

async function loadConfig(){
    const queries = JSON.parse(fs.readFileSync('./config/queries.json'));
    global.queries = queries;
    global.runQuery = runQuery;
    global.security = new classes.Security();
    global.logger = new classes.Logger();
    global.sessionHandler = new classes.Session(app);
}
await loadConfig()


app.use(express.json());
//app.use(cors({origin: `https://${ip}:5173`, credentials: true}));
//app.use(express.static(frontendPath));

//app.get('*', (req, res) => res.sendFile(path.join(frontendPath, 'index.html')));

app.use('/', userRoutes);

app.post('/getOpts', (req, res) =>
{
    const optsArr = security.filterOptions(req);
    return res.status(200).json({status: "success", message: "Sent options to front.", options: optsArr});
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

//const httpsServer = https.createServer(credentials, app);
//httpsServer.listen(HOST_PORT, () => {console.clear(); console.log(`Server running on https://${HOST_IP}:${HOST_PORT}`);});
app.listen(HOST_PORT, () => {console.clear(); console.log(`Server running on http://${HOST_IP}:${HOST_PORT}`);});