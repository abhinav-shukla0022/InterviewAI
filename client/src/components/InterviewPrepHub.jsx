import { useState, useEffect } from "react";
import { usePrepProgress } from "../hooks/usePrepProgress";

const FIELDS = [
  { id: "frontend", label: "Frontend Engineer", icon: "🖥️", color: "#6366f1", tags: ["React", "CSS", "JS", "TypeScript", "Performance"] },
  { id: "backend", label: "Backend Engineer", icon: "⚙️", color: "#0ea5e9", tags: ["Node.js", "APIs", "Databases", "Security", "DevOps"] },
  { id: "fullstack", label: "Full Stack", icon: "🔗", color: "#10b981", tags: ["Architecture", "Data Flow", "Deployment", "APIs", "Security"] },
  { id: "dsa", label: "DSA / Algorithms", icon: "🧠", color: "#f59e0b", tags: ["Arrays", "Trees", "Graphs", "DP", "Complexity"] },
  { id: "system-design", label: "System Design", icon: "🏗️", color: "#8b5cf6", tags: ["Scalability", "Databases", "Caching", "Microservices", "Reliability"] },
  { id: "ml", label: "Machine Learning", icon: "🤖", color: "#ec4899", tags: ["Python", "TensorFlow", "Statistics", "Feature Eng.", "MLOps"] },
];

const RESOURCES = {
  frontend: [
    { title: "React Interview Deep Dive", url: "https://www.youtube.com/watch?v=w7ejDZ8SWv8", duration: "6h 20m", thumb: "https://img.youtube.com/vi/w7ejDZ8SWv8/mqdefault.jpg" },
    { title: "CSS Grid & Flexbox Mastery", url: "https://www.youtube.com/watch?v=jV8B24rSN5o", duration: "2h 05m", thumb: "https://img.youtube.com/vi/jV8B24rSN5o/mqdefault.jpg" },
    { title: "JavaScript Performance Patterns", url: "https://www.youtube.com/watch?v=cCOL7MC4Pl0", duration: "45m", thumb: "https://img.youtube.com/vi/cCOL7MC4Pl0/mqdefault.jpg" },
    { title: "TypeScript Crash Course", url: "https://www.youtube.com/watch?v=BCg4U1FzODs", duration: "1h 30m", thumb: "https://img.youtube.com/vi/BCg4U1FzODs/mqdefault.jpg" },
  ],
  backend: [
    { title: "Backend Interview Mastery (8h)", url: "https://www.youtube.com/watch?v=ChVE-JbtYbM", duration: "8h+", thumb: "https://img.youtube.com/vi/ChVE-JbtYbM/mqdefault.jpg" },
    { title: "Node.js Design Patterns", url: "https://www.youtube.com/watch?v=ENrzD9HAZK4", duration: "3h 10m", thumb: "https://img.youtube.com/vi/ENrzD9HAZK4/mqdefault.jpg" },
    { title: "REST vs GraphQL APIs", url: "https://www.youtube.com/watch?v=yWzKJPw_VzM", duration: "30m", thumb: "https://img.youtube.com/vi/yWzKJPw_VzM/mqdefault.jpg" },
    { title: "Database Design & Indexing", url: "https://www.youtube.com/watch?v=ztHopE5Wnpc", duration: "55m", thumb: "https://img.youtube.com/vi/ztHopE5Wnpc/mqdefault.jpg" },
  ],
  fullstack: [
    { title: "Full Stack Interview Prep", url: "https://www.youtube.com/watch?v=ysEN5RaKOlA", duration: "5h+", thumb: "https://img.youtube.com/vi/ysEN5RaKOlA/mqdefault.jpg" },
    { title: "MERN Stack Deep Dive", url: "https://www.youtube.com/watch?v=7CqJlxBYj-M", duration: "3h 40m", thumb: "https://img.youtube.com/vi/7CqJlxBYj-M/mqdefault.jpg" },
    { title: "Docker & Deployment", url: "https://www.youtube.com/watch?v=gAkwW2tuIqE", duration: "1h 10m", thumb: "https://img.youtube.com/vi/gAkwW2tuIqE/mqdefault.jpg" },
    { title: "System Integration Patterns", url: "https://www.youtube.com/watch?v=rI8tNMsozo0", duration: "50m", thumb: "https://img.youtube.com/vi/rI8tNMsozo0/mqdefault.jpg" },
  ],
  dsa: [
    { title: "DSA Full Course (Abdul Bari)", url: "https://www.youtube.com/watch?v=0IAPZzGSbME", duration: "20h+", thumb: "https://img.youtube.com/vi/0IAPZzGSbME/mqdefault.jpg" },
    { title: "LeetCode Patterns & Techniques", url: "https://www.youtube.com/watch?v=A3syeQgB-qw", duration: "4h 30m", thumb: "https://img.youtube.com/vi/A3syeQgB-qw/mqdefault.jpg" },
    { title: "Dynamic Programming Masterclass", url: "https://www.youtube.com/watch?v=oBt53YbR9Kk", duration: "5h", thumb: "https://img.youtube.com/vi/oBt53YbR9Kk/mqdefault.jpg" },
    { title: "Graph Algorithms Explained", url: "https://www.youtube.com/watch?v=tWVWeAqZ0WU", duration: "2h", thumb: "https://img.youtube.com/vi/tWVWeAqZ0WU/mqdefault.jpg" },
  ],
  "system-design": [
    { title: "System Design Crash Course", url: "https://www.youtube.com/watch?v=i7twT3x5yv8", duration: "8h+", thumb: "https://img.youtube.com/vi/i7twT3x5yv8/mqdefault.jpg" },
    { title: "Designing Data-Intensive Apps", url: "https://www.youtube.com/watch?v=PdtlXdse7pw", duration: "1h 20m", thumb: "https://img.youtube.com/vi/PdtlXdse7pw/mqdefault.jpg" },
    { title: "Microservices Architecture", url: "https://www.youtube.com/watch?v=rv4LlmLmVWk", duration: "1h 45m", thumb: "https://img.youtube.com/vi/rv4LlmLmVWk/mqdefault.jpg" },
    { title: "CAP Theorem Explained", url: "https://www.youtube.com/watch?v=BHqjEjzAicA", duration: "40m", thumb: "https://img.youtube.com/vi/BHqjEjzAicA/mqdefault.jpg" },
  ],
  ml: [
    { title: "ML Interview Prep Guide", url: "https://www.youtube.com/watch?v=aircAruvnKk", duration: "10h+", thumb: "https://img.youtube.com/vi/aircAruvnKk/mqdefault.jpg" },
    { title: "Statistics for Data Scientists", url: "https://www.youtube.com/watch?v=xxpc-HPKN28", duration: "2h", thumb: "https://img.youtube.com/vi/xxpc-HPKN28/mqdefault.jpg" },
    { title: "Python ML with scikit-learn", url: "https://www.youtube.com/watch?v=pqNCD_5r0IU", duration: "1h 30m", thumb: "https://img.youtube.com/vi/pqNCD_5r0IU/mqdefault.jpg" },
    { title: "Neural Networks from Scratch", url: "https://www.youtube.com/watch?v=w8yWXqWQYmU", duration: "20m", thumb: "https://img.youtube.com/vi/w8yWXqWQYmU/mqdefault.jpg" },
  ],
};

const STRATEGIES = {
  frontend: [
    { week: 1, title: "JavaScript & TypeScript Core", tasks: ["Closures, prototypes, event loop", "TypeScript generics & utility types", "ES2020+ features", "Browser APIs & Storage"], icon: "📚" },
    { week: 2, title: "React Deep Dive", tasks: ["Hooks internals (useMemo, useCallback)", "State management patterns", "Performance optimization", "Testing with RTL"], icon: "⚛️" },
    { week: 3, title: "CSS & UI Engineering", tasks: ["CSS Grid & Flexbox mastery", "Responsive design patterns", "Accessibility (WCAG 2.1)", "Animation & performance"], icon: "🎨" },
    { week: 4, title: "Mock Interviews & Review", tasks: ["5 timed challenges/day", "Build a feature from scratch", "Review weak areas", "Behavioral questions"], icon: "🎯" },
  ],
  backend: [
    { week: 1, title: "APIs & Node.js Fundamentals", tasks: ["REST design principles", "Express middleware patterns", "Authentication (JWT, OAuth)", "Error handling strategies"], icon: "📡" },
    { week: 2, title: "Databases & Data Modeling", tasks: ["SQL vs NoSQL tradeoffs", "MongoDB aggregation pipeline", "Indexing & query optimization", "Transactions & ACID"], icon: "🗃️" },
    { week: 3, title: "Security & Scalability", tasks: ["OWASP Top 10", "Rate limiting & caching", "Message queues (Redis)", "Containerization basics"], icon: "🔐" },
    { week: 4, title: "System Polish & Practice", tasks: ["Build a REST API from scratch", "Write integration tests", "Review architecture decisions", "Mock interviews"], icon: "🎯" },
  ],
  fullstack: [
    { week: 1, title: "End-to-End Architecture", tasks: ["MVC & clean architecture", "API contract design", "Data flow & state sync", "Authentication flows"], icon: "🏗️" },
    { week: 2, title: "Frontend + Backend Integration", tasks: ["CORS & security headers", "File uploads & streams", "Real-time with WebSockets", "Error boundaries"], icon: "🔗" },
    { week: 3, title: "DevOps & Deployment", tasks: ["Docker & containerization", "CI/CD pipelines", "Environment management", "Monitoring & logging"], icon: "🚀" },
    { week: 4, title: "Project & Mock Sessions", tasks: ["Build a full-stack app", "Code review practice", "Performance profiling", "System design basics"], icon: "🎯" },
  ],
  dsa: [
    { week: 1, title: "Arrays, Strings & Hashing", tasks: ["Two-pointer & sliding window", "HashMap patterns", "String manipulation", "Prefix sums"], icon: "📊" },
    { week: 2, title: "Trees, Graphs & Recursion", tasks: ["BST operations & traversal", "BFS & DFS patterns", "Backtracking problems", "Trie implementation"], icon: "🌳" },
    { week: 3, title: "Dynamic Programming", tasks: ["Memoization vs tabulation", "Classic DP problems", "Knapsack & coin change", "Interval & sequence DP"], icon: "💡" },
    { week: 4, title: "Timed Practice & Review", tasks: ["2 LeetCode mediums/day", "1 hard problem/day", "Mock OA simulations", "Big-O analysis drills"], icon: "⏱️" },
  ],
  "system-design": [
    { week: 1, title: "Foundations & Components", tasks: ["CAP theorem & consistency", "SQL vs NoSQL selection", "Caching strategies (Redis)", "Load balancing patterns"], icon: "⚙️" },
    { week: 2, title: "Scalability Patterns", tasks: ["Horizontal vs vertical scaling", "Database sharding", "CDN & edge computing", "Rate limiting at scale"], icon: "📈" },
    { week: 3, title: "Real Systems Deep Dive", tasks: ["Design Twitter/Instagram", "Design a URL shortener", "Design a payment system", "Microservices communication"], icon: "🔭" },
    { week: 4, title: "Interview Practice", tasks: ["Timed design sessions (45 min)", "Whiteboard practice", "Estimations & back-of-envelope", "Review trade-off decisions"], icon: "🗣️" },
  ],
  ml: [
    { week: 1, title: "Math & Statistics", tasks: ["Linear algebra refresher", "Probability & Bayes theorem", "Statistical hypothesis testing", "Information theory basics"], icon: "📐" },
    { week: 2, title: "Classical ML Algorithms", tasks: ["Regression & regularization", "Decision trees & ensembles", "SVM & kernel methods", "Clustering algorithms"], icon: "🧬" },
    { week: 3, title: "Deep Learning & MLOps", tasks: ["Neural network architectures", "Training techniques & optimizers", "Model evaluation metrics", "Feature engineering"], icon: "🤖" },
    { week: 4, title: "Coding & Case Practice", tasks: ["Implement models from scratch", "ML system design questions", "A/B testing frameworks", "Mock ML interviews"], icon: "💻" },
  ],
};

const CHECKLIST_TEMPLATES = {
  frontend: ["Review React lifecycle & hooks", "Practice 10 CSS layout challenges", "Build a component library", "Study browser rendering pipeline", "Read WCAG accessibility guidelines", "Complete 20 JS algorithm problems", "Review TypeScript handbook", "Mock 3 frontend interviews"],
  backend: ["Design 3 REST APIs from scratch", "Practice SQL query optimization", "Implement JWT authentication", "Study database indexing", "Review OWASP Top 10", "Build a caching layer with Redis", "Write tests for existing APIs", "Mock 3 backend interviews"],
  fullstack: ["Build end-to-end CRUD app", "Set up CI/CD pipeline", "Practice Docker containerization", "Review WebSocket implementation", "Study microservices patterns", "Complete integration test suite", "Deploy app to cloud", "Mock 3 fullstack interviews"],
  dsa: ["Solve 50 LeetCode easy problems", "Solve 30 LeetCode medium problems", "Implement 10 data structures", "Study graph algorithms deeply", "Practice DP patterns daily", "Timed contest participation x5", "Review Big-O complexity guide", "Mock 3 OA tests"],
  "system-design": ["Design URL shortener end-to-end", "Design social media feed system", "Study distributed systems paper", "Practice estimation problems", "Design payment processing system", "Review Netflix/Twitter architecture", "Whiteboard practice sessions x5", "Mock 3 design interviews"],
  ml: ["Review linear algebra fundamentals", "Implement logistic regression", "Study backpropagation math", "Build ML pipeline end-to-end", "Practice feature engineering", "Study model evaluation metrics", "Implement a neural net from scratch", "Mock 3 ML interviews"],
};

// ─── Helper: normalize a note entry to always be { text, ts } ───────────────
const normalizeNote = (note) => {
  if (typeof note === "string") {
    return { text: note, ts: "" };
  }
  return note;
};

const CSS = `
  @keyframes ip-fadeSlide {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes ip-fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .ip-root { padding: 2rem 2.5rem; color: #e2e8f0; font-family: 'Inter', system-ui, sans-serif; min-height: 100vh; box-sizing: border-box; }
  .ip-page-header { margin-bottom: 2rem; }
  .ip-eyebrow { display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.68rem; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: #6366f1; background: #6366f115; border: 1px solid #6366f130; padding: 4px 12px; border-radius: 20px; margin-bottom: 0.875rem; }
  .ip-page-title { font-size: 2rem; font-weight: 700; color: #f8fafc; letter-spacing: -0.03em; line-height: 1.2; margin: 0 0 0.5rem; }
  .ip-page-sub { font-size: 0.9rem; color: #64748b; max-width: 520px; line-height: 1.6; }
  .ip-feature-row { display: flex; gap: 0.6rem; flex-wrap: wrap; margin-top: 1.1rem; }
  .ip-feature-pill { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.78rem; font-weight: 500; color: #94a3b8; background: #161b27; border: 1px solid #1e2535; padding: 6px 14px; border-radius: 20px; transition: border-color 0.15s, color 0.15s; }
  .ip-feature-pill:hover { border-color: #334155; color: #cbd5e1; }
  .ip-section-label { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #475569; margin-bottom: 0.875rem; }
  .ip-field-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(148px, 1fr)); gap: 0.75rem; margin-bottom: 2rem; }
  .ip-field-card { background: #161b27; border: 1.5px solid #1e2535; border-radius: 12px; padding: 1rem; cursor: pointer; transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease, opacity 0.25s ease; position: relative; }
  .ip-field-card:hover { transform: translateY(-3px) scale(1.025); box-shadow: 0 8px 24px rgba(0,0,0,0.45); }
  .ip-field-card:active { transform: scale(0.975); }
  .ip-field-card.ip-dimmed { opacity: 0.38; }
  .ip-field-card.ip-dimmed:hover { opacity: 0.9; }
  .ip-field-icon { font-size: 1.35rem; margin-bottom: 0.45rem; }
  .ip-field-label { font-size: 0.8rem; font-weight: 600; color: #94a3b8; line-height: 1.3; }
  .ip-field-label.ip-active-lbl { color: #fff; }
  .ip-prog-bar { height: 3px; background: #1e2535; border-radius: 2px; margin-top: 0.5rem; overflow: hidden; }
  .ip-prog-fill { height: 100%; border-radius: 2px; transition: width 0.5s ease; }
  .ip-prog-pct { font-size: 0.62rem; margin-top: 0.25rem; }
  .ip-stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-bottom: 1.5rem; animation: ip-fadeSlide 0.28s ease; }
  .ip-stat-card { background: #161b27; border: 1px solid #1e2535; border-radius: 12px; padding: 1rem 1.25rem; text-align: center; transition: transform 0.18s ease, border-color 0.18s ease; }
  .ip-stat-card:hover { transform: translateY(-2px); border-color: #243047; }
  .ip-stat-num { font-size: 1.5rem; font-weight: 700; }
  .ip-stat-lbl { font-size: 0.67rem; color: #64748b; margin-top: 0.2rem; text-transform: uppercase; letter-spacing: 0.08em; }
  .ip-panel { background: #161b27; border-radius: 16px; border: 1px solid #1e2535; overflow: hidden; animation: ip-fadeSlide 0.25s ease; }
  .ip-panel-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid #1e2535; display: flex; align-items: center; gap: 0.75rem; }
  .ip-panel-title { font-size: 1rem; font-weight: 700; color: #f1f5f9; }
  .ip-panel-tags { display: flex; gap: 0.35rem; flex-wrap: wrap; margin-top: 0.3rem; }
  .ip-panel-tag { font-size: 0.62rem; border-radius: 6px; padding: 2px 7px; font-weight: 600; }
  .ip-tab-bar { display: flex; gap: 0.2rem; padding: 0.7rem 1.25rem; border-bottom: 1px solid #1e2535; overflow-x: auto; }
  .ip-tab { padding: 0.38rem 1rem; border-radius: 20px; font-size: 0.775rem; font-weight: 600; cursor: pointer; border: none; transition: all 0.15s ease; white-space: nowrap; background: transparent; color: #64748b; }
  .ip-tab:hover { background: #1e2535; color: #94a3b8; }
  .ip-tab.ip-tab-active { color: #fff; }
  .ip-tab-body { padding: 1.5rem; animation: ip-fadeIn 0.2s ease; }
  .ip-strat { background: #0f1117; border-radius: 12px; border: 1px solid #1e2535; padding: 1rem 1.125rem; margin-bottom: 0.625rem; transition: border-color 0.18s, transform 0.18s; }
  .ip-strat:hover { border-color: #2a3352; transform: translateX(3px); }
  .ip-strat-week { font-size: 0.63rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.3rem; }
  .ip-strat-title { font-size: 0.875rem; font-weight: 600; color: #f1f5f9; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.45rem; }
  .ip-strat-tasks { display: flex; flex-wrap: wrap; gap: 0.35rem; }
  .ip-strat-task { font-size: 0.71rem; color: #94a3b8; background: #1a2035; border-radius: 6px; padding: 3px 8px; transition: background 0.15s, color 0.15s; cursor: default; }
  .ip-strat-task:hover { background: #243047; color: #cbd5e1; }
  .ip-tip { margin-top: 0.875rem; padding: 0.875rem 1rem; border-radius: 10px; border: 1px solid; }
  .ip-tip-label { font-size: 0.73rem; font-weight: 700; margin-bottom: 0.3rem; }
  .ip-tip-text { font-size: 0.775rem; color: #94a3b8; line-height: 1.6; }
  .ip-video-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 0.875rem; }
  .ip-video-card { background: #0f1117; border-radius: 12px; border: 1.5px solid #1e2535; overflow: hidden; cursor: pointer; transition: transform 0.18s, border-color 0.18s, box-shadow 0.18s; }
  .ip-video-card:hover { transform: translateY(-4px); box-shadow: 0 10px 28px rgba(0,0,0,0.5); }
  .ip-video-card.ip-watched { border-color: #16653450; }
  .ip-video-thumb-wrap { position: relative; overflow: hidden; }
  .ip-video-thumb { width: 100%; aspect-ratio: 16/9; object-fit: cover; display: block; transition: opacity 0.18s, transform 0.22s; }
  .ip-video-card:hover .ip-video-thumb { opacity: 0.82; transform: scale(1.03); }
  .ip-play-btn { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); background: rgba(0,0,0,0.72); border: none; border-radius: 50%; width: 38px; height: 38px; cursor: pointer; color: #fff; font-size: 0.88rem; display: flex; align-items: center; justify-content: center; transition: background 0.15s, transform 0.15s; }
  .ip-play-btn:hover { background: rgba(255,255,255,0.18); transform: translate(-50%,-50%) scale(1.12); }
  .ip-video-info { padding: 0.7rem; }
  .ip-video-title { font-size: 0.78rem; font-weight: 600; color: #e2e8f0; line-height: 1.4; margin-bottom: 0.4rem; }
  .ip-video-meta { display: flex; align-items: center; justify-content: space-between; }
  .ip-video-dur { font-size: 0.68rem; color: #64748b; }
  .ip-watch-badge { font-size: 0.61rem; font-weight: 700; padding: 2px 8px; border-radius: 10px; cursor: pointer; border: none; transition: transform 0.15s, opacity 0.15s; }
  .ip-watch-badge:hover { transform: scale(1.06); opacity: 0.9; }
  .ip-player { margin-bottom: 1.25rem; border-radius: 12px; overflow: hidden; background: #000; border: 1px solid #1e2535; animation: ip-fadeSlide 0.2s ease; }
  .ip-player-bar { display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 1rem; background: #161b27; }
  .ip-player-close { background: none; border: none; color: #64748b; cursor: pointer; font-size: 1.05rem; transition: color 0.15s; }
  .ip-player-close:hover { color: #e2e8f0; }
  .ip-player-frame { position: relative; padding-top: 56.25%; }
  .ip-player-frame iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; }
  .ip-check-prog-wrap { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
  .ip-check-prog-track { flex: 1; background: #0f1117; border-radius: 6px; height: 5px; overflow: hidden; }
  .ip-check-prog-fill { height: 100%; border-radius: 6px; transition: width 0.5s ease; }
  .ip-check-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.45rem; }
  .ip-check-item { display: flex; align-items: flex-start; gap: 0.55rem; padding: 0.65rem 0.875rem; border-radius: 10px; cursor: pointer; border: 1px solid; transition: background 0.15s, border-color 0.15s, transform 0.15s; }
  .ip-check-item:hover { transform: translateX(2px); }
  .ip-check-item.ip-done { background: #052e16; border-color: #16653450; }
  .ip-check-item.ip-undone { background: #0f1117; border-color: #1e2535; }
  .ip-check-item.ip-undone:hover { border-color: #2a3352; }
  .ip-checkbox { width: 15px; height: 15px; border-radius: 4px; flex-shrink: 0; margin-top: 1px; display: flex; align-items: center; justify-content: center; border: 2px solid; transition: all 0.15s; }
  .ip-check-text { font-size: 0.775rem; line-height: 1.4; }
  .ip-note-area { display: flex; flex-direction: column; gap: 0.875rem; }
  .ip-note-input { width: 100%; padding: 0.75rem 1rem; background: #0f1117; border: 1px solid #1e2535; border-radius: 10px; color: #e2e8f0; font-size: 0.875rem; resize: vertical; min-height: 80px; font-family: inherit; box-sizing: border-box; transition: border-color 0.15s; }
  .ip-note-input:focus { outline: none; border-color: #334155; }
  .ip-note-btn { padding: 0.45rem 1.25rem; border: none; border-radius: 8px; color: #fff; font-weight: 600; font-size: 0.8rem; cursor: pointer; margin-top: 0.5rem; transition: opacity 0.15s, transform 0.15s; }
  .ip-note-btn:hover { opacity: 0.85; transform: scale(0.98); }
  .ip-note-item { background: #0f1117; border-radius: 10px; border: 1px solid #1e2535; padding: 0.875rem 1rem; animation: ip-fadeSlide 0.2s ease; transition: border-color 0.15s; }
  .ip-note-item:hover { border-color: #2a3352; }
  .ip-note-del { float: right; background: none; border: none; color: #475569; cursor: pointer; transition: color 0.15s; font-size: 1rem; }
  .ip-note-del:hover { color: #94a3b8; }
  .ip-empty { text-align: center; padding: 3rem 1rem; color: #475569; animation: ip-fadeIn 0.3s ease; }
`;

export default function InterviewPrepHub() {
  const [selectedField, setSelectedField] = useState(null);
  const [activeTab, setActiveTab] = useState("strategy");
  const [playingVideo, setPlayingVideo] = useState(null);
  const [noteInput, setNoteInput] = useState("");

  // Connect to custom DB syncing hook directly
  const {
    notes,
    checklist,
    watchedVideos,
    loadingProgress,
    addNote: triggerAddNote,
    deleteNote: triggerDeleteNote,
    toggleChecklist,
    toggleWatchedVideo
  } = usePrepProgress(selectedField);

  const field = FIELDS.find((f) => f.id === selectedField);
  const resources = selectedField ? RESOURCES[selectedField] || [] : [];
  const strategies = selectedField ? STRATEGIES[selectedField] || [] : [];
  const checkItems = selectedField ? CHECKLIST_TEMPLATES[selectedField] || [] : [];

  useEffect(() => {
    setPlayingVideo(null);
  }, [activeTab]);

  const handleAddNote = () => {
    if (!noteInput.trim() || !selectedField) return;
    triggerAddNote(noteInput.trim());
    setNoteInput("");
  };

  // FIX 2: Safe checklist access — checklist[fid] could be undefined or not an array
  const getProgress = (fid) => {
    const items = CHECKLIST_TEMPLATES[fid] || [];
    if (!items.length) return 0;
    const checks = Array.isArray(checklist?.[fid]) ? checklist[fid] : [];
    return Math.round((checks.filter(Boolean).length / items.length) * 100);
  };

  const getVideoProgress = (fid) => {
    const total = (RESOURCES[fid] || []).length;
    const watched = watchedVideos?.[fid] || [];
    return total ? Math.round((watched.length / total) * 100) : 0;
  };

  const getYTId = (url) => url?.match(/(?:v=|\.be\/|embed\/)([^&?/]+)/)?.[1] || "";

  return (
    <>
      <style>{CSS}</style>
      <div className="ip-root">

        {/* Page header */}
        <div className="ip-page-header">
          <div className="ip-eyebrow">📖 Interview Preparation</div>
          <h1 className="ip-page-title">Notes, playlists &amp; interview learning.</h1>
          <p className="ip-page-sub">
            Pick your target field, follow the 4-week strategy, watch curated videos, tick off your prep checklist, and capture notes — all in one place.
          </p>
          <div className="ip-feature-row">
            {["🗺️ 4-week strategy", "▶️ Curated YouTube resources", "✅ Prep checklist", "📝 Notes workspace"].map((p) => (
              <span key={p} className="ip-feature-pill">{p}</span>
            ))}
          </div>
        </div>

        {/* Field selection */}
        <div className="ip-section-label">Choose your field</div>
        <div className="ip-field-grid">
          {FIELDS.map((f) => {
            const active = selectedField === f.id;
            const dimmed = selectedField && !active;
            const prog = getProgress(f.id);
            return (
              <div
                key={f.id}
                className={`ip-field-card${dimmed ? " ip-dimmed" : ""}`}
                style={{ background: active ? `${f.color}20` : "#161b27", borderColor: active ? f.color : "#1e2535" }}
                onClick={() => { setSelectedField(active ? null : f.id); setActiveTab("strategy"); setPlayingVideo(null); }}
              >
                <div className="ip-field-icon">{f.icon}</div>
                <div className={`ip-field-label${active ? " ip-active-lbl" : ""}`}>{f.label}</div>
                <div className="ip-prog-bar">
                  <div className="ip-prog-fill" style={{ width: `${prog}%`, background: f.color }} />
                </div>
                {prog > 0 && <div className="ip-prog-pct" style={{ color: active ? f.color : "#475569" }}>{prog}% done</div>}
              </div>
            );
          })}
        </div>

        {/* Loading Indicator for DB state Sync */}
        {loadingProgress && <div style={{ color: field ? field.color : "#6366f1", marginBottom: "1rem" }}>Syncing progress...</div>}

        {/* Stats + panel */}
        {selectedField && field && !loadingProgress && (
          <>
            <div className="ip-stats-row">
              {[
                { num: `${getProgress(selectedField)}%`, lbl: "Checklist" },
                { num: `${getVideoProgress(selectedField)}%`, lbl: "Videos watched" },
                { num: (notes?.[selectedField] || []).length, lbl: "Notes saved" },
              ].map((s) => (
                <div key={s.lbl} className="ip-stat-card">
                  <div className="ip-stat-num" style={{ color: field.color }}>{s.num}</div>
                  <div className="ip-stat-lbl">{s.lbl}</div>
                </div>
              ))}
            </div>

            <div className="ip-panel">
              {/* Header */}
              <div className="ip-panel-header" style={{ background: `${field.color}0e` }}>
                <span style={{ fontSize: "1.3rem" }}>{field.icon}</span>
                <div>
                  <div className="ip-panel-title">{field.label}</div>
                  <div className="ip-panel-tags">
                    {field.tags.map((t) => (
                      <span key={t} className="ip-panel-tag" style={{ background: `${field.color}1a`, color: field.color }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="ip-tab-bar">
                {[
                  { id: "strategy",  label: "📋 4-Week Strategy" },
                  { id: "videos",    label: "▶️ Video Resources" },
                  { id: "checklist", label: "✅ Prep Checklist" },
                  { id: "notes",     label: "📝 My Notes" },
                ].map((t) => (
                  <button
                    key={t.id}
                    className={`ip-tab${activeTab === t.id ? " ip-tab-active" : ""}`}
                    style={activeTab === t.id ? { background: field.color, color: "#fff" } : {}}
                    onClick={() => setActiveTab(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="ip-tab-body">

                {/* Strategy */}
                {activeTab === "strategy" && (
                  <div>
                    {strategies.map((s) => (
                      <div key={s.week} className="ip-strat">
                        <div className="ip-strat-week" style={{ color: field.color }}>Week {s.week}</div>
                        <div className="ip-strat-title"><span>{s.icon}</span>{s.title}</div>
                        <div className="ip-strat-tasks">
                          {s.tasks.map((task) => <span key={task} className="ip-strat-task">{task}</span>)}
                        </div>
                      </div>
                    ))}
                    <div className="ip-tip" style={{ background: `${field.color}0d`, borderColor: `${field.color}2a` }}>
                      <div className="ip-tip-label" style={{ color: field.color }}>💡 Pro tip</div>
                      <div className="ip-tip-text">Spend 2–3 focused hours daily. Consistency beats cramming. Revisit weak topics after each mock session.</div>
                    </div>
                  </div>
                )}

                {/* Videos */}
                {activeTab === "videos" && (
                  <div>
                    {playingVideo !== null && (
                      <div className="ip-player">
                        <div className="ip-player-bar">
                          <span style={{ fontSize: "0.77rem", color: "#94a3b8" }}>{resources[playingVideo]?.title}</span>
                          <button className="ip-player-close" onClick={() => setPlayingVideo(null)}>✕</button>
                        </div>
                        <div className="ip-player-frame">
                          <iframe
                            src={`https://www.youtube.com/embed/${getYTId(resources[playingVideo]?.url)}?autoplay=1`}
                            allowFullScreen allow="autoplay"
                            title={resources[playingVideo]?.title}
                          />
                        </div>
                      </div>
                    )}
                    <div className="ip-video-grid">
                      {resources.map((v, i) => {
                        const watched = (watchedVideos?.[selectedField] || []).includes(i);
                        return (
                          <div key={i} className={`ip-video-card${watched ? " ip-watched" : ""}`}>
                            <div className="ip-video-thumb-wrap">
                              <img src={v.thumb} alt={v.title} className="ip-video-thumb" onError={(e) => { e.target.style.display = "none"; }} />
                              <button className="ip-play-btn" onClick={() => setPlayingVideo(i)} aria-label="Play">▶</button>
                            </div>
                            <div className="ip-video-info">
                              <div className="ip-video-title">{v.title}</div>
                              <div className="ip-video-meta">
                                <span className="ip-video-dur">{v.duration}</span>
                                <button
                                  className="ip-watch-badge"
                                  style={{ background: watched ? "#14532d" : "#1e2535", color: watched ? "#4ade80" : "#94a3b8" }}
                                  onClick={(e) => { e.stopPropagation(); toggleWatchedVideo(i); }}
                                >
                                  {watched ? "✓ Watched" : "Mark Watched"}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Checklist */}
                {activeTab === "checklist" && (
                  <div>
                    <div className="ip-check-prog-wrap">
                      <div className="ip-check-prog-track">
                        <div className="ip-check-prog-fill" style={{ width: `${getProgress(selectedField)}%`, background: field.color }} />
                      </div>
                      <span style={{ fontSize: "0.8rem", color: field.color, fontWeight: "600" }}>{getProgress(selectedField)}% complete</span>
                    </div>
                    <div className="ip-check-grid">
                      {checkItems.map((item, idx) => {
                        const isDone = !!(checklist?.[selectedField]?.[idx]);
                        return (
                          <div
                            key={idx}
                            className={`ip-check-item ${isDone ? "ip-done" : "ip-undone"}`}
                            onClick={() => toggleChecklist(idx)}
                          >
                            <div className="ip-checkbox" style={{ borderColor: isDone ? "#4ade80" : "#334155", background: isDone ? "#22c55e" : "transparent" }}>
                              {isDone && "✓"}
                            </div>
                            <span className="ip-check-text" style={{ color: isDone ? "#cbd5e1" : "#94a3b8", textDecoration: isDone ? "line-through" : "none" }}>{item}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {activeTab === "notes" && (
                  <div className="ip-note-area">
                    <div>
                      <textarea
                        className="ip-note-input"
                        placeholder={`Take an interview note for ${field.label}...`}
                        value={noteInput}
                        onChange={(e) => setNoteInput(e.target.value)}
                      />
                      <button className="ip-note-btn" style={{ background: field.color }} onClick={handleAddNote}>
                        Save Note
                      </button>
                    </div>
                    <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {(notes?.[selectedField] || []).length === 0 ? (
                        <div className="ip-empty">No notes saved yet for this topic.</div>
                      ) : (
                        // FIX 1: Normalize each note — handle both plain strings and {text, ts} objects
                        (notes[selectedField]).map((rawNote, index) => {
                          const note = normalizeNote(rawNote);
                          return (
                            <div key={index} className="ip-note-item">
                              <button className="ip-note-del" onClick={() => triggerDeleteNote(index)}>✕</button>
                              <div style={{ fontSize: "0.875rem", color: "#f1f5f9", whiteSpace: "pre-wrap" }}>
                                {note.text}
                              </div>
                              {note.ts && (
                                <div style={{ fontSize: "0.68rem", color: "#475569", marginTop: "0.5rem" }}>
                                  {note.ts}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
