import { Injectable } from "@nestjs/common";
import { SubscriptionsEntity } from "./dto/respone-subscriptions.dto";

@Injectable()
export class SubscriptionsMapper {
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

  private getStatusKey(entity: SubscriptionsEntity) {
    if (entity.status === 2) return "disabled";
    if (entity.end_date && new Date(entity.end_date) < new Date()) return "expired";
    return "active";
  }

  private getStatusLabel(statusKey: string) {
    return statusKey.charAt(0).toUpperCase() + statusKey.slice(1);
  }

  toResponse(entity: SubscriptionsEntity) {
    const price = this.toNumber(entity.plan?.price);
    const statusKey = this.getStatusKey(entity);

    return {
      id: Number(entity.id),
      customer_id: Number(entity.customer_id),
      customer: entity.customer?.name ?? "-",
      email: entity.customer?.email ?? null,
      phone: entity.customer?.phone ?? null,
      plan_id: Number(entity.plan_id),
      plan: entity.plan?.name ?? "-",
      price,
      price_formatted: this.formatCurrency(price),
      started_at: entity.start_date,
      expired_at: entity.end_date,
      status: entity.status,
      status_key: statusKey,
      status_label: this.getStatusLabel(statusKey),
      websites: entity.plan?.website ?? 0,
      storage: entity.plan?.disk_space ?? 0,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
      customer_details: entity.customer
        ? {
            id: Number(entity.customer.id),
            name: entity.customer.name,
            email: entity.customer.email ?? null,
            phone: entity.customer.phone ?? null,
          }
        : null,
      plan_details: entity.plan
        ? {
            id: Number(entity.plan.id),
            name: entity.plan.name,
            price,
            price_formatted: this.formatCurrency(price),
            websites: entity.plan.website ?? 0,
            storage: entity.plan.disk_space ?? 0,
            bandwidth: entity.plan.bandwidth ?? 0,
            database: entity.plan.database ?? 0,
            domain: entity.plan.domain ?? 0,
            ssl: entity.plan.ssl ?? false,
          }
        : null,
      invoices:
        entity.invoices?.map((invoice: any) => ({
          id: Number(invoice.id),
          code: invoice.code,
          status: invoice.status,
          due_date: invoice.due_date,
          created_at: invoice.created_at,
        })) ?? [],
    };
  }

  toResponseList(entities: SubscriptionsEntity[]) {
    return entities.map((entity) => this.toResponse(entity));
  }
}
