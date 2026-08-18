"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

interface AnalyticsData {
  kpis: {
    totalRevenue: number;
    monthlyRevenue: number;
    monthlyOrders: number;
    avgOrderValue: number;
    newClients: number;
  };
  charts: {
    revenueByMonth: { month: string; revenue: number }[];
    ordersByStatus: { status: string; count: number }[];
    topProducts: { name: string; quantity: number }[];
    revenueByCommercial: { name: string; revenue: number }[];
  };
}

const statusLabels: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  PROCESSING: "En traitement",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
  RETURNED: "Retournée",
};

const COLORS = ["#111827", "#2563eb", "#059669", "#d97706", "#dc2626", "#0891b2", "#9ca3af"];

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/admin/analytics");
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading || !data) {
    return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" /></div>;
  }

  const { kpis, charts } = data;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Analytique</h1>
        <p className="text-sm text-gray-500 mt-1">Vue d'ensemble des performances</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: "CA total", value: `${kpis.totalRevenue.toFixed(2)} TND`, color: "bg-gray-900 text-white border border-gray-900" },
          { label: "CA mensuel", value: `${kpis.monthlyRevenue.toFixed(2)} TND`, color: "bg-blue-50 text-blue-700 border border-blue-200/60" },
          { label: "Commandes/mois", value: kpis.monthlyOrders, color: "bg-emerald-50 text-emerald-700 border border-emerald-200/60" },
          { label: "Panier moyen", value: `${kpis.avgOrderValue.toFixed(2)} TND`, color: "bg-amber-50 text-amber-700 border border-amber-200/60" },
          { label: "Nouveaux clients", value: kpis.newClients, color: "bg-sky-50 text-sky-700 border border-sky-200/60" },
        ].map((kpi) => (
          <div key={kpi.label} className={`rounded-xl p-4 ${kpi.color}`}>
            <p className="text-xl font-bold">{kpi.value}</p>
            <p className="text-sm mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly revenue */}
        <div className="admin-card p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Revenu mensuel</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={charts.revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(17,24,39,0.08)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6b7280" }} />
              <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
              <Tooltip formatter={(value) => [`${Number(value).toFixed(2)} TND`, "Revenu"]} contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 12, color: "#111827", boxShadow: "0 4px 12px rgba(17,24,39,0.08)" }} />
              <Bar dataKey="revenue" fill="#111827" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Orders by status */}
        <div className="admin-card p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Commandes par statut</h2>
          {charts.ordersByStatus.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-12">Pas de données.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={charts.ordersByStatus.map((s) => ({ ...s, name: statusLabels[s.status] || s.status }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="count"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {charts.ordersByStatus.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 12, color: "#111827", boxShadow: "0 4px 12px rgba(17,24,39,0.08)" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top products */}
        <div className="admin-card p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Top 5 produits</h2>
          {charts.topProducts.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-12">Pas de données.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={charts.topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(17,24,39,0.08)" />
                <XAxis type="number" tick={{ fontSize: 12, fill: "#6b7280" }} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: "#6b7280" }} />
                <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 12, color: "#111827", boxShadow: "0 4px 12px rgba(17,24,39,0.08)" }} />
                <Bar dataKey="quantity" fill="#4b5563" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Revenue by commercial */}
        <div className="admin-card p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">CA par commercial</h2>
          {charts.revenueByCommercial.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-12">Pas de données.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={charts.revenueByCommercial}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(17,24,39,0.08)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6b7280" }} />
                <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                <Tooltip formatter={(value) => [`${Number(value).toFixed(2)} TND`, "CA"]} contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 12, color: "#111827", boxShadow: "0 4px 12px rgba(17,24,39,0.08)" }} />
                <Bar dataKey="revenue" fill="#6b7280" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
