"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sdz_agent_types_1 = require("sdz-agent-types");
const oracleVersion11 = "Oracle Database 11g Release 11.2.0.4.0 - 64bit Production";
class OracleRepository extends sdz_agent_types_1.AbstractRepository {
    constructor() {
        super(...arguments);
        this.version = "Oracle Database 11g Release 11.2.0.4.0 - 64bit Production";
    }
    // private async getVersion() {
    //   if (!this.version) {
    //     const [{ BANNER }] = await this.getConnector().execute(
    //       "SELECT * FROM v$version WHERE banner LIKE '%Oracle%'"
    //     );
    //     this.version = BANNER;
    //   }
    //   console.log({ versionDentro: this.version });
    //   return this.version;
    // }
    async count(query) {
        const total = (await this.execute(`SELECT COUNT (*) as total FROM (${this.buildQuery(query)})`))[0].TOTAL;
        return total;
    }
    async execute(query, page, limit) {
        console.log({ query, page, limit });
        let statement;
        console.log({ versionFora: this.version });
        switch (this.version) {
            case "Oracle Database 11g Release 11.2.0.4.0 - 64bit Production" /* VERSIONS.V11 */:
                statement = [
                    this.buildQuery(`SELECT T.*, rowNum as rowIndex
          FROM (
              SELECT *
              FROM DOLPHIN_INTEGRA.FATURAMENTO
          )T)T;`),
                    page && limit ? `WHERE rowIndex > 1000 AND rowIndex <= 2000` : null,
                    limit ? `WHERE rowIndex <= 1000` : null,
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
