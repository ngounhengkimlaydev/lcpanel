import { OmitType } from '@nestjs/mapped-types';

import { PlansDto } from './plans.dto';

export class CreatePlansDto extends OmitType(PlansDto, ['id'] as const) {}
