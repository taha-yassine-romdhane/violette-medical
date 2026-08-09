"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  isRead: boolean;
  isArchived: boolean;
  note: string | null;
  createdAt: string;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Il y a ${days}j`;
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const params = filter ? `?filter=${filter}` : "";
      const res = await fetch(`/api/admin/messages${params}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
        setUnreadCount(data.unreadCount);
      }
    } catch {
      /* réseau indisponible — on garde l'état courant */
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const selected = messages.find((m) => m.id === selectedId) || null;

  // Auto-mark as read when selecting
  useEffect(() => {
    if (selected && !selected.isRead) {
      fetch(`/api/admin/messages/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      })
        .then(() => fetchMessages())
        .catch(() => {});
    }
    if (selected) {
      setNoteValue(selected.note || "");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  function showToast(msg: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(""), 3000);
  }

  async function toggleRead(msg: Message) {
    try {
      const res = await fetch(`/api/admin/messages/${msg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: !msg.isRead }),
      });
      if (!res.ok) throw new Error();
      fetchMessages();
    } catch {
      showToast("Erreur — action non enregistrée.");
    }
  }

  async function toggleArchive(msg: Message) {
    try {
      const res = await fetch(`/api/admin/messages/${msg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: !msg.isArchived }),
      });
      if (!res.ok) throw new Error();
      if (selectedId === msg.id) setSelectedId(null);
      showToast(msg.isArchived ? "Message désarchivé." : "Message archivé.");
      fetchMessages();
    } catch {
      showToast("Erreur — action non enregistrée.");
    }
  }

  async function deleteMessage(msg: Message) {
    if (!confirm("Supprimer définitivement ce message ?")) return;
    try {
      const res = await fetch(`/api/admin/messages/${msg.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      if (selectedId === msg.id) setSelectedId(null);
      showToast("Message supprimé.");
      fetchMessages();
    } catch {
      showToast("Erreur — suppression impossible.");
    }
  }

  async function saveNote() {
    if (!selected) return;
    setNoteSaving(true);
    try {
      const res = await fetch(`/api/admin/messages/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: noteValue || null }),
      });
      if (!res.ok) throw new Error();
      showToast("Note enregistrée.");
      fetchMessages();
    } catch {
      showToast("Erreur — note non enregistrée.");
    }
    setNoteSaving(false);
  }

  async function markAllRead() {
    const unread = messages.filter((m) => !m.isRead);
    if (unread.length === 0) return;
    try {
      await Promise.all(
        unread.map((m) =>
          fetch(`/api/admin/messages/${m.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isRead: true }),
          })
        )
      );
      showToast(`${unread.length} message${unread.length > 1 ? "s" : ""} marqué${unread.length > 1 ? "s" : ""} comme lu${unread.length > 1 ? "s" : ""}.`);
    } catch {
      showToast("Erreur — certains messages n'ont pas pu être marqués.");
    }
    fetchMessages();
  }

  // Filter by search
  const filtered = messages.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      (m.subject || "").toLowerCase().includes(q) ||
      m.message.toLowerCase().includes(q)
    );
  });

  const thisWeek = messages.filter((m) => {
    const d = new Date(m.createdAt).getTime();
    return d >= Date.now() - 7 * 24 * 60 * 60 * 1000;
  }).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 border border-white/15 text-white px-4 py-2.5 rounded-xl text-sm shadow-2xl shadow-black/50 flex items-center gap-2 animate-[fadeIn_0.2s_ease-out]">
          <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-5 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Messages</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {unreadCount > 0 ? (
              <><span className="text-purple-300 font-medium">{unreadCount} non lu{unreadCount > 1 ? "s" : ""}</span> &middot; </>
            ) : null}
            {messages.length} message{messages.length !== 1 ? "s" : ""} &middot; {thisWeek} cette semaine
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-sm text-purple-300 hover:text-purple-200 font-medium flex items-center gap-1.5 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5 shrink-0">
        <div className="admin-card p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/15 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-xl font-bold text-white tabular-nums">{messages.length}</p>
            <p className="text-xs text-gray-400">Total</p>
          </div>
        </div>
        <div className="admin-card p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500/15 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
          <div>
            <p className="text-xl font-bold text-white tabular-nums">{unreadCount}</p>
            <p className="text-xs text-gray-400">Non lus</p>
          </div>
        </div>
        <div className="admin-card p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/15 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <p className="text-xl font-bold text-white tabular-nums">{thisWeek}</p>
            <p className="text-xs text-gray-400">Cette semaine</p>
          </div>
        </div>
      </div>

      {/* Inbox area */}
      <div className="flex-1 flex admin-card overflow-hidden min-h-0">
        {/* Left: Message list */}
        <div className="w-[380px] shrink-0 border-r border-white/10 flex flex-col">
          {/* Search + filters */}
          <div className="p-3 border-b border-white/10 space-y-2">
            <div className="relative">
              <svg className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="admin-input pl-9 py-2"
              />
            </div>
            <div className="flex gap-1">
              {[
                { value: "", label: "Tous", count: messages.length },
                { value: "unread", label: "Non lus", count: unreadCount },
                { value: "archived", label: "Archivés" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => { setFilter(tab.value); setSelectedId(null); }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
                    filter === tab.value
                      ? "bg-purple-500/15 text-purple-300 border-purple-400/40"
                      : "border-white/10 text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {tab.label}
                  {"count" in tab && tab.count !== undefined && tab.count > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      filter === tab.value ? "bg-purple-500/30 text-purple-200" : "bg-white/10 text-gray-400"
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Message list */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <svg className="w-10 h-10 text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-400">
                  {search ? "Aucun résultat." : "Aucun message."}
                </p>
              </div>
            ) : (
              filtered.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => setSelectedId(msg.id)}
                  className={`w-full text-left px-4 py-3.5 border-b border-white/5 transition-colors ${
                    selectedId === msg.id
                      ? "bg-purple-500/10 border-l-2 border-l-purple-400"
                      : !msg.isRead
                        ? "bg-purple-500/[0.06] hover:bg-white/[0.03]"
                        : "hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      {!msg.isRead && (
                        <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                      )}
                      <span className={`text-sm truncate text-white ${!msg.isRead ? "font-semibold" : ""}`}>
                        {msg.name}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-500 shrink-0 whitespace-nowrap">
                      {timeAgo(msg.createdAt)}
                    </span>
                  </div>
                  {msg.subject && (
                    <p className="text-xs font-medium text-gray-300 truncate mb-0.5">{msg.subject}</p>
                  )}
                  <p className="text-xs text-gray-400 truncate">{msg.message}</p>
                  {msg.note && (
                    <div className="flex items-center gap-1 mt-1.5">
                      <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                      </svg>
                      <span className="text-[11px] text-amber-300 truncate">{msg.note}</span>
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: Message detail */}
        <div className="flex-1 flex flex-col min-w-0">
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-400 text-sm">Sélectionnez un message pour le lire</p>
            </div>
          ) : (
            <>
              {/* Detail header */}
              <div className="px-6 py-4 border-b border-white/10 shrink-0">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-white truncate">
                      {selected.subject || "Sans sujet"}
                    </h2>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-500/15 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-purple-300">
                            {selected.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{selected.name}</p>
                          <p className="text-xs text-gray-500">{selected.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => toggleRead(selected)}
                      className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      title={selected.isRead ? "Marquer non lu" : "Marquer lu"}
                    >
                      {selected.isRead ? (
                        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19V5a2 2 0 012-2h14a2 2 0 012 2v14l-4-3H5a2 2 0 01-2-2z" />
                        </svg>
                      ) : (
                        <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 19V5a2 2 0 012-2h14a2 2 0 012 2v14l-4-3H5a2 2 0 01-2-2z" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => toggleArchive(selected)}
                      className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      title={selected.isArchived ? "Désarchiver" : "Archiver"}
                    >
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </button>
                    <a
                      href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject || "Votre message")}`}
                      className="p-2 text-gray-500 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-colors"
                      title="Répondre par email"
                    >
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V10z" />
                        <polyline strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} points="9,22 9,12 15,12 15,22" />
                      </svg>
                    </a>
                    <button
                      onClick={() => deleteMessage(selected)}
                      className="p-2 text-gray-500 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Meta info */}
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  <span>{new Date(selected.createdAt).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })}</span>
                  {selected.phone && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a href={`tel:${selected.phone}`} className="hover:text-purple-300 transition-colors">{selected.phone}</a>
                    </span>
                  )}
                </div>
              </div>

              {/* Message body */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 mb-6">
                  <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {selected.message}
                  </p>
                </div>

                {/* Internal note */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                    </svg>
                    <label className="text-sm font-medium text-gray-300">Note interne</label>
                  </div>
                  <textarea
                    value={noteValue}
                    onChange={(e) => setNoteValue(e.target.value)}
                    placeholder="Ajouter une note visible uniquement par les administrateurs..."
                    rows={3}
                    className="admin-input resize-none"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={saveNote}
                      disabled={noteSaving || noteValue === (selected.note || "")}
                      className="btn-primary px-4 py-2 text-xs"
                    >
                      {noteSaving ? "..." : "Enregistrer la note"}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
