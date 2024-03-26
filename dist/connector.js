"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const oracledb_1 = __importDefault(require("oracledb"));
class Connector {
    constructor(config) {
        this.setConfig(config);
    }
    async connect() {
        if (!this.connection) {
            try {
                oracledb_1.default.outFormat = oracledb_1.default.OUT_FORMAT_OBJECT;
                this.connection = await oracledb_1.default.getConnection({
                    user: this.config.username,
                    password: this.config.password,
                    connectString: `${this.config.host}:${this.config.port}/${this.config.service}`,
                });
                await this.connection.execute(`ALTER SESSION SET CURRENT_SCHEMA = ${this.config.schema}`);
            }
            catch (e) {
                console.log(e);
            }
        }
    }
    async close() {
        if (this.connection) {
            try {
                await this.connection.close();
            }
            catch (e) {
                console.log(e);
            }
        }
    }
    async execute(query) {
        let resultSet = [];
        if (!this.connection) {
            await this.connect();
        }
        try {
            const response = await this.connection.execute(query);
            if (response) {
                resultSet = response.rows;
            }
        }
        catch (e) {
            console.log(e);
        }
        return resultSet;
    }
    async getVersion() {
        if (!this.connection) {
            await this.connect();
        }
        const query = "SELECT * FROM PRODUCT_COMPONENT_VERSION";
        const [{ VERSION }] = await this.connection.execute(query);
        return VERSION;
    }
    setConfig(config) {
        this.config = config;
        return this;
    }
}
exports.default = Connector;
