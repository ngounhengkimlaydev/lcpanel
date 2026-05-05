import { PickType } from '@nestjs/mapped-types';
import { ServerDto } from './server.dto';

export class DeleteServerDto extends PickType(ServerDto, ['id'] as const) {}
