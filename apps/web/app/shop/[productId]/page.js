/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatCurrency } from "@/lib/formatters";
import { apiFetch } from "@/lib/api";
import { useCart } from "@/providers/CartProvider";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = Array.isArray(params.productId) ? params.productId[0] : params.productId;
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await apiFetch(`/products/${productId}`);
        setProduct(data.product);
      } catch (error) {
        setFeedback(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const handleAddToCart = async () => {
    try {
      await addItem(product, Number(quantity));
      setFeedback("Added to cart");
    } catch (error) {
      setFeedback(error.message);
    }
  };

  if (loading) {
    return (
      <section className="page-shell">
        <div className="container">
          <div className="surface center-stack">
            <p>Loading product...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="page-shell">
        <div className="container">
          <div className="surface center-stack">
            <p>{feedback || "Product not found"}</p>
            <Link href="/shop" className="button">
              Back to shop
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-shell">
      <div className="container product-detail-grid">
        <div className="surface media-stack">
          <img src={product.images[0]} alt={product.name} className="detail-image" />
          <div className="thumb-row">
            {product.images.map((image) => (
              <img key={image} src={image} alt={product.name} className="thumb-image" />
            ))}
          </div>
        </div>

        <div className="surface detail-copy">
          <p className="eyebrow">{product.category}</p>
          <h1>{product.name}</h1>
          <p className="section-copy">{product.description}</p>

          <div className="price-panel">
            <strong>{formatCurrency(product.price)}</strong>
            <span>{product.stock} units available</span>
          </div>

          <div className="form-grid">
            <label>
              Quantity
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              />
            </label>
            <label>
              Unit
              <input value={product.unitLabel} readOnly />
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="button" onClick={handleAddToCart}>
              Add to cart
            </button>
            <Link href="/cart" className="button secondary">
              View cart
            </Link>
          </div>

          {feedback ? <p className="form-note">{feedback}</p> : null}

          <div className="spec-grid">
            {product.specifications.map((item) => (
              <article key={`${item.label}-${item.value}`} className="spec-card">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
