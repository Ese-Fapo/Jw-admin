"use client";

import { useCallback, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/app/providers/AuthProvider";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

type HistoryRow = {
  id: string;
  adminUserId: string;
  adminEmail: string;
  method: string;
  createdAt: string;
};

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export default function AdminUsersControl() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [assignEmail, setAssignEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const getAuthHeaders = useCallback(async (): Promise<Record<string, string>> => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Authentication session is not ready. Please sign in again.");
    headers.Authorization = `Bearer ${await currentUser.getIdToken()}`;
    return headers;
  }, []);

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/admin/users", {
        headers: await getAuthHeaders(),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Failed to load users");
      setUsers(body.users as UserRow[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  }, [getAuthHeaders]);

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/admin/history", {
        headers: await getAuthHeaders(),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Failed to load admin history");
      setHistory(body.history as HistoryRow[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin history");
    } finally {
      setLoadingHistory(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    if (!user) return;
    loadUsers();
    loadHistory();
  }, [user, loadUsers, loadHistory]);

  const assignAdmin = async () => {
    const email = assignEmail.trim().toLowerCase();
    if (!email) {
      setError("Enter an email to assign as admin.");
      return;
    }

    setAssigning(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/users/assign-admin", {
        method: "POST",
        headers: await getAuthHeaders(),
        body: JSON.stringify({ email }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Failed to assign admin role");

      setSuccess(`${body.user.email} is now an admin.`);
      setAssignEmail("");
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign admin role");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-white sm:text-2xl">User Management</h2>
        <p className="mt-2 text-sm text-slate-400">Visible only to admins. Shows every user that has logged in.</p>
      </div>

      <div className="rounded-xl border border-slate-700/80 bg-slate-950/60 p-4 shadow-lg">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-sky-300">Assign New Admin</h3>
        <p className="mt-1 text-xs text-slate-500">Only a verified admin can assign another admin role.</p>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            value={assignEmail}
            onChange={(e) => setAssignEmail(e.target.value)}
            placeholder="user@email.com"
            className="flex-1 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-sky-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={assignAdmin}
            disabled={assigning}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-60"
          >
            {assigning ? "Assigning..." : "Assign Admin"}
          </button>
        </div>

        {error && (
          <p className="mt-3 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
        )}
        {success && (
          <p className="mt-3 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{success}</p>
        )}
      </div>

      <div className="rounded-xl border border-slate-700/80 bg-slate-950/60 overflow-hidden shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-sky-300">All Logged-In Users</h3>
          <button
            onClick={loadUsers}
            disabled={loadingUsers}
            className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-60"
          >
            {loadingUsers ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/80 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Role</th>
                <th className="px-4 py-2 text-left">Verified</th>
                <th className="px-4 py-2 text-left">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-2 text-slate-200">{user.name}</td>
                  <td className="px-4 py-2 text-slate-300">{user.email}</td>
                  <td className="px-4 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${user.role === "ADMIN" ? "bg-sky-500/20 text-sky-300" : "bg-slate-700 text-slate-300"}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-slate-300">{user.emailVerified ? "Yes" : "No"}</td>
                  <td className="px-4 py-2 text-slate-400">{formatDate(user.updatedAt)}</td>
                </tr>
              ))}
              {!loadingUsers && users.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-slate-400" colSpan={5}>
                    No users found yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-slate-700/80 bg-slate-950/60 overflow-hidden shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-sky-300">Admin Sign-In History</h3>
          <button
            onClick={loadHistory}
            disabled={loadingHistory}
            className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-60"
          >
            {loadingHistory ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/80 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-2 text-left">Admin Email</th>
                <th className="px-4 py-2 text-left">Method</th>
                <th className="px-4 py-2 text-left">Signed In At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {history.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-2 text-slate-200">{row.adminEmail}</td>
                  <td className="px-4 py-2 text-slate-300 uppercase">{row.method}</td>
                  <td className="px-4 py-2 text-slate-400">{formatDate(row.createdAt)}</td>
                </tr>
              ))}
              {!loadingHistory && history.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-slate-400" colSpan={3}>
                    No admin sign-in history yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
