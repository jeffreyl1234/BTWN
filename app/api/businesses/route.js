import { NextResponse } from "next/server";
import { listBusinesses } from "@/lib/businessData";
import { normalizeBusinessPayload, validateBusinessPayload } from "@/lib/business";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getAuthenticatedUserFromRequest } from "@/lib/supabaseAuthServer";
import { toUserFacingSupabaseError } from "@/lib/supabaseErrors";

const STORAGE_BUCKET = "business-images";

async function ensureBucket(supabase) {
  const { error } = await supabase.storage.getBucket(STORAGE_BUCKET);
  if (error?.message?.includes("not found") || error?.error === "not_found") {
    await supabase.storage.createBucket(STORAGE_BUCKET, { public: true });
  }
}

async function uploadFile(supabase, userId, file, prefix) {
  const ext = file.name.replace(/^.*\./, "") || "jpg";
  const path = `${userId}/${crypto.randomUUID()}-${prefix}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, arrayBuffer, { contentType: file.type || "image/jpeg", upsert: false });
  if (error) throw new Error(toUserFacingSupabaseError(error));
  const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(data.path);
  return urlData.publicUrl;
}

async function parseMultipartBody(formData) {
  const body = {};
  const profilePhoto = formData.get("profilePhoto");
  const galleryPhotos = formData.getAll("galleryPhotos");
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) continue;
    body[key] = value;
  }
  return { body, profilePhoto: profilePhoto instanceof File ? profilePhoto : null, galleryPhotos: galleryPhotos.filter((f) => f instanceof File) };
}

async function insertBusinessRecord(supabase, payload, user) {
  const { data, error } = await supabase
    .from("businesses")
    .insert({
      ...payload,
      owner_id: user.id,
    })
    .select("*")
    .single();

  if (error) throw new Error(toUserFacingSupabaseError(error));

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
    const user = await getAuthenticatedUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to submit a business." },
        { status: 401 }
      );
    }

    const contentType = request.headers.get("content-type") || "";
    let body;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const { body: formBody, profilePhoto, galleryPhotos } = await parseMultipartBody(formData);
      body = { ...formBody };

      if (profilePhoto || galleryPhotos.length > 0) {
        const supabase = getSupabaseAdmin();
        await ensureBucket(supabase);
        if (profilePhoto) {
          body.profile_image_url = await uploadFile(supabase, user.id, profilePhoto, "profile");
        }
        const galleryUrls = [];
        for (let i = 0; i < galleryPhotos.length; i++) {
          const url = await uploadFile(supabase, user.id, galleryPhotos[i], `gallery-${i}`);
          galleryUrls.push(url);
        }
        if (galleryUrls.length) body.gallery_image_urls = galleryUrls;
      }
    } else {
      body = await request.json();
    }

    const payload = normalizeBusinessPayload(body);
    const message = validateBusinessPayload(payload);
    if (message) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await insertBusinessRecord(supabase, payload, user);

    if (error) throw new Error(toUserFacingSupabaseError(error));
    return NextResponse.json({ business: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to create business." },
      { status: 500 }
    );
  }
}
