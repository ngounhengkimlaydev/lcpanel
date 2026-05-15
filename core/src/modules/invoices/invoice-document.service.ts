import { Injectable } from "@nestjs/common";

@Injectable()
export class InvoiceDocumentService {
  private formatDate(value: string | Date | null | undefined) {
    if (!value) return "-";

    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(new Date(value));
  }

  private escapePdfText(value: string) {
    return value
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)")
      .replace(/\r?\n/g, " ");
  }

  private getInvoiceLines(invoice: any) {
    return [
      `Invoice ${invoice.code}`,
      `Customer: ${invoice.customer}`,
      `Email: ${invoice.customer_email ?? "-"}`,
      `Phone: ${invoice.customer_phone ?? "-"}`,
      `Plan: ${invoice.plan_details?.name ?? "-"}`,
      `Amount: ${invoice.amount_formatted ?? "-"}`,
      `Status: ${invoice.status_label ?? "-"}`,
      `Due Date: ${this.formatDate(invoice.due_date)}`,
      `Issued At: ${this.formatDate(invoice.created_at)}`,
      `Subscription Start: ${this.formatDate(invoice.subscription?.started_at)}`,
      `Subscription End: ${this.formatDate(invoice.subscription?.expired_at)}`,
      `Websites: ${invoice.plan_details?.websites ?? 0}`,
      `Storage: ${invoice.plan_details?.storage ?? 0} MB`,
      `Bandwidth: ${invoice.plan_details?.bandwidth ?? 0} GB`,
      `Databases: ${invoice.plan_details?.database ?? 0}`,
      `Domains: ${invoice.plan_details?.domain ?? 0}`,
      `SSL: ${invoice.plan_details?.ssl ? "Included" : "No"}`,
    ];
  }

  buildPdf(invoice: any) {
    const lines = this.getInvoiceLines(invoice);
    const content = [
      "BT",
      "/F1 18 Tf",
      "50 760 Td",
      `(${this.escapePdfText(lines[0])}) Tj`,
      "/F1 11 Tf",
      ...lines.slice(1).map((line, index) =>
        `0 -${index === 0 ? 28 : 18} Td (${this.escapePdfText(line)}) Tj`,
      ),
      "ET",
    ].join("\n");

    const objects = [
      "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
      "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
      "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
      "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
      `5 0 obj << /Length ${Buffer.byteLength(content, "utf8")} >> stream\n${content}\nendstream\nendobj`,
    ];

    let pdf = "%PDF-1.4\n";
    const offsets = [0];

    for (const object of objects) {
      offsets.push(Buffer.byteLength(pdf, "utf8"));
      pdf += `${object}\n`;
    }

    const xrefOffset = Buffer.byteLength(pdf, "utf8");

    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += "0000000000 65535 f \n";

    for (const offset of offsets.slice(1)) {
      pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
    }

    pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\n`;
    pdf += `startxref\n${xrefOffset}\n%%EOF`;

    return Buffer.from(pdf, "utf8");
  }

  buildEmailHtml(invoice: any) {
    return `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
        <h2 style="margin-bottom: 8px;">Invoice ${invoice.code}</h2>
        <p style="margin-top: 0;">Hello ${invoice.customer}, your invoice is ready.</p>
        <table style="border-collapse: collapse; width: 100%; max-width: 520px;">
          <tbody>
            <tr><td style="padding: 6px 0; font-weight: 600;">Plan</td><td>${invoice.plan_details?.name ?? "-"}</td></tr>
            <tr><td style="padding: 6px 0; font-weight: 600;">Amount</td><td>${invoice.amount_formatted ?? "-"}</td></tr>
            <tr><td style="padding: 6px 0; font-weight: 600;">Status</td><td>${invoice.status_label ?? "-"}</td></tr>
            <tr><td style="padding: 6px 0; font-weight: 600;">Due Date</td><td>${this.formatDate(invoice.due_date)}</td></tr>
            <tr><td style="padding: 6px 0; font-weight: 600;">Subscription</td><td>${this.formatDate(invoice.subscription?.started_at)} to ${this.formatDate(invoice.subscription?.expired_at)}</td></tr>
          </tbody>
        </table>
        <p style="margin-top: 20px;">A PDF copy of the invoice is attached.</p>
      </div>
    `;
  }
}
