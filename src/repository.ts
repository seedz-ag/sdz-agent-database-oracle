import { AbstractRepository } from "sdz-agent-types";

const oracleVersion11 =
  "Oracle Database 11g Release 11.2.0.4.0 - 64bit Production";

const enum VERSIONS {
  V11 = "Oracle Database 11g Release 11.2.0.4.0 - 64bit Production",
}

export default class OracleRepository extends AbstractRepository {
  private version = oracleVersion11;
  private total;

  private async getVersion() {
    if (!this.version) {
      const [{ BANNER }] = await this.getConnector().execute(
        "SELECT * FROM v$version WHERE banner LIKE '%Oracle%'"
      );
      this.version = BANNER;
    }
    return this.version;
  }

  async count(query: string): Promise<any> {
    const total = (
      await this.execute(
        `SELECT COUNT (*) as total FROM (${this.buildQuery(query)})`
      )
    )[0].TOTAL;
    this.total = total;
    return total;
  }

  async execute(query: string, page?: number, limit?: number): Promise<any> {
    let statement: string | null;

    switch (await this.getVersion()) {
      case VERSIONS.V11:
        statement = [
          `SELECT T.* FROM ( 
            SELECT T.*, rowNum as rowIndex
            FROM (`,
          this.buildQuery(query),
          `)T)T`,
          page && limit
            ? `WHERE rowIndex > ${page * limit || limit} AND rowIndex <= ${
                (page + 1) * limit || this.total
              }`
            : null,
          limit && !page ? `WHERE rowIndex <= ${limit}` : null,
        ]
          .filter((item) => !!item)
          .join(" ");
        break;

      default:
        statement = [
          this.buildQuery(query),
          page && limit ? `OFFSET ${page * limit} ROWS` : null,
          limit ? `FETCH NEXT ${limit} ROWS ONLY` : null,
        ]
          .filter((item) => !!item)
          .join(" ");
        break;
    }
    const resultSet = await this.getConnector().execute(statement);
    return resultSet;
  }
}
