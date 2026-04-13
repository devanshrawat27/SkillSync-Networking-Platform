import { supabase } from "@/integrations/supabase/client";

export function getProfileCompletionPercent(profile) {
  if (!profile) return 0;

  return (
    ((profile.name ? 1 : 0) +
      (profile.bio ? 1 : 0) +
      ((Array.isArray(profile.skills) && profile.skills.length > 0) ? 1 : 0) +
      (profile.github_url ? 1 : 0)) /
    4
  ) * 100;
}

export function isProfileSetupComplete(profile) {
  return getProfileCompletionPercent(profile) >= 100;
}

export async function getPostLoginRoute() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return "/auth";

  return "/dashboard";
}
