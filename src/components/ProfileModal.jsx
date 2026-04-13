import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfileAvatar } from "./ProfileAvatar";
import { Github, Linkedin, Code, UserPlus, Check, Clock, MessageCircle, GraduationCap } from "lucide-react";
import { useChat } from "@/components/chat/ChatContext";

export function ProfileModal({ 
  profile, 
  currentUserId, 
  connectionStatus, 
  onConnect, 
  open, 
  onOpenChange 
}) {
  const { openChatWith, setOpen } = useChat();

  if (!profile) return null;

  const handleMessage = () => {
    if (profile.user_id) {
      openChatWith(profile.user_id);
      setOpen(true);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Profile Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-start gap-6">
            <ProfileAvatar 
              profile={profile} 
              currentUserId={currentUserId} 
              size="xl"
            />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">{profile.name || "Unknown User"}</h2>
                {profile.is_mentor && (
                  <Badge variant="default" className="bg-gradient-to-r from-primary to-accent">
                    <GraduationCap className="w-3 h-3 mr-1" />
                    Mentor
                  </Badge>
                )}
              </div>
              {profile.department && (
                <p className="text-muted-foreground">{profile.department}</p>
              )}
              {profile.year && (
                <p className="text-sm text-muted-foreground">Year {profile.year}</p>
              )}
              {profile.years_experience && (
                <p className="text-sm text-muted-foreground">{profile.years_experience} years of experience</p>
              )}
            </div>
          </div>

          {/* Bio */}
          {(profile.bio || profile.mentor_bio) && (
            <div>
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-muted-foreground">{profile.mentor_bio || profile.bio}</p>
            </div>
          )}

          {/* Domain */}
          {profile.domain && (
            <div>
              <h3 className="font-semibold mb-2">Domain</h3>
              <Badge>{profile.domain}</Badge>
            </div>
          )}

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, idx) => (
                  <Badge key={idx} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Mentor Expertise */}
          {profile.mentor_expertise && profile.mentor_expertise.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {profile.mentor_expertise.map((exp, idx) => (
                  <Badge key={idx} variant="secondary">{exp}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, idx) => (
                  <Badge key={idx} variant="outline">{interest}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          <div className="flex gap-2">
            {profile.github_url && (
              <a href={profile.github_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </Button>
              </a>
            )}
            {(profile.mentor_linkedin || profile.linkedin_url) && (
              <a href={profile.mentor_linkedin || profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <Linkedin className="w-4 h-4 mr-2" />
                  LinkedIn
                </Button>
              </a>
            )}
            {profile.leetcode_url && (
              <a href={profile.leetcode_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <Code className="w-4 h-4 mr-2" />
                  LeetCode
                </Button>
              </a>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            {connectionStatus === "accepted" ? (
              <>
                <Button 
                  onClick={handleMessage}
                  className="flex-1 bg-gradient-to-r from-primary to-accent text-white"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message
                </Button>
                <Button variant="outline" disabled>
                  <Check className="w-4 h-4 mr-2" />
                  Connected
                </Button>
              </>
            ) : connectionStatus === "pending" ? (
              <Button variant="outline" disabled className="w-full">
                <Clock className="w-4 h-4 mr-2" />
                Pending
              </Button>
            ) : (
              onConnect && (
                <Button 
                  onClick={() => onConnect(profile.user_id)}
                  className="flex-1 bg-gradient-to-r from-primary to-accent text-white"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Connect
                </Button>
              )
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
