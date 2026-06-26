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
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-6">
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Dispatch</p>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Record outgoing stock</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Choose an item, enter quantity, and the system reduces stock with an audit log.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 xl:grid-cols-[1fr_1fr]">
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <select
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-4 text-base outline-none transition focus:border-teal-600 focus:shadow-[0_0_0_4px_rgba(15,118,110,0.1)]"
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
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-4 text-base outline-none transition focus:border-teal-600 focus:shadow-[0_0_0_4px_rgba(15,118,110,0.1)]"
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
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-4 text-base outline-none transition focus:border-teal-600 focus:shadow-[0_0_0_4px_rgba(15,118,110,0.1)]"
            placeholder="Optional note"
            value={formState.note}
            onChange={(event) =>
              setFormState((current) => ({ ...current, note: event.target.value }))
            }
          />

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-teal-700 px-4 py-4 text-base font-black text-white transition hover:bg-teal-600 disabled:opacity-60"
          >
            {busy ? "Saving..." : "Record dispatch"}
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Selected item</p>
          {selectedProduct ? (
            <div className="mt-5 space-y-4">
              <div>
                <h3 className="text-2xl font-black">{selectedProduct.name}</h3>
                <p className="mt-1 text-sm text-slate-400">{selectedProduct.sku}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/8 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Current stock</p>
                  <p className="mt-2 text-3xl font-black">{selectedProduct.stock}</p>
                </div>
                <div className="rounded-xl bg-white/8 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Threshold</p>
                  <p className="mt-2 text-3xl font-black">{selectedProduct.lowStockThreshold}</p>
                </div>
              </div>
              <p className="rounded-xl bg-white/8 px-4 py-3 text-sm text-slate-300">
                Stock will reduce automatically after submission.
              </p>
            </div>
          ) : (
            <div className="mt-5 rounded-xl bg-white/8 px-4 py-5 text-sm text-slate-300">
              Pick a product to preview its current stock before dispatching.
            </div>
          )}

          {message ? (
            <div className="mt-4 rounded-xl bg-white/8 px-4 py-3 text-sm text-slate-200">{message}</div>
          ) : null}
        </div>
      </form>
    </section>
  );
};
