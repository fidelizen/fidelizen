// app/api/auth/signup-merchant/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("➡️ Signup merchant:", body);

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1️⃣ Création de l'utilisateur
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
    });

    if (createErr || !created?.user) {
      console.error("❌ Erreur création user:", createErr);
      return NextResponse.json({ ok: false, error: createErr?.message }, { status: 400 });
    }

    const userId = created.user.id;

    // 2️⃣ Création du commerce
    const { data: merchantData, error: mErr } = await admin
      .from("merchants")
      .insert({
        user_id: userId,
        business: body.business,
        city: body.city,
        category: body.category,
        phone: body.phone || null,
        email: body.email,
      })
      .select("id")
      .single();

    if (mErr || !merchantData) {
      console.error("❌ Erreur insert merchant:", mErr);
      await admin.auth.admin.deleteUser(userId);
      return NextResponse.json({ ok: false, error: mErr?.message }, { status: 400 });
    }

    console.log("✅ Merchant créé:", merchantData);

    // 3️⃣ Création du QR code
    const slug = randomUUID().slice(0, 8);
    const { error: qrErr } = await admin.from("qrcodes").insert({
      merchant_id: merchantData.id,
      url_slug: slug,
      active: true,
    });

    if (qrErr) {
      console.error("❌ Erreur insert QR:", qrErr);
    } else {
      console.log("✅ QR code créé pour merchant", merchantData.id, "slug:", slug);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("❌ Erreur serveur:", e);
    return NextResponse.json({ ok: false, error: "Erreur serveur" }, { status: 500 });
  }
}
