import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SkillsInput from "@/components/SkillsInput";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AppLayout from "@/components/layouts/AppLayout";

const NewProject = () => {
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState("");
  const [skills, setSkills] = useState([]);
  const [maxTeamSize, setMaxTeamSize] = useState(5);
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setCurrentUserId(session.user.id);
    })();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!currentUserId) return;

    setSubmitting(true);
    const { error } = await supabase.from("projects").insert({
      creator_id: currentUserId,
      title: title.trim(),
      description: description.trim() || null,
      domain: domain || null,
      required_skills: skills,
      max_team_size: Number(maxTeamSize) || 5,
      is_public: isPublic,
    });

    setSubmitting(false);
    if (error) {
      toast.error("Failed to create project");
      console.error(error);
      return;
    }

    toast.success("Project created");
    navigate("/dashboard");
  };

  return (
    <AppLayout>
      <section className="p-6" style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
        <div className="max-w-3xl mx-auto">
          <Card className="glass-card p-8">
            <h1 className="text-3xl font-bold mb-6">Create New Project</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="e.g., Smart Attendance System" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Briefly describe your project idea" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>

              <div>
                <Label>Domain</Label>
                <Select value={domain} onValueChange={setDomain}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a domain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Web Development">Web Development</SelectItem>
                    <SelectItem value="Mobile Apps">Mobile Apps</SelectItem>
                    <SelectItem value="AI/ML">AI/ML</SelectItem>
                    <SelectItem value="Data Science">Data Science</SelectItem>
                    <SelectItem value="Blockchain">Blockchain</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Required Skills</Label>
                <div className="mt-2">
                  <SkillsInput 
                    skills={skills}
                    onChange={setSkills}
                    placeholder="Add a skill (e.g., React, Python)"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="maxTeamSize">Max Team Size</Label>
                <Input id="maxTeamSize" type="number" value={maxTeamSize} onChange={(e) => setMaxTeamSize(Number(e.target.value))} min="1" max="20" />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isPublic">Make it Public</Label>
                <Switch
                  id="isPublic"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-primary to-accent text-white"
                >
                  {submitting ? "Creating..." : "Create Project"}
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </section>
    </AppLayout>
  );
};

export default NewProject;
