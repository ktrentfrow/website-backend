import Logger from "bunyan";
import compression from "compression";
import helmet from "helmet";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import path from "path";

import { iocContainer } from "../ioc";
import { TYPES } from "../api";
import express, {
  json,
  Router,
  Response as ExResponse,
  Request as ExRequest,
  urlencoded,
  Application,
} from "express";

import { RegisterRoutes } from "../tsoa/routes";
import { LoggingUtils } from "../utilities";

const API_BASE_PATH = "/api";
const PUBLIC_DIRECTORY = "www";

export class Server {
  //   private _db: Database;

  private _log: Logger;

  public constructor(
    // log: Logger
    // db: Database,
  ) {
    // this._db = db;
    // this._log = log.child({ class: Server.name });
    this._log = LoggingUtils.createLogger({
        name: Server.name,
        streams: [
          {
            stream: process.stdout,
          },
        ],
      });
        }

  /**
   *
   * @returns All work histories in the DB
   */
  public async init(): Promise<Application> {
    try {

      // iocContainer.load().to(log);

      const app = express();

      iocContainer.registerInstance(express, app);
      iocContainer.registerTransient(express.Router as any);

      app.use(compression());
      app.use(helmet());

      // app.use(headersToLower);

      app.use(cors());

      // app.use(toLower);

      app.use(json({ type: "*/json", limit: "4Mb" }));

      app.get("/health", (req, res) => {
        res.json("Vortex GCS Service is up and running");
      });

      // Use body parser to read sent json payloads
      app.use(
        urlencoded({
          extended: true,
        })
      );
      app.use(json());

      RegisterRoutes(app);
      const swag = swaggerUi.generateHTML(await import("../tsoa/swagger.json"));
      app.use(
        "/api/swagger",
        swaggerUi.serve,
        async (_req: ExRequest, res: ExResponse) => {
          return res.send(swag);
        }
      );
      // register api here
      const apiRouter = Router();

      app.use(API_BASE_PATH, apiRouter);

      app.use(express.static(path.join(__dirname, PUBLIC_DIRECTORY)));

      const port = process.env.PORT || 3030;

      app.listen(port, () => {
        this._log.info(`server listening on port ${port}`);
      });
      return app;
    } catch (ex) {
      this._log.error(ex);
      throw ex;
    }
  }

  //   /**
  //    *
  //    * @returns All assets in the DB
  //    */
  //   public async getAssets(): Promise<IAsset[]> {
  //     try {
  //       const assets = await this._db.assets.findAll();
  //       return assets.map((s) => s.get({ plain: true }));
  //     } catch (ex) {
  //       this._log.error(ex);
  //       throw ex;
  //     }
  //   }

  //   /**
  //    *
  //    * @param id The unique id of the asset to get
  //    * @returns The status.
  //    */
  //   public async getAssetById(id: string, plain = true): Promise<IAsset> {
  //     try {
  //       const asset = await this._db.assets.findOne({
  //         where: {
  //           id: id,
  //         },
  //       });
  //       return asset != null
  //         ? plain === true
  //           ? asset.get({ plain: true })
  //           : asset
  //         : null;
  //     } catch (ex) {
  //       this._log.error(ex);
  //       throw ex;
  //     }
  //   }

  //   /**
  //    *
  //    * @param id The unique id of the asset to update
  //    * @param asset The asset data with which to update the record.
  //    * @returns The number of rows affected by the update.
  //    */
  //   public async updateAsset(id: string, asset: IAsset): Promise<number> {
  //     try {
  //       const updated = await this._db.assets.update(asset, { where: { id } });
  //       const retVal = await this.getAssetById(id);

  //       // Send message to all clients
  //       void this._c2Proxy.publishToHaloC2Topic<IAsset>(HaloC2Events.ASSET_UPDATED_NOTIFICATION, retVal);
  //       return updated[UPDATE_AFFECTED_ROWS_INDEX];
  //     } catch (ex) {
  //       this._log.error(ex);
  //       throw ex;
  //     }
  //   }

  //   /**
  //    *
  //    * @param asset The asset data with which the new record should be initialized.
  //    * @returns The newly created asset with its new id.
  //    */
  //   public async addAsset(asset: IAsset): Promise<IAsset> {
  //     try {
  //       const created = await this._db.assets.create(asset);
  //       // Send message to all clients
  //       void this._c2Proxy.publishToHaloC2Topic<IAsset>(HaloC2Events.ASSET_CREATED_NOTIFICATION, created);
  //       return created != null ? created.get({ plain: true }) : null;
  //     } catch (ex) {
  //       this._log.error(ex);
  //       throw ex;
  //     }
  //   }

  //   /**
  //    *
  //    * @param id The unique id of the asset to update
  //    * @returns The status.
  //    */
  //   public async deleteAssetById(id: string): Promise<boolean> {
  //     try {
  //       const asset: Asset = (await this.getAssetById(id, false)) as Asset;
  //       if (asset != null) {
  //         await asset.destroy();
  //         // Send message to all clients
  //         void this._c2Proxy.publishToHaloC2Topic<string>(HaloC2Events.ASSET_DELETED_NOTIFICATION, id);
  //         return true;
  //       }
  //       return false;
  //     } catch (ex) {
  //       this._log.error(ex);
  //       throw ex;
  //     }
  //   }
}
