import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getProfilePhotoUrl } from "@/lib/profile-photo";

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-12 h-12 text-base",
  lg: "w-16 h-16 text-2xl",
  xl: "w-24 h-24 text-3xl",
};

export function ProfileAvatar({ profile, currentUserId, size = "md", className = "" }) {
  const photoUrl = getProfilePhotoUrl(profile, currentUserId, profile.user_id) || profile.profile_photo || null;
  const displayName = profile.name || profile.email || "U";
  const initial = displayName[0]?.toUpperCase() || "U";

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage src={photoUrl || undefined} alt={displayName} />
      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold">
        {initial}
      </AvatarFallback>
    </Avatar>
  );
}
