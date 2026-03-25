"use client";

import { useState, useMemo } from "react";
import {
  Shield,
  Users,
  Search,
  Pencil,
  Trash2,
  ShieldCheck,
  ShieldOff,
  Factory,
  UserPlus,
  Vote,
  Play,
  Square,
  Trophy,
  History,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useAdmin } from "@/hooks/use-admin";
import { useAuth } from "@/hooks/use-auth";
import { useChallengeVote, type VoteTally } from "@/hooks/use-challenge-vote";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import { cn, timeAgo } from "@/lib/utils";
import type { AdminUser } from "@/types";

const PLANT_OPTIONS = [
  { value: "", label: "Select plant..." },
  { value: "Automotive Assembly", label: "Automotive Assembly" },
  { value: "Body Shop", label: "Body Shop" },
  { value: "Paint Shop", label: "Paint Shop" },
  { value: "Stamping Plant", label: "Stamping Plant" },
  { value: "Powertrain", label: "Powertrain" },
  { value: "Engine Plant", label: "Engine Plant" },
  { value: "Transmission Plant", label: "Transmission Plant" },
  { value: "Battery Plant", label: "Battery Plant" },
  { value: "Distribution Center", label: "Distribution Center" },
  { value: "Quality Lab", label: "Quality Lab" },
  { value: "R&D Center", label: "R&D Center" },
  { value: "Corporate Office", label: "Corporate Office" },
  { value: "Other", label: "Other" },
];

export default function AdminPage() {
  const { user } = useAuth();
  const { users, loading, updateUser, deleteUser } = useAdmin();
  const {
    activeSession,
    tallies,
    allSessions,
    startVoteSession,
    closeVoteSession,
    toggleFloorVisibility,
    getTalliesForSession,
    loading: voteLoading,
  } = useChallengeVote();
  const [search, setSearch] = useState("");
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [showStartVote, setShowStartVote] = useState(false);
  const [voteTitle, setVoteTitle] = useState("Priority Vote");
  const [voteDesc, setVoteDesc] = useState(
    "Rank the challenges that matter most to you."
  );
  const [voteSaving, setVoteSaving] = useState(false);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [sessionTallies, setSessionTallies] = useState<Record<string, VoteTally[]>>({});
  const [editForm, setEditForm] = useState({
    full_name: "",
    plant_name: "",
    role: "",
    is_admin: false,
  });
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.plant_name.toLowerCase().includes(q)
    );
  }, [users, search]);

  const stats = useMemo(() => {
    const plantCounts: Record<string, number> = {};
    const now = Date.now();
    let recentCount = 0;
    for (const u of users) {
      const plant = u.plant_name || "Unassigned";
      plantCounts[plant] = (plantCounts[plant] || 0) + 1;
      if (now - new Date(u.joined_at).getTime() < 7 * 24 * 60 * 60 * 1000) {
        recentCount++;
      }
    }
    return { total: users.length, plantCounts, recentCount };
  }, [users]);

  const topPlants = Object.entries(stats.plantCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  function openEdit(u: AdminUser) {
    setEditForm({
      full_name: u.full_name,
      plant_name: u.plant_name,
      role: u.role,
      is_admin: u.is_admin,
    });
    setEditUser(u);
  }

  async function handleSave() {
    if (!editUser) return;
    setSaving(true);
    try {
      await updateUser(editUser.id, editForm);
      setEditUser(null);
    } catch {
      // error handled by hook
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await deleteUser(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // error handled by hook
    } finally {
      setSaving(false);
    }
  }

  async function toggleAdmin(u: AdminUser) {
    await updateUser(u.id, { is_admin: !u.is_admin });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-steel-200 border-t-steel-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-5 h-5 text-steel-500" />
          <span className="text-sm font-medium text-steel-500">Admin</span>
        </div>
        <h1 className="text-3xl font-bold text-warm-900">
          Manage your team
        </h1>
        <p className="text-warm-500 mt-1">Users, plants, roles, and permissions — all in one place.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-steel-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-steel-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-warm-900">{stats.total}</p>
              <p className="text-xs text-warm-500">Total Users</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-forge-100 flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-forge-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-warm-900">
                {stats.recentCount}
              </p>
              <p className="text-xs text-warm-500">Joined This Week</p>
            </div>
          </CardContent>
        </Card>

        {topPlants.slice(0, 2).map(([plant, count]) => (
          <Card key={plant}>
            <CardContent className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-ember-100 flex items-center justify-center">
                <Factory className="w-6 h-6 text-ember-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-warm-900">{count}</p>
                <p className="text-xs text-warm-500 truncate">{plant}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Challenge Vote Management */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-ember-400 to-forge-500" />
        <CardContent className="pt-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ember-500 to-forge-600 flex items-center justify-center">
                <Vote className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-warm-900">Challenge Priority Vote</h2>
                <p className="text-xs text-warm-500">
                  {activeSession
                    ? `"${activeSession.title}" is live — users can vote on open challenges.`
                    : "Start a vote to let the team rank open challenges by importance."}
                </p>
              </div>
            </div>
            <div>
              {activeSession ? (
                <Button
                  variant="danger"
                  onClick={async () => {
                    setVoteSaving(true);
                    await closeVoteSession();
                    setVoteSaving(false);
                  }}
                  disabled={voteSaving}
                >
                  <Square className="w-4 h-4 mr-1.5" />
                  {voteSaving ? "Closing..." : "End Vote"}
                </Button>
              ) : (
                <Button
                  onClick={() => setShowStartVote(true)}
                >
                  <Play className="w-4 h-4 mr-1.5" />
                  Start a Vote
                </Button>
              )}
            </div>
          </div>

          {/* Live results when vote is active */}
          {activeSession && tallies.length > 0 && (
            <div className="space-y-2 mt-4 pt-4 border-t border-warm-100">
              <h3 className="text-sm font-medium text-warm-500 mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Live Rankings
              </h3>
              {tallies.slice(0, 5).map((t, i) => {
                const maxPts = tallies[0]?.total_points || 1;
                return (
                  <div
                    key={t.challenge_id}
                    className="flex items-center gap-3"
                  >
                    <span
                      className={cn(
                        "w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0",
                        i === 0 && t.total_points > 0
                          ? "bg-amber-400 text-white"
                          : "bg-warm-100 text-warm-500"
                      )}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-warm-800 truncate">
                        {t.title}
                      </p>
                      <div className="mt-1 h-1 bg-warm-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-ember-500 rounded-full transition-all"
                          style={{
                            width: `${(t.total_points / maxPts) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-bold text-warm-700 tabular-nums">
                      {t.total_points} pts
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Start Vote Modal */}
      <Modal
        open={showStartVote}
        onClose={() => setShowStartVote(false)}
        title="Start a Challenge Priority Vote"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-warm-600">
            This will appear on everyone&apos;s homepage. Each team member gets 10
            points to distribute across open challenges.
          </p>
          <Input
            label="Vote Title"
            value={voteTitle}
            onChange={(e) => setVoteTitle(e.target.value)}
            placeholder="e.g. Q2 Priority Vote"
          />
          <Input
            label="Description"
            value={voteDesc}
            onChange={(e) => setVoteDesc(e.target.value)}
            placeholder="What should people focus on?"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowStartVote(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                setVoteSaving(true);
                await startVoteSession(voteTitle, voteDesc);
                setVoteSaving(false);
                setShowStartVote(false);
              }}
              disabled={voteSaving || !voteTitle.trim()}
            >
              {voteSaving ? "Starting..." : "Launch Vote"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Vote History */}
      {allSessions.filter((s) => s.status === "closed").length > 0 && (
        <Card>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <History className="w-5 h-5 text-warm-500" />
              <h2 className="font-semibold text-warm-900">Vote History</h2>
            </div>
            <div className="space-y-2">
              {allSessions
                .filter((s) => s.status === "closed")
                .map((session) => (
                  <div key={session.id} className="border border-warm-200 rounded-lg overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-3 bg-warm-50/50">
                      <button
                        onClick={async () => {
                          if (expandedSession === session.id) {
                            setExpandedSession(null);
                          } else {
                            setExpandedSession(session.id);
                            if (!sessionTallies[session.id]) {
                              const t = await getTalliesForSession(session.id);
                              setSessionTallies((prev) => ({ ...prev, [session.id]: t }));
                            }
                          }
                        }}
                        className="p-0.5 text-warm-400 hover:text-warm-600 cursor-pointer"
                      >
                        {expandedSession === session.id ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-warm-900">{session.title}</p>
                        <p className="text-xs text-warm-500">
                          Closed {session.closed_at ? new Date(session.closed_at).toLocaleDateString() : "—"}
                        </p>
                      </div>
                      <button
                        onClick={async () => {
                          setVoteSaving(true);
                          await toggleFloorVisibility(session.id, !session.show_on_floor);
                          setVoteSaving(false);
                        }}
                        disabled={voteSaving}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border",
                          session.show_on_floor
                            ? "bg-forge-50 border-forge-300 text-forge-700 hover:bg-forge-100"
                            : "bg-white border-warm-200 text-warm-500 hover:border-warm-300"
                        )}
                        title={session.show_on_floor ? "Results visible on The Floor" : "Results hidden from The Floor"}
                      >
                        {session.show_on_floor ? (
                          <><Eye className="w-3.5 h-3.5" /> On Floor</>
                        ) : (
                          <><EyeOff className="w-3.5 h-3.5" /> Hidden</>
                        )}
                      </button>
                    </div>
                    {expandedSession === session.id && sessionTallies[session.id] && (
                      <div className="px-4 py-3 space-y-2 border-t border-warm-100">
                        {sessionTallies[session.id].length === 0 ? (
                          <p className="text-warm-500 text-xs text-center py-2">No votes recorded</p>
                        ) : (
                          sessionTallies[session.id].map((t, i) => {
                            const maxPts = sessionTallies[session.id][0]?.total_points || 1;
                            return (
                              <div key={t.challenge_id} className="flex items-center gap-3">
                                <span className={cn(
                                  "w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center flex-shrink-0",
                                  i === 0 && t.total_points > 0 ? "bg-amber-400 text-white" : "bg-warm-100 text-warm-500"
                                )}>
                                  {i + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-warm-800 truncate">{t.title}</p>
                                  <div className="mt-0.5 h-1 bg-warm-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-ember-500 rounded-full"
                                      style={{ width: `${(t.total_points / maxPts) * 100}%` }}
                                    />
                                  </div>
                                </div>
                                <span className="text-xs font-bold text-warm-600 tabular-nums">{t.total_points}</span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search & Table */}
      <Card>
        <div className="px-5 py-4 border-b border-warm-100 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400" />
            <input
              type="text"
              placeholder="Search by name, email, or plant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-warm-300 bg-white text-sm text-warm-900 focus:border-steel-400 focus:outline-none focus:ring-2 focus:ring-steel-400/20"
            />
          </div>
          <Badge>{filtered.length} users</Badge>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-warm-500 uppercase tracking-wider border-b border-warm-100">
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3 hidden sm:table-cell">Plant</th>
                <th className="px-5 py-3 hidden md:table-cell">Role</th>
                <th className="px-5 py-3 hidden lg:table-cell">Joined</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-100">
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-warm-50/50 transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={u.full_name}
                        src={u.avatar_url}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-warm-900 truncate">
                          {u.full_name || "—"}
                        </p>
                        <p className="text-xs text-warm-500 truncate">
                          {u.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 hidden sm:table-cell">
                    <span className="text-sm text-warm-700">
                      {u.plant_name || "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <span className="text-sm text-warm-700">
                      {u.role || "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3 hidden lg:table-cell">
                    <span className="text-xs text-warm-500">
                      {timeAgo(u.joined_at)}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {u.is_admin && (
                      <Badge className="bg-steel-100 text-steel-700">
                        Admin
                      </Badge>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(u)}
                        className="p-1.5 rounded-lg text-warm-400 hover:text-steel-600 hover:bg-steel-50 transition-colors cursor-pointer"
                        title="Edit user"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleAdmin(u)}
                        className={cn(
                          "p-1.5 rounded-lg transition-colors cursor-pointer",
                          u.is_admin
                            ? "text-steel-600 hover:text-warm-400 hover:bg-warm-50"
                            : "text-warm-400 hover:text-steel-600 hover:bg-steel-50"
                        )}
                        title={
                          u.is_admin ? "Remove admin" : "Make admin"
                        }
                      >
                        {u.is_admin ? (
                          <ShieldOff className="w-4 h-4" />
                        ) : (
                          <ShieldCheck className="w-4 h-4" />
                        )}
                      </button>
                      {u.id !== user?.id && (
                        <button
                          onClick={() => setDeleteTarget(u)}
                          className="p-1.5 rounded-lg text-warm-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <p className="text-warm-500 text-sm">
                      {search ? "No users match your search" : "No users yet"}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Modal */}
      <Modal
        open={!!editUser}
        onClose={() => setEditUser(null)}
        title={`Edit ${editUser?.full_name || "User"}`}
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={editForm.full_name}
            onChange={(e) =>
              setEditForm((f) => ({ ...f, full_name: e.target.value }))
            }
          />
          <Select
            label="Plant / Location"
            options={PLANT_OPTIONS}
            value={editForm.plant_name}
            onChange={(e) =>
              setEditForm((f) => ({ ...f, plant_name: e.target.value }))
            }
          />
          <Input
            label="Role / Title"
            value={editForm.role}
            onChange={(e) =>
              setEditForm((f) => ({ ...f, role: e.target.value }))
            }
          />
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={editForm.is_admin}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, is_admin: e.target.checked }))
              }
              className="w-4 h-4 rounded border-warm-300 text-steel-600 focus:ring-steel-400"
            />
            <span className="text-sm text-warm-700">Admin privileges</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setEditUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete User"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-warm-700">
            Are you sure you want to permanently delete{" "}
            <strong>{deleteTarget?.full_name || deleteTarget?.email}</strong>?
            This cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={saving}>
              {saving ? "Deleting..." : "Delete User"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
