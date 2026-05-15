import { InvoiceStatus } from "../invoice-status.enum";

export type InvoicesEntity = {
  id: bigint | number;
  code: string;
  customer_id: bigint | number;
  customers?: any;
  subscription_id: bigint | number;
  subscription?: any;
  status: InvoiceStatus;
  due_date: Date;
  created_at: Date;
  updated_at: Date;
};
