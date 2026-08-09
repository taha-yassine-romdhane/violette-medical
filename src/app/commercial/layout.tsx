import Link from "next/link";
import SignOutButton from "@/components/auth/SignOutButton";

export default function CommercialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 z-40">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-purple-700">Commercial</h2>
          <p className="text-xs text-gray-500">Violette Medical</p>
        </div>
        <nav className="p-4 space-y-1">
          <Link
            href="/commercial"
            className="block px-4 py-2.5 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-700 font-medium transition-colors"
          >
            Tableau de bord
          </Link>
          <Link
            href="/commercial/clients"
            className="block px-4 py-2.5 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-700 font-medium transition-colors"
          >
            Clients
          </Link>
          <Link
            href="/commercial/orders"
            className="block px-4 py-2.5 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-700 font-medium transition-colors"
          >
            Commandes
          </Link>
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <Link
            href="/"
            className="block px-4 py-2 text-sm text-gray-500 hover:text-purple-700 transition-colors mb-2"
          >
            Retour au site
          </Link>
          <SignOutButton className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:text-red-800 transition-colors" />
        </div>
      </aside>

      <main className="ml-64 p-8">{children}</main>
    </div>
  );
}
