"use client";

import { FormEvent } from "react";

export default function TrackingSearch() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const input = form.elements.namedItem(
      "tracking"
    ) as HTMLInputElement;

    const value = input.value.trim();

    if (!value) {
      return;
    }

    window.location.href =
      `/track/${encodeURIComponent(value)}`;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="hidden items-center gap-2 sm:flex"
    >
      <input
        name="tracking"
        placeholder="Tracking number"
        className="w-44 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-orange-500"
      />

      <button
        type="submit"
        className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600"
      >
        Track
      </button>
    </form>
  );
}
