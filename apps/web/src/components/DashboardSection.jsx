import { useState } from "react";
import { DashboardAnalyticsSection } from "./DashboardAnalyticsSection";

const metricLabels = [
  { key: "totalStock", label: "Total stock", tone: "text-slate-900" },
  { key: "totalProducts", label: "Products", tone: "text-slate-900" },
  { key: "lowStockItemsCount", label: "Low stock items", tone: "text-rose-600" },
  { key: "dispatchedAllTime", label: "Dispatched total", tone: "text-slate-900" },
  { key: "dispatchedToday", label: "Dispatched today", tone: "text-slate-900" },
  { key: "dispatchedLast7Days", label: "Dispatched 7d", tone: "text-slate-900" },
  { key: "returnsAllTime", label: "Returns total", tone: "text-slate-900" },
  { key: "returnsToday", label: "Returns today", tone: "text-slate-900" },
  { key: "returnsLast7Days", label: "Returns 7d", tone: "text-slate-900" }
];

const formatDate = (value) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));

export const DashboardSection = ({
  dashboard,
  companyCode,
  onCreateUser,
  onResetCompany,
  creatingUser,
  resettingCompany
}) => {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    password: "",
    role: "staff"
  });
  const [message, setMessage] = useState("");
  const [resetState, setResetState] = useState({
    confirmation: "",
    reason: ""
  });
  const [resetMessage, setResetMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      await onCreateUser(formState);
      setFormState({ name: "", email: "", password: "", role: "staff" });
      setMessage("User created successfully.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleResetSubmit = async (event) => {
    event.preventDefault();
    setResetMessage("");

    try {
      await onResetCompany(resetState);
      setResetState({ confirmation: "", reason: "" });
      setResetMessage("Company inventory reset successfully.");
    } catch (error) {
      setResetMessage(error.message);
    }
  };

  if (!dashboard) {
    return (
      <div className="rounded-[28px] border border-white/70 bg-white/85 p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <p className="text-sm text-slate-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Admin overview</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Operational dashboard</h2>
          </div>
          <p className="max-w-xl text-sm text-slate-500">
            Monitor stock exposure, dispatch pace, and recent activity from one place.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {metricLabels.map((metric) => (
            <div key={metric.key} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-500">{metric.label}</p>
              <p className={`mt-3 text-3xl font-extrabold ${metric.tone}`}>
                {dashboard.metrics[metric.key]}
              </p>
            </div>
          ))}
        </div>
      </section>

      <DashboardAnalyticsSection analytics={dashboard.analytics} />

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Low stock watchlist</h3>
              <p className="mt-1 text-sm text-slate-500">Restock these items before overselling.</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {dashboard.lowStockItems.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                No low stock items right now.
              </div>
            ) : (
              dashboard.lowStockItems.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col gap-3 rounded-3xl border border-rose-100 bg-rose-50/70 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{product.name}</p>
                    <p className="text-sm text-slate-500">{product.sku}</p>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="rounded-full bg-white px-3 py-1 font-semibold text-rose-600">
                      Stock: {product.stock}
                    </span>
                    <span className="text-slate-500">Threshold: {product.lowStockThreshold}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <div className="space-y-4">
          <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <h3 className="text-xl font-bold text-slate-900">Create team user</h3>
            <p className="mt-1 text-sm text-slate-500">Add admin or staff accounts without leaving the dashboard.</p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-teal-500"
                placeholder="Full name"
                value={formState.name}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, name: event.target.value }))
                }
                required
              />
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-teal-500"
                placeholder="Email"
                type="email"
                value={formState.email}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, email: event.target.value }))
                }
                required
              />
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-teal-500"
                placeholder="Password"
                type="password"
                value={formState.password}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, password: event.target.value }))
                }
                required
              />
              <select
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-teal-500"
                value={formState.role}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, role: event.target.value }))
                }
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>

              <button
                type="submit"
                disabled={creatingUser}
                className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creatingUser ? "Creating..." : "Create user"}
              </button>
            </form>

            {message ? (
              <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                {message}
              </div>
            ) : null}
          </section>

          <section className="rounded-[28px] border border-rose-200 bg-rose-50/60 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <h3 className="text-xl font-bold text-slate-900">Danger zone</h3>
            <p className="mt-1 text-sm text-slate-600">
              Reset this company’s inventory workspace. This keeps users and products, but sets all product stock to 0,
              removes dispatch and return history, clears old logs, and writes one fresh reset log.
            </p>

            <form onSubmit={handleResetSubmit} className="mt-5 space-y-3">
              <input
                className="w-full rounded-2xl border border-rose-200 bg-white px-4 py-3 outline-none focus:border-rose-400"
                placeholder={`Type ${companyCode} to confirm`}
                value={resetState.confirmation}
                onChange={(event) =>
                  setResetState((current) => ({ ...current, confirmation: event.target.value }))
                }
                required
              />
              <textarea
                className="min-h-[110px] w-full rounded-2xl border border-rose-200 bg-white px-4 py-3 outline-none focus:border-rose-400"
                placeholder="Reason for company reset"
                value={resetState.reason}
                onChange={(event) =>
                  setResetState((current) => ({ ...current, reason: event.target.value }))
                }
                required
              />
              <button
                type="submit"
                disabled={resettingCompany}
                className="w-full rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {resettingCompany ? "Resetting..." : "Reset company inventory"}
              </button>
            </form>

            {resetMessage ? (
              <div className="mt-3 rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm text-slate-700">
                {resetMessage}
              </div>
            ) : null}
          </section>
        </div>
      </div>

      <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <h3 className="text-xl font-bold text-slate-900">Recent activity</h3>
        <p className="mt-1 text-sm text-slate-500">Latest actions from the operations team.</p>

        <div className="mt-5 space-y-3">
          {dashboard.recentActivity.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-2 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-slate-900">{item.message}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {item.actorName} • {item.actorRole}
                </p>
              </div>
              <p className="text-sm text-slate-500">{formatDate(item.createdAt)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
