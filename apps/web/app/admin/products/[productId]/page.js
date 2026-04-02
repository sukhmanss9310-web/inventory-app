"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

export default function EditAdminProductPage() {
  const params = useParams();
  const productId = Array.isArray(params.productId) ? params.productId[0] : params.productId;
  const { token, isAdmin, ready } = useAuth();
  const [product, setProduct] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) {
      return;
    }

    const loadProduct = async () => {
      if (!token || !isAdmin) {
        setLoading(false);
        return;
      }

      try {
        const data = await apiFetch(`/products/${productId}`, { token });
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
  }, [token, isAdmin, ready, productId]);

  if (!ready || loading) {
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

  if (!product) {
    return (
      <section className="page-shell">
        <div className="container">
          <div className="surface center-stack">
            <p>{feedback || "Product not found"}</p>
            <Link href="/admin/products" className="button">
              Back to products
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return <ProductForm mode="edit" product={product} />;
}
