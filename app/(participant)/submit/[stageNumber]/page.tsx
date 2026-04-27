"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { ActivityPicker } from "@/components/results/ActivityPicker";
import type { StravaActivity } from "@/lib/strava/activities";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface SubmitPageProps {
  params: { stageNumber: string };
}

export default function SubmitResultPage({ params }: SubmitPageProps) {
  const { status } = useSession();
  const router = useRouter();
  const stageNumber = params.stageNumber;

  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  const { data: activities, isLoading: loadingActivities, error: activitiesError } = useSWR<StravaActivity[]>(
    status === "authenticated" ? `/api/participant/activities/${stageNumber}` : null,
    fetcher
  );

  const { data: stage } = useSWR(
    `/api/stages/${stageNumber}`,
    fetcher
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/api/auth/signin/strava`);
    }
  }, [status, router]);

  const handleConfirm = async () => {
    if (!selectedActivityId || !activities) return;

    const activity = activities.find((a) => a.id === selectedActivityId);
    if (!activity) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const stageResponse = await fetch(`/api/stages/${stageNumber}`);
      if (!stageResponse.ok) throw new Error("Stage not found");
      const stageData = await stageResponse.json();

      const res = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stageId: stageData.id,
          elapsedSeconds: activity.elapsed_time,
          stravaActivityId: String(activity.id),
        }),
      });

      if (!res.ok) {
        if (res.status === 409) {
          setAlreadySubmitted(true);
          return;
        }
        const data = await res.json();
        throw new Error(data.error ?? "Submission failed");
      }

      router.push(`/results/${stageNumber}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading" || loadingActivities) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-24 bg-gray-200 rounded w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-race-black">
          Submit Result
          {stage && <span className="text-gray-400 font-normal"> · Stage {stageNumber}</span>}
        </h1>
        {stage && (
          <p className="text-gray-600 mt-1">{stage.name}</p>
        )}
      </div>

      {alreadySubmitted && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm font-semibold text-yellow-800">
            You&apos;ve already submitted a result for this stage. Selecting a new activity will update your time.
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {activitiesError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">
            Unable to load Strava activities. Please try again later.
          </p>
        </div>
      ) : (
        <ActivityPicker
          activities={activities ?? []}
          selectedId={selectedActivityId}
          onSelect={setSelectedActivityId}
          onConfirm={handleConfirm}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
