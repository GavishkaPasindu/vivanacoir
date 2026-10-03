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
    address: "123, Main Street, Colombo 01",
    paymentMethod: "Cash on Delivery (COD)",
    items: [
      { id: "ID1", title: "Premium Coco Peat Block", price: 4500, quantity: 2, size: "5kg Block", category: "COCOPEAT" },
    ],
    subtotal: 9000,
    shipping: 0,
    total: 9000,
    status: "processing",
    createdAt: "2026-10-01, 10:30 AM",
  },
];

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<"orders" | "products">("orders");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [modalType, setModalType] = useState<"invoice" | "label" | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [emailStatus, setEmailStatus] = useState<Record<string, "idle" | "sending" | "sent" | "error">>({});
  const [loadingOrders, setLoadingOrders] = useState(true);

  // ─── Load orders from Google Sheets ────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;
    setLoadingOrders(true);
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => {
        if (data.orders && Array.isArray(data.orders) && data.orders.length > 0) {
          const parsed = data.orders.map((o: Record<string, unknown>) => ({
            ...o,
            items: typeof o.items === "string" ? JSON.parse(o.items as string) : o.items,
            subtotal: Number(o.subtotal || 0),
            shipping: Number(o.shipping || 0),
            total: Number(o.total || 0),
          })) as Order[];
          setOrders(parsed);
        }
      })
      .catch((e) => console.error("Failed to load orders:", e))
      .finally(() => setLoadingOrders(false));
  }, [isAuthenticated]);

  // ─── Load products ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;
    fetch("/api/products")
      .then((r) => r.json())
      .then((d: ProductsApiResponse) => setProducts(d.products ?? []))
      .catch(console.error);
  }, [isAuthenticated]);

  // ─── Auth ───────────────────────────────────────────────────────────────────
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
      if (data.success) {
        setIsAuthenticated(true);
      } else {
        setLoginError(data.message || "Invalid credentials");
      }
    } catch {
      setLoginError("Server error. Please try again.");
    }
  };

  // ─── Status Update ──────────────────────────────────────────────────────────
  const updateStatus = async (orderId: string, newStatus: Order["status"]) => {
    const order = orders.find((o) => o.orderId === orderId);
    if (!order) return;

    setOrders((prev) =>
      prev.map((o) => (o.orderId === orderId ? { ...o, status: newStatus } : o))
    );

    // Send delivery email if status = delivered and email exists
    if (newStatus === "delivered" && order.email) {
      setEmailStatus((prev) => ({ ...prev, [orderId]: "sending" }));
      try {
        const emailItems = order.items.map((item) => ({
          title: item.title,
          size: item.size,
          quantity: item.quantity,
          price: item.discountPrice && item.discountPrice > 0 ? item.discountPrice : item.price,
        }));

        const res = await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: order.orderId,
            customerName: order.customerName,
            email: order.email,
            phone: order.phone,
            address: order.address,
            paymentMethod: order.paymentMethod,
            items: emailItems,
            subtotal: order.subtotal,
            shipping: order.shipping,
            total: order.total,
            type: "delivered",
          }),
        });
        if (res.ok) {
          setEmailStatus((prev) => ({ ...prev, [orderId]: "sent" }));
        } else {
          setEmailStatus((prev) => ({ ...prev, [orderId]: "error" }));
        }
      } catch {
        setEmailStatus((prev) => ({ ...prev, [orderId]: "error" }));
      }
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    const matchSearch =
      !searchTerm ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.phone || "").includes(searchTerm);
    return matchStatus && matchSearch;
  });

  // ─── Stats ──────────────────────────────────────────────────────────────────
  const stats = {
    total: orders.length,
    processing: orders.filter((o) => o.status === "processing").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
    revenue: orders
      .filter((o) => o.status === "delivered")
      .reduce((sum, o) => sum + Number(o.total || 0), 0),
  };

  // ─── LOGIN SCREEN ───────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1a5c2f 0%, #2e7d32 100%)",
          padding: "1rem",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: "2.5rem",
            width: "100%",
            maxWidth: 400,
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div
              style={{
                width: 64,
                height: 64,
                background: "linear-gradient(135deg, #1a5c2f, #4caf50)",
                borderRadius: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem",
                fontSize: "1.75rem",
              }}
            >
              🌿
            </div>
            <h1 style={{ margin: 0, fontSize: "1.4rem", color: "#1a5c2f", fontWeight: 800 }}>VIVANA COIR</h1>
            <p style={{ margin: "0.25rem 0 0", color: "#666", fontSize: "0.85rem" }}>Admin Portal</p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.4rem", color: "#374151" }}>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                style={{
                  width: "100%",
                  padding: "0.7rem 0.875rem",
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  fontSize: "0.9rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.4rem", color: "#374151" }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                style={{
                  width: "100%",
                  padding: "0.7rem 0.875rem",
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  fontSize: "0.9rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            {loginError && (
              <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 8, padding: "0.75rem", marginBottom: "1rem", fontSize: "0.85rem", color: "#991b1b" }}>
                {loginError}
              </div>
            )}
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "0.875rem",
                background: "#1a5c2f",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: "0.95rem",
                cursor: "pointer",
              }}
            >
              LOGIN TO ADMIN
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── MAIN ADMIN DASHBOARD ───────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#f0f7f2" }}>
      {/* Top Bar */}
      <header
        style={{
          background: "#1a5c2f",
          color: "#fff",
          padding: "0 1.5rem",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: "1.25rem" }}>🌿</span>
          <div>
            <p style={{ margin: 0, fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.03em" }}>VIVANA COIR</p>
            <p style={{ margin: 0, fontSize: "0.7rem", color: "#a5d6a7" }}>Admin Dashboard</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <a href="/" style={{ color: "#a5d6a7", textDecoration: "none", fontSize: "0.82rem" }}>← Main Site</a>
          <button
            onClick={() => setIsAuthenticated(false)}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "#fff",
              padding: "0.35rem 0.875rem",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: "0.82rem",
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "1.5rem" }}>
        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
          {[
            { label: "Total Orders", value: stats.total, color: "#1a5c2f", bg: "#e8f5e9", icon: "📋" },
            { label: "Processing", value: stats.processing, color: "#d97706", bg: "#fef3c7", icon: "⏳" },
            { label: "Delivered", value: stats.delivered, color: "#059669", bg: "#d1fae5", icon: "✅" },
            { label: "Cancelled", value: stats.cancelled, color: "#dc2626", bg: "#fee2e2", icon: "❌" },
            { label: "Revenue (Delivered)", value: `Rs. ${stats.revenue.toLocaleString("en-LK")}`, color: "#1a5c2f", bg: "#e8f5e9", icon: "💰" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "#fff",
                borderRadius: 10,
                padding: "1.25rem",
                border: "1px solid #e8f5e9",
                boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "1.25rem" }}>{stat.icon}</span>
                <span style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {stat.label}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: stat.color }}>{stat.value}</p>
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
                padding: "0.6rem 1.25rem",
                borderRadius: 8,
                border: "none",
                background: activeTab === tab ? "#1a5c2f" : "#fff",
                color: activeTab === tab ? "#fff" : "#374151",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: "0.85rem",
                textTransform: "capitalize",
                border: activeTab === tab ? "none" : "1px solid #d1d5db",
              } as React.CSSProperties}
            >
              {tab === "orders" ? "📋 Orders" : "📦 Products"}
            </button>
          ))}
        </div>

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <div>
            {/* Filters */}
            <div style={{ background: "#fff", borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "1rem", display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center", border: "1px solid #e8f5e9" }}>
              <input
                type="text"
                placeholder="Search by name, order ID, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  flex: "1 1 220px",
                  padding: "0.55rem 0.875rem",
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  fontSize: "0.85rem",
                  outline: "none",
                }}
              />
              {["all", "processing", "delivered", "cancelled"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  style={{
                    padding: "0.45rem 0.875rem",
                    borderRadius: 20,
                    border: statusFilter === s ? "none" : "1px solid #d1d5db",
                    background: statusFilter === s
                      ? s === "processing" ? "#fef3c7" : s === "delivered" ? "#d1fae5" : s === "cancelled" ? "#fee2e2" : "#1a5c2f"
                      : "transparent",
                    color: statusFilter === s
                      ? s === "processing" ? "#92400e" : s === "delivered" ? "#065f46" : s === "cancelled" ? "#991b1b" : "#fff"
                      : "#374151",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    textTransform: "capitalize",
                  }}
                >
                  {s === "all" ? `All (${orders.length})` : `${s} (${orders.filter((o) => o.status === s).length})`}
                </button>
              ))}
            </div>

            {/* Orders Table */}
            {loadingOrders ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⏳</div>
                <p>Loading orders from Google Sheets...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#888", background: "#fff", borderRadius: 10, border: "1px solid #e8f5e9" }}>
                <p style={{ fontSize: "1rem", fontWeight: 600 }}>No orders found</p>
              </div>
            ) : (
              <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e8f5e9", overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                    <thead>
                      <tr style={{ background: "#f1f8f4", borderBottom: "2px solid #d4edda" }}>
                        {["Order ID", "Customer", "Items", "Total", "Payment", "Status", "Date", "Actions"].map((h) => (
                          <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.75rem", color: "#555", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order.orderId} style={{ borderBottom: "1px solid #e8f5e9" }}>
                          <td style={{ padding: "0.875rem 1rem" }}>
                            <p style={{ margin: 0, fontWeight: 700, color: "#1a5c2f", fontFamily: "monospace" }}>{order.orderId}</p>
                            {order.invoiceCode && (
                              <p style={{ margin: "2px 0 0", fontSize: "0.72rem", color: "#888" }}>
                                INV: {formatInvoiceCode(order.invoiceCode)}
                              </p>
                            )}
                          </td>
                          <td style={{ padding: "0.875rem 1rem" }}>
                            <p style={{ margin: 0, fontWeight: 600 }}>{order.customerName}</p>
                            <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "#666" }}>{order.phone}</p>
                            {order.email && <p style={{ margin: "1px 0 0", fontSize: "0.72rem", color: "#888" }}>{order.email}</p>}
                          </td>
                          <td style={{ padding: "0.875rem 1rem" }}>
                            {Array.isArray(order.items) && order.items.slice(0, 2).map((item, i) => (
                              <p key={i} style={{ margin: "0 0 2px", fontSize: "0.78rem" }}>
                                {item.title} ×{item.quantity}
                              </p>
                            ))}
                            {Array.isArray(order.items) && order.items.length > 2 && (
                              <p style={{ margin: 0, fontSize: "0.72rem", color: "#888" }}>+{order.items.length - 2} more</p>
                            )}
                          </td>
                          <td style={{ padding: "0.875rem 1rem" }}>
                            <p style={{ margin: 0, fontWeight: 700, color: "#1a5c2f" }}>Rs. {Number(order.total || 0).toLocaleString("en-LK")}</p>
                            <p style={{ margin: "2px 0 0", fontSize: "0.72rem", color: "#888" }}>
                              {Number(order.shipping || 0) === 0 ? "Free ship" : `+Rs. ${Number(order.shipping).toLocaleString("en-LK")} ship`}
                            </p>
                          </td>
                          <td style={{ padding: "0.875rem 1rem", fontSize: "0.78rem" }}>
                            {order.paymentMethod}
                          </td>
                          <td style={{ padding: "0.875rem 1rem" }}>
                            <select
                              value={order.status}
                              onChange={(e) => updateStatus(order.orderId, e.target.value as Order["status"])}
                              style={{
                                padding: "0.35rem 0.5rem",
                                borderRadius: 6,
                                border: "1px solid #d1d5db",
                                fontSize: "0.8rem",
                                background:
                                  order.status === "delivered"
                                    ? "#d1fae5"
                                    : order.status === "cancelled"
                                    ? "#fee2e2"
                                    : "#fef3c7",
                                color:
                                  order.status === "delivered"
                                    ? "#065f46"
                                    : order.status === "cancelled"
                                    ? "#991b1b"
                                    : "#92400e",
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              <option value="processing">Processing</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            {emailStatus[order.orderId] === "sending" && (
                              <p style={{ margin: "4px 0 0", fontSize: "0.7rem", color: "#888" }}>Sending email...</p>
                            )}
                            {emailStatus[order.orderId] === "sent" && (
                              <p style={{ margin: "4px 0 0", fontSize: "0.7rem", color: "#059669" }}>✅ Email sent</p>
                            )}
                            {emailStatus[order.orderId] === "error" && (
                              <p style={{ margin: "4px 0 0", fontSize: "0.7rem", color: "#dc2626" }}>❌ Email failed</p>
                            )}
                          </td>
                          <td style={{ padding: "0.875rem 1rem", fontSize: "0.78rem", color: "#666" }}>
                            {String(order.createdAt || "").split(",")[0]}
                          </td>
                          <td style={{ padding: "0.875rem 1rem" }}>
                            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                              <button
                                onClick={() => { setSelectedOrder(order); setModalType("invoice"); }}
                                style={{
                                  padding: "0.35rem 0.6rem",
                                  background: "#1a5c2f",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: 6,
                                  fontSize: "0.75rem",
                                  cursor: "pointer",
                                  fontWeight: 600,
                                }}
                              >
                                Invoice
                              </button>
                              <button
                                onClick={() => { setSelectedOrder(order); setModalType("label"); }}
                                style={{
                                  padding: "0.35rem 0.6rem",
                                  background: "#2e7d32",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: 6,
                                  fontSize: "0.75rem",
                                  cursor: "pointer",
                                  fontWeight: 600,
                                }}
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

        {/* PRODUCTS TAB */}
        {activeTab === "products" && (
          <div>
            <div style={{ background: "#fff", borderRadius: 10, padding: "1.25rem", marginBottom: "1rem", border: "1px solid #e8f5e9" }}>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#1a5c2f", fontWeight: 700 }}>
                📦 {products.length} products loaded from Google Sheet
              </p>
              <p style={{ margin: "0.25rem 0 0", fontSize: "0.8rem", color: "#666" }}>
                Sheet ID: <code style={{ background: "#f1f8f4", padding: "1px 6px", borderRadius: 4 }}>1Rsw4gjO4jPFlHXofLMgOujn6FuhNWMonnepHOvCn4pE</code>
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
              {products.map((product) => (
                <div
                  key={product.id}
                  style={{
                    background: "#fff",
                    borderRadius: 10,
                    overflow: "hidden",
                    border: "1px solid #e8f5e9",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                  }}
                >
                  <div style={{ aspectRatio: "4/3", background: "#e8f5e9", overflow: "hidden" }}>
                    {product.imageId ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={driveImageUrl(product.imageId)}
                        alt={product.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#4caf50", fontSize: "2rem", fontWeight: 700 }}>
                        {product.category?.charAt(0) || "C"}
                      </div>
                    )}
                  </div>
                  <div style={{ padding: "0.875rem" }}>
                    <span style={{ fontSize: "0.68rem", color: "#4caf50", fontWeight: 700, textTransform: "uppercase" }}>{product.category}</span>
                    <p style={{ margin: "0.25rem 0", fontSize: "0.85rem", fontWeight: 700, color: "#111", lineHeight: 1.3 }}>{product.title}</p>
                    <p style={{ margin: 0, fontSize: "0.82rem", fontWeight: 800, color: "#1a5c2f" }}>
                      {product.isWholesale ? "Price on Request" : `Rs. ${product.price.toLocaleString("en-LK")}.00`}
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem", marginTop: "0.5rem" }}>
                      {product.tags.map((tag) => (
                        <span key={tag} style={{ fontSize: "0.65rem", background: "#e8f5e9", color: "#1a5c2f", padding: "1px 6px", borderRadius: 10, fontWeight: 600 }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* INVOICE MODAL */}
      {modalType === "invoice" && selectedOrder && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 2000,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "1rem",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              width: "100%",
              maxWidth: 760,
              margin: "auto",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              position: "relative",
            }}
          >
            <button
              className="no-print"
              onClick={() => { setModalType(null); setSelectedOrder(null); }}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "rgba(0,0,0,0.1)",
                border: "none",
                width: 32,
                height: 32,
                borderRadius: "50%",
                cursor: "pointer",
                fontSize: "1rem",
                zIndex: 1,
              }}
            >
              ✕
            </button>

            {/* Printable Invoice */}
            <div className="printable-doc">
              <div style={{ background: "#1a5c2f", color: "#fff", padding: "1.5rem 2rem", borderBottom: "3px solid #4caf50" }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, letterSpacing: "0.05em" }}>VIVANA COIR</h2>
                    <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#a5d6a7" }}>PRODUCTS EXPORT (PVT) LTD</p>
                    <p style={{ margin: "2px 0 0", fontSize: "0.72rem", color: "#a5d6a7" }}>{SHOP_CONFIG.address}</p>
                    <p style={{ margin: "2px 0 0", fontSize: "0.72rem", color: "#a5d6a7" }}>Email: {SHOP_CONFIG.email}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <h3 style={{ margin: 0, color: "#a5d6a7", fontSize: "0.95rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>INVOICE</h3>
                    <p style={{ margin: "4px 0 0", fontSize: "0.82rem" }}>
                      <strong>Invoice Code:</strong>{" "}
                      {selectedOrder.invoiceCode ? formatInvoiceCode(selectedOrder.invoiceCode) : selectedOrder.orderId}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: "0.82rem" }}>
                      <strong>Order Ref:</strong> {selectedOrder.orderId}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: "0.82rem" }}>
                      <strong>Date:</strong> {String(selectedOrder.createdAt || "").split(",")[0]}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ padding: "1.5rem 2rem" }}>
                <h4 style={{ margin: "0 0 0.75rem", fontSize: "0.78rem", color: "#4caf50", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>Bill To</h4>
                <p style={{ margin: 0, fontWeight: 700 }}>{selectedOrder.customerName}</p>
                {selectedOrder.email && <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "#555" }}>Email: {selectedOrder.email}</p>}
                <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "#555" }}>Tel: {selectedOrder.phone}</p>
                <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "#555" }}>{selectedOrder.address}</p>
              </div>

              <div style={{ padding: "0 2rem 1.5rem" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                    <thead>
                      <tr style={{ background: "#f1f8f4" }}>
                        <th style={{ padding: "0.625rem 0.75rem", textAlign: "left", width: 56, borderBottom: "2px solid #d4edda", fontSize: "0.72rem", textTransform: "uppercase", color: "#555" }}>Image</th>
                        <th style={{ padding: "0.625rem 0.75rem", textAlign: "left", borderBottom: "2px solid #d4edda", fontSize: "0.72rem", textTransform: "uppercase", color: "#555" }}>Description</th>
                        <th style={{ padding: "0.625rem 0.75rem", textAlign: "left", borderBottom: "2px solid #d4edda", fontSize: "0.72rem", textTransform: "uppercase", color: "#555", width: 80 }}>Dimension</th>
                        <th style={{ padding: "0.625rem 0.75rem", textAlign: "right", borderBottom: "2px solid #d4edda", fontSize: "0.72rem", textTransform: "uppercase", color: "#555", width: 90 }}>Unit Price</th>
                        <th style={{ padding: "0.625rem 0.75rem", textAlign: "center", borderBottom: "2px solid #d4edda", fontSize: "0.72rem", textTransform: "uppercase", color: "#555", width: 50 }}>Qty</th>
                        <th style={{ padding: "0.625rem 0.75rem", textAlign: "right", borderBottom: "2px solid #d4edda", fontSize: "0.72rem", textTransform: "uppercase", color: "#555", width: 100 }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(selectedOrder.items) && selectedOrder.items.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid #e8f5e9" }}>
                          <td style={{ padding: "0.75rem" }}>
                            {item.imageId ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={driveImageUrl(item.imageId)}
                                alt={item.title}
                                style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 6 }}
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                              />
                            ) : (
                              <div style={{ width: 44, height: 44, borderRadius: 6, background: "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center", color: "#4caf50", fontWeight: 700 }}>
                                {item.category?.charAt(0) || "C"}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: "0.75rem" }}><strong>{item.title}</strong></td>
                          <td style={{ padding: "0.75rem", fontSize: "0.8rem", color: "#666" }}>{item.size || "Standard"}</td>
                          <td style={{ padding: "0.75rem", textAlign: "right" }}>
                            {Number(item.discountPrice) > 0 ? (
                              <div>
                                <span style={{ textDecoration: "line-through", color: "#999", fontSize: "0.75rem" }}>Rs. {Number(item.originalPrice || 0).toLocaleString("en-LK")}.00</span>
                                <br />
                                <span style={{ color: "#1a5c2f", fontWeight: 700 }}>Rs. {Number(item.discountPrice).toLocaleString("en-LK")}.00</span>
                              </div>
                            ) : (
                              <span>Rs. {Number(item.price || 0).toLocaleString("en-LK")}.00</span>
                            )}
                          </td>
                          <td style={{ padding: "0.75rem", textAlign: "center" }}>{item.quantity}</td>
                          <td style={{ padding: "0.75rem", textAlign: "right", fontWeight: 700 }}>Rs. {(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString("en-LK")}.00</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "1rem" }}>
                  <div style={{ minWidth: 280, fontSize: "0.875rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "0.375rem 0", color: "#555" }}>
                      <span>Subtotal:</span>
                      <span>Rs. {Number(selectedOrder.subtotal || 0).toLocaleString("en-LK")}.00</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "0.375rem 0", borderBottom: "1px solid #d4edda", color: "#555" }}>
                      <span>Shipping &amp; Handling:</span>
                      <span>{Number(selectedOrder.shipping || 0) === 0 ? "FREE" : `Rs. ${Number(selectedOrder.shipping).toLocaleString("en-LK")}.00`}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 0", fontWeight: 800, fontSize: "1rem", color: "#1a5c2f" }}>
                      <span>Grand Total Due:</span>
                      <span>Rs. {Number(selectedOrder.total || 0).toLocaleString("en-LK")}.00</span>
                    </div>
                  </div>
                </div>

                <div style={{ background: "#f1f8f4", border: "1px solid #d4edda", borderRadius: 8, padding: "1rem", marginTop: "0.5rem" }}>
                  <h4 style={{ margin: "0 0 0.4rem", color: "#1a5c2f", fontSize: "0.85rem" }}>VIVANA COIR Statement:</h4>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "#555", lineHeight: 1.5 }}>{SHOP_CONFIG.invoiceStatement}</p>
                </div>
              </div>
            </div>

            <button
              className="no-print"
              onClick={() => window.print()}
              style={{
                display: "block",
                width: "calc(100% - 4rem)",
                margin: "0 2rem 1.5rem",
                padding: "0.875rem",
                background: "#1a5c2f",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontWeight: 700,
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              🖨️ PRINT INVOICE
            </button>
          </div>
        </div>
      )}

      {/* SHIPPING LABEL MODAL */}
      {modalType === "label" && selectedOrder && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              width: "100%",
              maxWidth: 480,
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <button
              className="no-print"
              onClick={() => { setModalType(null); setSelectedOrder(null); }}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "rgba(0,0,0,0.1)",
                border: "none",
                width: 32,
                height: 32,
                borderRadius: "50%",
                cursor: "pointer",
                fontSize: "1rem",
                zIndex: 1,
              }}
            >
              ✕
            </button>

            {/* Shipping Label */}
            <div id="printable-label" className="printable-doc">
              <div style={{ background: "#1a5c2f", color: "#fff", padding: "1rem 1.5rem", borderBottom: "3px solid #4caf50", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: "1rem", letterSpacing: "0.04em" }}>{SHOP_CONFIG.name}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "0.72rem", color: "#a5d6a7", letterSpacing: "0.08em", textTransform: "uppercase" }}>DOMESTIC COURIER</span>
                </div>
              </div>

              <div style={{ padding: "1.5rem" }}>
                <div style={{ marginBottom: "1rem", padding: "0.875rem", background: "#f1f8f4", borderRadius: 8, border: "1px solid #d4edda" }}>
                  <p style={{ margin: "0 0 0.25rem", fontSize: "0.7rem", color: "#4caf50", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>SENDER:</p>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: "0.9rem" }}>{SHOP_CONFIG.fullName}</p>
                  <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#555" }}>{SHOP_CONFIG.address}</p>
                  <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#555" }}>Tel: {SHOP_CONFIG.phone}</p>
                </div>

                <div style={{ padding: "0.875rem", border: "2px solid #1a5c2f", borderRadius: 8 }}>
                  <p style={{ margin: "0 0 0.25rem", fontSize: "0.7rem", color: "#4caf50", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>SHIP TO:</p>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: "1.1rem" }}>{selectedOrder.customerName}</p>
                  <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "#333" }}>{selectedOrder.address}</p>
                  <p style={{ margin: "4px 0 0", fontSize: "0.85rem", fontWeight: 700 }}>TEL: {selectedOrder.phone}</p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
                  <div style={{ padding: "0.875rem", background: "#1a5c2f", color: "#fff", borderRadius: 8, textAlign: "center" }}>
                    <p style={{ margin: "0 0 0.25rem", fontSize: "0.68rem", color: "#a5d6a7", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {(selectedOrder.paymentMethod || "").includes("COD") ? "COLLECT ON DELIVERY (COD)" : "PREPAID"}
                    </p>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: "1.25rem" }}>
                      {(selectedOrder.paymentMethod || "").includes("COD")
                        ? `Rs. ${Number(selectedOrder.total || 0).toLocaleString("en-LK")}.00`
                        : "Rs. 0.00"}
                    </p>
                  </div>

                  <div style={{ padding: "0.875rem", background: "#f1f8f4", borderRadius: 8, fontSize: "0.82rem" }}>
                    <p style={{ margin: "0 0 4px" }}><strong>REF:</strong> {selectedOrder.orderId}</p>
                    <p style={{ margin: "0 0 4px" }}><strong>DATE:</strong> {String(selectedOrder.createdAt || "").split(",")[0]}</p>
                    <p style={{ margin: 0 }}><strong>METHOD:</strong> {(selectedOrder.paymentMethod || "").includes("COD") ? "COD" : "PREPAID"}</p>
                  </div>
                </div>

                <div style={{ marginTop: "1rem", textAlign: "center", padding: "0.75rem", borderTop: "2px dashed #d4edda" }}>
                  <div style={{ height: 32, background: "repeating-linear-gradient(90deg, #1a5c2f 0px, #1a5c2f 3px, transparent 3px, transparent 6px)", borderRadius: 2, marginBottom: "0.4rem" }} />
                  <p style={{ margin: 0, fontFamily: "monospace", fontSize: "0.8rem", fontWeight: 700, color: "#1a5c2f" }}>*{selectedOrder.orderId}*</p>
                </div>
              </div>
            </div>

            <button
              className="no-print"
              onClick={() => window.print()}
              style={{
                display: "block",
                width: "calc(100% - 3rem)",
                margin: "0 1.5rem 1.5rem",
                padding: "0.875rem",
                background: "#2e7d32",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontWeight: 700,
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              🖨️ PRINT SHIPPING LABEL
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
