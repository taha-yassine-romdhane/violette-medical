"use client";

import { useState, useEffect, useCallback } from "react";

interface SettingsGroup {
  [key: string]: string;
}

const settingsConfig = [
  {
    group: "general",
    title: "Général",
    fields: [
      { key: "site_name", label: "Nom du site", placeholder: "Violette Medical Distribution" },
      { key: "site_logo", label: "URL du logo", placeholder: "/logo.PNG" },
    ],
  },
  {
    group: "contact",
    title: "Contact",
    fields: [
      { key: "contact_address", label: "Adresse", placeholder: "Adresse de l'entreprise" },
      { key: "contact_phone", label: "Téléphone", placeholder: "+216 XX XXX XXX" },
      { key: "contact_email", label: "Email", placeholder: "contact@violette-medical.tn" },
    ],
  },
  {
    group: "social",
    title: "Réseaux sociaux",
    fields: [
      { key: "social_facebook", label: "Facebook", placeholder: "https://facebook.com/..." },
      { key: "social_instagram", label: "Instagram", placeholder: "https://instagram.com/..." },
    ],
  },
  {
    group: "commerce",
    title: "Commerce",
    fields: [
      { key: "commerce_tax_rate", label: "Taux TVA (%)", placeholder: "19" },
      { key: "commerce_min_order", label: "Commande minimum (TND)", placeholder: "0" },
    ],
  },
];

export default function AdminSettingsPage() {
  const [values, setValues] = useState<Record<string, SettingsGroup>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const fetchSettings = useCallback(async () => {
    const res = await fetch("/api/admin/settings");
    if (res.ok) {
      setValues(await res.json());
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  function getValue(group: string, key: string): string {
    return values[group]?.[key] || "";
  }

  function setValue(group: string, key: string, val: string) {
    setValues((prev) => ({
      ...prev,
      [group]: { ...prev[group], [key]: val },
    }));
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setSaving(false);

    if (res.ok) {
      setSuccess("Paramètres enregistrés.");
      setTimeout(() => setSuccess(""), 4000);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Paramètres</h1>
          <p className="text-sm text-gray-500 mt-1">Configuration du site</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary px-5 py-2.5 text-sm"
        >
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>

      {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm mb-6">{success}</div>}

      <div className="space-y-6">
        {settingsConfig.map((section) => (
          <div key={section.group} className="admin-card p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">{section.title}</h2>
            <div className="space-y-4">
              {section.fields.map((field) => (
                <div key={field.key}>
                  <label className="admin-label">{field.label}</label>
                  <input
                    type="text"
                    value={getValue(section.group, field.key)}
                    onChange={(e) => setValue(section.group, field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="admin-input"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
