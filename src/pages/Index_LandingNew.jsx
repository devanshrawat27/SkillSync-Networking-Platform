import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Sparkles, Users, Target, Zap, MessageCircle, Shield, ArrowRight, Github, Linkedin, Twitter, Play } from 'lucide-react';

const Index = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const steps = [
    {
      number: '01',
      icon: '🧑‍💻',
      title: 'Create Profile',
      description: 'Add your skills, branch, and domain expertise',
    },
    {
      number: '02',
      icon: '🔍',
      title: 'Find Teammates',
      description: 'Search by skill, filter by domain and year',
    },
    {
      number: '03',
      icon: '🚀',
      title: 'Collaborate',
      description: 'Build teams, start projects, win hackathons',
    },
  ];

  const features = [
    {
      icon: Target,
      title: 'Skill-Based Matching',
      description: 'AI-powered matching based on complementary skills',
    },
    {
      icon: MessageCircle,
      title: 'Real-time Messaging',
      description: 'Seamless in-app communication with your team',
    },
    {
      icon: Users,
      title: 'Team Management',
      description: 'Create, manage, and grow your teams easily',
    },
    {
      icon: Shield,
      title: 'Project Collaboration',
      description: 'Organize projects with shared resources and tasks',
    },
    {
      icon: Sparkles,
      title: 'Mentor Connect',
      description: 'Get guidance from experienced seniors and faculty',
    },
    {
      icon: Zap,
      title: 'Smart Notifications',
      description: 'Stay updated with relevant activity alerts',
    },
  ];

  const skills = [
    'React',
    'Python',
    'UI/UX',
    'Flutter',
    'Machine Learning',
    'Data Science',
    'Node.js',
    'TypeScript',
    'Cloud Computing',
    'DevOps',
  ];

  const testimonials = [
    {
      quote:
        "SkillSync helped me find amazing teammates for my project. The skill matching is spot on!",
      name: 'Rahul Kumar',
      branch: 'CSE • 3rd Year',
      avatar: '👨‍💼',
    },
    {
      quote:
        'Finally, a platform that understands what students need. Built our winning hackathon team here!',
      name: 'Priya Sharma',
      branch: 'IT • 2nd Year',
      avatar: '👩‍💼',
    },
    {
      quote:
        'The mentorship connections have been invaluable for my growth. Highly recommend!',
      name: 'Arjun Patel',
      branch: 'ECE • 4th Year',
      avatar: '👨‍🎓',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20 px-4">
        {/* Animated background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--primary)]/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container max-w-5xl mx-auto text-center relative z-10">
          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6"
          >
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-4">
              Find Your Perfect <br />
              <span style={{ background: 'linear-gradient(to right, var(--primary), var(--accent))', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'var(--primary)' }}>Project Partner</span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10"
          >
            Connect with talented students based on skills, interests, and experience. Build amazing projects, win hackathons, and collaborate on research together.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Link to="/auth">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary-lg"
              >
                <Sparkles className="w-5 h-5" />
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-secondary px-8 py-3 text-base"
            >
              <Play className="w-5 h-5" />
              Watch Demo
            </motion.button>
          </motion.div>

          {/* Avatar Stack */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center justify-center gap-3"
          >
            <div className="flex -space-x-2">
              {['👨‍💼', '👩‍💼', '🧑‍💼'].map((avatar, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-[var(--bg-elevated)] border-2 border-[var(--bg-primary)] flex items-center justify-center text-xl"
                >
                  {avatar}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <div className="flex flex-col items-center gap-2 text-[var(--text-muted)]">
              <span className="text-xs">Scroll to explore</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="container max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 style={{ color: 'var(--text-primary)' }} className="text-4xl md:text-5xl font-bold mb-4">
              Get Started in <span style={{ color: 'var(--primary)' }}>3 Simple Steps</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)' }} className="text-lg">Everything you need to find teammates and collaborate</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            className="grid md:grid-cols-3 gap-8 relative"
          >
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-500 opacity-30" />

            {steps.map((step, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="relative z-10"
                whileHover={{ y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <div className="card-lg text-center hover-lift">
                  {/* Step Number Badge */}
<div className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="text-4xl mb-4">{step.icon}</div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-[var(--text-secondary)]">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-[var(--surface)]/50">
        <div className="container max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need to <span className="gradient-text">Collaborate</span>
            </h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  whileHover={{ y: -6 }}
                  className="card-lg hover-lift"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-[var(--text-secondary)] text-sm">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Skill Cloud */}
      <section className="py-20 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Skills on <span className="gradient-text">SkillSync</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            className="flex flex-wrap justify-center gap-3"
          >
            {skills.map((skill, i) => (
              <motion.div
                key={i}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium from-violet-950 to-violet-900 border border-violet-700 text-violet-400 bg-gradient-to-r"
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 3 + Math.random() * 2, repeat: Infinity }}
              >
                {skill}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-[var(--surface)]/50">
        <div className="container max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              What Students <span className="gradient-text">Say</span>
            </h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            className="grid md:grid-cols-3 gap-6"
          >
            {testimonials.map((testimonial, i) => (
              <motion.div key={i} variants={itemVariants} className="card-lg">
                <p className="text-lg mb-4 italic text-[var(--text-secondary)]">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[var(--surface-2)] flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div className="text-left">
                    <p className="font-bold">{testimonial.name}</p>
                    <p className="text-sm text-[var(--text-muted)]">{testimonial.branch}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[var(--primary)]/30 rounded-full blur-3xl" />
        </div>

        <div className="container max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Find Your <span className="gradient-text">Team?</span>
            </h2>
            <p className="text-lg text-[var(--text-secondary)] mb-8">
              Join thousands of students already collaborating on amazing projects. No credit card required.
            </p>
            <Link to="/auth">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary-lg"
              >
                Start Collaborating Now
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
