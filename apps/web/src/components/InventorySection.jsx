const badgeTone = (product) =>
  product.isLowStock
    ? "bg-rose-50 text-rose-700 border-rose-200"
    : "bg-emerald-50 text-emerald-700 border-emerald-200";

export const InventorySection = ({
  user,
  products,
  search,
  onSearchChange,
  onExport,
  onImport,
  onCreate,
  onEdit,
  onDelete,
  onResetStock
}) => (
  <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Inventory</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">Stock master</h2>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          placeholder="Search by product or SKU"
          className="min-w-[240px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-teal-500"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        {user.role === "admin" ? (
          <>
            <button
              type="button"
              onClick={onExport}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
            >
              Export Excel
            </button>
            <button
              type="button"
              onClick={onImport}
              className="rounded-2xl border border-teal-200 bg-teal-50 px-5 py-3 text-sm font-semibold text-teal-700 transition hover:bg-teal-100"
            >
              Import data
            </button>
            <button
              type="button"
              onClick={onCreate}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Add product
            </button>
          </>
        ) : null}
      </div>
    </div>

    <div className="mt-6 grid gap-4 lg:grid-cols-2">
      {products.length === 0 ? (
        <div className="rounded-[26px] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
          No products matched this search.
        </div>
      ) : (
        products.map((product) => (
          <article
            key={product.id}
            className="rounded-[26px] border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{product.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{product.sku}</p>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${badgeTone(product)}`}
              >
                {product.isLowStock ? "Low stock" : "Healthy stock"}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Current stock
                </p>
                <p className="mt-2 text-2xl font-extrabold text-slate-900">{product.stock}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Threshold
                </p>
                <p className="mt-2 text-2xl font-extrabold text-slate-900">
                  {product.lowStockThreshold}
                </p>
              </div>
            </div>

            {user.role === "admin" ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => onEdit(product)}
                  className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onResetStock(product)}
                  className="flex-1 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 transition hover:bg-amber-100"
                >
                  Reset stock
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(product)}
                  className="flex-1 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                >
                  Delete
                </button>
              </div>
            ) : null}
          </article>
        ))
      )}
    </div>
  </section>
);
