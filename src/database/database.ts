import { DestroyOptions, Options, Sequelize } from "sequelize";
import { registerEntities } from "sequelizejs-decorators";
import {
  WorkHistory,
  WorkHistoryModel,
} from "./entities";
import { Client } from "pg";
import { NodeErrorCallback } from "./node-error-callback";

const DEFAULT_DB = "defaultdb";
const DEFAULT_PORT = 22671;
const DEFAULT_HOST = "pg-332faedc-todd-0d85.d.aivencloud.com";

interface ExtendedOptions extends Options {
  user: string;
  defaultDatabase: string;
}
const config: ExtendedOptions = {
  dialect: "postgres",
  user: "avnadmin",
  username: "avnadmin",
  password: process.env.DB_PASSWORD,
  host: "pg-332faedc-todd-0d85.d.aivencloud.com",
  port: 22671,
  database: "todds-stuff",
  defaultDatabase: "defaultdb",
  ssl: true,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: true,
      ca: process.env.MY_CERT,
    },
  },
};

// TODO: IMPORTANT MAKE ALL THE CONFIGS THE SAME FOR TEH DB. THERE IS A CONFIG IN APP.TS AND ONE HERE IN THIS FILE
export class Database {
  private _db: Sequelize;
  private _models: {
    WorkHistory: WorkHistoryModel;
  };
  private _config: ExtendedOptions;

  public constructor() {
  }

  public init() {
    this._config = config;
    this._config.logging = false; // TODO: set this based on dev/prod
    this._db = new Sequelize(config);
  }

  public get workHistories(): WorkHistoryModel {
    this.checkIfTableNull(this._models.WorkHistory);
    return this._models.WorkHistory;
  }

  public async connect(): Promise<boolean> {
    try {
      await this._db.authenticate();
      this._models = registerEntities(this._db, [WorkHistory]) as any;
      await this._db.sync();
      return true;
    } catch (ex) {
      // do nothing
      console.log(ex);
    }

    return false;
  }

  public async close(): Promise<void> {
    await this._db.close();
  }

  public async truncate(options: DestroyOptions): Promise<void> {
    await this._db.truncate(options);
  }

  private checkIfTableNull(table: unknown): void {
    if (table == null) {
      throw new Error("database not initialized");
    }
  }

  /**
   * the default db is required so that an initial connection can be made
   * @param defaultDb default database for this postgres instance
   */
  public async createDb(defaultDb?: string): Promise<boolean> {
    const client = this.getConfig(true);
    let retVal = false;
    try {
      await client.connect();
      const query = `CREATE DATABASE "${this._config.database}";`;
      await client.query(query);
      retVal = true;
      await client.end();
    } catch (ex) {
      await client.end();
      // we will assume we errored because the database already exists
      return false;
    }

    return retVal;
  }

  public async dropDb(defaultDb?: string): Promise<void> {
    const client = this.getConfig(true);
    try {
      await client.connect();

      const query = `DROP DATABASE IF EXISTS "${this._config.database}";`;
      await client.query(query);
      await client.end();
    } catch (ex) {
      await client.end();
      throw ex;
    }
  }

  /**
   * Test the connection n times. This is for when docker container for db is not ready yet
   * @param waitInMs Time to wait between attempts
   * @param maxTries Maximum number of attempts
   */
  public async waitConnection(
    waitInMs: number,
    maxTries: number,
    errorCallback: NodeErrorCallback | null = null
  ): Promise<boolean> {
    for (let i = 0; i < maxTries; i++) {
      const success = await this.attemptConnection(i, errorCallback);
      if (success) {
        return true;
      } else {
        await new Promise((resolve) => setTimeout(resolve, waitInMs));
      }
    }
    return false;
  }

  /**
   * Make a connection attempt
   * @param waitInMs Time to wait between attempts
   * @param maxTries Maximum number of attempts
   */
  public async attemptConnection(
    attempt: number,
    errorCallback: NodeErrorCallback | null = null
  ): Promise<boolean> {
    const client = this.getConfig(true);
    try {
      await client.connect();
      if (errorCallback !== null) {
        client.on("error", async (e) => {
          await client.end();
          errorCallback(e);
        });
      }
      return true;
    } catch (ex) {
      console.log(`Failed to connect to database on attempt ${attempt + 1}`, ex);
      client.end();
    }
    return false;
  }
  
  private getConfig(useDefault?: boolean): Client {
    const lconfig = {
        user: "avnadmin",
        password: process.env.DB_PASSWORD,
        host: "pg-332faedc-todd-0d85.d.aivencloud.com",
        port: 22671,
        database: useDefault ? config.defaultDatabase : config.database, // "defaultdb",
        ssl: {
            rejectUnauthorized: false,
            ca: process.env.MY_CERT,
        },
    };
    return new Client(lconfig);
    // return new Client({
    //     user: this._config.username,
    //     password: this._config.password,
    //     port: this._config.port ?? DEFAULT_PORT,
    //     host: this._config.host ?? DEFAULT_HOST,
    //     database: defaultDb ?? DEFAULT_DB,
    //   });
    }

}
