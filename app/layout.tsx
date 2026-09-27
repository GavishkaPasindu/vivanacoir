import type { Metadata } from 'next';
import './globals.css';
import { Leaf, MapPin, Mail, Phone, ChevronRight } from 'lucide-react';
import Link from 'next/link';

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
        <nav className="navbar">
          <div className="container nav-container">
            <Link href="/" className="logo">
              <img src="/logo.png" alt="VIVANA HOLDINGS" style={{ height: '50px', width: 'auto' }} />
            </Link>
            <div className="nav-links">
              <Link href="/" className="nav-link">Home</Link>
              <Link href="/#about" className="nav-link">About Us</Link>
              <Link href="/products" className="nav-link">Products</Link>
              <Link href="/#contact" className="nav-link">Contact</Link>
              <Link href="/#quote" className="nav-cta">Get A Quote</Link>
            </div>
          </div>
        </nav>

        <main>{children}</main>

        <footer className="footer" id="contact">
          <div className="container">
            <div className="footer-grid">
              <div>
                <div className="footer-brand">VIVANA COIR</div>
                <p className="footer-desc">
                  Providing premium eco-friendly coir products and substrates directly from the heart of Sri Lanka's coconut triangle.
                </p>
              </div>
              
              <div>
                <h4 className="footer-heading">Quick Links</h4>
                <ul className="footer-links">
                  <li><Link href="/">Home</Link></li>
                  <li><Link href="/#about">About Us</Link></li>
                  <li><Link href="/products">Our Products</Link></li>
                  <li><Link href="/#contact">Contact Us</Link></li>
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
              <p>&copy; {new Date().getFullYear()} VIVANA COIR PRODUCTS EXPORT (PVT) LTD. All Rights Reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
