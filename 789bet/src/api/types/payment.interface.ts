export interface PaymentHistoryReq {
  page: number;
  limit: number;
  from?: string; // BC88BET format: "DD/MM/YYYY HH:mm:ss" hoặc "DD/MM/YYYY" (optional, service sẽ tự convert từ dateFrom/dateTo)
  to?: string;   // BC88BET format: "DD/MM/YYYY HH:mm:ss" hoặc "DD/MM/YYYY" (optional, service sẽ tự convert từ dateFrom/dateTo)
  type?: string;
  // Legacy support (sẽ convert sang from/to trong service)
  dateFrom?: string;
  dateTo?: string;
}
