"use client";

import { useState } from "react";
import Link from "next/link";

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="mobile-menu-btn"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        <span className={`hamburger-line ${open ? "open-top" : ""}`} />
        <span className={`hamburger-line ${open ? "open-mid" : ""}`} />
        <span className={`hamburger-line ${open ? "open-bot" : ""}`} />
      </button>

      {open && (
        <div className="mobile-nav-overlay" onClick={() => setOpen(false)}>
          <div className="mobile-nav-drawer" onClick={e => e.stopPropagation()}>
            <div className="mobile-nav-header">
              <span className="mobile-nav-brand">VIVANA HOLDINGS</span>
              <button className="mobile-nav-close" onClick={() => setOpen(false)}>✕</button>
            </div>
            <nav className="mobile-nav-links">
              <Link href="/" className="mobile-nav-link" onClick={() => setOpen(false)}>🏠 Home</Link>
              <Link href="/about" className="mobile-nav-link" onClick={() => setOpen(false)}>🏭 About Us</Link>
              <Link href="/products" className="mobile-nav-link" onClick={() => setOpen(false)}>📦 Products</Link>
              <Link href="/shop" className="mobile-nav-link" onClick={() => setOpen(false)}>🛒 Shop Online</Link>
              <Link href="/contact" className="mobile-nav-link" onClick={() => setOpen(false)}>📞 Contact</Link>
              <Link href="/quote" className="mobile-nav-link mobile-nav-cta" onClick={() => setOpen(false)}>✉️ Get A Quote</Link>
            </nav>
            <div className="mobile-nav-footer">
              <a href="https://wa.me/94776619006" target="_blank" rel="noopener noreferrer" className="mobile-wa-btn">
                💬 Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
