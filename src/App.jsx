import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Index from "./pages/Index_LandingNew";
import About from "./pages/About";
import Features from "./pages/Features";
import Mentors from "./pages/Mentors";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import FindTeammates from "./pages/FindTeammates";
import Connections from "./pages/Connections";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import NewProject from "./pages/NewProject";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import Messages from "./pages/Messages";
import Teams from "./pages/Teams";
import Notifications from "./pages/Notifications";
import { ChatProvider } from "./components/chat/ChatContext";
import ChatDrawer from "./components/chat/ChatDrawer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ChatProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/old" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/features" element={<Features />} />
            <Route path="/mentors" element={<Mentors />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/find-teammates" element={<FindTeammates />} />
            <Route path="/find" element={<FindTeammates />} />
            <Route path="/connections" element={<Connections />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/new-project" element={<NewProject />} />
            <Route path="/projects/new" element={<NewProject />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/project/:id" element={<ProjectDetails />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ChatDrawer />
        </ChatProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
