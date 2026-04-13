import { supabase } from "@/integrations/supabase/client";

/**
 * Ensure storage bucket exists (helper function for automatic bucket creation)
 */
async function ensureBucketExists(bucketName) {
  try {
    // Try to list files from bucket to check if it exists
    const { error } = await supabase.storage.from(bucketName).list('', { limit: 1 });
    
    if (error) {
      if (error.message?.includes('not found') || error.message?.includes('Bucket')) {
        console.warn(`Bucket ${bucketName} does not exist. Please ensure migration is applied.`);
        return false;
      }
      // Other errors might just be permission issues
      return true;
    }
    
    return true;
  } catch (error) {
    console.error(`Error checking bucket ${bucketName}:`, error);
    return false;
  }
}

/**
 * Upload profile photo to Supabase Storage
 */
export async function uploadProfilePhoto(file, userId) {
  try {
    console.log("Uploading profile photo:", { fileName: file.name, fileSize: file.size, userId });

    // Check if bucket exists (but don't fail if check fails - bucket might exist but have permission issues)
    const bucketExists = await ensureBucketExists('profile_photos');
    if (!bucketExists) {
      console.warn("Bucket check failed, but attempting upload anyway...");
    }

    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${userId}/profile-${Date.now()}.${fileExt}`;
    
    console.log("Uploading to path:", fileName);
    
    // Upload to storage bucket 'profile_photos' (with underscore)
    const { data, error: uploadError } = await supabase.storage
      .from('profile_photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error("Upload error details:", {
        message: uploadError.message,
        error: uploadError
      });
      
      // Provide more helpful error messages
      if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('not found')) {
        throw new Error('Storage bucket not configured. Please ensure the migration has been applied to create the profile_photos bucket.');
      } else if (uploadError.message?.includes('duplicate') || uploadError.message?.includes('already exists')) {
        // If file exists, try with a different timestamp
        const retryFileName = `${userId}/profile-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { data: retryData, error: retryError } = await supabase.storage
          .from('profile_photos')
          .upload(retryFileName, file, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (retryError) {
          throw new Error(`Upload failed: ${retryError.message}`);
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('profile_photos')
          .getPublicUrl(retryFileName);
        
        return publicUrl;
      } else if (uploadError.message?.includes('permission') || uploadError.message?.includes('policy')) {
        throw new Error('Permission denied. Please check that RLS policies are configured correctly for the profile_photos bucket.');
      } else {
        throw new Error(`Upload failed: ${uploadError.message || 'Unknown error'}`);
      }
    }

    if (!data) {
      throw new Error('Upload succeeded but no data returned');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('profile_photos')
      .getPublicUrl(fileName);

    console.log("Upload successful, public URL:", publicUrl);
    return publicUrl;
  } catch (error) {
    console.error("Error uploading profile photo:", error);
    // Re-throw with better error message
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(error?.message || 'Failed to upload profile photo');
  }
}

/**
 * Delete profile photo from storage and update profile
 */
export async function deleteProfilePhoto(userId) {
  try {
    // Get current profile to find photo URL
    const { data: profile } = await supabase
      .from("profiles")
      .select("profile_photo_url")
      .eq("user_id", userId)
      .single();

    if (profile?.profile_photo_url) {
      // Extract file path from URL
      const urlParts = profile.profile_photo_url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const folderPath = urlParts[urlParts.length - 2];
      const filePath = `${folderPath}/${fileName}`;

      // Try to delete from storage bucket
      await supabase.storage.from('profile_photos').remove([filePath]).catch(() => {});
    }

    // Update profile to remove photo
    await supabase
      .from("profiles")
      .update({ 
        profile_photo_url: null,
        profile_photo: null 
      })
      .eq("user_id", userId);
  } catch (error) {
    console.error("Error deleting profile photo:", error);
    throw error;
  }
}

/**
 * Update profile photo visibility
 */
export async function updatePhotoVisibility(userId, visible) {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ profile_photo_visible: visible })
      .eq("user_id", userId);

    if (error) throw error;
  } catch (error) {
    console.error("Error updating photo visibility:", error);
    throw error;
  }
}

/**
 * Get profile photo URL with visibility logic
 * Returns photo URL if visible, or null if hidden (for others)
 * Always returns photo URL for own profile
 */
export function getProfilePhotoUrl(profile, currentUserId, profileUserId) {
  // If viewing own profile, always show photo
  if (currentUserId === profileUserId) {
    return profile.profile_photo_url || null;
  }

  // If viewing other user's profile, check visibility
  if (profile.hide_photo === true || profile.profile_photo_visible === false) {
    return null; // Return null to show default avatar
  }

  return profile.profile_photo_url || null;
}
