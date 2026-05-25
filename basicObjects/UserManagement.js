import {verifyTokens, removeToken} from '../passwordRecovery/tokenManager.js';

class UserManagement
{
    async getAllUsers() {
        const result = await runQuery([[queries.user.getAllUsers, []]]);
        return result.rows;
    }

    async addUser(user, email, password, profile) {await runQuery([[queries.user.registerUser, [user, email, password, profile]]]);}

    async addGeneralUser(req, res){
        try{
            const {username, email, password} = req.body;
            const r = await runQuery([[queries.user.registerGeneralUser, [username, email, password]]]);
            return res.status(201).json({status: 'success', message: 'User registered successfully.'});
        }
        catch (error){
            logger.error(`Error during registration: ${error}`);
            return res.status(500).json({status: 'error', message: 'Internal server error during registration.'});
        }
    }
    
    /**
     * Checks user existence by email or username, returns false if user doesn't exist, otherwise returns an object with username and email
     * @param {string} emailOrUsername 
     * @returns {Promise<Object|boolean>}
     */
    async checkUser(emailOrUsername)
    {
        try
        {
            const r = await runQuery([[queries.user.verifyUser, [emailOrUsername]]]);
            if (r.rows.length > 0) return {username: r.rows[0].users_name, email: r.rows[0].users_email};
            else return false;
        }
        catch (error)
        {
            logger.error(error);
            return false;
        }
    }

    async resetPassword(req,res){
        const {token, password} = req.body;
        const result = await verifyTokens(token, password);
        if (result.sts === 'error') return res.status(404).json({status: result.sts, message: result.msg});

        const passwordCheck = await runQuery([[queries.user.verifyUser, [result.email]]]);
        if (password === passwordCheck.rows[0].users_password) return res.status(404).json({status: 'error', message: 'This is your current password.'});

        if (result.sts === 'success'){
            try{
                await runQuery([[queries.user.updatePassword, [password, result.email]]]);
                removeToken(result.resetTokenIndex, `Token ${token} deleted after successful password update.`);
                return res.status(200).json({status: 'success', message: 'Password updated successfully.'});
            }
            catch (error)
            {
                logger.error(error);
                return res.status(500).json({status: 'error', message: `Internal error while resetting password: ${error}`});
            } 
        } else return res.status(404).json({status: result.sts, message: result.msg});
    }

    async deleteUser(username) {await runQuery([[queries.user.deleteUser, [username]]]);}

    async getUser(username){
        const results = await runQuery([[queries.user.getUser, [username]]]);
        return results.rows;
    }
    async updateValues(username, email, oldUsername) {await runQuery([[queries.user.updateValue, [username, email, oldUsername]]]);}
}

const userManagement = new UserManagement();
export default userManagement;