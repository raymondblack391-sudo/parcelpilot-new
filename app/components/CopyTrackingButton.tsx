"use client";

type Props = {
  trackingNumber: string;
};

export default function CopyTrackingButton({
  trackingNumber,
}: Props) {
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(trackingNumber);
    } catch {
      const textarea = document.createElement("textarea");

      textarea.value = trackingNumber;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";

      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="mt-3 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-orange-500/50 hover:text-orange-400"
    >
      Copy Tracking Number
    </button>
  );
}
