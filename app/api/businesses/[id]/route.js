import { NextResponse } from "next/server";
import { getBusinessById } from "@/lib/businessData";
import { normalizeBusinessPayload, validateBusinessPayload } from "@/lib/business";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getAuthenticatedUserFromRequest } from "@/lib/supabaseAuthServer";
import { toUserFacingSupabaseError } from "@/lib/supabaseErrors";

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const business = await getBusinessById(id);
    if (!business) {
      return NextResponse.json({ error: "Business not found." }, { status: 404 });
    }

    return NextResponse.json({ business });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch business." },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const user = await getAuthenticatedUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const supabase = getSupabaseAdmin();

    const { data: existing, error: existingError } = await supabase
      .from("businesses")
      .select("id, owner_id")
      .eq("id", id)
      .single();

    if (existingError) {
      const setupError = toUserFacingSupabaseError(existingError);
      if (
        setupError.startsWith("Database setup incomplete") ||
        setupError.startsWith("Schema missing owner_id")
      ) {
        return NextResponse.json(
          { error: setupError },
          { status: 500 }
        );
      }
      return NextResponse.json({ error: "Business not found." }, { status: 404 });
    }

    if (!existing) {
      return NextResponse.json({ error: "Business not found." }, { status: 404 });
    }

    if (!existing.owner_id) {
      return NextResponse.json(
        {
          error:
            "This listing is not linked to an owner account yet. Ask admin to link owner_id.",
        },
        { status: 403 }
      );
    }

    if (existing.owner_id !== user.id) {
      return NextResponse.json(
        { error: "You do not have permission to edit this business." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const payload = normalizeBusinessPayload(body);
    const message = validateBusinessPayload(payload);
    if (message) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("businesses")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw new Error(toUserFacingSupabaseError(error));
    return NextResponse.json({ business: data });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to update business." },
      { status: 500 }
    );
  }
}
