"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Globe, Leaf, Award, CheckCircle2, ChevronDown, Package, Truck, Star } from "lucide-react";

// ── animated counter ──────────────────────────────────────
function useCountUp(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

function StatCounter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const count = useCountUp(value, 1800, started);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="hp-stat">
      <div className="hp-stat-value">{count}{suffix}</div>
      <div className="hp-stat-label">{label}</div>
    </div>
  );
}

// ── product card ──────────────────────────────────────────
const products = [
  { img: "/product_cocopeat.jpg", name: "Coco Peat / Coir Pith", tag: "Best Seller", desc: "100% natural growing medium with superior water retention. Ideal for commercial growers worldwide.", link: "/products" },
  { img: "/product_fibre.jpg", name: "Coir Fibre", tag: "Premium", desc: "World-class mattress fibre & twisted bales for geo-textile, erosion control and packaging.", link: "/products" },
  { img: "/product_powder.jpg", name: "Coconut Husk Powder", tag: "Eco-Grade", desc: "Fine-grade powder for agricultural, terrarium and soil conditioning applications.", link: "/products" },
  { img: "/product_ropes.jpg", name: "Coir Ropes & Twines", tag: "Industrial", desc: "Exceptionally durable natural fibre ropes for agricultural, marine and commercial use.", link: "/products" },
];

// ── testimonials ──────────────────────────────────────────
const testimonials = [
  { quote: "Vivana's coco peat is consistently excellent — right EC, right pH, reliable delivery. Our greenhouse operations depend on them.", name: "Jan Van der Berg", country: "Netherlands 🇳🇱", role: "Commercial Grower" },
  { quote: "We've been importing Vivana coir fibre for 5 years. The quality is outstanding and the export documentation is always perfectly handled.", name: "Ahmed Al-Rashid", country: "UAE 🇦🇪", role: "Industrial Buyer" },
  { quote: "As a UK-based substrate supplier, finding a consistent source was hard. Vivana solved that completely. Highly recommended.", name: "Sarah Thompson", country: "United Kingdom 🇬🇧", role: "Substrate Supplier" },
];

// ── process steps ─────────────────────────────────────────
const process = [
  { step: "01", icon: Leaf, title: "Raw Husk Sourcing", desc: "Premium coconut husks sourced directly from Sri Lanka's coconut triangle." },
  { step: "02", icon: Package, title: "Processing & Quality Control", desc: "Modern machinery. Strict quality checks for moisture, EC and pH at every stage." },
  { step: "03", icon: Award, title: "Custom Packaging", desc: "Tailored to your spec — bale size, block weight, moisture content, branding." },
  { step: "04", icon: Truck, title: "Global Export", desc: "Containerised shipping to 25+ countries with full export documentation support." },
];

export default function Home() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // auto-cycle testimonials
  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(p => (p + 1) % testimonials.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="hp-hero">
        <img src="/hero_bg.jpg" alt="Sri Lanka Coconut Plantation" className="hp-hero-bg" />
        <div className="hp-hero-overlay" />
        {/* Animated particles / lines */}
        <div className="hp-hero-grid" aria-hidden />

        <div className="container hp-hero-content">
          <div className="hp-hero-badge">
            <span className="hp-badge-dot" />
            VIVANA COIR PRODUCTS EXPORT · SRI LANKA
          </div>
          <h1 className="hp-hero-title">
            World-Class Coir &<br />
            <span className="hp-hero-accent">Coco Peat</span> Exports
          </h1>
          <p className="hp-hero-desc">
            From Sri Lanka&apos;s legendary coconut triangle to commercial growers
            and industries in 25+ countries — sustainably manufactured, consistently
            premium.
          </p>
          <div className="hp-hero-actions">
            <Link href="/products" className="hp-btn-primary">
              Explore Products <ArrowRight size={18} />
            </Link>
            <Link href="/quote" className="hp-btn-ghost">
              Request a Quote
            </Link>
          </div>

          {/* Quick trust signals */}
          <div className="hp-trust-row">
            {["10+ Years Experience", "25+ Export Countries", "500+ Tons Monthly", "100% Natural"].map(t => (
              <div key={t} className="hp-trust-chip">
                <CheckCircle2 size={14} /> {t}
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <a href="#stats" className="hp-scroll-indicator" aria-label="Scroll down">
          <ChevronDown size={24} />
        </a>
      </section>

      {/* ── STATS ────────────────────────────────────────── */}
      <section id="stats" className="hp-stats-section">
        <div className="container hp-stats-grid">
          <StatCounter value={10} suffix="+" label="Years of Excellence" />
          <StatCounter value={25} suffix="+" label="Export Countries" />
          <StatCounter value={500} suffix="+" label="Tons Per Month" />
          <StatCounter value={100} suffix="%" label="Natural Products" />
        </div>
      </section>

      {/* ── MARQUEE ──────────────────────────────────────── */}
      <div className="hp-marquee-track" aria-hidden>
        <div className="hp-marquee-inner">
          {["Coco Peat Blocks", "Coir Fibre Bales", "Husk Powder", "Coir Ropes", "Growing Media", "Custom Solutions", "Eco-Friendly", "Export Ready",
            "Coco Peat Blocks", "Coir Fibre Bales", "Husk Powder", "Coir Ropes", "Growing Media", "Custom Solutions", "Eco-Friendly", "Export Ready"].map((item, i) => (
            <span key={i} className="hp-marquee-item">{item} <span className="hp-marquee-dot">✦</span></span>
          ))}
        </div>
      </div>

      {/* ── ABOUT SPLIT ──────────────────────────────────── */}
      <section className="hp-about section" id="about">
        <div className="container">
          <div className="hp-about-grid">
            {/* Image mosaic */}
            <div className="hp-about-images">
              <img src="/factory2.jpg" alt="Factory machinery" className="hp-about-img-main" />
              <img src="/factory3.jpg" alt="Soaking tanks" className="hp-about-img-sm hp-about-img-sm-1" />
              <img src="/factory4.jpg" alt="Raw coconuts" className="hp-about-img-sm hp-about-img-sm-2" />
              <div className="hp-about-badge-float">
                <Globe size={20} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>25+</div>
                  <div style={{ fontSize: "0.7rem", opacity: 0.85 }}>Countries</div>
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="hp-about-text">
              <span className="section-label">Our Story</span>
              <h2 className="section-title">Sri Lanka&apos;s Trusted Coir Export Partner</h2>
              <p style={{ color: "var(--color-text-muted)", lineHeight: 1.8, marginBottom: "1.25rem" }}>
                <strong>VIVANA COIR PRODUCTS EXPORT (PVT) LTD</strong> is a leading manufacturer and exporter based in
                Weheragalawaththa, Kahandawa, Ranna — the heart of Sri Lanka&apos;s famous coconut triangle.
              </p>
              <p style={{ color: "var(--color-text-muted)", lineHeight: 1.8, marginBottom: "2rem" }}>
                Under the visionary leadership of <strong>Mr. Rathnayaka G. A. Lakmal Sampath</strong>, we deliver
                premium, sustainably produced coir products to commercial growers, industrial buyers and distributors
                across the globe.
              </p>

              <div className="hp-about-checklist">
                {["ISO-compliant export processes", "Modern automated machinery", "Custom spec & private label", "Full export documentation support"].map(item => (
                  <div key={item} className="hp-about-check-item">
                    <CheckCircle2 size={18} style={{ color: "var(--color-accent)", flexShrink: 0 }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "2rem" }}>
                <Link href="/about" className="hp-btn-primary">
                  Learn More About Us <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRODUCTS GRID ────────────────────────────────── */}
      <section className="section section-alt">
        <div className="container">
          <div className="hp-section-header">
            <div>
              <span className="section-label">What We Export</span>
              <h2 className="section-title">Our Premium Products</h2>
            </div>
            <Link href="/products" className="hp-see-all">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          <div className="hp-products-grid">
            {products.map(p => (
              <Link href={p.link} key={p.name} className="hp-product-card">
                <div className="hp-product-img-wrap">
                  <img src={p.img} alt={p.name} className="hp-product-img" />
                  <div className="hp-product-tag">{p.tag}</div>
                  <div className="hp-product-overlay">
                    <span>View Details <ArrowRight size={14} /></span>
                  </div>
                </div>
                <div className="hp-product-body">
                  <h3 className="hp-product-name">{p.name}</h3>
                  <p className="hp-product-desc">{p.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section className="section hp-process-section">
        <div className="container">
          <div className="text-center mb-8">
            <span className="section-label">Our Process</span>
            <h2 className="section-title">From Coconut to Continent</h2>
            <p style={{ color: "var(--color-text-muted)", maxWidth: 560, margin: "0 auto" }}>
              A rigorous, modern 4-step process ensures every order leaves our facility export-ready and to spec.
            </p>
          </div>
          <div className="hp-process-grid">
            {process.map((p, i) => (
              <div key={p.step} className="hp-process-step">
                <div className="hp-process-num">{p.step}</div>
                {i < process.length - 1 && <div className="hp-process-connector" />}
                <div className="hp-process-icon-wrap">
                  <p.icon size={28} style={{ color: "var(--color-accent)" }} />
                </div>
                <h3 className="hp-process-title">{p.title}</h3>
                <p className="hp-process-desc">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ────────────────────────────────── */}
      <section className="section section-alt">
        <div className="container">
          <div className="hp-section-header">
            <div>
              <span className="section-label">Why Vivana</span>
              <h2 className="section-title">Setting the Standard in Coir</h2>
            </div>
          </div>

          <div className="hp-features-grid">
            {[
              { icon: Award, title: "Uncompromising Quality", desc: "Strict quality control at every production stage ensures globally competitive standards.", color: "#3B82F6" },
              { icon: Leaf, title: "100% Sustainable", desc: "Pure coconut husk processing — fully natural, biodegradable, zero synthetic additives.", color: "#10b981" },
              { icon: Globe, title: "Global Logistics", desc: "Experienced in containerised exports to 25+ countries with full documentation support.", color: "#f59e0b" },
              { icon: CheckCircle2, title: "Custom Solutions", desc: "Tailored EC, pH, moisture content, block size and private label options for every buyer.", color: "#8b5cf6" },
            ].map(f => (
              <div key={f.title} className="hp-feature-card">
                <div className="hp-feature-icon" style={{ background: `${f.color}18`, color: f.color }}>
                  <f.icon size={28} />
                </div>
                <h3 className="hp-feature-title">{f.title}</h3>
                <p className="hp-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────── */}
      <section className="hp-testimonials-section section">
        <div className="container">
          <div className="text-center mb-8">
            <span className="section-label">Client Voices</span>
            <h2 className="section-title">Trusted By Global Buyers</h2>
          </div>

          <div className="hp-testimonial-wrap">
            <div className="hp-testimonial-quote-mark">&ldquo;</div>
            <p className="hp-testimonial-text">{testimonials[activeTestimonial].quote}</p>
            <div className="hp-testimonial-author">
              <div className="hp-testimonial-avatar">
                {testimonials[activeTestimonial].name.split(" ").map(w => w[0]).join("")}
              </div>
              <div>
                <div className="hp-testimonial-name">{testimonials[activeTestimonial].name}</div>
                <div className="hp-testimonial-role">{testimonials[activeTestimonial].role} · {testimonials[activeTestimonial].country}</div>
              </div>
            </div>
            <div className="hp-testimonial-stars">
              {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />)}
            </div>
            {/* Dots */}
            <div className="hp-testimonial-dots">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setActiveTestimonial(i)} className={`hp-testimonial-dot ${i === activeTestimonial ? "active" : ""}`} aria-label={`Testimonial ${i + 1}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── GLOBAL MAP CTA ───────────────────────────────── */}
      <section className="hp-cta-section">
        <div className="hp-cta-bg">
          <img src="/hero_bg.jpg" alt="" aria-hidden className="hp-cta-bg-img" />
          <div className="hp-cta-overlay" />
        </div>
        <div className="container hp-cta-content">
          <Globe size={56} style={{ color: "rgba(255,255,255,0.3)", marginBottom: "1.5rem" }} />
          <h2 className="hp-cta-title">Ready to Partner with Vivana?</h2>
          <p className="hp-cta-sub">
            Whether you need a trial container or a standing monthly order — our team is ready to build
            a reliable supply chain tailored to your needs.
          </p>
          <div className="hp-cta-actions">
            <Link href="/quote" className="hp-btn-white">
              Request a Quote <ArrowRight size={18} />
            </Link>
            <Link href="/contact" className="hp-btn-ghost-white">
              Talk to Our Team
            </Link>
          </div>
          <div className="hp-cta-contact-row">
            <a href="mailto:vivanacoir@gmail.com" className="hp-cta-contact-link">✉ vivanacoir@gmail.com</a>
            <span className="hp-cta-separator">·</span>
            <a href="https://wa.me/94776619006" className="hp-cta-contact-link">💬 WhatsApp Us</a>
          </div>
        </div>
      </section>
    </>
  );
}
