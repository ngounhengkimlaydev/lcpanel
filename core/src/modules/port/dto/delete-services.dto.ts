import { PickType } from '@nestjs/mapped-types';
import { ServicesDto } from './services.dto';

export class DeleteServicesDto extends PickType(ServicesDto, ['id'] as const) {}
