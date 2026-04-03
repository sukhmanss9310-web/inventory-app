const badgeStyles = {
  admin: "bg-teal-50 text-teal-700 border-teal-200",
  staff: "bg-amber-50 text-amber-700 border-amber-200"
};

export const AppShell = ({ user, sections, activeSection, onSectionChange, onLogout, banner, children }) => (
  <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
    <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[280px_1fr]">
      <aside className="overflow-hidden rounded-[28px] border border-white/70 bg-slate-950 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
        <div className="border-b border-white/10 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
            Ops Inventory
          </p>
          <h1 className="mt-3 text-2xl font-bold">Seller Console</h1>
          <p className="mt-2 text-sm text-slate-400">Amazon + Flipkart stock control</p>
        </div>

        <div className="space-y-2 p-4">
          {sections.map((section) => (
            <button
              key={section.key}
              type="button"
              onClick={() => onSectionChange(section.key)}
              className={`w-full rounded-2xl px-4 py-3 text-left transition ${
                activeSection === section.key
                  ? "bg-white text-slate-950"
                  : "bg-transparent text-slate-300 hover:bg-white/8 hover:text-white"
              }`}
            >
              <div className="text-sm font-semibold">{section.label}</div>
              <div className="mt-1 text-xs opacity-70">{section.description}</div>
            </button>
          ))}
        </div>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-2xl bg-white/6 p-4">
            <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Company
              </p>
              <p className="mt-2 text-sm font-semibold text-white">{user.companyName || "Workspace"}</p>
              <p className="mt-1 text-xs text-slate-400">{user.companyCode || "company-code"}</p>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  badgeStyles[user.role]
                }`}
              >
                {user.role}
              </span>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="mt-4 w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <main className="space-y-4">
        {banner ? (
          <div className="rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800">
            {banner}
          </div>
        ) : null}
        {children}
      </main>
    </div>
  </div>
);
