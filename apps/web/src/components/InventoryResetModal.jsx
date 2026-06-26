import { useEffect, useState } from "react";

const emptyState = {
  stock: 0,
  reason: ""
};

export const InventoryResetModal = ({ open, product, busy, onClose, onSubmit }) => {
  const [formState, setFormState] = useState(emptyState);

  useEffect(() => {
    if (!product) {
      setFormState(emptyState);
      return;
    }

    setFormState({
      stock: product.stock,
      reason: ""
    });
  }, [product]);

  if (!open || !product) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-black text-slate-950">Reset stock</h3>
            <p className="mt-1 text-sm text-slate-500">
              Correct the exact stock count for {product.name} and record why the change was needed.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-500 transition hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Current stock
            </p>
            <p className="mt-2 text-2xl font-black text-slate-950">{product.stock}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              SKU
            </p>
            <p className="mt-2 text-lg font-black text-slate-950">{product.sku}</p>
          </div>
        </div>

        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit({
              productId: product.id,
              stock: Number(formState.stock),
              reason: formState.reason.trim()
            });
          }}
        >
          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-teal-600 focus:shadow-[0_0_0_4px_rgba(15,118,110,0.1)]"
            placeholder="Correct stock value"
            type="number"
            min="0"
            value={formState.stock}
            onChange={(event) =>
              setFormState((current) => ({ ...current, stock: event.target.value }))
            }
            required
          />
          <textarea
            className="min-h-[120px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-teal-600 focus:shadow-[0_0_0_4px_rgba(15,118,110,0.1)]"
            placeholder="Reason for correction"
            value={formState.reason}
            onChange={(event) =>
              setFormState((current) => ({ ...current, reason: event.target.value }))
            }
            required
          />

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-amber-500 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-amber-400 disabled:opacity-60"
          >
            {busy ? "Resetting..." : "Reset stock"}
          </button>
        </form>
      </div>
    </div>
  );
};
