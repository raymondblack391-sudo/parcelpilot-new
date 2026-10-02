"use client";

import { useMemo } from "react";

type Props = {
  currentStage: string | null;
};

const STAGES = [
  "Picked Up",
  "Origin Facility",
  "Origin Airport",
  "In Flight",
  "Destination Airport",
  "Customs Clearance",
  "Customs Released",
  "Destination Facility",
  "Out for Delivery",
  "Delivered",
];

export default function ShipmentJourneyProgress({
  currentStage,
}: Props) {
  const currentIndex = useMemo(() => {
    const index = STAGES.indexOf(currentStage || "");
    return index >= 0 ? index : 0;
  }, [currentStage]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Shipment Journey
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-950">
            International Delivery Progress
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Current operational stage:{" "}
            <span className="font-semibold text-slate-900">
              {currentStage || "Picked Up"}
            </span>
          </p>
        </div>

        <div className="text-sm font-semibold text-slate-500">
          {currentIndex + 1} of {STAGES.length}
        </div>
      </div>

      <div className="mt-8 overflow-x-auto pb-2">
        <div className="flex min-w-[850px] items-start">
          {STAGES.map((stage, index) => {
            const completed = index < currentIndex;
            const active = index === currentIndex;

            return (
              <div
                key={stage}
                className="flex flex-1 items-start"
              >
                <div className="flex min-w-0 flex-1 flex-col items-center text-center">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold ${
                      completed
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : active
                        ? "border-blue-600 bg-blue-600 text-white ring-4 ring-blue-100"
                        : "border-slate-300 bg-white text-slate-400"
                    }`}
                  >
                    {completed ? "✓" : index + 1}
                  </div>

                  <p
                    className={`mt-3 max-w-[90px] text-xs font-semibold leading-4 ${
                      active
                        ? "text-blue-700"
                        : completed
                        ? "text-emerald-700"
                        : "text-slate-500"
                    }`}
                  >
                    {stage}
                  </p>
                </div>

                {index < STAGES.length - 1 && (
                  <div
                    className={`mt-4 h-0.5 flex-1 ${
                      index < currentIndex
                        ? "bg-emerald-500"
                        : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 border-t border-slate-100 pt-5 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          Completed
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
          Current Stage
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full border border-slate-300 bg-white" />
          Upcoming
        </div>
      </div>
    </div>
  );
}
