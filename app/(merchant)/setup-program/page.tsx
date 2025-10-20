"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Gift, Target, Clock, Sparkles, MessageSquare, Image } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Program = {
  scans_required: number;
  reward_label: string;
  min_interval_hours: number;
  message_client?: string;
  logo_url?: string;
};

export default function SetupProgramPage() {
  const router = useRouter();
  const [program, setProgram] = useState<Program>({
    scans_required: 8,
    reward_label: "",
    min_interval_hours: 24,
    message_client: "",
    logo_url: "",
  });
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // ──────────────────────────────────────────────
  // CHARGEMENT DU PROGRAMME EXISTANT
  // ──────────────────────────────────────────────
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
          message_client: data.message_client || "",
          logo_url: data.logo_url || "",
        });
        setPreviewLogo(data.logo_url || null);
      }

      setLoading(false);
    })();
  }, [router]);

  // ──────────────────────────────────────────────
  // UPLOAD DU LOGO (Supabase Storage corrigé)
  // ──────────────────────────────────────────────
  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    const { error } = await supabase.storage
      .from("merchant-logos")
      .upload(filePath, file);

    if (error) {
      console.error("Erreur upload logo:", error);
      setMsg("❌ Erreur lors de l’upload du logo.");
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("merchant-logos")
      .getPublicUrl(filePath);

    if (publicUrlData?.publicUrl) {
      setProgram((prev) => ({ ...prev, logo_url: publicUrlData.publicUrl }));
      setPreviewLogo(publicUrlData.publicUrl);
      setMsg("✅ Logo téléchargé avec succès !");
    }
  }

  // ──────────────────────────────────────────────
  // SAUVEGARDE DU PROGRAMME
  // ──────────────────────────────────────────────
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    if (program.scans_required < 1) {
      setMsg("❌ Le nombre de passages requis doit être au minimum 1.");
      setSaving(false);
      return;
    }

    if (program.min_interval_hours < 0) {
      setMsg("❌ Le délai minimum entre 2 scans ne peut pas être négatif.");
      setSaving(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: merchant } = await supabase
        .from("merchants")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!merchant) return;

      const { error } = await supabase.from("programs").upsert(
        {
          merchant_id: merchant.id,
          scans_required: program.scans_required,
          reward_label: program.reward_label,
          min_interval_hours: program.min_interval_hours,
          message_client: program.message_client,
          logo_url: program.logo_url,
        },
        { onConflict: "merchant_id" }
      );

      if (error) {
        setMsg("❌ Erreur lors de la sauvegarde du programme.");
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

  // ──────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────
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
            {/* Nombre de passages requis */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Target size={16} className="text-emerald-600" />
                Nombre de passages requis
              </label>
              <input
                type="number"
                min={1}
                step={1}
                placeholder="Ex : 8"
                value={program.scans_required || ""}
                onChange={(e) =>
                  setProgram({ ...program, scans_required: parseInt(e.target.value) })
                }
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Récompense */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Gift size={16} className="text-emerald-600" />
                Récompense
              </label>
              <input
                type="text"
                placeholder="Ex : 1 café offert"
                value={program.reward_label}
                onChange={(e) => setProgram({ ...program, reward_label: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Délai */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Clock size={16} className="text-emerald-600" />
                Délai minimum entre 2 scans (heures)
              </label>
              <input
                type="number"
                placeholder="Ex : 24"
                min={0}
                step={1}
                value={program.min_interval_hours || ""}
                onChange={(e) =>
                  setProgram({ ...program, min_interval_hours: parseInt(e.target.value) })
                }
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Message client */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <MessageSquare size={16} className="text-emerald-600" />
                Message client (max 40 caractères)
              </label>
              <input
                type="text"
                maxLength={40}
                placeholder="Ex : À bientôt pour votre prochaine visite 👋"
                value={program.message_client}
                onChange={(e) =>
                  setProgram({ ...program, message_client: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Image size={16} className="text-emerald-600" />
                Logo du commerce
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-3
                           file:rounded-md file:border-0 file:text-sm file:font-semibold
                           file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              />
              {previewLogo && (
                <div className="mt-3 flex justify-center">
                  <img
                    src={previewLogo}
                    alt="Aperçu du logo"
                    className="h-16 w-16 object-contain rounded-md border"
                  />
                </div>
              )}
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

          {previewLogo && (
            <img
              src={previewLogo}
              alt="Logo"
              className="absolute top-6 left-6 h-12 w-12 object-contain rounded-md border"
            />
          )}

          <h2 className="text-lg font-semibold text-gray-800 mb-4 mt-8">
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
          <p className="text-emerald-700 font-semibold mb-4">
            {program.reward_label || "Ex : 1 café offert"}
          </p>

          {program.message_client && (
            <p className="text-sm italic text-gray-500 mb-2">
              “{program.message_client}”
            </p>
          )}

          <p className="text-xs text-gray-400">
            ⏱️ Intervalle minimum : {program.min_interval_hours}h
          </p>
        </div>
      </div>
    </main>
  );
}
