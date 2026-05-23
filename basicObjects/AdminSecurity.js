export class AdminSecurity
{
    async addPerms(key, check)
    {
        const results = await security.addPermission(key, check);
        return results;
    }

    async removePerms(key, check)
    {
        const results = await security.removePermission(key, check);
        return results;
    }

    getMaps(check)
    {
        const results = security.getMaps(check);
        return results;
    }
}