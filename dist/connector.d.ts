import { ConnectorInterface, DatabaseRow } from "sdz-agent-types";
export default class Connector implements ConnectorInterface {
  private connection;
  private config;
  constructor(config: any);
  connect(): Promise<void>;
  close(): Promise<void>;
  execute(query: string): Promise<DatabaseRow[]>;
  private setConfig;
}
