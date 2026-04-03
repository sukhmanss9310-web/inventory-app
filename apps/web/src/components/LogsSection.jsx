import { useEffect, useState } from "react";

const actionOptions = [
  { value: "", label: "All actions" },
  { value: "dispatch_created", label: "Dispatches" },
  { value: "return_created", label: "Returns / exchanges" },
  { value: "product_created", label: "Products created" },
  { value: "product_updated", label: "Products updated" },
  { value: "product_deleted", label: "Products deleted" },
  { value: "inventory_adjusted", label: "Inventory resets" },
  { value: "company_reset", label: "Company resets" },
  { value: "user_created", label: "Users created" }
];

const roleOptions = [
  { value: "", label: "All roles" },
  { value: "admin", label: "Admin" },
  { value: "staff", label: "Staff" }
];

const movementOptions = [
  { value: "", label: "All movement types" },
  { value: "dispatch", label: "Dispatch" },
  { value: "return", label: "Return" },
  { value: "exchange", label: "Exchange" }
];

const pageSizeOptions = [10, 20, 50];

const formatDate = (value) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));

const formatAction = (action) =>
  action
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

export const LogsSection = ({
  logs,
  filters,
  pagination,
  loading,
  onApplyFilters,
  onPageChange
}) => {
  const [formState, setFormState] = useState(filters);

  useEffect(() => {
    setFormState(filters);
  }, [filters]);

  const startItem = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const endItem = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Activity logs</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">Every stock movement, tracked</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Search by user, SKU, product, or action and browse the full audit trail page by page.
          </p>
        </div>
        <p className="text-sm text-slate-500">
          Showing {startItem}-{endItem} of {pagination.total}
        </p>
      </div>

      <form
        className="mt-6 grid gap-3 rounded-[26px] border border-slate-200 bg-slate-50 p-4 lg:grid-cols-2 xl:grid-cols-3"
        onSubmit={(event) => {
          event.preventDefault();
          onApplyFilters({ ...formState, page: 1 });
        }}
      >
        <input
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-teal-500"
          placeholder="Search user, product, SKU, message"
          value={formState.search}
          onChange={(event) =>
            setFormState((current) => ({ ...current, search: event.target.value }))
          }
        />
        <select
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-teal-500"
          value={formState.action}
          onChange={(event) =>
            setFormState((current) => ({ ...current, action: event.target.value }))
          }
        >
          {actionOptions.map((option) => (
            <option key={option.value || "all"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-teal-500"
          value={formState.actorRole}
          onChange={(event) =>
            setFormState((current) => ({ ...current, actorRole: event.target.value }))
          }
        >
          {roleOptions.map((option) => (
            <option key={option.value || "all"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-teal-500"
          value={formState.movementType}
          onChange={(event) =>
            setFormState((current) => ({ ...current, movementType: event.target.value }))
          }
        >
          {movementOptions.map((option) => (
            <option key={option.value || "all"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <input
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-teal-500"
          type="date"
          value={formState.startDate}
          onChange={(event) =>
            setFormState((current) => ({ ...current, startDate: event.target.value }))
          }
        />
        <input
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-teal-500"
          type="date"
          value={formState.endDate}
          onChange={(event) =>
            setFormState((current) => ({ ...current, endDate: event.target.value }))
          }
        />
        <div className="flex flex-col gap-3 sm:flex-row xl:col-span-3">
          <button
            type="submit"
            className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Apply filters
          </button>
          <button
            type="button"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
            onClick={() =>
              onApplyFilters({
                search: "",
                action: "",
                actorRole: "",
                movementType: "",
                startDate: "",
                endDate: "",
                page: 1,
                limit: pagination.limit
              })
            }
          >
            Reset
          </button>
          <select
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-teal-500 sm:ml-auto"
            value={String(formState.limit)}
            onChange={(event) => {
              const nextLimit = Number(event.target.value);
              const nextState = { ...formState, limit: nextLimit };
              setFormState(nextState);
              onApplyFilters({ ...nextState, page: 1 });
            }}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} per page
              </option>
            ))}
          </select>
        </div>
      </form>

      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="rounded-[26px] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            Loading logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="rounded-[26px] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            No logs matched the current filters.
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="rounded-[26px] border border-slate-200 bg-slate-50 p-5"
            >
              <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                      {formatAction(log.action)}
                    </span>
                    {log.movementType ? (
                      <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                        {formatAction(log.movementType)}
                      </span>
                    ) : null}
                    {log.sku ? (
                      <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                        {log.sku}
                      </span>
                    ) : null}
                    {typeof log.quantity === "number" ? (
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                        Qty {log.quantity}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 font-semibold text-slate-900">{log.message}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {log.actorName} • {log.actorRole}
                    {log.productName ? ` • ${log.productName}` : ""}
                  </p>
                </div>
                <p className="text-sm text-slate-500">{formatDate(log.createdAt)}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Page {pagination.page} of {pagination.totalPages}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            disabled={pagination.page <= 1 || loading}
            onClick={() => onPageChange(pagination.page - 1)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={pagination.page >= pagination.totalPages || loading}
            onClick={() => onPageChange(pagination.page + 1)}
            className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
};
