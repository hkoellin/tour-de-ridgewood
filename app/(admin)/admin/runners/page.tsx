"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { RunnerForm } from "@/components/admin/RunnerForm";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Runner {
  id: string;
  name: string;
  teamId: string;
  stravaAthleteId: string | null;
  team: { name: string; color: string };
}

interface Team {
  id: string;
  name: string;
}

export default function AdminRunnersPage() {
  const { data: runners, isLoading } = useSWR<Runner[]>("/api/admin/runners", fetcher);
  const { data: teams } = useSWR<Team[]>("/api/teams", fetcher);
  const [showForm, setShowForm] = useState(false);
  const [editingRunner, setEditingRunner] = useState<Runner | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleCreate = async (data: Record<string, unknown>) => {
    const res = await fetch("/api/admin/runners", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.error ?? "Failed to add runner"); }
    await mutate("/api/admin/runners");
    setShowForm(false);
  };

  const handleEdit = async (data: Record<string, unknown>) => {
    if (!editingRunner) return;
    const res = await fetch(`/api/admin/runners/${editingRunner.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.error ?? "Failed to update runner"); }
    await mutate("/api/admin/runners");
    setEditingRunner(null);
  };

  const handleDelete = async (runner: Runner) => {
    if (!confirm(`Remove runner "${runner.name}"? This also removes their Strava connection.`)) return;
    setDeleteError(null);
    const res = await fetch(`/api/admin/runners/${runner.id}`, { method: "DELETE" });
    if (!res.ok) { setDeleteError("Failed to delete runner."); return; }
    await mutate("/api/admin/runners");
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-race-black">Runners</h1>
        <button onClick={() => { setShowForm(true); setEditingRunner(null); }}
          className="bg-race-black text-race-yellow font-black px-4 py-2 rounded hover:bg-gray-900 transition-colors text-sm">
          + Add Runner
        </button>
      </div>

      {deleteError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded p-3 mb-4">{deleteError}</div>
      )}

      {showForm && !editingRunner && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="font-black text-race-black mb-4">Add Runner</h2>
          <RunnerForm teams={teams ?? []} onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {editingRunner && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="font-black text-race-black mb-4">Edit {editingRunner.name}</h2>
          <RunnerForm
            initial={{ name: editingRunner.name, teamId: editingRunner.teamId }}
            teams={teams ?? []}
            onSubmit={handleEdit}
            onCancel={() => setEditingRunner(null)}
            isEdit
          />
        </div>
      )}

      {isLoading ? <p className="text-gray-500 text-sm">Loading…</p> : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="px-4 py-3 text-gray-500 font-semibold text-xs uppercase">Runner</th>
                <th className="px-4 py-3 text-gray-500 font-semibold text-xs uppercase">Team</th>
                <th className="px-4 py-3 text-gray-500 font-semibold text-xs uppercase text-center hidden sm:table-cell">Strava</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {(runners ?? []).map((runner) => (
                <tr key={runner.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 font-semibold text-race-black">{runner.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: runner.team.color }} />
                      <span className="text-gray-600">{runner.team.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    {runner.stravaAthleteId ? (
                      <span className="text-xs bg-strava-orange/10 text-strava-orange font-bold px-2 py-0.5 rounded">Linked</span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setEditingRunner(runner); setShowForm(false); }}
                        className="text-xs text-blue-600 hover:underline font-semibold">Edit</button>
                      <button onClick={() => handleDelete(runner)}
                        className="text-xs text-red-500 hover:underline font-semibold">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {(runners ?? []).length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">No runners yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
