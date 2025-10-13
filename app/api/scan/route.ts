import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slug, deviceToken } = body;

    if (!slug || !deviceToken) {
      return NextResponse.json(
        { ok: false, error: "Missing slug or deviceToken" },
        { status: 400 }
      );
    }

    const admin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1️⃣ Récupérer le QR code et le merchant_id
    const { data: qrcode, error: qrErr } = await admin
      .from("qrcodes")
      .select("id, merchant_id, active")
      .eq("url_slug", slug)
      .maybeSingle();

    if (qrErr || !qrcode || !qrcode.active) {
      return NextResponse.json(
        { ok: false, error: "QR code invalide ou inactif" },
        { status: 404 }
      );
    }

    // 2️⃣ Récupérer le programme du marchand
    const { data: program, error: programErr } = await admin
      .from("programs")
      .select("scans_required, min_interval_hours")
      .eq("merchant_id", qrcode.merchant_id)
      .maybeSingle();

    if (programErr || !program) {
      return NextResponse.json(
        { ok: false, error: "Programme non trouvé pour ce commerçant" },
        { status: 404 }
      );
    }

    const scansRequired = program.scans_required ?? 8;
    const minHours = program.min_interval_hours ?? 12;

    // 3️⃣ Récupérer ou créer le client
    let { data: customer, error: customerErr } = await admin
      .from("customers")
      .select("id")
      .eq("merchant_id", qrcode.merchant_id)
      .eq("device_token", deviceToken)
      .maybeSingle();

    if (customerErr) {
      console.error("Erreur récupération client:", customerErr.message);
    }

    if (!customer) {
      const { data: created, error: createErr } = await admin
        .from("customers")
        .insert({
          merchant_id: qrcode.merchant_id,
          device_token: deviceToken,
        })
        .select("id")
        .single();

      if (createErr || !created) {
        return NextResponse.json(
          { ok: false, error: "Impossible de créer le client" },
          { status: 500 }
        );
      }

      customer = created;
    }

    // 4️⃣ Vérifier le dernier scan pour respecter le délai minimum
    if (!customer) {
      return NextResponse.json(
        { ok: false, error: "Client introuvable après création" },
        { status: 500 }
      );
    }

    const { data: lastScan, error: lastScanErr } = await admin
      .from("scans")
      .select("created_at")
      .eq("merchant_id", qrcode.merchant_id)
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastScanErr) {
      console.error("Erreur récupération dernier scan:", lastScanErr.message);
    }

    if (lastScan) {
      const diffMs = Date.now() - new Date(lastScan.created_at).getTime();
      const diffH = diffMs / (1000 * 60 * 60);
      if (diffH < minHours) {
        return NextResponse.json({
          ok: true,
          accepted: false,
          reason: "rate_limit",
          nextAfterHours: Math.ceil(minHours - diffH),
        });
      }
    }

    // 5️⃣ Enregistrer un nouveau scan
    const { error: insertErr } = await admin.from("scans").insert({
      merchant_id: qrcode.merchant_id,
      qrcode_id: qrcode.id,
      customer_id: customer.id,
      reason: "ok",
    });

    if (insertErr) {
      console.error("Erreur insertion scan:", insertErr.message);
      return NextResponse.json(
        { ok: false, error: "Erreur enregistrement scan" },
        { status: 500 }
      );
    }

    // 6️⃣ Compter le nombre total de scans du client
    const { count, error: countErr } = await admin
      .from("scans")
      .select("*", { count: "exact", head: true })
      .eq("merchant_id", qrcode.merchant_id)
      .eq("customer_id", customer.id);

    if (countErr) {
      console.error("Erreur comptage scans:", countErr.message);
    }

    const current = count ?? 0;
    const required = scansRequired;
    const rewardIssued = current >= required;

    // 7️⃣ Récupérer le message de récompense du marchand
    const { data: merchantData, error: merchantErr } = await admin
      .from("merchants")
      .select("reward_message")
      .eq("id", qrcode.merchant_id)
      .maybeSingle();

    if (merchantErr) {
      console.error("Erreur récupération message récompense:", merchantErr.message);
    }

    // 8️⃣ Si seuil atteint → enregistrer la récompense + reset des scans
    if (rewardIssued) {
      await admin.from("rewards").insert({
        merchant_id: qrcode.merchant_id,
        customer_id: customer.id,
        label: "Récompense débloquée",
      });

      // ✅ Réinitialise les scans du client après récompense
      await admin
        .from("scans")
        .delete()
        .eq("merchant_id", qrcode.merchant_id)
        .eq("customer_id", customer.id);
    }

    // 9️⃣ Réponse finale
    return NextResponse.json({
      ok: true,
      accepted: true,
      rewardIssued,
      progress: { current, required },
      reward_message:
        merchantData?.reward_message ??
        "🎉 Bravo ! Vous avez complété votre panier de fidélité !",
    });
  } catch (e: unknown) {
    console.error("❌ Erreur serveur /scan:", e);
    return NextResponse.json(
      {
        ok: false,
        error:
          e instanceof Error ? e.message : "Erreur serveur inattendue",
      },
      { status: 500 }
    );
  }
}
