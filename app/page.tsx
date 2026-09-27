import { ArrowRight, Globe, Leaf, Award, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        {/* Placeholder for video or high quality background */}
        <img 
          src="/hero_bg.jpg" 
          alt="Coir Plantation" 
          className="hero-video-bg"
        />
        <div className="hero-overlay"></div>
        <div className="container hero-content">
          <span className="hero-subtitle">VIVANA COIR PRODUCTS EXPORT</span>
          <h1 className="hero-title">
            Exporting Premium Coir & Coco Peat Worldwide
          </h1>
          <p className="hero-desc">
            Based in the lush coconut triangle of Sri Lanka, we manufacture and export world-class, eco-friendly growing media and coir fibre solutions.
          </p>
          <div className="hero-actions">
            <Link href="/products" className="btn btn-primary">
              Our Products
            </Link>
            <Link href="#contact" className="btn btn-outline">
              Get A Quote
            </Link>
          </div>
        </div>
      </section>

      {/* Intro Bar */}
      <div style={{ backgroundColor: 'var(--color-primary-dark)', padding: '1.5rem 0', color: 'white' }}>
        <div className="container text-center" style={{ fontSize: '1.125rem', fontWeight: 500 }}>
          VIVANA COIR is an export company specially designed for those looking for high-quality unique products from Sri Lanka.
        </div>
      </div>

      {/* About Us Section */}
      <section className="section" id="about">
        <div className="container">
          <div className="about-grid">
            <div className="about-image">
              <img 
                src="/about_factory.jpg" 
                alt="Our Factory" 
              />
              <div className="about-badge">
                <div className="about-badge-num">10+</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.05em' }}>YEARS OF EXCELLENCE</div>
              </div>
            </div>
            
            <div>
              <span className="section-label">About Us</span>
              <h2 className="section-title">Get to know our company</h2>
              <p className="about-text">
                VIVANA COIR PRODUCTS EXPORT (PVT) LTD, a leading company in coir-based products like coco peat, is widely recognized in the global industry. Located in the heart of Sri Lanka's renowned coconut triangle in the Hambantota District (Weheragalawaththa, Kahandawa, Ranna), we excel in the manufacture of high-quality coir fibre and pith products.
              </p>
              <p className="about-text">
                Under the visionary leadership of <strong>Mr. Rathnayaka Geegana Arachchige Lakmal Sampath</strong>, Vivana Coir has established itself as a trusted partner committed to sustainable practices and delivering unparalleled quality to our global partners.
              </p>
              <Link href="/products" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                View Our Range <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section section-alt">
        <div className="container">
          <div className="text-center mb-8">
            <span className="section-label">Why Choose Us</span>
            <h2 className="section-title">Setting the Standard in Natural Coir Exports</h2>
          </div>
          
          <div className="feature-list">
            <div className="feature-item">
              <Award size={40} className="feature-icon" />
              <div>
                <h3 className="feature-title">Uncompromising Quality</h3>
                <p className="feature-desc">Unwavering quality: strict control measures ensure products meet the highest customer standards globally.</p>
              </div>
            </div>
            <div className="feature-item">
              <Leaf size={40} className="feature-icon" />
              <div>
                <h3 className="feature-title">Innovative Solutions</h3>
                <p className="feature-desc">Innovative, eco-friendly coir products: modern machinery and advanced techniques define our manufacturing.</p>
              </div>
            </div>
            <div className="feature-item">
              <Globe size={40} className="feature-icon" />
              <div>
                <h3 className="feature-title">Global Reach</h3>
                <p className="feature-desc">Trusted by commercial growers and industries worldwide, delivering diverse, high-quality coir products seamlessly.</p>
              </div>
            </div>
            <div className="feature-item">
              <CheckCircle2 size={40} className="feature-icon" />
              <div>
                <h3 className="feature-title">Sustainable Practices</h3>
                <p className="feature-desc">100% natural, biodegradable products manufactured ensuring zero waste and a minimal carbon footprint.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA / Quote */}
      <section className="section" id="quote" style={{ background: 'var(--color-primary)', color: 'white' }}>
        <div className="container">
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '2rem' }}>
            <div style={{ maxWidth: '600px' }}>
              <h2 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '1rem' }}>Partner With Vivana Coir</h2>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.125rem' }}>
                Whether you need premium coco peat for your greenhouse or durable coir fibre for industrial applications, we are ready to supply.
              </p>
            </div>
            <a href="mailto:vivanacoir@gmail.com" className="btn btn-outline" style={{ padding: '1.5rem 3rem', fontSize: '1.125rem' }}>
              Request A Quote Today
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
