"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import CartDrawer from "@/app/components/CartDrawer";
import type { Product, ProductsApiResponse } from "@/app/lib/types";

function driveImageUrl(fileId: string): string {
  return `https://lh3.googleusercontent.com/d/${fileId}`;
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [hover, setHover] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product, 1);
  };

  const displayPrice =
    product.discountPrice && product.discountPrice > 0
      ? product.discountPrice
      : product.price;

  return (
    <div
      className="shop-product-card"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ transform: hover ? "translateY(-5px)" : "translateY(0)" }}
    >
      {/* Image */}
      <div className="shop-product-img-wrap">
        {product.imageId ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={driveImageUrl(product.imageId)}
            alt={product.title}
            className="shop-product-img"
            style={{ transform: hover ? "scale(1.06)" : "scale(1)" }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="shop-product-img-fallback">
            {product.category?.charAt(0) || "C"}
          </div>
        )}

        {/* Badges */}
        <div className="shop-product-badges">
          {product.tags.slice(0, 1).map((tag) => (
            <span key={tag} className="shop-badge shop-badge-tag">{tag}</span>
          ))}
          {product.isWholesale && (
            <span className="shop-badge shop-badge-ws">WHOLESALE</span>
          )}
          {product.discountPrice > 0 && !product.isWholesale && (
            <span className="shop-badge shop-badge-sale">SALE</span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="shop-product-body">
        <p className="shop-product-cat">{product.category}</p>
        <h3 className="shop-product-title">{product.title}</h3>
        {product.shortDesc && (
          <p className="shop-product-desc">
            {product.shortDesc.slice(0, 90)}{product.shortDesc.length > 90 ? "…" : ""}
          </p>
        )}

        <div className="shop-product-footer">
          <div className="shop-product-price">
            {product.isWholesale ? (
              <span className="shop-price-request">Price on Request</span>
            ) : product.discountPrice && product.discountPrice > 0 ? (
              <>
                <span className="shop-price-current">Rs. {displayPrice.toLocaleString("en-LK")}.00</span>
                <span className="shop-price-old">Rs. {product.price.toLocaleString("en-LK")}.00</span>
              </>
            ) : (
              <span className="shop-price-current">Rs. {displayPrice.toLocaleString("en-LK")}.00</span>
            )}
          </div>

          <button onClick={handleAddToCart} className="shop-add-btn">
            {product.isWholesale ? "Request Quote" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return <div className="shop-skeleton" />;
}

// ─── Cart Button (floating, syncs with global layout cart) ────────────────────
function CartButton() {
  const { cartCount, setIsCartOpen } = useCart();
  if (cartCount === 0) return null;
  return (
    <button
      className="shop-cart-fab"
      onClick={() => setIsCartOpen(true)}
      aria-label="Open cart"
    >
      🛒 <span className="shop-cart-fab-count">{cartCount}</span>
    </button>
  );
}

// ─── Main Shop Content ────────────────────────────────────────────────────────
function ShopContent() {
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState(searchParams.get("category") || "All");
  const [activeTag, setActiveTag] = useState(searchParams.get("tag") || "All");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d: ProductsApiResponse) => {
        setProducts(d.products ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];
  const tags = ["All", ...Array.from(new Set(products.flatMap((p) => p.tags).filter(Boolean)))];

  const filtered = products.filter((p) => {
    const catMatch = activeCat === "All" || p.category === activeCat;
    const tagMatch = activeTag === "All" || p.tags.includes(activeTag);
    const searchMatch =
      !searchQuery.trim() ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return catMatch && tagMatch && searchMatch;
  });

  return (
    <>
      {/* Page Header — matches site section style */}
      <div className="shop-header-banner" style={{ paddingTop: "80px" }}>
        <div className="container" style={{ padding: "4rem 2rem 3rem", textAlign: "center" }}>
          <span className="section-label">Online Shop</span>
          <h1 className="section-title">Browse Coir Products</h1>
          <p className="about-text" style={{ maxWidth: "620px", margin: "0 auto" }}>
            Order premium natural coir products online. Our team will confirm your order and arrange delivery.
          </p>
        </div>
      </div>

      <section className="section" style={{ paddingTop: "2rem" }}>
        <div className="container">

          {/* Filter & Search Bar */}
          <div className="shop-filter-bar">
            {/* Search */}
            <div className="shop-search-wrap">
              <svg className="shop-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="shop-search-input"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="shop-search-clear" onClick={() => setSearchQuery("")}>✕</button>
              )}
            </div>

            {/* Category filters */}
            <div className="shop-filter-group">
              <span className="shop-filter-label">Category:</span>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCat(c)}
                  className={`shop-filter-btn${activeCat === c ? " active" : ""}`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Tag filters */}
            {tags.length > 1 && (
              <div className="shop-filter-group">
                <span className="shop-filter-label">Collection:</span>
                {tags.map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTag(t)}
                    className={`shop-filter-btn${activeTag === t ? " active" : ""}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}

            <div className="shop-result-count">
              {loading ? "Loading…" : `${filtered.length} product${filtered.length !== 1 ? "s" : ""}`}
            </div>
          </div>

          {/* Product Grid */}
          <div className="shop-grid">
            {loading
              ? [1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)
              : filtered.length > 0
              ? filtered.map((p) => <ProductCard key={p.id} product={p} />)
              : (
                <div className="shop-empty">
                  <p>No products found for the selected filters.</p>
                  <button
                    className="btn btn-primary"
                    style={{ marginTop: "1rem" }}
                    onClick={() => { setActiveCat("All"); setActiveTag("All"); setSearchQuery(""); }}
                  >
                    Clear Filters
                  </button>
                </div>
              )
            }
          </div>
        </div>
      </section>

      {/* Floating cart button */}
      <CartButton />

      {/* Cart Drawer */}
      <CartDrawer />
    </>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div style={{ paddingTop: "80px", textAlign: "center", padding: "6rem 2rem" }}>
        Loading products…
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
