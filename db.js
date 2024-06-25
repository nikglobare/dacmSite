const sql = require('mssql');
const ibmdb = require('ibm_db');
const { config, configTPUT, configDB2 } = require('./config');

let pools = {};

async function connectToDatabase(dbConfig) {
    const configKey = `${dbConfig.server || dbConfig.hostname}-${dbConfig.database || ''}`;
    try {
        if (!pools[configKey]) {
            if (dbConfig.server) {
                // SQL Server connection
                pools[configKey] = new sql.ConnectionPool(dbConfig);
                pools[configKey] = await pools[configKey].connect();
                console.log(`Database connected successfully to ${dbConfig.server}/${dbConfig.database}`);
            } else if (dbConfig.hostname) {
                // DB2 connection
                const connStr = `DATABASE=${dbConfig.database};HOSTNAME=${dbConfig.hostname};PORT=${dbConfig.port};PROTOCOL=${dbConfig.protocol};UID=${dbConfig.uid};PWD=${dbConfig.pwd};`;
                pools[configKey] = await new Promise((resolve, reject) => {
                    ibmdb.open(connStr, (err, conn) => {
                        if (err) reject(err);
                        else resolve(conn);
                    });
                });
                console.log(`Database connected successfully to ${dbConfig.hostname}/${dbConfig.database}`);
            }
        }
        return pools[configKey];
    } catch (err) {
        console.error(`Database connection failed to ${dbConfig.server || dbConfig.hostname}:`, err);
        throw err;
    }
}

async function queryDatabase(query, dbConfig) {
    try {
        const pool = await connectToDatabase(dbConfig);
        let result;
        if (dbConfig.server) {
            result = await pool.request().query(query);
        } else if (dbConfig.hostname) {
            result = await new Promise((resolve, reject) => {
                pool.query(query, (err, data) => {
                    if (err) reject(err);
                    else resolve(data);
                });
            });
        }
        return result;
    } catch (err) {
        console.error('Error querying the database:', err);
        throw err;
    }
}

module.exports = {
    connectToDatabase,
    queryDatabase
};
