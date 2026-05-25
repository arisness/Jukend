import session from 'express-session';
export default class Session
{
    constructor(app)
    {
       app.use(session({secret: 'web2-project', resave: false, saveUninitialized: false,
            cookie: {maxAge: 24 * 60 * 60 * 1000, httpOnly: true, secure: false, sameSite: 'none'}}));
        
    }

    checkSession(req) {return req.session && req.session.user && req.session.profile;}

    async authenticate(req)
    {
        try
        {
            const r = await runQuery([[queries.user.loginUser, [req.body.user, req.body.pass]]]);
            if (r.rows.length > 0)
            {
                req.session.user = r.rows[0].users_name;
                req.session.profile = r.rows[0].fk_profile_id;
                return {success: true, message: 'Authenticated and session created.'};
            }
            else return {success: false, message: 'Invalid credentials.'};
        }
        catch (error)
        {
            logger.error(error);
            return {success: false, message: 'Authentication failed due to server error.'};
        }
    }

    async login(req, res){
        if (this.checkSession(req)){
            logger.error("Session already exists for this user.");
            return res.status(200).json({status: 'success', message: 'User already has an active session.'});
        }
        else{
            const authResult = await this.authenticate(req);
            if (authResult.success)
            {
                console.log(req.session);
                return res.status(200).json({status: 'success', message: authResult.message, user: req.session.user,
                    profile: req.session.profile});
            }
            else return res.status(401).json({status: 'error', message: authResult.message, user: '', profile: ''});
        }
    }

    closeSession(req, res){
        if (this.checkSession(req)){
            try {
                req.session.destroy();
                res.clearCookie('connect.sid');
                return res.status(200).json({status: "success", message: "Session destroyed"});
            } catch (error) {
                logger.error(error);
                return res.status(500).json({status: "error", message: "Failed to destroy session"});
            }}
        else return res.status(200).json({status: "success", message: "No active session to destroy."});
    }
}