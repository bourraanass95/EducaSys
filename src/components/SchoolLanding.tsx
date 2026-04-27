import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'motion/react';
import { 
  School, 
  MapPin, 
  Phone, 
  Mail, 
  ArrowRight, 
  BookOpen, 
  Award, 
  Globe,
  Loader2,
  Users,
  GraduationCap,
  Calendar,
  ChevronRight,
  ShieldCheck,
  Star
} from 'lucide-react';

export const SchoolLanding = ({ onShowRequest }: { onShowRequest?: () => void }) => {
  const { subdomain } = useParams();
  const [school, setSchool] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        const data = await api.getSchoolBySubdomain(subdomain || '');
        setSchool(data);
      } catch (e) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchSchool();
  }, [subdomain]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <School className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-6 animate-pulse italic">Chargement de votre campus...</p>
      </div>
    );
  }

  if (error || !school) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
         <div className="w-24 h-24 bg-gray-50 rounded-[40px] flex items-center justify-center mb-8">
           <Globe className="w-12 h-12 text-gray-200" />
         </div>
         <h1 className="text-4xl font-display font-black text-gray-900 tracking-tight">Espace Introuvable.</h1>
         <p className="text-gray-400 font-medium mt-4 mb-10 max-w-sm mx-auto">
           L'adresse demandée n'est pas encore enregistrée dans l'infrastructure EducaSys.
         </p>
         <Link to="/" className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.03] active:scale-95">
           Explorer la Plateforme
         </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header className="sticky top-0 left-0 right-0 z-[60] px-6 py-4">
        <nav className="max-w-7xl mx-auto flex items-center justify-between bg-white/80 backdrop-blur-xl border border-gray-100 shadow-sm px-6 py-3 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-display font-black">
               {school.name[0]}
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg font-display font-black tracking-tight text-gray-900 leading-none">{school.name}</h2>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">{subdomain}.educasys.app</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(`/${subdomain}/login`)}
              className="bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-xl font-bold text-sm tracking-tight transition-all active:scale-95 shadow-lg shadow-gray-200"
            >
              Espace Connecté
            </button>
          </div>
        </nav>
      </header>

      <main>
        {/* Modern Hero */}
        <section className="relative px-6 pt-24 pb-32 overflow-hidden">
           <div className="absolute top-0 right-0 w-full h-[800px] bg-gradient-to-br from-blue-50/40 via-transparent to-transparent -z-10" />
           <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full" />
           
           <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="flex-1 space-y-10"
              >
                 <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-gray-100 rounded-full shadow-sm mb-8">
                      <Star className="w-3 h-3 text-amber-400 fill-current" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                        {school.address?.split(',')[0] || "Institution d'Excellence"}
                      </span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-display font-black text-gray-900 tracking-tight leading-[0.88] mb-8">
                      Votre Avenir <br />
                      Démarre <span className="text-blue-600 italic">Maintenant.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 font-medium max-w-xl leading-relaxed">
                      Bienvenue dans l'espace digital de <span className="text-gray-900 font-bold">{school.name}</span>. Un écosystème moderne dédié à l'innovation pédagogique et au succès de chaque étudiant.
                    </p>
                 </div>

                 <div className="flex flex-col sm:flex-row items-center gap-4">
                    <button 
                      onClick={() => navigate(`/${subdomain}/login`)}
                      className="w-full sm:w-auto px-10 py-5 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/20 transition-all hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-3 group"
                    >
                       Se Connecter <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button 
                      onClick={onShowRequest}
                      className="w-full sm:w-auto px-10 py-5 bg-white border border-gray-200 text-gray-900 rounded-2xl font-bold text-lg shadow-sm transition-all hover:bg-gray-50 active:scale-95"
                    >
                       Demander une Inscription
                    </button>
                 </div>

                 <div className="flex items-center gap-8 pt-4">
                    <div className="flex -space-x-4">
                       {[1,2,3,4].map(i => (
                         <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-gray-100 overflow-hidden">
                           <img src={`https://i.pravatar.cc/150?u=${i+10}`} alt="Stud" className="w-full h-full object-cover grayscale" />
                         </div>
                       ))}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Plus de 1,200 diplômés</p>
                      <p className="text-xs text-gray-400 font-medium">Rejoignez une communauté d'élite</p>
                    </div>
                 </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex-1 w-full flex justify-center"
              >
                 <div className="relative group w-full max-w-lg">
                    <div className="absolute inset-0 bg-blue-600/10 rounded-[64px] blur-[60px] group-hover:bg-blue-600/20 transition-all" />
                    <div className="relative aspect-square bg-white rounded-[64px] border-8 border-white shadow-2xl overflow-hidden group-hover:-rotate-2 transition-transform duration-500">
                       <img 
                         src={`https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=1000&auto=format&fit=crop`} 
                         alt="Campus" 
                         className="w-full h-full object-cover"
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent" />
                       <div className="absolute bottom-10 left-10 right-10 flex items-center justify-between">
                          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20">
                             <GraduationCap className="w-7 h-7" />
                          </div>
                          <div className="text-right">
                             <p className="text-white text-3xl font-display font-black italic tracking-tight">#1</p>
                             <p className="text-white/80 text-[10px] font-black uppercase tracking-widest leading-none">Région Ouest</p>
                          </div>
                       </div>
                    </div>
                    
                    <motion.div 
                       animate={{ y: [0, -10, 0] }}
                       transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                       className="absolute -top-8 -left-8 bg-white p-6 rounded-[32px] shadow-2xl border border-gray-50 flex items-center gap-4 group-hover:scale-110 transition-transform"
                    >
                       <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                          <Award className="w-7 h-7" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic">Accréditation</p>
                          <p className="text-sm font-bold text-gray-900">Label Excellence</p>
                       </div>
                    </motion.div>
                 </div>
              </motion.div>
           </div>
        </section>

        {/* Info Grid */}
        <section className="px-6 py-24 bg-white">
           <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                 {[
                   { icon: MapPin, label: "Adresse", value: school.address || "Casablanca, Maroc", color: "blue" },
                   { icon: Phone, label: "Contact", value: school.phone || "+212 522 00 00 00", color: "emerald" },
                   { icon: Mail, label: "Email", value: school.email, color: "orange" },
                   { icon: Calendar, label: "Rentrée", value: "Septembre 2026", color: "indigo" }
                 ].map((item, i) => (
                   <div key={i} className="group p-8 bg-gray-50/50 hover:bg-white border border-transparent hover:border-gray-100 rounded-[32px] transition-all hover:shadow-xl shadow-black/5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-${item.color}-100 text-${item.color}-600`}>
                         <item.icon className="w-6 h-6" />
                      </div>
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic mb-2">{item.label}</p>
                      <p className="text-sm font-bold text-gray-900 leading-relaxed truncate">{item.value}</p>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* Stats Section with split UI */}
        <section className="px-6 py-24">
           <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
              <div className="flex-[1.5] bg-gray-900 rounded-[48px] p-12 text-white relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-full h-full bg-blue-600/10 blur-[100px] rounded-full translate-x-1/2 -z-0" />
                 <div className="relative z-10 flex flex-col justify-between h-full min-h-[300px]">
                    <div>
                       <h2 className="text-4xl md:text-5xl font-display font-black leading-[0.95] mb-6">
                          L'Innovation <br />
                          au service de <br />
                          <span className="text-blue-500 italic">l'Éducation.</span>
                       </h2>
                       <p className="text-gray-400 text-lg font-medium max-w-md">
                          Nous combinons les meilleures technologies et méthodes pédagogiques pour préparer nos étudiants aux défis de demain.
                       </p>
                    </div>
                    <div className="flex flex-wrap gap-8 pt-12">
                       <div>
                          <p className="text-5xl font-display font-black italic text-blue-500">92%</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-2">Réussite Examens</p>
                       </div>
                       <div className="w-[1px] h-12 bg-gray-800" />
                       <div>
                          <p className="text-5xl font-display font-black italic text-indigo-500">200+</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-2">Projets Étudiants / an</p>
                       </div>
                    </div>
                 </div>
              </div>
              <div className="flex-1 flex flex-col gap-8">
                 <div className="flex-1 bg-blue-600 rounded-[40px] p-10 text-white flex flex-col justify-between group cursor-default">
                    <div className="flex items-center justify-between">
                       <Users className="w-8 h-8 text-blue-200" />
                       <ArrowRight className="w-6 h-6 rotate-45 group-hover:rotate-0 transition-transform" />
                    </div>
                    <div>
                       <h3 className="text-2xl font-bold mb-2">Communauté Active</h3>
                       <p className="text-blue-100 text-sm italic font-medium">Rejoignez un réseau de diplômés dynamique et influent dans le monde entier.</p>
                    </div>
                 </div>
                 <div className="flex-1 bg-white border border-gray-100 rounded-[40px] p-10 flex flex-col justify-between group shadow-sm hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between">
                       <GraduationCap className="w-8 h-8 text-gray-900" />
                       <ChevronRight className="w-6 h-6 text-gray-300 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <div>
                       <h3 className="text-2xl font-bold text-gray-900 mb-2">Programmes Elite</h3>
                       <p className="text-gray-400 text-sm italic font-medium">Master, Doctorat et Certifications professionnelles reconnues par l'état.</p>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Global Network Branding */}
        <section className="px-6 py-24 border-t border-gray-100">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10 opacity-30 grayscale hover:opacity-100 transition-all duration-700">
             <div className="flex items-center gap-4 shrink-0">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                  <School className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-display font-black tracking-tight text-gray-900 uppercase leading-none">EducaSys</span>
                  <span className="text-[8px] font-black uppercase text-blue-600 tracking-widest mt-0.5">SaaS Infrastructure</span>
                </div>
             </div>
             <p className="text-sm font-medium text-gray-400 max-w-xl text-center md:text-left">
                {school.name} fait partie du réseau mondial EducaSys, garantissant une infrastructure technologique de pointe et des standards de sécurité critiques pour les données de ses étudiants.
             </p>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-gray-100 py-16 px-6">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white">
                 <School className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-black text-gray-900 uppercase tracking-tight italic leading-none">{school.name}</p>
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1 italic leading-none">Campus Digital</p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-gray-400 italic">
               <span className="cursor-default hover:text-blue-600 transition-colors">Portail Étudiant</span>
               <span className="cursor-default hover:text-blue-600 transition-colors">Espace Parents</span>
               <span className="cursor-default hover:text-blue-600 transition-colors">Staff Login</span>
               <span className="cursor-default hover:text-blue-600 transition-colors">Règlement Intérieur</span>
            </div>

            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
               © 2026 {school.name}. POWERED BY EDUCASYS.
            </p>
         </div>
      </footer>
    </div>
  );
};
