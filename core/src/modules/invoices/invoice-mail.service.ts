import { Injectable } from "@nestjs/common";
import nodemailer from "nodemailer";
import { FileService } from "../../common/utils/file/file.service";
import { InvoiceDocumentService } from "./invoice-document.service";

@Injectable()
export class InvoiceMailService {
  constructor(
    private readonly invoiceDocumentService: InvoiceDocumentService,
    private readonly fileService: FileService,
  ) {}

  private getTransportConfig() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT ?? 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM ?? user;

    if (!host || !user || !pass || !from) {
      return null;
    }

    return {
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
      from,
    };
  }

  async sendInvoice(invoice: any) {
    if (!invoice.customer_email) {
      return {
        sent: false,
        reason: "Customer email is not available",
      };
    }

    const config = this.getTransportConfig();

    if (!config) {
      return {
        sent: false,
        reason: "SMTP configuration is incomplete",
      };
    }

    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
    });

    const pdfBuffer = this.invoiceDocumentService.buildPdf(invoice);

    try {
      const result = await transporter.sendMail({
        from: config.from,
        to: invoice.customer_email,
        subject: `Invoice ${invoice.code}`,
        html: this.invoiceDocumentService.buildEmailHtml(invoice),
        attachments: [
          {
            filename: `${invoice.code}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      });

      return {
        sent: true,
        messageId: result.messageId,
      };
    } catch (error: any) {
      this.fileService.logFile(
        `Invoice email failed for ${invoice.code}: ${error.message}`,
      );

      return {
        sent: false,
        reason: error.message,
      };
    }
  }
}
