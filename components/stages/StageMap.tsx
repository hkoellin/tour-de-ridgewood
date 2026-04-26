interface StageMapProps {
  stravaEmbedUrl: string | null | undefined;
  stageName: string;
}

export function StageMap({ stravaEmbedUrl, stageName }: StageMapProps) {
  if (!stravaEmbedUrl) {
    return (
      <div className="w-full aspect-video bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-400">
        <svg
          className="w-12 h-12 mb-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-10l6-3m0 16l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4"
          />
        </svg>
        <p className="text-sm font-medium">Map coming soon</p>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video rounded-lg overflow-hidden border border-gray-200">
      <iframe
        src={stravaEmbedUrl}
        title={`Map for ${stageName}`}
        className="w-full h-full"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}
