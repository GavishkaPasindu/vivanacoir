import Link from "next/link";
import { ArrowRight, Award, Globe, Leaf, Users, Package, Star } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | VIVANA HOLDINGS – Coir Products Export Sri Lanka",
  description:
    "Learn about Vivana Holdings, a leading exporter of premium coir and coco peat products from Sri Lanka's coconut triangle.",
};

const stats = [
  { value: "10+", label: "Years of Experience" },
  { value: "25+", label: "Countries Served" },
  { value: "500+", label: "Tons Exported Monthly" },
  { value: "100%", label: "Natural Products" },
];

const values = [
  {
    icon: Award,
    title: "Uncompromising Quality",
    desc: "Every batch passes strict quality checks before leaving our facility. We meet international export standards including ISO requirements.",
  },
  {
    icon: Leaf,
    title: "Sustainable Manufacturing",
    desc: "We utilise 100% natural coconut husk waste, turning it into high-value products with zero synthetic additives — good for you and the planet.",
  },
  {
    icon: Globe,
    title: "Global Reach",
    desc: "Our products reach growers, manufacturers and industrial buyers across Europe, North America, the Middle East, and Asia.",
  },
  {
    icon: Users,
    title: "Expert Team",
    desc: "Led by an experienced management team with deep roots in Sri Lanka's coir industry, ensuring every order is handled with expertise.",
  },
  {
    icon: Package,
    title: "Custom Solutions",
    desc: "We tailor packing, moisture content, EC levels and sizing to your exact specifications — whatever your market demands.",
  },
  {
    icon: Star,
    title: "Trusted Partner",
    desc: "Long-term relationships built on transparency, reliable delivery timelines and consistent product quality, order after order.",
  },
];

const products = [
  {
    img: "/product_fibre.jpg",
    name: "Coir Fibre",
    desc: "Premium mattress fibre & twisted fibre bales for geo-textile, erosion control and packaging.",
  },
  {
    img: "/product_cocopeat.jpg",
    name: "Coco Peat / Coir Pith",
    desc: "Natural, eco-friendly growing medium with superior water retention for commercial growers worldwide.",
  },
  {
    img: "/product_powder.jpg",
    name: "Coconut Husk Powder",
    desc: "Fine-grade powder for specialized agricultural, terrarium and soil conditioning applications.",
  },
  {
    img: "/product_ropes.jpg",
    name: "Coir Ropes & Twines",
    desc: "Exceptionally durable natural fibre ropes for agricultural, marine and commercial use.",
  },
];

export default function AboutPage() {
  return (
    <div style={{ background: "var(--color-bg)" }}>

      {/* ── HERO ────────────────────────────────────────── */}
      <div
        style={{
          background: "var(--color-primary)",
          padding: "7rem 0 4rem",
          textAlign: "center",
          color: "white",
        }}
      >
        <div className="container">
          <span className="section-label" style={{ color: "#93c5fd" }}>
            Our Story
          </span>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "3rem",
              fontWeight: 700,
              color: "white",
              margin: "0.5rem 0 1rem",
            }}
          >
            About Vivana Holdings
          </h1>
          <p
            style={{
              color: "#93c5fd",
              fontSize: "1.1rem",
              maxWidth: "620px",
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            Born in the heart of Sri Lanka&apos;s legendary coconut triangle, we
            transform nature&apos;s gift into world-class coir products trusted by
            buyers across 25+ countries.
          </p>
        </div>
      </div>

      {/* ── STATS BAR ───────────────────────────────────── */}
      <div
        style={{
          background: "var(--color-accent)",
          padding: "2rem 0",
        }}
      >
        <div className="container">
          <div className="about-stats-grid">
            {stats.map((s) => (
              <div key={s.label} className="about-stat-item">
                <div className="about-stat-value">{s.value}</div>
                <div className="about-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── WHO WE ARE ──────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="about-intro-grid">
            <div>
              <span className="section-label">Who We Are</span>
              <h2 className="section-title">
                Sri Lanka&apos;s Trusted Coir Export Partner
              </h2>
              <p
                style={{
                  color: "var(--color-text-muted)",
                  lineHeight: 1.8,
                  marginBottom: "1.25rem",
                }}
              >
                <strong>VIVANA COIR PRODUCTS EXPORT (PVT) LTD</strong> is a
                leading manufacturer and exporter of premium coir-based products,
                widely recognized across the global horticulture and industrial
                sectors. Our factory is located in{" "}
                <strong>
                  Weheragalawaththa, Kahandawa, Ranna, Hambantota District
                </strong>{" "}
                — the very epicentre of Sri Lanka&apos;s world-famous coconut
                triangle.
              </p>
              <p
                style={{
                  color: "var(--color-text-muted)",
                  lineHeight: 1.8,
                  marginBottom: "1.25rem",
                }}
              >
                Under the visionary leadership of{" "}
                <strong>
                  Mr. Rathnayaka Geegana Arachchige Lakmal Sampath
                </strong>
                , Vivana Holdings has established itself as a trusted partner
                committed to sustainable practices, uncompromising quality control
                and delivering export-ready coir products to global buyers.
              </p>
              <p
                style={{
                  color: "var(--color-text-muted)",
                  lineHeight: 1.8,
                  marginBottom: "2rem",
                }}
              >
                We specialise in Coco Peat, Coir Fibre, Coconut Husk Powder, Coir
                Ropes and value-added custom coir solutions. Every product is
                processed with modern machinery in our state-of-the-art facility
                and shipped in full compliance with international export
                standards.
              </p>
              <Link href="/products" className="btn btn-primary">
                View Our Products <ArrowRight size={18} />
              </Link>
            </div>

            {/* Main factory image */}
            <div style={{ position: "relative" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/factory1.jpg"
                alt="Vivana Holdings Factory"
                style={{
                  width: "100%",
                  height: "420px",
                  objectFit: "cover",
                  borderRadius: "4px",
                  boxShadow: "0 20px 50px rgba(0,0,0,0.12)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "-1.5rem",
                  right: "-1.5rem",
                  background: "var(--color-primary)",
                  color: "white",
                  padding: "1.25rem 1.75rem",
                  textAlign: "center",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                }}
              >
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: 800,
                    fontFamily: "var(--font-heading)",
                    lineHeight: 1,
                  }}
                >
                  10+
                </div>
                <div
                  style={{ fontSize: "0.75rem", letterSpacing: "0.08em", marginTop: "4px" }}
                >
                  YEARS EXCELLENCE
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FACTORY GALLERY ─────────────────────────────── */}
      <section className="section section-alt">
        <div className="container">
          <div className="text-center mb-8">
            <span className="section-label">Our Facility</span>
            <h2 className="section-title">Inside Our Factory</h2>
            <p
              style={{
                color: "var(--color-text-muted)",
                maxWidth: "560px",
                margin: "0 auto",
              }}
            >
              A modern, fully equipped coir processing facility in the heart of
              Sri Lanka&apos;s coconut triangle.
            </p>
          </div>

          <div className="factory-gallery">
            {/* Large left image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/factory2.jpg"
              alt="Coir processing machinery"
              className="factory-img factory-img-large"
            />
            {/* Right column: 3 smaller images */}
            <div className="factory-gallery-col">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/factory3.jpg" alt="Coconut husk soaking tanks" className="factory-img" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/factory4.jpg" alt="Raw coconut husks stockpile" className="factory-img" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/about_factory.jpg" alt="Factory exterior" className="factory-img" />
            </div>
          </div>
        </div>
      </section>

      {/* ── LEADERSHIP ──────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-8">
            <span className="section-label">Leadership</span>
            <h2 className="section-title">The Visionary Behind Vivana</h2>
          </div>

          <div className="leadership-card">
            <div className="leadership-avatar">
              <div className="leadership-avatar-placeholder">RLS</div>
            </div>
            <div>
              <h3
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.5rem",
                  color: "var(--color-primary)",
                  margin: "0 0 0.25rem",
                }}
              >
                Mr. Rathnayaka Geegana Arachchige Lakmal Sampath
              </h3>
              <p
                style={{
                  color: "var(--color-accent)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontSize: "0.82rem",
                  margin: "0 0 1.25rem",
                }}
              >
                Founder & Managing Director
              </p>
              <p
                style={{
                  color: "var(--color-text-muted)",
                  lineHeight: 1.8,
                  marginBottom: "1rem",
                  maxWidth: "700px",
                }}
              >
                With over a decade of hands-on experience in Sri Lanka&apos;s coir
                industry, Mr. Sampath founded Vivana Holdings with a clear vision:
                to bring world-class, sustainably produced coir products to the
                global market. His deep understanding of both the manufacturing
                process and international buyer requirements has been the driving
                force behind the company&apos;s rapid growth and strong reputation.
              </p>
              <p
                style={{
                  color: "var(--color-text-muted)",
                  lineHeight: 1.8,
                  maxWidth: "700px",
                }}
              >
                Under his leadership, Vivana has expanded into 25+ export markets,
                continuously invested in modern processing equipment, and built
                long-term relationships with buyers who trust the Vivana name for
                consistency and quality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ──────────────────────────────────────── */}
      <section className="section section-alt">
        <div className="container">
          <div className="text-center mb-8">
            <span className="section-label">Our Values</span>
            <h2 className="section-title">Why Choose Vivana Holdings</h2>
          </div>
          <div className="values-grid">
            {values.map((v) => (
              <div key={v.title} className="value-card">
                <v.icon size={36} style={{ color: "var(--color-accent)", marginBottom: "1rem" }} />
                <h3
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.1rem",
                    color: "var(--color-primary)",
                    marginBottom: "0.5rem",
                  }}
                >
                  {v.title}
                </h3>
                <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCTS TEASER ─────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-8">
            <span className="section-label">What We Export</span>
            <h2 className="section-title">Our Premium Product Range</h2>
          </div>
          <div className="about-products-grid">
            {products.map((p) => (
              <div key={p.name} className="about-product-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.img} alt={p.name} className="about-product-img" />
                <div style={{ padding: "1.25rem" }}>
                  <h3
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "1rem",
                      color: "var(--color-primary)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {p.name}
                  </h3>
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", lineHeight: 1.6 }}>
                    {p.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
            <Link href="/products" className="btn btn-primary">
              Explore All Products <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────── */}
      <section
        style={{
          background: "var(--color-primary)",
          padding: "5rem 0",
          textAlign: "center",
          color: "white",
        }}
      >
        <div className="container">
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "2.25rem",
              color: "white",
              marginBottom: "1rem",
            }}
          >
            Ready to start your export journey?
          </h2>
          <p style={{ color: "#93c5fd", marginBottom: "2rem", fontSize: "1.05rem" }}>
            Get in touch today for competitive pricing and tailored coir solutions.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/quote" className="btn btn-primary" style={{ background: "white", color: "var(--color-primary)" }}>
              Get a Quote <ArrowRight size={18} />
            </Link>
            <Link href="/contact" className="btn btn-outline" style={{ borderColor: "white", color: "white" }}>
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
