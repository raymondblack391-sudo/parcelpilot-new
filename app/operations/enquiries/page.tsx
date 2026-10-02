"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import RequireAuth from "@/app/components/RequireAuth";
import StaffNav from "@/app/components/StaffNav";

type ContactMessage = {
  id: string;
  full_name: string;
  email: string;
  tracking_number: string | null;
  subject: string;
  message: string;
  status: string;
  created_at: string;
};

function statusClass(status: string) {
  if (status === "New") {
    return "bg-blue-100 text-blue-700";
  }

  if (status === "In Progress") {
    return "bg-amber-100 text-amber-700";
  }

  if (status === "Resolved") {
    return "bg-emerald-100 text-emerald-700";
  }

  return "bg-slate-100 text-slate-700";
}

function formatDate(date: string) {
  return new Date(date).toLocaleString();
}

export default function EnquiriesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] =
    useState<ContactMessage | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadMessages() {
    try {
      setError("");

      const { data, error: fetchError } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (fetchError) {
        throw fetchError;
      }

      const loadedMessages =
        (data as ContactMessage[]) || [];

      setMessages(loadedMessages);

      setSelectedMessage((current) => {
        if (!current) {
          return null;
        }

        const updatedSelected = loadedMessages.find(
          (item) => item.id === current.id
        );

        return updatedSelected || null;
      });
    } catch (err) {
      console.error(err);
      setError("Unable to load customer enquiries.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMessages();

    const channel = supabase
      .channel("contact-messages-enquiries")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "contact_messages",
        },
        () => {
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function updateStatus(
    messageId: string,
    newStatus: string
  ) {
    try {
      setUpdating(true);
      setError("");
      setMessage("");

      const { error: updateError } = await supabase
        .from("contact_messages")
        .update({
          status: newStatus,
        })
        .eq("id", messageId);

      if (updateError) {
        throw updateError;
      }

      setMessages((current) =>
        current.map((item) =>
          item.id === messageId
            ? {
                ...item,
                status: newStatus,
              }
            : item
        )
      );

      setSelectedMessage((current) =>
        current && current.id === messageId
          ? {
              ...current,
              status: newStatus,
            }
          : current
      );

      setMessage(
        `Enquiry status updated to ${newStatus}.`
      );
    } catch (err) {
      console.error(err);

      setError(
        "Unable to update the enquiry status."
      );
    } finally {
      setUpdating(false);
    }
  }

  const filteredMessages = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return messages.filter((item) => {
      const matchesStatus =
        statusFilter === "All" ||
        item.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!searchText) {
        return true;
      }

      return (
        item.full_name
          .toLowerCase()
          .includes(searchText) ||
        item.email
          .toLowerCase()
          .includes(searchText) ||
        item.subject
          .toLowerCase()
          .includes(searchText) ||
        (item.tracking_number || "")
          .toLowerCase()
          .includes(searchText) ||
        item.message
          .toLowerCase()
          .includes(searchText)
      );
    });
  }, [messages, search, statusFilter]);

  const totalCount = messages.length;

  const newCount = messages.filter(
    (item) => item.status === "New"
  ).length;

  const inProgressCount = messages.filter(
    (item) => item.status === "In Progress"
  ).length;

  const resolvedCount = messages.filter(
    (item) => item.status === "Resolved"
  ).length;

  function selectEnquiry(item: ContactMessage) {
    setSelectedMessage(item);
    setMessage("");
    setError("");
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-slate-50">
        <StaffNav />

        <main className="mx-auto max-w-7xl px-6 py-10">
          {/* Header */}
          <div className="mb-8">
            <p className="text-sm font-bold uppercase tracking-widest text-orange-600">
              Customer Support
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Customer Enquiries
            </h1>

            <p className="mt-2 max-w-2xl text-slate-600">
              Review customer questions, respond to
              enquiries, and manage their status from
              one place.
            </p>
          </div>

          {/* Statistics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Total Enquiries
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-950">
                {totalCount}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                New
              </p>

              <p className="mt-2 text-3xl font-bold text-blue-600">
                {newCount}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                In Progress
              </p>

              <p className="mt-2 text-3xl font-bold text-amber-600">
                {inProgressCount}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Resolved
              </p>

              <p className="mt-2 text-3xl font-bold text-emerald-600">
                {resolvedCount}
              </p>
            </div>
          </div>

          {/* Search and filter */}
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-950">
                Search & Filter Enquiries
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                These controls only filter the list.
                They do not change an enquiry&apos;s
                status.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="search"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Search
                </label>

                <input
                  id="search"
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search name, email, subject or tracking number"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label
                  htmlFor="statusFilter"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Filter by status
                </label>

                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                >
                  <option value="All">
                    Show All Enquiries
                  </option>

                  <option value="New">
                    Show New
                  </option>

                  <option value="In Progress">
                    Show In Progress
                  </option>

                  <option value="Resolved">
                    Show Resolved
                  </option>
                </select>
              </div>
            </div>
          </section>

          {/* Messages */}
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_420px]">
            {/* Enquiry list */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-slate-950">
                      Enquiries
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {filteredMessages.length}{" "}
                      {filteredMessages.length === 1
                        ? "enquiry"
                        : "enquiries"}{" "}
                      shown
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter("All");
                      setSearch("");
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Show All
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="p-10 text-center text-sm text-slate-500">
                  Loading enquiries...
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="font-semibold text-slate-800">
                    No enquiries found.
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    No enquiries match the current
                    search or filter.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter("All");
                      setSearch("");
                    }}
                    className="mt-5 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
                  >
                    Show All Enquiries
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredMessages.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        selectEnquiry(item)
                      }
                      className={`block w-full cursor-pointer p-6 text-left transition hover:bg-orange-50 ${
                        selectedMessage?.id === item.id
                          ? "bg-orange-50"
                          : "bg-white"
                      }`}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="font-bold text-slate-950">
                              {item.full_name}
                            </h3>

                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusClass(
                                item.status
                              )}`}
                            >
                              {item.status}
                            </span>
                          </div>

                          <p className="mt-1 text-sm text-slate-500">
                            {item.email}
                          </p>

                          <p className="mt-3 font-semibold text-slate-800">
                            {item.subject}
                          </p>

                          <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                            {item.message}
                          </p>
                        </div>

                        <div className="shrink-0 text-left sm:text-right">
                          <p className="text-xs text-slate-400">
                            {formatDate(
                              item.created_at
                            )}
                          </p>

                          {item.tracking_number && (
                            <p className="mt-2 text-xs font-bold text-orange-600">
                              {item.tracking_number}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Selected enquiry */}
            <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              {!selectedMessage ? (
                <div className="flex min-h-[400px] items-center justify-center p-8 text-center">
                  <div>
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-2xl">
                      ✉
                    </div>

                    <h2 className="mt-5 font-bold text-slate-950">
                      Select an Enquiry
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Click an enquiry from the list
                      to view the full message and
                      manage its status.
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="border-b border-slate-200 p-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-orange-600">
                      Selected Enquiry
                    </p>

                    <h2 className="mt-2 text-xl font-bold text-slate-950">
                      {selectedMessage.full_name}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {selectedMessage.email}
                    </p>
                  </div>

                  <div className="space-y-6 p-6">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Subject
                      </p>

                      <p className="mt-2 font-semibold text-slate-900">
                        {selectedMessage.subject}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Tracking Number
                      </p>

                      {selectedMessage.tracking_number ? (
                        <Link
                          href={`/track/${selectedMessage.tracking_number}`}
                          className="mt-2 inline-block font-bold text-orange-600 hover:text-orange-700 hover:underline"
                        >
                          {selectedMessage.tracking_number}
                        </Link>
                      ) : (
                        <p className="mt-2 text-sm text-slate-500">
                          No tracking number provided
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Received
                      </p>

                      <p className="mt-2 text-sm text-slate-700">
                        {formatDate(
                          selectedMessage.created_at
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Customer Message
                      </p>

                      <div className="mt-2 rounded-xl bg-slate-50 p-4">
                        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                          {selectedMessage.message}
                        </p>
                      </div>
                    </div>

                    {/* Status management */}
                    <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
                      <h3 className="font-bold text-slate-950">
                        Manage Enquiry Status
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        Changing the status here updates
                        the enquiry in the database.
                      </p>

                      <label
                        htmlFor="enquiryStatus"
                        className="mt-4 block text-sm font-semibold text-slate-700"
                      >
                        Change Status
                      </label>

                      <select
                        id="enquiryStatus"
                        value={selectedMessage.status}
                        disabled={updating}
                        onChange={(event) =>
                          updateStatus(
                            selectedMessage.id,
                            event.target.value
                          )
                        }
                        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="New">
                          Set to New
                        </option>

                        <option value="In Progress">
                          Set to In Progress
                        </option>

                        <option value="Resolved">
                          Set to Resolved
                        </option>
                      </select>

                      <div className="mt-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${statusClass(
                            selectedMessage.status
                          )}`}
                        >
                          Current status:{" "}
                          {selectedMessage.status}
                        </span>
                      </div>
                    </div>

                    {message && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
                        {message}
                      </div>
                    )}

                    {error && (
                      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                        {error}
                      </div>
                    )}

                    <div>
                      <a
                        href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(
                          `Re: ${selectedMessage.subject}`
                        )}`}
                        className="inline-flex w-full items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
                      >
                        Reply by Email
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </aside>
          </div>

          <footer className="mt-12 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
            ParcelPilot Logistics · Customer Support
          </footer>
        </main>
      </div>
    </RequireAuth>
  );
}