import { Link } from "react-router-dom";
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Sparkles, Users, Target, Zap, MessageCircle, Shield, ArrowRight } from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: Users,
      title: "Smart Matching",
      description: "Find teammates based on complementary skills, interests, and availability",
      color: "from-[#7C3AED] to-[#7C3AED]/60"
    },
    {
      icon: Target,
      title: "Project Discovery",
      description: "Browse and join exciting projects or create your own team",
      color: "from-[#2563EB] to-[#2563EB]/60"
    },
    {
      icon: Zap,
      title: "Quick Connect",
      description: "Send invites and form teams in minutes, not days",
      color: "from-[#06B6D4] to-[#06B6D4]/60"
    },
    {
      icon: Shield,
      title: "Verified Profiles",
      description: "Connect with real students through verified university emails",
      color: "from-[#7C3AED] to-[#06B6D4]"
    },
    {
      icon: Sparkles,
      title: "Mentor Connect",
      description: "Get guidance from experienced seniors and faculty members",
      color: "from-[#2563EB] to-[#7C3AED]"
    },
    {
      icon: MessageCircle,
      title: "Real-time Chat",
      description: "Seamless in-app messaging to discuss projects and ideas",
      color: "from-[#06B6D4] to-[#2563EB]"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0F0F1A]">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-40 pb-32 px-6 bg-gradient-to-b from-[#1a1a2e] to-[#0F0F1A]">
        <div className="container mx-auto max-w-3xl mx-auto text-center">
          <motion.h1
            className="text-6xl md:text-7xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            style={{
              background: "linear-gradient(135deg, #7C3AED 0%, #2563EB 50%, #06B6D4 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            Find Your Perfect Project Partner
          </motion.h1>
          
          <motion.p
            className="text-xl md:text-2xl text-gray-300 mb-10 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Connect with talented students based on skills, interests, and experience. 
            Build amazing projects, win hackathons, and collaborate on research together.
          </motion.p>
          
          <motion.div
            className="flex flex-wrap gap-4 justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Link to="/auth">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white font-semibold px-8 py-6 text-lg rounded-lg shadow-lg hover:shadow-2xl transition-all">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </Link>
            
            <Link to="/features">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" variant="outline" className="font-semibold px-8 py-6 text-lg border-white/20 hover:bg-white/10 text-white">
                  Explore Features
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 
              className="text-5xl md:text-6xl font-bold mb-6"
              style={{
                background: "linear-gradient(135deg, #7C3AED 0%, #2563EB 50%, #06B6D4 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}
            >
              Why Choose SkillSync?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Everything you need to find teammates and collaborate effectively
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <motion.div
                  whileHover={{ y: -8, boxShadow: '0 0 30px rgba(124, 58, 237, 0.2)' }}
                  className="p-8 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 h-full bg-white/5 backdrop-blur-md hover:bg-white/10"
                >
                  <div className={`inline-block p-4 rounded-lg bg-gradient-to-br ${feature.color} mb-6`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#7C3AED] rounded-full blur-3xl" />
        </div>
        
        <motion.div
          className="container mx-auto relative z-10 text-center max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 
            className="text-5xl md:text-6xl font-bold mb-6"
            style={{
              background: "linear-gradient(135deg, #7C3AED 0%, #2563EB 50%, #06B6D4 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            Ready to Build Something Great?
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Join thousands of students already collaborating on amazing projects.
          </p>
          
          <Link to="/auth">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" className="bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white font-semibold px-8 py-6 text-lg rounded-lg shadow-lg hover:shadow-2xl transition-all">
                Start Collaborating Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
