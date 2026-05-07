export type WebsiteType =
  | "static"
  | "php"
  | "laravel"
  | "wordpress"
  | "reverse_proxy";
export type CreateWebsitePayload = {
  website_type: WebsiteType;
  domain: string;
  website_name: string;
  document_root: string;

  web_server: "nginx" | "apache";
  php_version?: string;
  public_path?: string;
  queue_driver?: string;

  proxy_target?: string;
  proxy_port?: number;
  websocket: boolean;

  index_file: string;
  spa_fallback: boolean;

  ssl: boolean;
  force_https: boolean;

  create_database: boolean;
  database_name: string;
  database_user: string;
  database_password: string;

  create_ftp: boolean;
  ftp_user: string;
  ftp_password: string;

  status: "active" | "disabled";
};
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
// types/website-extra.ts

export type ItemStatus = "active" | "disabled" | "pending";

export interface DomainItem {
  id: number;
  domain: string;
  website: string;
  ssl: boolean;
  status: ItemStatus;
  created_at: string;
}

export interface SubdomainItem {
  id: number;
  subdomain: string;
  domain: string;
  document_root: string;
  status: ItemStatus;
  created_at: string;
}

export interface RedirectItem {
  id: number;
  source: string;
  target: string;
  type: "301" | "302";
  https: boolean;
  status: ItemStatus;
  created_at: string;
}
