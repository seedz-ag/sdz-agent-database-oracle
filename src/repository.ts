import { AbstractRepository } from "sdz-agent-types";

const oracleVersion11 =
  "Oracle Database 11g Release 11.2.0.4.0 - 64bit Production";

const enum VERSIONS {
  V11 = "Oracle Database 11g Release 11.2.0.4.0 - 64bit Production",
}

export default class OracleRepository extends AbstractRepository {
  private version;

  private async getVersion() {
    const [versionResult] = await this.execute(
      "SELECT * FROM v$version WHERE banner LIKE '%Oracle%';"
    );
    this.version = versionResult;
  }
  async count(query: string): Promise<any> {
    const total = (
      await this.execute(
        `SELECT COUNT (*) as total FROM (${this.buildQuery(query)})`
      )
    )[0].TOTAL;
    return total;
  }

  execute(query: string, page?: number, limit?: number): Promise<any> {
    let statement: string | null;

    this.version();

    console.log(["VERSION", this.version]);

    switch (this.version) {
      case VERSIONS.V11:
        statement = [
          this.buildQuery(query),
          page && limit
            ? `SELECT T.*, rowNum as rowIndex
          FROM (
              ${query}
          )T)T
          WHERE rowIndex > ${page * limit} AND rowIndex <= ${
                (page + 1) * limit
              };`
            : null,
          limit ? `WHERE rownum <= ${limit}` : null,
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
    return this.getConnector().execute(statement);
  }
}
