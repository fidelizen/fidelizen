"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface StampCardProps {
  current: number;
  required: number;
  reward: boolean;
  merchantName?: string;
  merchantLogo?: string | null;
}

export default function StampCard({
  current,
  required,
  reward,
  merchantName,
  merchantLogo,
}: StampCardProps) {
  const stamps = Array.from({ length: required }, (_, i) => i < current);

  return (
    <div
      className="relative rounded-2xl border border-[#DAD4BF] shadow-inner p-4 bg-[#FBFAF7]"
      style={{
        backgroundImage: "url('/textures/paper-grain.png')",
        backgroundSize: "300px",
        backgroundBlendMode: "overlay",
      }}
    >
      {/* DÉCOR PETITS POINTS */}
      <div className="absolute inset-0 bg-[radial-gradient(#d6d3c0_1px,transparent_1px)] bg-[length:16px_16px] opacity-60 pointer-events-none rounded-2xl" />

      {/* LOGO COMMERCANT EN HAUT À GAUCHE (aligné avec 1ère case) */}
      {merchantLogo && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="absolute top-3 left-[22px] w-[54px] h-[54px] rounded-md bg-white border border-[#D6D1BD] shadow-sm flex items-center justify-center p-1.5 z-20"
        >
          <Image
            src={merchantLogo}
            alt="Logo du commerce"
            width={46}
            height={46}
            className="object-contain rounded-sm"
          />
        </motion.div>
      )}

      {/* NOM DU COMMERCE */}
      <h2 className="text-center text-[#3C5530] text-lg font-semibold mb-1 relative z-10">
        {merchantName ?? "Votre commerce"}
      </h2>
      <p className="text-center text-[13px] text-gray-500 mb-3 relative z-10">
        Carte de fidélité Fidelizen
      </p>

      {/* GRILLE DES TAMPONS */}
      <div className="grid grid-cols-5 gap-2 justify-items-center relative z-10">
        {stamps.map((isStamped, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.04 }}
            className="relative w-12 h-12 rounded-md border border-[#D5CDB5] bg-white flex items-center justify-center text-gray-400 text-sm font-medium shadow-sm"
          >
            {isStamped ? (
              <motion.div
                initial={{ rotate: -20, scale: 0 }}
                animate={{ rotate: -20, scale: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <span
                  className="text-red-600 text-[11px] font-extrabold tracking-widest uppercase border-2 border-red-600 rounded-sm px-1 py-[1px] opacity-85 bg-white/70"
                  style={{
                    boxShadow: "0 0 1px rgba(0,0,0,0.1)",
                    transform: "rotate(-18deg)",
                    fontFamily: "'Courier New', monospace",
                    filter: "drop-shadow(0 0 1px rgba(0,0,0,0.15))",
                  }}
                >
                  VALIDÉ
                </span>
              </motion.div>
            ) : (
              <span className="text-[#AFA897]">#{i + 1}</span>
            )}
          </motion.div>
        ))}
      </div>

      {/* RÉCOMPENSE */}
      {reward && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-3 text-center text-[#3C5530] font-medium"
        >
          🎁 Récompense débloquée !
        </motion.div>
      )}
    </div>
  );
}
