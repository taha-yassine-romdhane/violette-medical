"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface Client {
  id: string;
  email: string;
  name: string;
  companyName: string | null;
  matriculeFiscale: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  phone: string | null;
  clientType: "RESPIRATORY" | "DIABETIC" | "BOTH" | null;
  isActive: boolean;
  createdAt: string;
  createdBy: { id: string; name: string } | null;
  _count: { orders: number };
}

interface Commercial {
  id: string;
  name: string;
}

const clientTypeLabels: Record<string, string> = {
  RESPIRATORY: "Respiratoire",
  DIABETIC: "Diabétique",
  BOTH: "Les deux",
};

const clientTypeBadge: Record<string, string> = {
  RESPIRATORY: "bg-sky-50 text-sky-700 border-sky-200",
  DIABETIC: "bg-violet-50 text-violet-700 border-violet-200",
  BOTH: "bg-amber-50 text-amber-700 border-amber-200",
};

const clientTypeIcons: Record<string, React.ReactNode> = {
  RESPIRATORY: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  ),
  DIABETIC: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  BOTH: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  ),
};

const emptyForm = {
  companyName: "",
  matriculeFiscale: "",
  address: "",
  city: "",
  postalCode: "",
  phone: "",
  clientType: "" as string,
  name: "",
  email: "",
  password: "",
  createdById: "",
};

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [commercials, setCommercials] = useState<Commercial[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [commercialFilter, setCommercialFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [success, setSuccess] = useState("");

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyForm);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createShowPw, setCreateShowPw] = useState(false);
  const createRef = useRef<HTMLDialogElement>(null);

  // Edit dialog
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const editRef = useRef<HTMLDialogElement>(null);

  // Debounce search so we don't hit the API on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchData = useCallback(async () => {
    const params = new URLSearchParams();
    if (searchDebounced) params.set("search", searchDebounced);
    if (commercialFilter) params.set("commercial", commercialFilter);
    if (typeFilter) params.set("clientType", typeFilter);
    if (statusFilter) params.set("status", statusFilter);
    const [clientsRes, usersRes] = await Promise.all([
      fetch(`/api/admin/clients?${params}`),
      fetch("/api/admin/users?role=COMMERCIAL"),
    ]);
    if (clientsRes.ok) setClients(await clientsRes.json());
    if (usersRes.ok) setCommercials(await usersRes.json());
    setLoading(false);
  }, [searchDebounced, commercialFilter, typeFilter, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const d = createRef.current;
    if (!d) return;
    if (createOpen) { if (!d.open) d.showModal(); } else { if (d.open) d.close(); }
  }, [createOpen]);

  useEffect(() => {
    const d = editRef.current;
    if (!d) return;
    if (selectedClient) { if (!d.open) d.showModal(); } else { if (d.open) d.close(); }
  }, [selectedClient]);

  // Counts
  const activeCount = clients.filter((c) => c.isActive).length;
  const totalOrders = clients.reduce((s, c) => s + c._count.orders, 0);
  const respiratoryCount = clients.filter((c) => c.clientType === "RESPIRATORY" || c.clientType === "BOTH").length;
  const diabeticCount = clients.filter((c) => c.clientType === "DIABETIC" || c.clientType === "BOTH").length;

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

  function openCreate() {
    setCreateForm(emptyForm);
    setCreateError("");
    setCreateShowPw(false);
    setCreateOpen(true);
  }

  function openEdit(client: Client) {
    setEditForm({
      companyName: client.companyName || "",
      matriculeFiscale: client.matriculeFiscale || "",
      address: client.address || "",
      city: client.city || "",
      postalCode: client.postalCode || "",
      phone: client.phone || "",
      clientType: client.clientType || "",
      name: client.name,
      email: client.email,
      password: "",
      createdById: client.createdBy?.id || "",
    });
    setEditError("");
    setDeleteConfirm(false);
    setSelectedClient(client);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError("");
    setCreateSubmitting(true);
    const payload = { ...createForm, clientType: createForm.clientType || undefined };
    const res = await fetch("/api/admin/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setCreateSubmitting(false);
    if (res.ok) {
      setSuccess("Client créé avec succès.");
      setCreateOpen(false);
      fetchData();
      setTimeout(() => setSuccess(""), 4000);
    } else {
      const data = await res.json();
      setCreateError(data.error || "Erreur.");
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClient) return;
    setEditError("");
    setEditSubmitting(true);
    const res = await fetch(`/api/admin/clients/${selectedClient.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editForm.name,
        companyName: editForm.companyName,
        matriculeFiscale: editForm.matriculeFiscale || null,
        address: editForm.address,
        city: editForm.city,
        postalCode: editForm.postalCode,
        phone: editForm.phone,
        clientType: editForm.clientType || null,
        createdById: editForm.createdById || null,
      }),
    });
    setEditSubmitting(false);
    if (res.ok) {
      setSuccess("Client mis à jour.");
      setSelectedClient(null);
      fetchData();
      setTimeout(() => setSuccess(""), 4000);
    } else {
      const data = await res.json();
      setEditError(data.error || "Erreur.");
    }
  }

  async function toggleActive(client: Client) {
    const res = await fetch(`/api/admin/clients/${client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !client.isActive }),
    });
    if (!res.ok) {
      setEditError("Impossible de modifier le statut du client.");
      return;
    }
    fetchData();
    if (selectedClient?.id === client.id) {
      setSelectedClient({ ...client, isActive: !client.isActive });
    }
  }

  async function handleDelete() {
    if (!selectedClient) return;
    const res = await fetch(`/api/admin/clients/${selectedClient.id}`, { method: "DELETE" });
    if (res.ok) {
      setSuccess("Client supprimé.");
      setSelectedClient(null);
      fetchData();
      setTimeout(() => setSuccess(""), 4000);
    } else {
      const data = await res.json().catch(() => null);
      setEditError(data?.error || "Impossible de supprimer ce client.");
      setDeleteConfirm(false);
    }
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  }

  const hasActiveFilters = commercialFilter || typeFilter || statusFilter;

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-1">Gestion des comptes clients B2B</p>
        </div>
        <button onClick={openCreate} className="btn-primary px-4 py-2.5 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Nouveau client
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[
          { label: "Total", value: clients.length, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, color: "bg-blue-50 text-blue-700 border-blue-200" },
          { label: "Respiratoire", value: respiratoryCount, icon: clientTypeIcons.RESPIRATORY, color: "bg-sky-50 text-sky-700 border-sky-200" },
          { label: "Diabétique", value: diabeticCount, icon: clientTypeIcons.DIABETIC, color: "bg-violet-50 text-violet-700 border-violet-200" },
          { label: "Commandes", value: totalOrders, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
          { label: "Actifs", value: `${activeCount}/${clients.length}`, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>, color: "bg-amber-50 text-amber-700 border-amber-200" },
        ].map((c) => (
          <div key={c.label} className={`rounded-xl p-4 border ${c.color}`}>
            <div className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center mb-2">{c.icon}</div>
            <p className="text-2xl font-bold">{c.value}</p>
            <p className="text-sm mt-0.5 opacity-80">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Filters bar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="admin-input pl-10 pr-9" />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-gray-900/15 focus:border-gray-500 outline-none [&>option]:bg-white [&>option]:text-gray-900">
          <option value="">Tous les types</option>
          <option value="RESPIRATORY">Respiratoire</option>
          <option value="DIABETIC">Diabétique</option>
          <option value="BOTH">Les deux</option>
        </select>
        <select value={commercialFilter} onChange={(e) => setCommercialFilter(e.target.value)} className="px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-gray-900/15 focus:border-gray-500 outline-none [&>option]:bg-white [&>option]:text-gray-900">
          <option value="">Tous les commerciaux</option>
          {commercials.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-gray-900/15 focus:border-gray-500 outline-none [&>option]:bg-white [&>option]:text-gray-900">
          <option value="">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="inactive">Inactif</option>
        </select>
        {hasActiveFilters && (
          <button onClick={() => { setCommercialFilter(""); setTypeFilter(""); setStatusFilter(""); }} className="px-3 py-2.5 text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg flex items-center gap-1 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            Effacer filtres
          </button>
        )}
      </div>

      {/* Success toast */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {success}
        </div>
      )}

      {/* Clients table */}
      <div className="admin-card overflow-hidden">
        <div className="grid grid-cols-[1fr_110px_110px_90px_80px_60px] gap-3 px-5 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <span>Societe / Contact</span>
          <span>Type</span>
          <span>Commercial</span>
          <span>Commandes</span>
          <span>Statut</span>
          <span className="text-right">Action</span>
        </div>

        {clients.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg className="w-10 h-10 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            <p className="text-sm text-gray-500">Aucun client pour le moment.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {clients.map((client) => (
              <div
                key={client.id}
                className="grid grid-cols-[1fr_110px_110px_90px_80px_60px] gap-3 px-5 py-3.5 items-center hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => openEdit(client)}
              >
                {/* Company + contact */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 flex-shrink-0 flex items-center justify-center text-xs font-bold text-emerald-700 uppercase">
                    {(client.companyName || client.name).charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{client.companyName || client.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      {client.companyName && <span className="text-[11px] text-gray-500 truncate">{client.name}</span>}
                      {client.companyName && <span className="text-gray-400">·</span>}
                      <span className="text-[11px] text-gray-500 truncate">{client.email}</span>
                      {client.city && (
                        <>
                          <span className="text-gray-400">·</span>
                          <span className="text-[11px] text-gray-500 flex items-center gap-0.5">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                            {client.city}
                          </span>
                        </>
                      )}
                      {client.phone && (
                        <>
                          <span className="text-gray-400">·</span>
                          <span className="text-[11px] text-gray-500">{client.phone}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Client type */}
                <div>
                  {client.clientType ? (
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-full border ${clientTypeBadge[client.clientType]}`}>
                      {clientTypeIcons[client.clientType]}
                      {clientTypeLabels[client.clientType]}
                    </span>
                  ) : (
                    <span className="text-[11px] text-gray-400 italic">Non défini</span>
                  )}
                </div>

                {/* Commercial */}
                <div>
                  {client.createdBy ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200 truncate max-w-full">
                      <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      <span className="truncate">{client.createdBy.name}</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-gray-400">&mdash;</span>
                  )}
                </div>

                {/* Orders */}
                <div>
                  <span className={`text-sm font-semibold ${client._count.orders > 0 ? "text-gray-900" : "text-gray-400"}`}>{client._count.orders}</span>
                  {client._count.orders > 0 && <span className="text-[11px] text-gray-500 ml-1">cmd</span>}
                </div>

                {/* Status */}
                <div>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold rounded-full ${client.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${client.isActive ? "bg-emerald-500" : "bg-red-500"}`} />
                    {client.isActive ? "Actif" : "Inactif"}
                  </span>
                </div>

                {/* Action */}
                <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => openEdit(client)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors" title="Modifier">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {clients.length > 0 && (
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {clients.length} client{clients.length > 1 ? "s" : ""}
              {hasActiveFilters && " (filtre actif)"}
            </span>
            <span className="text-xs text-gray-500">{totalOrders} commande{totalOrders !== 1 ? "s" : ""} au total</span>
          </div>
        )}
      </div>

      {/* ─── CREATE CLIENT DIALOG ─── */}
      <dialog ref={createRef} onClose={() => setCreateOpen(false)} className="fixed inset-0 m-auto w-full max-w-xl max-h-[90vh] rounded-2xl bg-white border border-gray-200 p-0 shadow-2xl shadow-gray-900/10 backdrop:bg-gray-900/40 backdrop:backdrop-blur-sm overflow-hidden text-gray-900">
        <div className="flex flex-col max-h-[90vh]">
          <div className="px-6 pt-6 pb-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Nouveau client</h2>
                <p className="text-xs text-gray-500 mt-0.5">Créer un compte client B2B</p>
              </div>
              <button onClick={() => setCreateOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {createError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {createError}
              </div>
            )}

            <form id="create-client-form" onSubmit={handleCreate} className="space-y-5">
              {/* Company */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Société *</label>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Raison sociale *</label>
                      <input type="text" required value={createForm.companyName} onChange={(e) => setCreateForm({ ...createForm, companyName: e.target.value })} placeholder="Nom de la société" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900/15 focus:border-gray-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Matricule fiscale</label>
                      <input type="text" value={createForm.matriculeFiscale} onChange={(e) => setCreateForm({ ...createForm, matriculeFiscale: e.target.value })} placeholder="0000000/X/X/X/000" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900/15 focus:border-gray-500 outline-none font-mono" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Adresse</label>
                    <input type="text" value={createForm.address} onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })} placeholder="Rue, immeuble..." className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900/15 focus:border-gray-500 outline-none" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Ville</label>
                      <input type="text" value={createForm.city} onChange={(e) => setCreateForm({ ...createForm, city: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900/15 focus:border-gray-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Code postal</label>
                      <input type="text" value={createForm.postalCode} onChange={(e) => setCreateForm({ ...createForm, postalCode: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900/15 focus:border-gray-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Téléphone</label>
                      <input type="tel" value={createForm.phone} onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} placeholder="+216" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900/15 focus:border-gray-500 outline-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Client type */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Type de client *</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "RESPIRATORY", label: "Respiratoire", desc: "Produits respiratoires", icon: clientTypeIcons.RESPIRATORY, badge: "bg-sky-50 border-sky-400 text-sky-700" },
                    { value: "DIABETIC", label: "Diabétique", desc: "Produits diabétiques", icon: clientTypeIcons.DIABETIC, badge: "bg-violet-50 border-violet-400 text-violet-700" },
                    { value: "BOTH", label: "Les deux", desc: "Tous les produits", icon: clientTypeIcons.BOTH, badge: "bg-amber-50 border-amber-400 text-amber-700" },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`cursor-pointer rounded-xl border-2 p-3 transition-all ${
                        createForm.clientType === opt.value
                          ? `${opt.badge} border-2`
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input type="radio" name="clientType" value={opt.value} checked={createForm.clientType === opt.value} onChange={(e) => setCreateForm({ ...createForm, clientType: e.target.value })} className="sr-only" />
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${createForm.clientType === opt.value ? "bg-white" : "bg-gray-100 text-gray-500"}`}>
                        {opt.icon}
                      </div>
                      <p className="text-sm font-medium">{opt.label}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{opt.desc}</p>
                    </label>
                  ))}
                </div>
              </div>

              {/* Contact person */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Personne de contact *</label>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Nom complet *</label>
                      <input type="text" required value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} placeholder="Responsable" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900/15 focus:border-gray-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Email *</label>
                      <input type="email" required value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} placeholder="email@societe.tn" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900/15 focus:border-gray-500 outline-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Mot de passe *</label>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    <input type={createShowPw ? "text" : "password"} required value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} placeholder="8+ caractères" className="w-full pl-10 pr-20 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900/15 focus:border-gray-500 outline-none" />
                    <button type="button" onClick={() => setCreateShowPw(!createShowPw)} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100">
                      {createShowPw ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  </div>
                  {createForm.password && (
                    <div className="space-y-1.5">
                      <div className="flex gap-1">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= getPasswordStrength(createForm.password).level ? getPasswordStrength(createForm.password).color : "bg-gray-200"}`} />
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-medium ${getPasswordStrength(createForm.password).level === 1 ? "text-red-600" :getPasswordStrength(createForm.password).level === 2 ? "text-amber-600" : "text-emerald-600"}`}>{getPasswordStrength(createForm.password).label}</span>
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                          {/[A-Z]/.test(createForm.password) ? <span className="text-emerald-500">A-Z</span> : <span>A-Z</span>}
                          {/[a-z]/.test(createForm.password) ? <span className="text-emerald-500">a-z</span> : <span>a-z</span>}
                          {/[0-9]/.test(createForm.password) ? <span className="text-emerald-500">0-9</span> : <span>0-9</span>}
                          {createForm.password.length >= 8 ? <span className="text-emerald-500">8+</span> : <span>{createForm.password.length}/8</span>}
                        </div>
                      </div>
                    </div>
                  )}
                  <button type="button" onClick={() => { setCreateForm({ ...createForm, password: generatePassword() }); setCreateShowPw(true); }} className="flex items-center gap-1.5 text-xs text-gray-700 hover:text-gray-900 font-medium">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    Générer un mot de passe
                  </button>
                </div>
              </div>

              {/* Commercial */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Commercial assigné</label>
                <select value={createForm.createdById} onChange={(e) => setCreateForm({ ...createForm, createdById: e.target.value })} className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-gray-900/15 focus:border-gray-500 outline-none [&>option]:bg-white [&>option]:text-gray-900">
                  <option value="">Aucun commercial</option>
                  {commercials.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </form>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <p className="text-[11px] text-gray-500">* Champs obligatoires</p>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setCreateOpen(false)} className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">Annuler</button>
              <button type="submit" form="create-client-form" disabled={createSubmitting} className="btn-primary px-5 py-2.5 text-sm">
                {createSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Créer le client
              </button>
            </div>
          </div>
        </div>
      </dialog>

      {/* ─── EDIT CLIENT DIALOG ─── */}
      <dialog ref={editRef} onClose={() => setSelectedClient(null)} className="fixed inset-0 m-auto w-full max-w-2xl max-h-[90vh] rounded-2xl bg-white border border-gray-200 p-0 shadow-2xl shadow-gray-900/10 backdrop:bg-gray-900/40 backdrop:backdrop-blur-sm overflow-hidden text-gray-900">
        {selectedClient && (
          <div className="flex flex-col max-h-[90vh]">
            <div className="px-6 pt-6 pb-4 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center text-lg font-bold text-emerald-700 uppercase">
                    {(selectedClient.companyName || selectedClient.name).charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{selectedClient.companyName || selectedClient.name}</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      {selectedClient.companyName && <span className="text-xs text-gray-500">{selectedClient.name}</span>}
                      {selectedClient.clientType && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full border ${clientTypeBadge[selectedClient.clientType]}`}>
                          {clientTypeIcons[selectedClient.clientType]}
                          {clientTypeLabels[selectedClient.clientType]}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">· {formatDate(selectedClient.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleActive(selectedClient)} className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${selectedClient.isActive ? "border-red-200 text-red-600 hover:bg-red-50" : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"}`}>
                    {selectedClient.isActive ? "Désactiver" : "Activer"}
                  </button>
                  <button onClick={() => setSelectedClient(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  <strong className="text-gray-900">{selectedClient._count.orders}</strong> commandes
                </div>
                {selectedClient.createdBy && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    Commercial: <strong className="text-gray-900">{selectedClient.createdBy.name}</strong>
                  </div>
                )}
                <span className={`inline-flex items-center gap-1 text-xs ${selectedClient.isActive ? "text-emerald-600" : "text-red-600"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${selectedClient.isActive ? "bg-emerald-500" : "bg-red-500"}`} />
                  {selectedClient.isActive ? "Actif" : "Inactif"}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {editError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">{editError}</div>}

              <form id="edit-client-form" onSubmit={handleEdit} className="space-y-5">
                {/* Company */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Société</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Raison sociale *</label>
                        <input type="text" required value={editForm.companyName} onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900/15 focus:border-gray-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Matricule fiscale</label>
                        <input type="text" value={editForm.matriculeFiscale} onChange={(e) => setEditForm({ ...editForm, matriculeFiscale: e.target.value })} placeholder="0000000/X/X/X/000" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900/15 focus:border-gray-500 outline-none font-mono" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Adresse</label>
                      <input type="text" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} placeholder="Rue, immeuble..." className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900/15 focus:border-gray-500 outline-none" />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Ville</label>
                        <input type="text" value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900/15 focus:border-gray-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Code postal</label>
                        <input type="text" value={editForm.postalCode} onChange={(e) => setEditForm({ ...editForm, postalCode: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900/15 focus:border-gray-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Téléphone</label>
                        <input type="tel" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900/15 focus:border-gray-500 outline-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Client type */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Type de client</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "RESPIRATORY", label: "Respiratoire", icon: clientTypeIcons.RESPIRATORY, badge: "bg-sky-50 border-sky-400 text-sky-700" },
                      { value: "DIABETIC", label: "Diabétique", icon: clientTypeIcons.DIABETIC, badge: "bg-violet-50 border-violet-400 text-violet-700" },
                      { value: "BOTH", label: "Les deux", icon: clientTypeIcons.BOTH, badge: "bg-amber-50 border-amber-400 text-amber-700" },
                    ].map((opt) => (
                      <label key={opt.value} className={`cursor-pointer rounded-xl border-2 p-3 transition-all flex items-center gap-2.5 ${editForm.clientType === opt.value ? `${opt.badge} border-2` : "border-gray-200 hover:border-gray-300"}`}>
                        <input type="radio" name="editClientType" value={opt.value} checked={editForm.clientType === opt.value} onChange={(e) => setEditForm({ ...editForm, clientType: e.target.value })} className="sr-only" />
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${editForm.clientType === opt.value ? "bg-white" : "bg-gray-100 text-gray-500"}`}>{opt.icon}</div>
                        <span className="text-sm font-medium">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Personne de contact</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Nom *</label>
                      <input type="text" required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900/15 focus:border-gray-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Email</label>
                      <input type="email" value={editForm.email} disabled className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
                    </div>
                  </div>
                </div>

                {/* Commercial */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Commercial assigné</label>
                  <select value={editForm.createdById} onChange={(e) => setEditForm({ ...editForm, createdById: e.target.value })} className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-gray-900/15 focus:border-gray-500 outline-none [&>option]:bg-white [&>option]:text-gray-900">
                    <option value="">Aucun</option>
                    {commercials.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </form>

              {/* Danger zone */}
              <div className="mt-6 pt-5 border-t border-gray-200">
                <label className="block text-xs font-semibold text-red-600 uppercase tracking-wider mb-2">Zone danger</label>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  {deleteConfirm ? (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-red-700">{selectedClient._count.orders > 0 ? "Ce client a des commandes. Il sera désactivé." : "Supprimer définitivement ?"}</p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setDeleteConfirm(false)} className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">Annuler</button>
                        <button onClick={handleDelete} className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg">Confirmer</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(true)} className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      Supprimer ce client
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
              <button type="button" onClick={() => setSelectedClient(null)} className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">Annuler</button>
              <button type="submit" form="edit-client-form" disabled={editSubmitting} className="btn-primary px-5 py-2.5 text-sm">
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
