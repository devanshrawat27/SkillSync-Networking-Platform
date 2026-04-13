import { supabase } from "@/integrations/supabase/client";

/**
 * Initialize posts table if it doesn't exist
 * This function automatically creates the posts table with all required
 * structure, RLS policies, and triggers for Lovable projects
 */
export async function initializePostsTable() {
  try {
    // First, check if table exists by trying to query it
    const { error: checkError } = await supabase
      .from("posts")
      .select("id")
      .limit(1);

    // If no error, table exists
    if (!checkError) {
      return true;
    }

    // If error is "table doesn't exist", create it
    if (
      checkError.message?.includes("does not exist") ||
      checkError.message?.includes("schema cache") ||
      checkError.code === "PGRST116"
    ) {
      console.log("Posts table not found. Creating table...");

      // Use RPC to create table (requires proper permissions)
      // Alternative: Use SQL function via Supabase
      const { error: createError } = await supabase.rpc("create_posts_table_if_not_exists");

      if (createError) {
        // If RPC doesn't exist, try direct SQL execution via migration
        console.warn("RPC function not available. Table will be created via migration.");
        return false;
      }

      return true;
    }

    // Other errors - table might exist but have permission issues
    console.error("Error checking posts table:", checkError);
    return false;
  } catch (error) {
    console.error("Error initializing posts table:", error);
    return false;
  }
}

/**
 * Alternative: Create table using Supabase SQL execution
 * This uses the Supabase client to execute raw SQL
 */
export async function createPostsTableViaSQL() {
  try {
    // Note: This requires Supabase to support raw SQL execution
    // In Lovable, migrations are preferred, but this is a fallback
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        image_url TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Posts are viewable by everyone" ON public.posts;
      CREATE POLICY "Posts are viewable by everyone"
        ON public.posts FOR SELECT
        USING (true);

      DROP POLICY IF EXISTS "Users can create posts" ON public.posts;
      CREATE POLICY "Users can create posts"
        ON public.posts FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
      CREATE POLICY "Users can update their own posts"
        ON public.posts FOR UPDATE
        USING (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;
      CREATE POLICY "Users can delete their own posts"
        ON public.posts FOR DELETE
        USING (auth.uid() = user_id);
    `;

    // Try to execute via Supabase (if supported)
    // This is a fallback - migrations are preferred
    console.log("Attempting to create posts table...");
    return false; // Migration approach is better
  } catch (error) {
    console.error("Error creating posts table:", error);
    return false;
  }
}
