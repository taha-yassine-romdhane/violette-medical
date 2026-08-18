"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UserItem {
  id: string;
  email: string;
  name: string;
  role: string;
  companyName: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  matriculeFiscale: string | null;
  isActive: boolean;
  createdAt: string;
  _count: { createdUsers: number; orders: number };
}

const roleLabels: Record<string, string> = {
  ADMIN: "Administrateur",
  COMMERCIAL: "Commercial",
  USER: "Client",
};

const roleShortLabels: Record<string, string> = {
  ADMIN: "Admin",
  COMMERCIAL: "Commercial",
  USER: "Client",
};

const roleBadgeColors: Record<string, string> = {
  ADMIN: "bg-gray-900 text-white border-gray-900",
  COMMERCIAL: "bg-blue-50 text-blue-700 border-blue-200",
  USER: "bg-gray-100 text-gray-700 border-gray-200",
};

const roleAvatarColors: Record<string, string> = {
  ADMIN: "bg-gray-900 text-white",
  COMMERCIAL: "bg-blue-100 text-blue-700",
  USER: "bg-gray-200 text-gray-700",
};

const roleIcons: Record<string, React.ReactNode> = {
  ADMIN: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  COMMERCIAL: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  USER: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
};

const roleTabs = [
  { value: "", label: "Tous" },
  { value: "ADMIN", label: "Admin" },
  { value: "COMMERCIAL", label: "Commercial" },
];

const emptyForm = {
  email: "",
  password: "",
  name: "",
  companyName: "",
  phone: "",
  address: "",
  city: "",
  postalCode: "",
  matriculeFiscale: "",
  role: "COMMERCIAL",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [success, setSuccess] = useState("");

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyForm);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createShowPw, setCreateShowPw] = useState(false);
  const createRef = useRef<HTMLDialogElement>(null);

  // Edit/detail panel
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [editShowPw, setEditShowPw] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const editRef = useRef<HTMLDialogElement>(null);

  // Password helpers
  function generatePassword(): string {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const digits = "0123456789";
    const special = "!@#$%&*";
    const all = upper + lower + digits + special;
    let pw = "";
    pw += upper[Math.floor(Math.random() * upper.length)];
    pw += lower[Math.floor(Math.random() * lower.length)];
    pw += digits[Math.floor(Math.random() * digits.length)];
    pw += special[Math.floor(Math.random() * special.length)];
    for (let i = 4; i < 12; i++) pw += all[Math.floor(Math.random() * all.length)];
    return pw.split("").sort(() => Math.random() - 0.5).join("");
  }

  function getPasswordStrength(pw: string): { level: number; label: string; color: string } {
    if (!pw) return { level: 0, label: "", color: "" };
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 2) return { level: 1, label: "Faible", color: "bg-red-500" };
    if (score <= 4) return { level: 2, label: "Moyen", color: "bg-amber-500" };
    return { level: 3, label: "Fort", color: "bg-emerald-500" };
  }

  // Debounce search input to avoid a fetch per keystroke
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    const params = new URLSearchParams();
    if (roleFilter) params.set("role", roleFilter);
    else params.set("roles", "ADMIN,COMMERCIAL");
    if (searchDebounced) params.set("search", searchDebounced);
    const res = await fetch(`/api/admin/users?${params}`);
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  }, [roleFilter, searchDebounced]);

  useEffect(() => {
    setLoading(true);
    fetchUsers();
  }, [fetchUsers]);

  // Dialog sync
  useEffect(() => {
    const d = createRef.current;
    if (!d) return;
    if (createOpen) { if (!d.open) d.showModal(); }
    else { if (d.open) d.close(); }
  }, [createOpen]);

  useEffect(() => {
    const d = editRef.current;
    if (!d) return;
    if (selectedUser) { if (!d.open) d.showModal(); }
    else { if (d.open) d.close(); }
  }, [selectedUser]);

  // Counts
  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const commercialCount = users.filter((u) => u.role === "COMMERCIAL").length;
  const activeCount = users.filter((u) => u.isActive).length;

  function openCreate() {
    setCreateForm(emptyForm);
    setCreateError("");
    setCreateShowPw(false);
    setCreateOpen(true);
  }

  function openEdit(user: UserItem) {
    setEditForm({
      email: user.email,
      password: "",
      name: user.name,
      companyName: user.companyName || "",
      phone: user.phone || "",
      address: user.address || "",
      city: user.city || "",
      postalCode: user.postalCode || "",
      matriculeFiscale: user.matriculeFiscale || "",
      role: user.role,
    });
    setNewPassword("");
    setShowPasswordField(false);
    setEditError("");
    setDeleteConfirm(false);
    setSelectedUser(user);
  }

  function closeEdit() {
    setSelectedUser(null);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError("");
    setCreateSubmitting(true);

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createForm),
    });
    setCreateSubmitting(false);

    if (res.ok) {
      setSuccess(`${roleLabels[createForm.role] || "Utilisateur"} créé avec succès.`);
      setCreateOpen(false);
      fetchUsers();
      setTimeout(() => setSuccess(""), 4000);
    } else {
      const data = await res.json();
      setCreateError(data.error || "Erreur lors de la création.");
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser) return;
    setEditError("");
    setEditSubmitting(true);

    const payload: Record<string, unknown> = {
      name: editForm.name,
      email: editForm.email,
      companyName: editForm.companyName,
      phone: editForm.phone,
      address: editForm.address,
      city: editForm.city,
      postalCode: editForm.postalCode,
      matriculeFiscale: editForm.matriculeFiscale,
      role: editForm.role,
    };
    if (newPassword) payload.password = newPassword;

    const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setEditSubmitting(false);

    if (res.ok) {
      setSuccess("Utilisateur mis à jour.");
      closeEdit();
      fetchUsers();
      setTimeout(() => setSuccess(""), 4000);
    } else {
      const data = await res.json();
      setEditError(data.error || "Erreur lors de la mise à jour.");
    }
  }

  async function toggleActive(user: UserItem) {
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !user.isActive }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setEditError(data?.error || "Erreur lors du changement de statut.");
      return;
    }
    fetchUsers();
    if (selectedUser?.id === user.id) {
      setSelectedUser({ ...user, isActive: !user.isActive });
    }
  }

  async function handleDelete() {
    if (!selectedUser) return;
    const res = await fetch(`/api/admin/users/${selectedUser.id}`, { method: "DELETE" });
    if (res.ok) {
      setSuccess("Utilisateur supprimé.");
      closeEdit();
      fetchUsers();
      setTimeout(() => setSuccess(""), 4000);
    } else {
      const data = await res.json().catch(() => null);
      setEditError(data?.error || "Erreur lors de la suppression.");
      setDeleteConfirm(false);
    }
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  }

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Utilisateurs</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez tous les utilisateurs de la plateforme</p>
        </div>
        <button
          onClick={openCreate}
          className="btn-primary px-4 py-2.5 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nouvel utilisateur
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Administrateurs", value: adminCount, icon: roleIcons.ADMIN, color: "bg-gray-50 text-gray-900 border-gray-200" },
          { label: "Commerciaux", value: commercialCount, icon: roleIcons.COMMERCIAL, color: "bg-blue-50 text-blue-700 border-blue-200" },
          {
            label: "Actifs",
            value: `${activeCount}/${users.length}`,
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            ),
            color: "bg-amber-50 text-amber-700 border-amber-200",
          },
        ].map((card) => (
          <div key={card.label} className={`rounded-xl p-4 border ${card.color}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center">{card.icon}</div>
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-sm mt-0.5 opacity-80">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Filters bar */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        {/* Role tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {roleTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setRoleFilter(tab.value)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                roleFilter === tab.value
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900/15 focus:border-gray-500 outline-none"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Success toast */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {success}
        </div>
      )}

      {/* Users list */}
      <div className="admin-card overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-[1fr_140px_100px_80px_60px] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <span>Utilisateur</span>
          <span>Rôle</span>
          <span>Activité</span>
          <span>Statut</span>
          <span className="text-right">Action</span>
        </div>

        {users.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg className="w-10 h-10 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm text-gray-500">Aucun utilisateur trouvé.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {users.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-[1fr_140px_100px_80px_60px] gap-4 px-5 py-3.5 items-center hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => openEdit(user)}
              >
                {/* User info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold uppercase ${roleAvatarColors[user.role] || "bg-gray-100 text-gray-700"}`}>
                    {user.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-gray-500 truncate">{user.email}</span>
                      {user.companyName && (
                        <>
                          <span className="text-gray-400">·</span>
                          <span className="text-[11px] text-gray-500 truncate">{user.companyName}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Role badge */}
                <div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full border ${roleBadgeColors[user.role] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
                    {roleShortLabels[user.role] || user.role}
                  </span>
                </div>

                {/* Activity */}
                <div className="text-xs text-gray-500">
                  {user.role === "COMMERCIAL" ? (
                    <span>{user._count.createdUsers} client{user._count.createdUsers !== 1 ? "s" : ""}</span>
                  ) : user.role === "USER" ? (
                    <span>{user._count.orders} cmd{user._count.orders !== 1 ? "s" : ""}</span>
                  ) : (
                    <span className="text-gray-400">&mdash;</span>
                  )}
                </div>

                {/* Status */}
                <div>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold rounded-full ${user.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? "bg-emerald-500" : "bg-red-500"}`} />
                    {user.isActive ? "Actif" : "Inactif"}
                  </span>
                </div>

                {/* Action */}
                <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => openEdit(user)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    title="Modifier"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {users.length > 0 && (
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-200">
            <span className="text-xs text-gray-500">
              {users.length} utilisateur{users.length > 1 ? "s" : ""}
              {roleFilter && ` · Filtre: ${roleTabs.find((t) => t.value === roleFilter)?.label}`}
            </span>
          </div>
        )}
      </div>

      {/* ─── CREATE USER DIALOG ─── */}
      <dialog
        ref={createRef}
        onClose={() => setCreateOpen(false)}
        className="fixed inset-0 m-auto w-full max-w-xl max-h-[90vh] rounded-2xl bg-white border border-gray-200 p-0 shadow-2xl shadow-gray-900/10 backdrop:bg-gray-900/40 backdrop:backdrop-blur-sm overflow-hidden"
      >
        <div className="flex flex-col max-h-[90vh]">
          {/* Dialog header */}
          <div className="px-6 pt-6 pb-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Nouvel utilisateur</h2>
                <p className="text-xs text-gray-500 mt-0.5">Remplissez les informations pour créer un compte</p>
              </div>
              <button onClick={() => setCreateOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Scrollable form body */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {createError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {createError}
              </div>
            )}

            <form id="create-user-form" onSubmit={handleCreate} className="space-y-5">
              {/* Role select with icons (clients created separately via /admin/clients) */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Rôle *</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "COMMERCIAL", label: "Commercial", desc: "Gère ses clients", icon: roleIcons.COMMERCIAL },
                    { value: "ADMIN", label: "Administrateur", desc: "Accès total", icon: roleIcons.ADMIN },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`cursor-pointer rounded-xl border-2 p-3 transition-all ${
                        createForm.role === opt.value
                          ? "border-gray-900 bg-gray-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input type="radio" name="role" value={opt.value} checked={createForm.role === opt.value} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })} className="sr-only" />
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${createForm.role === opt.value ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"}`}>
                        {opt.icon}
                      </div>
                      <p className={`text-sm font-medium ${createForm.role === opt.value ? "text-gray-900" : "text-gray-700"}`}>{opt.label}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{opt.desc}</p>
                    </label>
                  ))}
                </div>
              </div>

              {/* Identity section */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Identité</label>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Nom complet *</label>
                      <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <input type="text" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} required placeholder="Nom complet" className="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900/15 focus:border-gray-500 outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Email *</label>
                      <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <input type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} required placeholder="email@example.com" className="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900/15 focus:border-gray-500 outline-none" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Société</label>
                      <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <input type="text" value={createForm.companyName} onChange={(e) => setCreateForm({ ...createForm, companyName: e.target.value })} placeholder="Nom de société" className="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900/15 focus:border-gray-500 outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Téléphone</label>
                      <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <input type="tel" value={createForm.phone} onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} placeholder="+216 XX XXX XXX" className="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900/15 focus:border-gray-500 outline-none" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Password section */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Mot de passe *</label>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <input
                      type={createShowPw ? "text" : "password"}
                      value={createForm.password}
                      onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                      required
                      placeholder="8+ caractères, majuscule, minuscule, chiffre"
                      className="w-full pl-10 pr-20 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900/15 focus:border-gray-500 outline-none"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {/* Eye toggle */}
                      <button
                        type="button"
                        onClick={() => setCreateShowPw(!createShowPw)}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                        title={createShowPw ? "Masquer" : "Afficher"}
                      >
                        {createShowPw ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Password strength bar */}
                  {createForm.password && (
                    <div className="space-y-1.5">
                      <div className="flex gap-1">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= getPasswordStrength(createForm.password).level ? getPasswordStrength(createForm.password).color : "bg-gray-200"}`} />
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-medium ${getPasswordStrength(createForm.password).level === 1 ? "text-red-600" :getPasswordStrength(createForm.password).level === 2 ? "text-amber-600" : "text-emerald-600"}`}>
                          {getPasswordStrength(createForm.password).label}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                          {/[A-Z]/.test(createForm.password) ? (
                            <span className="text-emerald-600">A-Z</span>
                          ) : (
                            <span>A-Z</span>
                          )}
                          {/[a-z]/.test(createForm.password) ? (
                            <span className="text-emerald-600">a-z</span>
                          ) : (
                            <span>a-z</span>
                          )}
                          {/[0-9]/.test(createForm.password) ? (
                            <span className="text-emerald-600">0-9</span>
                          ) : (
                            <span>0-9</span>
                          )}
                          {createForm.password.length >= 8 ? (
                            <span className="text-emerald-600">8+</span>
                          ) : (
                            <span>{createForm.password.length}/8</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Generate password button */}
                  <button
                    type="button"
                    onClick={() => {
                      const pw = generatePassword();
                      setCreateForm({ ...createForm, password: pw });
                      setCreateShowPw(true);
                    }}
                    className="flex items-center gap-2 text-xs text-gray-700 hover:text-gray-900 font-medium"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Générer un mot de passe
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Dialog footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <p className="text-[11px] text-gray-500">* Champs obligatoires</p>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setCreateOpen(false)} className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">Annuler</button>
              <button
                type="submit"
                form="create-user-form"
                disabled={createSubmitting}
                className="btn-primary px-5 py-2.5 text-sm"
              >
                {createSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Créer l&apos;utilisateur
              </button>
            </div>
          </div>
        </div>
      </dialog>

      {/* ─── EDIT USER DIALOG (full detail panel) ─── */}
      <dialog
        ref={editRef}
        onClose={closeEdit}
        className="fixed inset-0 m-auto w-full max-w-2xl max-h-[90vh] rounded-2xl bg-white border border-gray-200 p-0 shadow-2xl shadow-gray-900/10 backdrop:bg-gray-900/40 backdrop:backdrop-blur-sm overflow-hidden"
      >
        {selectedUser && (
          <div className="flex flex-col max-h-[90vh]">
            {/* Dialog header with user identity */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold uppercase ${roleAvatarColors[selectedUser.role] || "bg-gray-100 text-gray-700"}`}>
                    {selectedUser.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{selectedUser.name}</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full border ${roleBadgeColors[selectedUser.role]}`}>
                        {roleShortLabels[selectedUser.role]}
                      </span>
                      <span className="text-xs text-gray-500">Inscrit le {formatDate(selectedUser.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Toggle active */}
                  <button
                    onClick={() => toggleActive(selectedUser)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      selectedUser.isActive
                        ? "border-red-200 text-red-600 hover:bg-red-50"
                        : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                    }`}
                  >
                    {selectedUser.isActive ? "Désactiver" : "Activer"}
                  </button>
                  <button onClick={closeEdit} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Quick stats */}
              <div className="flex items-center gap-6 mt-4">
                {selectedUser.role === "COMMERCIAL" && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span><strong className="text-gray-900">{selectedUser._count.createdUsers}</strong> clients</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span><strong className="text-gray-900">{selectedUser._count.orders}</strong> commandes</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`inline-flex items-center gap-1 ${selectedUser.isActive ? "text-emerald-600" : "text-red-600"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${selectedUser.isActive ? "bg-emerald-500" : "bg-red-500"}`} />
                    {selectedUser.isActive ? "Actif" : "Inactif"}
                  </span>
                </div>
              </div>
            </div>

            {/* Scrollable form body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {editError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">{editError}</div>
              )}

              <form id="edit-user-form" onSubmit={handleEdit} className="space-y-5">
                {/* Role change (clients managed separately via /admin/clients) */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Rôle</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "ADMIN", label: "Administrateur", icon: roleIcons.ADMIN, desc: "Accès total" },
                      { value: "COMMERCIAL", label: "Commercial", icon: roleIcons.COMMERCIAL, desc: "Gère des clients" },
                    ].map((opt) => (
                      <label
                        key={opt.value}
                        className={`cursor-pointer rounded-xl border-2 p-3 transition-all flex items-start gap-3 ${
                          editForm.role === opt.value
                            ? "border-gray-900 bg-gray-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input type="radio" name="editRole" value={opt.value} checked={editForm.role === opt.value} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className="sr-only" />
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${editForm.role === opt.value ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"}`}>
                          {opt.icon}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${editForm.role === opt.value ? "text-gray-900" : "text-gray-700"}`}>{opt.label}</p>
                          <p className="text-[11px] text-gray-500">{opt.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Identity section */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Identité</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Nom complet *</label>
                        <div className="relative">
                          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required className="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900/15 focus:border-gray-500 outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Email *</label>
                        <div className="relative">
                          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} required className="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900/15 focus:border-gray-500 outline-none" />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Société</label>
                        <div className="relative">
                          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <input type="text" value={editForm.companyName} onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })} placeholder="Nom de société" className="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900/15 focus:border-gray-500 outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Téléphone</label>
                        <div className="relative">
                          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <input type="tel" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} placeholder="+216 XX XXX XXX" className="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900/15 focus:border-gray-500 outline-none" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Matricule fiscale</label>
                      <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <input type="text" value={editForm.matriculeFiscale} onChange={(e) => setEditForm({ ...editForm, matriculeFiscale: e.target.value })} placeholder="Matricule fiscale" className="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900/15 focus:border-gray-500 outline-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address section */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Adresse</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Adresse</label>
                      <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <input type="text" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} placeholder="Rue, immeuble..." className="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900/15 focus:border-gray-500 outline-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Ville</label>
                        <input type="text" value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} placeholder="Ville" className="w-full pl-3 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900/15 focus:border-gray-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Code postal</label>
                        <input type="text" value={editForm.postalCode} onChange={(e) => setEditForm({ ...editForm, postalCode: e.target.value })} placeholder="Code postal" className="w-full pl-3 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900/15 focus:border-gray-500 outline-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security section */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sécurité</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    {showPasswordField ? (
                      <div className="space-y-3">
                        <label className="block text-xs text-gray-500 mb-1">Nouveau mot de passe</label>
                        <div className="relative">
                          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <input
                            type={editShowPw ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="8+ caractères, majuscule, minuscule, chiffre"
                            className="w-full pl-10 pr-20 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900/15 focus:border-gray-500 outline-none"
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setEditShowPw(!editShowPw)}
                              className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                              title={editShowPw ? "Masquer" : "Afficher"}
                            >
                              {editShowPw ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Password strength bar */}
                        {newPassword && (
                          <div className="space-y-1.5">
                            <div className="flex gap-1">
                              {[1, 2, 3].map((i) => (
                                <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= getPasswordStrength(newPassword).level ? getPasswordStrength(newPassword).color : "bg-gray-200"}`} />
                              ))}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className={`text-[11px] font-medium ${getPasswordStrength(newPassword).level === 1 ? "text-red-600" :getPasswordStrength(newPassword).level === 2 ? "text-amber-600" : "text-emerald-600"}`}>
                                {getPasswordStrength(newPassword).label}
                              </span>
                              <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                                {/[A-Z]/.test(newPassword) ? <span className="text-emerald-600">A-Z</span> : <span>A-Z</span>}
                                {/[a-z]/.test(newPassword) ? <span className="text-emerald-600">a-z</span> : <span>a-z</span>}
                                {/[0-9]/.test(newPassword) ? <span className="text-emerald-600">0-9</span> : <span>0-9</span>}
                                {newPassword.length >= 8 ? <span className="text-emerald-600">8+</span> : <span>{newPassword.length}/8</span>}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Generate + cancel buttons */}
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => {
                              const pw = generatePassword();
                              setNewPassword(pw);
                              setEditShowPw(true);
                            }}
                            className="flex items-center gap-1.5 text-xs text-gray-700 hover:text-gray-900 font-medium"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Générer
                          </button>
                          <button
                            type="button"
                            onClick={() => { setShowPasswordField(false); setNewPassword(""); setEditShowPw(false); }}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowPasswordField(true)}
                        className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        Changer le mot de passe
                      </button>
                    )}
                  </div>
                </div>
              </form>

              {/* Danger zone */}
              <div className="mt-6 pt-5 border-t border-gray-200">
                <label className="block text-xs font-semibold text-red-600 uppercase tracking-wider mb-2">Zone danger</label>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  {deleteConfirm ? (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-red-700">
                        {selectedUser._count.orders > 0
                          ? "Cet utilisateur a des commandes. Il sera désactivé."
                          : "Supprimer définitivement cet utilisateur ?"}
                      </p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setDeleteConfirm(false)} className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded-lg">
                          Annuler
                        </button>
                        <button onClick={handleDelete} className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg">
                          Confirmer
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(true)}
                      className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Supprimer cet utilisateur
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Dialog footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
              <button type="button" onClick={closeEdit} className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                Annuler
              </button>
              <button
                type="submit"
                form="edit-user-form"
                disabled={editSubmitting}
                className="btn-primary px-5 py-2.5 text-sm"
              >
                {editSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Enregistrer
              </button>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
