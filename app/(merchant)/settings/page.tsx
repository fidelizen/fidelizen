"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Merchant = {
  id: string;
  business: string;
  city: string;
  category: string;
  email: string;
  phone?: string | null;
  logo_url?: string | null;
};

export default function SettingsPage() {
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("merchants")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) setMsg("❌ Erreur de chargement des paramètres.");
      else setMerchant(data);
      setLoading(false);
    })();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!merchant) return;
    setSaving(true);
    setMsg(null);

    const { error } = await supabase
      .from("merchants")
      .update({
        business: merchant.business,
        city: merchant.city,
        category: merchant.category,
        phone: merchant.phone,
      })
      .eq("id", merchant.id);

    if (error) setMsg("❌ Erreur lors de la sauvegarde.");
    else setMsg("✅ Modifications enregistrées !");
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="text-gray-600 text-center py-10">Chargement…</div>
    );
  }

  return (
    <main className="flex justify-center items-center min-h-screen bg-gray-50 px-4 sm:px-6 py-10">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 sm:p-10 border border-gray-100">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6 text-center sm:text-left">
          ⚙️ Paramètres du commerce
        </h1>

        {msg && (
          <p
            className={`text-sm mb-4 text-center sm:text-left ${
              msg.startsWith("✅") ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {msg}
          </p>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          {/* Informations générales */}
          <div>
            <h2 className="text-lg font-medium text-gray-700 mb-3">
              Informations générales
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 font-medium">
                  Nom du commerce
                </label>
                <input
                  type="text"
                  value={merchant?.business || ""}
                  onChange={(e) =>
                    setMerchant({ ...merchant!, business: e.target.value })
                  }
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 font-medium">
                  Ville
                </label>
                <input
                  type="text"
                  value={merchant?.city || ""}
                  onChange={(e) =>
                    setMerchant({ ...merchant!, city: e.target.value })
                  }
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 font-medium">
                  Catégorie
                </label>
                <input
                  type="text"
                  value={merchant?.category || ""}
                  onChange={(e) =>
                    setMerchant({ ...merchant!, category: e.target.value })
                  }
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 font-medium">
                  Téléphone
                </label>
                <input
                  type="text"
                  value={merchant?.phone || ""}
                  onChange={(e) =>
                    setMerchant({ ...merchant!, phone: e.target.value })
                  }
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Bouton d'action */}
          <div className="pt-4 border-t border-gray-100 flex justify-center sm:justify-end">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto bg-emerald-600 text-white px-5 py-3 rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-60"
            >
              {saving ? "Sauvegarde..." : "Enregistrer les modifications"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
