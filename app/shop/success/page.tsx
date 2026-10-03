"use client";

import React, { Suspense } from "react";
import { SHOP_CONFIG } from "@/app/lib/config";
import { formatReceiptCode } from "@/app/lib/invoiceCounter";

function driveImageUrl(fileId: string): string {
  return fileId ? `https://lh3.googleusercontent.com/d/${fileId}` : "";
}

interface OrderItem {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  discountPrice?: number;
  quantity: number;
  size?: string;
  imageId?: string;
  category: string;
}

interface Order {
  orderId: string;
  invoiceCode?: string;
  orderRef?: string;
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  paymentMethod: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  createdAt: string;
}

function SuccessContent() {
  let order: Order | null = null;
  try {
    const stored = sessionStorage.getItem("vivana_last_order");
    if (stored) order = JSON.parse(stored);
  } catch { /* noop */ }

  if (!order) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "4rem 1rem" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>❓</div>
          <h2 style={{ color: "var(--color-primary)", marginBottom: "0.5rem" }}>No Order Found</h2>
          <p style={{ color: "var(--color-text-muted)" }}>Complete a checkout to view your receipt.</p>
          <a href="/shop" className="btn btn-primary" style={{ display: "inline-flex", marginTop: "1.25rem" }}>
            Back to Shop
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: "80px", background: "var(--color-bg-alt)", minHeight: "100vh" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "3rem 1rem 4rem" }}>

        {/* ── Success Banner ──────────────────────────────────────────── */}
        <div style={{
          background: "#fff",
          borderTop: "4px solid var(--color-accent)",
          padding: "2rem", textAlign: "center",
          marginBottom: "1.5rem",
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>✅</div>
          <h1 style={{ margin: "0 0 0.5rem", fontSize: "1.5rem", color: "var(--color-primary)", fontFamily: "var(--font-heading)" }}>
            Inquiry Submitted Successfully!
          </h1>
          <p style={{ margin: 0, color: "var(--color-text-muted)", fontSize: "0.95rem" }}>
            Thank you <strong style={{ color: "var(--color-text)" }}>{order.customerName}</strong>! Our team will contact you to confirm stock and arrange delivery.
          </p>
          {order.email && (
            <p style={{ margin: "0.75rem 0 0", fontSize: "0.85rem", color: "var(--color-accent)", fontWeight: 600 }}>
              📧 Confirmation sent to: {order.email}
            </p>
          )}
        </div>

        {/* ── Receipt / Invoice ───────────────────────────────────────── */}
        <div className="printable-doc" style={{
          background: "#fff",
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          border: "1px solid #e2e8f0",
        }}>

          {/* Invoice Header */}
          <div style={{
            background: "#fff",
            color: "var(--color-primary)", padding: "1.5rem 2rem",
            borderBottom: "3px solid var(--color-accent)",
            display: "flex", justifyContent: "space-between",
            flexDirection: "row", flexWrap: "wrap", gap: "1rem",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: "1 1 300px" }}>
              {/* Logo on invoice */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="VIVANA HOLDINGS"
                style={{ height: "48px", width: "auto" }}
              />
              <div>
                <h2 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "1.2rem", letterSpacing: "0.04em", color: "var(--color-primary)" }}>
                  VIVANA HOLDINGS
                </h2>
                <p style={{ margin: "3px 0 0", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                  PRODUCTS EXPORT (PVT) LTD
                </p>
                <p style={{ margin: "2px 0 0", fontSize: "0.72rem", color: "var(--color-text-muted)" }}>
                  {SHOP_CONFIG.address}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: "0.72rem", color: "var(--color-text-muted)" }}>
                  {SHOP_CONFIG.email}
                </p>
              </div>
            </div>
            <div style={{ textAlign: "right", flex: "1 1 200px" }}>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
                ORDER RECEIPT
              </p>
              <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "var(--color-text)" }}>
                <strong>Receipt:</strong>{" "}
                {order.invoiceCode ? formatReceiptCode(order.invoiceCode) : order.orderId}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "var(--color-text)" }}>
                <strong>Order Ref:</strong> {order.orderId}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "var(--color-text)" }}>
                <strong>Date:</strong> {order.createdAt.split(",")[0]}
              </p>
            </div>
          </div>

          {/* Bill To */}
          <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid #e2e8f0" }}>
            <p style={{ margin: "0 0 0.75rem", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-accent)" }}>
              Deliver To
            </p>
            <p style={{ margin: 0, fontWeight: 700, fontSize: "1rem", color: "var(--color-text)" }}>{order.customerName}</p>
            {order.email && <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>Email: {order.email}</p>}
            <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>Tel: {order.phone}</p>
            <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>{order.address}</p>
            <p style={{ margin: "6px 0 0", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
              <strong style={{ color: "var(--color-text)" }}>Payment:</strong> {order.paymentMethod}
            </p>
          </div>

          {/* Bank Transfer Instructions */}
          {order.paymentMethod === "Bank Transfer" && (
            <div className="no-print" style={{ margin: "1.5rem 2rem 0", background: "#eff6ff", border: "1px solid #bfdbfe", padding: "1rem" }}>
              <h4 style={{ margin: "0 0 0.5rem", color: "var(--color-primary)", fontSize: "0.9rem" }}>
                💳 Bank Transfer Details
              </h4>
              <p style={{ margin: "0 0 0.75rem", fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
                Transfer the total amount and send your receipt to WhatsApp <strong>{SHOP_CONFIG.whatsapp}</strong> quoting <strong>{order.orderId}</strong>.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem", fontSize: "0.82rem" }}>
                <div><strong>Bank:</strong> People&apos;s Bank</div>
                <div><strong>Account Name:</strong> VIVANA COIR PVT LTD</div>
                <div><strong>Account No:</strong> 000 1234 5678</div>
                <div><strong>Branch:</strong> Hambantota</div>
              </div>
            </div>
          )}

          {/* Items Table */}
          <div style={{ padding: "1.5rem 2rem 0" }}>
            <p style={{ margin: "0 0 0.875rem", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-accent)" }}>
              Items Ordered
            </p>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ background: "var(--color-bg-alt)" }}>
                    {["Image", "Description", "Qty", "Unit Price", "Total"].map((h) => (
                      <th key={h} style={{
                        padding: "0.6rem 0.75rem", textAlign: h === "Image" ? "left" : h === "Description" ? "left" : "center",
                        fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em",
                        color: "var(--color-text-muted)", fontWeight: 700,
                        borderBottom: "2px solid #e2e8f0",
                        ...(h === "Qty" || h === "Unit Price" || h === "Total" ? { textAlign: "right" as const } : {}),
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "0.75rem" }}>
                        {item.imageId ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={driveImageUrl(item.imageId)}
                            alt={item.title}
                            style={{ width: 44, height: 44, objectFit: "cover" }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        ) : (
                          <div style={{ width: 44, height: 44, background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)", fontWeight: 700 }}>
                            {item.category?.charAt(0) || "C"}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "0.75rem" }}>
                        <strong style={{ color: "var(--color-primary)" }}>{item.title}</strong>
                        {item.size && <span style={{ display: "block", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{item.size}</span>}
                      </td>
                      <td style={{ padding: "0.75rem", textAlign: "right" }}>{item.quantity}</td>
                      <td style={{ padding: "0.75rem", textAlign: "right" }}>
                        {item.discountPrice && item.discountPrice > 0 ? (
                          <>
                            <span style={{ textDecoration: "line-through", color: "#94a3b8", fontSize: "0.75rem", display: "block" }}>
                              Rs. {Number(item.originalPrice || 0).toLocaleString("en-LK")}.00
                            </span>
                            <span style={{ color: "var(--color-primary)", fontWeight: 700 }}>
                              Rs. {Number(item.discountPrice).toLocaleString("en-LK")}.00
                            </span>
                          </>
                        ) : (
                          <span>Rs. {Number(item.price || 0).toLocaleString("en-LK")}.00</span>
                        )}
                      </td>
                      <td style={{ padding: "0.75rem", textAlign: "right", fontWeight: 700 }}>
                        Rs. {(Number(item.price || 0) * item.quantity).toLocaleString("en-LK")}.00
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "1rem 0" }}>
              <div style={{ minWidth: 280, fontSize: "0.875rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0.35rem 0", color: "var(--color-text-muted)" }}>
                  <span>Estimated Subtotal:</span>
                  <span>Rs. {order.subtotal.toLocaleString("en-LK")}.00</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0.35rem 0", borderBottom: "1px solid #e2e8f0", color: "var(--color-text-muted)" }}>
                  <span>Shipping &amp; Handling:</span>
                  <span style={{ color: order.shipping === 0 ? "#16a34a" : undefined, fontWeight: order.shipping === 0 ? 700 : undefined }}>
                    {order.shipping === 0 ? "FREE" : `Rs. ${order.shipping.toLocaleString("en-LK")}.00`}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 0", fontWeight: 800, fontSize: "1rem", color: "var(--color-primary)" }}>
                  <span>Grand Total:</span>
                  <span>Rs. {order.total.toLocaleString("en-LK")}.00</span>
                </div>
              </div>
            </div>

            {/* Estimate note */}
            <div style={{ background: "#fefce8", border: "1px solid #fde68a", padding: "0.875rem 1rem", marginBottom: "1rem" }}>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#854d0e" }}>
                <strong>Note:</strong> This is an estimated receipt. A finalized invoice will be sent by our team via WhatsApp or Email.
              </p>
            </div>

            {/* Statement */}
            <div style={{ background: "var(--color-bg-alt)", border: "1px solid #e2e8f0", padding: "1rem", marginBottom: "1.5rem" }}>
              <h4 style={{ margin: "0 0 0.4rem", color: "var(--color-primary)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                VIVANA COIR Statement
              </h4>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                {SHOP_CONFIG.receiptStatement}
              </p>
            </div>
          </div>
        </div>

        {/* ── Action Buttons ──────────────────────────────────────────── */}
        <div className="no-print" style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
          <button
            onClick={() => window.print()}
            className="btn btn-primary"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
          >
            🖨️ Print Receipt
          </button>

          <a href="/shop" className="btn btn-outline" style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            background: "var(--color-primary)", color: "#fff",
            border: "none",
          }}>
            ← Continue Shopping
          </a>

          <button
            onClick={() => {
              const text = `Hello VIVANA COIR!\n\nMy Order Ref: ${order!.orderId}\nEstimated Total: Rs. ${order!.subtotal.toLocaleString("en-LK")}.00\n\nPlease confirm availability and shipping.`;
              window.open(`https://wa.me/${SHOP_CONFIG.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(text)}`, "_blank");
            }}
            style={{
              padding: "0.875rem 1.5rem", background: "#25D366", color: "#fff",
              border: "none", fontWeight: 700, cursor: "pointer", fontSize: "0.875rem",
              fontFamily: "var(--font-body)", textTransform: "uppercase", letterSpacing: "0.04em",
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
            }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
            </svg>
            WhatsApp
          </button>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
        }
      `}</style>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ paddingTop: "80px", textAlign: "center", padding: "6rem 2rem", color: "var(--color-text-muted)" }}>
        Loading receipt…
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
