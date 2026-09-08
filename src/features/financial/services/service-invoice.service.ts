import { api } from '@/config/api';
import { BaseCompanyService } from '@/services/base-url.service';

export type InvoiceStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'AUTHORIZED'
  | 'REJECTED'
  | 'ERROR'
  | null;

export type InvoiceRow = {
  clientId: string;
  clientName: string;
  email?: string | null;
  amount: number;
  financeCount: number;
  canIssue: boolean;
  reason?: string | null;
  missingEmail: boolean;
  invoiceStatus: InvoiceStatus;
  invoice?: {
    id: string;
    number?: string | null;
    status: Exclude<InvoiceStatus, null>;
    emailSentAt?: string | null;
  } | null;
  finances: {
    id: string;
    title: string;
    date: string;
    value: number;
    status: string;
    invoiced: boolean;
  }[];
};

export type InvoiceList = {
  readyForEmission: boolean;
  blocker?: string | null;
  rows: InvoiceRow[];
};

class ServiceInvoiceService extends BaseCompanyService {
  async list(params: {
    from: string;
    to: string;
    invoiceStatus?: string;
    financeStatus?: string;
  }) {
    const { data } = await api.get<InvoiceList>(
      this.getUrlBase('service-invoices'),
      { params },
    );
    return data;
  }

  async issue(body: { clientId: string; from: string; to: string; financeStatus?: string }) {
    const { data } = await api.post(this.getUrlBase('service-invoices'), body);
    return data;
  }

  async issueBatch(body: {
    from: string;
    to: string;
    financeStatus?: string;
    clientIds?: string[];
  }) {
    const { data } = await api.post(this.getUrlBase('service-invoices/batch'), body);
    return data;
  }
}

export const serviceInvoiceService = new ServiceInvoiceService();
