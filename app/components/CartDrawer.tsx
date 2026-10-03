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
        price: item.product.discountPrice && item.product.discountPrice > 0
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

      // Submit order to Google Sheets
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      // Send confirmation email
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
            items: orderItems.map((item) => ({
              title: item.title,
              size: item.size,
              quantity: item.quantity,
              price: item.price,
            })),
            subtotal: cartSubtotal,
            shipping,
            total,
            type: "inquiry",
          }),
        });
      }

      // Build success page data and redirect
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

  return (
    <>
      {/* Backdrop */}
      {isCartOpen && (
        <div
          onClick={() => setIsCartOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 1000,
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "min(420px, 100vw)",
          height: "100vh",
          background: "#fff",
          zIndex: 1001,
          transform: isCartOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.15)",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "#1a5c2f",
            color: "#fff",
            padding: "1.25rem 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "3px solid #4caf50",
            flexShrink: 0,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, letterSpacing: "0.05em" }}>
              YOUR CART
            </h2>
            <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#a5d6a7" }}>
              {cartCount} {cartCount === 1 ? "item" : "items"}
            </p>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "none",
              color: "#fff",
              width: 36,
              height: 36,
              borderRadius: "50%",
              cursor: "pointer",
              fontSize: "1.2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Shipping Progress */}
        {!hasOnlyWholesale && cart.length > 0 && shippingRemaining > 0 && (
          <div style={{ padding: "0.75rem 1.5rem", background: "#f1f8f4", borderBottom: "1px solid #d4edda", flexShrink: 0 }}>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "#2e7d32" }}>
              Add Rs. {shippingRemaining.toLocaleString("en-LK")} more for FREE shipping!
            </p>
            <div style={{ height: 4, background: "#d4edda", borderRadius: 2, marginTop: 6 }}>
              <div
                style={{
                  height: "100%",
                  background: "#4caf50",
                  borderRadius: 2,
                  width: `${Math.min((cartSubtotal / SHIPPING_THRESHOLD) * 100, 100)}%`,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.5rem" }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 0", color: "#888" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🛒</div>
              <p style={{ margin: 0, fontWeight: 600 }}>Your cart is empty</p>
              <p style={{ margin: "0.5rem 0 0", fontSize: "0.85rem" }}>Add products to get started</p>
            </div>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
              {cart.map((item) => {
                const price =
                  item.product.discountPrice && item.product.discountPrice > 0
                    ? item.product.discountPrice
                    : item.product.price;

                return (
                  <li
                    key={`${item.product.id}-${item.selectedSize}`}
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      padding: "0.75rem",
                      background: "#f9fafb",
                      borderRadius: 8,
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    {/* Product Image */}
                    <div style={{ width: 64, height: 72, flexShrink: 0, borderRadius: 6, overflow: "hidden", background: "#e8f5e9" }}>
                      {item.product.imageId ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={driveImageUrl(item.product.imageId)}
                          alt={item.product.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#4caf50", fontWeight: 700, fontSize: "1.2rem" }}>
                          {item.product.category?.charAt(0) || "P"}
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: "0.85rem", color: "#111", lineHeight: 1.3 }}>
                        {item.product.title}
                      </p>
                      {item.selectedSize && (
                        <p style={{ margin: "2px 0", fontSize: "0.75rem", color: "#666" }}>Size: {item.selectedSize}</p>
                      )}
                      <p style={{ margin: "2px 0", fontSize: "0.75rem", color: "#1a5c2f", fontWeight: 600 }}>
                        {item.product.category}
                      </p>

                      {/* Quantity Controls */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedSize)}
                          disabled={item.quantity <= 1}
                          style={{
                            width: 24, height: 24, borderRadius: 4, border: "1px solid #d1d5db",
                            background: "#fff", cursor: "pointer", fontSize: "0.9rem", display: "flex",
                            alignItems: "center", justifyContent: "center",
                          }}
                        >
                          -
                        </button>
                        <span style={{ fontSize: "0.85rem", fontWeight: 600, minWidth: 20, textAlign: "center" }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedSize)}
                          disabled={item.quantity >= 99}
                          style={{
                            width: 24, height: 24, borderRadius: 4, border: "1px solid #d1d5db",
                            background: "#fff", cursor: "pointer", fontSize: "0.9rem", display: "flex",
                            alignItems: "center", justifyContent: "center",
                          }}
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                          style={{
                            marginLeft: "auto", background: "none", border: "none",
                            color: "#ef4444", cursor: "pointer", fontSize: "0.8rem",
                          }}
                        >
                          Remove
                        </button>
                      </div>

                      {/* Price */}
                      <div style={{ marginTop: "0.4rem" }}>
                        {item.product.isWholesale ? (
                          <span style={{ fontSize: "0.8rem", color: "#92400e", fontWeight: 600 }}>Price on Request</span>
                        ) : (
                          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1a5c2f" }}>
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

        {/* Footer */}
        {cart.length > 0 && (
          <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #e5e7eb", flexShrink: 0, background: "#fff" }}>
            {hasOnlyWholesale ? (
              <div style={{ padding: "0.75rem 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>Wholesale Inquiry</span>
                <span style={{ color: "#92400e", fontWeight: 700 }}>Price on Request</span>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                  <span>Subtotal</span>
                  <span>Rs. {cartSubtotal.toLocaleString("en-LK")}.00</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                  <span>Shipping</span>
                  <span style={{ color: shippingRemaining <= 0 ? "#2e7d32" : "#111", fontWeight: shippingRemaining <= 0 ? 700 : 400 }}>
                    {shippingRemaining <= 0 ? "FREE" : `Rs. ${SHIPPING_COST}.00`}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "1rem", padding: "0.5rem 0", borderTop: "1px solid #e5e7eb" }}>
                  <span>Total Estimate</span>
                  <span>Rs. {(cartSubtotal + (shippingRemaining <= 0 ? 0 : SHIPPING_COST)).toLocaleString("en-LK")}.00</span>
                </div>
                {hasWholesale && (
                  <p style={{ fontSize: "0.75rem", color: "#92400e", margin: "0.5rem 0 0", textAlign: "center" }}>
                    * Wholesale items excluded from estimate.
                  </p>
                )}
              </>
            )}

            <button
              onClick={() => setCheckoutOpen(true)}
              style={{
                width: "100%",
                padding: "0.9rem",
                marginTop: "0.75rem",
                background: "#1a5c2f",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: "0.95rem",
                cursor: "pointer",
                letterSpacing: "0.05em",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#145024")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#1a5c2f")}
            >
              SUBMIT INQUIRY
            </button>
            <button
              onClick={() => setIsCartOpen(false)}
              style={{
                width: "100%",
                padding: "0.7rem",
                marginTop: "0.5rem",
                background: "transparent",
                color: "#1a5c2f",
                border: "1px solid #1a5c2f",
                borderRadius: 8,
                fontWeight: 600,
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {checkoutOpen && (
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
              padding: "2rem",
              width: "100%",
              maxWidth: 480,
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setCheckoutOpen(false)}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "#f3f4f6",
                border: "none",
                width: 32,
                height: 32,
                borderRadius: "50%",
                cursor: "pointer",
                fontSize: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>

            <form onSubmit={handleCheckoutSubmit}>
              <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.25rem", color: "#1a5c2f" }}>
                Submit Inquiry
              </h3>
              <p style={{ margin: "0 0 1.5rem", fontSize: "0.85rem", color: "#666" }}>
                Leave your details and our team will contact you via Email and WhatsApp to arrange payment and delivery.
              </p>

              {[
                { label: "Full Name *", id: "name", type: "text", placeholder: "Enter your full name", field: "name" as const },
                { label: "Phone Number *", id: "phone", type: "tel", placeholder: "e.g. +94 77 123 4567", field: "phone" as const },
                { label: "Email Address *", id: "email", type: "email", placeholder: "e.g. customer@example.com", field: "email" as const },
              ].map(({ label, id, type, placeholder, field }) => (
                <div key={id} style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#374151" }}>
                    {label}
                  </label>
                  <input
                    type={type}
                    id={id}
                    required
                    value={formData[field]}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    placeholder={placeholder}
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.875rem",
                      border: "1px solid #d1d5db",
                      borderRadius: 8,
                      fontSize: "0.9rem",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              ))}

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#374151" }}>
                  Delivery Address *
                </label>
                <textarea
                  id="address"
                  required
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter full delivery address"
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.875rem",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    fontSize: "0.9rem",
                    resize: "vertical",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#374151" }}>
                  Payment Method
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.875rem",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    fontSize: "0.9rem",
                    background: "#fff",
                    outline: "none",
                  }}
                >
                  <option>Cash on Delivery (COD)</option>
                  <option>Bank Transfer</option>
                  <option>Online Payment</option>
                </select>
              </div>

              {/* Total */}
              <div
                style={{
                  background: "#f1f8f4",
                  border: "1px solid #d4edda",
                  borderRadius: 8,
                  padding: "0.875rem 1rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.25rem",
                }}
              >
                <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                  {hasOnlyWholesale ? "Wholesale Total:" : "Total Amount Due:"}
                </span>
                <strong style={{ color: "#1a5c2f", fontSize: "1rem" }}>
                  {hasOnlyWholesale
                    ? "Price on Request"
                    : `Rs. ${(cartSubtotal + (shippingRemaining <= 0 ? 0 : SHIPPING_COST)).toLocaleString("en-LK")}.00`}
                </strong>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  padding: "0.9rem",
                  background: isSubmitting ? "#9ca3af" : "#1a5c2f",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  letterSpacing: "0.05em",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                {isSubmitting && (
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      animation: "spin 0.6s linear infinite",
                    }}
                  />
                )}
                {isSubmitting ? "SUBMITTING..." : "SUBMIT INQUIRY"}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
