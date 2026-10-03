"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();

  // Try loading from sessionStorage
  let order: Order | null = null;
  try {
    const stored = sessionStorage.getItem("vivana_last_order");
    if (stored) order = JSON.parse(stored);
  } catch { /* noop */ }

  if (!order) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafb" }}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>❓</div>
          <h2 style={{ margin: "0 0 0.5rem", color: "#1a5c2f" }}>No Order Found</h2>
          <p style={{ color: "#666" }}>Please complete a checkout to view your receipt.</p>
          <a
            href="/shop"
            style={{
              display: "inline-block",
              marginTop: "1rem",
              padding: "0.75rem 1.5rem",
              background: "#1a5c2f",
              color: "#fff",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Back to Shop
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f0f7f2", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        {/* Success Banner */}
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: "2rem",
            textAlign: "center",
            marginBottom: "1.5rem",
            border: "1px solid #d4edda",
            boxShadow: "0 4px 20px rgba(26,92,47,0.08)",
          }}
        >
          <div style={{ fontSize: "3.5rem", marginBottom: "0.75rem" }}>✅</div>
          <h1 style={{ margin: "0 0 0.5rem", fontSize: "1.5rem", color: "#1a5c2f", fontWeight: 800 }}>
            Inquiry Submitted!
          </h1>
          <p style={{ margin: 0, color: "#555", fontSize: "0.95rem" }}>
            Thank you <strong>{order.customerName}</strong>! We&apos;ve received your order inquiry. Our team will contact you via email and WhatsApp to confirm details.
          </p>
          {order.email && (
            <p style={{ margin: "0.75rem 0 0", fontSize: "0.85rem", color: "#2e7d32" }}>
              📧 Confirmation sent to: <strong>{order.email}</strong>
            </p>
          )}
        </div>

        {/* Invoice/Receipt */}
        <div
          className="printable-doc"
          style={{
            background: "#fff",
            borderRadius: 12,
            border: "1px solid #d4edda",
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(26,92,47,0.08)",
          }}
        >
          {/* Invoice Header */}
          <div
            style={{
              background: "#1a5c2f",
              color: "#fff",
              padding: "1.5rem 2rem",
              borderBottom: "3px solid #4caf50",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, letterSpacing: "0.05em" }}>VIVANA COIR</h2>
                <p style={{ margin: "4px 0 0", fontSize: "0.78rem", color: "#a5d6a7" }}>PRODUCTS EXPORT (PVT) LTD</p>
                <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#a5d6a7" }}>{SHOP_CONFIG.address}</p>
                <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#a5d6a7" }}>Email: {SHOP_CONFIG.email}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <h3 style={{ margin: 0, fontSize: "1rem", color: "#a5d6a7", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  ORDER RECEIPT
                </h3>
                <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "#fff" }}>
                  <strong>Receipt:</strong>{" "}
                  {order.invoiceCode ? formatReceiptCode(order.invoiceCode) : order.orderId}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#fff" }}>
                  <strong>Order Ref:</strong> {order.orderId}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#fff" }}>
                  <strong>Date:</strong> {order.createdAt.split(",")[0]}
                </p>
              </div>
            </div>
          </div>

          {/* Bill To */}
          <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid #e8f5e9" }}>
            <h4 style={{ margin: "0 0 0.75rem", fontSize: "0.8rem", color: "#4caf50", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
              Deliver To
            </h4>
            <p style={{ margin: 0, fontWeight: 700, fontSize: "1rem", color: "#111" }}>{order.customerName}</p>
            {order.email && <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "#555" }}>Email: {order.email}</p>}
            <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "#555" }}>Tel: {order.phone}</p>
            <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "#555" }}>{order.address}</p>
            <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "#555" }}>
              <strong>Payment:</strong> {order.paymentMethod}
            </p>
          </div>

          {/* Bank Transfer Instructions */}
          {order.paymentMethod === "Bank Transfer" && (
            <div className="no-print" style={{ margin: "0 2rem", borderRadius: 8, background: "#f1f8f4", border: "1px solid #d4edda", padding: "1rem", marginTop: "1rem" }}>
              <h4 style={{ margin: "0 0 0.5rem", color: "#1a5c2f", fontSize: "0.9rem" }}>💳 BANK TRANSFER DETAILS</h4>
              <p style={{ margin: "0 0 0.75rem", fontSize: "0.85rem", color: "#555" }}>
                Please transfer the total amount and send your transaction receipt to our WhatsApp: <strong>{SHOP_CONFIG.whatsapp}</strong> quoting reference <strong>{order.orderId}</strong>.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.85rem" }}>
                <div><strong>Bank Name:</strong> People&apos;s Bank</div>
                <div><strong>Account Name:</strong> VIVANA COIR PVT LTD</div>
                <div><strong>Account Number:</strong> 000 1234 5678</div>
                <div><strong>Branch:</strong> Hambantota Branch</div>
              </div>
            </div>
          )}

          {/* Items Table */}
          <div style={{ padding: "1.5rem 2rem 0" }}>
            <h4 style={{ margin: "0 0 0.75rem", fontSize: "0.8rem", color: "#4caf50", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
              Items Ordered
            </h4>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                <thead>
                  <tr style={{ background: "#f1f8f4" }}>
                    <th style={{ padding: "0.625rem 0.75rem", textAlign: "left", width: 60, borderBottom: "2px solid #d4edda", fontSize: "0.75rem", textTransform: "uppercase", color: "#555" }}>Image</th>
                    <th style={{ padding: "0.625rem 0.75rem", textAlign: "left", borderBottom: "2px solid #d4edda", fontSize: "0.75rem", textTransform: "uppercase", color: "#555" }}>Description</th>
                    <th style={{ padding: "0.625rem 0.75rem", textAlign: "center", borderBottom: "2px solid #d4edda", fontSize: "0.75rem", textTransform: "uppercase", color: "#555", width: 60 }}>Qty</th>
                    <th style={{ padding: "0.625rem 0.75rem", textAlign: "right", borderBottom: "2px solid #d4edda", fontSize: "0.75rem", textTransform: "uppercase", color: "#555", width: 100 }}>Unit Price</th>
                    <th style={{ padding: "0.625rem 0.75rem", textAlign: "right", borderBottom: "2px solid #d4edda", fontSize: "0.75rem", textTransform: "uppercase", color: "#555", width: 100 }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #e8f5e9" }}>
                      <td style={{ padding: "0.75rem" }}>
                        {item.imageId ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={driveImageUrl(item.imageId)}
                            alt={item.title}
                            style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6 }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        ) : (
                          <div style={{ width: 48, height: 48, borderRadius: 6, background: "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center", color: "#4caf50", fontWeight: 700 }}>
                            {item.category?.charAt(0) || "C"}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "0.75rem" }}>
                        <strong style={{ color: "#1a5c2f" }}>{item.title}</strong>
                        {item.size && <br />}
                        {item.size && <span style={{ fontSize: "0.78rem", color: "#666" }}>{item.size}</span>}
                      </td>
                      <td style={{ padding: "0.75rem", textAlign: "center" }}>{item.quantity}</td>
                      <td style={{ padding: "0.75rem", textAlign: "right" }}>
                        {item.discountPrice && item.discountPrice > 0 ? (
                          <div>
                            <span style={{ textDecoration: "line-through", color: "#999", fontSize: "0.78rem" }}>
                              Rs. {Number(item.originalPrice || 0).toLocaleString("en-LK")}.00
                            </span>
                            <br />
                            <span style={{ color: "#1a5c2f", fontWeight: 700 }}>
                              Rs. {Number(item.discountPrice).toLocaleString("en-LK")}.00
                            </span>
                          </div>
                        ) : (
                          <span>Rs. {Number(item.price || 0).toLocaleString("en-LK")}.00</span>
                        )}
                      </td>
                      <td style={{ padding: "0.75rem", textAlign: "right", fontWeight: 700 }}>
                        Rs. {(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString("en-LK")}.00
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "1rem 0" }}>
              <div style={{ minWidth: 280, fontSize: "0.875rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0.375rem 0", color: "#555" }}>
                  <span>Estimated Subtotal:</span>
                  <span>Rs. {order.subtotal.toLocaleString("en-LK")}.00</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0.375rem 0", borderBottom: "1px solid #d4edda", color: "#555" }}>
                  <span>Shipping &amp; Handling:</span>
                  <span style={{ color: order.shipping === 0 ? "#2e7d32" : "#111", fontWeight: order.shipping === 0 ? 700 : 400 }}>
                    {order.shipping === 0 ? "FREE" : `Rs. ${order.shipping.toLocaleString("en-LK")}.00`}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 0", fontWeight: 800, fontSize: "1rem", color: "#1a5c2f" }}>
                  <span>Grand Total:</span>
                  <span>Rs. {order.total.toLocaleString("en-LK")}.00</span>
                </div>
              </div>
            </div>

            {/* Note */}
            <div style={{ background: "#fff8e1", border: "1px solid #ffd54f", borderRadius: 8, padding: "0.875rem 1rem", marginBottom: "1rem" }}>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "#7b5e00" }}>
                <strong>Note:</strong> This is an estimated receipt based on your inquiry. A finalized invoice with confirmed pricing and shipping will be sent by our team via WhatsApp or Email.
              </p>
            </div>

            {/* Statement */}
            <div style={{ background: "#f1f8f4", border: "1px solid #d4edda", borderRadius: 8, padding: "1rem", marginBottom: "1.5rem" }}>
              <h4 style={{ margin: "0 0 0.4rem", color: "#1a5c2f", fontSize: "0.85rem" }}>VIVANA COIR Statement:</h4>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "#555", lineHeight: 1.5 }}>
                {SHOP_CONFIG.receiptStatement}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="no-print" style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
          <button
            onClick={() => window.print()}
            style={{
              padding: "0.875rem 1.5rem",
              background: "#1a5c2f",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            🖨️ PRINT RECEIPT
          </button>

          <a
            href="/shop"
            style={{
              padding: "0.875rem 1.5rem",
              background: "transparent",
              color: "#1a5c2f",
              border: "2px solid #1a5c2f",
              borderRadius: 8,
              fontWeight: 700,
              cursor: "pointer",
              fontSize: "0.9rem",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            ← CONTINUE SHOPPING
          </a>

          <button
            onClick={() => {
              const text = `Hello VIVANA COIR! I just submitted an inquiry.\n\nMy Order Reference is: ${order!.orderId}\nEstimated Total: Rs. ${order!.subtotal.toLocaleString("en-LK")}.00\n\nPlease confirm availability and shipping.`;
              const waUrl = `https://wa.me/${SHOP_CONFIG.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(text)}`;
              window.open(waUrl, "_blank");
            }}
            style={{
              padding: "0.875rem 1.5rem",
              background: "#25D366",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
              cursor: "pointer",
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
            CONTACT VIA WHATSAPP
          </button>
        </div>

        <style>{`
          @media print {
            .no-print { display: none !important; }
            body { background: #fff !important; }
          }
        `}</style>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Loading receipt...</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
