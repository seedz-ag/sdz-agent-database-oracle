import { AbstractRepository } from "sdz-agent-types";

export default class OracleRepository extends AbstractRepository {
  private version: number;

  async count(query: string): Promise<any> {
    const total = (
      await this.execute(
        `SELECT COUNT (*) as total FROM (${this.buildQuery(query)})`
      )
    )[0].TOTAL;
    return total;
  }

  async execute(query: string, page?: number, limit?: number): Promise<any> {
    if (!this.version) {
      this.version = await this.getVersion();
    }
    if (+this.version > 11) {
      const statement = [
        this.buildQuery(query),
        page && limit ? `OFFSET ${page * limit} ROWS` : null,
        limit ? `FETCH NEXT ${limit} ROWS ONLY` : null,
      ]
        .filter((item) => !!item)
        .join(" ");
      return this.getConnector().execute(statement);
    }
    let tmp: any = query.split(/from/gi);
    tmp[0] = `${tmp[0]}, ROWNUM AS OFFSET `;
    tmp = tmp.join("FROM");
    const statement = [
      `SELECT * FROM (${tmp})`,
      limit ? `WHERE OFFSET  > ${Math.max(page, 0) * limit}` : null,
      limit ? `AND OFFSET <= ${Math.max(page + 1, 1) * limit}` : null,
    ]
      .filter((item) => !!item)
      .join(" ");
    return this.getConnector().execute(statement);
  }

  async getVersion() {
    if (!this.version) {
      this.version = +(await this.getConnector().getVersion()).split(".").at(0);
    }

    return this.version;
  }
}
