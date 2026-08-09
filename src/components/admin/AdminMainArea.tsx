"use client";

import { useState, useEffect } from "react";
import AdminNavbar from "@/components/admin/AdminNavbar";

export default function AdminMainArea({
  userName,
  userEmail,
  children,
}: {
  userName: string;
  userEmail: string;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // Read initial state
    const saved = localStorage.getItem("admin-sidebar-collapsed");
    if (saved === "true") setCollapsed(true);

    // Listen for toggle events from sidebar
    function handleToggle(e: Event) {
      const detail = (e as CustomEvent).detail;
      setCollapsed(detail.collapsed);
    }
    window.addEventListener("sidebar-toggle", handleToggle);
    return () => window.removeEventListener("sidebar-toggle", handleToggle);
  }, []);

  return (
    <div
      className="flex-1 flex flex-col transition-all duration-200"
      style={{ marginLeft: collapsed ? 72 : 256 }}
    >
      <AdminNavbar userName={userName} userEmail={userEmail} />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
