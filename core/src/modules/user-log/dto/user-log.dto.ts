export class UserLogDto {
    id?: bigint;
    log_name?: string;
    description!: string;
    subject_type?: string;
    event?: string;
    subject_id?: bigint;
    causer_type?: string;
    causer_id?: bigint;
    properties?: any;
    batch_uuid?: string;
    created_at?: Date;
    updated_at?: Date;
}
