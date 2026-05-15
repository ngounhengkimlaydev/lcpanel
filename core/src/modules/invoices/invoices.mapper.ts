import { Injectable } from "@nestjs/common";
import { InvoicesEntity } from "./dto/respone-invoices.dto";

@Injectable()
export class InvoicesMapper {
  private toNumber(value: any) {
    if (typeof value === "number") return value;
    if (typeof value === "string") return Number(value);
    if (value && typeof value.toNumber === "function") return value.toNumber();
    return Number(value ?? 0);
  }

  private formatCurrency(value: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  }

  private getStatusKey(status: number) {
    if (status === 1) return "paid";
    if (status === 2) return "unpaid";
    if (status === 3) return "overdue";
    return "unknown";
  }

  private getStatusLabel(statusKey: string) {
    return statusKey.charAt(0).toUpperCase() + statusKey.slice(1);
  }

  toResponse(entity: InvoicesEntity) {
    const price = this.toNumber(entity.subscription?.plan?.price);
    const statusKey = this.getStatusKey(entity.status);

    return {
      id: Number(entity.id),
      code: entity.code,
      customer_id: Number(entity.customer_id),
      customer: entity.customers?.name ?? "-",
      customer_email: entity.customers?.email ?? null,
      customer_phone: entity.customers?.phone ?? null,
      subscription_id: Number(entity.subscription_id),
      amount: price,
      amount_formatted: this.formatCurrency(price),
      status: entity.status,
      status_key: statusKey,
      status_label: this.getStatusLabel(statusKey),
      due_date: entity.due_date,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
      subscription: entity.subscription
        ? {
            id: Number(entity.subscription.id),
            started_at: entity.subscription.start_date,
            expired_at: entity.subscription.end_date,
            status: entity.subscription.status,
          }
        : null,
      customer_details: entity.customers
        ? {
            id: Number(entity.customers.id),
            name: entity.customers.name,
            email: entity.customers.email ?? null,
            phone: entity.customers.phone ?? null,
          }
        : null,
      plan_details: entity.subscription?.plan
        ? {
            id: Number(entity.subscription.plan.id),
            name: entity.subscription.plan.name,
            price,
            price_formatted: this.formatCurrency(price),
            websites: entity.subscription.plan.website ?? 0,
            storage: entity.subscription.plan.disk_space ?? 0,
            bandwidth: entity.subscription.plan.bandwidth ?? 0,
            database: entity.subscription.plan.database ?? 0,
            domain: entity.subscription.plan.domain ?? 0,
            ssl: entity.subscription.plan.ssl ?? false,
          }
        : null,
    };
  }

  toResponseList(entities: InvoicesEntity[]) {
    return entities.map((entity) => this.toResponse(entity));
  }
}
