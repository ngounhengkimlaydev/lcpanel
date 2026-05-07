import { PickType } from '@nestjs/mapped-types';
import { ServicesDto } from './services.dto';

export class UpdateStatusServicesDto extends PickType(ServicesDto, ['status'] as const) {}
