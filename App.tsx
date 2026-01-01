import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Palette, GraduationCap, MapPin, Phone, Mail, 
  Facebook, User, Calendar, Briefcase, Clock, DollarSign, 
  ExternalLink, MessageCircle, Heart, Star, Brush, X, Trash2, LogOut, CheckCircle, ShieldCheck, Award, Zap, Plus, ArrowLeft, Send, Image as ImageIcon, Upload, Sparkles, Loader2, Globe, RefreshCcw, Database
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import ThreeBackground from './components/ThreeBackground';
import GlassCard from './components/GlassCard';
import { SERVICES, EDUCATION, SOCIALS, LOCATIONS, PERSONAL_INFO, GLOBAL_BLOB_STORE_URL } from './constants';
import { Message, ArtWork, Comment } from './types';

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
  const [isSyncing, setIsSyncing] = useState(false);

  // --- GLOBAL STATE SYNCHRONIZATION (Vercel Blob / Cloud) ---
  const [messages, setMessages] = useState<Message[]>([]);
  const [heroImages, setHeroImages] = useState<string[]>(["https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600"]);
  const [artGallery, setArtGallery] = useState<ArtWork[]>([
    { id: '1', url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=600', title: 'Blue Lotus', description: 'Hand-painted on pure silk.', comments: [] },
    { id: '2', url: 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?q=80&w=600', title: 'Golden Strokes', description: 'Acrylic fabric painting experiment.', comments: [] },
    { id: '3', url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=600', title: 'Abstract Crimson', description: 'Cotton dupatta design.', comments: [] }
  ]);

  // Initial Data Fetch from Cloud
  useEffect(() => {
    const fetchCloudData = async () => {
      try {
        const response = await fetch(GLOBAL_BLOB_STORE_URL);
        if (response.ok) {
          const data = await response.json();
          if (data.heroImages) setHeroImages(data.heroImages);
          if (data.artGallery) setArtGallery(data.artGallery);
          if (data.messages) setMessages(data.messages);
        }
      } catch (err) {
        console.warn("Cloud Sync Fetch Failed: Check GLOBAL_BLOB_STORE_URL.");
      }
    };
    fetchCloudData();
  }, []);

  // Sync Function: Pushes current state to the cloud store
  const syncToGlobalCloud = async (hero: string[], art: ArtWork[], msgs: Message[]) => {
    setIsSyncing(true);
    try {
      await fetch(GLOBAL_BLOB_STORE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heroImages: hero, artGallery: art, messages: msgs }),
      });
      if (isAdmin) {
        setStatusMsg({ text: 'Changes Published Globally!', type: 'success' });
        setTimeout(() => setStatusMsg(null), 3000);
      }
    } catch (err) {
      console.error("Global Cloud Sync Failed:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [statusMsg, setStatusMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [adminTab, setAdminTab] = useState<'messages' | 'settings'>('messages');

  const artDescRef = useRef<HTMLTextAreaElement>(null);
  const artTitleRef = useRef<HTMLInputElement>(null);

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

  const generateAiDescription = async () => {
    const title = artTitleRef.current?.value;
    if (!title) return;
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Describe art piece "${title}". Fabric art focus. 15 words max.`,
      });
      if (artDescRef.current) artDescRef.current.value = response.text || "";
    } catch (error) {
      console.error(error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const saveMessage = async (msg: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = { ...msg, id: Math.random().toString(36).substr(2, 9), timestamp: new Date().toLocaleString() };
    
    // Fetch latest cloud messages first to prevent overwriting other visitors' messages
    try {
      const response = await fetch(GLOBAL_BLOB_STORE_URL);
      let latestMsgs = [newMessage, ...messages];
      if (response.ok) {
        const cloudData = await response.json();
        const cloudMsgs = cloudData.messages || [];
        // Merge without duplicates
        latestMsgs = [newMessage, ...cloudMsgs.filter((m: Message) => !messages.find(p => p.id === m.id))];
      }
      setMessages(latestMsgs);
      await syncToGlobalCloud(heroImages, artGallery, latestMsgs);
    } catch (e) {
      setMessages(prev => [newMessage, ...prev]);
    }

    setStatusMsg({ text: 'Inquiry Sent Successfully', type: 'success' });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const deleteMessage = (id: string) => {
    if (!isAdmin) return;
    const updated = messages.filter(m => m.id !== id);
    setMessages(updated);
    syncToGlobalCloud(heroImages, artGallery, updated);
  };

  const addHeroImage = (url: string) => {
    if (heroImages.length >= 3) return;
    const updated = [...heroImages, url];
    setHeroImages(updated);
    if (isAdmin) syncToGlobalCloud(updated, artGallery, messages);
  };

  const removeHeroImage = (index: number) => {
    if (heroImages.length <= 1) return;
    const updated = heroImages.filter((_, i) => i !== index);
    setHeroImages(updated);
    setCurrentHeroIndex(0);
    if (isAdmin) syncToGlobalCloud(updated, artGallery, messages);
  };

  const addArt = (url: string, title: string, desc: string) => {
    const newArt: ArtWork = { id: Math.random().toString(36).substr(2, 9), url, title, description: desc, comments: [] };
    const updated = [newArt, ...artGallery];
    setArtGallery(updated);
    if (isAdmin) syncToGlobalCloud(heroImages, updated, messages);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'M. ZAMAN' && password === 'M121213') {
      setIsAdmin(true);
      setShowLoginModal(false);
    } else alert('Invalid Credentials');
  };

  const handleContactSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    saveMessage({
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      content: formData.get('inquiry') as string,
      type: 'Inquiry'
    });
    e.currentTarget.reset();
  };

  const handleHireSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    saveMessage({
      name: 'Tuition Inquiry',
      phone: formData.get('phone') as string,
      content: formData.get('message') as string,
      type: 'Direct'
    });
    setShowHireModal(false);
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
               <ShieldCheck size={28} /> <span>ADMIN PANEL</span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => syncToGlobalCloud(heroImages, artGallery, messages)}
                disabled={isSyncing}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                {isSyncing ? <RefreshCcw size={16} className="animate-spin" /> : <Globe size={16} />}
                {isSyncing ? 'Pushing Data...' : 'Sync Global Changes'}
              </button>
              <button onClick={() => setAdminTab(adminTab === 'messages' ? 'settings' : 'messages')} className="px-4 py-2 glass rounded-xl text-xs font-bold uppercase tracking-widest text-slate-600">
                {adminTab === 'messages' ? 'Settings' : 'Inbox'}
              </button>
              <button onClick={() => setIsAdmin(false)} className="px-6 py-2 bg-slate-900 text-white rounded-full font-bold text-xs tracking-widest">LOGOUT</button>
            </div>
          </div>
        </nav>

        <main className="max-w-6xl mx-auto px-6 pt-32 pb-20">
          <AnimatePresence mode="wait">
            {adminTab === 'messages' ? (
              <motion.div key="msgs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <h1 className="text-5xl font-serif font-bold mb-8">Visitor Inquiries</h1>
                <div className="grid grid-cols-1 gap-6">
                  {messages.length === 0 ? <GlassCard className="text-center py-20 text-slate-400">No client messages stored yet.</GlassCard> : messages.map((msg) => (
                    <div key={msg.id} className="glass p-8 rounded-[32px] border border-white flex justify-between items-center gap-6 shadow-xl">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2"><span className="px-2 py-1 bg-purple-100 text-purple-600 rounded text-[9px] font-black uppercase">{msg.type}</span><span className="text-[10px] text-slate-400">{msg.timestamp}</span></div>
                        <h3 className="text-xl font-bold">{msg.name}</h3><p className="text-purple-600 font-bold mb-3">{msg.phone}</p><p className="text-slate-600 text-sm leading-relaxed">{msg.content}</p>
                      </div>
                      <button onClick={() => deleteMessage(msg.id)} className="p-4 text-red-500 hover:bg-red-50 rounded-2xl"><Trash2 size={24} /></button>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <GlassCard className="space-y-6">
                    <h3 className="text-xl font-bold text-purple-600">Hero Section</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {heroImages.map((img, i) => (
                        <div key={i} className="relative aspect-[4/5] rounded-xl overflow-hidden border border-slate-100">
                          <img src={img} className="w-full h-full object-cover" /><button onClick={() => removeHeroImage(i)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded"><Trash2 size={10} /></button>
                        </div>
                      ))}
                    </div>
                    <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); const url = (e.currentTarget.elements.namedItem('imgurl') as HTMLInputElement).value; if(url) { addHeroImage(url); (e.currentTarget.elements.namedItem('imgurl') as HTMLInputElement).value = ''; } }}>
                      <input name="imgurl" placeholder="New Image URL" className="flex-1 glass bg-white/50 border-none p-4 rounded-2xl text-sm" /><button type="submit" className="bg-slate-900 text-white px-6 rounded-2xl hover:bg-purple-600 transition-colors"><Plus size={20} /></button>
                    </form>
                  </GlassCard>

                  <GlassCard className="space-y-6">
                    <h3 className="text-xl font-bold text-orange-600">Art Management</h3>
                    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); const f = e.currentTarget; const url = (f.elements.namedItem('arturl') as HTMLInputElement).value; const title = (f.elements.namedItem('arttitle') as HTMLInputElement).value; const desc = (f.elements.namedItem('artdesc') as HTMLTextAreaElement).value; if(url && title) { addArt(url, title, desc); f.reset(); } }}>
                      <div className="grid grid-cols-2 gap-4"><input name="arturl" placeholder="Art Image URL" className="glass bg-white/50 p-4 rounded-2xl text-sm" /><input name="arttitle" ref={artTitleRef} placeholder="Art Title" className="glass bg-white/50 p-4 rounded-2xl text-sm" /></div>
                      <textarea name="artdesc" ref={artDescRef} placeholder="Creative description..." className="w-full glass bg-white/50 p-4 rounded-2xl h-24 text-sm" />
                      <div className="flex gap-4">
                        <button type="button" onClick={generateAiDescription} className="flex-1 glass py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-indigo-600 flex items-center justify-center gap-2 hover:bg-indigo-50">
                          {isAiLoading ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />} AI DESCRIBE
                        </button>
                        <button type="submit" className="flex-[2] bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-orange-500 transition-colors">UPLOAD ART</button>
                      </div>
                    </form>
                  </GlassCard>
                </div>
                
                <div className="p-10 bg-indigo-950 text-white rounded-[40px] flex items-center gap-8 shadow-2xl border border-white/5">
                   <div className="p-6 bg-white/10 rounded-3xl"><Database size={40} className="text-indigo-300" /></div>
                   <div className="space-y-2">
                      <h4 className="text-xl font-bold">Vercel Global Storage Active</h4>
                      <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">All your changes are published to a permanent cloud store. Every visitor to your Vercel link will see the latest version of your portfolio, and all messages they send are synced back to your inbox automatically.</p>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative text-slate-800 selection:bg-purple-200">
      <ThreeBackground />
      <AnimatePresence>{statusMsg && <motion.div initial={{ opacity: 0, y: -100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -100 }} className="fixed top-24 left-1/2 -translate-x-1/2 z-[100]"><div className="bg-green-500 text-white px-8 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2"><CheckCircle size={18} /> {statusMsg.text}</div></motion.div>}</AnimatePresence>

      <nav className={`fixed top-0 w-full z-50 transition-all duration-700 ${isScrolled ? 'glass py-3 shadow-sm' : 'py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="text-2xl font-serif font-bold text-purple-600 flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-xl shadow-inner">M</div><span>M. ZAMAN</span></div>
          <button onClick={() => setShowLoginModal(true)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-purple-600 transition-all">ADMIN ACCESS</button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-32 space-y-40 pb-32">
        <section className="flex flex-col lg:grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
          <div className="space-y-8">
            <h1 className="text-8xl font-serif font-bold leading-[1.1] tracking-tight">Maisha <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 italic">Zaman</span></h1>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-purple-600 text-xs font-bold uppercase tracking-widest"><GraduationCap size={14} /> Economics Student | {EDUCATION.institute}</div>
            <p className="text-2xl text-slate-500 max-w-lg leading-relaxed font-light">Passionate student of Economics with 1 year of tutoring experience. Empowering minds through logic and creativity.</p>
            <div className="flex gap-5"><button onClick={() => setShowHireModal(true)} className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold shadow-2xl hover:bg-slate-800 transition-all">Hire Me</button><button onClick={() => setView('gallery')} className="glass px-10 py-5 rounded-2xl font-bold border hover:bg-white/50 transition-all flex items-center gap-2">Art Gallery <Brush size={18} /></button></div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-md mx-auto aspect-[4/5] shadow-3xl">
             <div className="absolute -inset-10 bg-purple-300/20 blur-3xl rounded-full animate-pulse" />
             <div className="relative glass p-4 rounded-[48px] shadow-2xl h-full overflow-hidden border border-white">
                <AnimatePresence mode="wait"><motion.img key={currentHeroIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }} src={heroImages[currentHeroIndex]} className="w-full h-full object-cover rounded-[36px]" /></AnimatePresence>
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2">{heroImages.map((_, i) => (<div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === currentHeroIndex ? 'w-8 bg-purple-600' : 'w-2 bg-white/50'}`} />))}</div>
             </div>
          </motion.div>
        </section>

        {/* Identity Section with Fixed Wrapping */}
        <section id="about" className="relative">
          <div className="mb-20"><h2 className="text-6xl font-serif font-bold mb-4">Professional <span className="text-purple-600 italic">Identity</span></h2><div className="w-24 h-1.5 bg-purple-600 rounded-full" /></div>
          <GlassCard className="!p-0 overflow-hidden shadow-3xl border-white/40">
            <div className="grid grid-cols-1 md:grid-cols-5 min-h-[500px]">
              <div className="md:col-span-2 bg-slate-900 p-12 text-white flex flex-col justify-center items-center text-center relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent" />
                 <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-[32px] flex items-center justify-center mb-6 shadow-2xl relative z-10"><User size={48} /></div>
                 <h3 className="text-3xl font-serif font-bold mb-2 relative z-10">Maisha Zaman</h3>
                 <p className="text-purple-400 text-xs font-black uppercase tracking-widest mb-10 opacity-80 relative z-10">Economics Scholar</p>
                 <div className="space-y-6 w-full max-w-[200px] relative z-10">
                   <div className="flex justify-between items-center border-b border-white/5 pb-2"><span className="text-[10px] font-black uppercase text-slate-500">CGPA</span><span className="font-bold">{EDUCATION.result}</span></div>
                   <div className="flex justify-between items-center border-b border-white/5 pb-2"><span className="text-[10px] font-black uppercase text-slate-500">GROUP</span><span className="font-bold">Economics</span></div>
                 </div>
              </div>
              <div className="md:col-span-3 p-12 bg-white/40 backdrop-blur-3xl flex flex-col justify-center">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                   {identityItems.map((item) => (
                     <div key={item.label} className={`space-y-3 ${item.span ? 'sm:col-span-2' : ''}`}>
                       <div className="flex items-center gap-2 opacity-50"><div className="p-1.5 bg-slate-200 rounded-lg">{item.icon}</div><span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span></div>
                       <p className="text-xl font-bold text-slate-800 leading-tight break-words whitespace-normal">
                         {item.value}
                       </p>
                     </div>
                   ))}
                 </div>
              </div>
            </div>
          </GlassCard>
        </section>

        {/* Art Gallery with Global Comments Persistence */}
        {view === 'home' ? (
          <section className="space-y-12">
            <div className="flex justify-between items-end"><h2 className="text-5xl font-serif font-bold">Creative <span className="text-orange-500 italic">Art</span></h2><button onClick={() => setView('gallery')} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-orange-500 transition-colors">Enter Gallery</button></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {artGallery.slice(0, 3).map((art) => (
                <div key={art.id} className="glass rounded-[40px] overflow-hidden group border border-white/60 shadow-xl">
                  <div className="aspect-square overflow-hidden"><img src={art.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /></div>
                  <div className="p-8"><h3 className="text-xl font-bold mb-2">{art.title}</h3><p className="text-slate-500 text-sm italic">"{art.description}"</p></div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <div className="pt-10">
            <button onClick={() => setView('home')} className="mb-12 flex items-center gap-2 text-slate-400 font-bold uppercase text-xs tracking-widest hover:text-purple-600 transition-all"><ArrowLeft size={16} /> Back Home</button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {artGallery.map((art) => (
                <GlassCard key={art.id} className="!p-0 overflow-hidden flex flex-col sm:flex-row h-full">
                   <div className="sm:w-1/2 aspect-square sm:aspect-auto h-full overflow-hidden"><img src={art.url} className="w-full h-full object-cover" /></div>
                   <div className="sm:w-1/2 p-8 flex flex-col justify-between">
                      <div><h3 className="text-2xl font-serif font-bold mb-4">{art.title}</h3><p className="text-slate-500 text-sm italic mb-8">"{art.description}"</p></div>
                      <div className="space-y-6 pt-6 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-300 tracking-widest"><MessageCircle size={14} /> {art.comments?.length || 0} Comments</div>
                        <form className="flex gap-2" onSubmit={async (e) => {
                          e.preventDefault();
                          const f = e.currentTarget;
                          const txt = (f.elements.namedItem('cmt') as HTMLInputElement).value;
                          if (txt) {
                            const newComment = { user: 'Visitor', text: txt, date: new Date().toLocaleDateString() };
                            const updatedArt = artGallery.map(a => a.id === art.id ? { ...a, comments: [...(a.comments || []), newComment] } : a);
                            setArtGallery(updatedArt);
                            f.reset();
                            await syncToGlobalCloud(heroImages, updatedArt, messages);
                          }
                        }}>
                          <input name="cmt" placeholder="Share a thought..." className="flex-1 glass bg-white/30 border-none px-4 py-2 rounded-xl text-xs outline-none focus:ring-1 ring-purple-300" />
                          <button type="submit" className="p-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"><Send size={14} /></button>
                        </form>
                      </div>
                   </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* Contact form always persists to cloud */}
        <section id="contact">
          <GlassCard className="!p-0 overflow-hidden shadow-3xl border-purple-100"><div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-12 lg:p-20 bg-slate-900 text-white relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
              <h2 className="text-5xl font-serif font-bold mb-10 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-peach-300 relative z-10">Get In Touch</h2>
              <div className="space-y-10 relative z-10">{SOCIALS.map((link) => (<a key={link.platform} href={link.url} target="_blank" className="flex items-center space-x-6 group"><div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center group-hover:bg-purple-600 transition-all">{link.platform === 'Facebook' ? <Facebook size={28} /> : link.platform === 'Mail' ? <Mail size={28} /> : <Phone size={28} />}</div><span className="text-xl font-bold group-hover:text-purple-400 transition-colors">{link.platform}</span></a>))}</div>
            </div>
            <div className="p-12 lg:p-20 bg-white/30"><form className="space-y-8" onSubmit={handleContactSubmit}><div><label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Full Name</label><input name="name" required className="w-full bg-transparent border-b-2 border-slate-200 py-4 outline-none focus:border-purple-600 text-lg font-bold" /></div><div><label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Phone</label><input name="phone" required type="tel" className="w-full bg-transparent border-b-2 border-slate-200 py-4 outline-none focus:border-purple-600 text-lg font-bold" /></div><div><label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Message</label><textarea name="inquiry" required className="w-full bg-transparent border-b-2 border-slate-200 py-4 outline-none focus:border-purple-600 h-32 resize-none text-lg font-bold" /></div><button type="submit" className="w-full bg-purple-600 text-white py-6 rounded-2xl font-bold shadow-xl hover:bg-purple-700 transition-all active:scale-95">SEND MESSAGE</button></form></div>
          </div></GlassCard>
        </section>
      </main>

      {/* Admin Login Modal */}
      <AnimatePresence>{showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowLoginModal(false)} />
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative glass p-10 rounded-[40px] max-w-md w-full border border-white/50 shadow-3xl">
            <h2 className="text-3xl font-serif font-bold mb-8 text-slate-900">Admin Access</h2>
            <form className="space-y-6" onSubmit={handleLogin}>
              <input required value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" className="w-full glass bg-white/50 p-4 rounded-2xl outline-none focus:ring-1 ring-purple-400 font-bold" />
              <input required value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full glass bg-white/50 p-4 rounded-2xl outline-none focus:ring-1 ring-purple-400 font-bold" />
              <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95">LOG IN</button>
            </form>
          </motion.div>
        </div>
      )}</AnimatePresence>

      {/* Hire Modal */}
      <AnimatePresence>{showHireModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowHireModal(false)} />
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative glass p-10 rounded-[48px] max-w-lg w-full border border-white/60 shadow-3xl">
            <div className="flex justify-between items-center mb-8"><h2 className="text-4xl font-serif font-bold text-slate-900">Hire Maisha</h2><button onClick={() => setShowHireModal(false)} className="bg-slate-50 p-2 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"><X size={20} /></button></div>
            <div className="space-y-4">
              <a href={`tel:${PERSONAL_INFO.phone}`} className="flex items-center gap-4 p-6 bg-green-500 text-white rounded-3xl shadow-xl font-bold hover:bg-green-600 transition-all"><Phone size={24} /> Call Direct: {PERSONAL_INFO.phone}</a>
              <form onSubmit={handleHireSubmit} className="space-y-4 pt-4 border-t border-slate-100">
                <input name="phone" required placeholder="Your Phone Number" className="w-full glass bg-white/50 p-4 rounded-2xl font-bold" />
                <textarea name="message" required placeholder="Tuition briefing (Class, Subjects, Location)..." className="w-full glass bg-white/50 p-4 rounded-2xl h-24 font-bold" />
                <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-purple-600 transition-all active:scale-95">SUBMIT REQUEST</button>
              </form>
            </div>
          </motion.div>
        </div>
      )}</AnimatePresence>

      <footer className="py-20 border-t border-slate-200 bg-white/30 backdrop-blur-sm text-center">
        <div className="text-3xl font-serif font-bold text-slate-900 mb-4 uppercase tracking-[0.3em]">M. Zaman</div>
        <p className="text-slate-400 text-sm font-medium italic">&copy; 2024 Maisha Zaman. Economics Scholar & Fabric Artist.</p>
      </footer>
    </div>
  );
};

export default App;