const config = {
  user: 'cloudadmin', // SQL Server username
  password: 'password@123', // SQL Server password
  server: 'sqlsrvr-12043-p-002.database.windows.net', // SQL Server hostname or IP address
  database: 'sqldb-12043-p-001', // Name of the database to connect to
  options: {
      encrypt: true, // Use encryption (required for Azure SQL Database)
      enableArithAbort: true // Enable or disable arithabort
  }
};

const configTPUT = {
  user: 'cloudadmin', // SQL Server username
  password: 'password@123', // SQL Server password
  server: 'sqlsrvr-12043-p-002.database.windows.net', // SQL Server hostname or IP address
  database: 'sqldb-12043-p-001', // Name of the database to connect to
  options: {
      encrypt: true, // Use encryption (required for Azure SQL Database)
      enableArithAbort: true // Enable or disable arithabort
  }
};

const configDB2 = {
  database: 'MIM2470',
  hostname: 'srvr1376.dbms.chrysler.com',
  port: 13760,
  protocol: 'TCPIP',
  uid: 'dbtputid', // DB2 username
  pwd: 'TPTuser01' // DB2 password
};

module.exports = { config, configTPUT, configDB2 };
