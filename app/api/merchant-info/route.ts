import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Chargement sécurisé des variables d’environnement
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Vérification des variables au démarrage
if (!url || !serviceKey) {
  console.error("❌ Missing Supabase environment variables");
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ ok: false, error: "Missing slug" }, { status: 400 });
    }

    const admin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Sélection du QR code et du marchand associé
    const { data, error } = await admin
      .from("qrcodes")
      .select("merchant_id, merchants(business, reward_message)")
      .eq("url_slug", slug)
      .maybeSingle(); // ✅ Remplace .single() pour éviter crash si aucun résultat

    if (error) {
      console.error("Supabase error:", error.message);
      return NextResponse.json({ ok: false, error: "Database error" }, { status: 500 });
    }

    if (!data || !data.merchants) {
      return NextResponse.json({ ok: false, error: "Merchant not found" }, { status: 404 });
    }

    // ✅ Sécurisation de l’accès aux données
    const merchant = data.merchants as { business?: string; reward_message?: string };

    return NextResponse.json({
      ok: true,
      business: merchant.business ?? "Commerce inconnu",
      reward_message: merchant.reward_message ?? "",
    });
  } catch (err: unknown) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Unexpected server error",
      },
      { status: 500 }
    );
  }
}
