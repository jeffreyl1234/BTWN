import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function getAuthenticatedUserFromRequest(request) {
  const authHeader = request.headers.get("authorization") || "";
  if (!authHeader.toLowerCase().startsWith("bearer ")) {
    return null;
  }

  const token = authHeader.slice(7).trim();
  if (!token) return null;

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return null;

    return {
      id: data.user.id,
      email: data.user.email || null,
    };
  } catch {
    return null;
  }
}
