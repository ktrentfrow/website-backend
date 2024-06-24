import "reflect-metadata";
import {
  Body,
  Controller,
  Get,
  Path,
  Put,
  Post,
  Delete,
  Query,
  Route,
  Tags,
  SuccessResponse,
  Middlewares,
  Example,
} from "tsoa";
import { autoinject } from "aurelia-dependency-injection";
import { WorkHistoryService } from "../services/work-history-service";
import { IWorkHistory, TYPES } from "../api";

//   import {
//     testCustomMiddleware,
//     testCustomMiddleware2,
//   } from "../middleware/authorization";

@autoinject()
@Route("api/work-history")
@Tags("WorkHistory")
export class WorkHistoryController extends Controller {
  private _workHistoryService: WorkHistoryService;

  public constructor(workHistoryService: WorkHistoryService) {
    super();
    this._workHistoryService = workHistoryService;
  }

  /**
   * Gets all of the workHistorys.
   *
   */
  @Get()
  // @Middlewares(initAuthorization, requireRole(['ADMIN']), finalizeAuthorization)
  public async getWorkHistories(): Promise<IWorkHistory[]> {
    const whs = await this._workHistoryService.getWorkHistories();
    return whs;
  }

  /**
   * Gets a specific workHistory.
   * Supply the unique workHistory id.
   * @param id The workHistory id
   */
  @Get("{id}")
  public async getWorkHistoryById(@Path() id: string): Promise<IWorkHistory> {
    const workHistory = await this._workHistoryService.getWorkHistoryById(id);
    return workHistory;
  }

  /**
   * Updates a specific workHistory.
   * Supply the unique workHistory id.
   * @param id The workHistory id
   */
  @Put("{id}")
  public async updateWorkHistory(
    @Path() id: string,
    @Body() workHistory: IWorkHistory
  ): Promise<number> {
    const updated = await this._workHistoryService.updateWorkHistory(
      id,
      workHistory
    );
    return updated;
  }

  /**
   * Adds a new workHistory.
   * Supply the unique workHistory id.
   */
  @Post()
  public async addWorkHistory(
    @Body() workHistory: IWorkHistory
  ): Promise<IWorkHistory> {
    const created = await this._workHistoryService.addWorkHistory(workHistory);
    return created;
  }

  /**
   * Deletes a specific workHistory.
   * Supply the unique workHistory id.
   * @param id The workHistory id
   */
  @Delete("{id}")
  public async deleteWorkHistoryById(@Path() id: string): Promise<boolean> {
    const success = await this._workHistoryService.deleteWorkHistoryById(id);
    return success;
  }
}
