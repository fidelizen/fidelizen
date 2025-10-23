import { NextResponse } from "next/server";

export async function POST(req) {
  const body = await req.text();
  console.log("🪵 Log Apple Wallet :", body);
  return new NextResponse(null, { status: 200 });
}
