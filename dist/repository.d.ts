import { AbstractRepository } from "sdz-agent-types";
export default class OracleRepository extends AbstractRepository {
    count(query: string): Promise<any>;
    execute(query: string, page?: number, limit?: number): Promise<any>;
}
