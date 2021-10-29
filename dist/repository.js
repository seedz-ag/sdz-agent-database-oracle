"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sdz_agent_types_1 = require("sdz-agent-types");
class OracleRepository extends sdz_agent_types_1.AbstractRepository {
    async count(entity) {
        const total = (await this.execute(`SELECT COUNT (*) as total FROM (${this.loadFile(entity)})`))[0].TOTAL;
        return total;
    }
    execute(query, page, limit) {
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
exports.default = OracleRepository;
