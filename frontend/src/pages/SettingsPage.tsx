export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Settings</p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-800">Operations configuration</h2>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card-surface rounded-2xl p-5">
          <h3 className="text-lg font-semibold text-slate-800">Workspace preferences</h3>
          <div className="mt-4 space-y-4 text-sm text-slate-600">
            <label className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><span>Auto-assign priority</span><input type="checkbox" defaultChecked className="h-4 w-4" /></label>
            <label className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><span>Enable AI suggestions</span><input type="checkbox" defaultChecked className="h-4 w-4" /></label>
            <label className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><span>Send SLA alerts</span><input type="checkbox" defaultChecked className="h-4 w-4" /></label>
          </div>
        </div>

        <div className="card-surface rounded-2xl p-5">
          <h3 className="text-lg font-semibold text-slate-800">System status</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="rounded-xl bg-slate-50 p-3">API status: <span className="font-semibold text-emerald-700">Healthy</span></div>
            <div className="rounded-xl bg-slate-50 p-3">Database: <span className="font-semibold text-emerald-700">Connected</span></div>
            <div className="rounded-xl bg-slate-50 p-3">AI layer: <span className="font-semibold text-amber-700">Fallback mode</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
