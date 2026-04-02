"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { formatCurrency, formatDate, formatStatus } from "@/lib/formatters";
import { useAuth } from "@/providers/AuthProvider";

const orderStatuses = [
  "pending",
  "confirmed",
  "packed",
  "out-for-delivery",
  "delivered",
  "cancelled"
];

const requestOrders = async ({
  token,
  isAdmin,
  filters,
  setOrders,
  setFeedback,
  setLoading
}) => {
  if (!token || !isAdmin) {
    setLoading(false);
    return;
  }

  setLoading(true);

  try {
    const params = new URLSearchParams();

    if (filters.status) {
      params.set("status", filters.status);
    }

    if (filters.search.trim()) {
      params.set("search", filters.search.trim());
    }

    const data = await apiFetch(`/admin/orders${params.toString() ? `?${params}` : ""}`, {
      token
    });
    setOrders(data.orders);
    setFeedback("");
  } catch (error) {
    setFeedback(error.message);
  } finally {
    setLoading(false);
  }
};

export default function AdminOrdersPage() {
  const { token, isAdmin, ready } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({ status: "", search: "" });
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [notes, setNotes] = useState({});

  useEffect(() => {
    if (!ready) {
      return;
    }

    requestOrders({
      token,
      isAdmin,
      filters,
      setOrders,
      setFeedback,
      setLoading
    });
  }, [token, isAdmin, ready, filters]);

  const handleStatusUpdate = async (orderId, orderStatus) => {
    try {
      await apiFetch(`/admin/orders/${orderId}/status`, {
        method: "PUT",
        token,
        body: {
          orderStatus,
          note: notes[orderId] || ""
        }
      });
      await requestOrders({
        token,
        isAdmin,
        filters,
        setOrders,
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
            <p>Loading orders...</p>
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
        <div className="section-heading">
          <p className="eyebrow">Order Management</p>
          <h1>Update status, scan fulfillment, and keep buyers informed.</h1>
        </div>

        <div className="surface form-grid">
          <label>
            Search
            <input
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              placeholder="Order number or buyer"
            />
          </label>
          <label>
            Status
            <select
              value={filters.status}
              onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
            >
              <option value="">All</option>
              {orderStatuses.map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))}
            </select>
          </label>
          <div className="form-actions">
            <button
              type="button"
              className="button"
              onClick={() =>
                requestOrders({
                  token,
                  isAdmin,
                  filters,
                  setOrders,
                  setFeedback,
                  setLoading
                })
              }
            >
              Refresh
            </button>
          </div>
        </div>

        {feedback ? <div className="surface">{feedback}</div> : null}

        <div className="stack-gap">
          {orders.map((order) => (
            <article key={order.id} className="surface admin-order-card">
              <div className="order-card-head">
                <div>
                  <p className="eyebrow">{order.orderNumber}</p>
                  <h2>{order.guestContact?.companyName || order.guestContact?.name || "Buyer"}</h2>
                  <p className="subtle-text">{formatDate(order.placedAt)}</p>
                </div>
                <div className="order-card-meta">
                  <span className="chip">{formatStatus(order.orderStatus)}</span>
                  <strong>{formatCurrency(order.total)}</strong>
                </div>
              </div>
              <div className="form-grid">
                <label>
                  Update status
                  <select
                    value={order.orderStatus}
                    onChange={(event) => handleStatusUpdate(order.id, event.target.value)}
                  >
                    {orderStatuses.map((status) => (
                      <option key={status} value={status}>
                        {formatStatus(status)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Status note
                  <input
                    value={notes[order.id] || ""}
                    onChange={(event) =>
                      setNotes((current) => ({
                        ...current,
                        [order.id]: event.target.value
                      }))
                    }
                    placeholder="Optional internal or buyer-facing note"
                  />
                </label>
              </div>
              <div className="order-item-list">
                {order.items.map((item) => (
                  <div key={`${order.id}-${item.sku}`} className="summary-row">
                    <span>
                      {item.name} x {item.quantity}
                    </span>
                    <strong>{formatCurrency(item.price * item.quantity)}</strong>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
