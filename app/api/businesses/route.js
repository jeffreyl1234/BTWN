import { NextResponse } from "next/server";
import { normalizeBusinessPayload, validateBusinessPayload } from "@/lib/business";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    const category = (searchParams.get("category") || "").trim();

    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("businesses")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    if (q) {
      const safe = q.replace(/[,]/g, "");
      query = query.or(
        `name.ilike.%${safe}%,category.ilike.%${safe}%,description.ilike.%${safe}%`
      );
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ businesses: data || [] });
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
    if ((body?.adminSecret || "") !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

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
