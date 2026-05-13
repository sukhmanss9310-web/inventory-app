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
    <div className="relative flex min-h-screen items-center overflow-hidden px-4 py-6 text-slate-800 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-[-6rem] h-80 w-80 rounded-full bg-teal-300/30 blur-3xl" />
        <div className="absolute bottom-[-8rem] right-[-6rem] h-96 w-96 rounded-full bg-slate-400/25 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] bg-[size:42px_42px]" />
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-5 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-slate-950 p-6 text-white shadow-[0_28px_90px_rgba(15,23,42,0.28)] sm:p-8 lg:min-h-[640px] lg:p-10">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute right-[-5rem] top-[-6rem] h-72 w-72 rounded-full bg-teal-400/25 blur-3xl" />
            <div className="absolute bottom-[-8rem] left-[-4rem] h-80 w-80 rounded-full bg-cyan-300/10 blur-3xl" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-200/70 to-transparent" />
          </div>

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/20 bg-white/10 px-3 py-1 text-sm font-semibold text-teal-100 shadow-inner">
              <span className="h-2 w-2 rounded-full bg-teal-300 shadow-[0_0_18px_rgba(94,234,212,0.9)]" />
              Internal operations
            </div>
            <h1 className="mt-6 max-w-xl text-4xl font-black leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Spend less time managing your orders.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
              Track different items across locations as they move through your inventory based on
              serial numbers and batches.
            </p>

            <div className="mt-9 grid gap-3 md:grid-cols-3">
              <div className="rounded-[26px] border border-white/10 bg-white/[0.08] p-4 shadow-inner backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-200">
                  Track effectively
                </p>
                <p className="mt-3 text-lg font-extrabold leading-tight">Complete visibility</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Track items across locations as they move through inventory.
                </p>
              </div>
              <div className="rounded-[26px] border border-white/10 bg-white/[0.08] p-4 shadow-inner backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-200">
                  Scale efficiently
                </p>
                <p className="mt-3 text-lg font-extrabold leading-tight">Warehouse management</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Create picklists and dispatch from the nearest warehouse.
                </p>
              </div>
              <div className="rounded-[26px] border border-white/10 bg-white/[0.08] p-4 shadow-inner backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-200">
                  Collaborate better
                </p>
                <p className="mt-3 text-lg font-extrabold leading-tight">Dedicated portal</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Keep transactions, updates, and conversations in one place.
                </p>
              </div>
            </div>

            <div className="mt-7 rounded-[30px] border border-white/10 bg-white/[0.07] p-4 backdrop-blur">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                    Live control layer
                  </p>
                  <p className="mt-1 text-lg font-extrabold">Inventory moving cleanly</p>
                </div>
                <span className="rounded-full bg-teal-300 px-3 py-1 text-xs font-black text-slate-950">
                  Synced
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-white/[0.07] px-4 py-3">
                  <span className="text-sm text-slate-300">Serial + batch tracking</span>
                  <span className="text-sm font-bold text-white">Active</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white/[0.07] px-4 py-3">
                  <span className="text-sm text-slate-300">Nearest warehouse dispatch</span>
                  <span className="text-sm font-bold text-teal-200">Ready</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md space-y-5 lg:max-w-none">
          <form
            onSubmit={handleLogin}
            className="relative overflow-hidden rounded-[34px] border border-white/80 bg-white/95 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.14)] backdrop-blur sm:p-8"
          >
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-teal-400 via-slate-900 to-cyan-300" />
            <div className="mb-7 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-teal-700">
                  Ops Inventory
                </p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Sign in</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  For daily dispatch, returns, and inventory review.
                </p>
              </div>
              <div className="rounded-2xl bg-slate-950 px-3 py-2 text-xs font-black text-white shadow-lg">
                Secure
              </div>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-600">Company code</span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-teal-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(20,184,166,0.12)]"
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
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-teal-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(20,184,166,0.12)]"
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
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-teal-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(20,184,166,0.12)]"
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
              className="mt-7 w-full rounded-2xl bg-slate-950 px-4 py-4 text-base font-black text-white shadow-[0_16px_35px_rgba(15,23,42,0.22)] transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"
            >
              {busy ? "Signing in..." : "Sign in"}
            </button>

            <div className="mt-5 rounded-2xl border border-teal-100 bg-teal-50/70 px-4 py-3 text-xs font-semibold leading-5 text-teal-800">
              Built for fast daily updates across inventory, dispatches, and returns.
            </div>
          </form>

          {message ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {message}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
};
