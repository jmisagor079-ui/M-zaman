import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Palette, GraduationCap, MapPin, Phone, Mail, 
  Facebook, User, Calendar, Briefcase, Clock, DollarSign, 
  ExternalLink, MessageCircle, Heart, Star, Brush, X, Trash2, LogOut, CheckCircle, ShieldCheck, Award, Zap, Plus, ArrowLeft, Send, Image as ImageIcon, Upload, Sparkles, Loader2, Share2, Copy, Check, Terminal, Rocket
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import ThreeBackground from './components/ThreeBackground';
import GlassCard from './components/GlassCard';
import { SERVICES, EDUCATION, SOCIALS, LOCATIONS, PERSONAL_INFO } from './constants';
import { Message, ArtWork } from './types';

interface IdentityItem {
  label: string;
  value: string;
  icon: React.ReactNode;
  span?: boolean;
}

const App: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showHireModal, setShowHireModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState<'home' | 'gallery'>('home');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showSyncCode, setShowSyncCode] = useState(false);

  // Persistence: Admin local edits
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('maisha_messages');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [heroImages, setHeroImages] = useState<string[]>(() => {
    const saved = localStorage.getItem('maisha_hero_imgs');
    return saved ? JSON.parse(saved) : ["https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600"];
  });
  
  const [artGallery, setArtGallery] = useState<ArtWork[]>(() => {
    const saved = localStorage.getItem('maisha_art');
    return saved ? JSON.parse(saved) : [
      { id: '1', url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=600', title: 'Blue Lotus', description: 'Hand-painted on pure silk.', comments: [] },
      { id: '2', url: 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?q=80&w=600', title: 'Golden Strokes', description: 'Acrylic fabric painting experiment.', comments: [] },
      { id: '3', url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=600', title: 'Abstract Crimson', description: 'Cotton dupatta design.', comments: [] }
    ];
  });

  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [statusMsg, setStatusMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [adminTab, setAdminTab] = useState<'messages' | 'settings'>('messages');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const artDescRef = useRef<HTMLTextAreaElement>(null);
  const artTitleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('maisha_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('maisha_hero_imgs', JSON.stringify(heroImages));
  }, [heroImages]);

  useEffect(() => {
    localStorage.setItem('maisha_art', JSON.stringify(artGallery));
  }, [artGallery]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (heroImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [heroImages]);

  // TOOLKIT: Generate the code for constants.tsx to update visitors globally
  const generateProductionCode = () => {
    const code = `
import { BookOpen, Palette, GraduationCap, User, MapPin, Mail, Phone, Facebook } from 'lucide-react';
import { Service, EducationItem, SocialLink } from './types';

export const COLORS = { lavender: '#E6E6FA', cream: '#FFFDD0', peach: '#FFDAB9', accent: '#A78BFA' };

export const SERVICES: Service[] = ${JSON.stringify(SERVICES, null, 2)};

export const EDUCATION: EducationItem = {
  degree: 'Bachelor/Honors (2nd Year)',
  institute: 'Govt. Titumir College',
  year: '2024',
  result: 'CGPA 3.67',
  group: 'Economics',
  curriculum: 'English Version'
};

export const SOCIALS: SocialLink[] = ${JSON.stringify(SOCIALS, null, 2)};

export const PERSONAL_INFO = ${JSON.stringify(PERSONAL_INFO, null, 2)};

export const LOCATIONS = ${JSON.stringify(LOCATIONS, null, 2)};
    `;
    navigator.clipboard.writeText(code.trim());
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  const generateAiDescription = async () => {
    const title = artTitleRef.current?.value;
    if (!title) return;
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Act as a creative fabric art critic. Write a poetic, one-sentence description for a piece of fabric art titled "${title}". Keep it under 20 words.`,
      });
      if (artDescRef.current) artDescRef.current.value = response.text || "";
    } catch (error) {
      console.error(error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const saveMessage = (msg: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = { ...msg, id: Math.random().toString(36).substr(2, 9), timestamp: new Date().toLocaleString() };
    setMessages(prev => [newMessage, ...prev]);
    setStatusMsg({ text: 'Message delivered', type: 'success' });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const deleteMessage = (id: string) => setMessages(prev => prev.filter(m => m.id !== id));

  const addHeroImage = (url: string) => {
    if (heroImages.length >= 3) return;
    setHeroImages(prev => [...prev, url]);
    setStatusMsg({ text: 'Hero Image Added', type: 'success' });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const removeHeroImage = (index: number) => {
    if (heroImages.length <= 1) return;
    setHeroImages(prev => prev.filter((_, i) => i !== index));
    setCurrentHeroIndex(0);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => addHeroImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addArt = (url: string, title: string, desc: string) => {
    const newArt: ArtWork = { id: Math.random().toString(36).substr(2, 9), url, title, description: desc, comments: [] };
    setArtGallery(prev => [newArt, ...prev]);
    setStatusMsg({ text: 'New Art Uploaded', type: 'success' });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'M. ZAMAN' && password === 'M121213') {
      setIsAdmin(true);
      setShowLoginModal(false);
    } else alert('Invalid Credentials');
  };

  const handleHireSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    saveMessage({ name: 'Quick Hire Inquiry', phone: formData.get('phone') as string, content: formData.get('message') as string, type: 'Direct' });
    setShowHireModal(false);
  };

  const handleContactSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    saveMessage({ name: formData.get('name') as string, phone: formData.get('phone') as string, content: formData.get('inquiry') as string, type: 'Inquiry' });
    e.currentTarget.reset();
  };

  const identityItems: IdentityItem[] = [
    { label: 'Primary Region', value: PERSONAL_INFO.location, icon: <MapPin size={20} className="text-purple-500" /> },
    { label: 'Institution', value: EDUCATION.institute, icon: <GraduationCap size={20} className="text-indigo-500" /> },
    { label: 'Academic Year', value: EDUCATION.degree, icon: <Calendar size={20} className="text-pink-500" /> },
    { label: 'Direct Access', value: PERSONAL_INFO.phone, icon: <Phone size={20} className="text-green-500" /> },
    { label: 'Gmail Address', value: PERSONAL_INFO.email, icon: <Mail size={20} className="text-blue-500" />, span: true },
  ];

  if (isAdmin) {
    return (
      <div className="min-h-screen relative text-slate-800 bg-[#fdfaf7] selection:bg-purple-200">
        <ThreeBackground />
        <nav className="fixed top-0 w-full z-50 glass py-4 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
            <div className="text-2xl font-serif font-bold text-purple-600 flex items-center gap-2">
               <ShieldCheck size={28} />
               <span>ADMIN PORTAL</span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setAdminTab(adminTab === 'messages' ? 'settings' : 'messages')}
                className="px-4 py-2 glass rounded-xl text-xs font-bold uppercase tracking-widest text-slate-600"
              >
                {adminTab === 'messages' ? 'Update Content' : 'View Inbox'}
              </button>
              <button onClick={() => setIsAdmin(false)} className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-full font-bold text-xs tracking-widest hover:bg-slate-800 transition-all">
                <LogOut size={16} /> LOGOUT
              </button>
            </div>
          </div>
        </nav>

        <main className="max-w-6xl mx-auto px-6 pt-32 pb-20">
          <AnimatePresence mode="wait">
            {adminTab === 'messages' ? (
              <motion.div key="msgs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="mb-12"><h1 className="text-5xl font-serif font-bold mb-2 text-slate-900">Message Inbox</h1><p className="text-slate-500 font-medium">Managing {messages.length} student inquiries.</p></div>
                <div className="grid grid-cols-1 gap-6">
                  {messages.length === 0 ? <GlassCard className="text-center py-20"><p className="text-slate-400">No messages yet.</p></GlassCard> : messages.map((msg) => (
                    <div key={msg.id} className="glass p-8 rounded-[32px] border border-white/50 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3"><span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${msg.type === 'Inquiry' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'}`}>{msg.type}</span><span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Clock size={12} /> {msg.timestamp}</span></div>
                        <h3 className="text-xl font-bold text-slate-900 mb-1">{msg.name}</h3><p className="text-purple-600 font-bold mb-4 flex items-center gap-2"><Phone size={14} /> {msg.phone}</p><div className="bg-white/40 p-5 rounded-2xl border border-white/60"><p className="text-slate-600 text-sm leading-relaxed">{msg.content}</p></div>
                      </div>
                      <button onClick={() => deleteMessage(msg.id)} className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={24} /></button>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                <div className="flex justify-between items-end">
                  <div><h1 className="text-5xl font-serif font-bold mb-2">Visual Content</h1><p className="text-slate-500">Edit images and art live.</p></div>
                  <button 
                    onClick={generateProductionCode}
                    className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${copySuccess ? 'bg-green-500 text-white' : 'bg-purple-600 text-white shadow-xl hover:bg-purple-700'}`}
                  >
                    {copySuccess ? <Check size={16} /> : <Rocket size={16} />}
                    {copySuccess ? 'Updated Code Copied!' : 'Publish to Global Link'}
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <GlassCard className="space-y-6">
                    <div className="flex items-center justify-between"><div className="flex items-center gap-3 text-purple-600"><ImageIcon size={24} /><h3 className="text-xl font-bold">Hero Images</h3></div><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{heroImages.length}/3 Images</span></div>
                    <div className="grid grid-cols-3 gap-4">
                      {heroImages.map((img, i) => (
                        <div key={i} className="relative aspect-[4/5] rounded-xl overflow-hidden group border border-slate-100 shadow-inner">
                           <img src={img} className="w-full h-full object-cover" /><button onClick={() => removeHeroImage(i)} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
                        </div>
                      ))}
                    </div>
                    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); const url = (e.currentTarget.elements.namedItem('imgurl') as HTMLInputElement).value; if(url) { addHeroImage(url); (e.currentTarget.elements.namedItem('imgurl') as HTMLInputElement).value = ''; } }}>
                      <input name="imgurl" type="text" className="w-full glass bg-white/50 border border-slate-200 p-4 rounded-2xl outline-none" placeholder="Paste image link here..." />
                      <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold tracking-widest hover:bg-purple-600 transition-all">ADD IMAGE</button>
                    </form>
                  </GlassCard>

                  <GlassCard className="space-y-6">
                    <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-3 text-orange-600"><Palette size={24} /><h3 className="text-xl font-bold">New Art</h3></div><button onClick={generateAiDescription} disabled={isAiLoading} className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50">{isAiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} AI Insight</button></div>
                    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); const f = e.currentTarget; const url = (f.elements.namedItem('arturl') as HTMLInputElement).value; const title = (f.elements.namedItem('arttitle') as HTMLInputElement).value; const desc = (f.elements.namedItem('artdesc') as HTMLTextAreaElement).value; if(url && title) { addArt(url, title, desc); f.reset(); } }}>
                      <div className="grid grid-cols-2 gap-4"><input name="arturl" required placeholder="Image URL" className="glass bg-white/50 border border-slate-200 p-4 rounded-2xl outline-none" /><input ref={artTitleRef} name="arttitle" required placeholder="Art Title" className="glass bg-white/50 border border-slate-200 p-4 rounded-2xl outline-none" /></div>
                      <textarea ref={artDescRef} name="artdesc" placeholder="Poetic description..." className="w-full glass bg-white/50 border border-slate-200 p-4 rounded-2xl outline-none h-24 resize-none" /><button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold tracking-widest hover:bg-orange-500 transition-all">UPLOAD TO GALLERY</button>
                    </form>
                  </GlassCard>
                </div>
                
                <div className="p-8 bg-slate-900 rounded-[40px] border border-slate-800 flex items-center gap-8">
                   <div className="p-6 bg-purple-500/10 rounded-3xl text-purple-400"><Terminal size={40} /></div>
                   <div className="flex-1">
                      <h4 className="text-xl font-bold text-white mb-1">Make these changes Global</h4>
                      <p className="text-slate-400 text-sm leading-relaxed">Changes you make here are only stored in your browser. To show these new pictures to everyone visiting your Vercel link, click the <b>"Publish to Global Link"</b> button above, then paste that code into your <b>constants.tsx</b> file and push to GitHub.</p>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    );
  }

  if (view === 'gallery') {
    return (
      <div className="min-h-screen relative text-slate-800 selection:bg-purple-200">
        <ThreeBackground />
        <nav className="fixed top-0 w-full z-50 glass py-4 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 flex justify-between items-center"><button onClick={() => setView('home')} className="flex items-center gap-2 text-slate-900 font-bold hover:text-purple-600 transition-colors"><ArrowLeft size={24} /> BACK HOME</button><div className="text-xl font-serif font-bold tracking-widest">CREATIVE GALLERY</div></div>
        </nav>
        <main className="max-w-7xl mx-auto px-6 pt-32 pb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {artGallery.map((art) => (
              <motion.div key={art.id} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} className="flex flex-col gap-6">
                <div className="glass rounded-[40px] overflow-hidden shadow-2xl group">
                   <div className="aspect-[4/3] overflow-hidden"><img src={art.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={art.title} /></div>
                   <div className="p-8"><h3 className="text-2xl font-serif font-bold mb-2">{art.title}</h3><p className="text-slate-500 text-sm mb-6 leading-relaxed italic">"{art.description}"</p>
                      <div className="pt-4 border-t border-slate-100"><div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4"><MessageCircle size={14} /> {art.comments?.length || 0} Comments</div>
                         <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); const f = e.currentTarget; const text = (f.elements.namedItem('cmt') as HTMLInputElement).value; if(text) { const updated = artGallery.map(a => a.id === art.id ? {...a, comments: [...(a.comments || []), {user: 'Visitor', text, date: new Date().toLocaleDateString()}]} : a); setArtGallery(updated); f.reset(); } }}>
                            <input name="cmt" placeholder="Share your thoughts..." className="flex-1 glass bg-white/50 border-none px-4 py-2 rounded-xl outline-none text-xs focus:ring-1 ring-purple-400" /><button type="submit" className="p-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all"><Send size={16} /></button>
                         </form>
                      </div>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative text-slate-800 selection:bg-purple-200">
      <ThreeBackground />
      <AnimatePresence>{statusMsg && <motion.div initial={{ opacity: 0, y: -100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -100 }} className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-max"><div className="bg-green-500 text-white px-8 py-3 rounded-full shadow-2xl flex items-center gap-3 font-bold border-2 border-green-400/50"><CheckCircle size={20} /> {statusMsg.text}</div></motion.div>}</AnimatePresence>

      <nav className={`fixed top-0 w-full z-50 transition-all duration-700 ${isScrolled ? 'glass py-3 shadow-sm' : 'py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center"><motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-serif font-bold tracking-tighter text-purple-600 flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-xl shadow-inner">M</div><span>M. ZAMAN</span></motion.div><button onClick={() => setShowLoginModal(true)} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-purple-600 transition-all">ADMIN LOGIN</button></div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-32 space-y-40 pb-32">
        <section className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[60vh] lg:min-h-[80vh]">
          <div className="lg:hidden w-full text-center space-y-3"><h1 className="text-4xl sm:text-5xl font-serif font-bold tracking-tight">Maisha <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 italic">Zaman</span></h1><div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 border border-purple-100 rounded-full text-purple-600 text-[10px] font-bold uppercase tracking-widest"><GraduationCap size={12} /> {EDUCATION.institute}</div></div>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="hidden lg:block space-y-8"><h1 className="text-8xl font-serif font-bold leading-[1.1] tracking-tight">Maisha <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 italic">Zaman</span></h1><div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-purple-600 text-xs font-bold uppercase tracking-widest"><GraduationCap size={14} /> Economics Student | {EDUCATION.institute}</div><p className="text-2xl text-slate-500 max-w-lg leading-relaxed font-light">Passionate student of Economics with 1 year of tutoring experience. Empowering minds through logic and creativity.</p>
            <div className="flex gap-5"><button onClick={() => setShowHireModal(true)} className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold shadow-2xl hover:bg-slate-800 transition-all transform hover:-translate-y-1">Hire Me</button><button onClick={() => setView('gallery')} className="glass px-10 py-5 rounded-2xl font-bold border border-slate-200 hover:bg-white/50 transition-all transform hover:-translate-y-1 flex items-center gap-2">Art <Brush size={18} /></button></div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ rotateX: 6, rotateY: 6, scale: 1.03 }} style={{ perspective: 1500, transformStyle: "preserve-3d" }} className="relative w-full max-w-[280px] sm:max-w-md lg:max-w-none mx-auto order-1 lg:order-2 cursor-pointer">
            <div className="absolute -inset-5 lg:-inset-10 bg-gradient-to-tr from-purple-300/30 blur-2xl lg:blur-3xl rounded-full animate-pulse" /><div className="relative glass p-2 lg:p-5 rounded-[24px] lg:rounded-[48px] shadow-2xl overflow-hidden group border border-white/50"><div className="overflow-hidden rounded-[20px] lg:rounded-[40px] bg-slate-100 aspect-[4/5] relative">
                <AnimatePresence mode="wait"><motion.img key={currentHeroIndex} initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 1 }} src={heroImages[currentHeroIndex]} alt="Maisha Zaman" className="absolute inset-0 w-full h-full object-cover" /></AnimatePresence>
                {heroImages.length > 1 && <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">{heroImages.map((_, i) => (<div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === currentHeroIndex ? 'w-8 bg-purple-600 shadow-md' : 'w-2 bg-white/50'}`} />))}</div>}
              </div><div className="absolute bottom-4 lg:bottom-10 -left-2 lg:-left-6 glass p-2 lg:p-6 rounded-xl lg:rounded-3xl shadow-2xl border border-white/60" style={{ transform: "translateZ(50px)" }}><div className="flex items-center space-x-2 lg:space-x-4"><div className="bg-green-500 w-2 h-2 lg:w-4 lg:h-4 rounded-full animate-pulse shadow-md" /><div className="text-left font-bold text-[8px] lg:text-sm text-slate-800 uppercase tracking-widest">Visionary</div></div></div></div>
          </motion.div>
        </section>

        {/* Professional Identity with FIXED SYNTAX for long text */}
        <section id="about" className="relative">
          <div className="mb-20 text-center lg:text-left"><h2 className="text-5xl md:text-7xl font-serif font-bold mb-4 tracking-tighter text-slate-900">Professional <span className="text-purple-600 italic">Identity</span></h2><div className="w-32 h-1.5 bg-gradient-to-r from-purple-600 via-pink-400 to-peach-300 rounded-full mx-auto lg:mx-0" /></div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <GlassCard delay={0.1} className="lg:col-span-8 !p-0 overflow-hidden shadow-2xl border-white/40 border">
               <div className="grid grid-cols-1 md:grid-cols-5 h-full">
                 <div className="md:col-span-2 bg-[#1a1c2c] p-12 text-white flex flex-col justify-center items-center text-center relative overflow-hidden border-r border-white/5">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent" /><div className="relative z-10 w-full flex flex-col items-center"><div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-500 rounded-[32px] flex items-center justify-center mb-8 shadow-2xl border border-white/20"><User size={48} className="text-white" /></div><h3 className="text-4xl font-serif font-bold mb-2 tracking-tight">Maisha Zaman</h3><p className="text-purple-300 text-xs font-black uppercase tracking-[0.3em] mb-12 opacity-90">Scholar & Artist</p>
                      <div className="space-y-8 w-full">
                         <div className="flex flex-col items-center gap-2"><div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10"><Award size={18} className="text-purple-300" /></div><div className="flex flex-col"><span className="text-[9px] font-black uppercase text-slate-500 tracking-wider mb-0.5">Performance</span><span className="text-sm font-bold">CGPA {EDUCATION.result}</span></div></div>
                         <div className="flex flex-col items-center gap-2"><div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10"><Zap size={18} className="text-orange-300" /></div><div className="flex flex-col"><span className="text-[9px] font-black uppercase text-slate-500 tracking-wider mb-0.5">Curriculum</span><span className="text-sm font-bold">{EDUCATION.curriculum}</span></div></div>
                      </div>
                    </div>
                 </div>
                 <div className="md:col-span-3 p-12 bg-white/40 backdrop-blur-2xl flex flex-col justify-center">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-12 gap-x-10">
                       {identityItems.map((item) => (
                         <div key={item.label} className={`flex flex-col items-start ${item.span ? 'sm:col-span-2' : ''}`}>
                           <div className="flex items-center gap-3 mb-3"><div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">{item.icon}</div><span className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">{item.label}</span></div>
                           {/* FIXED: Using break-words and better leading for professional appearance */}
                           <p className="text-lg font-bold text-slate-800 leading-tight break-words whitespace-normal">
                             {item.value}
                           </p>
                         </div>
                       ))}
                    </div>
                 </div>
               </div>
            </GlassCard>
            <div className="lg:col-span-4 flex flex-col gap-8">
               <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} className="glass p-10 rounded-[48px] border border-white/60 shadow-xl bg-gradient-to-br from-white to-purple-50/30 flex-1"><div className="flex items-center justify-between mb-10"><h4 className="text-2xl font-serif font-bold text-slate-800">Capabilities</h4><div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 shadow-sm"><Zap size={20} /></div></div>
                  <div className="space-y-8">
                    {[{ skill: 'Teaching Method', level: '98%', color: 'from-purple-500 to-indigo-500' }, { skill: 'Conceptual Depth', level: '92%', color: 'from-indigo-500 to-blue-500' }, { skill: 'Creative Insight', level: '95%', color: 'from-pink-500 to-orange-500' }].map(s => (
                      <div key={s.skill}><div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3"><span className="text-slate-400">{s.skill}</span><span className="text-slate-900 font-bold">{s.level}</span></div><div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} whileInView={{ width: s.level }} transition={{ duration: 1.5, ease: "circOut" }} className={`h-full bg-gradient-to-r ${s.color} rounded-full`} /></div></div>
                    ))}
                  </div>
               </motion.div>
               <motion.div onClick={() => setShowHireModal(true)} className="p-8 rounded-[40px] bg-slate-900 text-white flex flex-col justify-center items-center text-center group cursor-pointer hover:shadow-2xl transition-all border border-slate-800 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" /><div className="relative z-10"><div className="flex items-center gap-3 mb-2"><div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" /><span className="text-2xl font-bold">Hire Maisha</span></div><p className="text-[11px] text-slate-400 font-bold tracking-widest uppercase">Available for Tuition</p></div>
               </motion.div>
            </div>
          </div>
        </section>

        {/* Teaching Services */}
        <section id="tuition"><div className="text-center mb-20"><h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-slate-900">Teaching Services</h2><p className="text-slate-500 font-medium">Expert guidance tailored for English Version students.</p></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">{SERVICES.map((service, idx) => (<GlassCard key={service.title} delay={idx * 0.1}><h3 className="text-xl font-bold mb-8 text-purple-600 border-b border-purple-100 pb-4">{service.title}</h3><ul className="space-y-5">{service.items.map((item) => (<li key={item} className="flex items-center gap-4 text-slate-600 text-sm font-semibold"><div className="w-2 h-2 bg-purple-400 rounded-full shadow-sm" />{item}</li>))}</ul></GlassCard>))}</div>
        </section>

        <section id="contact">
          <GlassCard className="!p-0 overflow-hidden border-purple-100 shadow-3xl"><div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-12 lg:p-20 bg-slate-900 text-white relative"><div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -mr-32 -mt-32" /><h2 className="text-5xl font-serif font-bold mb-10 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-peach-300 relative z-10">Let's Connect</h2><div className="space-y-10 relative z-10">{SOCIALS.map((link) => (<a key={link.platform} href={link.url} target="_blank" className="flex items-center space-x-6 group"><div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center group-hover:bg-purple-600 group-hover:border-transparent transition-all shadow-xl">{link.icon === 'Facebook' && <Facebook size={28} />}{link.icon === 'Mail' && <Mail size={28} />}{link.icon === 'Phone' && <Phone size={28} />}</div><span className="text-xl font-bold group-hover:text-purple-400 transition-colors">{link.platform}</span></a>))}</div></div>
              <div className="p-12 lg:p-20 bg-white/40 backdrop-blur-3xl"><form className="space-y-10" onSubmit={handleContactSubmit}><div className="grid grid-cols-1 sm:grid-cols-2 gap-10"><div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Your Name</label><input name="name" required type="text" className="w-full bg-transparent border-b-2 border-slate-200 py-4 outline-none focus:border-purple-600 text-slate-900 font-bold transition-colors" placeholder="e.g. Abdullah" /></div><div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Your Phone</label><input name="phone" required type="tel" className="w-full bg-transparent border-b-2 border-slate-200 py-4 outline-none focus:border-purple-600 text-slate-900 font-bold transition-colors" placeholder="017xxxxxxxx" /></div></div><div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Your Message</label><textarea name="inquiry" required className="w-full bg-transparent border-b-2 border-slate-200 py-4 outline-none focus:border-purple-600 h-32 resize-none text-slate-900 font-bold transition-colors" placeholder="Write something..." /></div><button type="submit" className="w-full bg-purple-600 text-white py-6 rounded-2xl font-bold tracking-[0.2em] shadow-2xl hover:bg-purple-700 active:scale-[0.98] transition-all">SEND INQUIRY</button></form></div>
            </div></GlassCard>
        </section>
      </main>

      {/* Modals */}
      <AnimatePresence>{showHireModal && <div className="fixed inset-0 z-[100] flex items-center justify-center px-6"><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowHireModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" /><motion.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }} className="relative glass p-10 rounded-[48px] max-w-lg w-full shadow-3xl border border-white/60"><div className="flex justify-between items-center mb-8"><h2 className="text-4xl font-serif font-bold text-slate-900">Hire Maisha</h2><button onClick={() => setShowHireModal(false)} className="bg-slate-100 p-2 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"><X size={20} /></button></div>
             <div className="space-y-6">
                <a href={`tel:${PERSONAL_INFO.phone}`} className="flex items-center justify-between p-6 bg-green-500 text-white rounded-3xl shadow-xl hover:bg-green-600 transition-all group"><div className="flex items-center gap-4"><div className="bg-white/20 p-3 rounded-2xl"><Phone size={24} /></div><div><p className="font-bold text-lg">Direct Call</p><p className="text-xs font-black uppercase tracking-widest">{PERSONAL_INFO.phone}</p></div></div><ExternalLink size={20} /></a>
                <div className="relative py-4"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div><div className="relative flex justify-center text-xs uppercase font-black text-slate-400 tracking-[0.3em]"><span className="bg-[#fdfaf7] px-4">OR</span></div></div>
                <form onSubmit={handleHireSubmit} className="space-y-4"><div><label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 ml-2">Your Phone</label><input name="phone" required type="tel" className="w-full glass bg-white/50 border border-slate-200 p-4 rounded-2xl outline-none focus:ring-2 ring-purple-100" placeholder="017..." /></div><div><label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 ml-2">Tuition Brief</label><textarea name="message" required className="w-full glass bg-white/50 border border-slate-200 p-4 rounded-2xl outline-none h-28 resize-none focus:ring-2 ring-purple-100" placeholder="Class, Subject, and Timing..." /></div><button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"><MessageCircle size={20} /> SEND REQUEST</button></form>
             </div></motion.div></div>}</AnimatePresence>

      <AnimatePresence>{showLoginModal && <div className="fixed inset-0 z-[100] flex items-center justify-center px-6"><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLoginModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" /><motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="relative glass p-10 rounded-[40px] max-w-md w-full border border-white/40 shadow-3xl"><div className="flex justify-between items-center mb-10"><h2 className="text-3xl font-serif font-bold text-slate-900">Admin Login</h2><button onClick={() => setShowLoginModal(false)}><X size={24} /></button></div>
             <form className="space-y-8" onSubmit={handleLogin}>
               <div><label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Username</label><input required value={username} onChange={e => setUsername(e.target.value)} type="text" className="w-full glass bg-white/50 border border-slate-200 p-4 rounded-2xl outline-none focus:border-purple-500 font-bold" placeholder="M. ZAMAN" /></div>
               <div><label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Password</label><input required value={password} onChange={e => setPassword(e.target.value)} type="password" className="w-full glass bg-white/50 border border-slate-200 p-4 rounded-2xl outline-none focus:border-purple-500 font-bold" placeholder="••••••••" /></div>
               <button className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold tracking-widest shadow-xl hover:bg-slate-800 transition-all active:scale-95">SIGN IN</button>
             </form></motion.div></div>}</AnimatePresence>

      <footer className="py-20 border-t border-slate-200 bg-white/30 backdrop-blur-sm"><div className="max-w-7xl mx-auto px-6 text-center"><div className="text-3xl font-serif font-bold text-slate-900 mb-6 uppercase tracking-[0.4em]">M. Zaman</div><p className="text-slate-400 text-sm font-medium">&copy; 2024 Maisha Zaman. Economics Scholar & Artist.</p></div></footer>
      <a href={`https://wa.me/${PERSONAL_INFO.phone}`} target="_blank" className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-green-500 text-white rounded-full shadow-2xl flex items-center justify-center transform hover:scale-110 active:scale-90 transition-all"><MessageCircle size={32} /></a>
    </div>
  );
};

export default App;