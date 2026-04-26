import Link from "next/link";
import type { Stage } from "@prisma/client";
import { Badge } from "@/components/ui/Badge";

const STAGE_TYPE_LABELS: Record<string, string> = {
  FLAT: "Flat",
  HILLY: "Hilly",
  MIXED: "Mixed",
};

interface StageCardProps {
  stage: Stage;
}

export function StageCard({ stage }: StageCardProps) {
  const dateStr = new Date(stage.date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link
      href={`/route/${stage.stageNumber}`}
      className="group block border border-gray-200 rounded-lg hover:border-race-yellow hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      <div className="flex items-stretch">
        {/* Stage number badge */}
        <div className="bg-race-black text-race-yellow flex-shrink-0 w-16 flex items-center justify-center">
          <span className="text-2xl font-black">{stage.stageNumber}</span>
        </div>

        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h2 className="font-bold text-race-black text-lg leading-tight group-hover:text-race-black">
              {stage.name}
            </h2>
            <Badge variant="black">{STAGE_TYPE_LABELS[stage.stageType] ?? stage.stageType}</Badge>
          </div>

          <p className="text-sm text-gray-500 mb-3">{dateStr}</p>

          <div className="flex items-center gap-1 text-sm text-gray-600">
            <span className="font-medium">{stage.startLocation}</span>
            <span className="text-gray-400 mx-1">→</span>
            <span className="font-medium">{stage.endLocation}</span>
          </div>

          <p className="text-sm text-gray-500 mt-1">{stage.distanceKm} km</p>
        </div>
      </div>
    </Link>
  );
}
