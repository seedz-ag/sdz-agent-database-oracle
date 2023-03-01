"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sdz_agent_types_1 = require("sdz-agent-types");
const oracleVersion11 = "Oracle Database 11g Release 11.2.0.4.0 - 64bit Production";
class OracleRepository extends sdz_agent_types_1.AbstractRepository {
    async getVersion() {
        const [version] = await this.execute("SELECT * FROM v$version WHERE banner LIKE '%Oracle%';");
        this.version = version;
    }
    async count(query) {
        const total = (await this.execute(`SELECT COUNT (*) as total FROM (${this.buildQuery(query)})`))[0].TOTAL;
        return total;
    }
    async execute(query, page, limit) {
        let statement;
        if (!this.version) {
            await this.getVersion();
        }
        console.log(["VERSION", this.version]);
        switch (this.version) {
            case "Oracle Database 11g Release 11.2.0.4.0 - 64bit Production" /* VERSIONS.V11 */:
                statement = [
                    this.buildQuery(query),
                    page && limit
                        ? `SELECT T.*, rowNum as rowIndex
          FROM (
              ${query}
          )T)T
          WHERE rowIndex > ${page * limit} AND rowIndex <= ${(page + 1) * limit};`
                        : null,
                    limit ? `WHERE rownum <= ${limit}` : null,
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
