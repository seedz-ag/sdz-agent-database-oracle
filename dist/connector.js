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
                this.connection = await oracledb_1.default.getConnection(this.config);
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
    setConfig(config) {
        this.config = config;
        return this;
    }
}
exports.default = Connector;
