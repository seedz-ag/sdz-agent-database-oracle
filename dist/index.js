"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connector_1 = __importDefault(require("./connector"));
const repository_1 = __importDefault(require("./repository"));
exports.default = { Connector: connector_1.default, Repository: repository_1.default };
