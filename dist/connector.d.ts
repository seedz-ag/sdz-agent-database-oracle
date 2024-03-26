import { ConnectorInterface, DatabaseRow } from "sdz-agent-types";
export default class Connector implements ConnectorInterface {
    private connection;
    private config;
    private version;
    constructor(config: any);
    connect(): Promise<void>;
    close(): Promise<void>;
    execute(query: string): Promise<DatabaseRow[]>;
    getVersion(): Promise<any>;
    private setConfig;
}
