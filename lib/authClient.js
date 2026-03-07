import { getSupabaseBrowser, isSignupConfigured } from "@/lib/supabaseBrowser";

export async function getSessionState() {
  if (!isSignupConfigured()) {
    return { user: null, accessToken: null };
  }

  try {
    const supabase = getSupabaseBrowser();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return {
      user: session?.user || null,
      accessToken: session?.access_token || null,
    };
  } catch {
    return { user: null, accessToken: null };
  }
}
