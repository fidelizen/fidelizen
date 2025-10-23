import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { deviceLibraryIdentifier, passTypeIdentifier } = params;

  console.log("📡 Vérification d’enregistrement :", deviceLibraryIdentifier, passTypeIdentifier);

  // Pour l’instant, on renvoie une liste vide (aucun pass existant)
  // Tu pourras y ajouter plus tard une vérification Supabase si besoin.
  return NextResponse.json({ serialNumbers: [] }, { status: 200 });
}
