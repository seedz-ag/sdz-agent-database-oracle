"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sdz_agent_types_1 = require("sdz-agent-types");
class OracleRepository extends sdz_agent_types_1.AbstractRepository {
    async count(query) {
        const total = (await this.execute(`SELECT COUNT (*) as total FROM (${this.buildQuery(query)})`))[0].TOTAL;
        return total;
    }
    async execute(query, page, limit) {
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
        let tmp = query.split(/from/gi);
        tmp.splice(1, 0, ", ROWNUM AS OFFSET ");
        tmp = tmp.join("FROM");
        const statement = [
            `SELECT * FROM (${tmp})`,
            limit ? `WHERE OFFSET <= ${limit}` : null,
            page && limit ? `AND OFFSET  > ${page * limit}` : null,
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
exports.default = OracleRepository;
