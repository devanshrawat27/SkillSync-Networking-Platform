import { Link } from "react-router-dom";
import { Users, Github, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-[var(--border)] bg-[rgba(10,14,26,0.78)] backdrop-blur-xl">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-glow">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">SkillSync</span>
            </div>
            <p className="mb-4 max-w-md text-[var(--text-secondary)]">
              Empowering students to find perfect project partners and build amazing things together.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[rgba(17,24,39,0.72)] transition-colors hover:border-[var(--primary)] hover:bg-[var(--surface-2)]">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[rgba(17,24,39,0.72)] transition-colors hover:border-[var(--primary)] hover:bg-[var(--surface-2)]">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="mailto:contact@skillsync.com" className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[rgba(17,24,39,0.72)] transition-colors hover:border-[var(--primary)] hover:bg-[var(--surface-2)]">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <div className="flex flex-col gap-2">
              <Link to="/features" className="text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">
                Features
              </Link>
              <Link to="/about" className="text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">
                About Us
              </Link>
              <Link to="/mentors" className="text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">
                Mentors
              </Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <div className="flex flex-col gap-2">
              <Link to="/contact" className="text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">
                Contact Us
              </Link>
              <Link to="/faq" className="text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">
                FAQ
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-[var(--border)] pt-8 text-center text-sm text-[var(--text-secondary)]">
          <p>&copy; {new Date().getFullYear()} SkillSync. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
