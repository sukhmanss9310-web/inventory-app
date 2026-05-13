import { useState } from "react";

const initialLoginState = { companyCode: "", email: "", password: "" };

export const AuthScreen = ({ onLogin, busy }) => {
  const [loginState, setLoginState] = useState(initialLoginState);
  const [message, setMessage] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      await onLogin(loginState);
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center px-4 py-6 text-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="overflow-hidden rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8 lg:p-10">
          <div className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-700">
            Internal operations
          </div>
          <h1 className="mt-5 max-w-xl text-4xl font-extrabold leading-[1.03] tracking-tight text-slate-900 sm:text-5xl">
            Spend less time managing your orders.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Track different items across locations as they move through your inventory based on
            serial numbers and batches.
          </p>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50/90 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
                Track effectively
              </p>
              <p className="mt-2 text-lg font-extrabold leading-tight text-slate-900">
                Complete visibility
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Track different items across locations as they move through your inventory.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50/90 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
                Scale efficiently
              </p>
              <p className="mt-2 text-lg font-extrabold leading-tight text-slate-900">
                Warehouse management
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Initiate transfer orders, generate picklists, and dispatch from the nearest warehouse.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50/90 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
                Collaborate better
              </p>
              <p className="mt-2 text-lg font-extrabold leading-tight text-slate-900">
                Dedicated customer portal
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Build stronger customer relationships with a dedicated space for transactions and
                conversations.
              </p>
            </div>
          </div>

        </section>

        <section className="mx-auto w-full max-w-md space-y-6 lg:max-w-none">
          <form
            onSubmit={handleLogin}
            className="rounded-[30px] border border-white/70 bg-white/95 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur sm:p-7"
          >
            <h2 className="text-2xl font-bold text-slate-900">Sign in</h2>
            <p className="mt-2 text-sm text-slate-500">For daily dispatch, returns, and inventory review.</p>

            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-600">Company code</span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-teal-500"
                  value={loginState.companyCode}
                  onChange={(event) =>
                    setLoginState((current) => ({ ...current, companyCode: event.target.value }))
                  }
                  placeholder="atlas-retail"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-600">Email</span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-teal-500"
                  type="email"
                  value={loginState.email}
                  onChange={(event) =>
                    setLoginState((current) => ({ ...current, email: event.target.value }))
                  }
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-600">Password</span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-teal-500"
                  type="password"
                  value={loginState.password}
                  onChange={(event) =>
                    setLoginState((current) => ({ ...current, password: event.target.value }))
                  }
                  required
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="mt-7 w-full rounded-2xl bg-slate-900 px-4 py-3.5 text-base font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {message ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {message}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
};
