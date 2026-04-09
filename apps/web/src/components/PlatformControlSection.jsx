import { useState } from "react";

const formatDate = (value) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));

const summaryCards = [
  { key: "totalCompanies", label: "Client companies" },
  { key: "activeCompanies", label: "Active companies" },
  { key: "suspendedCompanies", label: "Suspended companies" },
  { key: "totalUsers", label: "Managed users" },
  { key: "activeUsers", label: "Active users" }
];

const roleTone = {
  admin: "bg-teal-50 text-teal-700 border-teal-200",
  staff: "bg-amber-50 text-amber-700 border-amber-200"
};

const initialCompanyState = {
  companyName: "",
  companyCode: "",
  adminName: "",
  adminEmail: "",
  adminPassword: ""
};

export const PlatformControlSection = ({
  overview,
  busy,
  onCreateCompany,
  onToggleCompany,
  onToggleUser
}) => {
  const [companyState, setCompanyState] = useState(initialCompanyState);
  const [message, setMessage] = useState("");

  const handleCreateCompany = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      await onCreateCompany(companyState);
      setCompanyState(initialCompanyState);
      setMessage("Company workspace created and locked under your control.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  if (!overview) {
    return (
      <div className="rounded-[28px] border border-white/70 bg-white/85 p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <p className="text-sm text-slate-500">Loading platform controls...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Platform owner
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Workspace access control</h2>
          </div>
          <p className="max-w-2xl text-sm text-slate-500">
            Provision companies, suspend access instantly, and disable users without depending on
            company admins.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {summaryCards.map((item) => (
            <div key={item.key} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-500">{item.label}</p>
              <p className="mt-3 text-3xl font-extrabold text-slate-900">
                {overview.metrics[item.key]}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <h3 className="text-xl font-bold text-slate-900">Create company workspace</h3>
          <p className="mt-1 text-sm text-slate-500">
            New companies can only enter the app after you create their workspace and admin.
          </p>

          <form onSubmit={handleCreateCompany} className="mt-5 space-y-3">
            <input
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-teal-500"
              placeholder="Company name"
              value={companyState.companyName}
              onChange={(event) =>
                setCompanyState((current) => ({ ...current, companyName: event.target.value }))
              }
              required
            />
            <input
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-teal-500"
              placeholder="Company code"
              value={companyState.companyCode}
              onChange={(event) =>
                setCompanyState((current) => ({ ...current, companyCode: event.target.value }))
              }
              required
            />
            <input
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-teal-500"
              placeholder="Admin full name"
              value={companyState.adminName}
              onChange={(event) =>
                setCompanyState((current) => ({ ...current, adminName: event.target.value }))
              }
              required
            />
            <input
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-teal-500"
              placeholder="Admin email"
              type="email"
              value={companyState.adminEmail}
              onChange={(event) =>
                setCompanyState((current) => ({ ...current, adminEmail: event.target.value }))
              }
              required
            />
            <input
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-teal-500"
              placeholder="Temporary password"
              type="password"
              value={companyState.adminPassword}
              onChange={(event) =>
                setCompanyState((current) => ({ ...current, adminPassword: event.target.value }))
              }
              required
            />

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "Creating workspace..." : "Create controlled workspace"}
            </button>
          </form>

          {message ? (
            <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              {message}
            </div>
          ) : null}
        </section>

        <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Managed companies</h3>
              <p className="mt-1 text-sm text-slate-500">
                Suspend a company instantly or disable individual accounts when needed.
              </p>
            </div>
            <p className="text-sm text-slate-500">{overview.companies.length} companies</p>
          </div>

          <div className="mt-5 space-y-4">
            {overview.companies.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                No client companies have been provisioned yet.
              </div>
            ) : (
              overview.companies.map((company) => (
                <article key={company.id} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-lg font-bold text-slate-900">{company.name}</h4>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            company.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {company.isActive ? "Active" : "Suspended"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{company.code}</p>
                      <p className="mt-2 text-xs text-slate-400">
                        Created {formatDate(company.createdAt)}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onToggleCompany(company, !company.isActive)}
                      className={`rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        company.isActive
                          ? "bg-rose-600 text-white hover:bg-rose-500"
                          : "bg-emerald-600 text-white hover:bg-emerald-500"
                      }`}
                    >
                      {company.isActive ? "Suspend company" : "Reactivate company"}
                    </button>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                      Users: <span className="font-semibold text-slate-900">{company.counts.users}</span>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                      Active users: <span className="font-semibold text-slate-900">{company.counts.activeUsers}</span>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                      Admins: <span className="font-semibold text-slate-900">{company.counts.admins}</span>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                      Products: <span className="font-semibold text-slate-900">{company.counts.products}</span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {company.users.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-5 text-sm text-slate-500">
                        No users are attached to this company yet.
                      </div>
                    ) : (
                      company.users.map((user) => (
                        <div
                          key={user.id}
                          className={`flex flex-col gap-3 rounded-2xl border px-4 py-4 sm:flex-row sm:items-center sm:justify-between ${
                            user.isActive
                              ? "border-slate-200 bg-white"
                              : "border-rose-100 bg-rose-50/60"
                          }`}
                        >
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-slate-900">{user.name}</p>
                              <span
                                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                                  roleTone[user.role]
                                }`}
                              >
                                {user.role}
                              </span>
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                  user.isActive
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-rose-50 text-rose-700"
                                }`}
                              >
                                {user.isActive ? "Enabled" : "Disabled"}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-slate-500">{user.email}</p>
                          </div>

                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => onToggleUser(company, user, !user.isActive)}
                            className={`rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                              user.isActive
                                ? "bg-slate-900 text-white hover:bg-slate-800"
                                : "bg-emerald-600 text-white hover:bg-emerald-500"
                            }`}
                          >
                            {user.isActive ? "Disable user" : "Enable user"}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
