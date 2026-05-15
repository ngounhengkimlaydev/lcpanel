import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Query,
    UseGuards,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoicesDto } from './dto/create-invoices.dto';
import { UpdateInvoicesDto } from './dto/update-invoices.dto';
import { UpdateStatusInvoicesDto } from './dto/update-status-invoices.dto';
import { PermissionAction } from '../permission/dto/permission-action.enum';
import { Permission } from '../permission/permission.decorator';
import { PermissionGuard } from '../permission/permission.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('invoices')
export class InvoicesController {
    static MODULE_KEY = 'invoices';

    constructor(private readonly invoicesService: InvoicesService) {}

    @Get()
    @Permission(InvoicesController.MODULE_KEY, PermissionAction.VIEW)
    async get(
        @Query('page') page: string,
        @Query('table_size') tableSize: string,
        @Query('filter') filter: string,
        @Query('sort_by') sortBy: string,
        @Query('sort_type') sortType: string,
    ) {
        return this.invoicesService.findAll({
            page: Number(page) || 1,
            tableSize: Number(tableSize) || 10,
            filter: filter ? JSON.parse(filter) : {},
            sortBy: sortBy || 'id',
            sortType: (sortType as 'asc' | 'desc') || 'desc',
        });
    }

    @Get(':id/download')
    @Permission(InvoicesController.MODULE_KEY, PermissionAction.VIEW)
    download(@Param('id', ParseIntPipe) id: number) {
        return this.invoicesService.downloadPdf(id);
    }

    @Get(':id')
    @Permission(InvoicesController.MODULE_KEY, PermissionAction.VIEW)
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.invoicesService.findOne(id);
    }

    @Post()
    @Permission(InvoicesController.MODULE_KEY, PermissionAction.CREATE)
    create(@Body() dto: CreateInvoicesDto) {
        return this.invoicesService.create(dto);
    }

    @Put(':id')
    @Permission(InvoicesController.MODULE_KEY, PermissionAction.UPDATE)
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateInvoicesDto) {
        return this.invoicesService.update(id, dto);
    }
    @Put(':id/status')
    @Permission(InvoicesController.MODULE_KEY, PermissionAction.UPDATE)
    updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStatusInvoicesDto) {
        return this.invoicesService.updateStatus(id, dto);
    }

    @Delete(':id')
    @Permission(InvoicesController.MODULE_KEY, PermissionAction.DELETE)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.invoicesService.remove(id);
    }
}
