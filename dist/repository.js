"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sdz_agent_types_1 = require("sdz-agent-types");
const fs_1 = __importDefault(require("fs"));
const unzipper_1 = __importDefault(require("unzipper"));
class OracleRepository extends sdz_agent_types_1.AbstractRepository {
    async count(entity) {
        const total = (await this.execute(`SELECT COUNT (*) as total FROM (${this.loadFile(entity)})`))[0].TOTAL;
        return total;
    }
    async execute(query, page, limit) {
        const statement = [
            query,
            page && limit ? `OFFSET ${page * limit} ROWS` : null,
            limit ? `FETCH NEXT ${limit} ROWS ONLY` : null,
        ]
            .filter((item) => !!item)
            .join(" ");
        this.provideLibs();
        return this.getConnector().execute(statement);
    }
    provideLibs() {
        if (!fs_1.default.existsSync(process.env.LD_LIBRARY_PATH)) {
            fs_1.default.createReadStream(`${process.cwd()}/../instantclient-basic-linux.x64-21.3.0.0.0`).pipe(unzipper_1.default.Extract({ path: process.env.LD_LIBRARY_PATH }));
        }
    }
}
exports.default = OracleRepository;
