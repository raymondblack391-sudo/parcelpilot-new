"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import RequireAuth from "@/app/components/RequireAuth";
import StaffNav from "@/app/components/StaffNav";

type StaffRole =
  | "admin"
  | "operations"
  | "support"
  | "readonly";

type StaffStatus =
  | "active"
  | "suspended";

type StaffMember = {
  id: string;
  full_name: string | null;
  role: StaffRole;
  status: StaffStatus;
  created_at: string;
  updated_at: string;
};

function StaffManagement() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<
    "all" | StaffRole
  >("all");

  const [statusFilter, setStatusFilter] = useState<
    "all" | StaffStatus
  >("all");

  async function loadStaff() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase.rpc(
      "admin_list_staff"
    );

    if (error) {
      console.error(error);

      setError(
        error.message ||
          "Unable to load staff members."
      );

      setLoading(false);
      return;
    }

    setStaff((data ?? []) as StaffMember[]);
    setLoading(false);
  }

  useEffect(() => {
    loadStaff();
  }, []);

  async function updateRole(
    staffMember: StaffMember,
    newRole: StaffRole
  ) {
    if (staffMember.role === newRole) {
      return;
    }

    if (
      staffMember.role === "admin" &&
      newRole !== "admin"
    ) {
      const adminCount = staff.filter(
        (member) => member.role === "admin"
      ).length;

      if (adminCount <= 1) {
        setError(
          "You cannot remove the only Admin account."
        );

        return;
      }
    }

    setSavingId(staffMember.id);
    setError("");
    setMessage("");

    const { error } = await supabase.rpc(
      "admin_update_staff_role",
      {
        target_user_id: staffMember.id,
        new_role: newRole,
      }
    );

    if (error) {
      console.error(error);

      setError(
        error.message ||
          "Unable to update staff role."
      );

      setSavingId(null);
      return;
    }

    setStaff((current) =>
      current.map((member) =>
        member.id === staffMember.id
          ? {
              ...member,
              role: newRole,
              updated_at: new Date().toISOString(),
            }
          : member
      )
    );

    setMessage(
      `${staffMember.full_name || "Staff member"} is now ${newRole}.`
    );

    setSavingId(null);
  }

  async function updateStatus(
    staffMember: StaffMember,
    newStatus: StaffStatus
  ) {
    if (staffMember.status === newStatus) {
      return;
    }

    if (
      staffMember.role === "admin" &&
      newStatus === "suspended"
    ) {
      const activeAdminCount = staff.filter(
        (member) =>
          member.role === "admin" &&
          member.status === "active"
      ).length;

      if (activeAdminCount <= 1) {
        setError(
          "You cannot suspend the only active Admin account."
        );

        return;
      }
    }

    setSavingId(staffMember.id);
    setError("");
    setMessage("");

    const { error } = await supabase.rpc(
      "admin_update_staff_status",
      {
        target_user_id: staffMember.id,
        new_status: newStatus,
      }
    );

    if (error) {
      console.error(error);

      setError(
        error.message ||
          "Unable to update staff status."
      );

      setSavingId(null);
      return;
    }

    setStaff((current) =>
      current.map((member) =>
        member.id === staffMember.id
          ? {
              ...member,
              status: newStatus,
              updated_at: new Date().toISOString(),
            }
          : member
      )
    );

    setMessage(
      `${staffMember.full_name || "Staff member"} is now ${newStatus}.`
    );

    setSavingId(null);
  }

  const filteredStaff = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return staff.filter((member) => {
      const matchesSearch =
        !searchText ||
        (member.full_name ?? "")
          .toLowerCase()
          .includes(searchText) ||
        member.id.toLowerCase().includes(searchText) ||
        member.role.toLowerCase().includes(searchText) ||
        member.status.toLowerCase().includes(searchText);

      const matchesRole =
        roleFilter === "all" ||
        member.role === roleFilter;

      const matchesStatus =
        statusFilter === "all" ||
        member.status === statusFilter;

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [
    staff,
    search,
    roleFilter,
    statusFilter,
  ]);

  const totalStaff = staff.length;

  const activeStaff = staff.filter(
    (member) => member.status === "active"
  ).length;

  const suspendedStaff = staff.filter(
    (member) => member.status === "suspended"
  ).length;

  const adminStaff = staff.filter(
    (member) => member.role === "admin"
  ).length;

  const operationsStaff = staff.filter(
    (member) => member.role === "operations"
  ).length;

  const supportStaff = staff.filter(
    (member) => member.role === "support"
  ).length;

  const readonlyStaff = staff.filter(
    (member) => member.role === "readonly"
  ).length;

  return (
    <main className="min-h-screen bg-slate-50">
      <StaffNav />

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
            Administration
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Staff Management
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Manage ParcelPilot staff roles, account
            status, and access levels.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* Staff Overview */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Total
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-950">
              {totalStaff}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
              Active
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-700">
              {activeStaff}
            </p>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-red-600">
              Suspended
            </p>

            <p className="mt-2 text-2xl font-bold text-red-700">
              {suspendedStaff}
            </p>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
              Admin
            </p>

            <p className="mt-2 text-2xl font-bold text-blue-700">
              {adminStaff}
            </p>
          </div>

          <div className="rounded-2xl border border-purple-200 bg-purple-50 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-purple-600">
              Operations
            </p>

            <p className="mt-2 text-2xl font-bold text-purple-700">
              {operationsStaff}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-amber-600">
              Support
            </p>

            <p className="mt-2 text-2xl font-bold text-amber-700">
              {supportStaff}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-100 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
              Read Only
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-700">
              {readonlyStaff}
            </p>
          </div>
        </section>

        {/* Staff Accounts */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Staff Accounts
                  </h2>

                  <p className="text-sm text-slate-500">
                    Showing {filteredStaff.length} of{" "}
                    {staff.length} staff member
                    {staff.length === 1
                      ? ""
                      : "s"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={loadStaff}
                  disabled={loading}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                >
                  {loading
                    ? "Loading..."
                    : "Refresh Staff"}
                </button>
              </div>

              {/* Filters */}
              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Search
                  </label>

                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search staff..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Role
                  </label>

                  <select
                    value={roleFilter}
                    onChange={(event) =>
                      setRoleFilter(
                        event.target
                          .value as
                          | "all"
                          | StaffRole
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
                  >
                    <option value="all">
                      All Roles
                    </option>

                    <option value="admin">
                      Admin
                    </option>

                    <option value="operations">
                      Operations
                    </option>

                    <option value="support">
                      Support
                    </option>

                    <option value="readonly">
                      Read Only
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Status
                  </label>

                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(
                        event.target
                          .value as
                          | "all"
                          | StaffStatus
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
                  >
                    <option value="all">
                      All Statuses
                    </option>

                    <option value="active">
                      Active
                    </option>

                    <option value="suspended">
                      Suspended
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              Loading staff accounts...
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-semibold text-slate-700">
                No staff members match your filters.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setRoleFilter("all");
                  setStatusFilter("all");
                }}
                className="mt-3 text-sm font-bold text-blue-600 hover:text-blue-700"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredStaff.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-col gap-5 px-6 py-6 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-slate-950">
                        {member.full_name ||
                          "Unnamed Staff"}
                      </p>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          member.status === "active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {member.status ===
                        "active"
                          ? "Active"
                          : "Suspended"}
                      </span>
                    </div>

                    <p className="mt-1 break-all text-xs text-slate-500">
                      User ID: {member.id}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Created{" "}
                      {new Date(
                        member.created_at
                      ).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Role
                      </span>

                      <select
                        value={member.role}
                        disabled={
                          savingId === member.id
                        }
                        onChange={(event) =>
                          updateRole(
                            member,
                            event.target
                              .value as StaffRole
                          )
                        }
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 disabled:opacity-60"
                      >
                        <option value="admin">
                          Admin
                        </option>

                        <option value="operations">
                          Operations
                        </option>

                        <option value="support">
                          Support
                        </option>

                        <option value="readonly">
                          Read Only
                        </option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Status
                      </span>

                      <select
                        value={member.status}
                        disabled={
                          savingId === member.id
                        }
                        onChange={(event) =>
                          updateStatus(
                            member,
                            event.target
                              .value as StaffStatus
                          )
                        }
                        className={`rounded-xl border px-4 py-2.5 text-sm font-semibold outline-none disabled:opacity-60 ${
                          member.status ===
                          "active"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 focus:border-emerald-500"
                            : "border-red-200 bg-red-50 text-red-700 focus:border-red-500"
                        }`}
                      >
                        <option value="active">
                          Active
                        </option>

                        <option value="suspended">
                          Suspended
                        </option>
                      </select>
                    </div>

                    {savingId === member.id && (
                      <span className="text-xs font-semibold text-slate-500">
                        Saving...
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default function StaffManagementPage() {
  return (
    <RequireAuth>
      <StaffManagement />
    </RequireAuth>
  );
}