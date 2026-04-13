import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Upload, Trash2, Eye, EyeOff } from "lucide-react";
import { uploadProfilePhoto, deleteProfilePhoto, updatePhotoVisibility } from "@/lib/profile-photo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ProfilePhotoManager = ({
  profilePhoto,
  profilePhotoVisible,
  userName,
  userId,
  onPhotoUpdate,
}) => {
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(profilePhoto);
  const [photoVisible, setPhotoVisible] = useState(profilePhotoVisible);
  const fileInputRef = useRef(null);

  // Sync props with state
  useEffect(() => {
    setCurrentPhoto(profilePhoto);
    setPhotoVisible(profilePhotoVisible);
  }, [profilePhoto, profilePhotoVisible]);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    
    // Reset input value so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (!file) {
      return;
    }

    if (!userId) {
      toast.error("User not authenticated. Please log in again.");
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploadingPhoto(true);
    toast.loading("Uploading photo...", { id: "upload-photo" });

    try {
      console.log("Starting photo upload for user:", userId);
      const photoUrl = await uploadProfilePhoto(file, userId);
      
      if (photoUrl) {
        console.log("Photo uploaded successfully, URL:", photoUrl);
        
        // Update profile with new photo URL
        // Use existing profile_photo column (migration may not be applied yet)
        // After migration, we can also update profile_photo_url
        const { error } = await supabase
          .from("profiles")
          .update({ 
            profile_photo: photoUrl
          })
          .eq("user_id", userId);

        if (error) {
          console.error("Error updating profile:", error);
          
          // If error is about profile_photo_url column, try without it
          if (error.message?.includes('profile_photo_url')) {
            // Try again with only profile_photo (existing column)
            const { error: retryError } = await supabase
              .from("profiles")
              .update({ profile_photo: photoUrl })
              .eq("user_id", userId);
            
            if (retryError) {
              throw new Error(`Failed to update profile: ${retryError.message}`);
            }
          } else {
            throw new Error(`Failed to update profile: ${error.message}`);
          }
        }
        
        // Try to also update profile_photo_url if column exists (after migration)
        // This is optional and won't fail if column doesn't exist
        try {
          await supabase
            .from("profiles")
            .update({ profile_photo_url: photoUrl })
            .eq("user_id", userId);
        } catch (e) {
          // Column doesn't exist yet, that's okay - migration not applied yet
          console.log("profile_photo_url column not found, using profile_photo only");
        }

        setCurrentPhoto(photoUrl);
        toast.success("Profile photo uploaded successfully!", { id: "upload-photo" });
        onPhotoUpdate();
      } else {
        throw new Error("Upload failed - no URL returned");
      }
    } catch (error) {
      console.error("Upload error details:", error);
      const errorMessage = error?.message || error?.error?.message || "Failed to upload photo. Please try again.";
      toast.error(errorMessage, { id: "upload-photo" });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePhotoDelete = async () => {
    if (!userId) return;
    
    try {
      await deleteProfilePhoto(userId);
      setCurrentPhoto(null);
      toast.success("Profile photo deleted");
      onPhotoUpdate();
    } catch (error) {
      toast.error(error.message || "Failed to delete photo");
    }
  };

  const handleVisibilityToggle = async (checked) => {
    if (!userId) return;
    
    // checked = true means hide photo, so visible = false
    const visible = !checked;
    
    try {
      await updatePhotoVisibility(userId, visible);
      setPhotoVisible(visible);
      toast.success(visible ? "Profile photo is now visible" : "Profile photo is now hidden");
      onPhotoUpdate();
    } catch (error) {
      toast.error(error.message || "Failed to update visibility");
    }
  };

  return (
    <Card className="glass-card p-6 mb-6">
      <div className="border-b pb-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Profile Photo</h3>
        <div className="flex items-start gap-6">
          <Avatar className="w-24 h-24">
            <AvatarImage src={currentPhoto || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-2xl font-bold">
              {userName?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                type="button" 
                onClick={handleButtonClick}
                disabled={uploadingPhoto || !userId}
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploadingPhoto ? "Uploading..." : currentPhoto ? "Replace Photo" : "Upload Photo"}
              </Button>
              <input
                ref={fileInputRef}
                id="photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto || !userId}
              />
              {currentPhoto && (
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={handlePhotoDelete}
                  disabled={uploadingPhoto}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="photo-visibility"
                checked={!photoVisible}
                onCheckedChange={handleVisibilityToggle}
                disabled={!currentPhoto}
              />
              <Label htmlFor="photo-visibility" className="cursor-pointer flex items-center gap-2">
                {photoVisible ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
                <span>Hide my profile photo from others</span>
              </Label>
            </div>
            {uploadingPhoto && (
              <p className="text-sm text-muted-foreground">Uploading...</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProfilePhotoManager;
