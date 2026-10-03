/**
 * VIVANA COIR – Auto-Increment Invoice Counter
 */

import { SHOP_CONFIG } from "./config";

export function getNextInvoiceNumber(): string {
  const stored = localStorage.getItem(SHOP_CONFIG.invoiceCounterKey);
  const current = stored !== null
    ? parseInt(stored, 10)
    : SHOP_CONFIG.invoiceStartNumber;

  const next = current + 1;
  localStorage.setItem(SHOP_CONFIG.invoiceCounterKey, String(next));
  return String(next).padStart(SHOP_CONFIG.invoiceNumberPadding, "0");
}

export function peekCurrentInvoiceNumber(): string {
  const stored = localStorage.getItem(SHOP_CONFIG.invoiceCounterKey);
  const current = stored !== null
    ? parseInt(stored, 10)
    : SHOP_CONFIG.invoiceStartNumber;
  return String(current).padStart(SHOP_CONFIG.invoiceNumberPadding, "0");
}

export function formatInvoiceCode(num: string): string {
  return SHOP_CONFIG.invoicePrefix ? `${SHOP_CONFIG.invoicePrefix}-${num}` : num;
}

export function formatReceiptCode(num: string): string {
  return SHOP_CONFIG.receiptPrefix ? `${SHOP_CONFIG.receiptPrefix}-${num}` : num;
}

export function getNextOrderRefNumber(): string {
  const stored = localStorage.getItem(SHOP_CONFIG.orderRefCounterKey);
  const current = stored !== null
    ? parseInt(stored, 10)
    : SHOP_CONFIG.orderRefStartNumber;

  const next = current + 1;
  localStorage.setItem(SHOP_CONFIG.orderRefCounterKey, String(next));
  return String(next).padStart(SHOP_CONFIG.orderRefNumberPadding, "0");
}

export function formatOrderRef(num: string): string {
  return SHOP_CONFIG.orderRefPrefix ? `${SHOP_CONFIG.orderRefPrefix}-${num}` : num;
}

export function setInvoiceCounter(value: number): void {
  localStorage.setItem(SHOP_CONFIG.invoiceCounterKey, String(value));
}
