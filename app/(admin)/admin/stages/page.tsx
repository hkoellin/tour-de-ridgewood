"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { StageForm } from "@/components/admin/StageForm";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Stage {
  id: string;
  stageNumber: number;
  name: string;
  date: string;
  stageType: "FLAT" | "HILLY" | "MIXED";
  distanceKm: number;
  startLocation: string;
  endLocation: string;
}

export default function AdminStagesPage() {
  const { data: stages, isLoading } = useSWR<Stage[]>("/api/admin/stages", fetcher);
  const [showForm, setShowForm] = useState(false);
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleCreate = async (data: Record<string, unknown>) => {
    const res = await fetch("/api/admin/stages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Failed to create stage");
    }
    await mutate("/api/admin/stages");
    setShowForm(false);
  };

  const handleEdit = async (data: Record<string, unknown>) => {
    if (!editingStage) return;
    const res = await fetch(`/api/admin/stages/${editingStage.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Failed to update stage");
    }
    await mutate("/api/admin/stages");
    setEditingStage(null);
  };

  const handleDelete = async (stage: Stage) => {
    if (!confirm(`Delete Stage ${stage.stageNumber}: ${stage.name}?`)) return;
    setDeleteError(null);
    const res = await fetch(`/api/admin/stages/${stage.id}`, { method: "DELETE" });
    if (!res.ok) {
      if (res.status === 409) {
        setDeleteError("Cannot delete a stage that has results submitted.");
      } else {
        setDeleteError("Failed to delete stage.");
      }
      return;
    }
    await mutate("/api/admin/stages");
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-race-black">Stages</h1>
        <button
          onClick={() => { setShowForm(true); setEditingStage(null); }}
          className="bg-race-black text-race-yellow font-black px-4 py-2 rounded hover:bg-gray-900 transition-colors text-sm"
        >
          + New Stage
        </button>
      </div>

      {deleteError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded p-3 mb-4">{deleteError}</div>
      )}

      {(showForm && !editingStage) && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="font-black text-race-black mb-4">New Stage</h2>
          <StageForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {editingStage && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="font-black text-race-black mb-4">Edit Stage {editingStage.stageNumber}</h2>
          <StageForm
            initial={{
              ...editingStage,
              date: new Date(editingStage.date).toISOString().slice(0, 10),
            }}
            onSubmit={handleEdit}
            onCancel={() => setEditingStage(null)}
            isEdit
          />
        </div>
      )}

      {isLoading ? (
        <p className="text-gray-500 text-sm">Loading stages…</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="px-4 py-3 text-gray-500 font-semibold text-xs uppercase">#</th>
                <th className="px-4 py-3 text-gray-500 font-semibold text-xs uppercase">Name</th>
                <th className="px-4 py-3 text-gray-500 font-semibold text-xs uppercase hidden md:table-cell">Date</th>
                <th className="px-4 py-3 text-gray-500 font-semibold text-xs uppercase hidden md:table-cell">Type</th>
                <th className="px-4 py-3 text-gray-500 font-semibold text-xs uppercase hidden lg:table-cell">Distance</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {(stages ?? []).map((stage) => (
                <tr key={stage.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 font-bold text-gray-400">{stage.stageNumber}</td>
                  <td className="px-4 py-3 font-semibold text-race-black">{stage.name}</td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                    {new Date(stage.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{stage.stageType}</td>
                  <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{stage.distanceKm} km</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setEditingStage(stage); setShowForm(false); }}
                        className="text-xs text-blue-600 hover:underline font-semibold">Edit</button>
                      <button onClick={() => handleDelete(stage)}
                        className="text-xs text-red-500 hover:underline font-semibold">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {(stages ?? []).length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">No stages yet. Create the first one!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
