import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { CloudflareService } from "../../common/service/cloudflare.service";
import { FileService } from "../../common/utils/file/file.service";
import { CustomerMapper } from "./customer.mapper";
import { CustomerRepository } from "./customer.repository";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { UpdateStatusCustomerDto } from "./dto/update-status-customer.dto";
import { Activity } from "../user-log/dto/activity.dto";
import { UserLogService } from "../user-log/user-log.service";

@Injectable()
export class CustomerService {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly customerMapper: CustomerMapper,
    private readonly wf: FileService,
    private readonly userLogService: UserLogService,
    // private readonly r2: CloudflareService,
  ) {}

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

      const result = await this.customerRepository.paginate({
        page,
        tableSize,
        filter,
        sortBy,
        sortType,
      });

      return {
        data: this.customerMapper.toResponseList(result.data),
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
      const data = await this.customerRepository.findOne(id);

      if (!data) throw new NotFoundException("Customer not found");

      return this.customerMapper.toResponse(data);
    } catch (e: any) {
      this.wf.logFile(e.message);
      throw new InternalServerErrorException(e.message);
    }
  }

  async create(dto: CreateCustomerDto) {
    try {
      const imageBase64 = dto.image;
      dto.image = "";
      const data = await this.customerRepository.create(dto);

    //   if (imageBase64) {
    //     const upload = await this.r2.uploadBase64(
    //       imageBase64,
    //       "customer",
    //       Number(data.id),
    //     );

    //     await this.customerRepository.update(Number(data.id), {
    //       image: upload.key,
    //     } as UpdateCustomerDto);

    //     data.image = upload.key;
    //   }

      await this.userLogService.log({
        module: "Customer",
        action: Activity.CREATE,
        description: `Created Customer ${data.name}`,
        subjectId: Number(data.id),
        properties: dto,
      });
    } catch (e: any) {
      this.wf.logFile(e.message);
      throw new InternalServerErrorException(e.message);
    }
  }

  async update(id: number, dto: UpdateCustomerDto) {
    try {
      const existing = await this.findOne(id);

    //   if (dto.image && dto.image.startsWith("data:image")) {
    //     const oldKey = existing.image
    //       ? this.r2.extractKeyFromUrl(existing.image)
    //       : undefined;
    //     const upload = await this.r2.updateBase64Image(
    //       dto.image,
    //       "customer",
    //       id,
    //       oldKey,
    //     );

    //     dto.image = upload.key;
    //   } else if (dto.image === null) {
    //     if (existing.image) {
    //       const oldKey = this.r2.extractKeyFromUrl(existing.image);
    //       await this.r2.deleteFile(oldKey);
    //     }

    //     dto.image = "";
    //   } else {
    //     dto.image = existing.image ?? undefined;
    //   }

      const data = await this.customerRepository.update(id, dto);
      const changes = await this.userLogService.getChanges(existing, dto);

      await this.userLogService.log({
        module: "Customer",
        action: Activity.UPDATE,
        description: `Updated Customer ${data.name}`,
        subjectId: Number(data.id),
        properties: changes,
      });
    } catch (e: any) {
      this.wf.logFile(e.message);
      throw new InternalServerErrorException(e.message);
    }
  }

  async updateStatus(id: number, dto: UpdateStatusCustomerDto) {
    try {
      await this.findOne(id);
      const data = await this.customerRepository.updateStatus(id, dto);
      await this.userLogService.log({
        module: "Customer",
        action: Activity.UPDATE_STATUS,
        description: `Updated status of Customer ${data.id}`,
        subjectId: Number(data.id),
        properties: dto,
      });
    } catch (e: any) {
      this.wf.logFile(e.message);
      throw new InternalServerErrorException(e.message);
    }
  }

  async remove(id: number) {
    try {
      const existing = await this.findOne(id);

    //   if (existing.image) {
    //     const key = this.r2.extractKeyFromUrl(existing.image);
    //     await this.r2.deleteFile(key);
    //   }

      await this.userLogService.log({
        module: "Customer",
        action: Activity.DELETE,
        description: `Deleted Customer ${existing.name}`,
        subjectId: Number(existing.id),
      });

      return await this.customerRepository.remove(id);
    } catch (e: any) {
      this.wf.logFile(e.message);
      throw new InternalServerErrorException(e.message);
    }
  }
}
