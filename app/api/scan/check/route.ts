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

    // 🔹 Étape 1 : QR → Merchant
    const { data: qrcode, error: qrErr } = await admin
      .from("qrcodes")
      .select("id, merchant_id, active")
      .eq("url_slug", slug)
      .maybeSingle();

    if (qrErr || !qrcode || !qrcode.active) {
      return NextResponse.json(
        { ok: false, error: "QR code invalide ou inactif" },
        { status: 404 }
      );
    }

    // 🔹 Étape 2 : Programme du commerçant
    const { data: program, error: programErr } = await admin
      .from("programs")
      .select("scans_required, message_client, logo_url")
      .eq("merchant_id", qrcode.merchant_id)
      .maybeSingle();

    if (programErr) {
      console.error("Erreur récupération programme:", programErr.message);
    }

    const required = program?.scans_required ?? 8;

    // 🔹 Étape 3 : Infos commerçant
    const { data: merchantData, error: merchErr } = await admin
      .from("merchants")
      .select("business, reward_message")
      .eq("id", qrcode.merchant_id)
      .maybeSingle();

    if (merchErr) {
      console.error("Erreur récupération marchand:", merchErr.message);
    }

    // 🔹 Étape 4 : Client
    const { data: customer } = await admin
      .from("customers")
      .select("id")
      .eq("merchant_id", qrcode.merchant_id)
      .eq("device_token", deviceToken)
      .maybeSingle();

    // Si le client n’existe pas encore → 0 scan
    if (!customer) {
      return NextResponse.json({
        ok: true,
        hasCustomer: false,
        progress: { current: 0, required },
        business: merchantData?.business ?? "Commerce inconnu",
        logo_url: program?.logo_url ?? null,
        message_client: program?.message_client ?? "",
        reward_message: merchantData?.reward_message ?? "",
      });
    }

    // 🔹 Étape 5 : Nombre de scans
    const { count } = await admin
      .from("scans")
      .select("*", { count: "exact", head: true })
      .eq("merchant_id", qrcode.merchant_id)
      .eq("customer_id", customer.id);

    return NextResponse.json({
      ok: true,
      hasCustomer: true,
      progress: { current: count ?? 0, required },
      business: merchantData?.business ?? "Commerce inconnu",
      logo_url: program?.logo_url ?? null,
      message_client: program?.message_client ?? "",
      reward_message: merchantData?.reward_message ?? "",
    });
  } catch (e: any) {
    console.error("❌ Erreur /scan/check:", e);
    return NextResponse.json(
      { ok: false, error: e.message ?? "Erreur serveur" },
      { status: 500 }
    );
  }
}
