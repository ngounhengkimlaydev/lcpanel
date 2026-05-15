import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";

import { FileService } from "../../common/utils/file/file.service";
import { PlansMapper } from "./plans.mapper";
import { PlansRepository } from "./plans.repository";
import { CreatePlansDto } from "./dto/create-plans.dto";
import { UpdatePlansDto } from "./dto/update-plans.dto";
import { UpdateStatusPlansDto } from "./dto/update-status-plans.dto";
import { Activity } from "../user-log/dto/activity.dto";
import { UserLogService } from "../user-log/user-log.service";

@Injectable()
export class PlansService {
  constructor(
    private readonly plansRepository: PlansRepository,
    private readonly plansMapper: PlansMapper,
    private readonly wf: FileService,
    private readonly userLogService: UserLogService,
  ) {}

  private handleError(error: any): never {
    this.wf.logFile(error.message);

    if (error instanceof NotFoundException) {
      throw error;
    }

    throw new InternalServerErrorException(error.message);
  }

  private async findExistingPlan(id: number) {
    const data = await this.plansRepository.findOne(id);

    if (!data) {
      throw new NotFoundException("Plan not found");
    }

    return data;
  }

  async findAll(params: {
    page?: number;
    tableSize?: number;
    filter?: { search?: string };
    sortBy?: string;
    sortType?: "asc" | "desc";
  }) {
    try {
      const {
        page = 1,
        tableSize = 10,
        filter = {},
        sortBy = "id",
        sortType = "desc",
      } = params;

      const result = await this.plansRepository.paginate({
        page,
        tableSize,
        filter,
        sortBy,
        sortType,
      });

      return {
        data: this.plansMapper.toResponseList(result.data),
        pagination: {
          currentPage: page,
          per_page: tableSize,
          total: result.total,
          from: result.from,
          to: result.to,
          last_page: result.last_page,
        },
      };
    } catch (e: any) {
      this.wf.logFile(e.message);
      throw new InternalServerErrorException(e.message);
    }
  }

  async findOne(id: number) {
    try {
      const data = await this.plansRepository.findOne(id);

      if (!data) throw new NotFoundException("Plan not found");

      return this.plansMapper.toResponse(data);
    } catch (e: any) {
      this.handleError(e);
    }
  }

  async create(dto: CreatePlansDto) {
    try {
      const data = await this.plansRepository.create(dto);
      await this.userLogService.log({
        module: "Plans",
        action: Activity.CREATE,
        description: `Created Plan ${data.name}`,
        subjectId: data.id,
        properties: dto,
      });
      return this.plansMapper.toResponse(data);
    } catch (e: any) {
      this.handleError(e);
    }
  }

  async update(id: number, dto: UpdatePlansDto) {
    try {
      const existing = await this.findExistingPlan(id);
      const data = await this.plansRepository.update(id, dto);
      const changes = await this.userLogService.getChanges(existing, dto);

      await this.userLogService.log({
        module: "Plans",
        action: Activity.UPDATE,
        description: `Updated Plan ${data.name}`,
        subjectId: data.id,
        properties: changes,
      });

      return this.plansMapper.toResponse(data);
    } catch (e: any) {
      this.handleError(e);
    }
  }

  async updateStatus(id: number, dto: UpdateStatusPlansDto) {
    try {
      await this.findExistingPlan(id);
      const data = await this.plansRepository.updateStatus(id, dto);
      await this.userLogService.log({
        module: "Plans",
        action: Activity.UPDATE_STATUS,
        description: `Updated status of Plan ${data.name}`,
        subjectId: data.id,
        properties: dto,
      });
      return this.plansMapper.toResponse(data);
    } catch (e: any) {
      this.handleError(e);
    }
  }

  async remove(id: number) {
    try {
      const existing = await this.findExistingPlan(id);
      await this.userLogService.log({
        module: "Plans",
        action: Activity.DELETE,
        description: `Deleted Plan ${existing.name}`,
        subjectId: existing.id,
      });
      return await this.plansRepository.remove(id);
    } catch (e: any) {
      this.handleError(e);
    }
  }
}
