"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail } from "lucide-react";

/* === Header Fidelizen Sticky + Responsive === */
function HeaderFidelizen() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full bg-white border-b border-gray-200 shadow-sm z-40">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 h-20 flex items-center justify-between">
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
            href="/register"
            className="ml-4 px-4 py-2 rounded-md border border-emerald-600 text-emerald-600 hover:bg-emerald-50"
          >
            S'inscrire
          </a>
        </nav>

        {/* Bouton mobile */}
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-emerald-700 hover:bg-emerald-50 focus:outline-none"
          aria-label="Ouvrir le menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Menu mobile */}
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
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
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="px-6 py-2 border border-emerald-600 text-emerald-600 rounded-md hover:bg-emerald-50"
              >
                S'inscrire
              </a>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* === Page Login === */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      setMsg("❌ " + error.message);
      setLoading(false);
      return;
    }

    setMsg("✅ Connexion réussie !");
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ✅ Headbar Fidelizen sticky */}
      <HeaderFidelizen />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10 sm:px-6 mt-20 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full flex flex-col items-center"
        >
          {/* HEADER FORM */}
          <div className="text-center mb-8 sm:mb-10 w-full max-w-md">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
              className="text-3xl sm:text-4xl font-bold text-gray-800 leading-tight"
            >
              Connexion commerçant
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-gray-500 mt-2 text-sm sm:text-base"
            >
              Accédez à votre espace fidélité
            </motion.p>
          </div>

          {/* FORMULAIRE */}
          <motion.form
            onSubmit={handleLogin}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 sm:p-8 space-y-6 w-full max-w-md"
          >
            <AnimatePresence mode="wait">
              {msg && (
                <motion.p
                  key={msg}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.3 }}
                  className={`text-center text-sm ${
                    msg.startsWith("✅")
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {msg}
                </motion.p>
              )}
            </AnimatePresence>

            {/* EMAIL */}
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <Mail className="text-emerald-600 w-4 h-4" />
                Adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.fr"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-500 focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            {/* PASSWORD */}
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <Lock className="text-emerald-600 w-4 h-4" />
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-500 focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            {/* BOUTON */}
            <div className="pt-2 sm:pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-2.5 sm:py-3 rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-60"
              >
                {loading ? "Connexion en cours…" : "Se connecter"}
              </button>
            </div>

            {/* LIEN INSCRIPTION */}
            <p className="text-center text-sm text-gray-600 mt-4 sm:mt-6">
              Pas encore de compte ?{" "}
              <a
                href="/register"
                className="text-emerald-600 font-medium hover:text-emerald-700"
              >
                Créer un compte
              </a>
            </p>
          </motion.form>
        </motion.div>
      </main>
    </div>
  );
}
