import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!url || !anonKey || !serviceKey) {
      return NextResponse.json({
        ok: false,
        error: "Missing one or more Supabase environment variables",
        vars: {
          url: !!url,
          anonKey: !!anonKey,
          serviceKey: !!serviceKey,
        },
      });
    }

    // Teste la connexion
    const supabase = createClient(url, serviceKey);
    const { data, error } = await supabase.from("qrcodes").select("id").limit(1);

    if (error) throw error;

    return NextResponse.json({
      ok: true,
      message: "✅ Supabase connected successfully!",
      firstRow: data?.[0] || null,
    });
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      error: err.message,
    });
  }
}
