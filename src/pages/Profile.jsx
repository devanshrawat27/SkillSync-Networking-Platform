import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Save, Users, GraduationCap } from "lucide-react";
import SkillsInput from "@/components/SkillsInput";
import ProfilePhotoManager from "@/components/ProfilePhotoManager";
import AppLayout from "@/components/layouts/AppLayout";

const Profile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [connectionsCount, setConnectionsCount] = useState(0);
  const [userId, setUserId] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoVisible, setProfilePhotoVisible] = useState(true);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    department: "",
    year: "",
    bio: "",
    domain: "",
    github_url: "",
    linkedin_url: "",
    leetcode_url: "",
    codeforces_url: "",
    portfolio_url: "",
    skills: [],
    interests: [],
    is_mentor: false,
    mentor_expertise: [],
    mentor_bio: "",
    mentor_linkedin: "",
    years_experience: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setUserId(session.user.id);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    if (error) {
      toast.error("Error loading profile");
      setLoading(false);
      return;
    }

    // Load connections count
    const { count } = await supabase
      .from("connections")
      .select("*", { count: 'exact', head: true })
      .eq("status", "accepted")
      .or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`);

    setConnectionsCount(count || 0);

    if (data) {
      setProfilePhoto(data.profile_photo);
      setProfilePhotoVisible(data.profile_photo_visible ?? true);
      setProfile({
        name: data.name || "",
        email: data.email || "",
        department: data.department || "",
        year: data.year?.toString() || "",
        bio: data.bio || "",
        domain: data.domain || "",
        github_url: data.github_url || "",
        linkedin_url: data.linkedin_url || "",
        leetcode_url: data.leetcode_url || "",
        codeforces_url: data.codeforces_url || "",
        portfolio_url: data.portfolio_url || "",
        skills: data.skills || [],
        interests: data.interests || [],
        is_mentor: data.is_mentor || false,
        mentor_expertise: data.mentor_expertise || [],
        mentor_bio: data.mentor_bio || "",
        mentor_linkedin: data.mentor_linkedin || "",
        years_experience: data.years_experience?.toString() || "",
      });
    }
    
    setLoading(false);
  };

  const handleSave = async () => {
    // Validate required fields
    if (!profile.name || profile.name.trim() === "") {
      toast.error("Full Name is required");
      setSaving(false);
      return;
    }

    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      setSaving(false);
      return;
    }

    // Build update object with only basic fields first
    const updateData = {
      name: profile.name,
      department: profile.department || null,
      year: profile.year ? parseInt(profile.year) : null,
      bio: profile.bio || null,
      domain: profile.domain || null,
      github_url: profile.github_url || null,
      linkedin_url: profile.linkedin_url || null,
      leetcode_url: profile.leetcode_url || null,
      codeforces_url: profile.codeforces_url || null,
      portfolio_url: profile.portfolio_url || null,
      skills: profile.skills || [],
      interests: profile.interests || [],
    };

    // Add mentor fields only if is_mentor is true
    if (profile.is_mentor) {
      updateData.is_mentor = true;
      updateData.mentor_expertise = profile.mentor_expertise || [];
      updateData.mentor_bio = profile.mentor_bio || null;
      updateData.mentor_linkedin = profile.mentor_linkedin || null;
      updateData.years_experience = profile.years_experience ? parseInt(profile.years_experience) : null;
    } else {
      updateData.is_mentor = false;
    }

    const { error, data } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("user_id", session.user.id)
      .select();

    if (error) {
      console.error("Profile update error:", error);
      if (error.message?.includes('mentor') || error.message?.includes('column') || error.code === '42703') {
        // Remove mentor fields and try again
        const basicFields = { ...updateData };
        delete basicFields.is_mentor;
        delete basicFields.mentor_expertise;
        delete basicFields.mentor_bio;
        delete basicFields.mentor_linkedin;
        delete basicFields.years_experience;
        
        const { error: retryError } = await supabase
          .from("profiles")
          .update(basicFields)
          .eq("user_id", session.user.id);

        if (retryError) {
          toast.error(`Error saving profile: ${retryError.message}`);
          console.error("Retry error:", retryError);
        } else {
          toast.success("Profile updated! (Mentor fields will be available after migration)");
        }
      } else {
        toast.error(`Error saving profile: ${error.message || 'Unknown error'}`);
      }
      setSaving(false);
      return;
    }

    toast.success("Profile updated successfully!");
    if (searchParams.get("setup") === "1") {
      navigate("/dashboard");
      return;
    }
    setSaving(false);
  };

  const handleChange = (e) => {
    setProfile(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSkillsChange = (skills) => {
    setProfile(prev => ({ ...prev, skills }));
  };

  const handleInterestsChange = (interests) => {
    setProfile(prev => ({ ...prev, interests }));
  };

  const handleMentorExpertiseChange = (expertise) => {
    setProfile(prev => ({ ...prev, mentor_expertise: expertise }));
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }} className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--primary)' }}></div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }} className="p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {searchParams.get("setup") === "1" ? "Complete Your Profile" : "Edit Profile"}
            </h1>
            <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-4">
              {searchParams.get("setup") === "1"
                ? "Finish your basic details first so discovery, projects, and matching work properly."
                : "Update your information to help teammates find you"}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)', borderColor: 'var(--primary)', borderWidth: '1px', color: 'var(--primary)' }} className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {connectionsCount} Connections
              </Badge>
              {profile.is_mentor && (
                <Badge style={{ backgroundColor: 'var(--primary)', color: '#fff' }} className="flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" />
                  Mentor
                </Badge>
              )}
            </div>
          </div>

          {/* Photo Manager */}
          <ProfilePhotoManager
            profilePhoto={profilePhoto}
            profilePhotoVisible={profilePhotoVisible}
            userName={profile.name}
            userId={userId}
            onPhotoUpdate={loadProfile}
          />

          {/* Form Section */}
          <div style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }} className="border rounded-lg p-6 space-y-6">
            {/* Basic Info */}
            <div>
              <h2 style={{ color: 'var(--text-primary)' }} className="text-xl font-semibold mb-4">Basic Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name" style={{ color: 'var(--text-primary)' }} className="font-medium">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="mt-2"
                    style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <Label htmlFor="email" style={{ color: 'var(--text-primary)' }} className="font-medium">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    value={profile.email}
                    disabled
                    className="mt-2"
                    style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-4">
                <div>
                  <Label htmlFor="department" style={{ color: 'var(--text-primary)' }} className="font-medium">Department/Branch</Label>
                  <Input
                    id="department"
                    name="department"
                    value={profile.department}
                    onChange={handleChange}
                    placeholder="Computer Science"
                    className="mt-2"
                    style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <Label htmlFor="year" style={{ color: 'var(--text-primary)' }} className="font-medium">Year</Label>
                  <Input
                    id="year"
                    name="year"
                    type="number"
                    value={profile.year}
                    onChange={handleChange}
                    placeholder="2"
                    className="mt-2"
                    style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>
            </div>

            {/* Bio & Domain */}
            <div style={{ borderTopColor: 'var(--border)', borderTopWidth: '1px' }} className="pt-6">
              <h2 style={{ color: 'var(--text-primary)' }} className="text-xl font-semibold mb-4">About You</h2>
              <div>
                <Label htmlFor="bio" style={{ color: 'var(--text-primary)' }} className="font-medium">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself..."
                  className="mt-2"
                  rows={4}
                  style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>

              <div className="mt-4">
                <Label htmlFor="domain" style={{ color: 'var(--text-primary)' }} className="font-medium">Domain/Interest Area</Label>
                <Input
                  id="domain"
                  name="domain"
                  value={profile.domain}
                  onChange={handleChange}
                  placeholder="Web Development, AI/ML, etc."
                  className="mt-2"
                  style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            {/* Skills & Interests */}
            <div style={{ borderTopColor: 'var(--border)', borderTopWidth: '1px' }} className="pt-6">
              <h2 style={{ color: 'var(--text-primary)' }} className="text-xl font-semibold mb-4">Skills & Interests</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="skills" style={{ color: 'var(--text-primary)' }} className="font-medium">Skills</Label>
                  <div className="mt-2">
                    <SkillsInput 
                      skills={profile.skills}
                      onChange={handleSkillsChange}
                      placeholder="Add a skill (e.g., React, Python)"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="interests" style={{ color: 'var(--text-primary)' }} className="font-medium">Interests</Label>
                  <div className="mt-2">
                    <SkillsInput 
                      skills={profile.interests}
                      onChange={handleInterestsChange}
                      placeholder="Add an interest (e.g., Web Development)"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Mentor Section */}
            <div style={{ borderTopColor: 'var(--border)', borderTopWidth: '1px' }} className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Label style={{ color: 'var(--text-primary)' }} className="text-lg font-semibold">Apply as Mentor</Label>
                  <p style={{ color: 'var(--text-secondary)' }} className="text-xs mt-1">
                    Enable this to become a mentor and help students with guidance
                  </p>
                </div>
                <Switch
                  id="is_mentor"
                  checked={profile.is_mentor}
                  onCheckedChange={(checked) => setProfile(prev => ({ ...prev, is_mentor: checked }))}
                />
              </div>

              {profile.is_mentor && (
                <div style={{ borderLeftColor: 'rgba(79, 70, 229, 0.3)', borderLeftWidth: '2px' }} className="pl-4 space-y-4">
                  <div>
                    <Label htmlFor="mentor_expertise" style={{ color: 'var(--text-primary)' }} className="font-medium">Mentor Expertise *</Label>
                    <div className="mt-2">
                      <SkillsInput 
                        skills={profile.mentor_expertise}
                        onChange={handleMentorExpertiseChange}
                        placeholder="Add expertise areas (e.g., Web Development, AI/ML)"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="mentor_bio" style={{ color: 'var(--text-primary)' }} className="font-medium">Mentor Bio</Label>
                    <Textarea
                      id="mentor_bio"
                      name="mentor_bio"
                      value={profile.mentor_bio}
                      onChange={handleChange}
                      placeholder="Tell students about your mentoring experience and approach..."
                      className="mt-2"
                      rows={3}
                      style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="mentor_linkedin" style={{ color: 'var(--text-primary)' }} className="font-medium">Mentor LinkedIn URL</Label>
                      <Input
                        id="mentor_linkedin"
                        name="mentor_linkedin"
                        value={profile.mentor_linkedin}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/in/username"
                        className="mt-2"
                        style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                      />
                    </div>

                    <div>
                      <Label htmlFor="years_experience" style={{ color: 'var(--text-primary)' }} className="font-medium">Years of Experience</Label>
                      <Input
                        id="years_experience"
                        name="years_experience"
                        type="number"
                        value={profile.years_experience}
                        onChange={handleChange}
                        placeholder="5"
                        className="mt-2"
                        min="0"
                        style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Social Links */}
            <div style={{ borderTopColor: 'var(--border)', borderTopWidth: '1px' }} className="pt-6">
              <h2 style={{ color: 'var(--text-primary)' }} className="text-xl font-semibold mb-4">Social Links</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="github_url" style={{ color: 'var(--text-primary)' }} className="font-medium">GitHub URL</Label>
                  <Input
                    id="github_url"
                    name="github_url"
                    value={profile.github_url}
                    onChange={handleChange}
                    placeholder="https://github.com/username"
                    className="mt-2"
                    style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <Label htmlFor="linkedin_url" style={{ color: 'var(--text-primary)' }} className="font-medium">LinkedIn URL</Label>
                  <Input
                    id="linkedin_url"
                    name="linkedin_url"
                    value={profile.linkedin_url}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/username"
                    className="mt-2"
                    style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <Label htmlFor="leetcode_url" style={{ color: 'var(--text-primary)' }} className="font-medium">LeetCode URL</Label>
                  <Input
                    id="leetcode_url"
                    name="leetcode_url"
                    value={profile.leetcode_url}
                    onChange={handleChange}
                    placeholder="https://leetcode.com/username"
                    className="mt-2"
                    style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <Label htmlFor="codeforces_url" style={{ color: 'var(--text-primary)' }} className="font-medium">Codeforces URL</Label>
                  <Input
                    id="codeforces_url"
                    name="codeforces_url"
                    value={profile.codeforces_url}
                    onChange={handleChange}
                    placeholder="https://codeforces.com/profile/username"
                    className="mt-2"
                    style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <Label htmlFor="portfolio_url" style={{ color: 'var(--text-primary)' }} className="font-medium">Portfolio URL</Label>
                  <Input
                    id="portfolio_url"
                    name="portfolio_url"
                    value={profile.portfolio_url}
                    onChange={handleChange}
                    placeholder="https://yourportfolio.com"
                    className="mt-2"
                    style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <Button 
                  onClick={handleSave}
                  disabled={saving}
                  style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button 
                  onClick={() => navigate("/dashboard")}
                  variant="outline"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
