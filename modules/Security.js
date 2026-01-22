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

    async onLoad()
    {
        const txCheck = await runQuery([[queries.tx.txQuery, []]]);
        txCheck.rows.forEach(row => this.txMap.set(row.transaction_id, {obj: row.object_na, method: row.method_na}));

        const permsTxCheck = await runQuery([[queries.tx.permsTxQuery, []]]);
        permsTxCheck.rows.forEach(row => this.permsTxMap.set(`${row.tx_id} + ${row.profile_id}`, true));

        const optCheck = await runQuery([[queries.option.optionsQuery, []]]);
        optCheck.rows.forEach(row => this.optsMap.set(row.option_id,
            {name: row.option_na, function: row.option_fu, params: row.option_pa ? row.option_pa : "",
            async: row.option_as, generic: row.option_ge, component: row.component_na}));
    
        const permsOptCheck = await runQuery([[queries.option.permsOptQuery, []]]);
        permsOptCheck.rows.forEach(row => this.permsOptMap.set(`${row.option_id} + ${row.profile_id}`, true));

        const profileCheck = await runQuery([[queries.user.getProfilesQuery, []]]);
        profileCheck.rows.forEach(row => this.profileMap.set(row.id, row.name));
    }

    async checkUser(email)
    {
        try
        {
            const r = await runQuery([[queries.user.verifyUser, [email]]]);
            if (r.rows.length > 0) return {username: r.rows[0].username_na, email: r.rows[0].username_em};
            else return false;
        }
        catch (error)
        {
            logger.error(error);
            return false;
        }
    }

    async resetPassword(password, email)
    {
        try
        {
            const passwordCheck = await runQuery([[queries.user.verifyUser, [email]]]);
            if (password === passwordCheck.rows[0].username_pa) return "This is your current password.";
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

    filterOptions(req)
    {
        return Array.from(this.optsMap.entries()).reduce((arr, [key, value]) =>
        {
            if ((value['component'] === req.body.component) &&
                (this.permsOptMap.has(`${key} + ${req.session.profile}`) || (value['generic'] === true)))
                arr.push({name: value.name, function: value.function, params: value.params, async: value.async});
            return arr;
        }, []);
    };

    getPermission(req)
    {
        if (this.permsTxMap.has(`${req.body.tx} + ${req.session.profile}`)) return this.txMap.get(`${req.body.tx}`);
        else return false;
    }

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

    getMaps(check)
    {
        if (check === 'profile') return Array.from(this.profileMap).map(([key, value]) => ({key, value}));
        else if (check === 'tx') return Array.from(this.txMap).map(([key, value]) => ({key, value}));
        else if (check === 'options') return Array.from(this.optsMap).map(([key, value]) => ({key, value}));
        else if (check === 'txPerms') return Array.from(this.permsTxMap).map(([key, value]) => ({key, value}));
        else if (check === 'optPerms') return Array.from(this.permsOptMap).map(([key, value]) => ({key, value}));
    }
}