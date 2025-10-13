"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import QRCode from "qrcode";
import { PDFDownloadLink, Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, Download, Sparkles, Link2, FileText } from "lucide-react";

type Merchant = { id: string; business: string; city: string };
type QR = { id: string; merchant_id: string; url_slug: string; active: boolean };

export default function MyQRPage() {
  const router = useRouter();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [qr, setQR] = useState<QR | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const { data: merchantData } = await supabase
          .from("merchants")
          .select("id,business,city")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!merchantData) {
          setLoading(false);
          return;
        }
        setMerchant(merchantData);

        let { data: qrData } = await supabase
          .from("qrcodes")
          .select("id,merchant_id,url_slug,active")
          .eq("merchant_id", merchantData.id)
          .maybeSingle();

        if (!qrData) {
          const res = await fetch("/api/qr/ensure", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ merchantId: merchantData.id }),
          });
          const json = await res.json();
          if (json.ok) qrData = json.qr;
        }

        if (qrData) {
          setQR(qrData);

          // ✅ Construction de l'URL publique du QR Code
          const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/q/${qrData.url_slug}`;

          // ✅ Correction TypeScript : cast explicite car "width" n'est pas toujours typé dans qrcode
          // mais bien supporté à l'exécution.
          const dataUrl = await QRCode.toDataURL(url, { width: 300 } as any);

          setQrUrl(dataUrl);
        }
      } catch (e) {
        console.error("Erreur génération QR :", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (loading)
    return <div className="text-center text-gray-600 py-10">Chargement…</div>;

  if (!qr || !merchant)
    return (
      <div className="text-center text-gray-600 py-10">
        Aucun QR code trouvé pour ce commerce.
      </div>
    );

  const pageUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/q/${qr.url_slug}`;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center px-4 py-10 sm:px-6">
      {/* HEADER */}
      <div className="max-w-4xl text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 flex justify-center items-center gap-3">
          <QrCode className="text-emerald-600 w-8 h-8" />
          Mon QR Code
        </h1>
        <p className="text-gray-500 mt-2 text-sm sm:text-base">
          Affichez ce code pour que vos clients puissent scanner et cumuler leurs passages
        </p>
      </div>

      {/* CONTENU PRINCIPAL - 2 COLONNES */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* COLONNE GAUCHE : QR CODE */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10 bg-[url('/pattern.svg')] bg-repeat" />

          {qrUrl && (
            <motion.img
              src={qrUrl}
              alt="QR Code"
              className="w-56 h-56 sm:w-64 sm:h-64 border border-gray-200 rounded-xl shadow-md mb-6 relative z-10"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
            />
          )}

          <h2 className="text-xl font-semibold text-gray-800 flex items-center justify-center gap-2 relative z-10">
            <Sparkles className="text-emerald-600 w-5 h-5" />
            {merchant.business}
          </h2>
          <p className="text-sm text-gray-500 mt-1">{merchant.city}</p>
        </motion.div>

        {/* COLONNE DROITE : INFOS & TÉLÉCHARGEMENTS */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sm:p-10 flex flex-col justify-between relative"
        >
          <AnimatePresence>
            {msg && (
              <motion.p
                key={msg}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.3 }}
                className={`text-sm mb-6 p-2 rounded-md text-center ${
                  msg.startsWith("✅")
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {msg}
              </motion.p>
            )}
          </AnimatePresence>

          <div>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1 text-sm font-medium text-gray-700">
                <Link2 className="text-emerald-600 w-4 h-4" />
                Lien vers la carte fidélité :
              </div>
              <a
                href={pageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 text-sm break-all underline hover:text-emerald-800"
              >
                {pageUrl}
              </a>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="text-emerald-600 w-5 h-5" />
                Télécharger votre affiche
              </h3>
              <div className="flex flex-col sm:flex-row justify-start gap-3">
                {["A6", "A5", "A4"].map((size) => (
                  <PDFDownloadLink
                    key={size}
                    document={<QRPoster qrUrl={qrUrl!} merchant={merchant} size={size as any} />}
                    fileName={`${merchant.business}-QR-${size}.pdf`}
                    className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 text-sm font-medium w-full sm:w-auto transition"
                  >
                    <Download className="w-4 h-4" />
                    Format {size}
                  </PDFDownloadLink>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

// === PDF TEMPLATE ===
function QRPoster({
  qrUrl,
  merchant,
  size,
}: {
  qrUrl: string;
  merchant: Merchant;
  size: "A4" | "A5" | "A6";
}) {
  const styles = StyleSheet.create({
    page: {
      padding: 40,
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "space-between",
    },
    qr: { width: 250, height: 250, marginVertical: 30 },
    title: {
      fontSize: 28,
      color: "#065f46",
      textAlign: "center",
      fontWeight: "bold",
    },
    subtitle: {
      fontSize: 16,
      textAlign: "center",
      marginTop: 10,
      color: "#374151",
    },
    merchant: { fontSize: 14, marginTop: 20, color: "#4b5563" },
    footer: {
      fontSize: 10,
      color: "#6b7280",
      textAlign: "center",
      marginTop: 40,
    },
  });

  return (
    <Document>
      <Page size={size} style={styles.page}>
        <View>
          <Text style={styles.title}>Scannez-moi 📱</Text>
          <Text style={styles.subtitle}>Cumulez vos points fidélité chez</Text>
          <Text style={styles.merchant}>{merchant.business}</Text>
        </View>
        <Image src={qrUrl} style={styles.qr} />
        <Text style={styles.footer}>Fidélizen — Simplifiez la fidélité client</Text>
      </Page>
    </Document>
  );
}
