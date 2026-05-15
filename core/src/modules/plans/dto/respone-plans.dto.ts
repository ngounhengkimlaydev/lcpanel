import { Status } from "../../../enum/status.enum";

export type PlansEntity = {
  id: number;
  name: string;
  description: string;
  price: any;
  cpu?: number | null;
  ram?: number | null;
  disk_space: number;
  domain: number;
  email?: number | null;
  ssl: boolean;
  database: number;
  website: number;
  ftp_account?: number | null;
  cronjob?: number | null;
  backup?: boolean | null;
  cdn?: boolean | null;
  staging?: boolean | null;
  ssh_access?: boolean | null;
  docker_support?: boolean | null;
  bandwidth: number;
  type: number;
  status: Status;
  created_at: Date;
  updated_at: Date;
  subscriptions?: any[];
};
