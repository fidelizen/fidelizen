import { NextRequest, NextResponse } from "next/server";

/**
 * ✅ Vérifie l’enregistrement d’un appareil pour un type de pass.
 * Pour l’instant, renvoie toujours une liste vide.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ deviceLibraryIdentifier: string; passTypeIdentifier: string }> }
): Promise<NextResponse> {
  const { deviceLibraryIdentifier, passTypeIdentifier } = await params;
  // ...
  console.log("📡 Vérification d’enregistrement :", {
    deviceLibraryIdentifier,
    passTypeIdentifier,
  });

  // 👉 Plus tard : requête Supabase pour vérifier si le pass existe déjà
  return NextResponse.json({ serialNumbers: [] }, { status: 200 });
}
