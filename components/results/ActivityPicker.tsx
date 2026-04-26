"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import type { StravaActivity } from "@/lib/strava/activities";

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatDistance(meters: number): string {
  return (meters / 1000).toFixed(2) + " km";
}

interface ActivityPickerProps {
  activities: StravaActivity[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export function ActivityPicker({
  activities,
  selectedId,
  onSelect,
  onConfirm,
  isSubmitting = false,
}: ActivityPickerProps) {
  if (activities.length === 0) {
    return (
      <EmptyState
        title="No activities found"
        description="No Strava runs were found on this stage's date. Make sure your activity is recorded on Strava."
      />
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600 mb-4">
        Select the Strava activity that matches this stage:
      </p>

      <ul className="space-y-2">
        {activities.map((activity) => {
          const isSelected = selectedId === activity.id;
          return (
            <li key={activity.id}>
              <button
                type="button"
                onClick={() => onSelect(activity.id)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                  isSelected
                    ? "border-race-yellow bg-yellow-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <p className="font-semibold text-race-black">{activity.name}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {new Date(activity.start_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-mono font-semibold text-race-black">
                      {formatElapsed(activity.elapsed_time)}
                    </p>
                    <p className="text-xs text-gray-500">{formatDistance(activity.distance)}</p>
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="pt-4">
        <button
          type="button"
          onClick={onConfirm}
          disabled={selectedId === null || isSubmitting}
          className="w-full bg-race-black text-race-yellow font-black py-3 px-6 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-900 transition-colors"
        >
          {isSubmitting ? "Submitting…" : "Confirm Result"}
        </button>
      </div>
    </div>
  );
}
