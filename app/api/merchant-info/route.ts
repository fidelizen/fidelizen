import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ ok: false, error: "Missing slug" }, { status: 400 });
  }

  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data, error } = await admin
    .from("qrcodes")
    .select("merchant_id, merchants(business)")
    .eq("url_slug", slug)
    .single();

  if (error || !data) {
    return NextResponse.json({ ok: false, error: "QR not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, business: data.merchants.business });
}
