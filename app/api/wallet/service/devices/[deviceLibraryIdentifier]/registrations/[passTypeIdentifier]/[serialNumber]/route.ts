import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * ⚙️ Initialisation du client Supabase admin (Service Role)
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const admin: SupabaseClient = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/**
 * Type représentant un enregistrement dans la table wallet_devices
 */
interface WalletDevice {
  id?: string;
  device_library_id: string;
  push_token?: string;
}

/**
 * 📨 Apple appelle ce endpoint quand un utilisateur ajoute le pass à Wallet.
 * On enregistre le pushToken + deviceLibraryIdentifier dans la table wallet_devices.
 */
export async function POST(
  req: NextRequest,
  context: {
    params: {
      deviceLibraryIdentifier: string;
      passTypeIdentifier: string;
      serialNumber: string;
    };
  }
): Promise<NextResponse> {
  const { deviceLibraryIdentifier, passTypeIdentifier, serialNumber } = context.params;
  const { pushToken }: { pushToken: string } = await req.json();

  console.log("📲 Enregistrement Apple Wallet :", {
    deviceLibraryIdentifier,
    passTypeIdentifier,
    serialNumber,
    pushToken,
  });

  try {
    // 🔍 Recherche d’un éventuel enregistrement existant
    const { data: existing, error: existingError } = await admin
      .from("wallet_devices")
      .select("id")
      .eq("device_library_id", deviceLibraryIdentifier)
      .maybeSingle<WalletDevice>();

    if (existingError) throw existingError;

    if (existing) {
      // 🔄 Si déjà présent, on met à jour le pushToken
      const { error: updateError } = await admin
        .from("wallet_devices")
        .update({ push_token: pushToken })
        .eq("id", existing.id);

      if (updateError) throw updateError;
    } else {
      // 🆕 Sinon on crée une nouvelle entrée
      const { error: insertError } = await admin.from("wallet_devices").insert({
        device_library_id: deviceLibraryIdentifier,
        push_token: pushToken,
      } as WalletDevice);

      if (insertError) throw insertError;
    }

    console.log("✅ Device Apple Wallet enregistré avec succès !");
    return new NextResponse(null, { status: 201 });
  } catch (err: any) {
    console.error("❌ Erreur d’enregistrement Apple Wallet :", err);
    return NextResponse.json({ error: err.message ?? "Erreur inconnue" }, { status: 500 });
  }
}

/**
 * 🗑️ Apple envoie une requête DELETE quand l’utilisateur supprime le pass de Wallet.
 */
export async function DELETE(
  req: NextRequest,
  context: { params: { deviceLibraryIdentifier: string } }
): Promise<NextResponse> {
  const { deviceLibraryIdentifier } = context.params;

  try {
    const { error: deleteError } = await admin
      .from("wallet_devices")
      .delete()
      .eq("device_library_id", deviceLibraryIdentifier);

    if (deleteError) throw deleteError;

    console.log("🗑️ Device supprimé :", deviceLibraryIdentifier);
    return new NextResponse(null, { status: 200 });
  } catch (err: any) {
    console.error("❌ Erreur suppression Apple Wallet device :", err);
    return NextResponse.json({ error: err.message ?? "Erreur inconnue" }, { status: 500 });
  }
}
