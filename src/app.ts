import "reflect-metadata";
import { LoggingUtils } from "./utilities";
import Logger from "bunyan";
import { Application } from "express";
import { Server } from "./server/server";
import { Database } from "./database/database";
import { iocContainer } from "./ioc";
import { TYPES } from "./api";
import { WorkHistoryController } from "./controllers/work-history-controller";

iocContainer.makeGlobal();

let log: Logger = LoggingUtils.createLogger({
  name: "todd-rentfrow-website",
  streams: [
    {
      stream: process.stdout,
    },
  ],
});

iocContainer.registerInstance(Logger, log);

const defaultPort = 3005;
const defaultDBPort = 5432;

const DEFAULT_PORT = process.env.DEFAULT_PORT ?? defaultPort;
const ENABLE_TEST = process.env.ENABLE_TEST ?? true;
const DB_PORT = 22671; // process.env.DB_PORT ?? defaultDBPort; // 22671
const DB_HOST = "pg-332faedc-todd-0d85.d.aivencloud.com"; //process.env.DB_HOST ?? "127.0.0.1"; // pg-332faedc-todd-0d85.d.aivencloud.com
const DB_USER = "avnadmin"; //process.env.DB_USER ?? "halo_admin"; // avnadmin
const DB_PASSWORD = process.env.DB_PASSWORD ?? "halo_admin_password";
const DB_DATABASE = process.env.DB_DATABASE ?? "my-website"; // defaultdb

// let db: Database = iocContainer.get(TYPES.Database);
let db: Database = new Database();;
iocContainer.registerInstance(Database, db);
const config = {
  dialect: "postgres",
  user: "avnadmin",
  username: "avnadmin",
  password: process.env.DB_PASSWORD,
  host: "pg-332faedc-todd-0d85.d.aivencloud.com",
  port: 22671,
  database: "defaultdb",
  ssl: true,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: true,
      ca: process.env.MY_CERT,
    },
  },
};

db.init(config);

// db.init({
//   dialect: "postgres",
//   port: Number(DB_PORT),
//   host: DB_HOST,
//   username: DB_USER,
//   password: DB_PASSWORD,
//   ssl: true,
//   database: DB_DATABASE,
//   dialectOptions: {
//     ssl: {
//       require: true,
//       rejectUnauthorized: false, // <-- Add this line
//     },
//   },
// });

const dbErrorWait = 2000;
const initWaitTime = 3600000;
const WAIT_MAX_MS = process.env.MAX_DB_WAIT_TIME
  ? Number(process.env.MAX_DB_WAIT_TIME)
  : initWaitTime;
const MAX_TRIES = 1440;
const WAIT_MS = Math.trunc(WAIT_MAX_MS / MAX_TRIES);

function handleDbError(e: unknown): void {
  log.error(e);
  // Try to reset the connection
  let count = 0;
  // Setup an interval to try and reconnect
  const interval = setInterval(async function () {
    try {
      const success = await db.attemptConnection(count, handleDbError);
      count += 1;
      if (success) {
        console.log("Reconnected to database...", success);
        // Remove the interval
        clearInterval(interval);
      }
    } catch (error) {
      console.log("Error attempting connection...", error);
    }
  }, dbErrorWait);
}

db.waitConnection(WAIT_MS, MAX_TRIES, handleDbError).then(
  async (didConnect: boolean) => {
    if (didConnect === true) {
      let success = await db.createDb();
      success = await db.connect();
      if (success) {
      } else {
        log.error("database connection failed");
        await db.close();
        throw new Error("database connection failed");
      }
    } else {
      log.error("database connection failed");
      await db.close();
      throw new Error("database connection failed");
    }
  }
);

const server = new Server();
const lapp = server.init().then((res) => {
  console.log("Server started");
});
