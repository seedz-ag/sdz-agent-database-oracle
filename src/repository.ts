import { AbstractRepository } from "sdz-agent-types";

const oracleVersion11 =
  "Oracle Database 11g Release 11.2.0.4.0 - 64bit Production";

const enum VERSIONS {
  V11 = "Oracle Database 11g Release 11.2.0.4.0 - 64bit Production",
}

export default class OracleRepository extends AbstractRepository {
  private version;

  private async getVersion() {
    try {
      const [version] = await this.execute(
        "SELECT * FROM v$version WHERE banner LIKE '%Oracle%'"
      );

      console.log({ version });

      this.version = version;
    } catch (error) {
      console.log({ error });
      return error;
    }
  }

  async count(query: string): Promise<any> {
    const total = (
      await this.execute(
        `SELECT COUNT (*) as total FROM (${this.buildQuery(query)})`
      )
    )[0].TOTAL;
    return total;
  }

  async execute(query: string, page?: number, limit?: number): Promise<any> {
    console.log(["QUERY", query, "PAGE", page, "LIMIT", limit]);

    let statement: string | null;

    if (!this.version) {
      await this.getVersion();
    }

    console.log(["VERSION", this.version]);

    switch (this.version) {
      case VERSIONS.V11:
        statement = [
          this.buildQuery(`SELECT T.*, rowNum as rowIndex
            FROM (
                ${query}
            )T)T)`),
          page && limit
            ? `WHERE rowIndex > ${limit * page} AND rowIndex <= ${
                limit * (page + 1)
              }`
            : null,
          limit ? `WHERE rowIndex <= ${limit}` : null,
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
