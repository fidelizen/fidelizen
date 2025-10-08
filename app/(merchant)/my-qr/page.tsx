"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import QRCode from "qrcode";
import {
  PDFDownloadLink,
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

type Merchant = { id: string; business: string; city: string };
type QR = { id: string; merchant_id: string; url_slug: string; active: boolean };

export default function MyQRPage() {
  const router = useRouter();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [qr, setQR] = useState<QR | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
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

        // Vérifie ou crée le QR
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
          const url = `${
            process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
          }/q/${qrData.url_slug}`;
          const dataUrl = await QRCode.toDataURL(url, { width: 300 });
          setQrUrl(dataUrl);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (loading) {
    return (
      <div className="text-gray-600 text-center py-10">Chargement…</div>
    );
  }

  if (!qr || !merchant) {
    return (
      <div className="text-center text-gray-600 py-10">
        Aucun QR code trouvé pour ce commerce.
      </div>
    );
  }

  const pageUrl = `${
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  }/q/${qr.url_slug}`;

  return (
    <main className="flex justify-center items-center min-h-screen bg-gray-50 px-4 sm:px-6 py-8">
      <div className="w-full max-w-md sm:max-w-2xl bg-white rounded-2xl shadow-lg p-6 sm:p-10 text-center flex flex-col items-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-emerald-600 mb-2">
          Mon QR Code
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          À afficher pour vos clients afin qu’ils cumulent leurs passages.
        </p>

        {/* QR Code */}
        {qrUrl && (
          <div className="flex justify-center mb-5">
            <img
              src={qrUrl}
              alt="QR Code"
              className="w-52 h-52 sm:w-64 sm:h-64 border border-gray-200 rounded-xl shadow-sm"
            />
          </div>
        )}

        {/* Lien */}
        <div className="text-gray-600 text-sm break-all mb-8">
          <p className="mb-1">Lien associé :</p>
          <a
            href={pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 underline hover:text-emerald-700"
          >
            {pageUrl}
          </a>
        </div>

        {/* Téléchargement PDF */}
        <div className="w-full">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            📄 Télécharger votre affiche
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            {["A6", "A5", "A4"].map((size) => (
              <PDFDownloadLink
                key={size}
                document={<QRPoster qrUrl={qrUrl!} merchant={merchant} size={size as any} />}
                fileName={`${merchant.business}-QR-${size}.pdf`}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 text-sm font-medium w-full sm:w-auto text-center"
              >
                Format {size}
              </PDFDownloadLink>
            ))}
          </div>
        </div>
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
