"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Step = 1 | 2;

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
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
          business: merchant.business,
          city: merchant.city,
          category: merchant.category,
          phone: merchant.phone,
          email: auth.email,
          password: auth.password,
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
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 py-8">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100">
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-emerald-600">Fidélizen</h1>
          <p className="text-gray-500 text-sm mt-1">
            Créez votre compte commerçant
          </p>
        </div>

        {/* Message */}
        {msg && (
          <p
            className={`text-center text-sm mb-4 ${
              msg.startsWith("✅") ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {msg}
          </p>
        )}

        {/* Étape 1 — Infos commerce */}
        {step === 1 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!merchant.business || !merchant.city || !merchant.category) {
                setMsg("Merci de compléter tous les champs obligatoires.");
                return;
              }
              setStep(2);
              setMsg(null);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nom du commerce *
              </label>
              <input
                type="text"
                value={merchant.business}
                onChange={(e) =>
                  setMerchant({ ...merchant, business: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                placeholder="Ex : Café du Pont"
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ville *
                </label>
                <input
                  type="text"
                  value={merchant.city}
                  onChange={(e) =>
                    setMerchant({ ...merchant, city: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                  placeholder="Ex : Toulouse"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Catégorie *
                </label>
                <select
                  value={merchant.category}
                  onChange={(e) =>
                    setMerchant({ ...merchant, category: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
                  required
                >
                  <option value="">Sélectionnez…</option>
                  <option>Café / Bar</option>
                  <option>Restaurant</option>
                  <option>Boulangerie</option>
                  <option>Beauté / Onglerie</option>
                  <option>Coiffeur / Barbier</option>
                  <option>Autre commerce</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Téléphone (optionnel)
              </label>
              <input
                type="tel"
                value={merchant.phone}
                onChange={(e) =>
                  setMerchant({ ...merchant, phone: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                placeholder="06…"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 transition"
            >
              Continuer
            </button>
          </form>
        )}

        {/* Étape 2 — Identifiants */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-xs text-gray-500 mb-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="underline hover:no-underline"
              >
                ← Modifier les infos commerce
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email (identifiant) *
              </label>
              <input
                type="email"
                value={auth.email}
                onChange={(e) =>
                  setAuth({ ...auth, email: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                placeholder="vous@exemple.fr"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mot de passe *
              </label>
              <input
                type="password"
                value={auth.password}
                onChange={(e) =>
                  setAuth({ ...auth, password: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-60"
            >
              {loading ? "Création en cours…" : "Créer mon compte"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-600 mt-5">
          Déjà un compte ?{" "}
          <a href="/login" className="text-emerald-600 font-medium hover:text-emerald-700">
            Se connecter
          </a>
        </p>
      </div>
    </main>
  );
}
