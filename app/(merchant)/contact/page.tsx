"use client";

import { Mail, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-10 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sm:p-10 text-center"
      >
        <div className="flex flex-col items-center gap-3 mb-6">
          <MessageSquare className="text-emerald-600 w-10 h-10" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Nous contacter
          </h1>
          <p className="text-gray-500 text-sm">
            Vous avez une question, une suggestion ou besoin d’aide ?  
            Nous sommes à votre écoute 💬
          </p>
        </div>

        <a
          href="mailto:fidelizen@gmail.com"
          className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition shadow"
        >
          <Mail className="w-5 h-5" />
          Envoyer un email à fidelizen.contact@gmail.com
        </a>

        <p className="text-gray-400 text-xs mt-6">
          Réponse garantie sous 24h ouvrées ⏱️
        </p>
      </motion.div>
    </main>
  );
}
