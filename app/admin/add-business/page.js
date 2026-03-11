"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSessionState } from "@/lib/authClient";
import { getSupabaseBrowser, isSignupConfigured } from "@/lib/supabaseBrowser";

const CATEGORY_OPTIONS = [
  "Beauty",
  "Education",
  "Entertainment",
  "Creative",
  "Tech",
  "Fitness",
  "Photography",
  "Tutoring",
  "Event Services",
  "Other",
];

const initialState = {
  name: "",
  category: "",
  location: "",
  description: "",
  instagram: "",
  email: "",
  website: "",
  phone: "",
};

function normalizeInstagram(value) {
  const normalized = value.trim();
  if (!normalized) return "";
  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return normalized;
  }
  return `https://instagram.com/${normalized.replace(/^@/, "")}`;
}

function normalizeWebsite(value) {
  const normalized = value.trim();
  if (!normalized) return "";
  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return normalized;
  }
  return `https://${normalized}`;
}

function combineDescriptionAndTags(description, tags) {
  const text = description.trim();
  if (!tags.length) return text;
  const tagLine = `Tags: ${tags.join(", ")}`;
  return text ? `${text}\n\n${tagLine}` : tagLine;
}

export default function AddBusinessPage() {
  const router = useRouter();

  const [form, setForm] = useState(initialState);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sessionUser, setSessionUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const signupConfigured = isSignupConfigured();

  const profilePreview = useMemo(() => {
    if (!profilePhoto) return "";
    return URL.createObjectURL(profilePhoto);
  }, [profilePhoto]);

  const galleryPreviews = useMemo(
    () => galleryPhotos.map((file) => ({ name: file.name, url: URL.createObjectURL(file) })),
    [galleryPhotos]
  );

  useEffect(
    () => () => {
      if (profilePreview) URL.revokeObjectURL(profilePreview);
      for (const preview of galleryPreviews) {
        URL.revokeObjectURL(preview.url);
      }
    },
    [galleryPreviews, profilePreview]
  );

  useEffect(() => {
    let mounted = true;

    getSessionState().then(({ user }) => {
      if (!mounted) return;
      setSessionUser(user);
      setCheckingSession(false);
    });

    if (!signupConfigured) {
      return () => {
        mounted = false;
      };
    }

    const supabase = getSupabaseBrowser();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setSessionUser(session?.user || null);
      setCheckingSession(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [signupConfigured]);

  function setField(field) {
    return (event) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };
  }

  function handleAddTag() {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    if (tags.some((tag) => tag.toLowerCase() === trimmed.toLowerCase())) {
      setTagInput("");
      return;
    }

    setTags((prev) => [...prev, trimmed]);
    setTagInput("");
  }

  async function onSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setIsError(false);

    try {
      const { accessToken } = await getSessionState();
      if (!accessToken) {
        throw new Error("Log in is required to submit a business.");
      }

      const hasImages = profilePhoto || galleryPhotos.length > 0;
      let res;

      if (hasImages) {
        const formData = new FormData();
        formData.set("name", form.name);
        formData.set("category", form.category);
        formData.set("location", form.location);
        formData.set("description", combineDescriptionAndTags(form.description, tags));
        formData.set("instagram", normalizeInstagram(form.instagram));
        formData.set("website", normalizeWebsite(form.website));
        formData.set("email", form.email.trim().toLowerCase());
        formData.set("phone", form.phone.trim());
        if (profilePhoto) formData.set("profilePhoto", profilePhoto);
        galleryPhotos.forEach((file) => formData.append("galleryPhotos", file));

        res = await fetch("/api/businesses", {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: formData,
        });
      } else {
        const payload = {
          ...form,
          description: combineDescriptionAndTags(form.description, tags),
          instagram: normalizeInstagram(form.instagram),
          website: normalizeWebsite(form.website),
          email: form.email.trim().toLowerCase(),
        };

        res = await fetch("/api/businesses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save.");

      setMessage("Business page created.");
      setForm(initialState);
      setTags([]);
      setTagInput("");
      setProfilePhoto(null);
      setGalleryPhotos([]);

      if (data.business?.id) {
        router.push(`/business/${data.business.id}`);
      }
    } catch (submitError) {
      setIsError(true);
      setMessage(submitError.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  if (!signupConfigured) {
    return (
      <section className="add-biz-page">
        <h1 className="add-biz-title">Create Your Business Page</h1>
        <p className="auth-error">
          Signup/Login is not configured. Add Supabase public env vars in{" "}
          <code>.env.local</code>.
        </p>
      </section>
    );
  }

  if (checkingSession) {
    return (
      <section className="add-biz-page">
        <h1 className="add-biz-title">Create Your Business Page</h1>
        <p className="muted">Checking your account session...</p>
      </section>
    );
  }

  if (!sessionUser) {
    return (
      <section className="add-biz-page">
        <h1 className="add-biz-title">Create Your Business Page</h1>
        <p className="add-biz-subtitle">Sign in first, then continue to onboarding.</p>
        <div className="add-biz-card add-biz-auth-card">
          <p className="muted">
            Account login is required for all business submissions. You can still browse
            and contact businesses without an account.
          </p>
          <div className="row wrap">
            <Link
              href="/login?intent=add-business&next=%2Fadmin%2Fadd-business"
              className="button"
            >
              Sign in to continue
            </Link>
            <Link
              href="/signup?next=%2Fadmin%2Fadd-business"
              className="button button-secondary"
            >
              Create account
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="onboarding-page">
      <Link href="/explore" className="biz-back-link">
        <span aria-hidden="true">←</span> Back to Explore
      </Link>

      <article className="onboarding-shell">
        <header className="onboarding-header">
          <h1>Create Your Business Page</h1>
          <p>Share your talent with the student community.</p>
        </header>

        <form className="onboarding-form" onSubmit={onSubmit} noValidate>
          <label className="onboarding-label">
            Business Name
            <input
              required
              value={form.name}
              onChange={setField("name")}
              placeholder="Enter your business name"
              className="onboarding-input"
            />
          </label>

          <label className="onboarding-label">
            Category
            <select
              required
              value={form.category}
              onChange={setField("category")}
              className="onboarding-input"
            >
              <option value="">Select a category</option>
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="onboarding-label">
            Service Area / Location
            <input
              required
              value={form.location}
              onChange={setField("location")}
              placeholder="Westwood, UCLA Campus, LA area..."
              className="onboarding-input"
            />
          </label>

          <div className="onboarding-upload">
            <p className="onboarding-label-title">Upload Profile Photo</p>
            <label className="onboarding-upload-dropzone">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="onboarding-upload-input"
                onChange={(event) => setProfilePhoto(event.target.files?.[0] || null)}
              />
              {profilePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profilePreview} alt="Profile preview" className="onboarding-upload-preview" />
              ) : (
                <span>Click to upload or drag and drop</span>
              )}
            </label>
          </div>

          <div className="onboarding-upload">
            <p className="onboarding-label-title">Upload Gallery Photos</p>
            <label className="onboarding-upload-dropzone onboarding-upload-dropzone--small">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="onboarding-upload-input"
                multiple
                onChange={(event) => setGalleryPhotos(Array.from(event.target.files || []))}
              />
              <span>Click to upload portfolio images</span>
            </label>
            {galleryPreviews.length > 0 && (
              <div className="onboarding-gallery-previews">
                {galleryPreviews.map((preview, index) => (
                  <figure key={`gallery-${index}`} className="onboarding-gallery-item">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview.url} alt={preview.name} />
                  </figure>
                ))}
              </div>
            )}
          </div>

          <label className="onboarding-label">
            Describe Your Service
            <textarea
              value={form.description}
              onChange={setField("description")}
              placeholder="Tell students about your services, experience, and what makes you unique..."
              className="onboarding-input onboarding-textarea"
              rows={5}
            />
          </label>

          <div className="onboarding-label">
            <span className="onboarding-label-title">Add Tags</span>
            <div className="onboarding-tags-row">
              <input
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="e.g., photography, grad photos, events"
                className="onboarding-input"
              />
              <button type="button" className="onboarding-tag-add-btn" onClick={handleAddTag}>
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="onboarding-tag-list">
                {tags.map((tag) => (
                  <button
                    type="button"
                    key={tag}
                    className="onboarding-tag-pill"
                    onClick={() => setTags((prev) => prev.filter((item) => item !== tag))}
                    aria-label={`Remove ${tag}`}
                  >
                    {tag} ×
                  </button>
                ))}
              </div>
            )}
          </div>

          <fieldset className="onboarding-social-fieldset">
            <legend>Social Links</legend>
            <label className="onboarding-social-row">
              <div className="onboarding-social-icon onboarding-social-icon--instagram" aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/Instagram.svg" alt="" className="onboarding-social-glyph" />
              </div>
              <input
                value={form.instagram}
                onChange={setField("instagram")}
                placeholder="@username"
                className="onboarding-input"
              />
            </label>
            <label className="onboarding-social-row">
              <div className="onboarding-social-icon onboarding-social-icon--mail" aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/Mail.svg" alt="" className="onboarding-social-glyph" />
              </div>
              <input
                type="email"
                value={form.email}
                onChange={setField("email")}
                placeholder="your@email.com"
                className="onboarding-input"
              />
            </label>
            <label className="onboarding-social-row">
              <div className="onboarding-social-icon onboarding-social-icon--globe" aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/globe.svg" alt="" className="onboarding-social-glyph" />
              </div>
              <input
                value={form.website}
                onChange={setField("website")}
                placeholder="yourwebsite.com"
                className="onboarding-input"
              />
            </label>
          </fieldset>

          <label className="onboarding-label">
            Contact Phone (Optional)
            <input
              type="tel"
              value={form.phone}
              onChange={setField("phone")}
              placeholder="(123) 456-7890"
              className="onboarding-input"
            />
          </label>

          {message && (
            <p
              className={isError ? "onboarding-message onboarding-message--error" : "onboarding-message onboarding-message--success"}
              role={isError ? "alert" : "status"}
            >
              {message}
            </p>
          )}

          <button type="submit" className="onboarding-submit-btn" disabled={saving}>
            {saving ? "Creating..." : "Create Business Page"}
          </button>
        </form>
      </article>
    </section>
  );
}
