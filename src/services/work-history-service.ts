import Logger from "bunyan";

import { autoinject } from "aurelia-dependency-injection";
import { IWorkHistory } from "../api";
import { LoggingUtils } from "..//utilities";
import { Database } from "..//database/database";
import { WorkHistory } from "@/database/entities";

export const UPDATE_AFFECTED_ROWS_INDEX = 0;

@autoinject()
export class WorkHistoryService {
  private _db: Database;

  private _log: Logger;

  public constructor(log: Logger, db: Database) {
    this._db = db;
    this._log = log.child({ class: WorkHistoryService.name });
  }

  /**
   *
   * @returns All work histories in the DB
   */
  public async getWorkHistories(): Promise<IWorkHistory[]> {
    try {
        const whs = await this._db.workHistories.findAll();
        return whs.map((s) => s.get({ plain: true }));
      } catch (ex) {
        this._log.error(ex);
        throw ex;
      }
    }

  /**
   *
   * @param id The unique id of the workHistory to get
   * @returns The status.
   */
  public async getWorkHistoryById(id: string, plain = true): Promise<IWorkHistory> {
    try {
      const workHistory = await this._db.workHistories.findOne({
        where: {
          id: id,
        },
      });
      return workHistory != null
        ? plain === true
          ? workHistory.get({ plain: true })
          : workHistory
        : null;
    } catch (ex) {
      this._log.error(ex);
      throw ex;
    }
  }

  /**
   *
   * @param id The unique id of the workHistory to update
   * @param workHistory The workHistory data with which to update the record.
   * @returns The number of rows affected by the update.
   */
  public async updateWorkHistory(id: string, workHistory: IWorkHistory): Promise<number> {
    try {
      const updated = await this._db.workHistories.update(workHistory, { where: { id } });
      const retVal = await this.getWorkHistoryById(id);

      // Send message to all clients
      return updated[UPDATE_AFFECTED_ROWS_INDEX];
    } catch (ex) {
      this._log.error(ex);
      throw ex;
    }
  }

  /**
   *
   * @param workHistory The workHistory data with which the new record should be initialized.
   * @returns The newly created workHistory with its new id.
   */
  public async addWorkHistory(workHistory: IWorkHistory): Promise<IWorkHistory> {
    try {
      const created = await this._db.workHistories.create(workHistory);
      // Send message to all clients
      return created != null ? created.get({ plain: true }) : null;
    } catch (ex) {
      this._log.error(ex);
      throw ex;
    }
  }

  /**
   *
   * @param id The unique id of the workHistory to update
   * @returns The status.
   */
  public async deleteWorkHistoryById(id: string): Promise<boolean> {
    try {
      const workHistory: WorkHistory = (await this.getWorkHistoryById(id, false)) as WorkHistory;
      if (workHistory != null) {
        await workHistory.destroy();
        // Send message to all clients
        return true;
      }
      return false;
    } catch (ex) {
      this._log.error(ex);
      throw ex;
    }
  }
}
