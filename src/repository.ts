import { AbstractRepository } from "sdz-agent-types";

export default class OracleRepository extends AbstractRepository {
    count(entity: string): any {
        return this.execute(
          `SELECT COUNT (*) as total FROM (${this.loadFile(entity)})`
        )[0];
      }
    
      execute(query: string, page?: number, limit?: number): any {
        const statement = [
          query,
          page && limit ? `OFFSET ${page * limit} ROWS` : null,
          limit ? `FETCH NEXT ${limit} ROWS ONLY` : null,
        ]
          .filter((item) => !!item)
          .join(" ");
    
        return this.getConnector().execute(statement);
      }

      
}
