import session from 'express-session';
export default class Session
{
    constructor(app)
    {
        app.use(session({secret: 'web2-project', resave: false, saveUninitialized: false,
            cookie: {maxAge: 24 * 60 * 60 * 1000, httpOnly: true, secure: true, sameSite: 'none'}}));
    }

    checkSession(req) {return req.session && req.session.user && req.session.profile;}

    async authenticate(req)
    {
        try
        {
            const r = await runQuery([[queries.user.loginUser, [req.body.user, req.body.pass]]]);
            if (r.rows.length > 0)
            {
                req.session.user = r.rows[0].username_na;
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

    closeSession(req, res)
    {
        try
        {
            req.session.destroy();
            res.clearCookie('connect.sid');
            return true;
        }
        catch (error)
        {
            logger.error(error);
            return false;
        }
    }
}