import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function listBusinesses({ q = "", category = "all" } = {}) {
  try {
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("businesses")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (category && category !== "all") {
      query = query.ilike("category", `%${category}%`);
    }

    if (q) {
      const safe = q.replace(/[,]/g, "");
      query = query.or(
        `name.ilike.%${safe}%,category.ilike.%${safe}%,description.ilike.%${safe}%,location.ilike.%${safe}%`
      );
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error listing businesses:", error);
    return [];
  }
}

export async function getBusinessById(id) {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error getting business ${id}:`, error);
    return null;
  }
}
