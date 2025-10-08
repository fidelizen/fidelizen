"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMsg("❌ Identifiants invalides");
    } else if (data.user) {
      setMsg("✅ Connexion réussie !");
      router.push("/dashboard");
    }

    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 sm:px-6">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 sm:p-8 border border-gray-100">
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-emerald-600">Fidélizen</h1>
          <p className="text-gray-500 text-sm mt-1">
            Espace commerçant – Connexion
          </p>
        </div>

        {/* Message */}
        {msg && (
          <div
            className={`text-sm text-center mb-4 ${
              msg.startsWith("✅") ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {msg}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 font-medium mb-1">
              Adresse email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
              placeholder="exemple@mail.com"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 font-medium mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-60"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        {/* Lien inscription */}
        <p className="text-center text-sm text-gray-600 mt-5">
          Pas encore de compte ?{" "}
          <Link
            href="/register"
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </main>
  );
}
