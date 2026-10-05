import type { Metadata } from 'next';
import './globals.css';
import { MapPin, Mail } from 'lucide-react';
import Link from 'next/link';
import { CartProvider } from './context/CartContext';
import MobileNav from './components/MobileNav';

export const metadata: Metadata = {
  title: 'VIVANA COIR PRODUCTS EXPORT | Sri Lanka',
  description: 'Leading Exporter & Manufacturer of Coco Peat and Coir Fibre Products from Sri Lanka.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
        <nav className="navbar">
          <div className="container nav-container">
            <Link href="/" className="logo">
              <img src="/logo.png" alt="VIVANA HOLDINGS" className="logo-img" />
              <span className="logo-text">VIVANA HOLDINGS</span>
            </Link>
            <div className="nav-links">
              <Link href="/" className="nav-link">Home</Link>
              <Link href="/about" className="nav-link">About Us</Link>
              <Link href="/products" className="nav-link">Products</Link>
              <Link href="/shop" className="nav-link">Shop Online</Link>
              <Link href="/contact" className="nav-link">Contact</Link>
              <Link href="/quote" className="nav-cta">Get A Quote</Link>
            </div>
            {/* Mobile hamburger */}
            <MobileNav />
          </div>
        </nav>

        <main>{children}</main>

        <footer className="footer" id="contact">
          <div className="container">
            <div className="footer-grid">
              <div>
                <div className="footer-brand">VIVANA HOLDINGS</div>
                <p className="footer-desc">
                  Providing premium eco-friendly coir products and substrates directly from the heart of Sri Lanka's coconut triangle.
                </p>
              </div>
              
              <div>
                <h4 className="footer-heading">Quick Links</h4>
                <ul className="footer-links">
                  <li><Link href="/">Home</Link></li>
                  <li><a href="/#about">About Us</a></li>
                  <li><Link href="/products">Our Products</Link></li>
                  <li><Link href="/contact">Contact Us</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="footer-heading">Our Range</h4>
                <ul className="footer-links">
                  <li><Link href="/products">Growing Media</Link></li>
                  <li><Link href="/products">Coir Fibre</Link></li>
                  <li><Link href="/products">Coconut Husk Powder</Link></li>
                  <li><Link href="/products">Geotextiles</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="footer-heading">Our Office</h4>
                <ul className="footer-contact">
                  <li>
                    <MapPin size={18} style={{flexShrink: 0}} />
                    <span>
                      Weheragalawaththa, Kahandawa,<br />
                      Ranna, Hambantota District,<br />
                      Sri Lanka
                    </span>
                  </li>
                  <li>
                    <Mail size={18} style={{flexShrink: 0}} />
                    <a href="mailto:vivanacoir@gmail.com">vivanacoir@gmail.com</a>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="footer-bottom">
              <p>&copy; {new Date().getFullYear()} VIVANA COIR PRODUCTS EXPORT. All Rights Reserved.</p>
            </div>
          </div>
        </footer>

        {/* WhatsApp Floating Button */}
        <a
          href="https://wa.me/94762520583"
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-float"
          aria-label="Chat on WhatsApp"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.553 4.103 1.522 5.828L.063 23.637a.5.5 0 0 0 .621.621l5.844-1.458A11.953 11.953 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.883 0-3.646-.518-5.155-1.419l-.369-.221-3.826.955.974-3.77-.239-.386A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
          </svg>
        </a>
        </CartProvider>
      </body>
    </html>
  );
}
