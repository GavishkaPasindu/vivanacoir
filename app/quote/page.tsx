"use client";

import { useState } from "react";
import Link from "next/link";

export default function QuotePage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    products: "",
    message: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/send-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "Failed to send request. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", padding: "120px 20px 80px" }}>
      <div className="container" style={{ maxWidth: "800px", margin: "0 auto" }}>
        
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2.5rem", color: "var(--color-primary)", marginBottom: "1rem" }}>
            Request a Quote
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto" }}>
            Tell us what you need and our export sales team will get back to you with competitive pricing and shipping details.
          </p>
        </div>

        {success ? (
          <div style={{ 
            background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "3rem 2rem", 
            borderRadius: "12px", textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
          }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎉</div>
            <h2 style={{ color: "#065f46", marginBottom: "1rem" }}>Request Sent Successfully!</h2>
            <p style={{ color: "#047857", marginBottom: "2rem", fontSize: "1.1rem" }}>
              Thank you for reaching out, {formData.name}. We have received your inquiry and will contact you via email shortly.
            </p>
            <Link href="/" style={{
              display: "inline-block", padding: "0.75rem 2rem", background: "var(--color-primary)", 
              color: "white", textDecoration: "none", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em"
            }}>
              Return Home
            </Link>
          </div>
        ) : (
          <div style={{ background: "white", padding: "3rem", borderRadius: "12px", boxShadow: "0 10px 40px rgba(0,0,0,0.05)" }}>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem" }}>
                <div style={{ flex: "1 1 300px" }}>
                  <label style={labelStyle}>Full Name *</label>
                  <input required type="text" name="name" value={formData.name} onChange={handleChange} style={inputStyle} placeholder="John Doe" />
                </div>
                <div style={{ flex: "1 1 300px" }}>
                  <label style={labelStyle}>Email Address *</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle} placeholder="john@company.com" />
                </div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem" }}>
                <div style={{ flex: "1 1 300px" }}>
                  <label style={labelStyle}>Phone / WhatsApp</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} style={inputStyle} placeholder="+1 234 567 8900" />
                </div>
                <div style={{ flex: "1 1 300px" }}>
                  <label style={labelStyle}>Country of Destination</label>
                  <input type="text" name="country" value={formData.country} onChange={handleChange} style={inputStyle} placeholder="e.g. United Kingdom" />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Products Needed (Quantities & Sizes) *</label>
                <textarea required name="products" value={formData.products} onChange={handleChange} style={{ ...inputStyle, minHeight: "120px", resize: "vertical" }} placeholder="E.g. 5 Pallets of 5kg Coco Peat Blocks&#10;2 Containers of Coir Fibre" />
              </div>

              <div>
                <label style={labelStyle}>Additional Details or Questions</label>
                <textarea name="message" value={formData.message} onChange={handleChange} style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }} placeholder="Port of delivery, packaging requirements, timeline..." />
              </div>

              {error && (
                <div style={{ background: "#fee2e2", color: "#991b1b", padding: "1rem", borderRadius: "4px", fontSize: "0.9rem" }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} style={{
                marginTop: "1rem", padding: "1rem", background: "var(--color-primary)", color: "white",
                border: "none", fontSize: "1rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                textTransform: "uppercase", letterSpacing: "0.05em", opacity: loading ? 0.7 : 1, transition: "0.3s"
              }}>
                {loading ? "Sending Request..." : "Submit Quote Request"}
              </button>

            </form>

            <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid #e2e8f0", textAlign: "center" }}>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", marginBottom: "1rem" }}>Prefer direct contact?</p>
              <div style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap" }}>
                <a href="mailto:vivanacoir@gmail.com" style={contactLinkStyle}>
                  ✉️ vivanacoir@gmail.com
                </a>
                <a href="https://wa.me/94777123456" target="_blank" rel="noopener noreferrer" style={contactLinkStyle}>
                  💬 WhatsApp Us
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: "0.85rem",
  fontWeight: 700,
  color: "var(--color-primary)",
  marginBottom: "0.5rem",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em"
};

const inputStyle = {
  width: "100%",
  padding: "0.875rem",
  border: "1px solid #cbd5e1",
  borderRadius: "0",
  fontSize: "1rem",
  fontFamily: "inherit",
  backgroundColor: "#f8fafc",
  transition: "border-color 0.2s"
};

const contactLinkStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  color: "var(--color-primary)",
  textDecoration: "none",
  fontWeight: 600,
  padding: "0.5rem 1rem",
  background: "#f1f5f9",
  borderRadius: "20px",
  fontSize: "0.9rem"
};
