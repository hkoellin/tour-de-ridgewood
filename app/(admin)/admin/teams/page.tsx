"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { TeamForm } from "@/components/admin/TeamForm";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Team {
  id: string;
  name: string;
  color: string;
  _count: { runners: number };
}

export default function AdminTeamsPage() {
  const { data: teams, isLoading } = useSWR<Team[]>("/api/admin/teams", fetcher);
  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleCreate = async (data: Record<string, unknown>) => {
    const res = await fetch("/api/admin/teams", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.error ?? "Failed to create team"); }
    await mutate("/api/admin/teams");
    setShowForm(false);
  };

  const handleEdit = async (data: Record<string, unknown>) => {
    if (!editingTeam) return;
    const res = await fetch(`/api/admin/teams/${editingTeam.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.error ?? "Failed to update team"); }
    await mutate("/api/admin/teams");
    setEditingTeam(null);
  };

  const handleDelete = async (team: Team) => {
    if (!confirm(`Delete team "${team.name}"?`)) return;
    setDeleteError(null);
    const res = await fetch(`/api/admin/teams/${team.id}`, { method: "DELETE" });
    if (!res.ok) {
      if (res.status === 409) setDeleteError("Cannot delete team with assigned runners.");
      else setDeleteError("Failed to delete team.");
      return;
    }
    await mutate("/api/admin/teams");
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-race-black">Teams</h1>
        <button onClick={() => { setShowForm(true); setEditingTeam(null); }}
          className="bg-race-black text-race-yellow font-black px-4 py-2 rounded hover:bg-gray-900 transition-colors text-sm">
          + New Team
        </button>
      </div>

      {deleteError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded p-3 mb-4">{deleteError}</div>
      )}

      {showForm && !editingTeam && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="font-black text-race-black mb-4">New Team</h2>
          <TeamForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {editingTeam && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="font-black text-race-black mb-4">Edit {editingTeam.name}</h2>
          <TeamForm initial={editingTeam} onSubmit={handleEdit} onCancel={() => setEditingTeam(null)} isEdit />
        </div>
      )}

      {isLoading ? <p className="text-gray-500 text-sm">Loading…</p> : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="px-4 py-3 text-gray-500 font-semibold text-xs uppercase">Team</th>
                <th className="px-4 py-3 text-gray-500 font-semibold text-xs uppercase text-center">Runners</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {(teams ?? []).map((team) => (
                <tr key={team.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: team.color }} />
                      <span className="font-semibold text-race-black">{team.name}</span>
                      <span className="text-xs text-gray-400 font-mono">{team.color}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">{team._count.runners}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setEditingTeam(team); setShowForm(false); }}
                        className="text-xs text-blue-600 hover:underline font-semibold">Edit</button>
                      <button onClick={() => handleDelete(team)}
                        className="text-xs text-red-500 hover:underline font-semibold">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {(teams ?? []).length === 0 && (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400 text-sm">No teams yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
