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
} from "lucide-react";
import { useAdmin } from "@/hooks/use-admin";
import { useAuth } from "@/hooks/use-auth";
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
  const [search, setSearch] = useState("");
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
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
