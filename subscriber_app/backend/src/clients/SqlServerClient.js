class SqlServerClient {
  constructor(sqlConfig) {
    this.sql = require("mssql");    
    this.sqlConfig = sqlConfig;
    this.simulatedDataDict = require('../../data/emulated_sql_data.js')(5, 40, 5)
  }

  // Some getters and setters
  getSqlConfig = () => this.sqlConfig

  updateSqlConfig = async (sqlConfig) => {
    this.sqlConfig = sqlConfig

    try {
      await this.sql.close()
    } catch {
      console.log(`[SQL CLIENT] Error during closing of the connection.`)
    }
    await this.sql.connect(sqlConfig)
  }

  async connect(config) {
    try {
      await this.sql.connect(config);
      console.log("Connected to SQL Server");
    } catch (err) {
      console.error("SQL Server connection error:", err);
    }
  }

  _find_simulated_data = (query) => {
    // Check if the query is in the simulated data dictionary
    for (const k of Object.keys(this.simulatedDataDict)) {
      if (query.toLowerCase().replace('[','').replace(']','').replace('.','').includes(k)) {
        return this.simulatedDataDict[k]
      }
    }
    return [];
  }

  query = async (query, queryParams, verbose = 1) => {
    try {
        // print if verbose level allows
        verbose >= 2 && console.log(`QUERY: ${query}`)

        // Connect or use connection from the pool
        if (this.sqlConfig.emulate) {
          console.log("[SQL CLIENT] Emulating query execution.");
          return this._find_simulated_data(query);
        }
        
        // Connect to the SQL Server database using the provided configuration
        await this.sql.connect(this.sqlConfig);
        let request = new this.sql.Request()

        // query to the database and get the data
        for (const param of queryParams) {
            request = request.input(param['name'], eval(param['type']), param['value'])
        }

        let recordset = await request.query(query)

        // print if verbose level allows
        verbose >= 3 && console.log(recordset)

        return recordset.recordset

    } catch(err) {
        console.log(`[SQL CLIENT] Error during query execution.`)
        throw err
    }
  }

    // getLastEvent = async () => {
    //     this.query('')
    // }

  close = async () => {
    try {
      await this.sql.close();
      console.log("SQL Server connection closed");
    } catch (err) {
      console.error("Error closing SQL Server connection:", err);
    }
  }
}

module.exports = {SqlServerClient}