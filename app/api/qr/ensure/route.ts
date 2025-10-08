import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: Request) {
  try {
    const { merchantId } = await req.json();
    if (!merchantId) {
      return NextResponse.json({ ok: false, error: "merchantId required" }, { status: 400 });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);

    // 1️⃣ Vérifie si un QR existe déjà
    const { data: existing, error: selErr } = await admin
      .from("qrcodes")
      .select("id,url_slug,active")
      .eq("merchant_id", merchantId)
      .maybeSingle();

    if (selErr) return NextResponse.json({ ok: false, error: selErr.message }, { status: 400 });
    if (existing) return NextResponse.json({ ok: true, qr: existing });

    // 2️⃣ Crée un QR s’il n’existe pas
    const slug = randomUUID().slice(0, 8);
    const insertPayload: any = {
  merchant_id: merchantId,
  url_slug: slug,
  code: slug, // ✅ Ajouté : évite le NOT NULL
  active: true,
};

    const { data: created, error: insErr } = await admin
      .from("qrcodes")
      .insert(insertPayload)
      .select("id,url_slug,active")
      .single();

    if (insErr) return NextResponse.json({ ok: false, error: insErr.message }, { status: 400 });
    return NextResponse.json({ ok: true, qr: created });
  } catch (e: any) {
    console.error("❌ ensure error:", e);
    return NextResponse.json({ ok: false, error: e?.message ?? "server error" }, { status: 500 });
  }
}
