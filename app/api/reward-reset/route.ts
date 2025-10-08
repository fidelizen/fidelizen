import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

type Body = {
  slug: string;
  deviceToken: string;
};

export async function POST(req: Request) {
  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const { slug, deviceToken } = (await req.json()) as Body;
    if (!slug || !deviceToken)
      return NextResponse.json({ ok: false, error: "Missing data" }, { status: 400 });

    // 1️⃣ Trouver le QR + commerce
    const { data: qr, error: qrErr } = await admin
      .from("qrcodes")
      .select("id, merchant_id, url_slug")
      .eq("url_slug", slug)
      .single();

    if (qrErr || !qr)
      return NextResponse.json({ ok: false, error: "QR not found" }, { status: 404 });

    const merchantId = qr.merchant_id;

    // 2️⃣ Trouver le client via son deviceToken
    const { data: customer, error: custErr } = await admin
      .from("customers")
      .select("id")
      .eq("merchant_id", merchantId)
      .eq("device_token", deviceToken)
      .maybeSingle();

    if (custErr || !customer)
      return NextResponse.json({ ok: false, error: "Customer not found" }, { status: 404 });

    const customerId = customer.id;

    // 3️⃣ Marquer les scans du client comme “reward_reset”
    await admin
      .from("scans")
      .update({ reward_reset: true })
      .eq("merchant_id", merchantId)
      .eq("customer_id", customerId)
      .eq("accepted", true);

    // 4️⃣ Créer une entrée reward
    const { error: rErr } = await admin.from("rewards").insert({
      merchant_id: merchantId,
      customer_id: customerId,
      label: "Récompense validée en caisse",
      issued_at: new Date().toISOString(),
      redeemed_at: new Date().toISOString(),
      staff_pin_used: false,
    });

    if (rErr) console.error("Reward insert failed:", rErr);

    // 5️⃣ Remettre le compteur à zéro côté customer
    await admin
      .from("customers")
      .update({ last_reset_at: new Date().toISOString() })
      .eq("id", customerId);

    return NextResponse.json({
      ok: true,
      message: "Récompense validée et compteur remis à zéro",
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ ok: false, error: e?.message ?? "Server error" }, { status: 500 });
  }
}
