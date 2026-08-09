import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-purple-700 mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Accès refusé
        </h2>
        <p className="text-gray-600 mb-8">
          Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        <Link
          href="/"
          className="inline-block bg-purple-700 text-white px-6 py-3 rounded-lg hover:bg-purple-800 transition-colors"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
