import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { StageMap } from "@/components/stages/StageMap";
import { Badge } from "@/components/ui/Badge";
import { auth } from "@/lib/auth/config";

interface StageDetailPageProps {
  params: { stageNumber: string };
}

export async function generateMetadata({ params }: StageDetailPageProps): Promise<Metadata> {
  const stageNumber = parseInt(params.stageNumber, 10);
  if (isNaN(stageNumber)) return { title: "Stage Not Found" };

  const stage = await prisma.stage.findUnique({ where: { stageNumber } });
  if (!stage) return { title: "Stage Not Found" };

  return {
    title: stage.name,
    description: stage.description ?? `Stage ${stage.stageNumber} of the Tour de Ridgewood.`,
  };
}

const STAGE_TYPE_LABELS: Record<string, string> = {
  FLAT: "Flat",
  HILLY: "Hilly",
  MIXED: "Mixed",
};

export default async function StageDetailPage({ params }: StageDetailPageProps) {
  const stageNumber = parseInt(params.stageNumber, 10);
  if (isNaN(stageNumber)) notFound();

  const [stage, session] = await Promise.all([
    prisma.stage.findUnique({ where: { stageNumber } }),
    auth(),
  ]);

  if (!stage) notFound();

  const dateStr = new Date(stage.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back link */}
      <Link
        href="/route"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-race-black mb-8 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        All Stages
      </Link>

      {/* Stage header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="bg-race-black text-race-yellow rounded-lg w-16 h-16 flex items-center justify-center flex-shrink-0">
          <span className="text-3xl font-black">{stage.stageNumber}</span>
        </div>
        <div>
          <h1 className="text-3xl font-black text-race-black uppercase tracking-tight mb-1">
            {stage.name}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <span>{dateStr}</span>
            <Badge variant="black">
              {STAGE_TYPE_LABELS[stage.stageType] ?? stage.stageType}
            </Badge>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="mb-8">
        <StageMap stravaEmbedUrl={stage.stravaEmbedUrl} stageName={stage.name} />
      </div>

      {/* Stage details */}
      <div className="grid sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-1">Distance</p>
          <p className="text-2xl font-black text-race-black">{stage.distanceKm}</p>
          <p className="text-sm text-gray-500">kilometers</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-1">Start</p>
          <p className="font-semibold text-race-black">{stage.startLocation}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-1">Finish</p>
          <p className="font-semibold text-race-black">{stage.endLocation}</p>
        </div>
      </div>

      {/* Elevation description */}
      {stage.elevationDescription && (
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-400 mb-2">
            Elevation
          </h2>
          <p className="text-gray-700">{stage.elevationDescription}</p>
        </div>
      )}

      {/* Stage description */}
      {stage.description && (
        <div className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-400 mb-2">
            About this Stage
          </h2>
          <p className="text-gray-700 leading-relaxed">{stage.description}</p>
        </div>
      )}

      {/* Submit result CTA for authenticated runners */}
      {session?.user?.runnerId && (
        <div className="border-t border-gray-200 pt-8">
          <Link
            href={`/submit/${stage.stageNumber}`}
            className="inline-flex items-center gap-2 bg-strava-orange text-white font-semibold px-6 py-3 rounded hover:bg-orange-600 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
            </svg>
            Submit Your Result
          </Link>
        </div>
      )}
    </div>
  );
}
