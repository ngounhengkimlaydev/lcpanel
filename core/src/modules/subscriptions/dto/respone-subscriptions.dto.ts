import { Status } from '../../../enum/status.enum';

export type SubscriptionsEntity = {
    id: bigint | number;
    customer_id: bigint | number;
    customer?: any;
    plan_id: number;
    plan?: any;
    start_date: Date;
    end_date: Date;
    status: Status;
    created_at: Date;
    updated_at: Date;
    invoices?: any[];
};
