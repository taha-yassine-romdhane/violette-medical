"use client";

import { useState, useEffect, useCallback, useRef, DragEvent } from "react";

interface Subfamily {
  id: string;
  nameFr: string;
  nameEn: string;
  slug: string;
  isActive?: boolean;
  familyId: string;
  _count?: { products: number };
}

interface Family {
  id: string;
  nameFr: string;
  nameEn: string;
  slug: string;
  isActive?: boolean;
  categoryId: string;
  _count?: { products: number; subfamilies: number };
  subfamilies: Subfamily[];
}

interface Category {
  id: string;
  nameFr: string;
  nameEn: string;
  slug: string;
  isActive?: boolean;
  _count?: { products: number; families: number };
  families: Family[];
}

interface Product {
  id: string;
  nameFr: string;
  nameEn: string;
  reference: string | null;
  descriptionFr: string | null;
  descriptionEn: string | null;
  priceHT: number;
  taxRate: number;
  priceTTC: number;
  stock: number;
  minStock: number;
  images: string[];
  thumbnail: string | null;
  categoryId: string;
  familyId: string | null;
  subfamilyId: string | null;
  category: { id: string; nameFr: string };
  family: { id: string; nameFr: string } | null;
  subfamily: { id: string; nameFr: string } | null;
  isFeatured: boolean;
  isActive: boolean;
  trackSerial: boolean;
}

const emptyForm = {
  nameFr: "", nameEn: "", reference: "", descriptionFr: "", descriptionEn: "",
  priceHT: "", taxRate: "19", stock: "0", minStock: "0",
  categoryId: "", familyId: "", subfamilyId: "",
  thumbnail: "", isFeatured: false, isActive: true, trackSerial: true,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState("");
  const [famFilter, setFamFilter] = useState("");
  const [sfFilter, setSfFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "inactive" | "featured">("");
  const [stockFilter, setStockFilter] = useState<"" | "ok" | "low" | "out">("");
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [imageList, setImageList] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [treeMgrOpen, setTreeMgrOpen] = useState(false);
  const [refMode, setRefMode] = useState<"auto" | "manual">("auto");
  const [dragOver, setDragOver] = useState(false);
  const [dragImageIdx, setDragImageIdx] = useState<number | null>(null);

  // Tree manager inline forms
  const [addingTo, setAddingTo] = useState<{ type: "category" | "family" | "subfamily"; parentId?: string } | null>(null);
  const [addForm, setAddForm] = useState({ nameFr: "", nameEn: "" });
  const [editingNode, setEditingNode] = useState<{ type: string; id: string } | null>(null);
  const [editNodeForm, setEditNodeForm] = useState({ nameFr: "", nameEn: "" });
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [expandedFams, setExpandedFams] = useState<Set<string>>(new Set());

  const dialogRef = useRef<HTMLDialogElement>(null);
  const treeMgrRef = useRef<HTMLDialogElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (catFilter) params.set("category", catFilter);
      if (searchDebounced) params.set("search", searchDebounced);
      const [prodRes, catRes] = await Promise.all([
        fetch(`/api/admin/products?${params}`),
        fetch("/api/admin/categories"),
      ]);
      if (prodRes.ok) setProducts(await prodRes.json());
      if (catRes.ok) setCategories(await catRes.json());
    } catch {
      // network error: keep current data, just stop the spinner
    } finally {
      setLoading(false);
    }
  }, [catFilter, searchDebounced]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Derived filter options
  const filterFamilies = categories.find((c) => c.id === catFilter)?.families || [];
  const filterSubfamilies = filterFamilies.find((f) => f.id === famFilter)?.subfamilies || [];

  // Client-side filtering for family, subfamily, status, stock
  const filteredProducts = products.filter((p) => {
    if (famFilter && p.familyId !== famFilter) return false;
    if (sfFilter && p.subfamilyId !== sfFilter) return false;
    if (statusFilter === "active" && !p.isActive) return false;
    if (statusFilter === "inactive" && p.isActive) return false;
    if (statusFilter === "featured" && !p.isFeatured) return false;
    if (stockFilter === "out" && p.stock > 0) return false;
    if (stockFilter === "low" && (p.stock <= 0 || p.stock > p.minStock)) return false;
    if (stockFilter === "ok" && p.stock <= p.minStock) return false;
    return true;
  });

  const activeFilterCount = [catFilter, famFilter, sfFilter, statusFilter, stockFilter].filter(Boolean).length;

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (dialogOpen) { if (!d.open) d.showModal(); } else { if (d.open) d.close(); }
  }, [dialogOpen]);

  useEffect(() => {
    const d = treeMgrRef.current;
    if (!d) return;
    if (treeMgrOpen) { if (!d.open) d.showModal(); } else { if (d.open) d.close(); }
  }, [treeMgrOpen]);

  function clearAllFilters() {
    setCatFilter(""); setFamFilter(""); setSfFilter("");
    setStatusFilter(""); setStockFilter("");
    setSearch("");
  }

  // Derived: families/subfamilies for the selected category in the product form
  const formFamilies = categories.find((c) => c.id === formData.categoryId)?.families || [];
  const formSubfamilies = formFamilies.find((f) => f.id === formData.familyId)?.subfamilies || [];

  function openCreate() {
    setEditingId(null);
    setFormData(emptyForm);
    setImageList([]);
    setRefMode("auto");
    setError("");
    setDialogOpen(true);
  }

  function openEdit(p: Product) {
    setEditingId(p.id);
    setFormData({
      nameFr: p.nameFr, nameEn: p.nameEn, reference: p.reference || "",
      descriptionFr: p.descriptionFr || "", descriptionEn: p.descriptionEn || "",
      priceHT: String(p.priceHT), taxRate: String(p.taxRate),
      stock: String(p.stock), minStock: String(p.minStock),
      categoryId: p.categoryId,
      familyId: p.familyId || "",
      subfamilyId: p.subfamilyId || "",
      thumbnail: p.thumbnail || "", isFeatured: p.isFeatured, isActive: p.isActive, trackSerial: p.trackSerial,
    });
    setImageList(p.images || []);
    setRefMode(p.reference ? "manual" : "auto");
    setError("");
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const payload = {
      nameFr: formData.nameFr, nameEn: formData.nameEn,
      reference: displayRef || null,
      descriptionFr: formData.descriptionFr || null,
      descriptionEn: formData.descriptionEn || null,
      priceHT: parseFloat(formData.priceHT),
      taxRate: parseFloat(formData.taxRate),
      stock: parseInt(formData.stock), minStock: parseInt(formData.minStock),
      categoryId: formData.categoryId,
      familyId: formData.familyId || null,
      subfamilyId: formData.subfamilyId || null,
      images: imageList,
      thumbnail: formData.thumbnail || imageList[0] || null,
      isFeatured: formData.isFeatured, isActive: formData.isActive, trackSerial: formData.trackSerial,
    };
    const url = editingId ? `/api/admin/products/${editingId}` : "/api/admin/products";
    const method = editingId ? "PATCH" : "POST";
    try {
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSuccess(editingId ? "Produit mis à jour." : "Produit créé.");
        setDialogOpen(false);
        fetchData();
        setTimeout(() => setSuccess(""), 4000);
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.error || "Erreur lors de l'enregistrement.");
      }
    } catch {
      setError("Erreur de connexion. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce produit ?")) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      alert(data?.error || "Impossible de supprimer ce produit.");
      return;
    }
    fetchData();
  }

  function set(field: string, value: string | boolean) {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      // Cascade reset: changing category clears family/subfamily
      if (field === "categoryId") {
        next.familyId = "";
        next.subfamilyId = "";
      }
      if (field === "familyId") {
        next.subfamilyId = "";
      }
      return next;
    });
  }

  // Auto-generate reference
  function buildAutoRef(name: string, catId: string): string {
    const cat = categories.find((c) => c.id === catId);
    const catPrefix = cat
      ? cat.nameFr.substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, "")
      : "PRD";
    const nameWords = name.trim().split(/\s+/).filter(Boolean);
    const nameInitials = nameWords.length > 0
      ? nameWords.map((w) => w[0].toUpperCase()).join("").substring(0, 4)
      : "XXX";
    const count = String(products.length + 1).padStart(3, "0");
    return `${catPrefix || "PRD"}-${nameInitials}-${count}`;
  }

  const autoRef = buildAutoRef(formData.nameFr, formData.categoryId);
  const displayRef = refMode === "auto" ? autoRef : formData.reference;

  // Image handling
  function handleFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => setImageList((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) { handleFiles(e.dataTransfer.files); return; }
    const text = e.dataTransfer.getData("text/plain");
    if (text && (text.startsWith("http") || text.startsWith("/"))) {
      setImageList((prev) => [...prev, text.trim()]);
    }
  }

  function removeImage(idx: number) { setImageList((prev) => prev.filter((_, i) => i !== idx)); }
  function handleImageDragStart(idx: number) { setDragImageIdx(idx); }
  function handleImageDragOver(e: DragEvent, idx: number) {
    e.preventDefault();
    if (dragImageIdx === null || dragImageIdx === idx) return;
    setImageList((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragImageIdx, 1);
      next.splice(idx, 0, moved);
      return next;
    });
    setDragImageIdx(idx);
  }
  function handleImageDragEnd() { setDragImageIdx(null); }
  function addImageUrl() {
    const url = prompt("URL de l'image:");
    if (url?.trim()) setImageList((prev) => [...prev, url.trim()]);
  }

  const priceTTC = (parseFloat(formData.priceHT || "0") * (1 + parseFloat(formData.taxRate || "0") / 100)).toFixed(2);

  // === Tree manager functions ===
  function toggleCatExpanded(id: string) {
    setExpandedCats((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }
  function toggleFamExpanded(id: string) {
    setExpandedFams((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }

  async function handleAddNode(e: React.FormEvent) {
    e.preventDefault();
    if (!addingTo || !addForm.nameFr || !addForm.nameEn) return;

    let url = "/api/admin/categories";
    let body: Record<string, string> = { nameFr: addForm.nameFr, nameEn: addForm.nameEn };

    if (addingTo.type === "family") {
      url = "/api/admin/families";
      body.categoryId = addingTo.parentId!;
    } else if (addingTo.type === "subfamily") {
      url = "/api/admin/subfamilies";
      body.familyId = addingTo.parentId!;
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setAddingTo(null);
      setAddForm({ nameFr: "", nameEn: "" });
      fetchData();
    } else {
      const data = await res.json().catch(() => null);
      alert(data?.error || "Erreur lors de la création.");
    }
  }

  async function handleEditNode(e: React.FormEvent) {
    e.preventDefault();
    if (!editingNode) return;

    const urlMap: Record<string, string> = {
      category: `/api/admin/categories/${editingNode.id}`,
      family: `/api/admin/families/${editingNode.id}`,
      subfamily: `/api/admin/subfamilies/${editingNode.id}`,
    };

    const res = await fetch(urlMap[editingNode.type], {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editNodeForm),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      alert(data?.error || "Erreur lors de la modification.");
      return;
    }
    setEditingNode(null);
    fetchData();
  }

  async function handleDeleteNode(type: string, id: string) {
    const labels: Record<string, string> = { category: "catégorie", family: "famille", subfamily: "sous-famille" };
    if (!confirm(`Supprimer cette ${labels[type]} ?`)) return;

    const urlMap: Record<string, string> = {
      category: `/api/admin/categories/${id}`,
      family: `/api/admin/families/${id}`,
      subfamily: `/api/admin/subfamilies/${id}`,
    };

    const res = await fetch(urlMap[type], { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Erreur.");
      return;
    }
    fetchData();
  }

  // Get product classification label
  function getClassification(p: Product): string {
    const parts = [p.category.nameFr];
    if (p.family) parts.push(p.family.nameFr);
    if (p.subfamily) parts.push(p.subfamily.nameFr);
    return parts.join(" > ");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Produits</h1>
          <p className="text-sm text-gray-400 mt-1">{products.length} produit(s)</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setTreeMgrOpen(true)} className="px-3 py-2.5 border border-white/15 text-gray-300 rounded-xl hover:bg-white/5 hover:text-white transition-colors text-sm font-medium flex items-center gap-1.5" title="Gérer l'arborescence">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            Arborescence
          </button>
          <button onClick={openCreate} className="btn-primary px-4 py-2.5 text-sm">
            + Produit
          </button>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="mb-5 space-y-3">
        <div className="flex gap-2">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <svg className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher par nom, référence..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input pl-10 pr-8"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`px-4 py-2.5 border rounded-xl text-sm font-medium flex items-center gap-2 transition-colors ${
              filtersOpen || activeFilterCount > 0
                ? "border-purple-400/40 bg-purple-500/15 text-purple-300"
                : "border-white/15 text-gray-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtres
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 bg-purple-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Quick status pills */}
          {(() => {
            const outCount = products.filter((p) => p.stock <= 0).length;
            const lowCount = products.filter((p) => p.stock > 0 && p.stock <= p.minStock).length;
            const featCount = products.filter((p) => p.isFeatured).length;
            const hasQuick = outCount > 0 || lowCount > 0 || featCount > 0;
            if (!hasQuick) return null;
            return (
              <div className="flex items-center gap-1.5 border-l border-white/10 pl-3 ml-1">
                <span className="text-xs text-gray-500 mr-1">Rapide:</span>
                {outCount > 0 && (
                  <button
                    onClick={() => setStockFilter(stockFilter === "out" ? "" : "out")}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      stockFilter === "out" ? "bg-red-500/15 text-red-300 ring-1 ring-red-400/40" : "text-red-300 bg-red-500/10 hover:bg-red-500/20"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    Rupture <span className="opacity-60">{outCount}</span>
                  </button>
                )}
                {lowCount > 0 && (
                  <button
                    onClick={() => setStockFilter(stockFilter === "low" ? "" : "low")}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      stockFilter === "low" ? "bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/40" : "text-amber-300 bg-amber-500/10 hover:bg-amber-500/20"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    Stock bas <span className="opacity-60">{lowCount}</span>
                  </button>
                )}
                {featCount > 0 && (
                  <button
                    onClick={() => setStatusFilter(statusFilter === "featured" ? "" : "featured")}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      statusFilter === "featured" ? "bg-purple-500/15 text-purple-300 ring-1 ring-purple-400/40" : "text-purple-300 bg-purple-500/10 hover:bg-purple-500/20"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    Vedettes <span className="opacity-60">{featCount}</span>
                  </button>
                )}
              </div>
            );
          })()}
        </div>

        {/* Expanded filters panel */}
        {filtersOpen && (
          <div className="admin-card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Filtres avancés</p>
              {activeFilterCount > 0 && (
                <button onClick={clearAllFilters} className="text-xs text-purple-300 hover:text-purple-200 font-medium flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  Tout effacer
                </button>
              )}
            </div>
            <div className="grid grid-cols-5 gap-3">
              {/* Category */}
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Catégorie</label>
                <select
                  value={catFilter}
                  onChange={(e) => { setCatFilter(e.target.value); setFamFilter(""); setSfFilter(""); }}
                  className="admin-input px-3 py-2"
                >
                  <option value="">Toutes</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.nameFr}</option>)}
                </select>
              </div>

              {/* Family */}
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Famille</label>
                <select
                  value={famFilter}
                  onChange={(e) => { setFamFilter(e.target.value); setSfFilter(""); }}
                  disabled={!catFilter || filterFamilies.length === 0}
                  className="admin-input px-3 py-2 disabled:opacity-50"
                >
                  <option value="">{filterFamilies.length === 0 ? (catFilter ? "Aucune" : "—") : "Toutes"}</option>
                  {filterFamilies.map((f) => <option key={f.id} value={f.id}>{f.nameFr}</option>)}
                </select>
              </div>

              {/* Subfamily */}
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Sous-famille</label>
                <select
                  value={sfFilter}
                  onChange={(e) => setSfFilter(e.target.value)}
                  disabled={!famFilter || filterSubfamilies.length === 0}
                  className="admin-input px-3 py-2 disabled:opacity-50"
                >
                  <option value="">{filterSubfamilies.length === 0 ? (famFilter ? "Aucune" : "—") : "Toutes"}</option>
                  {filterSubfamilies.map((sf) => <option key={sf.id} value={sf.id}>{sf.nameFr}</option>)}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Statut</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                  className="admin-input px-3 py-2"
                >
                  <option value="">Tous</option>
                  <option value="active">Actifs</option>
                  <option value="inactive">Inactifs</option>
                  <option value="featured">En vedette</option>
                </select>
              </div>

              {/* Stock */}
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Stock</label>
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value as typeof stockFilter)}
                  className="admin-input px-3 py-2"
                >
                  <option value="">Tous</option>
                  <option value="ok">En stock</option>
                  <option value="low">Stock bas</option>
                  <option value="out">Rupture</option>
                </select>
              </div>
            </div>

            {/* Active filter tags */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/10">
                {catFilter && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-500/15 text-purple-300 text-xs font-medium rounded-full">
                    {categories.find((c) => c.id === catFilter)?.nameFr}
                    <button onClick={() => { setCatFilter(""); setFamFilter(""); setSfFilter(""); }} className="hover:text-purple-100">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                )}
                {famFilter && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-500/15 text-blue-300 text-xs font-medium rounded-full">
                    {filterFamilies.find((f) => f.id === famFilter)?.nameFr}
                    <button onClick={() => { setFamFilter(""); setSfFilter(""); }} className="hover:text-blue-100">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                )}
                {sfFilter && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/15 text-emerald-300 text-xs font-medium rounded-full">
                    {filterSubfamilies.find((sf) => sf.id === sfFilter)?.nameFr}
                    <button onClick={() => setSfFilter("")} className="hover:text-emerald-100">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                )}
                {statusFilter && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-500/15 text-gray-300 text-xs font-medium rounded-full">
                    {statusFilter === "active" ? "Actifs" : statusFilter === "inactive" ? "Inactifs" : "En vedette"}
                    <button onClick={() => setStatusFilter("")} className="hover:text-white">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                )}
                {stockFilter && (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${
                    stockFilter === "out" ? "bg-red-500/15 text-red-300" : stockFilter === "low" ? "bg-amber-500/15 text-amber-300" : "bg-emerald-500/15 text-emerald-300"
                  }`}>
                    {stockFilter === "out" ? "Rupture" : stockFilter === "low" ? "Stock bas" : "En stock"}
                    <button onClick={() => setStockFilter("")} className="hover:opacity-70">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Results count */}
        {(activeFilterCount > 0 || searchDebounced) && (
          <p className="text-xs text-gray-400">
            {filteredProducts.length} résultat{filteredProducts.length !== 1 ? "s" : ""}
            {filteredProducts.length !== products.length && ` sur ${products.length} produit${products.length !== 1 ? "s" : ""}`}
          </p>
        )}
      </div>

      {success && <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 px-4 py-3 rounded-xl text-sm mb-6">{success}</div>}

      {/* Products table */}
      <div className="admin-card overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/[0.03] border-b border-white/10">
            <tr>
              <th className="admin-th">Produit</th>
              <th className="admin-th">Référence</th>
              <th className="admin-th">Classification</th>
              <th className="admin-th">Prix HT</th>
              <th className="admin-th">Prix TTC</th>
              <th className="admin-th">Stock</th>
              <th className="admin-th">Statut</th>
              <th className="admin-th">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredProducts.length === 0 ? (
              <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-400">{products.length === 0 ? "Aucun produit." : "Aucun produit ne correspond aux filtres."}</td></tr>
            ) : (
              filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {p.thumbnail ? (
                        <img src={p.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover bg-white" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-gray-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-white">{p.nameFr}</p>
                        {p.isFeatured && <span className="text-[10px] text-purple-300 font-medium">En vedette</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400 font-mono">{p.reference || "\u2014"}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <span className="font-medium">{p.category.nameFr}</span>
                      {p.family && (
                        <>
                          <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                          <span>{p.family.nameFr}</span>
                        </>
                      )}
                      {p.subfamily && (
                        <>
                          <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                          <span>{p.subfamily.nameFr}</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-white font-medium tabular-nums">{p.priceHT.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-white font-medium tabular-nums">{p.priceTTC.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${p.stock <= 0 ? "text-red-300" : p.stock <= p.minStock ? "text-amber-300" : "text-emerald-300"}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${p.isActive ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"}`}>
                      {p.isActive ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(p)} title="Modifier" className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-purple-300 hover:bg-purple-500/10 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => handleDelete(p.id)} title="Supprimer" className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-300 hover:bg-red-500/10 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ========== PRODUCT DIALOG ========== */}
      <dialog ref={dialogRef} onClose={() => setDialogOpen(false)} className="fixed inset-0 m-auto w-full max-w-3xl h-fit max-h-[92vh] rounded-2xl border border-white/10 bg-gray-900 text-gray-200 p-0 shadow-2xl shadow-black/50 backdrop:bg-black/60 backdrop:backdrop-blur-sm">
        <div className="flex flex-col max-h-[92vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">{editingId ? "Modifier le produit" : "Nouveau produit"}</h2>
                <p className="text-xs text-gray-400">Remplissez les informations du produit</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer mr-2">
                <div className={`relative w-8 h-[18px] rounded-full transition-colors ${formData.isActive ? "bg-emerald-500" : "bg-white/20"}`}>
                  <input type="checkbox" checked={formData.isActive as boolean} onChange={(e) => set("isActive", e.target.checked)} className="sr-only" />
                  <div className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white shadow transition-transform ${formData.isActive ? "left-[17px]" : "left-[2px]"}`} />
                </div>
                <span className="text-xs font-medium text-gray-300">Actif</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer mr-3" title="Chaque unité de ce produit possède un numéro de série (désactivez pour les accessoires)">
                <div className={`relative w-8 h-[18px] rounded-full transition-colors ${formData.trackSerial ? "bg-blue-500" : "bg-white/20"}`}>
                  <input type="checkbox" checked={formData.trackSerial as boolean} onChange={(e) => set("trackSerial", e.target.checked)} className="sr-only" />
                  <div className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white shadow transition-transform ${formData.trackSerial ? "left-[17px]" : "left-[2px]"}`} />
                </div>
                <span className="text-xs font-medium text-gray-300">N° de série</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer mr-3">
                <div className={`relative w-8 h-[18px] rounded-full transition-colors ${formData.isFeatured ? "bg-purple-500" : "bg-white/20"}`}>
                  <input type="checkbox" checked={formData.isFeatured as boolean} onChange={(e) => set("isFeatured", e.target.checked)} className="sr-only" />
                  <div className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white shadow transition-transform ${formData.isFeatured ? "left-[17px]" : "left-[2px]"}`} />
                </div>
                <span className="text-xs font-medium text-gray-300">Vedette</span>
              </label>
              <button onClick={() => setDialogOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>

          {error && <div className="mx-6 mt-4 bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-2.5 rounded-xl text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-5">

              {/* Names */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Nom du produit</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-500 uppercase pointer-events-none">FR</span>
                    <input type="text" required value={formData.nameFr} onChange={(e) => set("nameFr", e.target.value)} placeholder="Nom en français" className="admin-input pl-9" />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-500 uppercase pointer-events-none">EN</span>
                    <input type="text" required value={formData.nameEn} onChange={(e) => set("nameEn", e.target.value)} placeholder="Name in english" className="admin-input pl-9" />
                  </div>
                </div>
              </div>

              {/* Classification: Category → Family → Subfamily */}
              <div className="bg-blue-500/[0.06] rounded-xl p-4 border border-blue-400/20">
                <label className="block text-xs font-semibold text-blue-300 uppercase tracking-wide mb-3">Classification</label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Catégorie *</label>
                    <select required value={formData.categoryId} onChange={(e) => set("categoryId", e.target.value)} className="admin-input">
                      <option value="">Choisir...</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.nameFr}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Famille</label>
                    <select value={formData.familyId} onChange={(e) => set("familyId", e.target.value)} disabled={!formData.categoryId || formFamilies.length === 0} className="admin-input disabled:opacity-50">
                      <option value="">{formFamilies.length === 0 ? (formData.categoryId ? "Aucune famille" : "—") : "Choisir..."}</option>
                      {formFamilies.map((f) => <option key={f.id} value={f.id}>{f.nameFr}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Sous-famille</label>
                    <select value={formData.subfamilyId} onChange={(e) => set("subfamilyId", e.target.value)} disabled={!formData.familyId || formSubfamilies.length === 0} className="admin-input disabled:opacity-50">
                      <option value="">{formSubfamilies.length === 0 ? (formData.familyId ? "Aucune sous-famille" : "—") : "Choisir..."}</option>
                      {formSubfamilies.map((sf) => <option key={sf.id} value={sf.id}>{sf.nameFr}</option>)}
                    </select>
                  </div>
                </div>
                {formData.categoryId && (
                  <p className="text-[11px] text-blue-300 mt-2 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {[
                      categories.find((c) => c.id === formData.categoryId)?.nameFr,
                      formFamilies.find((f) => f.id === formData.familyId)?.nameFr,
                      formSubfamilies.find((sf) => sf.id === formData.subfamilyId)?.nameFr,
                    ].filter(Boolean).join(" > ")}
                  </p>
                )}
              </div>

              {/* Reference */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">Référence</label>
                  <div className="flex bg-white/10 rounded-md p-0.5">
                    <button type="button" onClick={() => setRefMode("auto")} className={`px-2 py-0.5 text-[10px] font-semibold rounded transition-colors ${refMode === "auto" ? "bg-purple-600 text-white shadow-sm" : "text-gray-400 hover:text-white"}`}>Auto</button>
                    <button type="button" onClick={() => { setRefMode("manual"); if (!formData.reference) set("reference", autoRef); }} className={`px-2 py-0.5 text-[10px] font-semibold rounded transition-colors ${refMode === "manual" ? "bg-purple-600 text-white shadow-sm" : "text-gray-400 hover:text-white"}`}>Manuel</button>
                  </div>
                </div>
                {refMode === "auto" ? (
                  <div className="w-full px-3 py-2.5 border border-white/10 rounded-xl text-sm font-mono bg-white/5 text-gray-300 flex items-center justify-between">
                    <span>{autoRef || "PRD-XXX-001"}</span>
                    <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                ) : (
                  <input type="text" value={formData.reference} onChange={(e) => set("reference", e.target.value.toUpperCase())} placeholder="REF-001" className="admin-input font-mono" />
                )}
              </div>

              {/* Descriptions */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Description</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-[10px] font-bold text-gray-500 uppercase pointer-events-none">FR</span>
                    <textarea rows={2} value={formData.descriptionFr} onChange={(e) => set("descriptionFr", e.target.value)} placeholder="Description en français..." className="admin-input pl-9 resize-none" />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-[10px] font-bold text-gray-500 uppercase pointer-events-none">EN</span>
                    <textarea rows={2} value={formData.descriptionEn} onChange={(e) => set("descriptionEn", e.target.value)} placeholder="Description in english..." className="admin-input pl-9 resize-none" />
                  </div>
                </div>
              </div>

              {/* Pricing + Stock */}
              <div className="bg-white/[0.03] rounded-xl p-4 border border-white/10">
                <div className="grid grid-cols-5 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Prix HT *</label>
                    <input type="number" step="0.01" required value={formData.priceHT} onChange={(e) => set("priceHT", e.target.value)} className="admin-input px-3 py-2 font-medium" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">TVA %</label>
                    <input type="number" step="0.1" value={formData.taxRate} onChange={(e) => set("taxRate", e.target.value)} className="admin-input px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Prix TTC</label>
                    <div className="w-full px-3 py-2 border border-white/10 rounded-xl text-sm font-semibold bg-white/5 text-purple-300 tabular-nums">
                      {priceTTC} <span className="text-[10px] font-normal text-gray-500">TND</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Stock</label>
                    <input type="number" value={formData.stock} onChange={(e) => set("stock", e.target.value)} className="admin-input px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Seuil alerte</label>
                    <input type="number" value={formData.minStock} onChange={(e) => set("minStock", e.target.value)} className="admin-input px-3 py-2" />
                  </div>
                </div>
                {parseInt(formData.stock) > 0 && parseInt(formData.stock) <= parseInt(formData.minStock) && (
                  <p className="text-xs text-amber-300 mt-2 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                    Stock en-dessous du seuil d&apos;alerte
                  </p>
                )}
              </div>

              {/* Images */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">Images</label>
                  <button type="button" onClick={addImageUrl} className="text-xs text-purple-300 hover:text-purple-200 font-medium flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    Ajouter par URL
                  </button>
                </div>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${dragOver ? "border-purple-400 bg-purple-500/10" : "border-white/15 hover:border-purple-400/50 hover:bg-white/[0.03]"}`}
                >
                  <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={(e) => handleFiles(e.target.files)} className="sr-only" />
                  <div className="flex items-center justify-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${dragOver ? "bg-purple-500/15" : "bg-white/10"}`}>
                      <svg className={`w-5 h-5 ${dragOver ? "text-purple-300" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-300">Glissez vos images ici</p>
                      <p className="text-xs text-gray-500">ou cliquez pour parcourir</p>
                    </div>
                  </div>
                </div>
                {imageList.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[11px] text-gray-500 mb-2">Glissez pour réorganiser — la 1ère = couverture</p>
                    <div className="grid grid-cols-5 gap-2">
                      {imageList.map((img, idx) => (
                        <div key={`${idx}-${img.slice(0, 20)}`} draggable onDragStart={() => handleImageDragStart(idx)} onDragOver={(e) => handleImageDragOver(e, idx)} onDragEnd={handleImageDragEnd} className={`group relative aspect-square rounded-lg border-2 bg-white overflow-hidden cursor-grab active:cursor-grabbing transition-all ${dragImageIdx === idx ? "border-purple-500 opacity-50 scale-95" : idx === 0 ? "border-purple-400 ring-2 ring-purple-500/20" : "border-white/10"}`}>
                          <img src={img} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          {idx === 0 && <div className="absolute top-1 left-1 bg-purple-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase leading-none">Cover</div>}
                          <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(idx); }} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sticky footer */}
            <div className="sticky bottom-0 bg-gray-900 border-t border-white/10 px-6 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {imageList.length > 0 && <span className="inline-flex items-center gap-1 bg-purple-500/15 text-purple-300 px-2 py-1 rounded-md font-medium">{imageList.length} image(s)</span>}
                {formData.priceHT && <span className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-300 px-2 py-1 rounded-md font-medium">{priceTTC} TND</span>}
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setDialogOpen(false)} className="px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white rounded-xl transition-colors">Annuler</button>
                <button type="submit" disabled={submitting} className="btn-primary px-6 py-2.5 text-sm">
                  {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {editingId ? "Enregistrer" : "Créer le produit"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </dialog>

      {/* ========== TREE MANAGER DIALOG ========== */}
      <dialog ref={treeMgrRef} onClose={() => { setTreeMgrOpen(false); setAddingTo(null); setEditingNode(null); }} className="fixed inset-0 m-auto w-full max-w-2xl h-fit max-h-[85vh] rounded-2xl border border-white/10 bg-gray-900 text-gray-200 p-0 shadow-2xl shadow-black/50 backdrop:bg-black/60 backdrop:backdrop-blur-sm">
        <div className="flex flex-col max-h-[85vh]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
            <div>
              <h2 className="text-base font-semibold text-white">Arborescence produits</h2>
              <p className="text-xs text-gray-400">Catégories, familles et sous-familles</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => { setAddingTo({ type: "category" }); setAddForm({ nameFr: "", nameEn: "" }); }} className="btn-primary px-3 py-1.5 text-xs">
                + Catégorie
              </button>
              <button onClick={() => { setTreeMgrOpen(false); setAddingTo(null); setEditingNode(null); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {/* Add category form */}
            {addingTo?.type === "category" && !addingTo.parentId && (
              <form onSubmit={handleAddNode} className="mb-4 p-3 bg-purple-500/10 rounded-xl border border-purple-400/25">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input type="text" required value={addForm.nameFr} onChange={(e) => setAddForm({ ...addForm, nameFr: e.target.value })} placeholder="Nom FR" className="admin-input px-3 py-2" autoFocus />
                  <input type="text" required value={addForm.nameEn} onChange={(e) => setAddForm({ ...addForm, nameEn: e.target.value })} placeholder="Name EN" className="admin-input px-3 py-2" />
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setAddingTo(null)} className="px-3 py-1.5 text-xs text-gray-400 hover:bg-white/5 hover:text-white rounded-md transition-colors">Annuler</button>
                  <button type="submit" className="px-3 py-1.5 text-xs bg-purple-600 text-white rounded-md hover:bg-purple-500 transition-colors">Créer</button>
                </div>
              </form>
            )}

            {categories.length === 0 && !addingTo ? (
              <p className="text-sm text-gray-400 text-center py-8">Aucune catégorie. Commencez par en créer une.</p>
            ) : (
              <div className="space-y-1">
                {categories.map((cat) => {
                  const isExpanded = expandedCats.has(cat.id);
                  const isEditingCat = editingNode?.type === "category" && editingNode.id === cat.id;
                  const totalProducts = (cat._count?.products ?? 0);

                  return (
                    <div key={cat.id} className="rounded-xl border border-white/10 overflow-hidden">
                      {/* Category row */}
                      {isEditingCat ? (
                        <form onSubmit={handleEditNode} className="p-3 bg-purple-500/10">
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <input type="text" value={editNodeForm.nameFr} onChange={(e) => setEditNodeForm({ ...editNodeForm, nameFr: e.target.value })} className="admin-input px-3 py-2" autoFocus />
                            <input type="text" value={editNodeForm.nameEn} onChange={(e) => setEditNodeForm({ ...editNodeForm, nameEn: e.target.value })} className="admin-input px-3 py-2" />
                          </div>
                          <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setEditingNode(null)} className="px-3 py-1.5 text-xs text-gray-400 hover:bg-white/5 hover:text-white rounded-md transition-colors">Annuler</button>
                            <button type="submit" className="px-3 py-1.5 text-xs bg-purple-600 text-white rounded-md hover:bg-purple-500 transition-colors">Enregistrer</button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] cursor-pointer transition-colors" onClick={() => toggleCatExpanded(cat.id)}>
                          <div className="flex items-center gap-3">
                            <svg className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center text-xs font-bold text-purple-300">
                              {cat.nameFr.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-white">{cat.nameFr}</p>
                              <p className="text-[11px] text-gray-500">{cat.nameEn} &middot; {totalProducts} produit{totalProducts !== 1 ? "s" : ""} &middot; {cat.families.length} famille{cat.families.length !== 1 ? "s" : ""}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => { setAddingTo({ type: "family", parentId: cat.id }); setAddForm({ nameFr: "", nameEn: "" }); setExpandedCats((prev) => new Set(prev).add(cat.id)); }} className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors" title="Ajouter une famille">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            </button>
                            <button onClick={() => { setEditingNode({ type: "category", id: cat.id }); setEditNodeForm({ nameFr: cat.nameFr, nameEn: cat.nameEn }); }} className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:text-purple-300 hover:bg-purple-500/10 transition-colors" title="Modifier">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            {totalProducts === 0 && cat.families.length === 0 && (
                              <button onClick={() => handleDeleteNode("category", cat.id)} className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:text-red-300 hover:bg-red-500/10 transition-colors" title="Supprimer">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Families */}
                      {isExpanded && (
                        <div className="border-t border-white/10 bg-white/[0.02]">
                          {/* Add family form */}
                          {addingTo?.type === "family" && addingTo.parentId === cat.id && (
                            <form onSubmit={handleAddNode} className="mx-4 my-2 p-3 bg-blue-500/10 rounded-lg border border-blue-400/25">
                              <p className="text-[11px] font-semibold text-blue-300 mb-2">Nouvelle famille dans {cat.nameFr}</p>
                              <div className="grid grid-cols-2 gap-2 mb-2">
                                <input type="text" required value={addForm.nameFr} onChange={(e) => setAddForm({ ...addForm, nameFr: e.target.value })} placeholder="Nom FR" className="admin-input px-3 py-1.5" autoFocus />
                                <input type="text" required value={addForm.nameEn} onChange={(e) => setAddForm({ ...addForm, nameEn: e.target.value })} placeholder="Name EN" className="admin-input px-3 py-1.5" />
                              </div>
                              <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setAddingTo(null)} className="px-3 py-1 text-xs text-gray-400 hover:bg-white/5 hover:text-white rounded-md transition-colors">Annuler</button>
                                <button type="submit" className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors">Créer</button>
                              </div>
                            </form>
                          )}

                          {cat.families.length === 0 && !(addingTo?.type === "family" && addingTo.parentId === cat.id) && (
                            <p className="text-xs text-gray-500 py-3 px-8">Aucune famille</p>
                          )}

                          {cat.families.map((fam) => {
                            const isFamExpanded = expandedFams.has(fam.id);
                            const isEditingFam = editingNode?.type === "family" && editingNode.id === fam.id;
                            const famProducts = fam._count?.products ?? 0;

                            return (
                              <div key={fam.id}>
                                {isEditingFam ? (
                                  <form onSubmit={handleEditNode} className="mx-4 my-1 p-3 bg-blue-500/10 rounded-lg">
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                      <input type="text" value={editNodeForm.nameFr} onChange={(e) => setEditNodeForm({ ...editNodeForm, nameFr: e.target.value })} className="admin-input px-3 py-1.5" autoFocus />
                                      <input type="text" value={editNodeForm.nameEn} onChange={(e) => setEditNodeForm({ ...editNodeForm, nameEn: e.target.value })} className="admin-input px-3 py-1.5" />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                      <button type="button" onClick={() => setEditingNode(null)} className="px-3 py-1 text-xs text-gray-400 hover:bg-white/5 hover:text-white rounded-md transition-colors">Annuler</button>
                                      <button type="submit" className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors">Enregistrer</button>
                                    </div>
                                  </form>
                                ) : (
                                  <div className="flex items-center justify-between px-4 py-2.5 pl-10 hover:bg-white/[0.03] cursor-pointer transition-colors" onClick={() => toggleFamExpanded(fam.id)}>
                                    <div className="flex items-center gap-2.5">
                                      <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isFamExpanded ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                      <div className="w-6 h-6 rounded-md bg-blue-500/15 flex items-center justify-center text-[10px] font-bold text-blue-300">
                                        {fam.nameFr.charAt(0).toUpperCase()}
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-200">{fam.nameFr}</p>
                                        <p className="text-[10px] text-gray-500">{fam.nameEn} &middot; {famProducts} prod. &middot; {fam.subfamilies.length} s-fam.</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                      <button onClick={() => { setAddingTo({ type: "subfamily", parentId: fam.id }); setAddForm({ nameFr: "", nameEn: "" }); setExpandedFams((prev) => new Set(prev).add(fam.id)); }} className="w-6 h-6 rounded flex items-center justify-center text-gray-500 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors" title="Ajouter sous-famille">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                      </button>
                                      <button onClick={() => { setEditingNode({ type: "family", id: fam.id }); setEditNodeForm({ nameFr: fam.nameFr, nameEn: fam.nameEn }); }} className="w-6 h-6 rounded flex items-center justify-center text-gray-500 hover:text-purple-300 hover:bg-purple-500/10 transition-colors" title="Modifier">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                      </button>
                                      {famProducts === 0 && fam.subfamilies.length === 0 && (
                                        <button onClick={() => handleDeleteNode("family", fam.id)} className="w-6 h-6 rounded flex items-center justify-center text-gray-500 hover:text-red-300 hover:bg-red-500/10 transition-colors" title="Supprimer">
                                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Subfamilies */}
                                {isFamExpanded && (
                                  <div className="ml-16 border-l-2 border-white/10">
                                    {/* Add subfamily form */}
                                    {addingTo?.type === "subfamily" && addingTo.parentId === fam.id && (
                                      <form onSubmit={handleAddNode} className="mx-3 my-1.5 p-2.5 bg-emerald-500/10 rounded-lg border border-emerald-400/25">
                                        <p className="text-[10px] font-semibold text-emerald-300 mb-1.5">Nouvelle sous-famille dans {fam.nameFr}</p>
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                          <input type="text" required value={addForm.nameFr} onChange={(e) => setAddForm({ ...addForm, nameFr: e.target.value })} placeholder="Nom FR" className="admin-input px-2.5 py-1.5" autoFocus />
                                          <input type="text" required value={addForm.nameEn} onChange={(e) => setAddForm({ ...addForm, nameEn: e.target.value })} placeholder="Name EN" className="admin-input px-2.5 py-1.5" />
                                        </div>
                                        <div className="flex justify-end gap-2">
                                          <button type="button" onClick={() => setAddingTo(null)} className="px-2.5 py-1 text-xs text-gray-400 hover:bg-white/5 hover:text-white rounded-md transition-colors">Annuler</button>
                                          <button type="submit" className="px-2.5 py-1 text-xs bg-emerald-600 text-white rounded-md hover:bg-emerald-500 transition-colors">Créer</button>
                                        </div>
                                      </form>
                                    )}

                                    {fam.subfamilies.length === 0 && !(addingTo?.type === "subfamily" && addingTo.parentId === fam.id) && (
                                      <p className="text-[11px] text-gray-500 py-2 px-4">Aucune sous-famille</p>
                                    )}

                                    {fam.subfamilies.map((sf) => {
                                      const isEditingSf = editingNode?.type === "subfamily" && editingNode.id === sf.id;
                                      const sfProducts = sf._count?.products ?? 0;

                                      return isEditingSf ? (
                                        <form key={sf.id} onSubmit={handleEditNode} className="mx-3 my-1 p-2.5 bg-emerald-500/10 rounded-lg">
                                          <div className="grid grid-cols-2 gap-2 mb-2">
                                            <input type="text" value={editNodeForm.nameFr} onChange={(e) => setEditNodeForm({ ...editNodeForm, nameFr: e.target.value })} className="admin-input px-2.5 py-1.5" autoFocus />
                                            <input type="text" value={editNodeForm.nameEn} onChange={(e) => setEditNodeForm({ ...editNodeForm, nameEn: e.target.value })} className="admin-input px-2.5 py-1.5" />
                                          </div>
                                          <div className="flex justify-end gap-2">
                                            <button type="button" onClick={() => setEditingNode(null)} className="px-2.5 py-1 text-xs text-gray-400 hover:bg-white/5 hover:text-white rounded-md transition-colors">Annuler</button>
                                            <button type="submit" className="px-2.5 py-1 text-xs bg-emerald-600 text-white rounded-md hover:bg-emerald-500 transition-colors">Enregistrer</button>
                                          </div>
                                        </form>
                                      ) : (
                                        <div key={sf.id} className="flex items-center justify-between px-4 py-2 hover:bg-white/[0.03] transition-colors">
                                          <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded bg-emerald-500/15 flex items-center justify-center text-[9px] font-bold text-emerald-300">
                                              {sf.nameFr.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                              <p className="text-xs font-medium text-gray-200">{sf.nameFr}</p>
                                              <p className="text-[10px] text-gray-500">{sf.nameEn} &middot; {sfProducts} prod.</p>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <button onClick={() => { setEditingNode({ type: "subfamily", id: sf.id }); setEditNodeForm({ nameFr: sf.nameFr, nameEn: sf.nameEn }); }} className="w-5 h-5 rounded flex items-center justify-center text-gray-500 hover:text-purple-300 transition-colors" title="Modifier">
                                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </button>
                                            {sfProducts === 0 && (
                                              <button onClick={() => handleDeleteNode("subfamily", sf.id)} className="w-5 h-5 rounded flex items-center justify-center text-gray-500 hover:text-red-300 transition-colors" title="Supprimer">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="px-6 py-3 border-t border-white/10 bg-white/[0.02] shrink-0">
            <p className="text-[11px] text-gray-500 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Les éléments utilisés par des produits ne peuvent pas être supprimés
            </p>
          </div>
        </div>
      </dialog>
    </div>
  );
}
