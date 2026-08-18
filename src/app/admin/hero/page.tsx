"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

interface Slider {
  id: string;
  titleFr: string | null;
  titleEn: string | null;
  subtitleFr: string | null;
  subtitleEn: string | null;
  image: string;
  link: string | null;
  buttonTextFr: string | null;
  buttonTextEn: string | null;
  order: number;
  isActive: boolean;
}

const emptyForm = {
  titleFr: "", titleEn: "", subtitleFr: "", subtitleEn: "",
  image: "", link: "", buttonTextFr: "", buttonTextEn: "", isActive: true,
};

export default function AdminHeroPage() {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [previewTab, setPreviewTab] = useState<"fr" | "en">("fr");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchSliders = useCallback(async () => {
    const res = await fetch("/api/admin/sliders");
    if (res.ok) setSliders(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchSliders(); }, [fetchSliders]);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (dialogOpen) { if (!d.open) d.showModal(); }
    else { if (d.open) d.close(); }
  }, [dialogOpen]);

  function openCreate() {
    setEditingId(null);
    setFormData(emptyForm);
    setError("");
    setDialogOpen(true);
  }

  function openEdit(s: Slider) {
    setEditingId(s.id);
    setFormData({
      titleFr: s.titleFr || "", titleEn: s.titleEn || "",
      subtitleFr: s.subtitleFr || "", subtitleEn: s.subtitleEn || "",
      image: s.image, link: s.link || "",
      buttonTextFr: s.buttonTextFr || "", buttonTextEn: s.buttonTextEn || "",
      isActive: s.isActive,
    });
    setError("");
    setDialogOpen(true);
  }

  async function uploadFile(file: File) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (!allowedTypes.includes(file.type)) {
      setError("Format non supporté. Utilisez JPG, PNG, WebP ou AVIF.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Fichier trop volumineux (max 5 Mo).");
      return;
    }

    setUploading(true);
    setError("");

    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);

    if (res.ok) {
      setFormData((prev) => ({ ...prev, image: data.url }));
    } else {
      setError(data.error || "Erreur lors de l'upload.");
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.image) {
      setError("Image requise.");
      return;
    }
    setError("");
    setSubmitting(true);

    const url = editingId ? `/api/admin/sliders/${editingId}` : "/api/admin/sliders";
    const method = editingId ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          titleFr: formData.titleFr || null,
          titleEn: formData.titleEn || null,
          subtitleFr: formData.subtitleFr || null,
          subtitleEn: formData.subtitleEn || null,
          link: formData.link || null,
          buttonTextFr: formData.buttonTextFr || null,
          buttonTextEn: formData.buttonTextEn || null,
        }),
      });

      if (res.ok) {
        setSuccess(editingId ? "Slide mis à jour." : "Slide créé.");
        setDialogOpen(false);
        fetchSliders();
        setTimeout(() => setSuccess(""), 4000);
      } else {
        const data = await res.json();
        setError(data.error || "Erreur.");
      }
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce slide ?")) return;
    const res = await fetch(`/api/admin/sliders/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("La suppression a échoué.");
      setTimeout(() => setError(""), 4000);
    }
    fetchSliders();
  }

  async function toggleActive(s: Slider) {
    const res = await fetch(`/api/admin/sliders/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !s.isActive }),
    });
    if (!res.ok) {
      setError("La mise à jour a échoué.");
      setTimeout(() => setError(""), 4000);
    }
    fetchSliders();
  }

  async function moveSlider(index: number, direction: "up" | "down") {
    const newSliders = [...sliders];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSliders.length) return;
    [newSliders[index], newSliders[targetIndex]] = [newSliders[targetIndex], newSliders[index]];

    // Optimistic update; re-sync from the server if the reorder fails
    setSliders(newSliders);
    const res = await fetch("/api/admin/sliders/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: newSliders.map((s) => s.id) }),
    });
    if (!res.ok) {
      setError("Le réordonnancement a échoué.");
      setTimeout(() => setError(""), 4000);
      fetchSliders();
    }
  }

  function set(field: string, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeCount = sliders.filter((s) => s.isActive).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Hero / Slider</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gérez le carrousel de la page d&apos;accueil &middot;{" "}
            <span className="text-gray-900 font-medium">{activeCount} actif{activeCount !== 1 ? "s" : ""}</span>
            {" "} sur {sliders.length} slide{sliders.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="btn-primary px-4 py-2.5 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau slide
        </button>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {success}
        </div>
      )}

      {error && !dialogOpen && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6">
          {error}
        </div>
      )}

      {/* Slider cards */}
      {sliders.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <svg className="w-12 h-12 mx-auto text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500 text-sm mb-4">Aucun slide. Commencez par en créer un.</p>
          <button onClick={openCreate} className="text-sm text-gray-900 hover:text-gray-600 font-medium">
            + Ajouter un slide
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sliders.map((s, index) => (
            <div
              key={s.id}
              className={`bg-white shadow-sm rounded-xl border overflow-hidden flex ${
                s.isActive ? "border-gray-200" : "border-gray-200 opacity-60"
              }`}
            >
              {/* Image */}
              <div className="relative w-48 min-h-[120px] shrink-0 bg-gray-100">
                <Image
                  src={s.image}
                  alt={s.titleFr || "Slide"}
                  fill
                  className="object-cover"
                  sizes="192px"
                />
                <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-bold px-2 py-0.5 rounded">
                  #{index + 1}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {s.titleFr || "Sans titre"}
                    </h3>
                    <span
                      className={`shrink-0 px-2 py-0.5 text-[10px] font-semibold rounded-full cursor-pointer ${
                        s.isActive
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : "bg-red-50 text-red-700 hover:bg-red-100"
                      }`}
                      onClick={() => toggleActive(s)}
                      title="Cliquer pour basculer"
                    >
                      {s.isActive ? "Actif" : "Inactif"}
                    </span>
                  </div>
                  {s.subtitleFr && (
                    <p className="text-xs text-gray-500 truncate">{s.subtitleFr}</p>
                  )}
                  {s.link && (
                    <p className="text-xs text-gray-700 truncate mt-1">{s.link}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                  <div className="flex gap-1">
                    <button
                      onClick={() => moveSlider(index, "up")}
                      disabled={index === 0}
                      className="w-7 h-7 flex items-center justify-center rounded text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30 transition-colors"
                      title="Monter"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => moveSlider(index, "down")}
                      disabled={index === sliders.length - 1}
                      className="w-7 h-7 flex items-center justify-center rounded text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30 transition-colors"
                      title="Descendre"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => openEdit(s)} className="text-xs text-gray-900 hover:text-gray-600 font-medium">
                      Modifier
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="text-xs text-red-600 hover:text-red-700 font-medium">
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Live Preview */}
      {sliders.filter((s) => s.isActive).length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">Aperçu en direct</h2>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setPreviewTab("fr")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  previewTab === "fr" ? "bg-purple-600 text-white" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                FR
              </button>
              <button
                onClick={() => setPreviewTab("en")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  previewTab === "en" ? "bg-purple-600 text-white" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                EN
              </button>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden border border-gray-200">
            <div className="relative h-64 bg-gray-950">
              {sliders.filter((s) => s.isActive).map((s, i) => (
                i === 0 && (
                  <div key={s.id} className="relative h-full w-full">
                    <Image
                      src={s.image}
                      alt={s.titleFr || "Preview"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1200px) 100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-950/80 via-gray-950/45 to-gray-950/10" />
                    <div className="absolute inset-0 flex items-center">
                      <div className="px-8">
                        <h3 className="text-xl font-bold text-white mb-2">
                          {previewTab === "en" ? (s.titleEn || s.titleFr || "No title") : (s.titleFr || "Sans titre")}
                        </h3>
                        <p className="text-sm text-white/80">
                          {previewTab === "en" ? (s.subtitleEn || s.subtitleFr || "") : (s.subtitleFr || "")}
                        </p>
                        {(s.buttonTextFr || s.link) && (
                          <div className="mt-4">
                            <span className="inline-flex items-center px-4 py-2 bg-white text-gray-900 text-sm font-semibold rounded-xl">
                              {previewTab === "en" ? (s.buttonTextEn || s.buttonTextFr || "Learn more") : (s.buttonTextFr || "En savoir plus")}
                              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                              </svg>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Slide count indicator */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {sliders.filter((sl) => sl.isActive).map((_, idx) => (
                        <div
                          key={idx}
                          className={`h-2 rounded-full ${idx === 0 ? "w-6 bg-white" : "w-2 bg-white/50"}`}
                        />
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dialog */}
      <dialog
        ref={dialogRef}
        onClose={() => setDialogOpen(false)}
        className="fixed inset-0 m-auto w-full max-w-2xl h-fit max-h-[90vh] rounded-2xl bg-white border border-gray-200 p-0 shadow-2xl shadow-gray-900/10 backdrop:bg-gray-900/40 backdrop:backdrop-blur-sm overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingId ? "Modifier le slide" : "Nouveau slide"}
            </h2>
            <button
              onClick={() => setDialogOpen(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image *</label>
              {formData.image ? (
                <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                  <div className="relative h-48">
                    <Image
                      src={formData.image}
                      alt="Preview"
                      fill
                      className="object-cover"
                      sizes="600px"
                    />
                  </div>
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-white shadow-sm"
                    >
                      Changer
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, image: "" }))}
                      className="bg-red-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-600 shadow-sm"
                    >
                      Retirer
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                    dragOver
                      ? "border-gray-500 bg-gray-100"
                      : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                  }`}
                >
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-gray-500">Upload en cours...</p>
                    </div>
                  ) : (
                    <>
                      <svg className="w-10 h-10 mx-auto text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm text-gray-500 mb-1">
                        Glissez une image ici ou <span className="text-gray-900 font-medium">parcourir</span>
                      </p>
                      <p className="text-xs text-gray-500">JPG, PNG, WebP ou AVIF · Max 5 Mo</p>
                    </>
                  )}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Titles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase">FR</span>
                  </div>
                  <input
                    type="text"
                    value={formData.titleFr}
                    onChange={(e) => set("titleFr", e.target.value)}
                    placeholder="Titre en français"
                    className="admin-input"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase">EN</span>
                  </div>
                  <input
                    type="text"
                    value={formData.titleEn}
                    onChange={(e) => set("titleEn", e.target.value)}
                    placeholder="Title in English"
                    className="admin-input"
                  />
                </div>
              </div>
            </div>

            {/* Subtitles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sous-titre</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase">FR</span>
                  </div>
                  <input
                    type="text"
                    value={formData.subtitleFr}
                    onChange={(e) => set("subtitleFr", e.target.value)}
                    placeholder="Sous-titre en français"
                    className="admin-input"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase">EN</span>
                  </div>
                  <input
                    type="text"
                    value={formData.subtitleEn}
                    onChange={(e) => set("subtitleEn", e.target.value)}
                    placeholder="Subtitle in English"
                    className="admin-input"
                  />
                </div>
              </div>
            </div>

            {/* Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lien (optionnel)</label>
              <input
                type="text"
                value={formData.link}
                onChange={(e) => set("link", e.target.value)}
                placeholder="/products ou https://..."
                className="admin-input"
              />
            </div>

            {/* Button Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Texte du bouton</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase">FR</span>
                  </div>
                  <input
                    type="text"
                    value={formData.buttonTextFr}
                    onChange={(e) => set("buttonTextFr", e.target.value)}
                    placeholder="En savoir plus"
                    className="admin-input"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase">EN</span>
                  </div>
                  <input
                    type="text"
                    value={formData.buttonTextEn}
                    onChange={(e) => set("buttonTextEn", e.target.value)}
                    placeholder="Learn more"
                    className="admin-input"
                  />
                </div>
              </div>
            </div>

            {/* Active toggle */}
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={formData.isActive as boolean}
                  onChange={(e) => set("isActive", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-300 rounded-full peer-checked:bg-purple-600 transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm peer-checked:translate-x-4 transition-transform" />
              </div>
              <span className="text-sm text-gray-700">Visible sur le site</span>
            </label>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting || uploading}
                className="btn-primary px-5 py-2.5 text-sm"
              >
                {submitting ? "Enregistrement..." : editingId ? "Enregistrer" : "Créer le slide"}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
}
