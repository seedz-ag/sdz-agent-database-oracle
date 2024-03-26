import { ConnectorInterface, DatabaseRow } from "sdz-agent-types";

import oracledb, { Connection } from "oracledb";

export default class Connector implements ConnectorInterface {
  private connection: Connection;
  private config: any;
  private version: any;

  constructor(config: any) {
    this.setConfig(config);
  }

  async connect(): Promise<void> {
    if (!this.connection) {
      try {
        oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
        this.connection = await oracledb.getConnection({
          user: this.config.username,
          password: this.config.password,
          connectString: `${this.config.host}:${this.config.port}/${this.config.service}`,
        });
        await this.connection.execute(
          `ALTER SESSION SET CURRENT_SCHEMA = ${this.config.schema}`
        );
      } catch (e) {
        console.log(e);
      }
    }
  }

  async close(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.close();
      } catch (e) {
        console.log(e);
      }
    }
  }

  async execute(query: string): Promise<DatabaseRow[]> {
    let resultSet: DatabaseRow[] = [];
    if (!this.connection) {
      await this.connect();
    }
    try {
      const response = await this.connection.execute<DatabaseRow[]>(query);
      if (response) {
        resultSet = response.rows;
      }
    } catch (e) {
      console.log(e);
    }
    return resultSet;
  }

  async getVersion() {
    if (!this.connection) {
      await this.connect();
    }
    if (!this.version) {
      const query = "SELECT * FROM PRODUCT_COMPONENT_VERSION";
      const { rows } = await this.connection.execute<DatabaseRow[]>(query);
      this.version = rows[0]["VERSION"].split(".").shift();
    }

    return this.version;
  }

  private setConfig(config: any): this {
    this.config = config;
    return this;
  }
}
