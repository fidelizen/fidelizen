"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { Store, MapPin, Phone, Tags, Settings } from "lucide-react";

type Merchant = {
  id: string;
  business: string;
  city: string;
  category: string;
  email: string;
  phone?: string | null;
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
    return <div className="text-center text-gray-600 py-10">Chargement…</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center px-4 py-10 sm:px-6">
      {/* HEADER */}
      <div className="max-w-3xl text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 flex justify-center items-center gap-3">
          <Settings className="text-emerald-600 w-8 h-8" />
          Paramètres du commerce
        </h1>
        <p className="text-gray-500 mt-2 text-sm sm:text-base">
          Gérez les informations visibles sur votre profil fidélité
        </p>
      </div>

      {/* FORMULAIRE CENTRÉ */}
      <form
        onSubmit={handleSave}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-10 space-y-6 w-full max-w-lg"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <Store className="text-emerald-600 w-6 h-6" />
          Informations générales
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
          <InputField
            icon={<Store size={16} className="text-emerald-600" />}
            label="Nom du commerce"
            value={merchant?.business || ""}
            onChange={(v) => setMerchant({ ...merchant!, business: v })}
          />
          <InputField
            icon={<MapPin size={16} className="text-emerald-600" />}
            label="Ville"
            value={merchant?.city || ""}
            onChange={(v) => setMerchant({ ...merchant!, city: v })}
          />
          <InputField
            icon={<Tags size={16} className="text-emerald-600" />}
            label="Catégorie"
            value={merchant?.category || ""}
            onChange={(v) => setMerchant({ ...merchant!, category: v })}
          />
          <InputField
            icon={<Phone size={16} className="text-emerald-600" />}
            label="Téléphone"
            value={merchant?.phone || ""}
            onChange={(v) => setMerchant({ ...merchant!, phone: v })}
          />
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-60"
          >
            {saving ? "Enregistrement…" : "💾 Enregistrer les modifications"}
          </button>
        </div>
      </form>
    </main>
  );
}

/* --- Champ Réutilisable --- */
function InputField({
  label,
  value,
  onChange,
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  icon: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
        {icon}
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
      />
    </div>
  );
}
