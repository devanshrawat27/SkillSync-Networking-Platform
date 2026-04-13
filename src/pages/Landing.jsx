import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight, Search, Users, MessageSquare,
  FolderOpen, GraduationCap, Bell, Menu, X,
  Zap, Shield
} from "lucide-react";

const C = {
  bg:      "#0A0E1A",
  surface: "#111827",
  card:    "#131C2E",
  border:  "rgba(148,163,184,0.14)",
  bHov:    "rgba(148,163,184,0.24)",
  primary: "#4F46E5",
  pDark:   "#4338CA",
  pGlow:   "rgba(79,70,229,0.22)",
  red:     "#FF6B6B",
  amber:   "#FFB547",
  green:   "#3DD68C",
  cyan:    "#38BDF8",
  text:    "#F1F5F9",
  sub:     "#94A3B8",
  muted:   "#64748B",
};

function useFont() {
  useEffect(() => {
    if (document.querySelector("[data-ss-font]")) return;
    const l = document.createElement("link");
    l.rel  = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap";
    l.setAttribute("data-ss-font", "1");
    document.head.appendChild(l);
  }, []);
}

const Tag = ({ children, color = C.primary }) => (
  <span style={{
    display: "inline-block", padding: "3px 10px",
    fontSize: 11, fontWeight: 600, borderRadius: 99,
    background: color + "18", color, border: `1px solid ${color}30`,
  }}>{children}</span>
);

const Btn = ({ children, variant = "filled", onClick, size = "md", icon }) => {
  const isLg = size === "lg";
  return (
    <motion.button
      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: isLg ? "14px 30px" : "10px 20px",
        fontSize: isLg ? 15 : 14, fontWeight: 600,
        borderRadius: 10, cursor: "pointer",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        transition: "all 0.2s",
        ...(variant === "filled"
          ? { background: C.primary, color: "#fff", border: "none" }
          : { background: "transparent", color: C.sub, border: `1.5px solid ${C.border}` }
        ),
      }}
      onMouseEnter={e => {
        if (variant === "ghost") { e.currentTarget.style.borderColor = C.bHov; e.currentTarget.style.color = C.text; }
        else { e.currentTarget.style.boxShadow = `0 0 40px ${C.pGlow}`; e.currentTarget.style.background = C.pDark; }
      }}
      onMouseLeave={e => {
        if (variant === "ghost") { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.sub; }
        else { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.background = C.primary; }
      }}
    >
      {children}{icon && icon}
    </motion.button>
  );
};

/* Animated search demo */
const USERS = [
  { name: "Devansh rawat",  dept: "CSE · 3rd yr", skills: ["React","Node.js"], match: 96, col: C.primary },
  { name: "Anuj kumar ",   dept: "ECE · 2nd yr", skills: ["ML","Python"],     match: 89, col: C.cyan    },
  { name: "Anuj dobhal",    dept: "IT · 4th yr",  skills: ["Flutter","Dart"],   match: 82, col: C.amber   },
  { name: "Shalini uniyal",  dept: "CSE · 3rd yr", skills: ["Figma","UI/UX"],   match: 74, col: C.green   },
];

function SearchDemo() {
  const [query, setQuery]   = useState("");
  const [shown, setShown]   = useState(false);
  const TYPED = "React developer";

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      if (i <= TYPED.length) { setQuery(TYPED.slice(0, i)); i++; }
      else { clearInterval(id); setTimeout(() => setShown(true), 400); }
    }, 75);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      style={{
        background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 20, padding: "20px", width: "100%", maxWidth: 480,
        boxShadow: `0 15px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)`,
      }}
    >
      {/* Chrome bar */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {["#FF5F57","#FFBD2E","#28C840"].map(c => <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />)}
        <div style={{ flex: 1, height: 22, background: "rgba(255,255,255,0.04)", borderRadius: 5, marginLeft: 6, display: "flex", alignItems: "center", paddingLeft: 10 }}>
          <span style={{ fontSize: 10, color: C.muted }}>skillsync.app/discover</span>
        </div>
      </div>

      {/* Search input */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.surface, border: `1.5px solid ${C.primary}40`, borderRadius: 10, padding: "11px 15px", marginBottom: 13 }}>
        <Search size={14} color={C.primary} />
        <span style={{ fontSize: 13.5, color: C.text, flex: 1 }}>
          {query}
          <span style={{ borderLeft: `2px solid ${C.primary}`, marginLeft: 1, animation: "blink 1s step-end infinite" }} />
        </span>
        <Tag>Filter</Tag>
      </div>

      {/* Filter chips */}
      <div style={{ display: "flex", gap: 7, marginBottom: 14, flexWrap: "wrap" }}>
        {["All","Web Dev","AI/ML","Design","Mobile"].map((f,i) => (
          <span key={f} style={{ fontSize: 11, padding: "5px 13px", borderRadius: 99, background: i===0 ? C.primary : "rgba(255,255,255,0.04)", color: i===0 ? "#fff" : C.sub, border: `1px solid ${i===0 ? C.primary : C.border}`, fontWeight: 500 }}>{f}</span>
        ))}
      </div>

      {/* User results */}
      {USERS.map((u, i) => (
        <motion.div key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={shown ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: i * 0.1, duration: 0.3 }}
          style={{
            display: "flex", alignItems: "center", gap: 11,
            padding: "11px 13px",
            background: i===0 ? `${C.primary}0C` : "rgba(255,255,255,0.02)",
            border: `1px solid ${i===0 ? C.primary+"35" : C.border}`,
            borderRadius: 12, marginBottom: 7,
          }}
        >
          <div style={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0, background: u.col+"1E", border: `1.5px solid ${u.col}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: u.col }}>
            {u.name[0]}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{u.name}</div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>{u.dept}</div>
            <div style={{ display: "flex", gap: 5 }}>
              {u.skills.map(s => <Tag key={s} color={u.col}>{s}</Tag>)}
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.green, marginBottom: 6 }}>{u.match}%</div>
            {i === 0
              ? <span style={{ fontSize: 10, color: C.green, background: C.green+"15", border: `1px solid ${C.green}30`, borderRadius: 99, padding: "3px 10px" }}>Connected ✓</span>
              : <span style={{ fontSize: 10, color: "#fff", background: C.primary, borderRadius: 99, padding: "4px 12px" }}>Connect</span>
            }
          </div>
        </motion.div>
      ))}

      <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 6, paddingTop: 11, display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, color: C.muted }}>Showing 4 of 24 matches</span>
        <span style={{ fontSize: 11, color: C.primary, fontWeight: 600, cursor: "pointer" }}>View all →</span>
      </div>
    </motion.div>
  );
}

/* Problem vs Solution */
function ProblemSolution() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const items = [
    ["Teammates chosen randomly at last minute",    "Filter students by exact skill you need"],
    ["No idea what others can actually build",       "See verified skill profiles before connecting"],
    ["Lost track of chats in 10 different groups",  "All communication in one place"],
    ["Same 5 people in every hackathon team",       "Discover fresh talent across all branches"],
    ["Seniors unreachable for guidance",             "Connect with mentors directly in the app"],
  ];

  return (
    <section ref={ref} style={{ padding: "90px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={inView ? { opacity: 1, y: 0 } : {}} style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: C.primary, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 14 }}>The Problem</p>
          <h2 style={{ fontSize: "clamp(28px, 3.5vw, 42px)", fontWeight: 800, letterSpacing: "-0.8px", lineHeight: 1.15 }}>
            Team formation is{" "}
            <span style={{ color: C.red, fontStyle: "italic" }}>broken</span> in college.
          </h2>
        </motion.div>

        {/* Table comparison */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.15 }}
          style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, overflow: "hidden" }}
        >
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ padding: "16px 24px", display: "flex", alignItems: "center", gap: 10, borderRight: `1px solid ${C.border}`, background: `${C.red}08` }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: C.red+"18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>😤</div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.red }}>Without SkillSync</p>
                <p style={{ fontSize: 11, color: C.muted }}>How it is right now</p>
              </div>
            </div>
            <div style={{ padding: "16px 24px", display: "flex", alignItems: "center", gap: 10, background: `${C.green}06` }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: C.green+"18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🚀</div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.green }}>With SkillSync</p>
                <p style={{ fontSize: 11, color: C.muted }}>How it should be</p>
              </div>
            </div>
          </div>

          {/* Rows */}
          {items.map(([bad, good], i) => (
            <motion.div key={i}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.25 + i * 0.07 }}
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: i < items.length-1 ? `1px solid ${C.border}` : "none" }}
            >
              <div style={{ padding: "14px 24px", display: "flex", alignItems: "center", gap: 10, borderRight: `1px solid ${C.border}` }}>
                <span style={{ color: C.red, fontSize: 16, flexShrink: 0 }}>✗</span>
                <span style={{ fontSize: 13.5, color: C.sub, lineHeight: 1.5 }}>{bad}</span>
              </div>
              <div style={{ padding: "14px 24px", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: C.green, fontSize: 16, flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: 13.5, color: C.sub, lineHeight: 1.5 }}>{good}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ─── MAIN ─── */
export default function Landing() {
  useFont();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu]         = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 55);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const scrollTo = id => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setMenu(false); };
  const go = p => navigate(p);

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: "'Plus Jakarta Sans', sans-serif", overflowX: "hidden" }}>

      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        ::selection{background:${C.primary}50;}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes mL{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes mR{from{transform:translateX(-50%)}to{transform:translateX(0)}}
        @keyframes glow{0%,100%{opacity:0.35}50%{opacity:0.65}}
        @keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-13px)}}
        .mrow{display:flex;gap:12px;white-space:nowrap;overflow:hidden;
          mask-image:linear-gradient(90deg,transparent,black 10%,black 90%,transparent);
          -webkit-mask-image:linear-gradient(90deg,transparent,black 10%,black 90%,transparent);}
        @media(max-width:900px){
          .hs{grid-template-columns:1fr!important;}
          .hr{display:none!important;}
          .fg{grid-template-columns:1fr 1fr!important;}
          .sg{grid-template-columns:1fr!important;}
          .nm{display:none!important;}
          .ns{display:none!important;}
          .hb{display:flex!important;}
          .fi{flex-direction:column!important;gap:20px!important;align-items:flex-start!important;}
        }
        @media(max-width:500px){.fg{grid-template-columns:1fr!important;}}
        @media(min-width:901px){.hb{display:none!important;}.mm{display:none!important;}}
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{ position:"fixed", inset:"0 0 auto 0", zIndex:200, height:64, background: scrolled?"rgba(8,8,15,0.9)":"transparent", backdropFilter: scrolled?"blur(18px)":"none", borderBottom:`1px solid ${scrolled?C.border:"transparent"}`, transition:"all 0.3s" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px", height:"100%", display:"flex", alignItems:"center", justifyContent:"space-between" }}>

          <div style={{ display:"flex", alignItems:"center", gap:9, cursor:"pointer" }} onClick={() => go("/")}>
            <div style={{ width:32, height:32, borderRadius:9, background:`linear-gradient(135deg,${C.primary},${C.cyan})`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <span style={{ fontWeight:800, fontSize:16, letterSpacing:"-0.3px" }}>SkillSync</span>
          </div>

          <div className="nm" style={{ display:"flex", gap:32 }}>
            {[["Features","features"],["How it works","how-it-works"],["Skills","skills"]].map(([l,id]) => (
              <button key={id} onClick={() => scrollTo(id)} style={{ background:"none", border:"none", color:C.sub, fontSize:14, fontWeight:500, cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif", transition:"color 0.18s" }}
                onMouseEnter={e=>e.target.style.color=C.text} onMouseLeave={e=>e.target.style.color=C.sub}>{l}</button>
            ))}
            <button
              onClick={() => go("/about")}
              style={{ background:"none", border:"none", color:C.sub, fontSize:14, fontWeight:500, cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif", transition:"color 0.18s" }}
              onMouseEnter={e=>e.target.style.color=C.text}
              onMouseLeave={e=>e.target.style.color=C.sub}
            >
              About Us
            </button>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <button className="ns" onClick={() => go("/auth")} style={{ background:"none", border:"none", color:C.sub, fontSize:14, fontWeight:500, cursor:"pointer", padding:"8px 12px", fontFamily:"'Plus Jakarta Sans',sans-serif", transition:"color 0.18s" }}
              onMouseEnter={e=>e.target.style.color=C.text} onMouseLeave={e=>e.target.style.color=C.sub}>Sign in</button>
            <Btn onClick={() => go("/auth")}>Get Started</Btn>
            <button className="hb" onClick={() => setMenu(!menu)} style={{ background:"none", border:"none", cursor:"pointer", padding:4, display:"none" }}>
              {menu ? <X size={22} color={C.text}/> : <Menu size={22} color={C.sub}/>}
            </button>
          </div>
        </div>

        {menu && (
          <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} className="mm"
            style={{ background:"rgba(8,8,15,0.97)", backdropFilter:"blur(20px)", borderTop:`1px solid ${C.border}`, padding:"16px 24px 24px" }}
          >
            {[["Features","features"],["How it works","how-it-works"],["Skills","skills"]].map(([l,id]) => (
              <button key={id} onClick={() => scrollTo(id)} style={{ display:"block", width:"100%", textAlign:"left", background:"none", border:"none", borderBottom:`1px solid ${C.border}`, color:C.sub, fontSize:15, padding:"13px 0", cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{l}</button>
            ))}
            <button onClick={() => go("/about")} style={{ display:"block", width:"100%", textAlign:"left", background:"none", border:"none", borderBottom:`1px solid ${C.border}`, color:C.sub, fontSize:15, padding:"13px 0", cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>About Us</button>
            <button onClick={() => go("/auth")} style={{ display:"block", width:"100%", textAlign:"left", background:"none", border:"none", color:C.sub, fontSize:15, padding:"13px 0", cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Sign in</button>
            <Btn onClick={() => go("/auth")} size="lg" icon={<ArrowRight size={16}/>}>Get Started Free</Btn>
          </motion.div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight:"100vh", paddingTop:120, paddingBottom:80, paddingLeft:24, paddingRight:24, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"8%", left:"38%", width:660, height:660, borderRadius:"50%", background:`radial-gradient(circle,${C.primary}18,transparent 65%)`, animation:"glow 7s ease-in-out infinite", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", bottom:"-8%", right:"-5%", width:480, height:480, borderRadius:"50%", background:`radial-gradient(circle,${C.cyan}0C,transparent 65%)`, pointerEvents:"none" }}/>
        <div style={{ position:"absolute", inset:0, backgroundImage:`linear-gradient(${C.border} 1px,transparent 1px),linear-gradient(90deg,${C.border} 1px,transparent 1px)`, backgroundSize:"56px 56px", opacity:0.5, pointerEvents:"none" }}/>

        <div style={{ maxWidth:1100, margin:"0 auto", position:"relative" }}>
          <div className="hs" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:52, alignItems:"center" }}>

            {/* LEFT */}
            <div>
              <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>
                <span style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"6px 14px", borderRadius:99, marginBottom:28, background:`${C.primary}12`, border:`1px solid ${C.primary}30`, fontSize:12, fontWeight:600, color:C.primary }}>
                  <span style={{ width:7, height:7, borderRadius:"50%", background:C.green, display:"inline-block", animation:"glow 2s ease-in-out infinite" }}/>
                  Student Peer Networking Platform
                </span>
              </motion.div>

              <motion.h1 initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.1, ease:[0.22,1,0.36,1] }}
                style={{ fontSize:"clamp(34px, 4.2vw, 56px)", fontWeight:800, lineHeight:1.1, letterSpacing:"-1.2px", marginBottom:20 }}>
                Stop settling for<br/>
                <span style={{ background:`linear-gradient(135deg,${C.primary} 20%,${C.cyan} 80%)`, backgroundClip:"text", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                  random teammates.
                </span>
              </motion.h1>
                
              <motion.p initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.2 }}
                style={{ fontSize:17, color:C.sub, lineHeight:1.75, maxWidth:420, marginBottom:36 }}>
                SkillSync matches you with students by actual skills — not luck. Find your co-founder, hackathon squad, or project partner today.
              </motion.p>
              
              <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.3 }}
                style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:40 }}>
                <Btn onClick={() => go("/auth")} size="lg" icon={<ArrowRight size={16}/>}>Find my team</Btn>
                <Btn onClick={() => scrollTo("how-it-works")} variant="ghost" size="lg">See how it works</Btn>
              </motion.div>
                                    
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
                style={{ display:"flex", gap:24, flexWrap:"wrap" }}>
                {[{ icon:<Users size={13}/>, text:"For college students" },{ icon:<Zap size={13}/>, text:"Skill-based matching" },{ icon:<Shield size={13}/>, text:"Free to use" }].map((item,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:7, fontSize:13, color:C.muted }}>
                    <span style={{ color:C.primary }}>{item.icon}</span>{item.text}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* RIGHT */}
            <div className="hr" style={{ display:"flex", justifyContent:"flex-end", animation:"floatY 5s ease-in-out infinite" }}>
              <SearchDemo/>
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div style={{ borderTop:`1px solid ${C.border}`, borderBottom:`1px solid ${C.border}`, padding:"13px 0", overflow:"hidden", background:C.surface }}>
        <div className="mrow">
          {[...Array(2)].flatMap((_,ri) =>
            ["Hackathons","PBL Projects","Research Collabs","Startup Teams","Open Source","Design Sprints","ML Projects","App Development","Coding Contests","Capstone Projects"].map((item,i) => (
              <span key={`${ri}-${i}`} style={{ fontSize:13, color:C.muted, display:"inline-flex", alignItems:"center", gap:16, animation:"mL 25s linear infinite", flexShrink:0 }}>
                <span style={{ width:4, height:4, borderRadius:"50%", background:C.primary, display:"inline-block" }}/>{item}
              </span>
            ))
          )}
        </div>
      </div>
      
      {/* ── PROBLEM VS SOLUTION ── */}
      <ProblemSolution/>
      
      {/* ── FEATURES ── */}
      <section id="features" style={{ padding:"90px 24px", background:C.surface }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} style={{ textAlign:"center", marginBottom:56 }}>
            <p style={{ fontSize:12, fontWeight:700, color:C.primary, letterSpacing:"3px", textTransform:"uppercase", marginBottom:14 }}>What you get</p>
            <h2 style={{ fontSize:"clamp(26px,3.5vw,40px)", fontWeight:800, letterSpacing:"-0.8px", lineHeight:1.15, marginBottom:12 }}>
              Built for how students actually work.
            </h2>
            <p style={{ fontSize:15, color:C.sub, maxWidth:440, margin:"0 auto" }}>
              Every feature designed around real college collaboration problems.
            </p>
          </motion.div>

          <motion.div className="fg" initial="hidden" whileInView="show" viewport={{ once:true }}
            variants={{ show:{ transition:{ staggerChildren:0.08 } } }}
            style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:13 }}>
            {[
              { icon:<Search size={20}/>,       col:C.primary, title:"Skill-Based Discovery",   desc:"Search by exact tech stack — React, Flutter, ML. Find the right person, not just anyone free." },
              { icon:<MessageSquare size={20}/>, col:C.cyan,    title:"Real-time Messaging",     desc:"DM your connections instantly. No waiting, no email threads." },
              { icon:<Users size={20}/>,         col:"#A78BFA",  title:"Team Formation",          desc:"Create a team, list required skills, invite people directly." },
              { icon:<FolderOpen size={20}/>,    col:C.amber,   title:"Project Showcase",        desc:"Post your work publicly. Attract collaborators excited about what you're building." },
              { icon:<GraduationCap size={20}/>, col:C.green,   title:"Mentor Connect",          desc:"Reach seniors and domain mentors for guidance on the exact tech you need." },
              { icon:<Bell size={20}/>,          col:C.red,     title:"Smart Notifications",     desc:"Get pinged for connection requests, team invites, and messages instantly." },
            ].map((f,i) => (
              <motion.div key={i}
                variants={{ hidden:{ opacity:0, y:18 }, show:{ opacity:1, y:0, transition:{ duration:0.45 } } }}
                whileHover={{ y:-5, borderColor: f.col+"50" }}
                style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:"24px 20px", cursor:"default", transition:"border-color 0.2s, box-shadow 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = `0 10px 40px ${f.col}15`}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
              >
                <div style={{ width:42, height:42, borderRadius:11, background:f.col+"18", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
                  <span style={{ color:f.col }}>{f.icon}</span>
                </div>
                <p style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:9, lineHeight:1.3 }}>{f.title}</p>
                <p style={{ fontSize:13.5, color:C.sub, lineHeight:1.7 }}>{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding:"90px 24px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} style={{ textAlign:"center", marginBottom:64 }}>
            <p style={{ fontSize:12, fontWeight:700, color:C.primary, letterSpacing:"3px", textTransform:"uppercase", marginBottom:14 }}>Process</p>
            <h2 style={{ fontSize:"clamp(26px,3.5vw,40px)", fontWeight:800, letterSpacing:"-0.8px" }}>Up and running in minutes.</h2>
          </motion.div>

          <motion.div className="sg" initial="hidden" whileInView="show" viewport={{ once:true }}
            variants={{ show:{ transition:{ staggerChildren:0.12 } } }}
            style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:28, position:"relative" }}>
            <div style={{ position:"absolute", top:44, left:"16%", right:"16%", height:0, borderTop:`1.5px dashed ${C.border}`, pointerEvents:"none" }}/>

            {[
              { num:"01", col:C.primary, emoji:"🧑‍💻", title:"Build your profile",       desc:"Add your skills, branch, year, and GitHub. Takes 3 minutes." },
              { num:"02", col:C.cyan,    emoji:"🔍", title:"Search & discover",        desc:"Filter by skill, domain, or year. See skill match % instantly." },
              { num:"03", col:C.green,   emoji:"🤝", title:"Connect & build together", desc:"Request, chat, form a team, and start shipping." },
            ].map((s,i) => (
              <motion.div key={i}
                variants={{ hidden:{ opacity:0, y:24 }, show:{ opacity:1, y:0, transition:{ duration:0.5 } } }}
                style={{ textAlign:"center", position:"relative" }}>
                <div style={{ position:"absolute", top:-22, left:"50%", transform:"translateX(-50%)", fontSize:72, fontWeight:800, color:`${s.col}09`, lineHeight:1, userSelect:"none", zIndex:0 }}>{s.num}</div>
                <div style={{ width:68, height:68, borderRadius:"50%", background:s.col+"14", border:`1.5px solid ${s.col}30`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", position:"relative", zIndex:1, fontSize:28 }}>{s.emoji}</div>
                <p style={{ fontSize:16, fontWeight:700, color:C.text, marginBottom:10 }}>{s.title}</p>
                <p style={{ fontSize:14, color:C.sub, lineHeight:1.7 }}>{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── SKILLS MARQUEE ── */}
      <section id="skills" style={{ padding:"80px 0", overflow:"hidden", borderTop:`1px solid ${C.border}` }}>
        <div style={{ textAlign:"center", marginBottom:44, padding:"0 24px" }}>
          <motion.h2 initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            style={{ fontSize:"clamp(24px,3vw,36px)", fontWeight:800, letterSpacing:"-0.7px", marginBottom:10 }}>
            Skills on SkillSync
          </motion.h2>
          <motion.p initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} transition={{ delay:0.1 }}
            style={{ fontSize:15, color:C.sub }}>
            Whatever you build with — find others who speak the same language.
          </motion.p>
        </div>

        {[
          { items:["React","Python","Flutter","Node.js","Figma","Machine Learning","Java","TypeScript","Firebase","Next.js","PostgreSQL","TailwindCSS"], dir:"mL", dur:"30s" },
          { items:["Django","Swift","Kotlin","MongoDB","Docker","TensorFlow","Unity","Arduino","C++","Go","Vue.js","Supabase","Redis","GraphQL"], dir:"mR", dur:"26s" },
        ].map((row, ri) => (
          <div key={ri} className="mrow" style={{ marginBottom: ri===0 ? 11 : 0 }}>
            {[...row.items, ...row.items].map((s,i) => (
              <span key={i} style={{ padding:"9px 20px", borderRadius:99, background:C.card, border:`1px solid ${C.border}`, color:C.sub, fontSize:13, fontWeight:500, animation:`${row.dir} ${row.dur} linear infinite`, display:"inline-block", transition:"all 0.18s", flexShrink:0, cursor:"default" }}
                onMouseEnter={e=>{ e.currentTarget.style.color=C.text; e.currentTarget.style.borderColor=C.primary+"50"; }}
                onMouseLeave={e=>{ e.currentTarget.style.color=C.sub; e.currentTarget.style.borderColor=C.border; }}
              >{s}</span>
            ))}
          </div>
        ))}
      </section>

      {/* ── CTA ── */}
      <section style={{ padding:"70px 24px 110px" }}>
        <motion.div initial={{ opacity:0, y:36 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          style={{ maxWidth:680, margin:"0 auto", background:`linear-gradient(135deg,${C.primary}18,${C.cyan}0C)`, border:`1px solid ${C.primary}28`, borderRadius:28, padding:"68px 44px", textAlign:"center", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:-70, right:-70, width:240, height:240, borderRadius:"50%", background:C.primary+"18", filter:"blur(60px)", pointerEvents:"none" }}/>
          <div style={{ position:"absolute", bottom:-50, left:-50, width:200, height:200, borderRadius:"50%", background:C.cyan+"0E", filter:"blur(50px)", pointerEvents:"none" }}/>
          <div style={{ position:"relative", zIndex:1 }}>
            <span style={{ fontSize:38, display:"block", marginBottom:16 }}>🎯</span>
            <h2 style={{ fontSize:"clamp(24px,3.5vw,38px)", fontWeight:800, letterSpacing:"-0.8px", lineHeight:1.15, marginBottom:14 }}>
              Your next great project<br/>starts with the right team.
            </h2>
            <p style={{ fontSize:16, color:C.sub, maxWidth:380, margin:"0 auto 32px", lineHeight:1.7 }}>
              Create your profile, show your skills, and find students who actually ship.
            </p>
            <Btn onClick={() => go("/auth")} size="lg" icon={<ArrowRight size={17}/>}>Get Started Free</Btn>
            <p style={{ fontSize:13, color:C.muted, marginTop:14 }}>Free to use · No credit card needed</p>
          </div>
        </motion.div>
      </section>
      
      {/* ── FOOTER ── */}
      <footer style={{ borderTop:`1px solid ${C.border}`, padding:"34px 24px" }}>
        <div className="fi" style={{ maxWidth:1100, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:9 }}>
            <div style={{ width:28, height:28, borderRadius:8, background:`linear-gradient(135deg,${C.primary},${C.cyan})`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div>
              <p style={{ fontWeight:700, fontSize:14 }}>SkillSync</p>
              <p style={{ fontSize:11, color:C.muted }}>Student collaboration, reimagined.</p>
            </div>
          </div>
          <div style={{ display:"flex", gap:28, alignItems:"center", flexWrap:"wrap" }}>
            {[["Features","features"],["How it works","how-it-works"],["Skills","skills"]].map(([l,id]) => (
              <button key={id} onClick={() => scrollTo(id)} style={{ background:"none", border:"none", color:C.muted, fontSize:13, cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif", transition:"color 0.18s" }}
                onMouseEnter={e=>e.target.style.color=C.sub} onMouseLeave={e=>e.target.style.color=C.muted}>{l}</button>
            ))}
            <span style={{ fontSize:13, color:C.muted }}>© 2025 SkillSync</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
