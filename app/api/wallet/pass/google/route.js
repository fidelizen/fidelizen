export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const merchantId = searchParams.get("merchant_id");
    const customerId = searchParams.get("customer_id");

    if (!merchantId || !customerId) {
      return NextResponse.json(
        { error: "Missing merchant_id or customer_id" },
        { status: 400 }
      );
    }

    // Vérification des variables d'environnement
    if (!process.env.GOOGLE_WALLET_ISSUER_ID || !process.env.GOOGLE_WALLET_SERVICE_ACCOUNT) {
      return NextResponse.json(
        { error: "Google Wallet not configured. Missing env variables." },
        { status: 500 }
      );
    }

    // Récupération des données depuis Supabase
    const { data: progress, error: progressError } = await supabaseServer
      .from("v_loyalty_progress")
      .select("*")
      .eq("merchant_id", merchantId)
      .eq("customer_id", customerId)
      .maybeSingle();

    if (progressError || !progress) {
      return NextResponse.json(
        { error: "Impossible de récupérer les données de fidélité" },
        { status: 404 }
      );
    }

    const scanCount = progress.current_stamps || 0;
    const maxScans = progress.scans_required || 10;
    const merchantName = progress.merchant_name || "Commerce local";
    const rewardDescription = progress.reward_description || "Récompense à débloquer";

    // Configuration Google Wallet
    const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
    const classId = `${issuerId}.fidelizen_loyalty`;
    const objectId = `${issuerId}.${customerId}_${merchantId}`.replace(/[^a-zA-Z0-9._-]/g, '_');

    // Objet de la carte de fidélité
    const loyaltyObject = {
      id: objectId,
      classId: classId,
      state: "ACTIVE",
      accountId: customerId,
      accountName: merchantName,
      loyaltyPoints: {
        label: "Tampons collectés",
        balance: {
          string: `${scanCount} / ${maxScans}`
        }
      },
      textModulesData: [
        {
          header: "Récompense",
          body: rewardDescription,
          id: "reward"
        },
        {
          header: "Fidelizen",
          body: "Merci de soutenir le commerce local 💚",
          id: "info"
        }
      ],
      barcode: {
        type: "QR_CODE",
        value: `https://fidelizen.app/scan/${merchantId}/${customerId}`
      },
      hexBackgroundColor: "#10b981"
    };

    // Génération du JWT
    const credentials = JSON.parse(process.env.GOOGLE_WALLET_SERVICE_ACCOUNT);
    
    const claims = {
      iss: credentials.client_email,
      aud: "google",
      origins: ["https://fidelizen.app"],
      typ: "savetowallet",
      payload: {
        loyaltyObjects: [loyaltyObject]
      }
    };

    const token = jwt.sign(claims, credentials.private_key, {
      algorithm: "RS256"
    });

    // URL "Ajouter à Google Wallet"
    const saveUrl = `https://pay.google.com/gp/v/save/${token}`;

    // Retour selon le format demandé
    const format = searchParams.get("format");
    
    if (format === "json") {
      return NextResponse.json({ 
        success: true,
        saveUrl,
        provider: "google",
        data: {
          merchantName,
          stamps: `${scanCount}/${maxScans}`,
          reward: rewardDescription
        }
      });
    }

    // Redirection directe vers Google Wallet
    return NextResponse.redirect(saveUrl);

  } catch (err) {
    console.error("Erreur génération Google Wallet:", err);
    return NextResponse.json({ 
      error: err.message,
      details: err.stack 
    }, { status: 500 });
  }
}npm install jsonwebtoken