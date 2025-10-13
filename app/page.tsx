// app/page.tsx
"use client";

import Image from "next/image";
import { useState } from "react";

const TESTIMONIALS = [
  {
    name: "Sandrine, boulangère — Normandie",
    text:
      "Depuis que j'ai mis en place le QR Fidelizen dans ma boulangerie, le nombre de clients réguliers a considérablement augmenté et le panier moyen a grimpé de 20 %. Simple et efficace.",
    place: "Bayeux",
  },
  {
    name: "Marc, maraîcher — Bordeaux",
    text:
      "Avant, pendant les moments de rush au marché, je n’avais pas le temps de retrouver les comptes clients dans mes fichiers. Avec Fidelizen, un simple scan et c’est réglé. C’est un gain de temps considérable et mes clients adorent la simplicité.",
    place: "Bordeaux",
  },
  {
    name: "Mohamed, coiffeur — Lyon",
    text:
      "Dans la coiffure, c’est très compliqué de se démarquer. Depuis que j’utilise Fidelizen, j’ai réussi à créer une clientèle fidèle en quelques semaines. Les gens reviennent, et ils en parlent autour d’eux. C’est devenu un vrai atout face à la concurrence.",
    place: "Lyon",
  },
  {
    name: "Ahmed, épicier — Marseille",
    text:
      "Installation ultra-rapide et support sympa. À 14.99€/mois, c'est vraiment accessible pour les petits commerces.",
    place: "Marseille",
  },

];

export default function Home() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Top bar slim (proportions similaires à Notion) */}
      <header className="w-full border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo-fidelizen.svg" alt="Fidelizen" width={120} height={34} />
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a className="hover:underline" href="#features">Fonctionnalités</a>
            <a className="hover:underline" href="#pricing">Tarifs</a>
            <a className="hover:underline" href="#testimonials">Retours clients</a>
            <a className="hover:underline" href="/register">S'inscrire</a>
            <a
              href="/login"
              className="ml-4 px-4 py-2 rounded-md border border-emerald-600 text-emerald-600 hover:bg-emerald-50"
            >
              Se connecter
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-gray-900">
              La fidélité client, <span className="text-emerald-600">simple comme un scan</span>
            </h1>
            <p className="mt-4 text-gray-600 text-base sm:text-lg max-w-xl">
              Fidelizen permet aux petits commerces d’offrir une carte de fidélité 100 % digitale : sans application, sans compte client. Un QR, un scan, et le tour est joué : accessible à tous, y compris aux personnes âgées.
            </p>

            {/* Key highlights */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center">
              <a
                href="/register"
                className="inline-flex items-center justify-center bg-emerald-600 text-white px-5 py-3 rounded-lg shadow hover:bg-emerald-700 transition font-medium"
              >
                Commencer gratuitement
              </a>
              <a
                href="/login"
                className="inline-flex items-center justify-center border border-emerald-600 text-emerald-600 px-4 py-3 rounded-lg hover:bg-emerald-50 transition font-medium"
              >
                Déjà inscrit ?
              </a>
            </div>

            {/* Price & stats */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center shadow-sm">
                <div className="text-sm text-gray-500">Prix</div>
                <div className="mt-1 text-xl font-semibold text-emerald-700">14,99€ / mois</div>
                <div className="text-xs text-gray-400 mt-1">Sans engagement • Essai gratuit</div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-center shadow-sm">
                <div className="text-sm text-gray-500">Adoption</div>
                <div className="mt-1 text-xl font-semibold text-gray-900">0 friction</div>
                <div className="text-xs text-gray-400 mt-1">Pas d'app • Pas de compte à créer</div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-center shadow-sm">
                <div className="text-sm text-gray-500">Impact</div>
                <div className="mt-1 text-xl font-semibold text-emerald-700">+20 % panier moyen</div>
                <div className="text-xs text-gray-400 mt-1">Moyenne constatée (cas clients)</div>
              </div>
            </div>
          </div>

          {/* Illustration + short features */}
          <div className="relative">
            {/* Decorative SVG illustration (light, responsive) */}
            <div className="w-full flex justify-center">
              <IllustrationSVG />
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FeatureCard title="Sans app" desc="Vos clients n'installent rien : ils scannent et c'est réglé." />
              <FeatureCard title="Rapide" desc="Installation en 2 minutes, utilisation immédiate." />
              <FeatureCard title="Accessible" desc="Convient à tous les âges : ergonomie pensée pour tous." />
              <FeatureCard title="Local & responsable" desc="Soutenez les commerces de proximité face à la grande distribution." />
            </div>
          </div>
        </section>

        {/* Why it matters / manifesto */}
        <section id="manifesto" className="mt-16 bg-emerald-50 rounded-xl p-6 sm:p-10">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-lg font-semibold text-emerald-700">Notre conviction</h3>
            <p className="mt-3 text-gray-700">
              Nous croyons que la fidélisation peut donner un vrai coup de pouce aux commerces de proximité.
              Fidelizen veut rendre la fidélité simple, abordable et inclusive. pour que chaque boulanger,
              caviste, coiffeur ou même marchand ambulant puisse créer du lien avec ses clients et soutenir une consommation plus responsable.
            </p>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="mt-14">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-semibold text-gray-900">Ils ont testé Fidelizen</h3>
            <p className="mt-2 text-gray-600">Quelques retours illustrant l'impact réel.</p>

            <div className="mt-6">
              <div className="relative max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl shadow p-6">
                  <p className="text-gray-700 leading-relaxed">“{TESTIMONIALS[activeTestimonial].text}”</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{TESTIMONIALS[activeTestimonial].name}</div>
                      <div className="text-xs text-gray-400">{TESTIMONIALS[activeTestimonial].place}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveTestimonial((s) => (s - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
                        aria-label="Précédent"
                        className="p-2 rounded-full border hover:bg-gray-50"
                      >
                        ‹
                      </button>
                      <button
                        onClick={() => setActiveTestimonial((s) => (s + 1) % TESTIMONIALS.length)}
                        aria-label="Suivant"
                        className="p-2 rounded-full border hover:bg-gray-50"
                      >
                        ›
                      </button>
                    </div>
                  </div>
                </div>

                {/* small dots */}
                <div className="flex items-center justify-center mt-3 gap-2">
                  {TESTIMONIALS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveTestimonial(i)}
                      className={`w-2 h-2 rounded-full ${i === activeTestimonial ? "bg-emerald-600" : "bg-gray-300"}`}
                      aria-label={`Afficher témoignage ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA footer */}
        <section id="pricing" className="mt-16 text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-xl font-semibold">Prêt·e à simplifier la fidélité ?</h3>
            <p className="mt-2 text-gray-600">Seulement 14,99€/mois — essayez gratuitement et voyez la différence.</p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/register"
                className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition"
              >
                Commencer gratuitement
              </a>
              <a
                href="/contact"
                className="border border-emerald-600 text-emerald-600 px-5 py-3 rounded-lg font-medium hover:bg-emerald-50 transition"
              >
                Nous contacter
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-6 text-sm text-gray-500 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>© {new Date().getFullYear()} Fidelizen — Soutenir le commerce local</div>
          <div className="flex items-center gap-4">
            <a href="/terms" className="hover:underline">CGU</a>
            <a href="/privacy" className="hover:underline">Confidentialité</a>
            <a href="mailto:fidelizen@gmail.com" className="hover:underline">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ----------------- Small presentational components ----------------- */

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
      <div className="text-sm font-semibold text-gray-800">{title}</div>
      <p className="text-xs text-gray-500 mt-1">{desc}</p>
    </div>
  );
}

function IllustrationSVG() {
  // Simple illustrative SVG (QR + device + small commerce icons)
  return (
    <svg
      viewBox="0 0 520 360"
      className="w-full max-w-md h-auto"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Illustration Fidelizen"
    >
      <defs>
        <linearGradient id="g1" x1="0" x2="1">
          <stop offset="0%" stopColor="#d1fae5" />
          <stop offset="100%" stopColor="#ccfbf1" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="520" height="360" rx="16" fill="url(#g1)" />

      {/* Simple storefront */}
      <g transform="translate(48,60)">
        <rect x="0" y="80" width="120" height="80" rx="8" fill="#fff" stroke="#e6e6e6" />
        <rect x="12" y="92" width="96" height="56" rx="6" fill="#f8faf5" />
        <rect x="0" y="60" width="120" height="28" rx="4" fill="#fff" stroke="#e6e6e6" />
        <text x="14" y="76" fontSize="12" fill="#166534" fontWeight="700">Commerce</text>
      </g>

      {/* Phone with QR */}
      <g transform="translate(210,38)">
        <rect x="0" y="0" width="160" height="240" rx="18" fill="#fff" stroke="#e6e6e6" />
        <rect x="22" y="26" width="116" height="116" rx="8" fill="#f7faf7" />
        {/* QR-like squares */}
        <rect x="30" y="34" width="20" height="20" fill="#065f46" />
        <rect x="56" y="34" width="8" height="8" fill="#065f46" />
        <rect x="72" y="34" width="20" height="20" fill="#065f46" />
        <rect x="30" y="60" width="8" height="8" fill="#065f46" />
        <rect x="44" y="60" width="12" height="12" fill="#065f46" />
        <rect x="72" y="60" width="8" height="8" fill="#065f46" />
        <rect x="30" y="84" width="20" height="8" fill="#065f46" />
      </g>

      {/* small decorative checks */}
      <g transform="translate(400,40)">
        <circle cx="0" cy="0" r="28" fill="#fff" stroke="#e6e6e6" />
        <path d="M-10 0 l6 6 l12 -12" stroke="#065f46" strokeWidth="4" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}
