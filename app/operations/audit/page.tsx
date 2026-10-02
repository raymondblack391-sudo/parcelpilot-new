import Link from "next/link";
import RequireAuth from "@/app/components/RequireAuth";
import StaffNav from "@/app/components/StaffNav";
import { createClient } from "@/lib/supabase/server";

export default async function AuditLogPage() {
  const supabase = await createClient();

  const { data: logs, error } = await supabase
    .from("shipment_audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <RequireAuth>
      <div className="min-h-screen bg-slate-50">
        <StaffNav />

        <main className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-blue-600">
                Security & Operations
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                Shipment Audit Log
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                A record of important shipment changes and operational actions.
              </p>
            </div>

            <Link
              href="/operations/shipment"
              className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Back to Shipments
            </Link>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
              Unable to load audit logs.
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <p className="text-sm font-bold text-slate-950">
                Recent Activity
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Showing the latest 200 operational actions.
              </p>
            </div>

            {!logs || logs.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <p className="text-sm font-bold text-slate-700">
                  No audit activity yet.
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Shipment actions will appear here as they are recorded.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="grid gap-4 px-6 py-5 lg:grid-cols-[180px_180px_1fr_180px]"
                  >
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                        Time
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                        Shipment
                      </p>

                      <Link
                        href={`/operations/shipment/edit/${encodeURIComponent(
                          log.tracking_number
                        )}`}
                        className="mt-1 inline-block text-sm font-black text-blue-600 hover:text-blue-700"
                      >
                        {log.tracking_number}
                      </Link>
                    </div>

                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                        Action
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-950">
                        {log.action}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {log.description}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                        Performed By
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {log.performed_by || "Staff"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </RequireAuth>
  );
}
