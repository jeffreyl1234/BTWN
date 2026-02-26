export function normalizeBusinessPayload(payload) {
  const toText = (v) => (typeof v === "string" ? v.trim() : "");
  const toNullable = (v) => {
    const value = toText(v);
    return value ? value : null;
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
