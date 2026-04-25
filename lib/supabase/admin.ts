import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig, getSupabaseServiceRoleKey } from "@/lib/supabase/env";

let adminClient: ReturnType<typeof createClient> | undefined;

export function createAdminClient() {
  if (adminClient) {
    return adminClient;
  }

  const { url } = getSupabaseConfig();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  adminClient = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  return adminClient;
}
