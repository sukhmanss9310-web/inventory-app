import { useMemo, useState } from "react";

export const DispatchSection = ({ products, onSubmit, busy }) => {
  const [formState, setFormState] = useState({
    productId: "",
    quantity: 1,
    note: ""
  });
  const [message, setMessage] = useState("");

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === formState.productId),
    [formState.productId, products]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      await onSubmit({
        productId: formState.productId,
        quantity: Number(formState.quantity),
        note: formState.note
      });

      setFormState({ productId: "", quantity: 1, note: "" });
      setMessage("Dispatch recorded.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Dispatch</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">Reduce stock safely</h2>
        <p className="mt-2 text-sm text-slate-500">
          Staff can dispatch inventory without touching stock directly. The system handles the reduction.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 xl:grid-cols-[1fr_1fr]">
        <div className="space-y-4 rounded-[28px] border border-slate-200 bg-slate-50 p-5">
          <select
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base outline-none focus:border-teal-500"
            value={formState.productId}
            onChange={(event) =>
              setFormState((current) => ({ ...current, productId: event.target.value }))
            }
            required
          >
            <option value="">Select product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} ({product.sku})
              </option>
            ))}
          </select>

          <input
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base outline-none focus:border-teal-500"
            type="number"
            min="1"
            placeholder="Quantity dispatched"
            value={formState.quantity}
            onChange={(event) =>
              setFormState((current) => ({ ...current, quantity: event.target.value }))
            }
            required
          />

          <input
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base outline-none focus:border-teal-500"
            placeholder="Optional note"
            value={formState.note}
            onChange={(event) =>
              setFormState((current) => ({ ...current, note: event.target.value }))
            }
          />

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-3xl bg-teal-600 px-4 py-4 text-lg font-bold text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Saving..." : "Record dispatch"}
          </button>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-5 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Selected item</p>
          {selectedProduct ? (
            <div className="mt-5 space-y-4">
              <div>
                <h3 className="text-2xl font-bold">{selectedProduct.name}</h3>
                <p className="mt-1 text-sm text-slate-400">{selectedProduct.sku}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/8 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Current stock</p>
                  <p className="mt-2 text-3xl font-extrabold">{selectedProduct.stock}</p>
                </div>
                <div className="rounded-2xl bg-white/8 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Threshold</p>
                  <p className="mt-2 text-3xl font-extrabold">{selectedProduct.lowStockThreshold}</p>
                </div>
              </div>
              <p className="rounded-2xl bg-white/8 px-4 py-3 text-sm text-slate-300">
                Stock will reduce automatically after submission.
              </p>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl bg-white/8 px-4 py-5 text-sm text-slate-300">
              Pick a product to preview its current stock before dispatching.
            </div>
          )}

          {message ? (
            <div className="mt-4 rounded-2xl bg-white/8 px-4 py-3 text-sm text-slate-200">{message}</div>
          ) : null}
        </div>
      </form>
    </section>
  );
};
