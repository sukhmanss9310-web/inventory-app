"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/formatters";
import { useAuth } from "@/providers/AuthProvider";

const requestProducts = async ({
  token,
  isAdmin,
  setProducts,
  setFeedback,
  setLoading
}) => {
  if (!token || !isAdmin) {
    setLoading(false);
    return;
  }

  try {
    const data = await apiFetch("/products?scope=admin", { token });
    setProducts(data.products);
  } catch (error) {
    setFeedback(error.message);
  } finally {
    setLoading(false);
  }
};

export default function AdminProductsPage() {
  const { token, isAdmin, ready } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!ready) {
      return;
    }

    requestProducts({
      token,
      isAdmin,
      setProducts,
      setFeedback,
      setLoading
    });
  }, [token, isAdmin, ready]);

  const handleDelete = async (productId) => {
    try {
      await apiFetch(`/products/${productId}`, {
        method: "DELETE",
        token
      });
      await requestProducts({
        token,
        isAdmin,
        setProducts,
        setFeedback,
        setLoading
      });
    } catch (error) {
      setFeedback(error.message);
    }
  };

  if (!ready || loading) {
    return (
      <section className="page-shell">
        <div className="container">
          <div className="surface center-stack">
            <p>Loading products...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!isAdmin) {
    return (
      <section className="page-shell">
        <div className="container">
          <div className="surface center-stack">
            <p>Admin access is required.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-shell">
      <div className="container stack-gap">
        <div className="section-heading spread">
          <div>
            <p className="eyebrow">Catalog Admin</p>
            <h1>Manage your product assortment and inventory rules.</h1>
          </div>
          <Link href="/admin/products/new" className="button">
            Add product
          </Link>
        </div>

        {feedback ? <div className="surface">{feedback}</div> : null}

        <div className="stack-gap">
          {products.map((product) => (
            <article key={product.id} className="surface admin-list-row">
              <div>
                <h2>{product.name}</h2>
                <p className="subtle-text">
                  {product.category} · {product.sku} · {product.status}
                </p>
              </div>
              <div className="admin-row-meta">
                <strong>{formatCurrency(product.price)}</strong>
                <span>{product.stock} in stock</span>
              </div>
              <div className="form-actions">
                <Link href={`/admin/products/${product.id}`} className="button secondary">
                  Edit
                </Link>
                <button type="button" className="button ghost" onClick={() => handleDelete(product.id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
