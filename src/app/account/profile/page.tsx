"use client";

import { useState, useEffect } from "react";

interface Profile {
  id: string; name: string; email: string; companyName: string | null;
  matriculeFiscale: string | null; address: string | null; city: string | null;
  postalCode: string | null; phone: string | null; role: string; createdAt: string;
}

const roleLabels: Record<string, string> = { ADMIN: "Administrateur", COMMERCIAL: "Commercial", USER: "Client" };

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ companyName: "", phone: "", address: "", city: "", postalCode: "" });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Password change
  const [pwOpen, setPwOpen] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  useEffect(() => {
    fetch("/api/account/profile").then((r) => r.json()).then((data) => {
      setProfile(data);
      setForm({
        companyName: data.companyName || "", phone: data.phone || "",
        address: data.address || "", city: data.city || "", postalCode: data.postalCode || "",
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true); setError("");
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      setProfile((prev) => prev ? { ...prev, ...data } : prev);
      setEditing(false);
      setSuccess("Profil mis a jour.");
      setTimeout(() => setSuccess(""), 3000);
    } else {
      const data = await res.json();
      setError(data.error || "Erreur.");
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwError("Les mots de passe ne correspondent pas."); return;
    }
    setPwSaving(true);
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
    });
    setPwSaving(false);
    if (res.ok) {
      setPwSuccess("Mot de passe modifie.");
      setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
      setPwOpen(false);
      setTimeout(() => setPwSuccess(""), 3000);
    } else {
      const data = await res.json();
      setPwError(data.error || "Erreur.");
    }
  }

  if (loading || !profile) {
    return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-purple-700 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mon profil</h1>

      {(success || pwSuccess) && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-5 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          {success || pwSuccess}
        </div>
      )}

      {/* Profile info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl mb-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-lg font-bold">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{profile.name}</p>
              <p className="text-sm text-gray-500">{profile.email}</p>
            </div>
          </div>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">
            {roleLabels[profile.role] || profile.role}
          </span>
        </div>

        {editing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Societe</label>
                <input type="text" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Telephone</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Adresse</label>
              <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Ville</label>
                <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Code postal</label>
                <input type="text" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2 pt-2">
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-purple-700 text-white text-sm font-medium rounded-lg hover:bg-purple-800 disabled:opacity-50">
                {saving ? "..." : "Enregistrer"}
              </button>
              <button onClick={() => setEditing(false)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">Annuler</button>
            </div>
          </div>
        ) : (
          <div>
            <div className="space-y-3">
              {[
                { label: "Societe", value: profile.companyName },
                { label: "Matricule fiscale", value: profile.matriculeFiscale },
                { label: "Telephone", value: profile.phone },
                { label: "Adresse", value: profile.address },
                { label: "Ville", value: profile.city },
                { label: "Code postal", value: profile.postalCode },
                { label: "Membre depuis", value: new Date(profile.createdAt).toLocaleDateString("fr-FR", { dateStyle: "long" }) },
              ].filter((f) => f.value).map((f) => (
                <div key={f.label} className="flex">
                  <span className="w-40 text-sm text-gray-500 shrink-0">{f.label}</span>
                  <span className="text-sm font-medium text-gray-900">{f.value}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setEditing(true)} className="mt-5 px-4 py-2 text-sm text-purple-700 border border-purple-300 rounded-lg hover:bg-purple-50 font-medium">
              Modifier mes informations
            </button>
          </div>
        )}
      </div>

      {/* Password change */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Mot de passe</h2>
            <p className="text-xs text-gray-500 mt-0.5">Modifier votre mot de passe de connexion</p>
          </div>
          {!pwOpen && (
            <button onClick={() => setPwOpen(true)} className="text-sm text-purple-700 hover:text-purple-900 font-medium">
              Changer
            </button>
          )}
        </div>

        {pwOpen && (
          <form onSubmit={handlePasswordChange} className="mt-4 space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Mot de passe actuel</label>
              <input type="password" required value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Nouveau mot de passe</label>
              <input type="password" required value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
              <p className="text-[11px] text-gray-400 mt-1">8+ caracteres, majuscule, minuscule, chiffre</p>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Confirmer</label>
              <input type="password" required value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
            </div>
            {pwError && <p className="text-sm text-red-600">{pwError}</p>}
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={pwSaving} className="px-4 py-2 bg-purple-700 text-white text-sm font-medium rounded-lg hover:bg-purple-800 disabled:opacity-50">
                {pwSaving ? "..." : "Changer le mot de passe"}
              </button>
              <button type="button" onClick={() => { setPwOpen(false); setPwError(""); }} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">Annuler</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
