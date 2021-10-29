import { AbstractRepository } from "sdz-agent-types";
import  fs, { fstatSync }  from "fs";
import unzipper from "unzipper";
import extract  from "extract-zip";

export default class OracleRepository extends AbstractRepository {
    async count(entity: string): Promise<any> {
        const total = (await this.execute(`SELECT COUNT (*) as total FROM (${this.loadFile(entity)})`))[0].TOTAL;
        return total ;
      }
    
      async execute(query: string, page?: number, limit?: number): Promise<any> {
        const statement = [
          query,
          page && limit ? `OFFSET ${page * limit} ROWS` : null,
          limit ? `FETCH NEXT ${limit} ROWS ONLY` : null,
        ]
          .filter((item) => !!item)
          .join(" ");
        await this.provideLibs();
        return this.getConnector().execute(statement);
      }

      async provideLibs ():Promise<void> {
        if (!fs.existsSync(process.env.LD_LIBRARY_PATH))
        {
          //await fs.createReadStream(`${process.cwd()}/node_modules/sdz-agent-database-oracle/instantclient-basic-linux.x64-21.3.0.0.0.zip`).pipe(unzipper.Extract({ path: `${process.env.LD_LIBRARY_PATH}/../` }));
          await extract(`${process.cwd()}/node_modules/sdz-agent-database-oracle/instantclient-basic-linux.x64-21.3.0.0.0.zip`, { dir: `${process.env.LD_LIBRARY_PATH}/../` })
          //console.log('Extraction complete')
        }
      }
}
