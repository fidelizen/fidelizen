import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Chargement sécurisé des variables d’environnement
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Vérification de sécurité
if (!url || !serviceKey) {
  console.error("❌ Missing Supabase environment variables");
}

/**
 * GET /api/merchant-info?slug=xxxx
 * Récupère les infos publiques du commerçant liées au QR code
 * -> business, reward_message, message_client, logo_url
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ ok: false, error: "Missing slug" }, { status: 400 });
    }

    // Client administrateur (lecture sécurisée)
    const admin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 🔹 Récupération du QR code + merchant + program
    const { data, error } = await admin
      .from("qrcodes")
      .select(
        `
        merchant_id,
        merchants (
          business,
          reward_message,
          programs (
            message_client,
            logo_url
          )
        )
      `
      )
      .eq("url_slug", slug)
      .maybeSingle();

    if (error) {
      console.error("❌ Supabase error:", error.message);
      return NextResponse.json({ ok: false, error: "Database error" }, { status: 500 });
    }

    if (!data || !data.merchants) {
      return NextResponse.json({ ok: false, error: "Merchant not found" }, { status: 404 });
    }

    // 🔸 Extraction sécurisée des données
    const merchant = data.merchants as {
      business?: string;
      reward_message?: string;
      programs?: {
        message_client?: string;
        logo_url?: string;
      } | null;
    };

    // 🔹 Réponse structurée pour le front
    return NextResponse.json({
      ok: true,
      business: merchant.business ?? "Commerce inconnu",
      reward_message: merchant.reward_message ?? "",
      message_client: merchant.programs?.message_client ?? "",
      logo_url: merchant.programs?.logo_url ?? "",
    });
  } catch (err: unknown) {
    console.error("❌ Unexpected error in /merchant-info:", err);
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Unexpected server error",
      },
      { status: 500 }
    );
  }
}
