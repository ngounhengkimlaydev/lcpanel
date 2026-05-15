import { OmitType } from '@nestjs/mapped-types';

import { SubscriptionsDto } from './subscriptions.dto';

export class CreateSubscriptionsDto extends OmitType(SubscriptionsDto, ['id'] as const) {}
