import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getPostLoginRoute } from "@/lib/app-flow";

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: ""
  });

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        navigate(await getPostLoginRoute());
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        navigate(await getPostLoginRoute());
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match!");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Sign in
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;
        toast.success("Welcome back!");
      } else {
        // Sign up
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              name: formData.name,
            }
          }
        });

        if (error) throw error;
        toast.success("Account created! Check your email to confirm.");
      }
    } catch (error) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)' }} className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background gradient */}
      <div style={{
        background: `radial-gradient(circle at center bottom, var(--primary-glow), transparent)`,
        opacity: 0.3,
      }} className="absolute inset-0 pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div style={{ backgroundColor: 'var(--primary)' }} className="w-12 h-12 rounded-lg flex items-center justify-center">
            <Users className="w-7 h-7 text-white" />
          </div>
          <span style={{ color: 'var(--text-primary)' }} className="text-2xl font-bold">SkillSync</span>
        </div>

        {/* Card */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border)',
        }} className="border rounded-2xl p-8">
          {/* Tabs */}
          <div className="flex gap-6 mb-8 relative">
            <button
              onClick={() => {
                setIsLogin(true);
                setFormData({ email: "", password: "", confirmPassword: "", name: "" });
              }}
              style={{ color: isLogin ? 'var(--text-primary)' : 'var(--text-secondary)' }}
              className="relative text-base font-semibold transition-colors duration-200 pb-2"
            >
              Login
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setFormData({ email: "", password: "", confirmPassword: "", name: "" });
              }}
              style={{ color: !isLogin ? 'var(--text-primary)' : 'var(--text-secondary)' }}
              className="relative text-base font-semibold transition-colors duration-200 pb-2"
            >
              Sign Up
            </button>
            {/* Animated bottom border */}
            <div
              style={{
                backgroundColor: 'var(--primary)',
                left: isLogin ? '0' : '4rem',
              }}
              className="absolute bottom-0 h-0.5 w-12 transition-all duration-300"
            />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="name" style={{ color: 'var(--text-primary)' }} className="block text-sm font-semibold mb-2">
                  Full Name
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required={!isLogin}
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  className="border rounded-lg h-11 px-3 transition-colors focus:border-[var(--primary)]"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" style={{ color: 'var(--text-primary)' }} className="block text-sm font-semibold mb-2">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@university.edu"
                required
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
                className="border rounded-lg h-11 px-3 transition-colors focus:border-[var(--primary)]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" style={{ color: 'var(--text-primary)' }} className="block text-sm font-semibold">
                  Password
                </label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => {}}
                    style={{ color: 'var(--primary)' }}
                    className="text-xs font-medium hover:opacity-80 transition-opacity"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  className="border rounded-lg h-11 px-3 pr-10 transition-colors focus:border-[var(--primary)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ color: 'var(--text-secondary)' }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-[var(--text-primary)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" style={{ color: 'var(--text-primary)' }} className="block text-sm font-semibold mb-2">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required={!isLogin}
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  className="border rounded-lg h-11 px-3 transition-colors focus:border-[var(--primary)]"
                />
              </div>
            )}

            <Button 
              type="submit" 
              disabled={loading}
              style={{
                backgroundColor: 'var(--primary)',
                color: 'white',
              }}
              className="w-full mt-6 h-11 font-semibold rounded-lg hover:opacity-90 transition-all duration-200"
            >
              {loading ? (isLogin ? "Signing in..." : "Creating account...") : (isLogin ? "Sign In" : "Create Account")}
            </Button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormData({ email: "", password: "", confirmPassword: "", name: "" });
                }}
                style={{ color: 'var(--primary)' }}
                className="font-semibold hover:opacity-80 transition-opacity"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p style={{ color: 'var(--text-muted)' }} className="text-center text-xs mt-8">
          By signing up, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
};

export default Auth;
