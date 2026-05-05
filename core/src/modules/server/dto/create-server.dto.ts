import { OmitType } from '@nestjs/mapped-types';
import { ServerDto } from './server.dto';

export class CreateServerDto extends OmitType(ServerDto, ['id'] as const) {}
