import { AbstractRepository } from "sdz-agent-types";

export default class OracleRepository extends AbstractRepository {
    async count(query: string): Promise<any> {
        const total = (await this.execute(`SELECT COUNT (*) as total FROM (${this.buildQuery(query)})`))[0].TOTAL;
        return total ;
      }

    execute(query: string, page?: number, limit?: number): Promise<any> {
        const statement = [
          this.buildQuery(query),
          page && limit ? `OFFSET ${page * limit} ROWS` : null,
          limit ? `FETCH NEXT ${limit} ROWS ONLY` : null,
        ]
          .filter((item) => !!item)
          .join(" ");
        return this.getConnector().execute(statement);
      }
}
