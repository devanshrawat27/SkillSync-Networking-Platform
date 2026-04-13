import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Search, Github, Linkedin, Code, Check, Clock, UserPlus, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { ProfileModal } from "@/components/ProfileModal";
import AppLayout from "@/components/layouts/AppLayout";

const FindTeammates = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [filteredMentors, setFilteredMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [domainFilter, setDomainFilter] = useState("all");
  const [connectionStatuses, setConnectionStatuses] = useState({});
  const [activeTab, setActiveTab] = useState("teammates");
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    checkAuthAndLoadProfiles();
  }, []);

  useEffect(() => {
    let filtered = activeTab === "teammates" ? profiles : mentors;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(profile => {
        const searchLower = searchTerm.toLowerCase();
        return (
          profile.name?.toLowerCase().includes(searchLower) ||
          profile.department?.toLowerCase().includes(searchLower) ||
          profile.domain?.toLowerCase().includes(searchLower) ||
          profile.skills?.some(skill => skill.toLowerCase().includes(searchLower)) ||
          (activeTab === "mentors" && profile.mentor_expertise?.some(exp => exp.toLowerCase().includes(searchLower)))
        );
      });
    }

    // Apply department filter
    if (departmentFilter !== "all") {
      filtered = filtered.filter(profile => profile.department === departmentFilter);
    }

    // Apply domain filter
    if (domainFilter !== "all") {
      filtered = filtered.filter(profile => profile.domain === domainFilter);
    }

    if (activeTab === "teammates") {
      setFilteredProfiles(filtered);
    } else {
      setFilteredMentors(filtered);
    }
  }, [searchTerm, profiles, mentors, departmentFilter, domainFilter, activeTab]);

  const checkAuthAndLoadProfiles = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setCurrentUserId(session.user.id);

    // Fetch all profiles except current user
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .neq("user_id", session.user.id);

    if (error) {
      toast.error("Error loading profiles");
      setLoading(false);
      return;
    }

    // Fetch connection statuses
    const { data: connections } = await supabase
      .from("connections")
      .select("receiver_id, sender_id, status")
      .or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`);

    const statuses = {};
    connections?.forEach(conn => {
      const otherUserId = conn.sender_id === session.user.id ? conn.receiver_id : conn.sender_id;
      statuses[otherUserId] = conn.status;
    });
    setConnectionStatuses(statuses);

    // Separate teammates and mentors
    const teammates = (data || []).filter(p => !p.is_mentor);
    const mentorsList = (data || []).filter(p => p.is_mentor === true);

    setProfiles(teammates);
    setMentors(mentorsList);
    setFilteredProfiles(teammates);
    setFilteredMentors(mentorsList);
    setLoading(false);
  };

  const handleConnect = async (userId) => {
    // Check if connection already exists
    const { data: existing } = await supabase
      .from("connections")
      .select("*")
      .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${currentUserId})`)
      .single();

    if (existing) {
      toast.error("Connection request already exists");
      return;
    }

    const { error } = await supabase
      .from("connections")
      .insert({
        sender_id: currentUserId,
        receiver_id: userId,
        status: "pending"
      });

    if (error) {
      toast.error("Error sending connection request");
      return;
    }

    setConnectionStatuses(prev => ({ ...prev, [userId]: "pending" }));
    toast.success("Connection request sent!");
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }} className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--primary)' }}></div>
      </div>
    );
  }

  const allProfiles = activeTab === "teammates" ? profiles : mentors;
  const departments = Array.from(new Set(allProfiles.map(p => p.department).filter(Boolean)));
  const domains = Array.from(new Set(allProfiles.map(p => p.domain).filter(Boolean)));

  const ProfileCard = ({ profile }) => {
    const status = connectionStatuses[profile.user_id];
    
    return (
      <div 
        key={profile.id}
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        className="border rounded-lg p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group cursor-pointer"
      >
        <div 
          onClick={() => {
            setSelectedProfile(profile);
            setIsModalOpen(true);
          }}
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0">
              <ProfileAvatar 
                profile={profile} 
                currentUserId={currentUserId} 
                size="lg"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 style={{ color: 'var(--text-primary)' }} className="text-lg font-semibold truncate">
                  {profile.name || "Unknown"}
                </h3>
                {profile.is_mentor && (
                  <Badge style={{ backgroundColor: 'var(--primary)', color: '#fff' }} className="flex-shrink-0">
                    <GraduationCap className="w-3 h-3" />
                  </Badge>
                )}
              </div>
              {profile.department && (
                <p style={{ color: 'var(--primary)' }} className="text-sm font-medium">{profile.department}</p>
              )}
              {profile.year && (
                <p style={{ color: 'var(--text-muted)' }} className="text-xs">Year {profile.year}</p>
              )}
            </div>
          </div>

          {profile.bio && (
            <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-3 line-clamp-2">{profile.bio}</p>
          )}

          {profile.domain && (
            <div className="mb-3">
              <Badge style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)', borderColor: 'var(--primary)', borderWidth: '1px', color: 'var(--primary)' }}>
                {profile.domain}
              </Badge>
            </div>
          )}

          {profile.skills && profile.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {profile.skills.slice(0, 3).map((skill, idx) => (
                <Badge key={idx} style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)', borderWidth: '1px', color: 'var(--text-secondary)' }}>
                  {skill}
                </Badge>
              ))}
              {profile.skills.length > 3 && (
                <Badge style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)', borderWidth: '1px', color: 'var(--text-secondary)' }}>
                  +{profile.skills.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {status === "accepted" ? (
            <Button style={{ backgroundColor: 'var(--success)', color: '#fff' }} className="flex-1 cursor-default">
              <Check className="w-4 h-4 mr-2" />
              Connected
            </Button>
          ) : status === "pending" ? (
            <Button style={{ backgroundColor: 'var(--warning)', color: '#000' }} className="flex-1 cursor-default">
              <Clock className="w-4 h-4 mr-2" />
              Pending
            </Button>
          ) : (
            <Button 
              style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
              className="flex-1"
              onClick={() => handleConnect(profile.user_id)}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Connect
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <AppLayout>
      <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }} className="p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 style={{ color: 'var(--text-primary)' }} className="text-3xl font-bold mb-2">
              {activeTab === "teammates" ? "Find Teammates" : "Find Mentors"}
            </h1>
            <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
              {activeTab === "teammates" 
                ? "Discover and connect with talented students" 
                : "Learn from experienced mentors"}
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList style={{ backgroundColor: 'var(--bg-card)' }} className="grid grid-cols-2 w-full border border-b">
              <TabsTrigger value="teammates">Teammates</TabsTrigger>
              <TabsTrigger value="mentors">Mentors</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Filters */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              <Input
                placeholder="Search by name, skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>

            {departments.length > 0 && (
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {domains.length > 0 && (
              <Select value={domainFilter} onValueChange={setDomainFilter}>
                <SelectTrigger style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                  <SelectValue placeholder="All Domains" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Domains</SelectItem>
                  {domains.map(domain => (
                    <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Profiles Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(activeTab === "teammates" ? filteredProfiles : filteredMentors).length === 0 ? (
              <div className="col-span-full text-center py-12">
                <User className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                <p style={{ color: 'var(--text-muted)' }} className="text-lg">
                  No {activeTab} found matching your criteria
                </p>
              </div>
            ) : (
              (activeTab === "teammates" ? filteredProfiles : filteredMentors).map(profile => (
                <ProfileCard key={profile.user_id} profile={profile} />
              ))
            )}
          </div>
        </div>
      </div>

      <ProfileModal 
        profile={selectedProfile}
        currentUserId={currentUserId}
        connectionStatus={selectedProfile ? connectionStatuses[selectedProfile.user_id] : undefined}
        onConnect={handleConnect}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </AppLayout>
  );
};

export default FindTeammates;
