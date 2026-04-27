"use client";

import { useState, FormEvent } from "react";

interface Team {
  id: string;
  name: string;
}

interface RunnerFormProps {
  initial?: Partial<{ name: string; teamId: string; stravaHandle: string }>;
  teams: Team[];
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

export function RunnerForm({ initial = {}, teams, onSubmit, onCancel, isEdit = false }: RunnerFormProps) {
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
        name: getValue("name"),
        teamId: getValue("teamId"),
        stravaHandle: getValue("stravaHandle") || null,
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

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Runner Name *</label>
        <input name="name" type="text" defaultValue={initial.name} required
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Team *</label>
        <select name="teamId" defaultValue={initial.teamId ?? ""} required
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
          <option value="" disabled>Select a team…</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>{team.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Strava Handle</label>
        <input name="stravaHandle" type="text" defaultValue={initial.stravaHandle}
          placeholder="e.g. @johndoe (optional hint)"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
        <p className="text-xs text-gray-500 mt-1">Used as a hint to link to the runner&apos;s Strava account.</p>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isLoading}
          className="bg-race-black text-race-yellow font-black px-6 py-2 rounded hover:bg-gray-900 transition-colors disabled:opacity-50">
          {isLoading ? "Saving…" : isEdit ? "Update Runner" : "Add Runner"}
        </button>
        <button type="button" onClick={onCancel}
          className="border border-gray-300 text-gray-700 font-semibold px-6 py-2 rounded hover:bg-gray-50 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
