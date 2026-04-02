"use client";

import Link from "next/link";
import { ProductForm } from "@/components/admin/ProductForm";
import { useAuth } from "@/providers/AuthProvider";

export default function NewAdminProductPage() {
  const { isAdmin, ready } = useAuth();

  if (!ready) {
    return (
      <section className="page-shell">
        <div className="container">
          <div className="surface center-stack">
            <p>Loading editor...</p>
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
            <Link href="/login" className="button">
              Login
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return <ProductForm mode="create" />;
}

