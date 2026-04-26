"use client";

import { useState, FormEvent } from "react";

interface StageFormProps {
  initial?: Partial<{
    stageNumber: number;
    name: string;
    date: string;
    startLocation: string;
    endLocation: string;
    distanceKm: number;
    elevationDescription: string;
    stageType: "FLAT" | "HILLY" | "MIXED";
    description: string;
    stravaEmbedUrl: string;
  }>;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

export function StageForm({ initial = {}, onSubmit, onCancel, isEdit = false }: StageFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const form = e.currentTarget;
    const getValue = (name: string) => (form.elements.namedItem(name) as HTMLInputElement)?.value ?? "";

    try {
      await onSubmit({
        stageNumber: parseInt(getValue("stageNumber"), 10),
        name: getValue("name"),
        date: getValue("date"),
        startLocation: getValue("startLocation"),
        endLocation: getValue("endLocation"),
        distanceKm: parseFloat(getValue("distanceKm")),
        elevationDescription: getValue("elevationDescription") || null,
        stageType: getValue("stageType"),
        description: getValue("description") || null,
        stravaEmbedUrl: getValue("stravaEmbedUrl") || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded p-3">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Stage Number *</label>
          <input name="stageNumber" type="number" min="1" max="8" defaultValue={initial.stageNumber} required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Type *</label>
          <select name="stageType" defaultValue={initial.stageType ?? "FLAT"} required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
            <option value="FLAT">Flat</option>
            <option value="HILLY">Hilly</option>
            <option value="MIXED">Mixed</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Name *</label>
        <input name="name" type="text" defaultValue={initial.name} required
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Date *</label>
        <input name="date" type="date" defaultValue={initial.date} required
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Start Location *</label>
          <input name="startLocation" type="text" defaultValue={initial.startLocation} required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">End Location *</label>
          <input name="endLocation" type="text" defaultValue={initial.endLocation} required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Distance (km) *</label>
        <input name="distanceKm" type="number" step="0.1" min="0.1" defaultValue={initial.distanceKm} required
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Elevation Description</label>
        <input name="elevationDescription" type="text" defaultValue={initial.elevationDescription}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
        <textarea name="description" rows={3} defaultValue={initial.description}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Strava Embed URL</label>
        <input name="stravaEmbedUrl" type="url" defaultValue={initial.stravaEmbedUrl}
          placeholder="https://www.strava.com/routes/12345/embed"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isLoading}
          className="bg-race-black text-race-yellow font-black px-6 py-2 rounded hover:bg-gray-900 transition-colors disabled:opacity-50">
          {isLoading ? "Saving…" : isEdit ? "Update Stage" : "Create Stage"}
        </button>
        <button type="button" onClick={onCancel}
          className="border border-gray-300 text-gray-700 font-semibold px-6 py-2 rounded hover:bg-gray-50 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
