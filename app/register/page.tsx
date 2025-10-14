"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

/* === HEADER FIDELIZEN STICKY + RESPONSIVE === */
function HeaderFidelizen() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full bg-white border-b border-gray-200 shadow-sm z-40">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 h-20 flex items-center justify-between">
        {/* Logo + slogan */}
        <div className="flex items-center gap-4">
          <a href="/">
            <Image
              src="/logo-fidelizen.svg"
              alt="Fidelizen"
              width={120}
              height={34}
              className="cursor-pointer"
            />
          </a>
          <span className="hidden md:inline text-emerald-700 font-medium text-sm tracking-wide">
            Soutenir le commerce local
          </span>
        </div>

        {/* Navigation desktop */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a className="hover:underline" href="/">Accueil</a>
          <a className="hover:underline" href="/#features">Fonctionnalités</a>
          <a className="hover:underline" href="/#pricing">Tarifs</a>
          <a
            href="/login"
            className="ml-4 px-4 py-2 rounded-md border border-emerald-600 text-emerald-600 hover:bg-emerald-50"
          >
            Se connecter
          </a>
        </nav>

        {/* Bouton mobile */}
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-emerald-700 hover:bg-emerald-50 focus:outline-none"
          aria-label="Ouvrir le menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Menu mobile plein écran */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center"
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-6 right-6 p-2 text-gray-600 hover:text-gray-900"
              aria-label="Fermer le menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <motion.nav
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center gap-6 text-lg font-medium text-gray-800"
            >
              <a href="/" onClick={() => setMobileOpen(false)} className="hover:text-emerald-700">
                Accueil
              </a>
              <a href="/#features" onClick={() => setMobileOpen(false)} className="hover:text-emerald-700">
                Fonctionnalités
              </a>
              <a href="/#pricing" onClick={() => setMobileOpen(false)} className="hover:text-emerald-700">
                Tarifs
              </a>
              <a
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="px-6 py-2 border border-emerald-600 text-emerald-600 rounded-md hover:bg-emerald-50"
              >
                Se connecter
              </a>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* === PAGE REGISTER === */
export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [merchant, setMerchant] = useState({
    business: "",
    city: "",
    category: "",
    phone: "",
  });
  const [auth, setAuth] = useState({
    email: "",
    password: "",
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      const r = await fetch("/api/auth/signup-merchant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...merchant,
          ...auth,
        }),
      });

      const json = await r.json();
      if (!r.ok || !json.ok) {
        setMsg("❌ " + (json.error ?? "Une erreur est survenue."));
        setLoading(false);
        return;
      }

      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: auth.email.trim().toLowerCase(),
        password: auth.password,
      });
      if (signInErr) {
        setMsg("❌ Connexion: " + signInErr.message);
        setLoading(false);
        return;
      }

      setMsg("✅ Compte créé ! Redirection...");
      router.push("/setup-program");
    } catch (err: any) {
      setMsg("❌ Réseau: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HeaderFidelizen />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10 sm:px-6 overflow-hidden mt-20">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full flex flex-col items-center"
        >
          {/* HEADER PAGE */}
          <div className="text-center mb-8 sm:mb-10">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
              className="text-3xl sm:text-4xl font-bold text-gray-800"
            >
              Créez votre compte commerçant
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-gray-500 mt-2 text-sm sm:text-base"
            >
              Lancez votre programme fidélité en quelques clics
            </motion.p>
          </div>

          {/* FORMULAIRE AVEC ANIMATION */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 w-full max-w-lg overflow-hidden relative"
          >
            {/* Indicateur d’étape */}
            <div className="flex justify-center mb-6 space-x-2">
              <span className={`w-3 h-3 rounded-full ${step === 1 ? "bg-emerald-600" : "bg-gray-300"}`} />
              <span className={`w-3 h-3 rounded-full ${step === 2 ? "bg-emerald-600" : "bg-gray-300"}`} />
            </div>

            {/* Message d’état */}
            {msg && (
              <p
                className={`text-center text-sm mb-4 ${
                  msg.startsWith("✅") ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {msg}
              </p>
            )}

            {/* Étapes animées */}
            <div className="relative w-full">
              <AnimatePresence mode="wait" initial={false}>
                {step === 1 ? (
                  <motion.form
                    key="step1"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!merchant.business || !merchant.city || !merchant.category) {
                        setMsg("Merci de compléter tous les champs obligatoires.");
                        return;
                      }
                      setStep(2);
                      setMsg(null);
                    }}
                    initial={{ x: 60, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -60, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="space-y-4"
                  >
                    <Input label="Nom du commerce *" placeholder="Ex : Café du Pont" value={merchant.business} onChange={(v) => setMerchant({ ...merchant, business: v })} />

                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input label="Ville *" placeholder="Ex : Toulouse" value={merchant.city} onChange={(v) => setMerchant({ ...merchant, city: v })} />
                      <Select label="Catégorie *" value={merchant.category} onChange={(v) => setMerchant({ ...merchant, category: v })} options={["Café / Bar","Restaurant","Boulangerie","Beauté / Onglerie","Coiffeur / Barbier","Autre commerce"]} />
                    </div>

                    <Input label="Téléphone (optionnel)" placeholder="06…" value={merchant.phone} onChange={(v) => setMerchant({ ...merchant, phone: v })} />

                    <button type="submit" className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition">
                      Continuer →
                    </button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="step2"
                    onSubmit={handleSubmit}
                    initial={{ x: 60, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -60, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="space-y-4"
                  >
                    <div className="text-xs text-gray-500 mb-2">
                      <button type="button" onClick={() => setStep(1)} className="underline hover:no-underline">
                        ← Modifier les infos commerce
                      </button>
                    </div>

                    <Input label="Email (identifiant) *" placeholder="vous@exemple.fr" type="email" value={auth.email} onChange={(v) => setAuth({ ...auth, email: v })} />
                    <Input label="Mot de passe *" placeholder="••••••••" type="password" value={auth.password} onChange={(v) => setAuth({ ...auth, password: v })} />

                    <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-60">
                      {loading ? "Création en cours…" : "Créer mon compte"}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* Lien login */}
            <p className="text-center text-sm text-gray-600 mt-5">
              Déjà un compte ?{" "}
              <a href="/login" className="text-emerald-600 font-medium hover:text-emerald-700">
                Se connecter
              </a>
            </p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

/* === Composants réutilisables === */
function Input({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string; }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-500 focus:ring-2 focus:ring-emerald-500" />
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[]; }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-emerald-500 bg-white">
        <option value="">Sélectionnez…</option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
