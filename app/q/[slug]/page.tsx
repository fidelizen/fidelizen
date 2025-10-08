"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import confetti from "canvas-confetti";

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
      className="w-full h-2 bg-gray-200 rounded-full overflow-hidden"
      role="progressbar"
      aria-valuenow={p}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-emerald-600 transition-all duration-500"
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
  const [progress, setProgress] = useState<{ current: number; required: number } | null>(null);
  const [reward, setReward] = useState<boolean>(false);
  const [rewardSound, setRewardSound] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    setMsg("Bienvenue 👋 Appuyez sur le bouton pour comptabiliser votre passage.");
    fetchMerchant();
    preloadSound();
  }, []);

  async function fetchMerchant() {
    try {
      const r = await fetch(`/api/merchant-info?slug=${params.slug}`);
      const json = await r.json();
      if (json.ok && json.business) {
        setMerchantName(json.business);
      }
    } catch {
      setMerchantName("");
    }
  }

  function preloadSound() {
    const audio = new Audio("/sounds/ting.mp3");
    audio.volume = 0.6;
    setRewardSound(audio);
  }

  async function handleScan() {
    setLoading(true);
    setMsg(null);

    const deviceToken = getOrSetDeviceToken();

    try {
      const r = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: params.slug, deviceToken }),
      });
      const json = await r.json();

      if (!r.ok || !json.ok) {
        setMsg("❌ " + (json.error ?? "Erreur"));
        return;
      }

      if (json.accepted === false && json.reason === "rate_limit") {
        setMsg(`⏳ Déjà validé récemment. Réessayez dans ${json.nextAfterHours}h.`);
      } else {
        setMsg("✅ Passage comptabilisé !");
        setReward(!!json.rewardIssued);
        if (json.progress && typeof json.progress.current === "number") {
          setProgress(json.progress);
        }

        // 🎉 Si une récompense est débloquée → confettis + son
        if (json.rewardIssued) {
          launchConfetti();
          if (rewardSound) rewardSound.play().catch(() => {});
        }
      }
    } catch (e: any) {
      setMsg("❌ Réseau: " + e.message);
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
        setMsg("✅ Récompense validée ! Merci de votre fidélité 💚");
        setReward(false);
        setProgress({ current: 0, required: progress?.required ?? 8 });
      } else {
        setMsg("❌ " + (json.error ?? "Erreur"));
      }
    } catch (e: any) {
      setMsg("❌ Réseau: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  function launchConfetti() {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#34d399", "#10b981", "#065f46"],
    });
  }

  const current = progress?.current ?? 0;
  const required = progress?.required ?? 0;
  const percent = required ? Math.round((current / required) * 100) : 0;

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6 text-center relative">
        {/* Nom du commerce */}
        <h1 className="text-2xl sm:text-3xl font-bold text-emerald-600 mb-1">
          {merchantName || "Programme fidélité"}
        </h1>
        <p className="text-sm text-gray-600 mb-4">
          Cumulez des points à chaque passage.
        </p>

        {/* Bouton de scan ou de récompense */}
        {!reward ? (
          <button
            onClick={handleScan}
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-60"
          >
            {loading ? "Validation…" : "Valider mon passage"}
          </button>
        ) : (
          <div className="mt-4 space-y-3 animate-fadeIn">
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm text-center">
              🎁 Montrez cet écran à votre commerçant pour valider la récompense.
            </div>
            <button
              onClick={handleRewardReset}
              disabled={loading}
              className="relative w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-60 transition shadow-lg animate-pulse-glow"
            >
              🎁 Valider la récompense
              <span className="absolute inset-0 rounded-lg ring-2 ring-emerald-400 animate-glow" />
            </button>
          </div>
        )}

        {/* Message utilisateur */}
        {msg && <p className="text-sm mt-4 text-gray-700">{msg}</p>}

        {/* Barre de progression */}
        {progress && (
          <div className="mt-6 text-left">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-700">
                {reward
                  ? "🎉 Récompense débloquée !"
                  : `Prochaine récompense dans ${
                      required - current
                    } passage${required - current > 1 ? "s" : ""}`}
              </span>
              <span className="text-gray-500">
                {reward ? `${required}/${required}` : `${current}/${required}`}
              </span>
            </div>
            <Progress percent={reward ? 100 : percent} />
          </div>
        )}
      </div>

      {/* Effets visuels */}
      <style jsx global>{`
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 0px rgba(16,185,129,0.3); }
          50% { box-shadow: 0 0 20px rgba(16,185,129,0.6); }
        }
        .animate-glow {
          animation: glow 1.6s infinite ease-in-out;
        }
      `}</style>
    </main>
  );
}
