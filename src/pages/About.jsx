import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Github, Linkedin, Mail } from "lucide-react";

const About = () => {
  const teamMembers = [
    {
      name: "Devansh Rawat",
      github: "https://github.com/devanshrawat",
      linkedin: "https://linkedin.com/in/devanshrawat",
      image: "/src/pages/Devansh Rawat.jpg"
    },
    {
      name: "Anuj Kumar",
      github: "https://github.com/anujkumar",
      linkedin: "https://linkedin.com/in/anujkumar",
      image: "/src/pages/Anuj Kumar.jpg"
    },
    {
      name: "Anuj Dobhal",
      github: "https://github.com/anujdobhal",
      linkedin: "https://linkedin.com/in/anujdobhal",
      image: "/src/pages/anuj dobhal.jpeg"
    },
    {
      name: "Shalini Uniyal",
      github: "https://github.com/shaliniuniyal",
      linkedin: "https://linkedin.com/in/shaliniuniyal",
      image: "/src/pages/Shalini Uniyal.jpg"
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto">
          {/* Vision Section */}
          <div className="max-w-4xl mx-auto text-center mb-20 animate-slide-up">
            <h1 className="text-5xl font-bold mb-6">
              Our <span className="gradient-text">Vision</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              We believe that the best innovations happen when talented minds collaborate. 
              SkillSync was born from our own struggles to find the right teammates for projects and hackathons. 
              We're on a mission to make team formation effortless and help students build amazing things together.
            </p>
            <div className="glass-card p-8 rounded-2xl">
              <p className="text-lg text-foreground/90">
                "Empowering students to connect, collaborate, and create the future of technology through meaningful partnerships."
              </p>
            </div>
          </div>

          {/* Mentor Section */}
          <div className="mb-20">
            <h2 className="text-4xl font-bold text-center mb-12">Our Mentor</h2>
            <Card className="glass-card max-w-2xl mx-auto p-8 glow-hover">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0">
                  <img 
                    src="/src/pages/stuti-bhatt-cse.webp" 
                    alt="Ms. Stuti Bhatt"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold mb-2">Ms. Stuti Bhatt</h3>
                  <p className="text-lg text-primary font-semibold mb-3">Assistant Professor</p>
                  <p className="text-muted-foreground leading-relaxed">
                    M.Tech. (C.S.E) from Graphic Era Deemed to be University, Dehradun. Her research interests include Artificial Intelligence, Cyber Security, Quantum Computing, Blockchain, Machine Learning, and IoT. She has published several research papers and holds a patent in NeuroAI brain tumor detection systems. With 7 months of academic and research experience, she is actively involved in organizing international conferences and has received recognition for her contributions in neuromorphic engineering.
                  </p>
                </div>
              </div>
            </Card>
          </div>
          {/* Team Section */}
          <div>
            <h2 className="text-4xl font-bold text-center mb-12">Meet Our Team</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <Card 
                  key={index} 
                  className="glass-card p-6 group hover:scale-105 transition-all duration-300"
                >
                  <div className="w-24 h-24 mx-auto mb-4 rounded-2xl overflow-hidden group-hover:scale-110 transition-transform">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-center mb-4">{member.name}</h3>
                  <div className="flex justify-center gap-3">
                    <a 
                      href={member.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
                    >
                      <Github className="w-5 h-5" />
                    </a>
                    <a 
                      href={member.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
