// import fs from "fs";
// import {
  // Connector,
//   DatabaseRow,
//   PaginationInterface,
//   RepositoryInterface,
// } from "sdz-agent-types";

type Connector = {
  execute: any
}

class Repository {
  private connector: Connector;
  constructor(connector: Connector) {
    this.setConnector(connector);
    return new Proxy(this, {
      get(target: any, propKey: string): any {
        const property = target[propKey];
        if (target[propKey]) {
          return target[propKey];
        }
        console.log(target, propKey);
        const entity = propKey.replace(/^(count|get|set)/, "");
        if (propKey.match(/^count/)) {
          return () => target.count(entity);
        }
        if (propKey.match(/^get/)) {
          return (...args: any[]) =>
            target.query.apply(target, [entity, ...args]);
        }
        if (propKey.match(/^set/)) {
          return (arg: any) => {
            target[entity] = arg;
            return target;
          };
        }
      },
      set: (object: any, key: string, value: any, proxy: any) => {
        object[key] = value;
        return true;
      },
    });
  }

  private count(entity: string): any {
    return this.execute(
      `SELECT count (*) as total from (${this.loadFile(entity)})`
    );
  }

  private execute(query: string, skip?: number, limit?: number): any {
    const statement = [
      query,
      skip ? `SKIP ${skip}` : null,
      limit ? `LIMIT ${limit}` : null,
    ]
      .filter((item) => !!item)
      .join(" ");

    return this.connector.execute(statement);
  }

  loadFile(file: string): string {
    return file;
    /*
    return fs
      .readFileSync(`${process.cwd()}/config/sql/${file}.sql`)
      .toString();
      */
  }

  private query(entity: string, skip?: number, limit?: number): any {
    return this.execute(this.loadFile(entity), skip, limit);
  }

  setConnector(connector: Connector): this {
    this.connector = connector;
    return this;
  }
}


class OracleRepository extends Repository {

  loadFile(file: string): string {
    return `ORACLE ${file}`;
  }

}

export default OracleRepository;
