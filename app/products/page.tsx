import { ArrowRight, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function Products() {
  return (
    <>
      <div style={{ paddingTop: '80px', backgroundColor: 'var(--color-bg-alt)' }}>
        <div className="container" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <span className="section-label">Our Range</span>
          <h1 className="section-title">Premium Product Categories</h1>
          <p className="about-text" style={{ maxWidth: '700px', margin: '0 auto' }}>
            From robust mattress fibres to high-grade horticultural substrates, explore our diverse catalog of natural coconut products tailored for global export.
          </p>
          <div style={{ marginTop: '2rem' }}>
            <Link
              href="/shop"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.875rem 2rem',
                background: 'var(--color-primary)',
                color: '#fff',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.95rem',
                letterSpacing: '0.04em',
                transition: 'opacity 0.2s',
              }}
            >
              <ShoppingBag size={18} /> Shop Online Now
            </Link>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="products-grid">
            
            {/* Product 1 */}
            <div className="product-card">
              <img 
                src="/product_fibre.jpg" 
                alt="Coir Fibre" 
                className="product-image"
              />
              <div className="product-content">
                <h3 className="product-title">Coir Fibre</h3>
                <p className="product-desc">
                  The world's best coir fibre used as raw materials for geo textile, erosion control, packaging, and mattresses. We supply both premium mattress fibre and twisted fibre bales.
                </p>
                <Link href="/quote" className="product-link">
                  Request Quote <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Product 2 */}
            <div className="product-card">
              <img 
                src="/product_cocopeat.jpg" 
                alt="Coco Peat / Coir Pith" 
                className="product-image"
              />
              <div className="product-content">
                <h3 className="product-title">Coco Peat / Coir Pith</h3>
                <p className="product-desc">
                  100% natural, eco-friendly growing medium and substrate blocks with excellent water retention properties, providing the best growing media product solutions to commercial growers worldwide.
                </p>
                <Link href="/quote" className="product-link">
                  Request Quote <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Product 3 */}
            <div className="product-card">
              <img 
                src="/product_powder.jpg" 
                alt="Coconut Husk Powder" 
                className="product-image"
              />
              <div className="product-content">
                <h3 className="product-title">Coconut Husk Powder</h3>
                <p className="product-desc">
                  Fine-grade husk powder perfectly suited for specialized agricultural needs, terrariums, and soil conditioning.
                </p>
                <Link href="/quote" className="product-link">
                  Request Quote <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Product 4 */}
            <div className="product-card">
              <img 
                src="/product_ropes.jpg" 
                alt="Coir Ropes & Twines" 
                className="product-image"
              />
              <div className="product-content">
                <h3 className="product-title">Coir Ropes & Twines</h3>
                <p className="product-desc">
                  Exceptionally durable, natural fiber ropes and twines. Suitable for agricultural, marine, and commercial use.
                </p>
                <Link href="/quote" className="product-link">
                  Request Quote <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Product 5 */}
            <div className="product-card">
              <img 
                src="/factory2.jpg" 
                alt="Value-Added Products" 
                className="product-image"
              />
              <div className="product-content">
                <h3 className="product-title">Value-Added Products</h3>
                <p className="product-desc">
                  Custom coir-based agricultural and industrial items, specifically tailored to meet your unique business requirements.
                </p>
                <Link href="/quote" className="product-link">
                  Request Quote <ArrowRight size={16} />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
