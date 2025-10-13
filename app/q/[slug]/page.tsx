"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

function getOrSetDeviceToken(): string {
  const KEY = "fidelizen_device_token";
  try {
    let t = localStorage.getItem(KEY);
    if (!t) {
      t = crypto.randomUUID();
      localStorage.setItem(KEY, t);
    }
    return t;
  } catch {
    return Math.random().toString(36).slice(2);
  }
}

function Progress({ percent }: { percent: number }) {
  const p = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div
      className="w-full h-3 bg-[#E6E3DA] rounded-full overflow-hidden"
      role="progressbar"
      aria-valuenow={p}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-[#10B981] transition-all duration-500"
        style={{ width: `${p}%` }}
      />
    </div>
  );
}

export default function ScanPage() {
  const params = useParams<{ slug: string }>();
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [merchantName, setMerchantName] = useState<string>("");
  const [rewardMessage, setRewardMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ current: number; required: number } | null>(null);
  const [reward, setReward] = useState<boolean>(false);
  const [thanks, setThanks] = useState<boolean>(false);
  const [showPlusOne, setShowPlusOne] = useState<boolean>(false);

  useEffect(() => {
    setMsg("Bienvenue 👋");
    fetchMerchant();
  }, []);

  async function fetchMerchant() {
    try {
      const r = await fetch(`/api/merchant-info?slug=${params.slug}`);
      const json = await r.json();
      if (json.ok && json.business) {
        setMerchantName(json.business);
        setRewardMessage(json.reward_message ?? null);
      }
    } catch {
      setMerchantName("");
    }
  }

  async function handleScan() {
    setLoading(true);
    setMsg(null);
    setThanks(false);

    const deviceToken = getOrSetDeviceToken();

    try {
      const r = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: params.slug, deviceToken }),
      });
      const json = await r.json();

      if (!r.ok || !json.ok) {
        setMsg("Erreur : " + (json.error ?? "…"));
        return;
      }

      if (json.accepted === false && json.reason === "rate_limit") {
        setMsg(`⏳ Veuillez réessayer dans ${json.nextAfterHours}h.`);
      } else {
        setMsg("Passage enregistré !");
        setReward(!!json.rewardIssued);
        if (json.progress && typeof json.progress.current === "number") {
          setProgress(json.progress);
        }

        // 👇 Apparition du "+1"
        setShowPlusOne(true);
        setTimeout(() => setShowPlusOne(false), 1200);

        // 💚 Message de soutien
        setThanks(true);

        // 🎉 Confettis si récompense
        if (json.rewardIssued) {
          try {
            const { default: confetti } = (await import("canvas-confetti")) as {
              default: (opts?: {
                particleCount?: number;
                spread?: number;
                origin?: { y?: number };
                colors?: string[];
                scalar?: number;
              }) => void;
            };
            confetti({
              particleCount: 90,
              spread: 65,
              origin: { y: 0.6 },
              colors: ["#10B981", "#A7F3D0", "#F4E9C7"],
              scalar: 0.9,
            });
          } catch (e) {
            console.error("Erreur lors du chargement des confettis:", e);
          }
          if (json.reward_message) setRewardMessage(json.reward_message);
        }
      }
    } catch (e: any) {
      setMsg("Erreur réseau : " + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRewardReset() {
    setLoading(true);
    setMsg(null);

    try {
      const r = await fetch("/api/reward-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: params.slug,
          deviceToken: getOrSetDeviceToken(),
        }),
      });
      const json = await r.json();

      if (json.ok) {
        setMsg("Récompense validée !");
        setReward(false);
        setProgress({ current: 0, required: progress?.required ?? 8 });
      } else {
        setMsg("Erreur : " + (json.error ?? ""));
      }
    } catch (e: any) {
      setMsg("Erreur réseau : " + e.message);
    } finally {
      setLoading(false);
    }
  }

  const current = progress?.current ?? 0;
  const required = progress?.required ?? 0;
  const percent = required ? Math.round((current / required) * 100) : 0;

  const defaultRewardText =
    "Bravo ! Vous avez complété votre panier de fidélité. Venez récupérer votre surprise !";

  return (
    <main className="min-h-screen bg-[#F7F5F0] flex items-center justify-center p-4 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-sm relative"
      >
        {/* LOGO */}
        <div className="flex flex-col items-center mb-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.4 }}
            className="mb-3"
          >
            <Image
              src="/logo-fidelizen.svg"
              alt="Fidelizen"
              width={120}
              height={30}
              priority
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-sm text-gray-600"
          >
            Cumulez des points de fidélité chez
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="text-2xl font-semibold text-emerald-700 mt-1 text-center"
          >
            {merchantName || "Votre commerçant"}
          </motion.h1>
        </div>

        {/* CARTE */}
        <div className="bg-white rounded-2xl shadow-md p-5 relative overflow-hidden">
          {/* "+1" animation flottante */}
          <AnimatePresence>
            {showPlusOne && (
              <motion.div
                key="plusOne"
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: -40, scale: 1.1 }}
                exit={{ opacity: 0, y: -70, scale: 1.2 }}
                transition={{ duration: 1 }}
                className="absolute left-1/2 top-1/2 transform -translate-x-1/2 text-emerald-600 font-bold text-2xl pointer-events-none"
              >
                +1
              </motion.div>
            )}
          </AnimatePresence>

          {/* BOUTON PRINCIPAL */}
          {!reward ? (
            <button
              onClick={handleScan}
              disabled={loading}
              className="w-full active:scale-[0.99] bg-[#556B2F] text-white py-3 rounded-xl font-medium hover:bg-[#6B8A45] transition disabled:opacity-60"
            >
              {loading ? "Validation…" : "Valider mon passage"}
            </button>
          ) : (
            <div className="space-y-3 animate-fadeIn">
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm">
                {rewardMessage ?? defaultRewardText}
              </div>
              <button
                onClick={handleRewardReset}
                disabled={loading}
                className="w-full active:scale-[0.99] bg-[#556B2F] text-white py-3 rounded-xl font-medium hover:bg-[#6B8A45] transition disabled:opacity-60"
              >
                Valider la récompense
              </button>
            </div>
          )}

          {/* MESSAGE D’ÉTAT */}
          <AnimatePresence mode="wait">
            {msg && !reward && (
              <motion.p
                key={msg}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="text-sm mt-3 text-gray-600 text-center"
              >
                {msg}
              </motion.p>
            )}
          </AnimatePresence>

          {/* PROGRESSION */}
          {progress && (
            <div className="mt-5">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-700">
                  {reward ? "Récompense débloquée !" : "Progression"}
                </span>
                <span className="text-gray-500">
                  {reward ? `${required}/${required}` : `${current}/${required}`}
                </span>
              </div>
              <Progress percent={reward ? 100 : percent} />
            </div>
          )}
        </div>

        {/* MERCI 💚 */}
        <AnimatePresence>
          {thanks && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35 }}
              className="mt-4 text-center text-sm text-gray-700"
            >
              Merci de soutenir nos commerçants locaux{" "}
              <span className="inline-block align-middle animate-heartBeat">💚</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <style jsx global>{`
        .animate-fadeIn {
          animation: fadeIn 0.35s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes heartBeat {
          0% { transform: scale(1); }
          20% { transform: scale(1.18); }
          40% { transform: scale(1); }
          60% { transform: scale(1.12); }
          80% { transform: scale(1); }
          100% { transform: scale(1); }
        }
        .animate-heartBeat {
          animation: heartBeat 1.2s ease-in-out both;
        }
      `}</style>
    </main>
  );
}
