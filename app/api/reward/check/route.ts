import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

type Body = { slug: string; deviceToken?: string | null };

export async function POST(req: Request) {
  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false }});
  try {
    const body = (await req.json()) as Body;
    if (!body.slug) return NextResponse.json({ ok:false, error:"Missing slug" }, { status:400 });

    // QR → merchant
    const { data: qr } = await admin.from("qrcodes")
      .select("id, merchant_id, active").eq("url_slug", body.slug).single();
    if (!qr || !qr.active) return NextResponse.json({ ok:false, error:"QR inconnu/inactif" }, { status:404 });

    // customer via deviceToken
    const token = (body.deviceToken ?? "").slice(0,128) || null;
    if (!token) return NextResponse.json({ ok:true, has:false, count:0 });

    const { data: cust } = await admin.from("customers")
      .select("id").eq("merchant_id", qr.merchant_id).eq("device_token", token).maybeSingle();
    if (!cust) return NextResponse.json({ ok:true, has:false, count:0 });

    // rewards non consommées
    const { data: rewards } = await admin.from("rewards")
      .select("id,label,issued_at")
      .eq("merchant_id", qr.merchant_id).eq("customer_id", cust.id).is("redeemed_at", null)
      .order("issued_at", { ascending: true });

    return NextResponse.json({ ok:true, has: (rewards?.length ?? 0) > 0, count: rewards?.length ?? 0, next: rewards?.[0] ?? null });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e.message ?? "Server error" }, { status:500 });
  }
}
