import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/components/layouts/AppLayout';

const Teams = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [myTeams, setMyTeams] = useState([]);
  const [discoveredTeams, setDiscoveredTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    domain: '',
    skills_needed: [],
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }
    setUser(session.user);
    loadTeams(session.user.id);
  };

  const loadTeams = async (userId) => {
    try {
      const [{ data: ownedProjects, error: ownedError }, { data: memberships, error: membershipError }, { data: publicProjects, error: publicError }] = await Promise.all([
        supabase.from('projects').select('*').eq('creator_id', userId).order('created_at', { ascending: false }),
        supabase.from('project_members').select('project_id, status').eq('user_id', userId).eq('status', 'accepted'),
        supabase.from('projects').select('*').eq('is_public', true).neq('creator_id', userId).order('created_at', { ascending: false }).limit(10),
      ]);

      if (ownedError || membershipError || publicError) {
        throw ownedError || membershipError || publicError;
      }

      const memberProjectIds = (memberships || []).map((membership) => membership.project_id);
      let memberProjects = [];

      if (memberProjectIds.length > 0) {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .in('id', memberProjectIds)
          .order('created_at', { ascending: false });

        if (error) throw error;
        memberProjects = data || [];
      }

      const joinedIds = new Set([
        ...(ownedProjects || []).map((project) => project.id),
        ...memberProjectIds,
      ]);

      setMyTeams([...(ownedProjects || []), ...memberProjects]);
      setDiscoveredTeams((publicProjects || []).filter((project) => !joinedIds.has(project.id)));
    } catch (error) {
      console.error('Error loading teams:', error);
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!formData.name.trim()) {
      toast.error('Team name is required');
      return;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .insert({
          title: formData.name,
          description: formData.description,
          domain: formData.domain,
          required_skills: formData.skills_needed,
          creator_id: user.id,
          is_public: true,
        });

      if (error) throw error;

      toast.success('Team created successfully!');
      setFormData({ name: '', description: '', domain: '', skills_needed: [] });
      setIsCreateDialogOpen(false);
      loadTeams(user.id);
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error('Failed to create team');
    }
  };

  const TeamCard = ({ team }) => (
    <Card style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }} className="p-5 border hover:border-[var(--border-light)] transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 style={{ color: 'var(--text-primary)' }} className="text-lg font-semibold">{team.title}</h3>
          {team.domain && (
            <Badge style={{ backgroundColor: 'var(--primary)', color: 'white' }} className="mt-2">
              {team.domain}
            </Badge>
          )}
        </div>
      </div>
      <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-4 line-clamp-2">{team.description}</p>
      {team.required_skills && team.required_skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {team.required_skills.slice(0, 3).map((skill, idx) => (
            <Badge
              key={idx}
              style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)' }}
              className="border border-[var(--primary)]"
            >
              {skill}
            </Badge>
          ))}
          {team.required_skills.length > 3 && (
            <Badge style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
              +{team.required_skills.length - 3}
            </Badge>
          )}
        </div>
      )}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => navigate(`/projects/${team.id}`)}
      >
        {team.creator_id === user?.id ? 'View Team' : 'Request to Join'}
      </Button>
    </Card>
  );

  return (
    <AppLayout>
      <div className="min-h-screen bg-[var(--bg-primary)] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 style={{ color: 'var(--text-primary)' }} className="text-3xl font-bold flex items-center gap-2">
              <Users className="w-8 h-8" />
              Teams
            </h1>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button
                style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                className="hover:opacity-90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a New Team</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label style={{ color: 'var(--text-primary)' }} className="block text-sm font-medium mb-1">
                    Team Name
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="My Awesome Team"
                    className="bg-[var(--bg-primary)] border-[var(--border)]"
                  />
                </div>
                <div>
                  <label style={{ color: 'var(--text-primary)' }} className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What is your team about?"
                    className="bg-[var(--bg-primary)] border-[var(--border)] h-24"
                  />
                </div>
                <div>
                  <label style={{ color: 'var(--text-primary)' }} className="block text-sm font-medium mb-1">
                    Domain
                  </label>
                  <Select value={formData.domain} onValueChange={(value) => setFormData({ ...formData, domain: value })}>
                    <SelectTrigger className="bg-[var(--bg-primary)] border-[var(--border)]">
                      <SelectValue placeholder="Select a domain" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="web">Web Development</SelectItem>
                      <SelectItem value="mobile">Mobile Development</SelectItem>
                      <SelectItem value="aiml">AI/ML</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="devops">DevOps</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleCreateTeam}
                  style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                  className="w-full hover:opacity-90"
                >
                  Create Team
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading teams...</p>
        ) : (
          <Tabs defaultValue="my-teams" className="space-y-6">
            <TabsList className="bg-[var(--bg-card)] border border-[var(--border)]">
              <TabsTrigger value="my-teams">My Teams</TabsTrigger>
              <TabsTrigger value="discover">Discover Teams</TabsTrigger>
            </TabsList>

            <TabsContent value="my-teams" className="space-y-4">
              {myTeams.length === 0 ? (
                <div className="text-center py-12">
                  <FolderOpen className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4 opacity-30" />
                  <p style={{ color: 'var(--text-muted)' }} className="text-lg">No teams yet</p>
                  <p style={{ color: 'var(--text-muted)' }} className="text-sm mt-2">Create your first team to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myTeams.map((team) => (
                    <TeamCard key={team.id} team={team} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="discover" className="space-y-4">
              {discoveredTeams.length === 0 ? (
                <div className="text-center py-12">
                  <FolderOpen className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4 opacity-30" />
                  <p style={{ color: 'var(--text-muted)' }} className="text-lg">No teams to discover</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {discoveredTeams.map((team) => (
                    <TeamCard key={team.id} team={team} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
      </div>
    </AppLayout>
  );
};

export default Teams;
