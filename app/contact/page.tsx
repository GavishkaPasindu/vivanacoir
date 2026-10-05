"use client";

import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
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
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          country: "",
          products: formData.subject,
          message: formData.message,
        }),
      });
      if (res.ok) { setSuccess(true); }
      else { const d = await res.json(); setError(d.error || "Failed to send. Please try again."); }
    } catch { setError("An unexpected error occurred."); }
    finally { setLoading(false); }
  };

  return (
    <div className="contact-page">
      {/* Hero Banner */}
      <div className="contact-hero">
        <div className="container">
          <span className="section-label" style={{ color: "#C4A882" }}>We&apos;d love to hear from you</span>
          <h1 className="contact-hero-title">Contact Us</h1>
          <p className="contact-hero-sub">
            Reach out for export inquiries, product questions, or partnership opportunities.
          </p>
        </div>
      </div>

      <div className="container contact-body">

        {/* Info Cards Row */}
        <div className="contact-cards">
          <a href="https://wa.me/94762520583" target="_blank" rel="noopener noreferrer" className="contact-card contact-card-wa">
            <div className="contact-card-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.553 4.103 1.522 5.828L.063 23.637a.5.5 0 0 0 .621.621l5.844-1.458A11.953 11.953 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.883 0-3.646-.518-5.155-1.419l-.369-.221-3.826.955.974-3.77-.239-.386A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
            </div>
            <h3>WhatsApp</h3>
            <p>+94 76 252 0583</p>
            <span className="contact-card-action">Chat Now →</span>
          </a>

          <a href="mailto:vivanacoir@gmail.com" className="contact-card contact-card-email">
            <div className="contact-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </div>
            <h3>Email Us</h3>
            <p>vivanacoir@gmail.com</p>
            <span className="contact-card-action">Send Email →</span>
          </a>

          <div className="contact-card contact-card-address">
            <div className="contact-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
                <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <h3>Visit Us</h3>
            <p>Weheragalawaththa, Kahandawa, Ranna, Hambantota, Sri Lanka</p>
            <span className="contact-card-action">Get Directions →</span>
          </div>
        </div>

        {/* Form + Map Grid */}
        <div className="contact-main-grid">

          {/* Contact Form */}
          <div className="contact-form-wrap">
            <h2 className="contact-section-title">Send us a Message</h2>
            {success ? (
              <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "2rem", textAlign: "center", borderRadius: "8px" }}>
                <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>✅</div>
                <h3 style={{ color: "#065f46" }}>Message Sent!</h3>
                <p style={{ color: "#047857" }}>Thank you {formData.name}. We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="contact-form-row">
                  <div className="contact-form-field">
                    <label className="contact-label">Full Name *</label>
                    <input required type="text" name="name" value={formData.name} onChange={handleChange} className="contact-input" placeholder="John Doe" />
                  </div>
                  <div className="contact-form-field">
                    <label className="contact-label">Email Address *</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleChange} className="contact-input" placeholder="john@example.com" />
                  </div>
                </div>
                <div className="contact-form-row">
                  <div className="contact-form-field">
                    <label className="contact-label">Phone / WhatsApp</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="contact-input" placeholder="+1 234 567 890" />
                  </div>
                  <div className="contact-form-field">
                    <label className="contact-label">Subject</label>
                    <input type="text" name="subject" value={formData.subject} onChange={handleChange} className="contact-input" placeholder="e.g. Coco Peat Export Inquiry" />
                  </div>
                </div>
                <div className="contact-form-field" style={{ gridColumn: "1 / -1" }}>
                  <label className="contact-label">Message *</label>
                  <textarea required name="message" value={formData.message} onChange={handleChange} className="contact-input" style={{ minHeight: "140px", resize: "vertical" }} placeholder="Tell us what you need..." />
                </div>
                {error && <p style={{ color: "#dc2626", background: "#fee2e2", padding: "0.75rem", fontSize: "0.875rem" }}>{error}</p>}
                <button type="submit" disabled={loading} className="contact-submit-btn">
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>

          {/* Map */}
          <div className="contact-map-wrap">
            <h2 className="contact-section-title">Find Our Factory</h2>
            <div className="contact-map-frame">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3969.0!2d80.9!3d6.05!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae45c7e5e5e5e5e%3A0x0!2sRanna%2C%20Hambantota%20District%2C%20Sri%20Lanka!5e0!3m2!1sen!2sus!4v1696000000000!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Vivana Holdings Location"
              />
            </div>
            <div className="contact-map-info">
              <p><strong>🕐 Business Hours:</strong></p>
              <p>Monday – Friday: 8:00 AM – 5:00 PM (IST)</p>
              <p>Saturday: 8:00 AM – 12:00 PM</p>
              <p style={{ marginTop: "0.75rem" }}><strong>📦 Export Inquiries:</strong> Responded within 24 hours</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
