// @ts-nocheck
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// ⚙️ Client Supabase admin
const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/**
 * Apple appelle ce endpoint quand un utilisateur ajoute le pass à Wallet.
 * On enregistre le pushToken + deviceLibraryIdentifier dans la table wallet_devices.
 */
export async function POST(req, { params }) {
  const { deviceLibraryIdentifier, passTypeIdentifier, serialNumber } = params;
  const body = await req.json();
  const pushToken = body.pushToken;

  console.log("📲 Enregistrement Apple Wallet :", {
    deviceLibraryIdentifier,
    passTypeIdentifier,
    serialNumber,
    pushToken,
  });

  try {
    // 🔍 On tente de retrouver le customer lié à ce pass
    // (dans ton pass.json, tu peux stocker le customer_id dans userInfo par exemple)
    const { data: existing } = await admin
      .from("wallet_devices")
      .select("id")
      .eq("device_library_id", deviceLibraryIdentifier)
      .maybeSingle();

    if (existing) {
      // 🔄 Si déjà présent, on met à jour le pushToken
      await admin
        .from("wallet_devices")
        .update({ push_token: pushToken })
        .eq("id", existing.id);
    } else {
      // 🆕 Sinon on crée une nouvelle entrée
      await admin.from("wallet_devices").insert({
        device_library_id: deviceLibraryIdentifier,
        push_token: pushToken,
      });
    }

    console.log("✅ Device Apple Wallet enregistré avec succès !");
    return new NextResponse(null, { status: 201 });
  } catch (err) {
    console.error("❌ Erreur d’enregistrement Apple Wallet :", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * Apple peut aussi envoyer une requête DELETE quand l’utilisateur supprime le pass.
 */
export async function DELETE(req, { params }) {
  const { deviceLibraryIdentifier } = params;
  try {
    await admin
      .from("wallet_devices")
      .delete()
      .eq("device_library_id", deviceLibraryIdentifier);

    console.log("🗑️ Device supprimé :", deviceLibraryIdentifier);
    return new NextResponse(null, { status: 200 });
  } catch (err) {
    console.error("❌ Erreur suppression Apple Wallet device :", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
