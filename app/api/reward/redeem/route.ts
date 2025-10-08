import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

type Body = { slug: string; deviceToken?: string | null; pin?: string | null };

export async function POST(req: Request) {
  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken:false, persistSession:false }});
  try {
    const body = (await req.json()) as Body;
    if (!body.slug) return NextResponse.json({ ok:false, error:"Missing slug" }, { status:400 });

    // QR → merchant + settings
    const { data: qr } = await admin.from("qrcodes")
      .select("id, merchant_id, active").eq("url_slug", body.slug).single();
    if (!qr || !qr.active) return NextResponse.json({ ok:false, error:"QR inconnu/inactif" }, { status:404 });

    const { data: merch } = await admin.from("merchants")
      .select("id, staff_pin_enabled, staff_pin").eq("id", qr.merchant_id).single();

    // customer via deviceToken
    const token = (body.deviceToken ?? "").slice(0,128) || null;
    if (!token) return NextResponse.json({ ok:false, error:"No device" }, { status:400 });

    const { data: cust } = await admin.from("customers")
      .select("id").eq("merchant_id", qr.merchant_id).eq("device_token", token).maybeSingle();
    if (!cust) return NextResponse.json({ ok:false, error:"Client introuvable" }, { status:404 });

    // reward non consommée (la plus ancienne)
    const { data: reward } = await admin.from("rewards")
      .select("id,label,issued_at,redeemed_at")
      .eq("merchant_id", qr.merchant_id).eq("customer_id", cust.id).is("redeemed_at", null)
      .order("issued_at", { ascending: true }).maybeSingle();

    if (!reward) return NextResponse.json({ ok:false, error:"Aucune récompense à consommer" }, { status:400 });

    // si PIN actif, vérifier
    if (merch?.staff_pin_enabled) {
      if (!body.pin || body.pin !== (merch.staff_pin ?? "")) {
        return NextResponse.json({ ok:false, error:"PIN incorrect" }, { status:401 });
      }
    }

    // consommer
    const { error: updErr } = await admin.from("rewards")
      .update({ redeemed_at: new Date().toISOString() })
      .eq("id", reward.id);
    if (updErr) return NextResponse.json({ ok:false, error:"Redeem failed" }, { status:500 });

    return NextResponse.json({ ok:true, redeemed:true, label: reward.label });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e.message ?? "Server error" }, { status:500 });
  }
}
