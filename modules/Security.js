/**
 * Clase Security que utiliza Mapas de TX
 */
export default class Security
{
    constructor()
    {
        if (Security.instance) return Security.instance;
        Security.instance = this;
        this.profileMap = new Map();
        this.txMap = new Map();
        this.optsMap = new Map();
        this.permsTxMap = new Map();
        this.permsOptMap = new Map();
        this.onLoad();
    }

    /**
     * Carga los datos y las opciones de seguridad en maps
     */
    async onLoad()
    {
        const txCheck = await runQuery([[queries.tx.txQuery, []]]);
        txCheck.rows.forEach(row => this.txMap.set(row.transaction_id, {obj: row.object_name, method: row.method_name}));

        const permsTxCheck = await runQuery([[queries.tx.permsTxQuery, []]]);
        permsTxCheck.rows.forEach(row => this.permsTxMap.set(`${row.tx_id} + ${row.profile_id}`, true));

        const optCheck = await runQuery([[queries.option.optionsQuery, []]]);
        optCheck.rows.forEach(row => this.optsMap.set(row.option_id,
            {name: row.option_name, function: row.option_function, params: row.option_params ? row.option_params : "",
            async: row.option_async, generic: row.option_generic, component: row.component_name}));
    
        const permsOptCheck = await runQuery([[queries.option.permsOptQuery, []]]);
        permsOptCheck.rows.forEach(row => this.permsOptMap.set(`${row.option_id} + ${row.profile_id}`, true));

        const profileCheck = await runQuery([[queries.profile.getProfiles, []]]);
        profileCheck.rows.forEach(row => this.profileMap.set(row.id, row.name));
    }

    // Methods for user management
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

    /**
     * Resets the user's password
     * @param {string} password 
     * @param {string} email 
     * @returns {Promise<string>}
     */
    async resetPassword(password, email)
    {
        try
        {
            const passwordCheck = await runQuery([[queries.user.verifyUser, [email]]]);
            if (password === passwordCheck.rows[0].users_password) return "This is your current password.";
            else
            {
                await runQuery([[queries.user.updatePassword, [password, email]]]);
                return "Password updated successfully."
            }
        }
        catch (error)
        {
            logger.error(error);
            return `Internal error while reseting password: ${error}`;
        }        
    }

    //Methods for permissions management
    /**
     * Filters options based on the request, to get the options that the user has permissions to see, returns an array of options with their name, function, params and async values
     * @param {Object} req 
     * @returns {Array}
     */
    filterOptions(req)
    {
        return Array.from(this.optsMap.entries()).reduce((arr, [key, value]) =>
        {
            if ((value['component'] === req.body.component) &&
                //(this.permsOptMap.has(`${key} + ${req.session.profile}`) || (value['generic'] === true)))
                (this.permsOptMap.has(`${key} + ${req.session.profile}`)));
                arr.push({name: value.name, function: value.function, params: value.params, async: value.async});
            return arr;
        }, []);
    };

    getPermission(req)
    {
        if (this.permsTxMap.has(`${req.body.tx} + ${req.session.profile}`)) return this.txMap.get(req.body.tx);
        else return false;
    }

    /**
     * Adds permissions to the user, if check is true, it adds transaction permissions, otherwise it adds option permissions
     * the key parameter is an array of objects with the tx/option and profile to which the permission will be added
     * @param {Array<{tx: string, profile: string}>} key 
     * @param {boolean} check 
     */
    async addPermission(key, check)
    {
        if (check)
        {
            for (const keys of key)
            {
                this.permsTxMap.set(`${keys.tx} + ${keys.profile}`, true);
                await runQuery([[queries.tx.addTxPerms, [keys.profile, keys.tx]]]);
            }
        }
        else
        {
            for (const keys of key)
            {
                this.permsOptMap.set(`${keys.opt} + ${keys.profile}`, true);
                await runQuery([[queries.option.addOptPerms, [keys.profile, keys.opt]]]);
            }
        }
    }

    /**
     * Removes permissions from the user, if check is true, it removes transaction permissions, otherwise it removes option permissions
     * the key parameter is an array of objects with the tx/option and profile from which the permission will be removed
     * @param {Array<{tx: string, profile: string}>} key 
     * @param {boolean} check 
     */
    async removePermission(key, check)
    {
        if (check)
        {
            for (const keys of key)
            {
                this.permsTxMap.delete(`${keys.tx} + ${keys.profile}`, true);
                await runQuery([[queries.tx.deleteTxPerms, [keys.profile, keys.tx]]]);
            }
        }
        else
        {
            for (const keys of key)
            {
                this.permsOptMap.delete(`${keys.opt} + ${keys.profile}`, true);
                await runQuery([[queries.option.deleteOptPerms, [keys.profile, keys.opt]]]);
            }
        }
    }

    /**
     * Returns an array of objects with the key and value of the map specified in the check parameter
     * 'profile' = profileMap
     * 'tx' = txMap
     * 'options' = optsMap
     * 'txPerms' = permsTxMap
     * 'optPerms' = permsOptMap
     * @param {string} check 
     * @returns 
     */
    getMaps(check)
    {
        if (check === 'profile') return Array.from(this.profileMap).map(([key, value]) => ({key, value}));
        else if (check === 'tx') return Array.from(this.txMap).map(([key, value]) => ({key, value}));
        else if (check === 'options') return Array.from(this.optsMap).map(([key, value]) => ({key, value}));
        else if (check === 'txPerms') return Array.from(this.permsTxMap).map(([key, value]) => ({key, value}));
        else if (check === 'optPerms') return Array.from(this.permsOptMap).map(([key, value]) => ({key, value}));
    }
}