import { NextResponse } from "next/server";
import { listBusinesses } from "@/lib/businessData";
import { normalizeBusinessPayload, validateBusinessPayload } from "@/lib/business";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getAuthenticatedUserFromRequest } from "@/lib/supabaseAuthServer";

async function insertBusinessRecord(supabase, payload, user) {
  const { data, error } = await supabase
    .from("businesses")
    .insert({
      ...payload,
      owner_id: user.id,
      owner_email: user.email,
    })
    .select("*")
    .single();

  if (error && /owner_id|owner_email|column/i.test(error.message || "")) {
    throw new Error(
      "Schema missing owner fields. Re-run supabase/schema.sql before account-based submissions."
    );
  }

  return { data, error };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    const rawCategory = (searchParams.get("category") || "").trim();
    const category =
      rawCategory === "" || rawCategory.toLowerCase() === "all"
        ? "all"
        : rawCategory.toLowerCase();
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
    const user = await getAuthenticatedUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to submit a business." },
        { status: 401 }
      );
    }

    const payload = normalizeBusinessPayload(body);
    const message = validateBusinessPayload(payload);
    if (message) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await insertBusinessRecord(supabase, payload, user);

    if (error) throw error;
    return NextResponse.json({ business: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to create business." },
      { status: 500 }
    );
  }
}
