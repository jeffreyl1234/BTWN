export function normalizeBusinessPayload(payload) {
  const toText = (v) => (typeof v === "string" ? v.trim() : "");
  const toNullable = (v) => {
    const value = toText(v);
    return value ? value : null;
  };
  const toUrlArray = (v) => {
    if (Array.isArray(v)) return v.filter((url) => typeof url === "string" && url.trim());
    if (typeof v === "string" && v.trim()) return [v.trim()];
    return [];
  };

  return {
    name: toText(payload?.name),
    category: toText(payload?.category),
    description: toText(payload?.description),
    location: toText(payload?.location),
    instagram: toNullable(payload?.instagram),
    website: toNullable(payload?.website),
    phone: toNullable(payload?.phone),
    email: toNullable(payload?.email),
    profile_image_url: toNullable(payload?.profile_image_url) || null,
    gallery_image_urls: toUrlArray(payload?.gallery_image_urls) || [],
  };
}

export function validateBusinessPayload(payload) {
  if (!payload.name || !payload.category || !payload.location) {
    return "Name, category, and location are required.";
  }

  if (payload.name.length > 120 || payload.category.length > 80) {
    return "Name or category is too long.";
  }

  if (payload.description.length > 2000) {
    return "Description is too long.";
  }

  return null;
}
