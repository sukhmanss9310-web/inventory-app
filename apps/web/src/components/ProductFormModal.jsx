import { useEffect, useState } from "react";

const emptyState = {
  name: "",
  sku: "",
  stock: 0,
  lowStockThreshold: 5
};

export const ProductFormModal = ({ open, mode, product, onClose, onSubmit, busy }) => {
  const [formState, setFormState] = useState(emptyState);

  useEffect(() => {
    if (!product) {
      setFormState(emptyState);
      return;
    }

    setFormState({
      name: product.name,
      sku: product.sku,
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold
    });
  }, [product]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.2)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">
              {mode === "create" ? "Add product" : "Edit product"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Keep SKU and stock data aligned with your marketplace operations.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-500"
          >
            Close
          </button>
        </div>

        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit({
              ...formState,
              stock: Number(formState.stock),
              lowStockThreshold: Number(formState.lowStockThreshold)
            });
          }}
        >
          <input
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-teal-500"
            placeholder="Product name"
            value={formState.name}
            onChange={(event) =>
              setFormState((current) => ({ ...current, name: event.target.value }))
            }
            required
          />
          <input
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 uppercase outline-none focus:border-teal-500"
            placeholder="SKU"
            value={formState.sku}
            onChange={(event) =>
              setFormState((current) => ({ ...current, sku: event.target.value.toUpperCase() }))
            }
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-teal-500"
              placeholder="Current stock"
              type="number"
              min="0"
              value={formState.stock}
              onChange={(event) =>
                setFormState((current) => ({ ...current, stock: event.target.value }))
              }
              required
            />
            <input
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-teal-500"
              placeholder="Low stock threshold"
              type="number"
              min="0"
              value={formState.lowStockThreshold}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  lowStockThreshold: event.target.value
                }))
              }
              required
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Saving..." : mode === "create" ? "Create product" : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
};
