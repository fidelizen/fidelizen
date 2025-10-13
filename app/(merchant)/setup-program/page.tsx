"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Gift, Target, Clock, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Program = {
  scans_required: number;
  reward_label: string;
  min_interval_hours: number;
};

export default function SetupProgramPage() {
  const router = useRouter();
  const [program, setProgram] = useState<Program>({
    scans_required: 8,
    reward_label: "",
    min_interval_hours: 24,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: merchant } = await supabase
        .from("merchants")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!merchant) return;

      const { data } = await supabase
        .from("programs")
        .select("*")
        .eq("merchant_id", merchant.id)
        .maybeSingle();

      if (data) {
        setProgram({
          scans_required: data.scans_required,
          reward_label: data.reward_label,
          min_interval_hours: data.min_interval_hours,
        });
      }

      setLoading(false);
    })();
  }, [router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: merchant } = await supabase
        .from("merchants")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!merchant) return;

      const { error } = await supabase
        .from("programs")
        .upsert(
          {
            merchant_id: merchant.id,
            scans_required: program.scans_required,
            reward_label: program.reward_label,
            min_interval_hours: program.min_interval_hours,
          },
          { onConflict: "merchant_id" }
        );

      if (error) {
        setMsg("❌ Erreur lors de la sauvegarde du programme.");
        return;
      }

      const qrRes = await fetch("/api/qr/ensure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchantId: merchant.id }),
      });

      const qrJson = await qrRes.json();
      if (!qrJson.ok) {
        setMsg("⚠️ Programme sauvegardé, mais le QR code n’a pas pu être généré.");
        return;
      }

      setMsg("✅ Programme mis à jour avec succès !");
      router.push("/my-qr");
    } catch (e) {
      console.error("Unexpected error:", e);
      setMsg("❌ Une erreur inattendue est survenue.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-center text-gray-600 py-10">Chargement…</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center px-4 py-10 sm:px-6">
      {/* HEADER */}
      <div className="max-w-4xl text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 flex justify-center items-center gap-3">
          <Sparkles className="text-emerald-600 w-8 h-8" />
          Créez votre programme de fidélité
        </h1>
        <p className="text-gray-500 mt-2 text-sm sm:text-base">
          Personnalisez votre système de points en quelques clics — vos clients vont adorer revenir 
        </p>
      </div>

      {/* FORM + APERÇU */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* FORMULAIRE */}
        <form
          onSubmit={handleSave}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-10 space-y-6"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            🧩 Paramétrez votre programme
          </h2>

          {/* ✅ Message animé */}
          <AnimatePresence mode="wait">
            {msg && (
              <motion.p
                key={msg}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.3 }}
                className={`text-sm mb-4 ${
                  msg.startsWith("✅")
                    ? "text-emerald-600"
                    : msg.startsWith("⚠️")
                    ? "text-amber-600"
                    : "text-red-600"
                }`}
              >
                {msg}
              </motion.p>
            )}
          </AnimatePresence>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Target size={16} className="text-emerald-600" />
                Nombre de passages requis
              </label>
              <input
                type="number"
                min={1}
                value={program.scans_required}
                onChange={(e) =>
                  setProgram({
                    ...program,
                    scans_required: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Exemple : 8 passages = 1 café offert
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Gift size={16} className="text-emerald-600" />
                Récompense
              </label>
              <input
                type="text"
                placeholder="Ex : 1 boisson offerte"
                value={program.reward_label}
                onChange={(e) =>
                  setProgram({
                    ...program,
                    reward_label: e.target.value,
                  })
                }
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Clock size={16} className="text-emerald-600" />
                Délai minimum entre 2 scans (heures)
              </label>
              <input
                type="number"
                min={0}
                value={program.min_interval_hours}
                onChange={(e) =>
                  setProgram({
                    ...program,
                    min_interval_hours: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Exemple : 24h pour éviter plusieurs scans le même jour
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-60"
            >
              {saving ? "Enregistrement…" : "💾 Enregistrer le programme"}
            </button>
          </div>
        </form>

        {/* APERÇU VISUEL */}
        <div className="relative bg-white rounded-2xl shadow-lg border border-gray-100 p-8 flex flex-col justify-center items-center text-center overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('/pattern.svg')] bg-repeat" />
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Aperçu de votre programme
          </h2>

          <div className="w-40 h-40 rounded-full border-8 border-emerald-200 flex items-center justify-center mb-6">
            <span className="text-4xl font-bold text-emerald-700">
              {program.scans_required}
            </span>
          </div>

          <p className="text-gray-600 text-sm mb-2">
            Passages requis pour la récompense :
          </p>
          <p className="text-emerald-700 font-semibold mb-6">
            {program.reward_label || "Ex : 1 boisson offerte"}
          </p>

          <p className="text-xs text-gray-400">
            ⏱️ Intervalle minimum : {program.min_interval_hours}h
          </p>
        </div>
      </div>
    </main>
  );
}
