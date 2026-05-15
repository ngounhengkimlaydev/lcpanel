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
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { UpdateStatusCustomerDto } from './dto/update-status-customer.dto';
import { PermissionAction } from '../permission/dto/permission-action.enum';
import { Permission } from '../permission/permission.decorator';
import { PermissionGuard } from '../permission/permission.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('customer')
export class CustomerController {
    static MODULE_KEY = 'customer';

    constructor(private readonly customerService: CustomerService) {}

    @Get()
    @Permission(CustomerController.MODULE_KEY, PermissionAction.VIEW)
    async get(
        @Query('page') page: string,
        @Query('table_size') tableSize: string,
        @Query('filter') filter: string,
        @Query('sort_by') sortBy: string,
        @Query('sort_type') sortType: string,
    ) {
        return this.customerService.findAll({
            page: Number(page) || 1,
            tableSize: Number(tableSize) || 10,
            filter: filter ? JSON.parse(filter) : {},
            sortBy: sortBy || 'id',
            sortType: (sortType as 'asc' | 'desc') || 'desc',
        });
    }

    @Get(':id')
    @Permission(CustomerController.MODULE_KEY, PermissionAction.VIEW)
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.customerService.findOne(id);
    }

    @Post()
    @Permission(CustomerController.MODULE_KEY, PermissionAction.CREATE)
    create(@Body() dto: CreateCustomerDto) {
        return this.customerService.create(dto);
    }

    @Put(':id')
    @Permission(CustomerController.MODULE_KEY, PermissionAction.UPDATE)
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCustomerDto) {
        return this.customerService.update(id, dto);
    }
    @Put(':id/status')
    @Permission(CustomerController.MODULE_KEY, PermissionAction.UPDATE)
    updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStatusCustomerDto) {
        return this.customerService.updateStatus(id, dto);
    }

    @Delete(':id')
    @Permission(CustomerController.MODULE_KEY, PermissionAction.DELETE)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.customerService.remove(id);
    }
}
