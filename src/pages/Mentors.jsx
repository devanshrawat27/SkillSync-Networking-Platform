import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AppLayout from "@/components/layouts/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Linkedin, Mail, Star, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { ProfileModal } from "@/components/ProfileModal";

const Mentors = () => {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    loadMentors();
  }, []);

  const loadMentors = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      setCurrentUserId(session.user.id);
    }

    // Fetch all mentors where is_mentor = true
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("is_mentor", true);

    if (error) {
      toast.error("Error loading mentors");
      setLoading(false);
      return;
    }

    setMentors(data || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const content = (
    <>
      <section className={currentUserId ? "py-10 px-6" : "pt-32 pb-20 px-6"}>
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h1 className="text-5xl font-bold mb-6">
              Connect with <span className="gradient-text">Mentors</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Get guidance from experienced faculty members and senior students. 
              Whether you need help with a project, research advice, or career guidance, our mentors are here to help.
            </p>
          </div>

          {/* Mentors Grid */}
          {mentors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">No mentors available at the moment.</p>
              <p className="text-muted-foreground">Check back later or become a mentor yourself!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {mentors.map((mentor) => (
                <Card 
                  key={mentor.id}
                  className="glass-card p-8 cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300 rounded-xl border border-border/50"
                  onClick={() => {
                    setSelectedProfile(mentor);
                    setIsModalOpen(true);
                  }}
                >
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Avatar */}
                    <ProfileAvatar 
                      profile={mentor} 
                      currentUserId={currentUserId} 
                      size="xl"
                      className="flex-shrink-0"
                    />

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-2xl font-bold">{mentor.name || "Unknown Mentor"}</h3>
                        <Badge variant="default" className="bg-gradient-to-r from-primary to-accent">
                          <GraduationCap className="w-3 h-3 mr-1" />
                          Mentor
                        </Badge>
                      </div>
                      
                      {mentor.department && (
                        <p className="text-primary font-semibold mb-2">{mentor.department}</p>
                      )}

                      {mentor.years_experience && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {mentor.years_experience} years of experience
                        </p>
                      )}
                      
                      {mentor.mentor_expertise && mentor.mentor_expertise.length > 0 && (
                        <div className="flex items-start gap-2 mb-3">
                          <Star className="w-4 h-4 text-highlight fill-highlight mt-0.5 flex-shrink-0" />
                          <div className="flex flex-wrap gap-2">
                            {mentor.mentor_expertise.map((exp, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {exp}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {(mentor.mentor_bio || mentor.bio) && (
                        <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                          {mentor.mentor_bio || mentor.bio}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {mentor.email && (
                          <Button 
                            size="sm" 
                            className="bg-gradient-to-r from-primary to-accent text-white"
                            asChild
                          >
                            <a href={`mailto:${mentor.email}`}>
                              <Mail className="w-4 h-4 mr-2" />
                              Contact
                            </a>
                          </Button>
                        )}
                        {mentor.mentor_linkedin && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            asChild
                          >
                            <a href={mentor.mentor_linkedin} target="_blank" rel="noopener noreferrer">
                              <Linkedin className="w-4 h-4 mr-2" />
                              LinkedIn
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <ProfileModal 
        profile={selectedProfile}
        currentUserId={currentUserId}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );

  if (currentUserId) {
    return <AppLayout>{content}</AppLayout>;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      {content}
      <Footer />
    </div>
  );
};

export default Mentors;
