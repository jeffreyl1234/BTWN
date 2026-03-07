import { NextResponse } from "next/server";
import { listBusinesses } from "@/lib/businessData";
import { normalizeBusinessPayload, validateBusinessPayload } from "@/lib/business";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    const category = (searchParams.get("category") || "").trim();
    const businesses = await listBusinesses({ q, category });
    return NextResponse.json({ businesses });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch businesses." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const payload = normalizeBusinessPayload(body);
    const message = validateBusinessPayload(payload);
    if (message) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("businesses")
      .insert(payload)
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ business: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to create business." },
      { status: 500 }
    );
  }
}
