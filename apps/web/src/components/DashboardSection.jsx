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
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <p className="text-sm text-slate-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Admin overview</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Operations dashboard</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-500">
            Review stock exposure, movement volume, and recent team activity before the next dispatch run.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {metricLabels.map((metric) => (
            <div key={metric.key} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{metric.label}</p>
              <p className={`mt-2 text-3xl font-black tracking-tight ${metric.tone}`}>
                {dashboard.metrics[metric.key]}
              </p>
            </div>
          ))}
        </div>
      </section>

      <DashboardAnalyticsSection analytics={dashboard.analytics} />

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-black text-slate-950">Low-stock watchlist</h3>
              <p className="mt-1 text-sm text-slate-500">Items that need attention before more orders go out.</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {dashboard.lowStockItems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                No low stock items right now.
              </div>
            ) : (
              dashboard.lowStockItems.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col gap-3 rounded-xl border border-rose-100 bg-rose-50/80 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-bold text-slate-900">{product.name}</p>
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
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-6">
            <h3 className="text-xl font-black text-slate-950">Create team user</h3>
            <p className="mt-1 text-sm text-slate-500">Invite an admin or staff member into this workspace.</p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-teal-600 focus:shadow-[0_0_0_4px_rgba(15,118,110,0.1)]"
                placeholder="Full name"
                value={formState.name}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, name: event.target.value }))
                }
                required
              />
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-teal-600 focus:shadow-[0_0_0_4px_rgba(15,118,110,0.1)]"
                placeholder="Email"
                type="email"
                value={formState.email}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, email: event.target.value }))
                }
                required
              />
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-teal-600 focus:shadow-[0_0_0_4px_rgba(15,118,110,0.1)]"
                placeholder="Password"
                type="password"
                value={formState.password}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, password: event.target.value }))
                }
                required
              />
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-teal-600 focus:shadow-[0_0_0_4px_rgba(15,118,110,0.1)]"
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
                className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                {creatingUser ? "Creating..." : "Create user"}
              </button>
            </form>

            {message ? (
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                {message}
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-6">
            <h3 className="text-xl font-black text-slate-950">Danger zone</h3>
            <p className="mt-1 text-sm text-slate-600">
              Reset inventory data for this company. Users and products stay; stock and movement history are cleared.
            </p>

            <form onSubmit={handleResetSubmit} className="mt-5 space-y-3">
              <input
                className="w-full rounded-xl border border-rose-200 bg-white px-4 py-3 outline-none focus:border-rose-400"
                placeholder={`Type ${companyCode} to confirm`}
                value={resetState.confirmation}
                onChange={(event) =>
                  setResetState((current) => ({ ...current, confirmation: event.target.value }))
                }
                required
              />
              <textarea
                className="min-h-[110px] w-full rounded-xl border border-rose-200 bg-white px-4 py-3 outline-none focus:border-rose-400"
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
                className="w-full rounded-xl bg-rose-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-rose-600 disabled:opacity-60"
              >
                {resettingCompany ? "Resetting..." : "Reset company inventory"}
              </button>
            </form>

            {resetMessage ? (
              <div className="mt-3 rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm text-slate-700">
                {resetMessage}
              </div>
            ) : null}
          </section>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-6">
        <h3 className="text-xl font-black text-slate-950">Recent activity</h3>
        <p className="mt-1 text-sm text-slate-500">Latest stock and user actions in this workspace.</p>

        <div className="mt-5 space-y-3">
          {dashboard.recentActivity.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-bold text-slate-900">{item.message}</p>
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
