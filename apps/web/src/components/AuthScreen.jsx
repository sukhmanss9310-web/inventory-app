import { useState } from "react";

const initialLoginState = { companyCode: "", email: "", password: "" };
const initialSetupState = {
  companyName: "",
  companyCode: "",
  name: "",
  email: "",
  password: "",
  role: "admin"
};

export const AuthScreen = ({ onLogin, onBootstrap, busy }) => {
  const [loginState, setLoginState] = useState(initialLoginState);
  const [setupState, setSetupState] = useState(initialSetupState);
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

  const handleBootstrap = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      await onBootstrap(setupState);
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 text-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="overflow-hidden rounded-[32px] border border-white/70 bg-white/85 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-700">
            Internal operations
          </div>
          <h1 className="mt-5 max-w-xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Inventory control for fast-moving Amazon and Flipkart operations.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Dispatch, returns, exchanges, and stock updates stay in one system so your team can
            work quickly without mismatched inventory.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-500">Stock control</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">Real-time</p>
              <p className="mt-2 text-sm text-slate-600">Low stock warnings and audit-friendly edits.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-500">Staff workflow</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">Fast entry</p>
              <p className="mt-2 text-sm text-slate-600">Large actions for dispatches and returns.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-500">Admin visibility</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">One dashboard</p>
              <p className="mt-2 text-sm text-slate-600">Daily movement, low stock, and activity logs.</p>
            </div>
          </div>

        </section>

        <section className="space-y-6">
          <form
            onSubmit={handleLogin}
            className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur"
          >
            <h2 className="text-2xl font-bold text-slate-900">Sign in</h2>
            <p className="mt-2 text-sm text-slate-500">For daily dispatch, returns, and inventory review.</p>

            <div className="mt-5 space-y-4">
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
              className="mt-6 w-full rounded-2xl bg-slate-900 px-4 py-3 text-base font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <form
            onSubmit={handleBootstrap}
            className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur"
          >
            <h2 className="text-2xl font-bold text-slate-900">Create company admin</h2>
            <p className="mt-2 text-sm text-slate-500">
              Start a new company workspace with its own admin, products, and activity history.
            </p>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-600">Company name</span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-teal-500"
                  value={setupState.companyName}
                  onChange={(event) =>
                    setSetupState((current) => ({ ...current, companyName: event.target.value }))
                  }
                  placeholder="Northstar Commerce"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-600">Company code</span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-teal-500"
                  value={setupState.companyCode}
                  onChange={(event) =>
                    setSetupState((current) => ({ ...current, companyCode: event.target.value }))
                  }
                  placeholder="northstar-commerce"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-600">Full name</span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-teal-500"
                  value={setupState.name}
                  onChange={(event) =>
                    setSetupState((current) => ({ ...current, name: event.target.value }))
                  }
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-600">Email</span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-teal-500"
                  type="email"
                  value={setupState.email}
                  onChange={(event) =>
                    setSetupState((current) => ({ ...current, email: event.target.value }))
                  }
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-600">Password</span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-teal-500"
                  type="password"
                  value={setupState.password}
                  onChange={(event) =>
                    setSetupState((current) => ({ ...current, password: event.target.value }))
                  }
                  required
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="mt-6 w-full rounded-2xl bg-teal-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "Creating company..." : "Create company admin"}
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
