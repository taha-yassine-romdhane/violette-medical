import Image from "next/image";
import Link from "next/link";
import SignInForm from "@/components/auth/SignInForm";
import Reveal from "@/components/motion/Reveal";

export const metadata = {
  title: "Connexion | Violette Medical Distribution",
};

export default function SignInPage() {
  return (
    <div className="min-h-screen flex bg-white">
      {/* ------------------------------------------------ Left: sign-in form (light) */}
      <div className="w-full lg:w-1/2 flex flex-col relative overflow-hidden">
        {/* Soft light backdrop */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-grid-light opacity-50" />
          <div className="absolute -top-32 -left-32 w-[420px] h-[420px] bg-purple-200/40 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -right-32 w-[420px] h-[420px] bg-violet-200/30 rounded-full blur-3xl" />
        </div>

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between p-6 sm:px-12 sm:pt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-purple-700 font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour au site
          </Link>
          {/* Logo — mobile/tablet only; on desktop the brand panel carries the logo */}
          <Link href="/" className="lg:hidden">
            <Image
              src="/logo.PNG"
              alt="Violette Medical Distribution"
              width={140}
              height={40}
              className="h-9 w-auto"
              priority
            />
          </Link>
        </div>

        {/* Form area */}
        <div className="relative z-10 flex-1 flex items-center justify-center p-6 sm:px-12">
          <Reveal variant="scale" className="w-full max-w-[440px]">
            <div className="relative">
              {/* Accent shapes behind the card, like the hero visual */}
              <div className="hidden sm:block absolute -z-10 -top-6 -left-6 w-36 h-36 rounded-[2rem] border-2 border-purple-200/70" />
              <div className="hidden sm:block absolute -z-10 -bottom-6 -right-6 w-36 h-36 rounded-[2rem] bg-purple-100/50" />

              {/* Form card — hero-card treatment */}
              <div className="bg-white/95 backdrop-blur-md rounded-[2rem] shadow-2xl shadow-purple-900/15 border border-white ring-1 ring-gray-900/5 p-7 sm:p-9">
                {/* Card header */}
                <div className="mb-7">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center mb-5">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-1.5">
                    Connexion
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Connectez-vous à votre espace professionnel B2B
                  </p>
                </div>

                <SignInForm />

                {/* Help text */}
                <p className="mt-7 pt-5 border-t border-gray-100 text-center text-xs text-gray-400">
                  Pas encore de compte ?{" "}
                  <Link href="/contact" className="font-semibold text-purple-700 hover:text-purple-800 transition-colors">
                    Contactez votre commercial
                  </Link>
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Bottom: Yuwell partner pill */}
        <div className="relative z-10 p-6 sm:px-12 sm:pb-8 flex justify-center">
          <div className="inline-flex items-center gap-2.5 bg-white border border-purple-100 shadow-sm shadow-purple-900/5 rounded-full pl-2 pr-4 py-1.5">
            <span className="bg-purple-50 rounded-full px-2 py-0.5">
              <Image src="/Yuwell.webp" alt="Yuwell" width={64} height={22} className="h-4 w-auto object-contain" />
            </span>
            <span className="text-xs font-semibold text-purple-800 tracking-wide">
              Partenaire officiel Yuwell
            </span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------ Right: brand statement (dark, landing style) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-950">
        {/* Same backdrop recipe as the site's dark partnership band */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 right-1/3 w-96 h-96 bg-purple-600/25 rounded-full blur-3xl animate-float-slower" />
          <div className="absolute -bottom-32 -left-16 w-80 h-80 bg-violet-500/15 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute inset-0 bg-grid-light opacity-[0.06]" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Top logo — white on violet */}
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

          {/* Center statement */}
          <div className="max-w-md">
            <Reveal>
              <span className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-purple-300 mb-5">
                <span className="w-8 h-px bg-purple-400/60" />
                Espace Professionnel B2B
              </span>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="text-4xl xl:text-5xl font-bold tracking-tight text-white leading-[1.08] mb-6">
                Votre partenaire en
                <br />
                <span className="text-purple-300">dispositifs médicaux</span>
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                Représentant officiel Yuwell en Tunisie. Accédez à votre espace
                professionnel pour gérer vos commandes et suivre vos livraisons.
              </p>
            </Reveal>

            {/* Yuwell logo on a white card — as on the partnership band */}
            <Reveal delay={220}>
              <div className="inline-flex items-center gap-4 bg-white rounded-2xl px-6 py-4 mb-8">
                <Image src="/Yuwell.webp" alt="Yuwell" width={120} height={40} className="h-9 w-auto object-contain" />
                <div className="w-px h-8 bg-gray-200" />
                <p className="text-xs text-gray-500 leading-snug max-w-[160px]">Yuwell Medical Technology</p>
              </div>
            </Reveal>

            {/* Certification pills */}
            <Reveal delay={280}>
              <div className="flex flex-wrap gap-2.5 mb-9">
                {["CE", "FDA", "ISO 13485"].map((cert) => (
                  <span key={cert} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/5 border border-white/15 rounded-full text-gray-200 text-sm font-medium">
                    <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {cert}
                  </span>
                ))}
              </div>
            </Reveal>

            {/* Trust metrics */}
            <Reveal delay={340}>
              <div className="grid grid-cols-3 max-w-md divide-x divide-white/10 border-t border-white/10 pt-7">
                {[
                  { value: "110+", label: "Pays Yuwell" },
                  { value: "30+", label: "Ans d'innovation" },
                  { value: "500+", label: "Clients pros" },
                ].map((stat) => (
                  <div key={stat.label} className="px-4 first:pl-0">
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-gray-400 mt-1 leading-tight">{stat.label}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Bottom spacer */}
          <div />
        </div>
      </div>
    </div>
  );
}
