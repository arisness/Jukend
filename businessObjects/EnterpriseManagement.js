export class EnterpriseManagement
{
    async registEnterprise(enterpriseName, enterpriseRif, enterpriseDescription)
    {
        await runQuery([[queries.enterprise.registEnterprise, [enterpriseName, enterpriseRif, enterpriseDescription]]]);
    }

    async deleteEnterprise(enterpriseName)
    {
        for (let name of enterpriseName)
            await runQuery([[queries.enterprise.deleteEnterprise, [name]]]);
    }

    async updateEnterprise(changes)
    {
        for (let change of changes)
        {
            let value = change[0] == "name" ? 'na' : change[0] == 'rif' ? 'ri' : 'de';
            await runQuery([[queries.enterprise.updateEnterprise.replace('${column}', `enterprise_${value}`), [change[1], change[2]]]]);
        }
    }

    async getAllPerson(enterpriseName)
    {
        const result = await runQuery([[queries.enterprise.getPersonsEnterprise, [enterpriseName]]]);
        return result.rows;
    }

    async getAllEnterprises()
    {
        const result = await runQuery([[queries.enterprise.getEnterprises, []]]);
        return result.rows;
    }
}