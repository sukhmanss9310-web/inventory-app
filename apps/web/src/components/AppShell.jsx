const badgeStyles = {
  developer: "bg-sky-50 text-sky-700 border-sky-200",
  admin: "bg-teal-50 text-teal-700 border-teal-200",
  staff: "bg-amber-50 text-amber-800 border-amber-200"
};

const navMarks = {
  platform: "PF",
  dashboard: "DB",
  inventory: "IN",
  dispatch: "DS",
  returns: "RT",
  assistant: "AI",
  logs: "LG"
};

export const AppShell = ({ user, sections, activeSection, onSectionChange, onLogout, banner, children }) => (
  <div className="min-h-screen px-4 py-4 text-slate-900 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-7xl">
      <header className="mb-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-slate-950 text-sm font-black text-white">
            OI
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-500">
              Ops Inventory
            </p>
            <h1 className="text-xl font-black tracking-tight text-slate-950">Operations console</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-bold ${badgeStyles[user.role]}`}
          >
            {user.role}
          </span>
          <div className="text-sm">
            <p className="font-bold text-slate-900">{user.companyName || "Workspace"}</p>
            <p className="text-xs text-slate-500">{user.companyCode || "company-code"}</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="px-3 pb-3 pt-2">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Navigation
              </p>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">
          {sections.map((section) => (
            <button
              key={section.key}
              type="button"
              onClick={() => onSectionChange(section.key)}
                  className={`min-w-[170px] rounded-xl px-3 py-3 text-left transition lg:w-full ${
                activeSection === section.key
                      ? "bg-slate-950 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
              }`}
            >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[11px] font-black ${
                        activeSection === section.key
                          ? "bg-white/12 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {navMarks[section.key] || section.label.slice(0, 2).toUpperCase()}
                    </span>
                    <span>
                      <span className="block text-sm font-bold">{section.label}</span>
                      <span className="mt-0.5 block text-xs opacity-70">{section.description}</span>
                    </span>
                  </div>
            </button>
          ))}
        </div>

            <div className="mt-4 hidden rounded-xl border border-slate-200 bg-slate-50 p-3 lg:block">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                Signed in as
              </p>
              <p className="mt-2 truncate text-sm font-bold text-slate-900">{user.name}</p>
              <p className="mt-1 truncate text-xs text-slate-500">{user.email}</p>
            </div>
          </div>
        </aside>

        <main className="page-enter space-y-5">
        {banner ? (
            <div className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
            {banner}
          </div>
        ) : null}
        {children}
          <footer className="flex flex-col gap-2 border-t border-slate-200 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>Ops Inventory keeps stock, dispatches, returns, and audit trails aligned.</p>
            <p>{new Date().getFullYear()} Internal operations workspace.</p>
          </footer>
      </main>
      </div>
    </div>
  </div>
);
