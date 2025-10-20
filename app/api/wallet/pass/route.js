// app/api/wallet/route.js
import { NextResponse } from "next/server";

export async function GET(req) {
  const userAgent = req.headers.get("user-agent") || "";
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
  const { searchParams } = new URL(req.url);
  
  // Redirection automatique selon le device
  const params = searchParams.toString();
  const redirectUrl = isIOS 
    ? `/api/wallet/apple?${params}`
    : `/api/wallet/google?${params}`;
  
  return NextResponse.redirect(new URL(redirectUrl, req.url));
}