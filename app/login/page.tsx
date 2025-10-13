"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail } from "lucide-react";

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
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-10 overflow-hidden">
      {/* ANIMATION DU CONTENU */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full flex flex-col items-center"
      >
        {/* HEADER */}
        <div className="text-center mb-8 sm:mb-10 w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
            className="flex justify-center mb-3"
          >
            <Image
              src="/logo-fidelizen.svg"
              alt="Fidelizen"
              width={130}
              height={36}
              priority
              className="w-32 sm:w-36 h-auto"
            />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
            className="text-2xl sm:text-3xl font-bold text-gray-800 leading-tight"
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

        {/* FORMULAIRE AVEC ANIMATION */}
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
  );
}
