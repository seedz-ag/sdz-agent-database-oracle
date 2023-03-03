import { AbstractRepository } from "sdz-agent-types";

const oracleVersion11 =
  "Oracle Database 11g Release 11.2.0.4.0 - 64bit Production";

const enum VERSIONS {
  V11 = "Oracle Database 11g Release 11.2.0.4.0 - 64bit Production",
}

export default class OracleRepository extends AbstractRepository {
  private version = "Oracle Database 11g Release 11.2.0.4.0 - 64bit Production";

  // private async getVersion() {
  //   if (!this.version) {
  //     const [{ BANNER }] = await this.getConnector().execute(
  //       "SELECT * FROM v$version WHERE banner LIKE '%Oracle%'"
  //     );
  //     this.version = BANNER;
  //   }
  //   console.log({ versionDentro: this.version });
  //   return this.version;
  // }

  async count(query: string): Promise<any> {
    const total = (
      await this.execute(
        `SELECT COUNT (*) as total FROM (${this.buildQuery(query)})`
      )
    )[0].TOTAL;
    return total;
  }

  async execute(query: string, page?: number, limit?: number): Promise<any> {
    console.log({ query, page, limit });

    let statement: string | null;

    console.log({ versionFora: this.version });

    switch (this.version) {
      case VERSIONS.V11:
        statement = [
          this.buildQuery(`SELECT T.*, rowNum as rowIndex
          FROM (
              SELECT *
              FROM DOLPHIN_INTEGRA.FATURAMENTO
          )T)T;`),
          page && limit ? `WHERE rowIndex > 1000 AND rowIndex <= 2000` : null,
          limit ? `WHERE rowIndex <= 1000` : null,
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
