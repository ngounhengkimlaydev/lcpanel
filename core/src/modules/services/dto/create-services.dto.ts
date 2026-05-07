import { OmitType } from '@nestjs/mapped-types';
import { ServicesDto } from './services.dto';

export class CreateServicesDto extends OmitType(ServicesDto, ['id'] as const) {}
