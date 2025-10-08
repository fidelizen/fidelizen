"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

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
      .upsert({
        merchant_id: merchant.id,
        scans_required: program.scans_required,
        reward_label: program.reward_label,
        min_interval_hours: program.min_interval_hours,
      });

    if (error) {
      setMsg("❌ Erreur lors de la sauvegarde.");
    } else {
      setMsg("✅ Programme mis à jour !");
      router.push("/my-qr");
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <div className="text-center text-gray-600 py-10">Chargement…</div>
    );
  }

  return (
    <main className="flex justify-center items-center min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-10">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 text-center sm:text-left">
          🎯 Votre programme de fidélité
        </h1>
        <p className="text-sm text-gray-500 mb-6 text-center sm:text-left">
          Définissez les règles de votre programme selon vos besoins.
        </p>

        {msg && (
          <p
            className={`text-sm mb-4 text-center sm:text-left ${
              msg.startsWith("✅") ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {msg}
          </p>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Champs du programme */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
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

          {/* Bouton d’action */}
          <div className="pt-4 border-t border-gray-100 flex justify-center sm:justify-end">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto bg-emerald-600 text-white px-5 py-2 sm:px-6 sm:py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-60"
            >
              {saving ? "Enregistrement…" : "Enregistrer le programme"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
