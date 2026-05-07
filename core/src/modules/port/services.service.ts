import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { CloudflareService } from "../../common/service/cloudflare.service";
import { FileService } from "../../common/utils/file/file.service";
import { CreateServicesDto } from "./dto/create-services.dto";
import { UpdateServicesDto } from "./dto/update-services.dto";
import { UpdateStatusServicesDto } from "./dto/update-status-services.dto";
import { Activity } from "../user-log/dto/activity.dto";
import { UserLogService } from "../user-log/user-log.service";

@Injectable()
export class ServicesService {
  constructor(
    private readonly wf: FileService,
    private readonly userLogService: UserLogService,
  ) {}

  async findAll(params: {
    page?: number;
    tableSize?: number;
    filter?: { search?: string };
    sortBy?: string;
    sortType?: "asc" | "desc";
  }) {
    try {
    } catch (e: any) {
      this.wf.logFile(e.message);
      throw new InternalServerErrorException(e.message);
    }
  }

  async startService() {}
  async stopService() {}
  async restartService() {}
}
