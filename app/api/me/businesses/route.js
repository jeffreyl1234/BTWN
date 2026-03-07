import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getAuthenticatedUserFromRequest } from "@/lib/supabaseAuthServer";

export async function GET(request) {
  try {
    const user = await getAuthenticatedUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("businesses")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    return NextResponse.json({ businesses: data || [] });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error.message || "Failed to fetch account businesses. Ensure owner_id exists.",
      },
      { status: 500 }
    );
  }
}
