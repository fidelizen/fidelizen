import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

type Body = {
  slug: string;                // qrcode url_slug
  deviceToken?: string | null; // token client (cookie/localStorage)
  displayName?: string | null; // optionnel
};

export async function POST(req: Request) {
  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const body = (await req.json()) as Body;
    if (!body.slug) {
      return NextResponse.json({ ok: false, error: "Missing slug" }, { status: 400 });
    }

    // 1) Retrouver le QR (sans join indirect)
    const { data: qr, error: qrErr } = await admin
      .from("qrcodes")
      .select("id, merchant_id, url_slug, active")
      .eq("url_slug", body.slug)
      .single();

    if (qrErr || !qr || !qr.active) {
      return NextResponse.json({ ok: false, error: "QR inconnu/inactif" }, { status: 404 });
    }

    const merchantId = qr.merchant_id as string;

    // 1bis) Charger le programme du marchand (requête séparée)
    const { data: prog, error: progErr } = await admin
      .from("programs")
      .select("scans_required, min_interval_hours, reward_label")
      .eq("merchant_id", merchantId)
      .maybeSingle();

    if (progErr) {
      return NextResponse.json({ ok: false, error: "Program load failed" }, { status: 500 });
    }

    const scansRequired = prog?.scans_required ?? 8;
    const minIntervalH = prog?.min_interval_hours ?? 12;
    const rewardLabel = prog?.reward_label ?? "Récompense offerte";

    // 2) Trouver/créer le customer via deviceToken (MVP)
    const token = (body.deviceToken ?? "").slice(0, 128) || null;
    let customerId: string | null = null;

    if (token) {
      const { data: c } = await admin
        .from("customers")
        .select("id")
        .eq("merchant_id", merchantId)
        .eq("device_token", token)
        .maybeSingle();
      if (c) customerId = c.id;
    }

    if (!customerId) {
      const { data: created, error: cErr } = await admin
        .from("customers")
        .insert({
          merchant_id: merchantId,
          device_token: token,
          display_name: body.displayName ?? null,
        })
        .select("id")
        .single();

      if (cErr || !created) {
        return NextResponse.json({ ok: false, error: "Customer create failed" }, { status: 500 });
      }
      customerId = created.id;
    }

    // 3) Anti-abus : dernier scan dans la fenêtre min_interval_hours ?
    const { data: last } = await admin
      .from("scans")
      .select("id, created_at")
      .eq("merchant_id", merchantId)
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (last) {
      const lastAt = new Date(last.created_at);
      const cutoff = new Date(Date.now() - minIntervalH * 3600000);
      if (lastAt > cutoff) {
        // log refus
        await admin.from("scans").insert({
          merchant_id: merchantId,
          qrcode_id: qr.id,
          customer_id: customerId,
          accepted: false,
          reason: "rate_limit",
        });
        return NextResponse.json({
          ok: true,
          accepted: false,
          reason: "rate_limit",
          nextAfterHours: minIntervalH,
        });
      }
    }

    // 4) Enregistrer le scan accepté
    const { error: sErr } = await admin.from("scans").insert({
      merchant_id: merchantId,
      qrcode_id: qr.id,
      customer_id: customerId,
      accepted: true,
      reason: "ok",
    });
    if (sErr) {
      return NextResponse.json({ ok: false, error: "Scan insert failed" }, { status: 500 });
    }

    // 5) Compter les scans acceptés (pour déterminer la récompense)
    const { data: okScans } = await admin
      .from("scans")
      .select("id")
      .eq("merchant_id", merchantId)
      .eq("customer_id", customerId)
      .eq("accepted", true);

    const okCount = okScans?.length ?? 0;

    let rewardIssued = false;
    if (okCount > 0 && okCount % scansRequired === 0) {
      const { error: rErr } = await admin.from("rewards").insert({
        merchant_id: merchantId,
        customer_id: customerId,
        label: rewardLabel,
      });
      if (!rErr) rewardIssued = true;
    }

    return NextResponse.json({
      ok: true,
      accepted: true,
      rewardIssued,
      progress: { current: okCount % scansRequired, required: scansRequired },
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
