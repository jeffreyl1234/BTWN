import { NextResponse } from "next/server";
import { getBusinessById } from "@/lib/businessData";

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
