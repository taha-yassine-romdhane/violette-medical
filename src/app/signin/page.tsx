import Image from "next/image";
import Link from "next/link";
import SignInForm from "@/components/auth/SignInForm";

export const metadata = {
  title: "Connexion | Violette Medical Distribution",
};

export default function SignInPage() {
  return (
    <div className="min-h-screen flex bg-gray-950">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 border-r border-white/10 relative overflow-hidden">
        {/* Brand glow accents */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-700/15 blur-3xl" />
          <div className="absolute bottom-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Top logo */}
          <div>
            <Image
              src="/logo.PNG"
              alt="Violette Medical Distribution"
              width={200}
              height={56}
              className="h-12 w-auto brightness-0 invert"
              priority
            />
          </div>

          {/* Center text */}
          <div className="max-w-md">
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-purple-300 bg-purple-500/10 border border-purple-400/20 rounded-full px-4 py-1.5 mb-6">
              Espace professionnel B2B
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-6 leading-tight">
              Votre partenaire en
              <span className="block text-purple-400">dispositifs médicaux</span>
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              Représentant officiel Yuwell en Tunisie. Accédez à votre espace professionnel pour gérer vos commandes et suivre vos livraisons.
            </p>

            {/* Certifications */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-10 pt-8 border-t border-white/10">
              {["CE", "FDA", "ISO 13485"].map((cert) => (
                <div key={cert} className="flex items-center gap-2 text-gray-400">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium">{cert}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom spacer */}
          <div />
        </div>
      </div>

      {/* Right panel - form */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between p-6 sm:px-12 sm:pt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-purple-300 font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour au site
          </Link>
          {/* Mobile logo */}
          <div className="lg:hidden">
            <Image
              src="/logo.PNG"
              alt="Violette Medical Distribution"
              width={140}
              height={40}
              className="h-9 w-auto brightness-0 invert"
              priority
            />
          </div>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center p-6 sm:px-12">
          <div className="w-full max-w-[420px]">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Connexion
              </h2>
              <p className="text-gray-400 mt-2 text-sm">
                Connectez-vous à votre espace professionnel B2B
              </p>
            </div>

            {/* Form card */}
            <div className="bg-white/[0.04] rounded-2xl border border-white/10 p-6 sm:p-8">
              <SignInForm />
            </div>

            {/* Help text */}
            <p className="mt-6 text-center text-xs text-gray-500">
              Pas encore de compte ? Contactez votre commercial.
            </p>
          </div>
        </div>

        {/* Bottom: Yuwell partner badge */}
        <div className="p-6 sm:px-12 sm:pb-8">
          <div className="flex items-center justify-center gap-3">
            <div className="bg-white rounded-xl p-2">
              <Image
                src="/Yuwell.webp"
                alt="Yuwell"
                width={40}
                height={40}
                className="w-9 h-9 object-contain"
              />
            </div>
            <div>
              <p className="text-gray-200 text-sm font-medium">Partenaire officiel</p>
              <p className="text-gray-500 text-xs">Yuwell Medical Technology</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
