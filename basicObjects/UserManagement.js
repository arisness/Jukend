export class UserManagement
{
    async getUsers() {
        const result = await runQuery([[queries.user.getAllUsers, []]]);
        return result.rows;
    }

    async addUser(user, password, profile, ci, email) {await runQuery([[queries.user.registUser, [user, password, profile, ci, email]]]);}
 
    async updatePassword(password, email) {runQuery([[queries.user.updatePassword, [password, email]]]);}

    async deleteUser(username) {await runQuery([[queries.user.deleteUser, [username]]]);}

    async getUser(username){
        const results = await runQuery([[queries.user.getUser, [username]]]);
        return results.rows;
    }
    async updateValues(username, email, oldUsername) {await runQuery([[queries.user.updateValue, [username, email, oldUsername]]]);}
}