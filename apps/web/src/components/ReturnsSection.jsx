import { useMemo, useState } from "react";

export const ReturnsSection = ({ products, onSubmit, busy }) => {
  const [formState, setFormState] = useState({
    productId: "",
    quantity: 1,
    type: "return",
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
        type: formState.type,
        note: formState.note
      });

      setFormState({ productId: "", quantity: 1, type: "return", note: "" });
      setMessage("Return or exchange recorded.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Returns</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">Add stock back in</h2>
        <p className="mt-2 text-sm text-slate-500">
          Returns and exchanges increase stock immediately and leave a clean audit trail.
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

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base outline-none focus:border-teal-500"
              type="number"
              min="1"
              placeholder="Quantity"
              value={formState.quantity}
              onChange={(event) =>
                setFormState((current) => ({ ...current, quantity: event.target.value }))
              }
              required
            />
            <select
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base outline-none focus:border-teal-500"
              value={formState.type}
              onChange={(event) =>
                setFormState((current) => ({ ...current, type: event.target.value }))
              }
            >
              <option value="return">Return</option>
              <option value="exchange">Exchange</option>
            </select>
          </div>

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
            className="w-full rounded-3xl bg-amber-500 px-4 py-4 text-lg font-bold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Saving..." : "Record return / exchange"}
          </button>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Stock preview</p>
          {selectedProduct ? (
            <div className="mt-5 space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">{selectedProduct.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{selectedProduct.sku}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Current stock</p>
                <p className="mt-2 text-4xl font-extrabold text-slate-900">{selectedProduct.stock}</p>
              </div>
              <p className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                This submission will increase stock by the entered quantity.
              </p>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
              Select a product to confirm stock before posting the return or exchange.
            </div>
          )}

          {message ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              {message}
            </div>
          ) : null}
        </div>
      </form>
    </section>
  );
};
