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
  const { addToCart, setIsCartOpen } = useCart();
  const [hover, setHover] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product, 1);
    setIsCartOpen(true);
  };

  const displayPrice =
    product.discountPrice && product.discountPrice > 0
      ? product.discountPrice
      : product.price;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "#fff",
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid #e8f5e9",
        boxShadow: hover
          ? "0 8px 32px rgba(26,92,47,0.15)"
          : "0 2px 8px rgba(0,0,0,0.06)",
        transition: "all 0.25s ease",
        transform: hover ? "translateY(-4px)" : "translateY(0)",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Product Image */}
      <div
        style={{
          position: "relative",
          aspectRatio: "4/3",
          background: "#e8f5e9",
          overflow: "hidden",
        }}
      >
        {product.imageId ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={driveImageUrl(product.imageId)}
            alt={product.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.4s ease",
              transform: hover ? "scale(1.06)" : "scale(1)",
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #1a5c2f, #4caf50)",
              color: "#fff",
              fontSize: "2.5rem",
              fontWeight: 700,
            }}
          >
            {product.category?.charAt(0) || "C"}
          </div>
        )}

        {/* Tags */}
        <div style={{ position: "absolute", top: 8, left: 8, display: "flex", gap: 4, flexWrap: "wrap" }}>
          {product.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              style={{
                background: "rgba(26,92,47,0.9)",
                color: "#fff",
                fontSize: "0.68rem",
                padding: "2px 8px",
                borderRadius: 20,
                fontWeight: 600,
                letterSpacing: "0.03em",
              }}
            >
              {tag}
            </span>
          ))}
          {product.isWholesale && (
            <span
              style={{
                background: "rgba(146,64,14,0.9)",
                color: "#fff",
                fontSize: "0.68rem",
                padding: "2px 8px",
                borderRadius: 20,
                fontWeight: 600,
              }}
            >
              WHOLESALE
            </span>
          )}
        </div>

        {/* Discount badge */}
        {product.discountPrice && product.discountPrice > 0 && !product.isWholesale && (
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              background: "#ef4444",
              color: "#fff",
              fontSize: "0.7rem",
              padding: "2px 8px",
              borderRadius: 20,
              fontWeight: 700,
            }}
          >
            SALE
          </div>
        )}
      </div>

      {/* Product Info */}
      <div style={{ padding: "0.875rem 1rem 1rem", flex: 1, display: "flex", flexDirection: "column" }}>
        <p style={{ margin: "0 0 0.25rem", fontSize: "0.72rem", color: "#4caf50", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {product.category}
        </p>
        <h3 style={{ margin: "0 0 0.5rem", fontSize: "0.9rem", fontWeight: 700, color: "#111", lineHeight: 1.3, flex: 1 }}>
          {product.title}
        </h3>
        {product.shortDesc && (
          <p style={{ margin: "0 0 0.75rem", fontSize: "0.78rem", color: "#666", lineHeight: 1.4 }}>
            {product.shortDesc.slice(0, 80)}{product.shortDesc.length > 80 ? "…" : ""}
          </p>
        )}

        {/* Price */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
          {product.isWholesale ? (
            <span style={{ fontSize: "0.85rem", color: "#92400e", fontWeight: 700 }}>Price on Request</span>
          ) : product.discountPrice && product.discountPrice > 0 ? (
            <>
              <span style={{ fontSize: "1rem", fontWeight: 800, color: "#1a5c2f" }}>
                Rs. {displayPrice.toLocaleString("en-LK")}.00
              </span>
              <span style={{ fontSize: "0.8rem", textDecoration: "line-through", color: "#999" }}>
                Rs. {product.price.toLocaleString("en-LK")}.00
              </span>
            </>
          ) : (
            <span style={{ fontSize: "1rem", fontWeight: 800, color: "#1a5c2f" }}>
              Rs. {displayPrice.toLocaleString("en-LK")}.00
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          style={{
            width: "100%",
            padding: "0.6rem",
            background: hover ? "#145024" : "#1a5c2f",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: "0.8rem",
            cursor: "pointer",
            letterSpacing: "0.04em",
            transition: "background 0.2s",
          }}
        >
          {product.isWholesale ? "REQUEST QUOTE" : "ADD TO CART"}
        </button>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div
      style={{
        background: "#f3f4f6",
        borderRadius: 12,
        overflow: "hidden",
        aspectRatio: "4/3",
        animation: "pulse 1.5s ease-in-out infinite",
      }}
    />
  );
}

// ─── Shop Content ─────────────────────────────────────────────────────────────
function ShopContent() {
  const searchParams = useSearchParams();
  const { cartCount, setIsCartOpen } = useCart();

  const initialTag = searchParams.get("tag") || "All";
  const initialCat = searchParams.get("category") || "All";
  const initialSearch = searchParams.get("search") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState(initialTag);
  const [activeCat, setActiveCat] = useState(initialCat);
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  useEffect(() => {
    setActiveTag(searchParams.get("tag") || "All");
    setActiveCat(searchParams.get("category") || "All");
    setSearchQuery(searchParams.get("search") || "");
  }, [searchParams]);

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
    <div style={{ minHeight: "100vh", background: "#f8fafb" }}>
      {/* Shop Navbar */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          background: "#1a5c2f",
          zIndex: 100,
          boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 64,
          }}
        >
          <a
            href="/"
            style={{
              color: "#fff",
              textDecoration: "none",
              fontWeight: 800,
              fontSize: "1.1rem",
              letterSpacing: "0.05em",
            }}
          >
            VIVANA COIR
          </a>
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
            <a href="/" style={{ color: "#a5d6a7", textDecoration: "none", fontSize: "0.85rem" }}>Home</a>
            <a href="/products" style={{ color: "#a5d6a7", textDecoration: "none", fontSize: "0.85rem" }}>Products</a>
            <button
              onClick={() => setIsCartOpen(true)}
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.3)",
                color: "#fff",
                padding: "0.4rem 0.875rem",
                borderRadius: 20,
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "0.85rem",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              🛒 Cart {cartCount > 0 && <span style={{ background: "#4caf50", borderRadius: "50%", padding: "0 6px", fontSize: "0.75rem" }}>{cartCount}</span>}
            </button>
          </div>
        </div>
      </nav>

      {/* Page Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #1a5c2f 0%, #2e7d32 60%, #388e3c 100%)",
          color: "#fff",
          padding: "3rem 1.5rem 2.5rem",
          textAlign: "center",
        }}
      >
        <h1 style={{ margin: "0 0 0.75rem", fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 800, letterSpacing: "-0.01em" }}>
          Shop Coir Products
        </h1>
        <p style={{ margin: 0, fontSize: "1rem", color: "#a5d6a7", maxWidth: 500, marginInline: "auto" }}>
          Premium natural coir products from the heart of Sri Lanka
        </p>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* Filter Bar */}
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: "1.25rem 1.5rem",
            marginBottom: "2rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            border: "1px solid #e8f5e9",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center" }}>
            <div>
              <p style={{ margin: "0 0 0.5rem", fontSize: "0.75rem", fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: "0.05em" }}>Category</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setActiveCat(c)}
                    style={{
                      padding: "0.35rem 0.875rem",
                      borderRadius: 20,
                      border: activeCat === c ? "none" : "1px solid #d1d5db",
                      background: activeCat === c ? "#1a5c2f" : "transparent",
                      color: activeCat === c ? "#fff" : "#374151",
                      fontSize: "0.8rem",
                      fontWeight: activeCat === c ? 700 : 400,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {tags.length > 1 && (
              <div>
                <p style={{ margin: "0 0 0.5rem", fontSize: "0.75rem", fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: "0.05em" }}>Collection</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {tags.map((t) => (
                    <button
                      key={t}
                      onClick={() => setActiveTag(t)}
                      style={{
                        padding: "0.35rem 0.875rem",
                        borderRadius: 20,
                        border: activeTag === t ? "none" : "1px solid #d1d5db",
                        background: activeTag === t ? "#4caf50" : "transparent",
                        color: activeTag === t ? "#fff" : "#374151",
                        fontSize: "0.8rem",
                        fontWeight: activeTag === t ? 700 : 400,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginLeft: "auto", fontSize: "0.85rem", color: "#6b7280" }}>
              {loading ? "Loading..." : `${filtered.length} products`}
            </div>
          </div>

          {/* Search */}
          <div style={{ marginTop: "1rem" }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              style={{
                width: "100%",
                padding: "0.65rem 1rem",
                border: "1px solid #d1d5db",
                borderRadius: 8,
                fontSize: "0.9rem",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* Product Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {loading
            ? [1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)
            : filtered.length > 0
            ? filtered.map((p) => <ProductCard key={p.id} product={p} />)
            : (
              <div
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  padding: "4rem 0",
                  color: "#888",
                }}
              >
                <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>No products found</p>
                <button
                  onClick={() => { setActiveCat("All"); setActiveTag("All"); setSearchQuery(""); }}
                  style={{
                    marginTop: "0.75rem",
                    padding: "0.6rem 1.5rem",
                    background: "#1a5c2f",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}
