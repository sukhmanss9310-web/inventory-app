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
    <div className="min-h-screen text-slate-900">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-sm font-black text-white">
            OI
          </div>
          <div>
            <p className="text-sm font-extrabold tracking-tight">Ops Inventory</p>
            <p className="text-xs text-slate-500">Marketplace operations</p>
          </div>
        </div>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
          <span>Inventory</span>
          <span>Dispatch</span>
          <span>Returns</span>
          <span>Analytics</span>
        </nav>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm">
          Internal system
        </span>
      </header>

      <main className="page-enter mx-auto grid max-w-7xl items-center gap-8 px-4 pb-8 pt-3 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:pb-12">
        <section>
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-teal-700">
              Built for Amazon and Flipkart sellers
            </p>
            <h1 className="mt-5 text-4xl font-black leading-[1.02] tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl">
              Inventory operations without the spreadsheet chaos.
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Keep stock, dispatches, returns, and team access in one clean workspace your staff can
              update quickly.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ["Track effectively", "See products, SKUs, and low-stock risk before it becomes a sale issue."],
              ["Scale efficiently", "Move dispatch work through one flow instead of scattered sheets and chats."],
              ["Collaborate better", "Give each team member the right access and keep every action logged."]
            ].map(([title, copy]) => (
              <article
                key={title}
                className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
              >
                <p className="text-sm font-extrabold text-slate-950">{title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.07)]">
            <div className="border-b border-slate-100 px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Live stock board
                  </p>
                  <p className="mt-1 text-lg font-black text-slate-950">Today’s operations</p>
                </div>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
                  Synced
                </span>
              </div>
            </div>
            <div className="grid gap-0 md:grid-cols-[1fr_220px]">
              <div className="divide-y divide-slate-100">
                {[
                  ["Bluetooth Speaker", "AMZ-BT-044", "Dispatch", "-12 units"],
                  ["Cotton Kurta", "FK-KRT-118", "Return", "+3 units"],
                  ["Travel Organizer", "AMZ-ORG-229", "Low stock", "8 left"]
                ].map(([name, sku, status, count]) => (
                  <div key={sku} className="grid grid-cols-[1fr_auto] gap-4 px-5 py-4">
                    <div>
                      <p className="font-bold text-slate-900">{name}</p>
                      <p className="mt-1 text-sm text-slate-500">{sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">{count}</p>
                      <p className="mt-1 text-xs text-slate-500">{status}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 bg-slate-950 p-5 text-white md:border-l md:border-t-0">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Weekly movement
                </p>
                <div className="mt-5 flex h-28 items-end gap-2">
                  {[42, 64, 38, 76, 52, 88, 68].map((height, index) => (
                    <div
                      key={`${height}-${index}`}
                      className="flex-1 rounded-t bg-teal-300/85"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
                <p className="mt-4 text-sm text-slate-300">A quick view of dispatch volume and returns.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md lg:max-w-none">
          <form
            onSubmit={handleLogin}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.07)] sm:p-8"
          >
            <div className="mb-7">
              <p className="text-sm font-bold text-teal-700">Sign in to your workspace</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Welcome back</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Use your company code and account credentials to continue.
              </p>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-600">Company code</span>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition focus:border-teal-600 focus:shadow-[0_0_0_4px_rgba(15,118,110,0.1)]"
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
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition focus:border-teal-600 focus:shadow-[0_0_0_4px_rgba(15,118,110,0.1)]"
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
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition focus:border-teal-600 focus:shadow-[0_0_0_4px_rgba(15,118,110,0.1)]"
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
              className="mt-7 w-full rounded-xl bg-slate-950 px-4 py-3.5 text-base font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
            >
              {busy ? "Signing in..." : "Sign in"}
            </button>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold leading-5 text-slate-600">
              Built for fast daily updates across inventory, dispatches, and returns.
            </div>
          </form>

          {message ? (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {message}
            </div>
          ) : null}
        </section>
      </main>

      <footer className="mx-auto flex max-w-7xl flex-col gap-2 border-t border-slate-200 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>Ops Inventory for internal marketplace operations.</p>
        <p>Stock updates, dispatches, returns, and audit logs in one workspace.</p>
      </footer>
    </div>
  );
};
