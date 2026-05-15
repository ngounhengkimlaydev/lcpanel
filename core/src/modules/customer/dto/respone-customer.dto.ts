import { Status } from "../../../enum/status.enum";

export type CustomerEntity = {
  id: bigint;
  // user_type_id: number;
  // role_id: number;
  // code: string | null;
  // image: string | null;
  name: string;
  // phone: string;
  email: string | null;
  gender: number | null;
  // password: string | null;
  // google: string | null;
  // apple_id: string | null;
  // firebase_uid: string | null;
  status: Status;
  // deleted_at: Date | null;
  created_at: Date;
  // updated_at: Date;
  // user_type?: any;
  // role?: any;
  // gitConnections?: any[];
  // gitProjects?: any[];
  // deploymentHistories?: any[];
  // invoices?: any[];
  subscription?: any;
};
