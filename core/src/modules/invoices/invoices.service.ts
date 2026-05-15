import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";

import { FileService } from "../../common/utils/file/file.service";
import { InvoicesMapper } from "./invoices.mapper";
import { InvoicesRepository } from "./invoices.repository";
import { CreateInvoicesDto } from "./dto/create-invoices.dto";
import { UpdateInvoicesDto } from "./dto/update-invoices.dto";
import { UpdateStatusInvoicesDto } from "./dto/update-status-invoices.dto";
import { Activity } from "../user-log/dto/activity.dto";
import { UserLogService } from "../user-log/user-log.service";
import { InvoiceDocumentService } from "./invoice-document.service";
import { InvoiceMailService } from "./invoice-mail.service";

@Injectable()
export class InvoicesService {
  constructor(
    private readonly invoicesRepository: InvoicesRepository,
    private readonly invoicesMapper: InvoicesMapper,
    private readonly invoiceDocumentService: InvoiceDocumentService,
    private readonly invoiceMailService: InvoiceMailService,
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

  private async findExistingInvoiceEntity(id: number) {
    const data = await this.invoicesRepository.findOne(id);

    if (!data) {
      throw new NotFoundException("Invoice not found");
    }

    return data;
  }

  async findAll(params: {
    page?: number;
    tableSize?: number;
    filter?: { search?: string; status?: string | number };
    sortBy?: string;
    sortType?: "asc" | "desc";
  }) {
    try {
      const {
        page = 1,
        tableSize = 10,
        filter = {},
        sortBy = "created_at",
        sortType = "desc",
      } = params;

      const result = await this.invoicesRepository.paginate({
        page,
        tableSize,
        filter,
        sortBy,
        sortType,
      });

      return {
        data: this.invoicesMapper.toResponseList(result.data),
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
      this.handleError(e);
    }
  }

  async findOne(id: number) {
    try {
      const data = await this.findExistingInvoiceEntity(id);
      return this.invoicesMapper.toResponse(data);
    } catch (e: any) {
      this.handleError(e);
    }
  }

  async downloadPdf(id: number) {
    try {
      const data = await this.findExistingInvoiceEntity(id);
      const invoice = this.invoicesMapper.toResponse(data);
      const pdfBuffer = this.invoiceDocumentService.buildPdf(invoice);

      return {
        file_name: `${invoice.code}.pdf`,
        mime_type: "application/pdf",
        content_base64: pdfBuffer.toString("base64"),
      };
    } catch (e: any) {
      this.handleError(e);
    }
  }

  async create(dto: CreateInvoicesDto) {
    try {
      const data = await this.invoicesRepository.create(dto);
      const invoice = this.invoicesMapper.toResponse(data);
      const email = await this.invoiceMailService.sendInvoice(invoice);

      await this.userLogService.log({
        module: "Invoices",
        action: Activity.CREATE,
        description: `Created invoice ${invoice.code}`,
        subjectId: invoice.id,
        properties: {
          ...dto,
          email,
        },
      });

      return {
        ...invoice,
        email,
      };
    } catch (e: any) {
      this.handleError(e);
    }
  }

  async update(id: number, dto: UpdateInvoicesDto) {
    try {
      const existing = await this.findOne(id);
      const data = await this.invoicesRepository.update(id, dto);
      const changes = await this.userLogService.getChanges(existing, dto);

      await this.userLogService.log({
        module: "Invoices",
        action: Activity.UPDATE,
        description: `Updated invoice ${data.code}`,
        subjectId: Number(data.id),
        properties: changes,
      });

      return this.invoicesMapper.toResponse(data);
    } catch (e: any) {
      this.handleError(e);
    }
  }

  async updateStatus(id: number, dto: UpdateStatusInvoicesDto) {
    try {
      await this.findExistingInvoiceEntity(id);
      const data = await this.invoicesRepository.updateStatus(id, dto);
      await this.userLogService.log({
        module: "Invoices",
        action: Activity.UPDATE_STATUS,
        description: `Updated status of invoice ${data.code}`,
        subjectId: Number(data.id),
        properties: dto,
      });
      return this.invoicesMapper.toResponse(data);
    } catch (e: any) {
      this.handleError(e);
    }
  }

  async remove(id: number) {
    try {
      const existing = await this.findOne(id);
      await this.userLogService.log({
        module: "Invoices",
        action: Activity.DELETE,
        description: `Deleted invoice ${existing.code}`,
        subjectId: existing.id,
      });
      return await this.invoicesRepository.remove(id);
    } catch (e: any) {
      this.handleError(e);
    }
  }
}
