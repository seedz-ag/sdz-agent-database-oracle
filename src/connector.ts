import {
  ConnectorInterface,
  ConfigDatabaseInterface,
  DatabaseRow,
} from "sdz-agent-types";

import oracledb, { Connection } from "oracledb";

export default class Connector implements ConnectorInterface {
  private connection: Connection;
  private config: any;
  constructor(config: any) {
    this.setConfig(config);
  }
  async connect() {
    if (!this.connection) {
      try {
        this.connection = await oracledb.getConnection(this.config);
      } catch (e) {
        console.log(e);
      }
    }
  }

  async close() {
    if (this.connection) {
      try {
        await this.connection.close();
      } catch (e) {
        console.log(e);
      }
    }
  }

  async execute(query: string): Promise<DatabaseRow[]> {
    let resultSet = [];
    if (!this.connection) {
      await this.connect();
    }
    try {
      const response = await this.connection.execute(query);
      if (response) {
        resultSet = response.rows;
      }
    } catch (e) {
      console.log(e);
    }
    return resultSet;
  }

  private setConfig(config: any): this {
    this.config = config;
    return this;
  }
}
