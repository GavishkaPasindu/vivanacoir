"use client";

import React, { useState, useEffect } from "react";
import { SHOP_CONFIG } from "@/app/lib/config";
import { formatInvoiceCode } from "@/app/lib/invoiceCounter";
import type { Product, ProductsApiResponse } from "@/app/lib/types";

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
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  paymentMethod: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: "processing" | "delivered" | "cancelled";
  createdAt: string;
}

const MOCK_ORDERS: Order[] = [
  {
    orderId: "#VCV-000001",
    customerName: "Sample Customer",
    phone: "+94 77 123 4567",
    email: "sample@example.com",
    address: "123 Main Street, Colombo 01",
    paymentMethod: "Cash on Delivery (COD)",
    items: [{ id: "ID1", title: "Premium Coco Peat Block", price: 4500, quantity: 2, size: "5kg Block", category: "COCOPEAT" }],
    subtotal: 9000, shipping: 0, total: 9000,
    status: "processing",
    createdAt: "2026-10-01, 10:30 AM",
  },
];

// ─── CSS helpers (site tokens) ─────────────────────────────────────────────────
const P = "#000B4D";   // --color-primary
const PD = "#000529";  // --color-primary-dark
const AC = "#3B82F6";  // --color-accent
const BG = "#f8fafc";  // --color-bg-alt

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<"orders" | "products">("orders");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [modalType, setModalType] = useState<"invoice" | "label" | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [emailStatus, setEmailStatus] = useState<Record<string, "idle" | "sending" | "sent" | "error">>({});
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoadingOrders(true);
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => {
        if (data.orders?.length > 0) {
          setOrders(data.orders.map((o: Record<string, unknown>) => ({
            ...o,
            items: typeof o.items === "string" ? JSON.parse(o.items as string) : o.items,
            subtotal: Number(o.subtotal || 0),
            shipping: Number(o.shipping || 0),
            total: Number(o.total || 0),
          })) as Order[]);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingOrders(false));
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch("/api/products")
      .then((r) => r.json())
      .then((d: ProductsApiResponse) => setProducts(d.products ?? []))
      .catch(console.error);
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) setIsAuthenticated(true);
      else setLoginError(data.message || "Invalid credentials");
    } catch {
      setLoginError("Server error. Please try again.");
    }
  };

  const updateStatus = async (orderId: string, newStatus: Order["status"]) => {
    const order = orders.find((o) => o.orderId === orderId);
    if (!order) return;
    setOrders((prev) => prev.map((o) => o.orderId === orderId ? { ...o, status: newStatus } : o));

    if (newStatus === "delivered" && order.email) {
      setEmailStatus((prev) => ({ ...prev, [orderId]: "sending" }));
      try {
        const res = await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: order.orderId, customerName: order.customerName,
            email: order.email, phone: order.phone, address: order.address,
            paymentMethod: order.paymentMethod,
            items: order.items.map((i) => ({ title: i.title, size: i.size, quantity: i.quantity, price: i.discountPrice && i.discountPrice > 0 ? i.discountPrice : i.price })),
            subtotal: order.subtotal, shipping: order.shipping, total: order.total, type: "delivered",
          }),
        });
        setEmailStatus((prev) => ({ ...prev, [orderId]: res.ok ? "sent" : "error" }));
      } catch {
        setEmailStatus((prev) => ({ ...prev, [orderId]: "error" }));
      }
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    const matchSearch = !searchTerm || o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) || (o.phone || "").includes(searchTerm);
    return matchStatus && matchSearch;
  });

  const stats = {
    total: orders.length,
    processing: orders.filter((o) => o.status === "processing").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
    revenue: orders.filter((o) => o.status === "delivered").reduce((s, o) => s + Number(o.total || 0), 0),
  };

  // ─── Shared input style ─────────────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.65rem 0.875rem",
    border: "1px solid #cbd5e1", fontSize: "0.875rem",
    outline: "none", fontFamily: "Inter, sans-serif", boxSizing: "border-box",
  };

  // ─── LOGIN ──────────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: BG, padding: "1rem",
        fontFamily: "Inter, sans-serif",
      }}>
        <div style={{ background: "#fff", padding: "2.5rem", width: "100%", maxWidth: 400, boxShadow: "0 8px 32px rgba(0,0,0,0.1)", borderTop: `4px solid ${AC}` }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{ width: 60, height: 60, background: P, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem", fontSize: "1.75rem" }}>
              🌿
            </div>
            <h1 style={{ margin: 0, fontSize: "1.4rem", color: P, fontFamily: "Playfair Display, serif", fontWeight: 700 }}>VIVANA COIR</h1>
            <p style={{ margin: "0.25rem 0 0", color: "#475569", fontSize: "0.85rem" }}>Admin Portal</p>
          </div>

          <form onSubmit={handleLogin}>
            {[
              { label: "Username", id: "u", type: "text", val: username, set: setUsername },
              { label: "Password", id: "p", type: "password", val: password, set: setPassword },
            ].map((f) => (
              <div key={f.id} style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#374151" }}>
                  {f.label}
                </label>
                <input
                  type={f.type} value={f.val}
                  onChange={(e) => f.set(e.target.value)}
                  required style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = AC)}
                  onBlur={(e) => (e.target.style.borderColor = "#cbd5e1")}
                />
              </div>
            ))}

            {loginError && (
              <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", padding: "0.75rem", marginBottom: "1rem", fontSize: "0.85rem", color: "#991b1b" }}>
                {loginError}
              </div>
            )}

            <button type="submit" style={{
              width: "100%", padding: "0.875rem", background: P, color: "#fff",
              border: "none", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer",
              textTransform: "uppercase", letterSpacing: "0.06em",
            }}>
              LOGIN TO ADMIN
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── DASHBOARD ──────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "Inter, sans-serif" }}>

      {/* Top Bar */}
      <header style={{
        background: P, color: "#fff",
        padding: "0 1.5rem", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        position: "sticky", top: 0, zIndex: 100,
        borderBottom: `3px solid ${AC}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: "1.25rem" }}>🌿</span>
          <div>
            <p style={{ margin: 0, fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.04em", fontFamily: "Playfair Display, serif" }}>
              VIVANA HOLDINGS
            </p>
            <p style={{ margin: 0, fontSize: "0.68rem", color: "#93c5fd" }}>Admin Dashboard</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <a href="/" style={{ color: "#93c5fd", textDecoration: "none", fontSize: "0.82rem" }}>← Main Site</a>
          <a href="/shop" style={{ color: "#93c5fd", textDecoration: "none", fontSize: "0.82rem" }}>Shop</a>
          <button
            onClick={() => setIsAuthenticated(false)}
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", padding: "0.35rem 0.875rem", cursor: "pointer", fontSize: "0.82rem" }}
          >
            Logout
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "1.5rem" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
          {[
            { label: "Total Orders", value: stats.total, color: P, icon: "📋" },
            { label: "Processing", value: stats.processing, color: "#d97706", icon: "⏳" },
            { label: "Delivered", value: stats.delivered, color: "#16a34a", icon: "✅" },
            { label: "Cancelled", value: stats.cancelled, color: "#dc2626", icon: "❌" },
            { label: "Revenue", value: `Rs. ${stats.revenue.toLocaleString("en-LK")}`, color: P, icon: "💰" },
          ].map((s) => (
            <div key={s.label} style={{ background: "#fff", padding: "1.25rem", border: "1px solid #e2e8f0", boxShadow: "0 2px 6px rgba(0,0,0,0.04)", borderTop: `3px solid ${s.color}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.4rem" }}>
                <span style={{ fontSize: "1.1rem" }}>{s.icon}</span>
                <span style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</span>
              </div>
              <p style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
          {(["orders", "products"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "0.6rem 1.25rem", border: "none",
                background: activeTab === tab ? P : "#fff",
                color: activeTab === tab ? "#fff" : "#374151",
                fontWeight: 700, cursor: "pointer", fontSize: "0.85rem",
                textTransform: "capitalize", letterSpacing: "0.02em",
                borderBottom: activeTab === tab ? `2px solid ${AC}` : "2px solid transparent",
                boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
              }}
            >
              {tab === "orders" ? "📋 Orders" : "📦 Products"}
            </button>
          ))}
        </div>

        {/* ── ORDERS TAB ────────────────────────────────────────────────── */}
        {activeTab === "orders" && (
          <div>
            {/* Filters */}
            <div style={{ background: "#fff", padding: "1rem 1.25rem", marginBottom: "1rem", display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center", border: "1px solid #e2e8f0" }}>
              <input
                type="text"
                placeholder="Search by name, order ID, phone…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ flex: "1 1 220px", padding: "0.55rem 0.875rem", border: "1px solid #cbd5e1", fontSize: "0.85rem", outline: "none" }}
              />
              {["all", "processing", "delivered", "cancelled"].map((s) => {
                const colors: Record<string, [string, string]> = {
                  all: [P, "#fff"], processing: ["#fef3c7", "#92400e"],
                  delivered: ["#dcfce7", "#166534"], cancelled: ["#fee2e2", "#991b1b"],
                };
                const [bg, color] = colors[s] || [P, "#fff"];
                return (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    style={{
                      padding: "0.4rem 0.875rem", border: "none",
                      background: statusFilter === s ? bg : "#f1f5f9",
                      color: statusFilter === s ? color : "#374151",
                      fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                      textTransform: "capitalize",
                    }}
                  >
                    {s === "all" ? `All (${orders.length})` : `${s} (${orders.filter((o) => o.status === s).length})`}
                  </button>
                );
              })}
            </div>

            {loadingOrders ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#6b7280", background: "#fff", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⏳</div>
                <p>Loading orders from Google Sheets…</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#6b7280", background: "#fff", border: "1px solid #e2e8f0" }}>
                No orders found
              </div>
            ) : (
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                    <thead>
                      <tr style={{ background: BG, borderBottom: "2px solid #e2e8f0" }}>
                        {["Order ID", "Customer", "Items", "Total", "Payment", "Status", "Date", "Actions"].map((h) => (
                          <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order.orderId} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "0.875rem 1rem" }}>
                            <p style={{ margin: 0, fontWeight: 700, color: P, fontFamily: "monospace", fontSize: "0.82rem" }}>{order.orderId}</p>
                            {order.invoiceCode && (
                              <p style={{ margin: "2px 0 0", fontSize: "0.7rem", color: "#94a3b8" }}>INV: {formatInvoiceCode(order.invoiceCode)}</p>
                            )}
                          </td>
                          <td style={{ padding: "0.875rem 1rem" }}>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: "0.85rem" }}>{order.customerName}</p>
                            <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#6b7280" }}>{order.phone}</p>
                            {order.email && <p style={{ margin: "1px 0 0", fontSize: "0.7rem", color: "#94a3b8" }}>{order.email}</p>}
                          </td>
                          <td style={{ padding: "0.875rem 1rem" }}>
                            {Array.isArray(order.items) && order.items.slice(0, 2).map((item, i) => (
                              <p key={i} style={{ margin: "0 0 2px", fontSize: "0.78rem", color: "#374151" }}>
                                {item.title} ×{item.quantity}
                              </p>
                            ))}
                            {Array.isArray(order.items) && order.items.length > 2 && (
                              <p style={{ margin: 0, fontSize: "0.7rem", color: "#94a3b8" }}>+{order.items.length - 2} more</p>
                            )}
                          </td>
                          <td style={{ padding: "0.875rem 1rem" }}>
                            <p style={{ margin: 0, fontWeight: 700, color: P }}>Rs. {Number(order.total || 0).toLocaleString("en-LK")}</p>
                            <p style={{ margin: "2px 0 0", fontSize: "0.7rem", color: "#94a3b8" }}>
                              {Number(order.shipping || 0) === 0 ? "Free ship" : `+Rs. ${Number(order.shipping).toLocaleString("en-LK")} ship`}
                            </p>
                          </td>
                          <td style={{ padding: "0.875rem 1rem", fontSize: "0.78rem", color: "#374151" }}>
                            {order.paymentMethod}
                          </td>
                          <td style={{ padding: "0.875rem 1rem" }}>
                            <select
                              value={order.status}
                              onChange={(e) => updateStatus(order.orderId, e.target.value as Order["status"])}
                              style={{
                                padding: "0.35rem 0.5rem", border: "1px solid #e2e8f0",
                                fontSize: "0.8rem", fontWeight: 700, cursor: "pointer",
                                background: order.status === "delivered" ? "#dcfce7" : order.status === "cancelled" ? "#fee2e2" : "#fef3c7",
                                color: order.status === "delivered" ? "#166534" : order.status === "cancelled" ? "#991b1b" : "#92400e",
                              }}
                            >
                              <option value="processing">Processing</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            {emailStatus[order.orderId] === "sending" && <p style={{ margin: "3px 0 0", fontSize: "0.68rem", color: "#6b7280" }}>Sending email…</p>}
                            {emailStatus[order.orderId] === "sent" && <p style={{ margin: "3px 0 0", fontSize: "0.68rem", color: "#16a34a" }}>✅ Email sent</p>}
                            {emailStatus[order.orderId] === "error" && <p style={{ margin: "3px 0 0", fontSize: "0.68rem", color: "#dc2626" }}>❌ Email failed</p>}
                          </td>
                          <td style={{ padding: "0.875rem 1rem", fontSize: "0.78rem", color: "#6b7280" }}>
                            {String(order.createdAt || "").split(",")[0]}
                          </td>
                          <td style={{ padding: "0.875rem 1rem" }}>
                            <div style={{ display: "flex", gap: "0.4rem" }}>
                              <button
                                onClick={() => { setSelectedOrder(order); setModalType("invoice"); }}
                                style={{ padding: "0.35rem 0.65rem", background: P, color: "#fff", border: "none", fontSize: "0.75rem", cursor: "pointer", fontWeight: 600 }}
                              >
                                Invoice
                              </button>
                              <button
                                onClick={() => { setSelectedOrder(order); setModalType("label"); }}
                                style={{ padding: "0.35rem 0.65rem", background: AC, color: "#fff", border: "none", fontSize: "0.75rem", cursor: "pointer", fontWeight: 600 }}
                              >
                                Label
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PRODUCTS TAB ──────────────────────────────────────────────── */}
        {activeTab === "products" && (
          <div>
            <div style={{ background: "#fff", padding: "1rem 1.25rem", marginBottom: "1rem", border: "1px solid #e2e8f0", display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
              <p style={{ margin: 0, fontWeight: 700, color: P }}>📦 {products.length} products loaded from Google Sheet</p>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#6b7280" }}>
                Sheet ID: <code style={{ background: BG, padding: "1px 6px" }}>1Rsw4gjO4jPFlHXofLMgOujn6FuhNWMonnepHOvCn4pE</code>
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
              {products.map((product) => (
                <div key={product.id} style={{ background: "#fff", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>
                  <div style={{ aspectRatio: "4/3", background: BG, overflow: "hidden" }}>
                    {product.imageId ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={driveImageUrl(product.imageId)}
                        alt={product.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: P, color: "#fff", fontSize: "2.5rem", fontWeight: 700 }}>
                        {product.category?.charAt(0) || "C"}
                      </div>
                    )}
                  </div>
                  <div style={{ padding: "0.875rem" }}>
                    <span style={{ fontSize: "0.65rem", color: AC, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{product.category}</span>
                    <p style={{ margin: "0.25rem 0", fontSize: "0.85rem", fontWeight: 700, color: "#111", lineHeight: 1.3 }}>{product.title}</p>
                    <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 800, color: P }}>
                      {product.isWholesale ? "Price on Request" : `Rs. ${product.price.toLocaleString("en-LK")}.00`}
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem", marginTop: "0.5rem" }}>
                      {product.tags.map((tag) => (
                        <span key={tag} style={{ fontSize: "0.62rem", background: "#eff6ff", color: "#1d4ed8", padding: "1px 6px", fontWeight: 600 }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── INVOICE MODAL ─────────────────────────────────────────────── */}
      {modalType === "invoice" && selectedOrder && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 2000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "1rem", overflowY: "auto" }}>
          <div style={{ background: "#fff", width: "100%", maxWidth: 760, margin: "auto", position: "relative", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <button className="no-print" onClick={() => { setModalType(null); setSelectedOrder(null); }}
              style={{ position: "absolute", top: "1rem", right: "1rem", background: "rgba(0,0,0,0.1)", border: "none", width: 30, height: 30, cursor: "pointer", zIndex: 1 }}>✕
            </button>

            <div className="printable-doc">
              {/* Header */}
              <div style={{
                background: "#fff",
                color: P, padding: "1.5rem 2rem",
                borderBottom: `3px solid ${AC}`,
                display: "flex", justifyContent: "space-between",
                flexDirection: "row", flexWrap: "wrap", gap: "1rem"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: "1 1 300px" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo.png"
                    alt="VIVANA HOLDINGS"
                    style={{ height: "48px", width: "auto" }}
                  />
                  <div>
                    <h2 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "1.2rem", letterSpacing: "0.04em", color: P }}>VIVANA HOLDINGS</h2>
                    <p style={{ margin: "3px 0 0", fontSize: "0.75rem", color: "#475569" }}>PRODUCTS EXPORT (PVT) LTD</p>
                    <p style={{ margin: "2px 0 0", fontSize: "0.72rem", color: "#475569" }}>{SHOP_CONFIG.address}</p>
                    <p style={{ margin: "2px 0 0", fontSize: "0.72rem", color: "#475569" }}>{SHOP_CONFIG.email}</p>
                  </div>
                </div>
                <div style={{ textAlign: "right", flex: "1 1 200px" }}>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: P, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>INVOICE</p>
                  <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "#111" }}><strong>Code:</strong> {selectedOrder.invoiceCode ? formatInvoiceCode(selectedOrder.invoiceCode) : selectedOrder.orderId}</p>
                  <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#111" }}><strong>Ref:</strong> {selectedOrder.orderId}</p>
                  <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#111" }}><strong>Date:</strong> {String(selectedOrder.createdAt || "").split(",")[0]}</p>
                </div>
              </div>

              {/* Bill To */}
              <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid #e2e8f0" }}>
                <p style={{ margin: "0 0 0.5rem", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: AC }}>Bill To</p>
                <p style={{ margin: 0, fontWeight: 700 }}>{selectedOrder.customerName}</p>
                {selectedOrder.email && <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "#475569" }}>Email: {selectedOrder.email}</p>}
                <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "#475569" }}>Tel: {selectedOrder.phone}</p>
                <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "#475569" }}>{selectedOrder.address}</p>
              </div>

              {/* Items */}
              <div style={{ padding: "1.5rem 2rem 0" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                    <thead>
                      <tr style={{ background: BG, borderBottom: "2px solid #e2e8f0" }}>
                        {["Image", "Item Description", "Qty", "Unit Price", "Total"].map((h) => (
                          <th key={h} style={{ padding: "0.6rem 0.75rem", textAlign: h === "Qty" || h === "Unit Price" || h === "Total" ? "right" : "left", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280", fontWeight: 700 }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(selectedOrder.items) && selectedOrder.items.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "0.75rem" }}>
                            {item.imageId ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={driveImageUrl(item.imageId)} alt={item.title} style={{ width: 44, height: 44, objectFit: "cover" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                            ) : (
                              <div style={{ width: 44, height: 44, background: P, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>
                                {item.category?.charAt(0) || "C"}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: "0.75rem" }}>
                            <strong style={{ color: P }}>{item.title}</strong>
                            {item.size && <span style={{ display: "block", fontSize: "0.75rem", color: "#6b7280" }}>{item.size}</span>}
                          </td>
                          <td style={{ padding: "0.75rem", textAlign: "right" }}>{item.quantity}</td>
                          <td style={{ padding: "0.75rem", textAlign: "right" }}>
                            {Number(item.discountPrice) > 0 ? (
                              <>
                                <span style={{ textDecoration: "line-through", color: "#94a3b8", fontSize: "0.75rem", display: "block" }}>Rs. {Number(item.originalPrice || 0).toLocaleString("en-LK")}.00</span>
                                <span style={{ color: P, fontWeight: 700 }}>Rs. {Number(item.discountPrice).toLocaleString("en-LK")}.00</span>
                              </>
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
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "0.35rem 0", color: "#475569" }}>
                      <span>Subtotal:</span><span>Rs. {Number(selectedOrder.subtotal || 0).toLocaleString("en-LK")}.00</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "0.35rem 0", borderBottom: "1px solid #e2e8f0", color: "#475569" }}>
                      <span>Shipping:</span>
                      <span>{Number(selectedOrder.shipping || 0) === 0 ? "FREE" : `Rs. ${Number(selectedOrder.shipping).toLocaleString("en-LK")}.00`}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 0", fontWeight: 800, fontSize: "1rem", color: P }}>
                      <span>Grand Total Due:</span>
                      <span>Rs. {Number(selectedOrder.total || 0).toLocaleString("en-LK")}.00</span>
                    </div>
                  </div>
                </div>

                <div style={{ background: BG, border: "1px solid #e2e8f0", padding: "1rem", marginBottom: "1.5rem" }}>
                  <h4 style={{ margin: "0 0 0.4rem", color: P, fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>VIVANA COIR Statement</h4>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "#475569", lineHeight: 1.5 }}>{SHOP_CONFIG.invoiceStatement}</p>
                </div>
              </div>
            </div>

            <button className="no-print" onClick={() => window.print()}
              style={{ display: "block", width: "calc(100% - 4rem)", margin: "0 2rem 1.5rem", padding: "0.875rem", background: P, color: "#fff", border: "none", fontWeight: 700, cursor: "pointer", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              🖨️ Print Invoice
            </button>
          </div>
        </div>
      )}

      {/* ── SHIPPING LABEL MODAL ───────────────────────────────────────── */}
      {modalType === "label" && selectedOrder && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "#fff", width: "100%", maxWidth: 460, position: "relative", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <button className="no-print" onClick={() => { setModalType(null); setSelectedOrder(null); }}
              style={{ position: "absolute", top: "1rem", right: "1rem", background: "rgba(0,0,0,0.1)", border: "none", width: 30, height: 30, cursor: "pointer", zIndex: 1 }}>✕
            </button>

            <div id="printable-label" className="printable-doc">
              <div style={{ background: P, color: "#fff", padding: "1rem 1.5rem", borderBottom: `3px solid ${AC}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 800, fontSize: "1rem", letterSpacing: "0.04em", fontFamily: "Playfair Display, serif" }}>{SHOP_CONFIG.name}</span>
                <span style={{ fontSize: "0.68rem", color: "#93c5fd", textTransform: "uppercase", letterSpacing: "0.08em" }}>DOMESTIC COURIER</span>
              </div>

              <div style={{ padding: "1.5rem" }}>
                <div style={{ marginBottom: "1rem", padding: "0.875rem", background: BG, border: "1px solid #e2e8f0" }}>
                  <p style={{ margin: "0 0 0.2rem", fontSize: "0.65rem", color: AC, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>SENDER</p>
                  <p style={{ margin: 0, fontWeight: 700 }}>{SHOP_CONFIG.fullName}</p>
                  <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#475569" }}>{SHOP_CONFIG.address}</p>
                  <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#475569" }}>Tel: {SHOP_CONFIG.phone}</p>
                </div>

                <div style={{ padding: "0.875rem", border: `2px solid ${P}` }}>
                  <p style={{ margin: "0 0 0.2rem", fontSize: "0.65rem", color: AC, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>SHIP TO</p>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: "1.1rem" }}>{selectedOrder.customerName}</p>
                  <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "#374151" }}>{selectedOrder.address}</p>
                  <p style={{ margin: "4px 0 0", fontSize: "0.85rem", fontWeight: 700 }}>TEL: {selectedOrder.phone}</p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
                  <div style={{ padding: "0.875rem", background: P, color: "#fff", textAlign: "center" }}>
                    <p style={{ margin: "0 0 0.2rem", fontSize: "0.62rem", color: "#93c5fd", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {(selectedOrder.paymentMethod || "").includes("COD") ? "COD AMOUNT" : "PREPAID"}
                    </p>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: "1.1rem" }}>
                      {(selectedOrder.paymentMethod || "").includes("COD") ? `Rs. ${Number(selectedOrder.total || 0).toLocaleString("en-LK")}` : "Rs. 0.00"}
                    </p>
                  </div>
                  <div style={{ padding: "0.875rem", background: BG, fontSize: "0.8rem" }}>
                    <p style={{ margin: "0 0 3px" }}><strong>REF:</strong> {selectedOrder.orderId}</p>
                    <p style={{ margin: "0 0 3px" }}><strong>DATE:</strong> {String(selectedOrder.createdAt || "").split(",")[0]}</p>
                    <p style={{ margin: 0 }}><strong>METHOD:</strong> {(selectedOrder.paymentMethod || "").includes("COD") ? "COD" : "PREPAID"}</p>
                  </div>
                </div>

                <div style={{ marginTop: "1rem", textAlign: "center", padding: "0.75rem 0", borderTop: "2px dashed #e2e8f0" }}>
                  <div style={{ height: 28, background: `repeating-linear-gradient(90deg, ${P} 0px, ${P} 3px, transparent 3px, transparent 6px)`, marginBottom: "0.4rem" }} />
                  <p style={{ margin: 0, fontFamily: "monospace", fontSize: "0.8rem", fontWeight: 700, color: P }}>*{selectedOrder.orderId}*</p>
                </div>
              </div>
            </div>

            <button className="no-print" onClick={() => window.print()}
              style={{ display: "block", width: "calc(100% - 3rem)", margin: "0 1.5rem 1.5rem", padding: "0.875rem", background: AC, color: "#fff", border: "none", fontWeight: 700, cursor: "pointer", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              🖨️ Print Shipping Label
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
        }
      `}</style>
    </div>
  );
}
