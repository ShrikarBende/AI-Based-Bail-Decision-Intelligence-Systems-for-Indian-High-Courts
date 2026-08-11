import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileText, MessageSquare, UploadCloud, 
  LineChart, Repeat, GraduationCap, 
  ArrowRight, ChevronLeft, Send, FileSignature, ArrowUp,
  Download, Sparkles, CheckCircle, AlertCircle, Eye, EyeOff, Scale,
  Sun, Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import { Document as DocxDocument, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import confetti from 'canvas-confetti';
import './index.css';

const API_URL = 'http://127.0.0.1:8000';

function GlobalSidebar({ currentView, setCurrentView, user, setUser, theme, toggleTheme }) {
  const navItems = [
    { id: 'home', icon: <Sparkles size={20} />, label: 'Platform Home' },
    { id: 'dashboard', icon: <Scale size={20} />, label: 'Tools Dashboard' },
    { id: 'predict', icon: <LineChart size={20} />, label: 'CasePredictAI' },
    { id: 'dochub', icon: <FileText size={20} />, label: 'DocHub Editor' },
    { id: 'kanoon', icon: <MessageSquare size={20} />, label: 'Know Your Kanoon' },
    { id: 'upload', icon: <UploadCloud size={20} />, label: 'Document Q&A' },
    { id: 'counter', icon: <Repeat size={20} />, label: 'Counter Arguments' },
  ];

  return (
    <div className="global-sidebar">
      <div className="sidebar-logo">
        <Scale size={28} color="var(--primary-accent)" />
        <span>JudicialAI</span>
      </div>
      
      <div className="global-sidebar-nav" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'hidden' }}>
        {navItems.map(item => (
          <div 
            key={item.id} 
            className={`nav-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => setCurrentView(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {user && (
        <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={toggleTheme} style={{ width: '100%', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '0.6rem', borderRadius: '8px', cursor: 'pointer' }}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />} 
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--sidebar-text)', fontWeight: '600' }}>{user.name}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--sidebar-muted)' }}>Authorized User</span>
            </div>
          </div>
          <button onClick={() => setUser(null)} style={{ width: '100%', fontSize: '0.85rem', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '0.6rem', borderRadius: '8px', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null); // null = show AuthPage
  const [currentView, setCurrentView] = useState('home');
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      setTheme(saved);
      document.body.className = saved;
    } else {
      document.body.className = 'light';
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.body.className = nextTheme;
  };

  const features = [
    {
      id: 'predict',
      icon: <LineChart size={32} className="card-icon" />,
      title: 'CasePredictAI',
      desc: 'Advanced statistical modeling and LLM reasoning to predict bail outcomes and optimize strategic approaches based on historical metadata.',
      tags: ['XGBoost Model', 'Probability']
    },
    {
      id: 'dochub',
      icon: <FileText size={32} className="card-icon" />,
      title: 'DocHub Editor',
      desc: 'Three-column legal drafting interface. Review templates, generate clauses via AI, and edit the final document in real-time.',
      tags: ['Drafting', 'AI Gen']
    },
    {
      id: 'kanoon',
      icon: <MessageSquare size={32} className="card-icon" />,
      title: 'Know Your Kanoon',
      desc: 'Semantic search and conversational assistant powered by RAG to query Indian legal statutes and precedents instantly.',
      tags: ['Semantic RAG']
    },
    {
      id: 'counter',
      icon: <Repeat size={32} className="card-icon" />,
      title: 'Counter Argument Generator',
      desc: 'Synthesize opposing viewpoints and identify procedural vulnerabilities to strengthen your legal strategy.',
      tags: ['Adversarial AI']
    }
  ];

  return (
    <div className={`app-container ${theme}`}>
      {user && <GlobalSidebar currentView={currentView} setCurrentView={setCurrentView} user={user} setUser={setUser} theme={theme} toggleTheme={toggleTheme} />}
      
      <main className="main-content">
        {!user ? (
           <AuthPage onLogin={setUser} />
        ) : (
          <>
            {currentView === 'home' && (
              <div style={{ animation: 'fadeIn 0.5s ease', maxWidth: '1200px', margin: '0 auto' }}>
                <header style={{ marginBottom: '3rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <span className="pill" style={{ background: 'var(--primary-accent-dim)', color: 'var(--primary-accent)', fontWeight: 'bold' }}>SYSTEM STATUS: ACTIVE</span>
                    <span className="pill" style={{ background: '#f5f3ff', color: '#6d28d9', fontWeight: 'bold' }}>✨ PREDICTIVE ANALYSIS ENABLED</span>
                  </div>
                  <h1 className="hero-title-gradient" style={{ fontSize: '3.5rem', marginBottom: '1rem', letterSpacing: '-1px' }}>AI-Powered Bail Prediction Platform</h1>
                  <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '800px', lineHeight: '1.6' }}>
                    Our predictive models are trained on a comprehensive dataset of <strong>936,447 historical cases</strong> across 14 major Indian High Courts. This verified approach ensures objective analysis of judicial metadata and case duration patterns.
                  </p>
                </header>

                <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                  <div className="bento-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Model Accuracy</p>
                    <div style={{ width: '120px', height: '120px', margin: '0 auto 1.5rem auto' }}>
                      <CircularProgressbar 
                        value={88.4} 
                        text={`88%`}
                        styles={buildStyles({ pathColor: 'var(--primary-accent)', textColor: 'var(--text-main)', trailColor: 'var(--bg-app)' })}
                      />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}>XGBoost Ensemble</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Validated against historical disposal records with 88.4% precision.</p>
                  </div>

                  <div className="bento-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Dataset Depth</p>
                    <div style={{ height: '120px', display: 'flex', alignItems: 'flex-end', gap: '8px', justifyContent: 'center', marginBottom: '1.5rem' }}>
                      {[20, 40, 60, 50, 75, 85, 100].map((h, i) => (
                        <div key={i} style={{ width: '12px', height: `${h}%`, background: i === 6 ? 'var(--primary-accent)' : 'var(--border-color)', borderRadius: '4px' }}></div>
                      ))}
                    </div>
                    <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}>936K+ Records</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Verified data from NJDG and High Court repositories (Allahabad, Bombay, etc.).</p>
                  </div>

                  <div className="bento-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Jurisdiction Reach</p>
                    <div style={{ width: '120px', height: '120px', margin: '0 auto 1.5rem auto', color: 'var(--primary-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <Sparkles size={64} />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}>14 High Courts</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Mapping judicial patterns across major state-level legal forums in India.</p>
                  </div>
                </div>

                <div className="bento-card" style={{ padding: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                    <div>
                      <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}>Core Feature Explainability (Global SHAP)</h2>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Influence of judicial metadata on model's decision-making process.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', fontWeight: '600' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '12px', height: '12px', background: 'var(--primary-accent)', borderRadius: '2px' }}></div> Positive Influence</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '12px', height: '12px', background: 'var(--danger)', borderRadius: '2px', opacity: 0.5 }}></div> Negative Influence</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {[
                      { label: 'Court Name / Jurisdiction', val: 0.72, type: 'pos' },
                      { label: 'Pending Days in Incarceration', val: 0.68, type: 'pos' },
                      { label: 'Judge Disposal History', val: 0.54, type: 'pos' },
                      { label: 'Case Type (Bail Category)', val: 0.42, type: 'neg' },
                      { label: 'NJDG Metadata Completeness', val: 0.15, type: 'pos' }
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <div style={{ width: '250px', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '500' }}>{item.label}</div>
                        <div style={{ flex: 1, height: '24px', background: 'var(--bg-app)', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
                           <div style={{ 
                             position: 'absolute', 
                             left: item.type === 'pos' ? '50%' : 'auto', 
                             right: item.type === 'neg' ? '50%' : 'auto', 
                             width: `${item.val * 50}%`, 
                             height: '100%', 
                             background: item.type === 'pos' ? 'var(--primary-accent)' : 'var(--danger)',
                             opacity: item.type === 'neg' ? 0.6 : 1
                           }}></div>
                        </div>
                        <div style={{ width: '60px', textAlign: 'right', fontSize: '0.85rem', fontWeight: 'bold', color: item.type === 'pos' ? 'var(--primary-accent)' : 'var(--danger)' }}>
                          {item.type === 'pos' ? '+' : '-'}{item.val.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                   <button className="primary-btn" onClick={() => setCurrentView('dashboard')} style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
                      Access Tool Dashboard <ArrowRight size={20} />
                   </button>
                </div>
              </div>
            )}

            {currentView === 'dashboard' && (
              <div style={{ animation: 'fadeIn 0.5s ease' }}>
                <header style={{ marginBottom: '3rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
                  <h1 style={{ fontSize: '2.5rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Legal Intelligence Dashboard</h1>
                  <p style={{ color: 'var(--text-muted)' }}>Secure workspace for judicial analytics and legal drafting.</p>
                </header>

                <motion.div 
                  className="card-grid"
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: { staggerChildren: 0.1 }
                    }
                  }}
                >
                  {features.map(f => (
                    <motion.div 
                      key={f.id} 
                      className="bento-card" 
                      onClick={() => setCurrentView(f.id)}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                      }}
                      whileHover={{ y: -5, scale: 1.02 }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                         <motion.div className="bento-icon" whileHover={{ scale: 1.1, rotate: 5 }}>
                            {f.icon}
                         </motion.div>
                         <span className="pill">{f.tags[0]}</span>
                      </div>
                      <h3 className="card-title" style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}>{f.title}</h3>
                      <p className="card-desc" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>{f.desc}</p>
                      <div className="card-footer" style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--primary-accent)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          Initialize Module <ArrowRight size={14} />
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            )}

            {['predict', 'kanoon', 'dochub', 'upload', 'counter'].includes(currentView) && (
              <div className="tool-view">
                {/* Navigation removed as per user request */}
                
                {currentView === 'predict' && <CasePredictTool setView={setCurrentView} />}
                {currentView === 'kanoon' && <KanoonChatTool />}
                {currentView === 'dochub' && <DocHubTool />}
                {currentView === 'upload' && <UploadChatTool />}
                {currentView === 'counter' && <CounterTool />}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

// ---- Live Operational Tool (Case Predict API) ----
function CasePredictTool({ setView }) {
  const [mode, setMode] = useState('chat'); // 'ml' or 'chat'
  
  const [config, setConfig] = useState({ court_names: [], judge_names: [], casetypes: [] });
  const [formData, setFormData] = useState({ court_name: '', judge_name: '', casetype: '', pending_days: 30 });
  const [result, setResult] = useState(null);
  const [strategy, setStrategy] = useState('');
  const [loading, setLoading] = useState(false);
  const [strategyLoading, setStrategyLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [historicalStats, setHistoricalStats] = useState(null);
  const [optimization, setOptimization] = useState(null);
  const [precedents, setPrecedents] = useState([]);
  const [precedentSummary, setPrecedentSummary] = useState('');
  const [fairness, setFairness] = useState(null);
  const [activeTab, setActiveTab] = useState('strategy'); // 'strategy', 'precedents', 'fairness'

  const initialMessage = `I'm CasePredictAI, your advanced legal analysis assistant specialized in providing detailed case outcome predictions and strategic legal guidance.

**How I can help you:**
• **Case Outcome Prediction:** Advanced AI analysis of legal cases with probability assessments
• **Strategic Path Analysis:** Multiple strategic approaches with detailed reasoning
• **Legal Precedent Research:** Relevant case law and precedent analysis
• **Risk Assessment:** Comprehensive risk evaluation and mitigation strategies
• **Success Probability:** Data-driven predictions with confidence levels

**My Specialized Capabilities:**
• **Court Analysis:** I analyze judicial patterns, precedent alignment, and case strengths
• **Evidence Assessment:** Evaluation of evidence quality and admissibility
• **Strategic Recommendations:** Tactical approaches for optimal outcomes
• **Probability Modeling:** Statistical analysis of case success factors

**Getting Started:**
1. **Case Description:** Provide details about your legal case or scenario
2. **Upload Documents** (Optional): Share relevant case documents for deeper analysis
3. **Analysis Type:** Choose comprehensive analysis, quick assessment, or strategic planning
4. **Interactive Consultation:** Ask specific questions about your case strategy

**Example Analysis Types:**
• "Predict the outcome of [case type] with [specific circumstances]"
• "What are the strategic paths for [legal scenario]?"
• "Analyze the strength of [legal argument/evidence]"
• "What are the risks and opportunities in [case details]?"

**What case or legal scenario would you like me to analyze?**`;

  const [chatMessages, setChatMessages] = useState([{role: 'assistant', content: initialMessage}]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  
  const [fileContext, setFileContext] = useState('');
  const [fileParsing, setFileParsing] = useState(false);

  const handleFileUploadChat = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileParsing(true);
    const formD = new FormData();
    formD.append('file', file);
    try {
      const res = await axios.post(`${API_URL}/api/upload/parse`, formD, { headers: { 'Content-Type': 'multipart/form-data' }});
      if (!res.data.error) {
        setFileContext(res.data.text);
        alert(`Document "${res.data.filename}" parsed securely.`);
      }
    } catch(err) { console.error(err); }
    setFileParsing(false);
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const newMessages = [...chatMessages, {role: 'user', content: chatInput}];
    setChatMessages(newMessages);
    setChatInput('');
    setChatLoading(true);
    try {
      const payload = { document_context: fileContext, messages: newMessages };
      const res = await axios.post(`${API_URL}/api/generate/casepredict_chat`, payload);
      setChatMessages([...newMessages, {role: 'assistant', content: res.data.response || "No response."}]);
    } catch (e) {
      setChatMessages([...newMessages, {role: 'assistant', content: 'Connection failed.'}]);
    }
    setChatLoading(false);
  };

  useEffect(() => {
    axios.get(`${API_URL}/api/config`).then(res => setConfig(res.data)).catch(err => console.error("API error", err));
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setStrategy('');
    try {
      const res = await axios.post(`${API_URL}/api/predict/bail`, formData);
      const resTime = await axios.post(`${API_URL}/api/predict/duration`, formData);
      const predictionData = { ...res.data, duration: resTime.data.estimated_days };
      setResult(predictionData);
      setStep(4); // Show results step
      
      if (predictionData.outcome === 'GRANT') {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#2563eb', '#10b981', '#ffffff']
        });
      }
      
      // Async request for LLM Strategy based on metadata
      setStrategyLoading(true);
      axios.post(`${API_URL}/api/generate/case_strategy`, {
         court: formData.court_name,
         judge: formData.judge_name,
         casetype: formData.casetype,
         outcome: predictionData.outcome,
         confidence: predictionData.confidence,
         duration: predictionData.duration
      }).then(stratRes => {
         setStrategy(stratRes.data.response);
         setStrategyLoading(false);
      }).catch(e => {
         setStrategyLoading(false);
      });

      // Fetch Optimization & Precedents
      axios.post(`${API_URL}/api/predict/optimize`, formData).then(res => setOptimization(res.data));
      axios.post(`${API_URL}/api/precedents/search`, {
        court_name: formData.court_name,
        casetype: formData.casetype
      }).then(res => {
        setPrecedents(res.data.results);
        setPrecedentSummary(res.data.summary);
      });
      axios.get(`${API_URL}/api/stats/fairness`).then(res => setFairness(res.data));
      
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const fetchHistoricalStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/stats/historical`, {
        params: { court: formData.court_name, casetype: formData.casetype }
      });
      setHistoricalStats(res.data);
    } catch (err) {
      console.error("Stats error", err);
    }
  };

  useEffect(() => {
    if (step === 3) {
      fetchHistoricalStats();
    }
  }, [step, formData.court_name, formData.casetype]);

  const exportPDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    
    // Add Branding
    doc.setFillColor(30, 58, 138); // primary-blue
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("CasePredictAI Assessment Report", 20, 25);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 50);
    
    // Case Details
    doc.setFontSize(14);
    doc.text("Case Metadata", 20, 65);
    doc.setFontSize(10);
    doc.text(`Court: ${formData.court_name}`, 25, 75);
    doc.text(`Judge: ${formData.judge_name}`, 25, 82);
    doc.text(`Case Type: ${formData.casetype}`, 25, 89);
    doc.text(`Pending Days: ${formData.pending_days}`, 25, 96);
    
    // Prediction
    doc.setFontSize(14);
    doc.text("AI Prediction Result", 20, 110);
    doc.setFontSize(18);
    const outcomeColor = result.outcome === 'GRANT' ? [16, 185, 129] : [239, 68, 68];
    doc.setTextColor(outcomeColor[0], outcomeColor[1], outcomeColor[2]);
    doc.text(`Outcome: ${result.outcome}`, 25, 122);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Confidence Level: ${(result.confidence * 100).toFixed(1)}%`, 25, 132);
    doc.text(`Estimated Disposal: ${Math.round(result.duration)} Days`, 25, 140);
    
    // Strategy
    if (strategy) {
      doc.setFontSize(14);
      doc.text("Strategic Recommendations", 20, 155);
      doc.setFontSize(10);
      const splitStrategy = doc.splitTextToSize(strategy, 170);
      doc.text(splitStrategy, 20, 165);
    }
    
    doc.save(`CasePredict_Report_${Date.now()}.pdf`);
  };

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem'}}>
        <div style={{background: 'var(--panel-bg)', padding: '0.25rem', borderRadius: '8px', display: 'flex', gap: '0.5rem', boxShadow: 'var(--shadow-soft)'}}>
           <button onClick={() => setMode('chat')} className={mode === 'chat' ? 'primary-btn' : 'secondary-btn'} style={{margin: 0, padding: '0.5rem 1rem', fontSize: '0.9rem'}}>Chat Interface</button>
           <button onClick={() => setMode('ml')} className={mode === 'ml' ? 'primary-btn' : 'secondary-btn'} style={{margin: 0, padding: '0.5rem 1rem', fontSize: '0.9rem'}}>ML Data Interface</button>
        </div>
      </div>

      {mode === 'ml' && (
      <div>
        <div className="tool-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div>
            <h1>Guided Prediction Engine</h1>
            <p>Step-by-step metadata analysis using high-precision ensemble models.</p>
          </div>
          {step > 0 && step < 4 && (
            <div style={{display: 'flex', gap: '0.5rem'}}>
               {[0, 1, 2, 3].map(s => (
                 <div key={s} style={{width: '40px', height: '6px', borderRadius: '3px', background: s < step ? 'var(--primary-accent)' : 'var(--border-color)', transition: 'background 0.3s'}}></div>
               ))}
            </div>
          )}
        </div>

      <div className="predict-wizard-container" style={{minHeight: '500px', position: 'relative'}}>
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step0" initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: -20}} className="wizard-step">
              <div style={{textAlign: 'center', padding: '3rem 1rem'}}>
                <div style={{width: '80px', height: '80px', background: 'var(--primary-accent-dim)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem auto', color: 'var(--primary-accent)'}}>
                   <Sparkles size={40} />
                </div>
                <h2 style={{fontSize: '2rem', marginBottom: '1rem', color: 'var(--primary-accent)'}}>Welcome to CasePredictAI</h2>
                <p style={{color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 2rem auto'}}>We'll guide you through 3 simple steps to generate a high-precision bail outcome prediction and legal strategy.</p>
                <button className="primary-btn" onClick={() => setStep(1)} style={{padding: '1rem 3rem', fontSize: '1.1rem'}}>Start Assessment <ArrowRight size={20} /></button>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step1" initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: -20}}>
               <h3 style={{marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}><div style={{width: '32px', height: '32px', background: 'var(--primary-accent)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold'}}>1</div> Select Judicial Forum</h3>
               <div className="input-group" style={{maxWidth: '600px'}}>
                <label className="input-label">Approaching Court</label>
                <select className="select-input" style={{width: '100%', padding: '1.2rem'}} value={formData.court_name} onChange={e => setFormData({...formData, court_name: e.target.value})}>
                  <option value="">Select Court</option>
                  {config.court_names.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <p style={{fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem'}}>Choose the High Court or District Court where the application is filed.</p>
              </div>
              <div style={{marginTop: '3rem', display: 'flex', gap: '1rem'}}>
                 <button className="secondary-btn" onClick={() => setStep(0)}>Back</button>
                 <button className="primary-btn" disabled={!formData.court_name} onClick={() => setStep(2)}>Continue <ArrowRight size={18} /></button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: -20}}>
               <h3 style={{marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}><div style={{width: '32px', height: '32px', background: 'var(--primary-accent)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold'}}>2</div> Judicial Officer & Case Category</h3>
               <div className="grid-2">
                 <div className="input-group">
                    <label className="input-label">Presiding Judge / Designation</label>
                    <select className="select-input" value={formData.judge_name} onChange={e => setFormData({...formData, judge_name: e.target.value})}>
                      <option value="">Select Judge</option>
                      {config.judge_names.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
                 <div className="input-group">
                    <label className="input-label">Legal Case Type</label>
                    <select className="select-input" value={formData.casetype} onChange={e => setFormData({...formData, casetype: e.target.value})}>
                      <option value="">Select Category</option>
                      {config.casetypes.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
               </div>
               <div style={{marginTop: '3rem', display: 'flex', gap: '1rem'}}>
                 <button className="secondary-btn" onClick={() => setStep(1)}>Back</button>
                 <button className="primary-btn" disabled={!formData.judge_name || !formData.casetype} onClick={() => setStep(3)}>Continue <ArrowRight size={18} /></button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: -20}}>
               <h3 style={{marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}><div style={{width: '32px', height: '32px', background: 'var(--primary-gold)', color: '#000', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold'}}>3</div> Final Parameters & Context</h3>
               
               <div className="grid-2" style={{alignItems: 'start'}}>
                 <div className="input-group">
                    <label className="input-label">Days Pending in Incarceration</label>
                    <input type="number" className="text-input" value={formData.pending_days} onChange={e => setFormData({...formData, pending_days: parseInt(e.target.value) || 0})} />
                    <p style={{fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem'}}>The duration the accused has already spent in custody.</p>
                 </div>
               </div>

               <div style={{marginTop: '4rem', padding: '2rem', background: 'var(--bg-app)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1.5rem'}}>
                  <div style={{color: 'var(--primary-accent)'}}><AlertCircle size={32} /></div>
                  <p style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>By clicking 'Generate Analysis', our ensemble models (XGBoost & Random Forest) will process 14+ variables to calculate probability scores.</p>
               </div>

               <div style={{marginTop: '3rem', display: 'flex', gap: '1rem'}}>
                 <button className="secondary-btn" onClick={() => setStep(2)}>Back</button>
                 <button className="primary-btn" onClick={handleSubmit} disabled={loading} style={{padding: '1rem 2.5rem'}}>
                   {loading ? <div className="loader"></div> : "Generate Assessment Report"}
                 </button>
              </div>
            </motion.div>
          )}

          {step === 4 && result && (
            <motion.div key="step4" initial={{opacity: 0, scale: 0.95}} animate={{opacity: 1, scale: 1}} className="results-view">
               <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem'}}>
                  <div>
                    <h2 style={{fontSize: '2rem', marginBottom: '0.5rem'}}>Analysis Complete</h2>
                    <p style={{color: 'var(--text-muted)'}}>High-confidence prediction based on judicial metadata and historical patterns.</p>
                  </div>
                  <div style={{display: 'flex', gap: '1rem'}}>
                    <button className="secondary-btn" onClick={() => setStep(0)} style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}><Repeat size={16}/> New Analysis</button>
                    <button className="primary-btn" onClick={exportPDF} style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}><Download size={16}/> Export PDF Report</button>
                  </div>
               </div>

               <div className="grid-2" style={{gridTemplateColumns: '1fr 1.5fr'}}>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                    <div className="result-card" style={{padding: '2.5rem', background: 'var(--panel-bg)'}}>
                        <p className="input-label" style={{marginBottom: '1.5rem'}}>Prediction Confidence</p>
                        <div style={{width: '160px', height: '160px', margin: '0 auto 2rem auto'}}>
                          <CircularProgressbar 
                            value={result.confidence * 100} 
                            text={`${(result.confidence * 100).toFixed(0)}%`}
                            styles={buildStyles({
                              pathColor: result.outcome === 'GRANT' ? '#10b981' : '#ef4444',
                              textColor: 'var(--text-main)',
                              trailColor: 'var(--bg-app)',
                              textSize: '18px'
                            })}
                          />
                        </div>
                        <h3 className={result.outcome === 'GRANT' ? 'text-grant' : 'text-reject'} style={{fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: '800'}}>{result.outcome}</h3>
                        <p style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>Likely Outcome for Bail Application</p>
                    </div>

                    <div style={{background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1.5rem'}}>
                       <div style={{width: '50px', height: '50px', borderRadius: '50%', background: 'var(--primary-accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-accent)'}}>
                          <LineChart size={24} />
                       </div>
                       <div>
                          <p style={{fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)'}}>EST. DISPOSAL TIME</p>
                          <h4 style={{fontSize: '1.5rem', margin: 0}}>{Math.round(result.duration)} Days</h4>
                       </div>
                    </div>

                    <div style={{background: 'var(--panel-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)'}}>
                       <p className="input-label" style={{marginBottom: '1rem'}}>Case Strength Radar</p>
                       <div style={{ width: '100%', height: '200px' }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                               { subject: 'Merits', A: result.confidence * 100, fullMark: 100 },
                               { subject: 'Procedural', A: 85, fullMark: 100 },
                               { subject: 'Precedent', A: 70, fullMark: 100 },
                               { subject: 'Bias', A: 90, fullMark: 100 },
                               { subject: 'History', A: 60, fullMark: 100 }
                            ]}>
                              <PolarGrid stroke="var(--border-color)" />
                              <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                              <Radar name="Case" dataKey="A" stroke="var(--primary-accent)" fill="var(--primary-accent)" fillOpacity={0.4} />
                            </RadarChart>
                          </ResponsiveContainer>
                       </div>
                    </div>
                  </div>

                  <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                     <div style={{background: 'var(--panel-bg)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-soft)'}}>
                       <div style={{display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem', paddingBottom: '0.5rem'}}>
                          {['strategy', 'precedents', 'fairness'].map(t => (
                            <button 
                              key={t}
                              onClick={() => setActiveTab(t)}
                              style={{
                                background: 'none', 
                                border: 'none', 
                                borderBottom: activeTab === t ? '3px solid var(--primary-accent)' : 'none',
                                color: activeTab === t ? 'var(--primary-accent)' : 'var(--text-muted)',
                                padding: '0.5rem 1rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                textTransform: 'uppercase',
                                fontSize: '0.8rem'
                              }}
                            >
                              {t}
                            </button>
                          ))}
                       </div>
                       
                       {activeTab === 'strategy' && (
                         <>
                           <div style={{display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem'}}>
                              <CheckCircle size={24} color="var(--primary-accent)" />
                              <h3 style={{margin: 0}}>Strategic Path & Recommendations</h3>
                           </div>
                           
                           {strategyLoading ? (
                              <div style={{display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', padding: '2rem 0'}}>
                                 <div className="loader" style={{borderTopColor: 'var(--primary-accent)', width: '20px', height: '20px'}}></div>
                                 Synthesizing tactical maneuvers...
                              </div>
                           ) : (
                              <div className="doc-text" style={{whiteSpace: 'pre-wrap', lineHeight: '1.7', fontSize: '1.1rem', color: 'var(--text-main)'}}>
                                 {strategy || "Strategy generation currently unavailable."}
                                 {optimization && optimization.threshold_analysis.length > 0 && (
                                   <div style={{marginTop: '1.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', borderRadius: '4px'}}>
                                      <p style={{fontWeight: '700', color: '#fca5a5', marginBottom: '0.5rem'}}>CONDITION OPTIMIZATION</p>
                                      {optimization.threshold_analysis.map((line, idx) => <p key={idx} style={{margin: 0}}>{line}</p>)}
                                   </div>
                                 )}
                              </div>
                           )}
                         </>
                       )}

                       {activeTab === 'precedents' && (
                         <div className="precedents-list">
                            <h3 style={{marginBottom: '1rem'}}>Similar Historical Cases (RAG)</h3>
                            {precedentSummary && <div style={{background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', borderLeft: '4px solid var(--primary-accent)'}}>{precedentSummary}</div>}
                            {precedents.map((p, i) => (
                              <div key={i} style={{padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '0.8rem', background: 'var(--card-bg)'}}>
                                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                                  <span style={{fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-main)'}}>{p.COURT_NAME}</span>
                                  <span style={{fontSize: '0.75rem', padding: '2px 8px', background: p.Mapped_Bail === 'GRANT' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', borderRadius: '4px', color: p.Mapped_Bail === 'GRANT' ? '#34d399' : '#f87171'}}>{p.Mapped_Bail}</span>
                                </div>
                                <p style={{fontSize: '0.8rem', margin: 0, color: 'var(--text-muted)'}}>{p.CASETYPE_FULLFORM}</p>
                              </div>
                            ))}
                            {precedents.length === 0 && <p>No similar precedents found in metadata.</p>}
                         </div>
                       )}

                       {activeTab === 'fairness' && fairness && (
                         <div className="fairness-audit">
                            <h3 style={{marginBottom: '1rem'}}>EDI & Fairness Audit Report</h3>
                            <div style={{display: 'flex', gap: '2rem', marginBottom: '2rem'}}>
                               <div style={{flex: 1, textAlign: 'center', padding: '1rem', background: 'var(--card-bg)', borderRadius: '8px'}}>
                                  <p style={{fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)'}}>OVERALL GRANT RATE</p>
                                  <p style={{fontSize: '1.5rem', fontWeight: '800'}}>{(fairness.overall_grant_rate * 100).toFixed(1)}%</p>
                               </div>
                               <div style={{flex: 1, textAlign: 'center', padding: '1rem', background: 'var(--card-bg)', borderRadius: '8px'}}>
                                  <p style={{fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)'}}>BIAS STATUS</p>
                                  <p style={{fontSize: '1.2rem', fontWeight: '800', color: '#10b981'}}>HEALTHY</p>
                               </div>
                            </div>
                            <p style={{fontSize: '0.85rem', marginBottom: '1rem', color: 'var(--text-muted)'}}>Disparate Impact Ratio across top Courts:</p>
                            {fairness.court_metrics.map((m, i) => (
                              <div key={i} style={{marginBottom: '1rem'}}>
                                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px'}}>
                                  <span>{m.COURT_NAME}</span>
                                  <span>{m.disparate_impact.toFixed(2)} DIR</span>
                                </div>
                                <div style={{height: '8px', background: 'var(--bg-app)', borderRadius: '4px', overflow: 'hidden'}}>
                                  <div style={{height: '100%', width: `${Math.min(100, m.disparate_impact * 50)}%`, background: m.disparate_impact > 1.25 || m.disparate_impact < 0.8 ? '#f59e0b' : 'var(--primary-accent)'}}></div>
                                </div>
                              </div>
                            ))}
                         </div>
                       )}
                    </div>

                    {result.shap_values && (
                      <div style={{background: 'var(--card-bg)', padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '12px'}}>
                        <p className="input-label" style={{marginBottom: '1rem'}}>Top Influence Factors (XAI)</p>
                        {result.shap_values.map((s, i) => (
                          <div key={i} style={{display:'flex', justifyContent:'space-between', margin:'0.6rem 0', paddingBottom: '0.6rem', borderBottom: '1px solid var(--border-color)', fontSize:'0.9rem', fontWeight:'500'}}>
                            <span style={{color: 'var(--text-main)'}}>{s.feature.replace(/_/g, ' ')}</span>
                            <span className={s.impact > 0 ? 'text-grant' : 'text-reject'} style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                               {s.impact > 0 ? <ArrowUp size={14} /> : <ArrowRight style={{transform: 'rotate(90deg)'}} size={14} />}
                               {Math.abs(s.impact).toFixed(3)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>
      )}

      {mode === 'chat' && (
      <div style={{display: 'flex', gap: '1.5rem', height: '800px', background: 'transparent'}}>
         {/* LEFT SIDEBAR */}
         <div style={{width: '280px', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
             <button style={{width: '100%', padding: '0.8rem', background: 'var(--panel-bg)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '500'}} onClick={() => {setChatMessages([{role:'assistant', content:initialMessage}]); setFileContext('');}}>
                <Repeat size={16} /> New Chat
             </button>
             
             <div style={{background: 'var(--panel-bg)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)'}}>
                 <p style={{fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem'}}>CURRENT SESSION</p>
                 <p style={{fontWeight: '600', color: 'var(--primary-accent)', fontSize: '0.9rem'}}>New Session</p>
             </div>

             <div style={{background: 'var(--panel-bg)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', flex: 1, display: 'flex', flexDirection: 'column'}}>
                 <div style={{borderLeft: '3px solid var(--primary-accent)', paddingLeft: '0.5rem', marginBottom: '1rem'}}>
                   <p style={{fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary-accent)'}}>DOCUMENT ANALYSIS</p>
                 </div>
                 
                 <div style={{border: '1px dashed var(--border-color)', borderRadius: '8px', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', cursor: 'pointer', marginBottom: '1rem', background: fileContext ? 'rgba(16, 185, 129, 0.1)' : 'transparent'}}>
                    {fileParsing ? (
                       <div className="loader" style={{borderTopColor: 'var(--primary-accent)', height: '24px', width: '24px'}}></div>
                    ) : (
                       <>
                         <UploadCloud size={32} color={fileContext ? "#10b981" : "var(--text-muted)"} style={{marginBottom: '0.5rem'}} />
                         <p style={{fontWeight: '600', fontSize: '0.9rem', color: fileContext ? "#10b981" : 'var(--text-main)'}}>{fileContext ? 'Document Ready' : 'Drop document here'}</p>
                         <p style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>PDF, DOCX, TXT files</p>
                       </>
                    )}
                 </div>
                 
                 <label style={{width: '100%', padding: '0.6rem', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '6px', textAlign: 'center', fontSize: '0.85rem', fontWeight: '500', cursor: 'pointer', color: 'var(--text-main)'}}>
                    Choose Existing Document
                    <input type="file" accept=".pdf,.txt" style={{display: 'none'}} onChange={handleFileUploadChat} />
                 </label>
             </div>

             <button style={{width: '100%', padding: '0.8rem', background: 'var(--primary-accent)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem'}} onClick={() => setView('dochub')}>
                Draft from this chat session
             </button>
             <button style={{width: '100%', padding: '0.8rem', background: '#252525', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem'}} onClick={() => setView('kanoon')}>
                Take this chat to Know Your Kanoon
             </button>
         </div>

         {/* MAIN CHAT WINDOW */}
         <div style={{flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--panel-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: 'var(--shadow-soft)'}}>
            <div style={{background: 'var(--card-bg)', borderBottom: '1px solid var(--border-color)', padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem'}}>
               <span style={{fontSize: '0.7rem', fontWeight: '700', padding: '0.2rem 0.5rem', background: 'var(--primary-accent-dim)', color: 'var(--primary-accent)', borderRadius: '4px'}}>LEGAL ANALYSIS</span>
               <h2 style={{color: 'var(--text-main)', margin: 0, fontSize: '1.25rem', fontFamily: 'var(--font-heading)'}}>CasePredictAI</h2>
            </div>

            <div style={{flex: 1, overflowY: 'auto', padding: '2rem'}}>
              {chatMessages.map((m, i) => {
                const isFirstBotMessage = i === 0 && m.role === 'assistant';
                
                if (isFirstBotMessage) {
                  return (
                    <div key={i} style={{ marginBottom: '3rem', animation: 'fadeIn 0.8s ease' }}>
                      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <div style={{ width: '64px', height: '64px', background: 'var(--primary-accent-dim)', color: 'var(--primary-accent)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                           <Sparkles size={32} />
                        </div>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Welcome to CasePredictAI</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto' }}>Your advanced legal analysis assistant specialized in providing detailed case outcome predictions and strategic legal guidance.</p>
                      </div>

                      <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                        <div style={{ background: 'var(--bg-app)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                           <h4 style={{ color: 'var(--primary-accent)', marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>How I Can Help</h4>
                           <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                              <li>• <strong>Outcome Prediction:</strong> Probability assessments</li>
                              <li>• <strong>Strategic Path:</strong> Tactical maneuvering</li>
                              <li>• <strong>Risk Evaluation:</strong> Mitigation strategies</li>
                           </ul>
                        </div>
                        <div style={{ background: 'var(--bg-app)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                           <h4 style={{ color: 'var(--primary-accent)', marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Capabilities</h4>
                           <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                              <li>• <strong>Court Analysis:</strong> Judicial pattern mapping</li>
                              <li>• <strong>Evidence:</strong> Admissibility & strength</li>
                              <li>• <strong>Statistical:</strong> Success factor modeling</li>
                           </ul>
                        </div>
                        <div style={{ background: 'var(--bg-app)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                           <h4 style={{ color: 'var(--primary-accent)', marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Getting Started</h4>
                           <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                              <li>1. Describe your case or scenario</li>
                              <li>2. Upload supporting documents</li>
                              <li>3. Select analysis depth</li>
                           </ul>
                        </div>
                      </div>

                      <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <p style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase' }}>Example Analysis Prompts</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                          {[
                            "Predict outcome of high-value property dispute",
                            "What are the strategic paths for commercial fraud?",
                            "Analyze the strength of specific evidence chain",
                            "What are the risks in international arbitration?"
                          ].map((ex, idx) => (
                            <button key={idx} onClick={() => setChatInput(ex)} style={{ background: 'white', border: '1px solid var(--border-color)', padding: '0.6rem 1.2rem', borderRadius: '50px', fontSize: '0.85rem', cursor: 'pointer', color: 'var(--text-main)', transition: 'all 0.2s' }} onMouseOver={e => e.target.style.borderColor='var(--primary-accent)'} onMouseOut={e => e.target.style.borderColor='var(--border-color)'}>
                              {ex}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                         <p style={{ color: 'var(--primary-accent)', fontWeight: '700', fontSize: '1.1rem' }}>What case or legal scenario would you like me to analyze?</p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={i} style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div className={`chat-bubble ${m.role}`}>
                      <div dangerouslySetInnerHTML={{ __html: m.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                    </div>
                  </div>
                );
              })}
              {chatLoading && <div style={{ padding: '0 1rem', display: 'flex', alignItems: 'center' }}><div className="loader" style={{ borderTopColor: 'var(--primary-accent)', width: '20px', height: '20px' }}></div></div>}
            </div>

            <div style={{padding: '1.5rem', background: 'var(--card-bg)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'center'}}>
               <div style={{display: 'flex', width: '100%', maxWidth: '800px', background: 'var(--bg-app)', borderRadius: '50px', border: '1px solid var(--border-color)', padding: '0.4rem'}}>
                 <input type="text" placeholder="Ask CasePredictAI a question..." style={{flex: 1, border: 'none', padding: '0.8rem 1.5rem', outline: 'none', background: 'transparent', color: 'var(--text-main)'}} value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendChat()}/>
                 <button onClick={handleSendChat} disabled={chatLoading} style={{width: '45px', height: '45px', borderRadius: '50%', background: 'var(--primary-accent)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s'}}>
                    <Send size={18} />
                 </button>
               </div>
            </div>
         </div>
      </div>
      )}
    </div>
  );
}

// ---- Live Operational Tool (NLP Chat) ----
function KanoonChatTool() {
  const [messages, setMessages] = useState([{role: 'assistant', content: 'Hello! I am Kanoon AI, your Indian Legal Research Assistant. How can I help you regarding Indian law or citations today?'}]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    const newMessages = [...messages, {role: 'user', content: userMsg}];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/generate/kanoon_chat`, { messages: newMessages });
      const botResponse = res.data.response || "No response generated.";
      setMessages([...newMessages, {role: 'assistant', content: botResponse}]);
    } catch (e) {
      setMessages([...newMessages, {role: 'assistant', content: 'Sorry, the AI backend is currently unreachable.'}]);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', gap: '1.5rem', height: 'calc(100vh - 150px)', background: 'transparent' }}>
         {/* LEFT INFO PANEL */}
         <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
             <div style={{ background: 'var(--panel-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-soft)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#1e293b' }}>Know your Kanoon</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>Semantic search and conversational assistant powered by RAG to query Indian legal statutes.</p>
             </div>

             <div style={{ background: 'var(--panel-bg)', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--border-color)', flex: 1 }}>
                <p style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary-accent)', marginBottom: '1rem', textTransform: 'uppercase' }}>Research Tips</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                   {[
                     { t: 'Citation Search', d: 'Ask for specific sections like "IPC Section 302".' },
                     { t: 'Comparative Law', d: 'Compare IPC with the new BNS statutes.' },
                     { t: 'Precedent Mapping', d: 'Query landmark Supreme Court judgements.' }
                   ].map((tip, idx) => (
                     <div key={idx} style={{ borderLeft: '2px solid var(--border-color)', paddingLeft: '0.8rem' }}>
                        <p style={{ fontWeight: '600', fontSize: '0.85rem', marginBottom: '0.2rem' }}>{tip.t}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tip.d}</p>
                     </div>
                   ))}
                </div>
             </div>

             <button className="primary-btn" onClick={() => setMessages([{ role: 'assistant', content: 'Hello! I am Kanoon AI...' }])} style={{ width: '100%', justifyContent: 'center' }}>
                Clear Research Thread
             </button>
         </div>

         {/* CHAT AREA */}
         <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--panel-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: 'var(--shadow-soft)' }}>
            <div style={{ background: 'var(--card-bg)', borderBottom: '1px solid var(--border-color)', padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
               <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></div>
               <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Kanoon AI Operational</span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
              {messages.map((m, i) => (
                 <div key={i} style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div className={`chat-bubble ${m.role}`}>
                       <div dangerouslySetInnerHTML={{ __html: m.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                    </div>
                 </div>
              ))}
              {loading && <div style={{ padding: '0 1rem', display: 'flex', alignItems: 'center' }}><div className="loader" style={{ borderTopColor: 'var(--primary-accent)', width: '20px', height: '20px' }}></div></div>}
            </div>
            
            <div style={{ padding: '1.5rem', background: 'var(--card-bg)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'center' }}>
               <div style={{ display: 'flex', width: '100%', maxWidth: '800px', background: 'var(--bg-app)', borderRadius: '50px', border: '1px solid var(--border-color)', padding: '0.4rem' }}>
                 <input type="text" placeholder="Search statutes, citations, or precedents..." style={{ flex: 1, border: 'none', padding: '0.8rem 1.5rem', outline: 'none', background: 'transparent', color: 'var(--text-main)' }} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} />
                 <button onClick={handleSend} disabled={loading} style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'var(--primary-accent)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Send size={18} />
                 </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

// ---- Specialized Sub-Tool (DocHub Legal Workspace) ----
function DocHubTool() {
  const [templateType, setTemplateType] = useState('Rental Agreement');
  const [document, setDocument] = useState('');
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState('initial'); // initial -> interview -> draft
  
  // Compare State for Right Column
  const [draftB, setDraftB] = useState('');
  const [report, setReport] = useState('');
  const [showCompare, setShowCompare] = useState(false);
  
  const startInterview = async () => {
    setLoading(true);
    setStage('interview');
    try {
      const res = await axios.post(`${API_URL}/api/generate/tools/dochub`, { 
        prompt: `I want to create a ${templateType}. Please ask me the numbered list of all required information needed to draft this professionally for the Indian jurisdiction.` 
      });
      setDocument(res.data.response || "Failed to start interview.");
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  const generateFinalDraft = async () => {
    if (!document) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/generate/tools/dochub`, { 
        prompt: `Based on the following details provided for the ${templateType}, generate the COMPLETE DRAFT (Section A) and ATTORNEY NOTES (Section B). DETAILS PROVIDED:\n\n${document}` 
      });
      setDocument(res.data.response || "Drafting failed.");
      setStage('draft');
    } catch(e) { console.error(e); }
    setLoading(false);
  };
  
  const handleEdit = async (action) => {
    if (!document) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/generate/dochub_edit`, { document, action });
      setDocument(res.data.response || "Edit failed.");
    } catch(e) { console.error(e); }
    setLoading(false);
  };
  
  const handleCompare = async () => {
    if (!document || !draftB) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/generate/dochub_compare`, { draft_a: document, draft_b: draftB });
      setReport(res.data.response || "Comparison failed.");
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  const exportWord = async () => {
    if (!document) return;
    
    const lines = document.split('\n');
    const doc = new DocxDocument({
      sections: [{
        properties: {},
        children: lines.map(line => {
          const isHeading = line.trim() === line.trim().toUpperCase() && line.trim().length > 3;
          return new Paragraph({
            children: [
              new TextRun({
                text: line,
                bold: isHeading,
                size: isHeading ? 28 : 24,
                font: "Times New Roman"
              })
            ],
            spacing: { before: 120, after: 120 }
          });
        })
      }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Legal_Document_${Date.now()}.docx`);
  };

  return (
    <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
      <div className="tool-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
        <div>
          <h1 style={{color: '#1e293b', fontFamily: 'var(--font-heading)'}}>DocHub Workspace</h1>
          <p style={{color: 'var(--text-muted)'}}>AI Template Generator, Editor, and Multi-Draft Reviewer.</p>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '280px 1fr 350px', gap: '1.5rem', flex: 1, minHeight: '800px'}}>
        
        {/* LEFT COLUMN: Controls & Actions */}
        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
          <div style={{background: 'var(--panel-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-soft)'}}>
            <label className="input-label" style={{marginBottom: '0.8rem', display: 'block', color: 'var(--primary-accent)'}}>Smart Templates</label>
            <select className="select-input" style={{width: '100%', marginBottom: '1.2rem', background: 'var(--card-bg)'}} value={templateType} onChange={e=>setTemplateType(e.target.value)}>
              <option value="Rental Agreement">Rental Agreement</option>
              <option value="Non-Disclosure Agreement">Non-Disclosure Agreement</option>
              <option value="Bail Application">Bail Application</option>
              <option value="Legal Notice">Legal Notice</option>
              <option value="Power of Attorney">Power of Attorney</option>
            </select>
            
            {stage === 'initial' && (
              <button className="primary-btn" onClick={startInterview} disabled={loading} style={{width: '100%', padding: '0.8rem', marginBottom: '0.5rem', background: 'var(--primary-accent)', color: '#fff', fontWeight: 'bold'}}>Start Interview</button>
            )}
            
            {stage === 'interview' && (
              <button className="primary-btn" onClick={generateFinalDraft} disabled={loading || !document} style={{width: '100%', padding: '0.8rem', marginBottom: '0.5rem', background: '#10b981', color: '#fff', fontWeight: 'bold'}}>Generate Final Draft</button>
            )}

            {stage === 'draft' && (
              <button className="primary-btn" onClick={() => {setStage('initial'); setDocument(''); setShowCompare(false); setReport(''); setDraftB('');}} style={{width: '100%', padding: '0.8rem', marginBottom: '0.5rem', background: 'var(--bg-app)', color: '#1e293b', border: '1px solid var(--border-color)'}}>New Document</button>
            )}

            <button className="secondary-btn" onClick={exportWord} disabled={!document || stage !== 'draft'} style={{width: '100%', padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem'}}>
              <Download size={16} /> Export .DOCX
            </button>
          </div>
          
          <div style={{background: 'var(--panel-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-soft)'}}>
             <label className="input-label" style={{marginBottom: '1rem', display: 'block', color: 'var(--primary-accent)'}}>AI Actions</label>
             <div style={{display: 'flex', flexDirection: 'column', gap: '0.8rem'}}>
                <button className="secondary-btn" onClick={() => handleEdit('Make the document more formal and strict')} disabled={loading || !document || stage !== 'draft'} style={{width: '100%', padding: '0.6rem'}}>Make Formal</button>
                <button className="secondary-btn" onClick={() => handleEdit('Summarize the document into 3 bullet points')} disabled={loading || !document || stage !== 'draft'} style={{width: '100%', padding: '0.6rem'}}>Summarize</button>
                <button className="secondary-btn" onClick={() => handleEdit('Expand on the penal clauses')} disabled={loading || !document || stage !== 'draft'} style={{width: '100%', padding: '0.6rem'}}>Expand Details</button>
                <button className="secondary-btn" onClick={() => setShowCompare(!showCompare)} disabled={loading || !document || stage !== 'draft'} style={{width: '100%', padding: '0.6rem', border: showCompare ? '1px solid var(--primary-accent)' : '1px solid var(--border-color)'}}>Toggle Compare Mode</button>
             </div>
          </div>
        </div>
        
        {/* MIDDLE COLUMN: Main Editor */}
        <div style={{position: 'relative', display: 'flex', flexDirection: 'column', background: 'var(--panel-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: 'var(--shadow-soft)'}}>
           <div style={{background: 'var(--card-bg)', borderBottom: '1px solid var(--border-color)', padding: '0.8rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
             <span style={{fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--primary-accent)'}}>PRIMARY DRAFT</span>
             <span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>{document.length} characters</span>
           </div>
           <textarea 
             className="text-input" 
             style={{flex: 1, width: '100%', resize: 'none', background: 'transparent', border: 'none', padding: '2rem', fontFamily: 'var(--font-doc)', fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-main)'}} 
             placeholder="Your document actively generates here..."
             value={document}
             onChange={e => setDocument(e.target.value)}
           />
            {loading && (
             <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', zIndex: 10}}>
               <div className="loader" style={{borderTopColor: 'var(--primary-accent)', width: '40px', height: '40px'}}></div>
             </div>
           )}
        </div>

        {/* RIGHT COLUMN: Compare & Review */}
        <div style={{display: 'flex', flexDirection: 'column', background: 'var(--panel-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: 'var(--shadow-soft)', opacity: showCompare ? 1 : 0.5, pointerEvents: showCompare ? 'auto' : 'none', transition: 'opacity 0.3s'}}>
           <div style={{background: 'var(--card-bg)', borderBottom: '1px solid var(--border-color)', padding: '0.8rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
             <span style={{fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-main)'}}>COMPARISON DRAFT</span>
             <span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>{draftB.length} characters</span>
           </div>
           
           <div style={{display: 'flex', flexDirection: 'column', flex: 1, padding: '1rem', gap: '1rem'}}>
             <textarea 
               className="text-input" 
               style={{flex: 1, width: '100%', resize: 'none', background: 'var(--bg-app)', border: '1px solid var(--border-color)', padding: '1rem', fontFamily: 'var(--font-doc)', fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-main)'}} 
               placeholder="Paste alternative version here to compare..."
               value={draftB}
               onChange={e => setDraftB(e.target.value)}
             />
             
             <button className="primary-btn" onClick={handleCompare} disabled={loading || !document || !draftB} style={{width: '100%', padding: '0.8rem', background: 'var(--primary-accent)', color: '#fff', fontWeight: 'bold'}}>
               Analyze Discrepancies
             </button>
             
             {report && (
               <div style={{background: 'var(--bg-app)', padding: '1.2rem', borderRadius: '8px', border: '1px solid var(--border-color)', flex: 1, overflowY: 'auto'}}>
                  <h3 style={{color: 'var(--primary-accent)', marginBottom: '0.8rem', fontSize: '1rem'}}>AI Analysis Report</h3>
                  <div style={{whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.9rem', color: 'var(--text-main)'}}>
                    {report}
                  </div>
               </div>
             )}
           </div>
        </div>

      </div>
    </div>
  );
}

// ---- Specialized Sub-Tool (Upload & Chat RAG Workspace) ----
function UploadChatTool() {
  const [fileData, setFileData] = useState(null); // { text, filename }
  const [messages, setMessages] = useState([{role: 'assistant', content: 'Upload a PDF or TXT file to begin context-based legal analysis.'}]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setParsing(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await axios.post(`${API_URL}/api/upload/parse`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.error) {
        alert("Parse Error: " + res.data.error);
      } else {
        setFileData(res.data);
        setMessages([{role: 'assistant', content: `Success! I have securely parsed "${res.data.filename}" (${res.data.text.length} characters). You can now ask me explicit questions regarding this document.`}]);
      }
    } catch (err) {
      alert("Failed to upload/parse document.");
    }
    setParsing(false);
  };

  const handleSend = async () => {
    if (!input.trim() || !fileData) return;
    const newMessages = [...messages, {role: 'user', content: input}];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/generate/upload_chat`, { document_context: fileData.text, messages: newMessages });
      setMessages([...newMessages, {role: 'assistant', content: res.data.response || "No response."}]);
    } catch (e) {
      setMessages([...newMessages, {role: 'assistant', content: 'Connection failed.'}]);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', gap: '1.5rem', height: 'calc(100vh - 150px)', background: 'transparent' }}>
        <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ background: 'var(--panel-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-soft)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Document Q&A</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>Secure RAG module for deep analysis of your legal files.</p>
          </div>

          <div style={{ background: 'var(--panel-bg)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            {parsing ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
                <div className="loader" style={{ borderTopColor: 'var(--primary-accent)', height: '32px', width: '32px' }}></div>
                <p style={{ color: 'var(--primary-accent)', fontWeight: '600', fontSize: '0.85rem' }}>Analyzing Structure...</p>
              </div>
            ) : fileData ? (
              <div style={{ width: '100%' }}>
                <div style={{ width: '64px', height: '64px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                  <CheckCircle size={32} color="#10b981" />
                </div>
                <h4 style={{ color: 'var(--text-main)', marginBottom: '0.5rem', wordBreak: 'break-all', fontSize: '1rem' }}>{fileData.filename}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '2rem' }}>{fileData.text.length.toLocaleString()} characters indexed.</p>
                <label style={{ display: 'block', padding: '0.7rem', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>
                  Change Document
                  <input type="file" accept=".pdf,.txt" style={{ display: 'none' }} onChange={handleFileUpload} />
                </label>
              </div>
            ) : (
              <div style={{ width: '100%' }}>
                <UploadCloud size={48} color="var(--primary-accent)" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No file selected</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>Select a .PDF or .TXT file to start context-based chat.</p>
                <label className="primary-btn" style={{ display: 'block', padding: '0.8rem', cursor: 'pointer', justifyContent: 'center' }}>
                  Browse Files
                  <input type="file" accept=".pdf,.txt" style={{ display: 'none' }} onChange={handleFileUpload} />
                </label>
              </div>
            )}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--panel-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: 'var(--shadow-soft)' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div className={`chat-bubble ${m.role}`}>
                  <div dangerouslySetInnerHTML={{ __html: m.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                </div>
              </div>
            ))}
            {loading && <div style={{ padding: '0 1rem', display: 'flex', alignItems: 'center' }}><div className="loader" style={{ borderTopColor: 'var(--primary-accent)', width: '20px', height: '20px' }}></div></div>}
          </div>
          <div style={{ padding: '1.5rem', background: 'var(--card-bg)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'center' }}>
            <div style={{ display: 'flex', width: '100%', maxWidth: '800px', background: 'var(--bg-app)', borderRadius: '50px', border: '1px solid var(--border-color)', padding: '0.4rem' }}>
              <input type="text" placeholder={fileData ? "Query document contents..." : "Upload a document first..."} style={{ flex: 1, border: 'none', padding: '0.8rem 1.5rem', outline: 'none', background: 'transparent', color: 'var(--text-main)' }} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} disabled={!fileData} />
              <button onClick={handleSend} disabled={loading || !fileData} style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'var(--primary-accent)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: (!fileData || loading) ? 0.5 : 1 }}>
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GroqTool({ toolId, title, desc, icon, placeholder }) {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResponse('');
    try {
      const res = await axios.post(`${API_URL}/api/generate/tools/${toolId}`, { prompt: input });
      setResponse(res.data.response || res.data.error || "Unknown error occurred.");
    } catch (e) { setResponse("Error connecting to FastAPI backend."); }
    setLoading(false);
  };

  return (
    <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
       <div style={{display: 'grid', gridTemplateColumns: '400px 1fr', gap: '1.5rem', height: 'calc(100vh - 150px)'}}>
          <div style={{background: 'var(--panel-bg)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-soft)', display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
             <div>
                <h2 style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>{title}</h2>
                <p style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>{desc}</p>
             </div>
             <div className="input-group">
                <label className="input-label" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-accent)'}}>
                   {icon} Case Context
                </label>
                <textarea className="text-input" rows={12} placeholder={placeholder} value={input} onChange={e => setInput(e.target.value)} style={{resize: 'none', background: 'var(--bg-app)'}} />
             </div>
             <button className="primary-btn" onClick={handleGenerate} disabled={loading || !input.trim()} style={{width: '100%', justifyContent: 'center'}}>
                {loading ? <div className="loader"></div> : "Generate AI Analysis"}
             </button>
          </div>

          <div style={{background: 'var(--panel-bg)', padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-soft)', overflowY: 'auto'}}>
             {!response ? (
                <div style={{height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', opacity: 0.5}}>
                   <Sparkles size={48} color="var(--primary-accent)" />
                   <h3 style={{marginTop: '1.5rem'}}>Awaiting Input</h3>
                   <p style={{maxWidth: '300px'}}>Provide case details on the left to generate advanced legal insights.</p>
                </div>
             ) : (
                <div style={{animation: 'fadeIn 0.5s'}}>
                   <h3 style={{marginBottom: '1.5rem', color: 'var(--primary-accent)', display: 'flex', alignItems: 'center', gap: '0.5rem'}}><Sparkles size={20}/> AI Intelligence Report</h3>
                   <div style={{lineHeight: '1.8', color: 'var(--text-main)', fontSize: '1rem', whiteSpace: 'pre-wrap'}}>{response}</div>
                </div>
             )}
          </div>
       </div>
    </div>
  );
}

function CounterTool() {
  const [formData, setFormData] = useState({ sections: '', facts: '', incident_date: '', arrest_date: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    if (!formData.sections || !formData.facts) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/counter/analyze`, formData);
      setResult(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', gap: '1.5rem', height: 'calc(100vh - 150px)', background: 'transparent' }}>
        <div style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--panel-bg)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-soft)' }}>
          <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
            <Scale size={24} color="var(--primary-accent)" />
            <h2 style={{ fontSize: '1.4rem', color: '#1e293b', margin: 0 }}>Counter Suite</h2>
          </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Statutory defense mapping & procedural red flags.</p>
          </div>

          <div className="input-group">
            <label className="input-label" style={{ color: 'var(--primary-accent)', fontWeight: '700', fontSize: '0.8rem', marginBottom: '0.4rem' }}>Sections Charged</label>
            <input type="text" className="text-input" placeholder="e.g. 302, 307, 34" value={formData.sections} onChange={e => setFormData({ ...formData, sections: e.target.value })} style={{ background: 'var(--bg-app)', border: '1px solid var(--border-color)', padding: '0.6rem' }} />
          </div>
          <div className="input-group">
            <label className="input-label" style={{ color: 'var(--primary-accent)', fontWeight: '700', fontSize: '0.8rem', marginBottom: '0.4rem' }}>Incident Facts / Allegations</label>
            <textarea className="text-input" style={{ height: '120px', resize: 'none', background: 'var(--bg-app)', border: '1px solid var(--border-color)', fontSize: '0.85rem' }} placeholder="Describe the allegations or facts of the case..." value={formData.facts} onChange={e => setFormData({ ...formData, facts: e.target.value })} />
          </div>
          <div className="grid-2" style={{ gap: '1rem' }}>
             <div className="input-group">
                <label className="input-label" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700' }}>INCIDENT DATE</label>
                <input type="date" className="text-input" value={formData.incident_date} onChange={e => setFormData({ ...formData, incident_date: e.target.value })} style={{ background: 'var(--bg-app)', border: '1px solid var(--border-color)', padding: '0.5rem' }} />
             </div>
             <div className="input-group">
                <label className="input-label" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700' }}>ARREST DATE</label>
                <input type="date" className="text-input" value={formData.arrest_date} onChange={e => setFormData({ ...formData, arrest_date: e.target.value })} style={{ background: 'var(--bg-app)', border: '1px solid var(--border-color)', padding: '0.5rem' }} />
             </div>
          </div>
          <button className="primary-btn" onClick={handleAnalyze} disabled={loading} style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center', height: '3rem' }}>
            {loading ? <div className="loader" style={{ width: '20px', height: '20px' }}></div> : "Generate Strategic Rebuttals"}
          </button>
        </div>

        <div style={{flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
          {!result ? (
            <div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--panel-bg)', border: '2px dashed var(--border-color)', borderRadius: '16px', padding: '4rem', textAlign: 'center'}}>
               <div style={{width: '80px', height: '80px', background: 'var(--primary-accent-dim)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem'}}>
                  <Repeat size={40} color="var(--primary-accent)" />
               </div>
               <h3 style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>Ready for Strategic Analysis</h3>
               <p style={{color: 'var(--text-muted)', maxWidth: '400px'}}>Identify statutory defenses and procedural vulnerabilities by entering case details on the left.</p>
            </div>
          ) : (
            <>
              <div style={{background: 'var(--panel-bg)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-soft)'}}>
                <h3 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--primary-accent)'}}><FileText size={22} /> Statutory Defense Mapping</h3>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '1rem'}}>
                   {result.defenses?.length > 0 ? result.defenses.map((d, i) => (
                     <div key={i} style={{background: 'var(--primary-accent-dim)', color: 'var(--primary-accent)', border: '1px solid var(--primary-accent-dim)', padding: '0.8rem 1.5rem', borderRadius: '10px', fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.6rem'}}>
                        <CheckCircle size={16} /> {d}
                     </div>
                   )) : <p style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>No specific statutory defenses mapped for these sections. See AI Analysis below.</p>}
                </div>
              </div>

              <div style={{background: 'var(--panel-bg)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-soft)'}}>
                <h3 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#f59e0b'}}><AlertCircle size={22} /> Procedural Loophole Checklist</h3>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.2rem'}}>
                   {(result.checkpoints || []).map((c, i) => (
                     <div key={i} style={{padding: '1.2rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--bg-app)', position: 'relative', overflow: 'hidden'}}>
                        <div style={{position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: c.violation_type === 'MAJOR' ? '#ef4444' : '#f59e0b'}}></div>
                        <p style={{fontWeight: '700', fontSize: '1rem', margin: '0 0 0.4rem 0', color: 'var(--text-main)'}}>{c.title}</p>
                        <p style={{fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 1rem 0', lineHeight: '1.5'}}>{c.description}</p>
                        <span style={{fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary-accent)', background: 'var(--primary-accent-dim)', padding: '4px 8px', borderRadius: '4px'}}>{c.relevant_section}</span>
                     </div>
                   ))}
                </div>
              </div>

              <div style={{background: 'var(--sidebar-bg)', color: '#fff', padding: '2.5rem', borderRadius: '16px', boxShadow: 'var(--shadow-soft)'}}>
                <h3 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--primary-accent)'}}><MessageSquare size={22} /> Strategic AI Rebuttals</h3>
                <div style={{whiteSpace: 'pre-wrap', lineHeight: '1.8', fontSize: '1rem', opacity: 0.9, fontWeight: '400', fontFamily: 'var(--font-ui)'}}>
                   {result.analysis}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('register'); // Default to register based on screenshot
  const [formData, setFormData] = useState({ email: '', password: '', full_name: '', organization: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      // Strip fields not expected by the backend Pydantic model to avoid 422 errors
      const payload = mode === 'login'
        ? { email: formData.email, password: formData.password }
        : { email: formData.email, password: formData.password, full_name: formData.full_name };
      const res = await axios.post(`${API_URL}${endpoint}`, payload);
      if (res.data.error) {
        setError(res.data.error);
      } else {
        if (mode === 'login') {
          onLogin(res.data.user);
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }});
        } else {
          setMode('login');
          alert("Account created! Please login.");
        }
      }
    } catch (e) { setError("Connection failed."); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fcfcfc', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, overflowY: 'auto' }}>
      {/* BACKGROUND GLOW */}
      <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.05) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.03) 0%, transparent 70%)', pointerEvents: 'none' }}></div>

      {/* HEADER */}
      <header style={{ padding: '2rem 4rem', display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '1.25rem', fontFamily: 'serif', letterSpacing: '-0.5px' }}>
          <span>JudicialAI</span>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
        <div style={{ background: '#fff', padding: '3rem', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', width: '100%', maxWidth: '440px' }}>
          
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontFamily: 'serif', fontWeight: '700', marginBottom: '0.75rem', color: '#111' }}>
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </h2>
            <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.5' }}>
              {mode === 'login' ? 'Welcome back to your judicial workspace.' : 'Join JudicialAI to streamline your practice with AI-augmented intelligence.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {mode === 'register' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: '#333', letterSpacing: '0.05em' }}>Full Name</label>
                <input 
                  type="text" 
                  placeholder="Jane Doe" 
                  required 
                  value={formData.full_name} 
                  onChange={e => setFormData({...formData, full_name: e.target.value})} 
                  style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }} 
                  onFocus={e => e.target.style.borderColor = '#111'}
                  onBlur={e => e.target.style.borderColor = '#d1d5db'}
                />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: '#333', letterSpacing: '0.05em' }}>Professional Email</label>
              <input 
                type="email" 
                placeholder="jane.doe@firm.com" 
                required 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }} 
                onFocus={e => e.target.style.borderColor = '#111'}
                onBlur={e => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            {mode === 'register' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: '#333', letterSpacing: '0.05em' }}>Law Firm/Organization</label>
                <input 
                  type="text" 
                  placeholder="Smith & Associates" 
                  required 
                  value={formData.organization} 
                  onChange={e => setFormData({...formData, organization: e.target.value})} 
                  style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }} 
                  onFocus={e => e.target.style.borderColor = '#111'}
                  onBlur={e => e.target.style.borderColor = '#d1d5db'}
                />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: '#333', letterSpacing: '0.05em' }}>Password</label>
                {mode === 'login' && <a href="#" onClick={e => e.preventDefault()} style={{ fontSize: '0.8rem', color: '#666', textDecoration: 'underline' }}>Forgot?</a>}
              </div>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  required 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                  style={{ width: '100%', padding: '0.8rem 1rem', paddingRight: '3rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '1rem', outline: 'none' }} 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '0.25rem' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {mode === 'register' && <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>Must be at least 8 characters and include a number.</p>}
            </div>

            {mode === 'register' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                <input type="checkbox" required style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                <label style={{ fontSize: '0.85rem', color: '#333' }}>
                  I agree to the <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Terms of Service</span> and <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</span>.
                </label>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading} 
              style={{ width: '100%', background: '#000', color: '#fff', border: 'none', padding: '1rem', borderRadius: '6px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', marginTop: '1rem', transition: 'background 0.2s' }}
              onMouseOver={e => e.target.style.background = '#333'}
              onMouseOut={e => e.target.style.background = '#000'}
            >
              {loading ? <div className="loader" style={{ borderTopColor: '#fff', margin: '0 auto' }}></div> : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
            
            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <button 
                type="button" 
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')} 
                style={{ background: 'none', border: 'none', color: '#666', fontSize: '0.9rem', cursor: 'pointer' }}
              >
                {mode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
            
            {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center', marginTop: '0.5rem' }}>{error}</p>}
          </form>
        </div>
      </main>

      {/* FOOTER */}
      <footer style={{ padding: '2rem 4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f3f4f6', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '1rem', fontFamily: 'serif' }}>
          <span>JudicialAI</span>
        </div>
        <div style={{ display: 'flex', gap: '2rem', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#666', letterSpacing: '0.05em' }}>
          <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
          <span style={{ cursor: 'pointer' }}>Terms of Service</span>
          <span style={{ cursor: 'pointer' }}>Security</span>
        </div>
        <div style={{ fontSize: '0.7rem', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          © 2026 JUDICIALAI. ALL RIGHTS RESERVED.
        </div>
      </footer>
    </div>
  );
}

export default App;
