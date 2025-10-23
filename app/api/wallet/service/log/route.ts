import { NextRequest, NextResponse } from "next/server";

/**
 * 🪵 Endpoint Apple Wallet Log
 * Apple envoie ici des logs d’événements liés aux passes (ex : erreurs, MAJ, etc.)
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.text();
    console.log("🪵 Log Apple Wallet :", body);

    // 👉 Si tu veux, tu pourras plus tard insérer ces logs dans Supabase :
    // await supabaseServer.from("wallet_logs").insert({ body });

    return new NextResponse(null, { status: 200 });
  } catch (err: any) {
    console.error("❌ Erreur lors de la réception du log Apple Wallet :", err);
    return NextResponse.json({ error: err.message ?? "Erreur inconnue" }, { status: 500 });
  }
}
