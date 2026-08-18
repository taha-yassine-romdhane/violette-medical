"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

interface Event {
  id: string;
  titleFr: string;
  titleEn: string;
  descriptionFr: string | null;
  descriptionEn: string | null;
  location: string | null;
  date: string;
  endDate: string | null;
  images: string[];
  thumbnail: string | null;
  isActive: boolean;
  isFeatured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

const emptyForm = {
  titleFr: "",
  titleEn: "",
  descriptionFr: "",
  descriptionEn: "",
  location: "",
  date: "",
  endDate: "",
  isActive: true,
  isFeatured: false,
  order: 0,
};

function toLocalDatetime(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ============================================
// Drag & Drop Image Uploader Component
// ============================================
function ImageDropZone({
  label,
  images,
  onImagesChange,
  multiple = false,
  folder = "events",
}: {
  label: string;
  images: string[];
  onImagesChange: (urls: string[]) => void;
  multiple?: boolean;
  folder?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFiles(files: FileList | File[]) {
    setUploadError("");
    setUploading(true);

    const formData = new FormData();
    formData.set("folder", folder);
    for (const file of Array.from(files)) {
      formData.append("files", file);
    }

    try {
      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        setUploadError(data.error || "Erreur d'upload.");
        setUploading(false);
        return;
      }
      const { urls } = await res.json();
      if (multiple) {
        onImagesChange([...images, ...urls]);
      } else {
        onImagesChange(urls.slice(0, 1));
      }
    } catch {
      setUploadError("Erreur réseau.");
    }
    setUploading(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
      e.target.value = "";
    }
  }

  function removeImage(idx: number) {
    onImagesChange(images.filter((_, i) => i !== idx));
  }

  function moveImage(idx: number, direction: -1 | 1) {
    const newImages = [...images];
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= newImages.length) return;
    [newImages[idx], newImages[newIdx]] = [newImages[newIdx], newImages[idx]];
    onImagesChange(newImages);
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

      {/* Existing images preview */}
      {images.length > 0 && (
        <div className={`flex flex-wrap gap-2 mb-3 ${multiple ? "" : ""}`}>
          {images.map((url, idx) => (
            <div key={`${url}-${idx}`} className="relative group">
              <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 relative">
                <Image src={url} alt="" fill className="object-cover" sizes="96px" />
              </div>
              {/* Overlay actions */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 rounded-lg transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                {multiple && idx > 0 && (
                  <button
                    type="button"
                    onClick={() => moveImage(idx, -1)}
                    className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100 shadow-sm"
                    title="Déplacer à gauche"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 shadow-sm"
                  title="Supprimer"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                {multiple && idx < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveImage(idx, 1)}
                    className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100 shadow-sm"
                    title="Déplacer à droite"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
              {/* First badge for multiple */}
              {multiple && idx === 0 && images.length > 1 && (
                <span className="absolute -top-1.5 -left-1.5 bg-purple-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  1er
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Drop zone (show if no image for single, or always for multiple) */}
      {(multiple || images.length === 0) && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            dragOver
              ? "border-gray-500 bg-gray-100"
              : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple={multiple}
            onChange={handleFileSelect}
            className="hidden"
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-700 font-medium">Upload en cours...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-1">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21zM12 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">
                  <span className="text-gray-900 font-medium">Cliquez</span> ou glissez-déposez
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  JPG, PNG, WebP ou AVIF &middot; Max 5 Mo {multiple ? "chacun" : ""}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {uploadError && (
        <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {uploadError}
        </p>
      )}
    </div>
  );
}

// ============================================
// Main Admin Events Page
// ============================================
export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [thumbnailImages, setThumbnailImages] = useState<string[]>([]);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [previewTab, setPreviewTab] = useState<"fr" | "en">("fr");
  const dialogRef = useRef<HTMLDialogElement>(null);

  const fetchEvents = useCallback(async () => {
    const res = await fetch("/api/events?all=true");
    if (res.ok) setEvents(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (dialogOpen) {
      if (!d.open) d.showModal();
    } else {
      if (d.open) d.close();
    }
  }, [dialogOpen]);

  function openCreate() {
    setEditingId(null);
    setFormData(emptyForm);
    setThumbnailImages([]);
    setGalleryImages([]);
    setError("");
    setDialogOpen(true);
  }

  function openEdit(ev: Event) {
    setEditingId(ev.id);
    setFormData({
      titleFr: ev.titleFr,
      titleEn: ev.titleEn,
      descriptionFr: ev.descriptionFr || "",
      descriptionEn: ev.descriptionEn || "",
      location: ev.location || "",
      date: toLocalDatetime(ev.date),
      endDate: ev.endDate ? toLocalDatetime(ev.endDate) : "",
      isActive: ev.isActive,
      isFeatured: ev.isFeatured,
      order: ev.order,
    });
    setThumbnailImages(ev.thumbnail ? [ev.thumbnail] : []);
    setGalleryImages(ev.images || []);
    setError("");
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.titleFr || !formData.date) {
      setError("Le titre (FR) et la date sont requis.");
      return;
    }
    setError("");
    setSubmitting(true);

    const payload = {
      titleFr: formData.titleFr,
      titleEn: formData.titleEn || formData.titleFr,
      descriptionFr: formData.descriptionFr || null,
      descriptionEn: formData.descriptionEn || null,
      location: formData.location || null,
      date: new Date(formData.date).toISOString(),
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      thumbnail: thumbnailImages[0] || null,
      images: galleryImages,
      isActive: formData.isActive,
      isFeatured: formData.isFeatured,
      order: formData.order,
    };

    const url = editingId ? `/api/events/${editingId}` : "/api/events";
    const method = editingId ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccess(editingId ? "Événement mis à jour." : "Événement créé.");
        setDialogOpen(false);
        fetchEvents();
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
    if (!confirm("Supprimer cet événement ?")) return;
    const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setSuccess("");
      setError("La suppression a échoué.");
      setTimeout(() => setError(""), 4000);
    }
    fetchEvents();
  }

  async function toggleActive(ev: Event) {
    const res = await fetch(`/api/events/${ev.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !ev.isActive }),
    });
    if (!res.ok) {
      setError("La mise à jour a échoué.");
      setTimeout(() => setError(""), 4000);
    }
    fetchEvents();
  }

  async function toggleFeatured(ev: Event) {
    const res = await fetch(`/api/events/${ev.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFeatured: !ev.isFeatured }),
    });
    if (!res.ok) {
      setError("La mise à jour a échoué.");
      setTimeout(() => setError(""), 4000);
    }
    fetchEvents();
  }

  function set(field: string, value: string | boolean | number) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeCount = events.filter((ev) => ev.isActive).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Événements</h1>
            <span className="bg-gray-900 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              {events.length}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Gérez les événements du site &middot;{" "}
            <span className="text-gray-900 font-medium">
              {activeCount} actif{activeCount !== 1 ? "s" : ""}
            </span>{" "}
            sur {events.length}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="btn-primary px-4 py-2.5 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter un événement
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
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-6">
          {error}
        </div>
      )}

      {/* Events list */}
      {events.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
          <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500 text-sm mb-4">Aucun événement. Commencez par en créer un.</p>
          <button onClick={openCreate} className="text-sm text-gray-900 hover:text-gray-600 font-medium">
            + Ajouter un événement
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((ev) => (
            <div
              key={ev.id}
              className={`bg-white rounded-xl border shadow-sm overflow-hidden flex ${
                ev.isActive ? "border-gray-200" : "border-gray-200 opacity-60"
              }`}
            >
              {/* Thumbnail */}
              <div className="relative w-48 min-h-[120px] shrink-0 bg-gray-100">
                {ev.thumbnail ? (
                  <Image src={ev.thumbnail} alt={ev.titleFr} fill className="object-cover" sizes="192px" />
                ) : ev.images.length > 0 ? (
                  <Image src={ev.images[0]} alt={ev.titleFr} fill className="object-cover" sizes="192px" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{ev.titleFr}</h3>
                    <span
                      className={`shrink-0 px-2 py-0.5 text-[10px] font-semibold rounded-full cursor-pointer ${
                        ev.isActive
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : "bg-red-50 text-red-600 hover:bg-red-100"
                      }`}
                      onClick={() => toggleActive(ev)}
                      title="Cliquer pour basculer"
                    >
                      {ev.isActive ? "Actif" : "Inactif"}
                    </span>
                    <span
                      className={`shrink-0 px-2 py-0.5 text-[10px] font-semibold rounded-full cursor-pointer ${
                        ev.isFeatured
                          ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                      onClick={() => toggleFeatured(ev)}
                      title="Cliquer pour basculer"
                    >
                      {ev.isFeatured ? "En vedette" : "Normal"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(ev.date)}
                      {ev.endDate && ` - ${formatDate(ev.endDate)}`}
                    </span>
                    {ev.location && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {ev.location}
                      </span>
                    )}
                    {ev.images.length > 0 && (
                      <span className="text-gray-500">
                        {ev.images.length} image{ev.images.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  {ev.descriptionFr && (
                    <p className="text-xs text-gray-500 truncate mt-1">{ev.descriptionFr}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end mt-3 pt-3 border-t border-gray-100">
                  <div className="flex gap-3">
                    <button onClick={() => openEdit(ev)} className="text-xs text-gray-900 hover:text-gray-600 font-medium">
                      Modifier
                    </button>
                    <button onClick={() => handleDelete(ev.id)} className="text-xs text-red-600 hover:text-red-500 font-medium">
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
      {events.filter((e) => e.isActive).length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.64 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.64 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Aperçu en direct
            </h2>
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

          {/* Preview: Events section like homepage */}
          <div className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
            <div className="px-6 py-8">
              {/* Section header preview */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {previewTab === "fr" ? "Nos Événements" : "Our Events"}
                </h3>
                <p className="text-sm text-gray-700 font-medium">
                  {previewTab === "fr" ? "Retrouvez-nous lors de nos événements" : "Meet us at our events"}
                </p>
              </div>

              {/* Photo gallery preview */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                {events.filter((e) => e.isActive).slice(0, 6).map((ev, i) => {
                  const img = ev.thumbnail || ev.images[0];
                  const title = previewTab === "en" ? (ev.titleEn || ev.titleFr) : ev.titleFr;
                  return (
                    <div
                      key={ev.id}
                      className={`relative overflow-hidden rounded-lg group ${
                        i === 0 ? "col-span-2 row-span-2" : ""
                      }`}
                    >
                      <div className={`relative ${i === 0 ? "h-52" : "h-24"} bg-gray-100`}>
                        {img ? (
                          <Image
                            src={img}
                            alt={title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes={i === 0 ? "400px" : "200px"}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        {/* Hover overlay with title */}
                        <div className="absolute inset-0 bg-gray-900/0 group-hover:bg-gray-900/60 transition-colors duration-200 flex items-end">
                          <div className="p-2 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <p className="text-white text-xs font-medium truncate">{title}</p>
                            <p className="text-gray-300 text-[10px]">
                              {new Date(ev.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                          </div>
                        </div>
                        {/* Featured badge */}
                        {ev.isFeatured && (
                          <div className="absolute top-1 right-1 bg-purple-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                            {previewTab === "fr" ? "Vedette" : "Featured"}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Event cards preview */}
              <div className="space-y-2">
                {events.filter((e) => e.isActive).slice(0, 3).map((ev) => {
                  const title = previewTab === "en" ? (ev.titleEn || ev.titleFr) : ev.titleFr;
                  const desc = previewTab === "en" ? (ev.descriptionEn || ev.descriptionFr) : ev.descriptionFr;
                  const img = ev.thumbnail || ev.images[0];
                  return (
                    <div key={ev.id} className="bg-gray-50 rounded-lg border border-gray-200 p-3 flex gap-3">
                      {img && (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                          <Image src={img} alt={title} fill className="object-cover" sizes="64px" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-gray-900 truncate">{title}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                          <span>
                            {new Date(ev.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                          </span>
                          {ev.location && (
                            <>
                              <span>&middot;</span>
                              <span>{ev.location}</span>
                            </>
                          )}
                        </div>
                        {desc && (
                          <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{desc}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Browser frame bottom bar */}
            <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 flex items-center justify-between">
              <p className="text-[10px] text-gray-500">
                {events.filter((e) => e.isActive).length} événement{events.filter((e) => e.isActive).length !== 1 ? "s" : ""} actif{events.filter((e) => e.isActive).length !== 1 ? "s" : ""}
              </p>
              <p className="text-[10px] text-gray-500">localhost:3000/events</p>
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
              {editingId ? "Modifier l'événement" : "Nouvel événement"}
            </h2>
            <button
              onClick={() => setDialogOpen(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Titles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Titre *</label>
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
                    required
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

            {/* Descriptions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase">FR</span>
                  </div>
                  <textarea
                    value={formData.descriptionFr}
                    onChange={(e) => set("descriptionFr", e.target.value)}
                    placeholder="Description en français"
                    rows={3}
                    className="admin-input resize-none"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase">EN</span>
                  </div>
                  <textarea
                    value={formData.descriptionEn}
                    onChange={(e) => set("descriptionEn", e.target.value)}
                    placeholder="Description in English"
                    rows={3}
                    className="admin-input resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lieu (optionnel)</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="Ex : Tunis, Centre des congrès"
                className="admin-input"
              />
            </div>

            {/* Dates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dates *</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase">Début</span>
                  </div>
                  <input
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => set("date", e.target.value)}
                    className="admin-input"
                    required
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase">Fin (optionnel)</span>
                  </div>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => set("endDate", e.target.value)}
                    className="admin-input"
                  />
                </div>
              </div>
            </div>

            {/* Thumbnail - Drag & Drop */}
            <ImageDropZone
              label="Image principale (miniature)"
              images={thumbnailImages}
              onImagesChange={setThumbnailImages}
              multiple={false}
              folder="events"
            />

            {/* Gallery Images - Drag & Drop */}
            <ImageDropZone
              label="Galerie d'images"
              images={galleryImages}
              onImagesChange={setGalleryImages}
              multiple={true}
              folder="events"
            />

            {/* Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ordre d&apos;affichage</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => set("order", parseInt(e.target.value) || 0)}
                className="w-24 px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/15 focus:border-gray-500"
              />
            </div>

            {/* Toggles */}
            <div className="flex gap-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => set("isActive", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-300 rounded-full peer-checked:bg-purple-600 transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm peer-checked:translate-x-4 transition-transform" />
                </div>
                <span className="text-sm text-gray-700">Actif</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => set("isFeatured", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-300 rounded-full peer-checked:bg-amber-500 transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm peer-checked:translate-x-4 transition-transform" />
                </div>
                <span className="text-sm text-gray-700">En vedette</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary px-5 py-2.5 text-sm"
              >
                {submitting ? "Enregistrement..." : editingId ? "Enregistrer" : "Créer l'événement"}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
}
