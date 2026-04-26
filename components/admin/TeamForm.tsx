"use client";

import { useState, FormEvent } from "react";

interface TeamFormProps {
  initial?: Partial<{ name: string; color: string; logoUrl: string }>;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

export function TeamForm({ initial = {}, onSubmit, onCancel, isEdit = false }: TeamFormProps) {
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
        color: getValue("color"),
        logoUrl: getValue("logoUrl") || null,
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
        <label className="block text-sm font-semibold text-gray-700 mb-1">Team Name *</label>
        <input name="name" type="text" defaultValue={initial.name} required
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Color (hex) *</label>
        <div className="flex items-center gap-2">
          <input name="colorPicker" type="color" defaultValue={initial.color ?? "#FFD700"}
            onChange={(e) => {
              const hex = document.querySelector<HTMLInputElement>('input[name="color"]');
              if (hex) hex.value = e.target.value;
            }}
            className="h-9 w-14 rounded border border-gray-300 cursor-pointer" />
          <input name="color" type="text" defaultValue={initial.color ?? "#FFD700"} required
            pattern="^#[0-9A-Fa-f]{6}$"
            placeholder="#FFD700"
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm font-mono" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Logo URL</label>
        <input name="logoUrl" type="url" defaultValue={initial.logoUrl}
          placeholder="https://..."
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isLoading}
          className="bg-race-black text-race-yellow font-black px-6 py-2 rounded hover:bg-gray-900 transition-colors disabled:opacity-50">
          {isLoading ? "Saving…" : isEdit ? "Update Team" : "Create Team"}
        </button>
        <button type="button" onClick={onCancel}
          className="border border-gray-300 text-gray-700 font-semibold px-6 py-2 rounded hover:bg-gray-50 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
