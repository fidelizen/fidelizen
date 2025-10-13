import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: Request) {
  try {
    const { slug, deviceToken } = await req.json();

    if (!slug || !deviceToken) {
      return NextResponse.json(
        { ok: false, error: "Missing slug or deviceToken" },
        { status: 400 }
      );
    }

    const admin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1️⃣ Identifier le commerçant via le QR code
    const { data: qrcode, error: qrErr } = await admin
      .from("qrcodes")
      .select("merchant_id")
      .eq("url_slug", slug)
      .maybeSingle();

    if (qrErr || !qrcode) {
      return NextResponse.json(
        { ok: false, error: "QR code non trouvé" },
        { status: 404 }
      );
    }

    // 2️⃣ Identifier le client
    const { data: customer, error: custErr } = await admin
      .from("customers")
      .select("id")
      .eq("merchant_id", qrcode.merchant_id)
      .eq("device_token", deviceToken)
      .maybeSingle();

    if (custErr || !customer) {
      return NextResponse.json(
        { ok: false, error: "Client non trouvé" },
        { status: 404 }
      );
    }

    // 3️⃣ Supprimer la dernière récompense enregistrée (s’il y en a une)
    await admin
      .from("rewards")
      .delete()
      .eq("merchant_id", qrcode.merchant_id)
      .eq("customer_id", customer.id);

    // 4️⃣ Réinitialiser les scans pour repartir à zéro
    await admin
      .from("scans")
      .delete()
      .eq("merchant_id", qrcode.merchant_id)
      .eq("customer_id", customer.id);

    // 5️⃣ Réponse finale
    return NextResponse.json({ ok: true, message: "Récompense validée et compteur réinitialisé." });
  } catch (e) {
    console.error("❌ Erreur /reward-reset:", e);
    return NextResponse.json(
      { ok: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
