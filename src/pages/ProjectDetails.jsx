import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, UserPlus, X } from "lucide-react";
import AppLayout from "@/components/layouts/AppLayout";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [project, setProject] = useState(null);
  const [creator, setCreator] = useState(null);
  const [members, setMembers] = useState([]);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [myMembership, setMyMembership] = useState("none");
  const [loading, setLoading] = useState(true);

  const isOwner = useMemo(() => userId && project && project.creator_id === userId, [userId, project]);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || "");
      await load();
    })();
  }, [id]);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    const { data: p, error } = await supabase.from("projects").select("*").eq("id", id).single();
    if (error || !p) {
      toast.error("Project not found");
      navigate("/projects");
      return;
    }
    setProject(p);

    const [{ data: creatorProfile }, { data: memberRows }, { data: pendingRows }, { data: myRow }] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", p.creator_id).single(),
      supabase.from("project_members").select("user_id, status").eq("project_id", p.id).eq("status", "accepted"),
      supabase.from("project_members").select("user_id, status, id").eq("project_id", p.id).eq("status", "pending"),
      supabase.from("project_members").select("status").eq("project_id", p.id).eq("user_id", (await supabase.auth.getUser()).data.user?.id || "").maybeSingle?.(),
    ]);

    setCreator(creatorProfile);

    const memberIds = (memberRows || []).map(r => r.user_id);
    const pendingIds = (pendingRows || []).map(r => r.user_id);
    const unique = Array.from(new Set([...memberIds, ...pendingIds]));
    let profilesMap = {};
    if (unique.length) {
      const { data: profs } = await supabase.from("profiles").select("*").in("user_id", unique);
      (profs || []).forEach(pf => { profilesMap[pf.user_id] = pf; });
    }
    setMembers((memberRows || []).map(r => profilesMap[r.user_id]).filter(Boolean));
    setPendingMembers((pendingRows || []).map(r => ({ id: r.id, profile: profilesMap[r.user_id] })).filter(Boolean));

    if (p.creator_id === ((await supabase.auth.getUser()).data.user?.id || "")) {
      setMyMembership("owner");
    } else if (myRow && Array.isArray(myRow) ? myRow.length !== 0 : myRow) {
      const row = Array.isArray(myRow) ? myRow[0] : myRow;
      setMyMembership(row?.status || "none");
    } else {
      setMyMembership("none");
    }

    setLoading(false);
  };

  const handleRequestAction = async (memberId, action) => {
    // action: 'accepted' or 'rejected'
    const { error } = await supabase
      .from("project_members")
      .update({ status: action })
      .eq("id", memberId);
    if (!error) {
      toast.success(`Request ${action}`);
      await load(); // Refresh the list
    } else {
      toast.error("Something went wrong!");
    }
  };

  const requestJoin = async () => {
    if (!id || !userId) return;
    const { data: existing } = await supabase
      .from("project_members")
      .select("*")
      .eq("project_id", id)
      .eq("user_id", userId)
      .maybeSingle();
    if (existing) {
      toast.error("Request already exists");
      return;
    }

    const { error } = await supabase
      .from("project_members")
      .insert({
        project_id: id,
        user_id: userId,
        status: "pending",
      });

    if (error) {
      toast.error("Error sending request");
      return;
    }
    toast.success("Request sent!");
    await load();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <AppLayout>
      <div className="p-6" style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
        <div className="max-w-6xl mx-auto">
          <Button variant="ghost" onClick={() => navigate("/projects")} className="mb-6">
            ← Back to Projects
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="glass-card p-8 mb-8">
                <div className="mb-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h1 className="text-4xl font-bold">{project.title}</h1>
                    {project.domain && <Badge className="text-lg">{project.domain}</Badge>}
                  </div>
                  {project.description && (
                    <p className="text-lg text-muted-foreground">{project.description}</p>
                  )}
                </div>

                {project.required_skills && project.required_skills.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.required_skills.map((skill, idx) => (
                        <Badge key={idx} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Team Size</p>
                    <p className="font-semibold">{members.length} / {project.max_team_size}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Requests</p>
                    <p className="font-semibold">{pendingMembers.length}</p>
                  </div>
                </div>
              </Card>

              <Card className="glass-card p-8">
                <h2 className="text-2xl font-bold mb-4">Project Creator</h2>
                {creator && (
                  <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold">{creator.name}</p>
                      {creator.department && <p className="text-sm text-muted-foreground">{creator.department}</p>}
                    </div>
                  </div>
                )}
              </Card>
            </div>

            <div>
              {!isOwner && myMembership === "none" && (
                <Card className="glass-card p-6 mb-6">
                  <Button 
                    onClick={requestJoin}
                    className="w-full bg-gradient-to-r from-primary to-accent text-white"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Request to Join
                  </Button>
                </Card>
              )}

              {myMembership === "pending" && (
                <Card className="glass-card p-6 mb-6">
                  <p className="text-center text-muted-foreground">Request Pending</p>
                </Card>
              )}

              {(members.length > 0 || pendingMembers.length > 0) && (
                <Card className="glass-card p-6">
                  <h3 className="font-bold mb-4">Team Members</h3>
                  
                  {members.length > 0 && (
                    <div className="mb-6">
                      <p className="text-sm font-semibold text-muted-foreground mb-3">Accepted ({members.length})</p>
                      {members.map((member) => (
                        <div key={member.user_id} className="flex items-center gap-2 mb-2 p-2 rounded hover:bg-accent/50">
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-sm">{member.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {isOwner && pendingMembers.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-3">Pending ({pendingMembers.length})</p>
                      {pendingMembers.map((pm) => (
                        <div key={pm.id} className="flex items-center justify-between gap-2 mb-2 p-2 rounded hover:bg-accent/50">
                          <span className="text-sm flex-1">{pm.profile?.name}</span>
                          <div className="flex gap-1">
                            <button
                              className="px-2 py-1 bg-green-600 text-white rounded text-xs"
                              onClick={() => handleRequestAction(pm.id, 'accepted')}
                            >
                              Accept
                            </button>
                            <button
                              className="px-2 py-1 bg-red-600 text-white rounded text-xs"
                              onClick={() => handleRequestAction(pm.id, 'rejected')}
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProjectDetails;
