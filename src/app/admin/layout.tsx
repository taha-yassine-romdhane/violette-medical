import { auth } from "@/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <AdminSidebar />
      <AdminMainArea
        userName={session?.user?.name || "Admin"}
        userEmail={session?.user?.email || ""}
      >
        {children}
      </AdminMainArea>
    </div>
  );
}

// Client wrapper that listens to sidebar toggle
import AdminMainAreaClient from "@/components/admin/AdminMainArea";
function AdminMainArea({
  userName,
  userEmail,
  children,
}: {
  userName: string;
  userEmail: string;
  children: React.ReactNode;
}) {
  return (
    <AdminMainAreaClient userName={userName} userEmail={userEmail}>
      {children}
    </AdminMainAreaClient>
  );
}
