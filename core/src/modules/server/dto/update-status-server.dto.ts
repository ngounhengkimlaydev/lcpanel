import { PickType } from '@nestjs/mapped-types';
import { ServerDto } from './server.dto';

export class UpdateStatusServerDto extends PickType(ServerDto, ['status'] as const) {}
