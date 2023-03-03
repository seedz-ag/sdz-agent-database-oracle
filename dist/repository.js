"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sdz_agent_types_1 = require("sdz-agent-types");
const oracleVersion11 = "Oracle Database 11g Release 11.2.0.4.0 - 64bit Production";
class OracleRepository extends sdz_agent_types_1.AbstractRepository {
    constructor() {
        super(...arguments);
        this.version = oracleVersion11;
    }
    async getVersion() {
        if (!this.version) {
            const [{ BANNER }] = await this.getConnector().execute("SELECT * FROM v$version WHERE banner LIKE '%Oracle%'");
            this.version = BANNER;
        }
        return this.version;
    }
    async count(query) {
        const total = (await this.execute(`SELECT COUNT (*) as total FROM (${this.buildQuery(query)})`))[0].TOTAL;
        this.total = total;
        return total;
    }
    async execute(query, page, limit) {
        let statement;
        switch (await this.getVersion()) {
            case "Oracle Database 11g Release 11.2.0.4.0 - 64bit Production" /* VERSIONS.V11 */:
                statement = [
                    `SELECT T.* FROM ( 
            SELECT T.*, rowNum as rowIndex
            FROM (`,
                    this.buildQuery(query),
                    `)T)T`,
                    page && page !== 0 && limit
                        ? `WHERE rowIndex > ${page * limit || limit} AND ${(page + 1) * limit || this.total}`
                        : null,
                    limit && !page ? `WHERE rowIndex <= ${limit}` : null,
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
exports.default = OracleRepository;
