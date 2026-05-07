export interface CreateWebsitePayload {
  domain: string;
  website_name: string;
  document_root: string;
  php_version: string;
  ssl: boolean;
  force_https: boolean;
  create_database: boolean;
  database_name: string;
  database_user: string;
  database_password: string;
  create_ftp: boolean;
  ftp_user: string;
  ftp_password: string;
  status: "active" | "pending";
}
export type WebsiteStatus = "active" | "suspended" | "pending" | "error";

export interface Website {
  id: number;
  domain: string;
  owner: string;
  document_root: string;
  php_version: string;
  ssl: boolean;
  status: WebsiteStatus;
  storage: string;
  bandwidth: string;
  created_at: string;
}
