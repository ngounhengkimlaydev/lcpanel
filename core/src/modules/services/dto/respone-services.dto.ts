import { Status } from '../../../enum/status.enum';

export type ServicesEntity = {
    id: number;
    image?: string;
    status: Status;
    created_at: Date;
    updated_at: Date;
};
