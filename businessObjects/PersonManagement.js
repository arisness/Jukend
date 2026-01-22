export class PersonManagement
{
    async registPerson(name, lastName, ci, enterpriseName)
    {
        const personCheck = await runQuery([[queries.person.getPerson, [ci]]]);
        if (personCheck) await runQuery([[queries.enterprise.regisPersonEnterprise, [ci, enterpriseName]]]);
        else await runQuery([[queries.person.regisPerson, [name, lastName, ci]], [queries.enterprise.regisPersonEnterprise, [ci, enterpriseName]]]);
    }

    async updatePerson(changes)
    {
        for (let change of changes)
        {
            let value = change[0] == "name" ? 'na' : change[0] == 'lastName' ? 'la_na' : 'ci';
            await runQuery([[queries.person.updatePerson.replace('${column}', `person_${value}`), [change[1], change[2]]]]);
        }
    }

    async deletePerson(ci, enterprise) {await runQuery([[queries.enterprise.deletePersonEnterprise, [ci, enterprise]]]);}
}