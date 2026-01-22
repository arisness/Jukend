import {Pool} from 'pg';
import fs from 'fs';
const config = JSON.parse(fs.readFileSync('./config/db.json'));
const {username, password, ip, port, database} = config.database;

const pool = new Pool
({
    connectionString: `postgres://${username}:${password}@${ip}:${port}/${database}`,
    ssl: true
});

/**
 * Executes queries ordered as arrays in the form [query, params[]] using transactions.
 * @param {Array<[string, any[]]>} queries - Receives the queries as an array of arrays,
 *      passing as many queries as needed [ [ q1, p1 ], [ q2, p2 ] ].
 * @returns {object | null} - Returns an object from a select query
 *      it will be the last executed query.
 */
export const runQuery = async (queries) =>
{
    const connection = await pool.connect();

    try
    {
        await connection.query('BEGIN');
        let result;
        for (let query of queries)
        {
            if (query[0].indexOf("SELECT") !== -1) result = await connection.query(query[0], query[1]);
            else await connection.query(query[0], query[1]);
        }
        await connection.query('COMMIT');
        return result;
    }
    catch (error)
    {
        await connection.query('ROLLBACK');
        logger.error(`error: ${error}`);
        throw new Error(`Error during runQuery: ${error}".`);
    }
    finally {connection.release();}
}