/**
 * ═══════════════════════════════════════════════════════════════
 *  VIVANA COIR – Business Configuration
 *  Edit this file to update shop details site-wide.
 * ═══════════════════════════════════════════════════════════════
 */

export const SHOP_CONFIG = {

  // Business Identity
  name: "VIVANA COIR",
  fullName: "VIVANA COIR PRODUCTS EXPORT (PVT) LTD",
  tagline: "Premium Coir Products from the Heart of Sri Lanka",

  // Contact and Address
  address: "Weheragalawaththa, Kahandawa, Ranna, Hambantota District, Sri Lanka",
  phone: "+94 76 252 0583",
  whatsapp: "+94762520583",
  email: "vivanacoir@gmail.com",

  // Invoice Number Settings
  invoiceStartNumber: 1,
  invoiceNumberPadding: 5,
  invoicePrefix: "VCV",
  receiptPrefix: "VCV",

  // localStorage key used to persist the invoice counter
  invoiceCounterKey: "vivana_invoice_counter1",

  // Order Reference Settings
  orderRefStartNumber: 2,
  orderRefNumberPadding: 6,
  orderRefPrefix: "VCV",
  orderRefCounterKey: "vivana_order_ref_counter1",

  // Returns Policy
  returnsPolicy: "Returns are accepted within 7 days of delivery in original, undamaged condition.",

  // Invoice Footer Statement
  invoiceStatement:
    "Thank you for choosing VIVANA COIR – Sri Lanka's premium natural coir products exporter. This invoice acts as an official statement of purchase.",

  // Receipt Footer Statement
  receiptStatement:
    "Thank you for your inquiry. We will process your request and get back to you shortly to confirm availability and shipping details.",
};

export type ShopConfig = typeof SHOP_CONFIG;
