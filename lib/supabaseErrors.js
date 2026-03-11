function toErrorMessage(error) {
  if (!error) return "";
  if (typeof error === "string") return error;
  return String(error.message || error.details || "");
}

export function isMissingBusinessesTableError(error) {
  const msg = toErrorMessage(error).toLowerCase();
  return (
    msg.includes("could not find the table 'public.businesses'") ||
    msg.includes('relation "public.businesses" does not exist') ||
    msg.includes('relation "businesses" does not exist')
  );
}

export function isMissingOwnerColumnsError(error) {
  const msg = toErrorMessage(error).toLowerCase();
  return msg.includes("owner_id");
}

export function getBusinessesSchemaSetupMessage() {
  return "Database setup incomplete: run supabase/schema.sql in your Supabase SQL editor so public.businesses exists.";
}

export function getOwnerSchemaSetupMessage() {
  return "Schema missing owner_id: re-run supabase/schema.sql so owner_id exists.";
}

export function toUserFacingSupabaseError(error) {
  if (isMissingBusinessesTableError(error)) return getBusinessesSchemaSetupMessage();
  if (isMissingOwnerColumnsError(error)) return getOwnerSchemaSetupMessage();
  const msg = toErrorMessage(error);
  return msg || "Database request failed.";
}
