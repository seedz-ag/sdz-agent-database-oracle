import { AbstractRepository } from "sdz-agent-types";
export default class OracleRepository extends AbstractRepository {
    count(entity: string): any;
    execute(query: string, page?: number, limit?: number): any;
}
