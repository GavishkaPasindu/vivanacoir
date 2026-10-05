"use client";

import React, { useState } from "react";
import { useCart } from "@/app/context/CartContext";
import { SHOP_CONFIG } from "@/app/lib/config";
import {
  getNextInvoiceNumber,
  formatInvoiceCode,
  getNextOrderRefNumber,
  formatOrderRef,
} from "@/app/lib/invoiceCounter";

// Try lh3 first, fallback via uc export
function driveImageUrl(fileId: string): string {
  return fileId ? `https://lh3.googleusercontent.com/d/${fileId}` : "";
}

interface FormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  paymentMethod: string;
}

export default function CartDrawer() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isCartOpen,
    setIsCartOpen,
    cartCount,
    cartSubtotal,
  } = useCart();

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    address: "",
    paymentMethod: "Cash on Delivery (COD)",
  });

  const SHIPPING_THRESHOLD = 15000;
  const SHIPPING_COST = 450;

  const hasWholesale = cart.some((item) => item.product.isWholesale);
  const hasOnlyWholesale = cart.every((item) => item.product.isWholesale);
  const shippingRemaining = SHIPPING_THRESHOLD - cartSubtotal;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const invoiceNum = getNextInvoiceNumber();
      const invoiceCode = formatInvoiceCode(invoiceNum);
      const orderRefNum = getNextOrderRefNumber();
      const orderRef = formatOrderRef(orderRefNum);
      const orderId = `#VCV-${orderRefNum}`;

      const shipping = hasOnlyWholesale ? 0 : shippingRemaining <= 0 ? 0 : SHIPPING_COST;
      const total = cartSubtotal + shipping;

      const orderItems = cart.map((item) => ({
        id: item.product.id,
        title: item.product.title,
        price:
          item.product.discountPrice && item.product.discountPrice > 0
            ? item.product.discountPrice
            : item.product.price,
        originalPrice: item.product.price,
        discountPrice: item.product.discountPrice || 0,
        quantity: item.quantity,
        size: item.selectedSize || "",
        imageId: item.product.imageId || "",
        category: item.product.category,
      }));

      const orderPayload = {
        orderId,
        invoiceCode,
        orderRef,
        customerName: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        paymentMethod: formData.paymentMethod,
        items: JSON.stringify(orderItems),
        subtotal: cartSubtotal,
        shipping,
        total,
        status: "processing",
        createdAt: new Date().toLocaleString("en-LK"),
      };

      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      if (formData.email) {
        await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            customerName: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            paymentMethod: formData.paymentMethod,
            items: orderItems.map((i) => ({
              title: i.title,
              size: i.size,
              quantity: i.quantity,
              price: i.price,
            })),
            subtotal: cartSubtotal,
            shipping,
            total,
            type: "inquiry",
          }),
        });
      }

      const successData = {
        orderId,
        invoiceCode,
        orderRef,
        customerName: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        paymentMethod: formData.paymentMethod,
        items: orderItems,
        subtotal: cartSubtotal,
        shipping,
        total,
        createdAt: new Date().toLocaleString("en-LK"),
      };

      sessionStorage.setItem("vivana_last_order", JSON.stringify(successData));
      clearCart();
      setCheckoutOpen(false);
      setIsCartOpen(false);
      window.location.href = "/shop/success";
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── CSS vars shorthand (matches globals.css tokens) ──────────────────────
  const P = "var(--color-primary)";       // #000B4D navy
  const A = "var(--color-accent)";        // #3B82F6 blue
  const PD = "var(--color-primary-dark)"; // #000529

  return (
    <>
      {/* Backdrop */}
      {isCartOpen && (
        <div
          onClick={() => setIsCartOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
            zIndex: 1000, backdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* Drawer */}
      <div style={{
        position: "fixed", top: 0, right: 0,
        width: "min(420px, 100vw)", height: "100vh",
        background: "#fff", zIndex: 1001,
        transform: isCartOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex", flexDirection: "column",
        boxShadow: "-8px 0 40px rgba(0,0,0,0.18)",
        fontFamily: "var(--font-body)",
      }}>

        {/* Header */}
        <div style={{
          background: P, color: "#fff",
          padding: "1.25rem 1.5rem",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: `3px solid ${A}`, flexShrink: 0,
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "var(--font-body)" }}>
              Your Cart
            </h2>
            <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#C4A882" }}>
              {cartCount} {cartCount === 1 ? "item" : "items"}
            </p>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            style={{
              background: "rgba(255,255,255,0.15)", border: "none",
              color: "#fff", width: 34, height: 34, cursor: "pointer",
              fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Shipping progress */}
        {!hasOnlyWholesale && cart.length > 0 && shippingRemaining > 0 && (
          <div style={{ padding: "0.7rem 1.5rem", background: "#eff6ff", borderBottom: "1px solid #bfdbfe", flexShrink: 0 }}>
            <p style={{ margin: "0 0 5px", fontSize: "0.78rem", color: "#1d4ed8", fontWeight: 600 }}>
              Add Rs. {shippingRemaining.toLocaleString("en-LK")} more for FREE shipping
            </p>
            <div style={{ height: 4, background: "#bfdbfe", borderRadius: 0 }}>
              <div style={{
                height: "100%", background: A, borderRadius: 0,
                width: `${Math.min((cartSubtotal / SHIPPING_THRESHOLD) * 100, 100)}%`,
                transition: "width 0.3s",
              }} />
            </div>
          </div>
        )}

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.5rem" }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 0", color: "#888" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🛒</div>
              <p style={{ fontWeight: 600, margin: 0 }}>Your cart is empty</p>
              <p style={{ fontSize: "0.82rem", margin: "0.4rem 0 0", color: "#aaa" }}>Browse products and add items</p>
            </div>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {cart.map((item) => {
                const price =
                  item.product.discountPrice && item.product.discountPrice > 0
                    ? item.product.discountPrice
                    : item.product.price;
                return (
                  <li key={`${item.product.id}-${item.selectedSize}`} style={{
                    display: "flex", gap: "0.75rem",
                    padding: "0.75rem", background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                  }}>
                    {/* Image */}
                    <div style={{ width: 64, height: 64, flexShrink: 0, overflow: "hidden", background: "#e2e8f0" }}>
                      {item.product.imageId ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={driveImageUrl(item.product.imageId)}
                          alt={item.product.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => {
                            const el = e.target as HTMLImageElement;
                            el.style.display = "none";
                            el.parentElement!.style.display = "flex";
                            el.parentElement!.style.alignItems = "center";
                            el.parentElement!.style.justifyContent = "center";
                            el.parentElement!.style.color = P;
                            el.parentElement!.style.fontWeight = "700";
                            el.parentElement!.style.fontSize = "1.25rem";
                            el.parentElement!.innerText = item.product.category?.charAt(0) || "C";
                          }}
                        />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: P, fontWeight: 700, fontSize: "1.25rem" }}>
                          {item.product.category?.charAt(0) || "C"}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: "0.84rem", color: "#0f172a", lineHeight: 1.3 }}>
                        {item.product.title}
                      </p>
                      <p style={{ margin: "2px 0", fontSize: "0.7rem", color: A, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {item.product.category}
                      </p>

                      {/* Qty + Remove */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.4rem" }}>
                        {[
                          { label: "−", action: () => updateQuantity(item.product.id, item.quantity - 1, item.selectedSize), disabled: item.quantity <= 1 },
                          { label: "+", action: () => updateQuantity(item.product.id, item.quantity + 1, item.selectedSize), disabled: item.quantity >= 99 },
                        ].map((btn, i) => (
                          <button
                            key={i}
                            onClick={btn.action}
                            disabled={btn.disabled}
                            style={{
                              width: 24, height: 24, border: `1px solid #cbd5e1`,
                              background: "#fff", cursor: btn.disabled ? "default" : "pointer",
                              fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center",
                              opacity: btn.disabled ? 0.4 : 1,
                            }}
                          >
                            {i === 0 ? "−" : "+"}
                          </button>
                        ))}
                        <span style={{ fontSize: "0.84rem", fontWeight: 700, minWidth: 20, textAlign: "center" }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                          style={{ marginLeft: "auto", background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600 }}
                        >
                          Remove
                        </button>
                      </div>

                      {/* Price */}
                      <div style={{ marginTop: "0.35rem" }}>
                        {item.product.isWholesale ? (
                          <span style={{ fontSize: "0.78rem", color: "#92400e", fontWeight: 700 }}>Price on Request</span>
                        ) : (
                          <span style={{ fontSize: "0.88rem", fontWeight: 800, color: P }}>
                            Rs. {(price * item.quantity).toLocaleString("en-LK")}.00
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer totals + CTA */}
        {cart.length > 0 && (
          <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #e2e8f0", flexShrink: 0, background: "#fff" }}>
            {!hasOnlyWholesale && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.4rem", color: "#475569" }}>
                  <span>Subtotal</span>
                  <span>Rs. {cartSubtotal.toLocaleString("en-LK")}.00</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.4rem", color: "#475569" }}>
                  <span>Shipping</span>
                  <span style={{ color: shippingRemaining <= 0 ? "#16a34a" : "#475569", fontWeight: shippingRemaining <= 0 ? 700 : 400 }}>
                    {shippingRemaining <= 0 ? "FREE" : `Rs. ${SHIPPING_COST}.00`}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "1rem", padding: "0.6rem 0", borderTop: "1px solid #e2e8f0", color: P }}>
                  <span>Total Estimate</span>
                  <span>Rs. {(cartSubtotal + (shippingRemaining <= 0 ? 0 : SHIPPING_COST)).toLocaleString("en-LK")}.00</span>
                </div>
                {hasWholesale && (
                  <p style={{ fontSize: "0.72rem", color: "#92400e", margin: "0.25rem 0 0", textAlign: "center" }}>
                    * Wholesale items excluded from estimate
                  </p>
                )}
              </>
            )}

            <button
              onClick={() => setCheckoutOpen(true)}
              style={{
                width: "100%", padding: "0.875rem", marginTop: "0.75rem",
                background: P, color: "#fff", border: "none",
                fontWeight: 700, fontSize: "0.875rem", cursor: "pointer",
                textTransform: "uppercase", letterSpacing: "0.06em",
                fontFamily: "var(--font-body)",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = PD)}
              onMouseLeave={(e) => (e.currentTarget.style.background = P)}
            >
              Submit Inquiry
            </button>
            <button
              onClick={() => setIsCartOpen(false)}
              style={{
                width: "100%", padding: "0.65rem", marginTop: "0.5rem",
                background: "transparent", color: P,
                border: `1px solid ${P}`,
                fontWeight: 600, fontSize: "0.82rem", cursor: "pointer",
                fontFamily: "var(--font-body)",
              }}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>

      {/* ─── Checkout Modal ────────────────────────────────────────────────── */}
      {checkoutOpen && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
          zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center",
          padding: "1rem",
        }}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff", width: "100%", maxWidth: 480,
              maxHeight: "90vh", overflowY: "auto",
              position: "relative", padding: "2rem",
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
              fontFamily: "var(--font-body)",
            }}
          >
            {/* Close */}
            <button
              onClick={() => setCheckoutOpen(false)}
              style={{
                position: "absolute", top: "1rem", right: "1rem",
                background: "#f1f5f9", border: "none", width: 30, height: 30,
                cursor: "pointer", fontSize: "0.9rem",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >✕</button>

            <form onSubmit={handleCheckoutSubmit}>
              {/* Title */}
              <div style={{ borderBottom: `3px solid ${A}`, paddingBottom: "1rem", marginBottom: "1.5rem" }}>
                <h3 style={{ margin: 0, fontSize: "1.2rem", color: P, fontFamily: "var(--font-heading)", fontWeight: 700 }}>
                  Submit Inquiry
                </h3>
                <p style={{ margin: "0.35rem 0 0", fontSize: "0.82rem", color: "#475569" }}>
                  Our team will confirm stock and arrange delivery via Email or WhatsApp.
                </p>
              </div>

              {/* Fields */}
              {([
                { label: "Full Name *", id: "name", type: "text", placeholder: "Enter your full name", field: "name" },
                { label: "Phone Number *", id: "phone", type: "tel", placeholder: "e.g. +94 77 123 4567", field: "phone" },
                { label: "Email Address *", id: "email", type: "email", placeholder: "e.g. customer@example.com", field: "email" },
              ] as { label: string; id: string; type: string; placeholder: string; field: keyof FormData }[]).map(({ label, id, type, placeholder, field }) => (
                <div key={id} style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.35rem", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {label}
                  </label>
                  <input
                    type={type} id={id} required
                    value={formData[field]}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    placeholder={placeholder}
                    style={{
                      width: "100%", padding: "0.65rem 0.875rem",
                      border: "1px solid #cbd5e1", fontSize: "0.875rem",
                      outline: "none", fontFamily: "var(--font-body)",
                      boxSizing: "border-box",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = A)}
                    onBlur={(e) => (e.target.style.borderColor = "#cbd5e1")}
                  />
                </div>
              ))}

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.35rem", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Delivery Address *
                </label>
                <textarea
                  id="address" required rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter full delivery address"
                  style={{
                    width: "100%", padding: "0.65rem 0.875rem",
                    border: "1px solid #cbd5e1", fontSize: "0.875rem",
                    resize: "vertical", outline: "none",
                    fontFamily: "var(--font-body)", boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = A)}
                  onBlur={(e) => (e.target.style.borderColor = "#cbd5e1")}
                />
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.35rem", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Payment Method
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  style={{
                    width: "100%", padding: "0.65rem 0.875rem",
                    border: "1px solid #cbd5e1", fontSize: "0.875rem",
                    background: "#fff", outline: "none", fontFamily: "var(--font-body)",
                  }}
                >
                  <option>Cash on Delivery (COD)</option>
                  <option>Bank Transfer</option>
                  <option>Online Payment</option>
                </select>
              </div>

              {/* Total box */}
              <div style={{
                background: "#eff6ff", border: `1px solid #bfdbfe`,
                padding: "0.875rem 1rem", marginBottom: "1.25rem",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1e40af" }}>
                  {hasOnlyWholesale ? "Wholesale Total:" : "Estimated Total:"}
                </span>
                <strong style={{ color: P, fontSize: "1rem" }}>
                  {hasOnlyWholesale
                    ? "Price on Request"
                    : `Rs. ${(cartSubtotal + (shippingRemaining <= 0 ? 0 : SHIPPING_COST)).toLocaleString("en-LK")}.00`}
                </strong>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: "100%", padding: "0.9rem",
                  background: isSubmitting ? "#94a3b8" : P,
                  color: "#fff", border: "none",
                  fontWeight: 700, fontSize: "0.875rem", cursor: isSubmitting ? "not-allowed" : "pointer",
                  textTransform: "uppercase", letterSpacing: "0.06em",
                  fontFamily: "var(--font-body)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                }}
              >
                {isSubmitting && (
                  <span style={{
                    width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff", borderRadius: "50%",
                    animation: "cart-spin 0.6s linear infinite", display: "inline-block",
                  }} />
                )}
                {isSubmitting ? "Submitting…" : "Submit Inquiry"}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`@keyframes cart-spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
