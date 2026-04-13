import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { 
  Users, 
  Search, 
  MessageCircle, 
  FileText, 
  Shield, 
  Sparkles,
  Target,
  UserPlus,
  Calendar,
  Award,
  Globe,
  Zap
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Users,
      title: "Complete Profile Creation",
      description: "Build your professional profile with skills, interests, portfolio links, coding handles, and achievements. Showcase what makes you unique.",
      color: "from-primary to-primary/60"
    },
    {
      icon: Search,
      title: "Smart Team Matching",
      description: "Advanced search and filtering to find teammates by skill, domain, department, year, or specific interests. Find your perfect match.",
      color: "from-secondary to-secondary/60"
    },
    {
      icon: UserPlus,
      title: "Connection System",
      description: "Send and accept connection requests to build your professional network. Stay connected with collaborators.",
      color: "from-primary to-accent"
    },
    {
      icon: Shield,
      title: "Verified Profiles",
      description: "University email verification ensures you're connecting with real students. Safe and secure networking.",
      color: "from-secondary to-primary"
    },
    {
      icon: Target,
      title: "Skill-Based Discovery",
      description: "Get discovered by teams looking for your specific skills. Your expertise is always visible to the right people.",
      color: "from-accent to-primary"
    },
    {
      icon: Calendar,
      title: "Availability Tracking",
      description: "Show when you're available for new projects. Make it easy for teams to know when you can contribute.",
      color: "from-primary to-secondary"
    },
    {
      icon: Award,
      title: "Achievement Showcase",
      description: "Highlight your hackathon wins, certifications, and notable projects. Let your accomplishments speak.",
      color: "from-secondary to-accent"
    },
    {
      icon: Globe,
      title: "Portfolio Integration",
      description: "Link your GitHub, LinkedIn, LeetCode, personal website, and more. One profile, all your work.",
      color: "from-accent to-secondary"
    },
    {
      icon: Sparkles,
      title: "Mentor Connect",
      description: "Access to experienced seniors and faculty members for guidance. Get help when you need it most.",
      color: "from-primary to-highlight"
    },
    {
      icon: Zap,
      title: "Real-time Notifications",
      description: "Stay updated on connection requests, project invites. Never miss an opportunity.",
      color: "from-secondary to-highlight"
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-slide-up">
            <h1 className="text-5xl font-bold mb-6">
              Powerful <span className="gradient-text">Features</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to find teammates, manage projects, and build your network. 
              Designed specifically for student collaboration.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="glass-card p-8 hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-xl border border-border/50">
                <div className={`inline-block p-3 rounded-lg bg-gradient-to-br ${feature.color} mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>

          {/* Coming Soon */}
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">More Features Coming Soon</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're constantly improving SkillSync to give you the best team collaboration experience.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Features;
