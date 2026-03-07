import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { sampleBusinesses } from "@/lib/sampleBusinesses";

function filterBusinesses(items, q, category) {
  const query = (q || "").toLowerCase();
  const selectedCategory = (category || "").toLowerCase();

  return items.filter((item) => {
    const categoryOk =
      !selectedCategory ||
      selectedCategory === "all" ||
      (item.category || "").toLowerCase() === selectedCategory;
    if (!categoryOk) return false;
    if (!query) return true;

    const haystack = [item.name, item.category, item.description, item.location]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
}

function canUseSupabaseRead() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function listBusinesses({ q = "", category = "all" } = {}) {
  if (canUseSupabaseRead()) {
    try {
      const supabase = getSupabaseAdmin();
      let query = supabase
        .from("businesses")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (category && category !== "all") {
        query = query.ilike("category", category);
      }

      if (q) {
        const safe = q.replace(/[,]/g, "");
        query = query.or(
          `name.ilike.%${safe}%,category.ilike.%${safe}%,description.ilike.%${safe}%,location.ilike.%${safe}%`
        );
      }

      const { data, error } = await query;
      if (!error) return data || [];
    } catch {
      // Fall back to demo data.
    }
  }

  return filterBusinesses(sampleBusinesses, q, category);
}

export async function getBusinessById(id) {
  if (canUseSupabaseRead()) {
    try {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", id)
        .single();
      if (!error && data) return data;
    } catch {
      // Fall back to demo data.
    }
  }

  return sampleBusinesses.find((item) => item.id === id) || null;
}
