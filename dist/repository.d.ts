import { AbstractRepository } from "sdz-agent-types";
export default class OracleRepository extends AbstractRepository {
    private version;
    private total;
    private getVersion;
    count(query: string): Promise<any>;
    execute(query: string, page?: number, limit?: number): Promise<any>;
}
