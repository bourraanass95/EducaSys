import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  School, 
  Zap, 
  Users, 
  BarChart3, 
  LayoutDashboard,
  Globe,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export const GlobalHome = () => {
  const navigate = useNavigate();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showSchoolLoginModal, setShowSchoolLoginModal] = useState(false);
  const [loginSubdomain, setLoginSubdomain] = useState('');
  const [requestData, setRequestData] = useState({ name: '', schoolName: '', email: '', phone: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addGeneric('license_requests', {
        ...requestData,
        status: 'Pending',
        createdAt: new Date().toISOString()
      });
      setIsSubmitted(true);
      setRequestData({ name: '', schoolName: '', email: '', phone: '' });
    } catch (error) {
      console.error(error);
      alert('Erreur lors de l\'envoi de la demande.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* SEO Metadata (Mental note: In a real app, use React Helmet) */}
      
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-[60] px-6 py-4">
        <nav className="max-w-7xl mx-auto flex items-center justify-between bg-white/70 backdrop-blur-xl border border-white/20 shadow-lg shadow-black/5 px-6 py-3 rounded-2xl">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:rotate-6 transition-transform">
              <School className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-display font-black tracking-tighter text-gray-900 leading-none">
                EducaSys
              </span>
              <span className="text-blue-600 text-[10px] uppercase font-black tracking-[0.2em] mt-0.5">
                SaaS Foundation
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            <Link 
              to="/superadmincnx" 
              className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-gray-900 text-xs font-bold uppercase tracking-wider transition-colors"
            >
               Admin Global
            </Link>
            <div className="w-[1px] h-4 bg-gray-200 mx-2" />
            <button 
              onClick={() => setShowSchoolLoginModal(true)} 
              className="px-4 py-2 text-gray-500 hover:text-gray-900 text-xs font-bold uppercase tracking-wider transition-colors"
            >
               Connexion École
            </button>
            <button 
              onClick={() => setShowRequestModal(true)}
              className="ml-4 bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-gray-200 active:scale-95 text-sm"
            >
              Essai Gratuit
            </button>
          </div>

          <button className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5">
            <div className="w-6 h-0.5 bg-gray-900 rounded-full" />
            <div className="w-4 h-0.5 bg-gray-900 rounded-full self-end" />
          </button>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-44 pb-32 px-6 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120vw] h-[1000px] bg-gradient-to-b from-blue-50/50 to-transparent -z-10 rounded-[100%]" />
          
          <div className="max-w-7xl mx-auto text-center relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-gray-100 rounded-full shadow-sm mb-8">
                <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                  La solution préférée des directeurs d'école
                </span>
                <Sparkles className="w-3 h-3 text-amber-400" />
              </div>

              <h1 className="text-6xl md:text-8xl font-display font-black text-gray-900 tracking-tight leading-[0.9] mb-10">
                Gérez Votre École <br />
                <span className="text-blue-600 italic">sans stress.</span>
              </h1>

              <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto font-medium mb-12 leading-relaxed">
                Dites adieu à la paperasse et aux erreurs. EducaSys réunit tout — élèves, professeurs, et finances — dans un outil simple, rapide et accessible partout.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={() => setShowRequestModal(true)}
                  className="w-full sm:w-auto px-10 py-5 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-3 group"
                >
                  Démarrer Votre Transformation <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => setShowSchoolLoginModal(true)}
                  className="w-full sm:w-auto px-10 py-5 bg-white text-gray-900 border border-gray-200 rounded-2xl font-bold text-lg shadow-sm transition-all hover:bg-gray-50 active:scale-95"
                >
                  Accéder à Mon Instance
                </button>
              </div>

              {/* Floating Dashboard Preview Labels */}
              <div className="hidden lg:block">
                <motion.div 
                   animate={{ y: [0, -10, 0] }}
                   transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                   className="absolute top-20 left-10 p-4 bg-white rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4"
                >
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black uppercase text-gray-400">Finance</p>
                    <p className="text-sm font-bold">+24% de croissance</p>
                  </div>
                </motion.div>

                <motion.div 
                   animate={{ y: [0, 10, 0] }}
                   transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                   className="absolute bottom-10 right-10 p-4 bg-white rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4"
                >
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black uppercase text-gray-400">Effectifs</p>
                    <p className="text-sm font-bold">1,240 Étudiants</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Brand Logos / Trust Bar */}
        <section className="px-6 py-12 border-t border-gray-100">
           <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 opacity-50 grayscale">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Déjà adopté par des institutions majeures</span>
              <div className="flex flex-wrap justify-center gap-12 items-center">
                 <span className="text-xl font-display font-black tracking-tighter">ÉCOLE SUPÉRIEURE</span>
                 <span className="text-xl font-display font-black tracking-tighter">NEXUS ACADEMY</span>
                 <span className="text-xl font-display font-black tracking-tighter">LYCÉE MODERNE</span>
                 <span className="text-xl font-display font-black tracking-tighter">MIAGE GLOBAL</span>
              </div>
           </div>
        </section>

        {/* Bento Grid Features */}
        <section className="px-6 py-24 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
               <span className="text-blue-600 font-black uppercase tracking-widest text-[10px]">Pourquoi nous choisir ?</span>
               <h2 className="text-4xl md:text-5xl font-display font-black text-gray-900 tracking-tight mt-4">
                  Enfin un outil qui comprend votre métier.
               </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[240px]">
               {/* Feature 1: Simplicity & Security */}
               <motion.div 
                 whileHover={{ y: -5 }}
                 className="md:col-span-8 bg-blue-600 rounded-[32px] p-10 flex flex-col justify-between text-white overflow-hidden relative"
               >
                  <div className="relative z-10">
                     <Globe className="w-10 h-10 mb-6 text-blue-200" />
                     <h3 className="text-3xl font-display font-black leading-tight max-w-md">Vos données sont en sécurité. Toujours.</h3>
                     <p className="text-blue-100 font-medium mt-4 max-w-sm">Dites adieu aux pertes de dossiers. Vos informations sont protégées par une technologie de pointe, accessible uniquement par vous.</p>
                  </div>
                  <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-white/10 to-transparent p-12 flex items-center justify-center">
                     <div className="grid grid-cols-2 gap-4">
                        {[1,2,3,4].map(i => <div key={i} className="w-12 h-12 bg-white/20 rounded-xl animate-pulse" style={{ animationDelay: `${i*0.2}s` }} />)}
                     </div>
                  </div>
               </motion.div>

               {/* Feature 2: Support */}
               <motion.div 
                 whileHover={{ y: -5 }}
                 className="md:col-span-4 bg-emerald-600 rounded-[32px] p-10 flex flex-col justify-between text-white"
               >
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                    <Zap className="w-6 h-6 text-emerald-200" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">On ne vous lâche pas</h3>
                    <p className="text-emerald-100 text-sm leading-relaxed">Notre équipe est là pour vous aider à installer le système et former votre personnel en un clin d'œil.</p>
                  </div>
               </motion.div>

               {/* Feature 3: Clear Finances */}
               <motion.div 
                 whileHover={{ y: -5 }}
                 className="md:col-span-4 bg-gray-100 rounded-[32px] p-10 flex flex-col justify-between"
               >
                  <BarChart3 className="w-10 h-10 text-gray-900 mb-6" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Trésorerie limpide</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">Suivez les paiements et les impayés en un coup d'œil. Plus besoin de calculer pendant des heures.</p>
                  </div>
               </motion.div>

               {/* Feature 4: Custom Modules */}
               <motion.div 
                 whileHover={{ y: -5 }}
                 className="md:col-span-8 bg-white border border-gray-100 rounded-[32px] shadow-sm p-10 flex flex-col md:flex-row gap-10"
               >
                  <div className="flex-1 flex flex-col justify-between">
                     <div className="flex gap-4">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><BookOpen className="w-5 h-5" /></div>
                        <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center"><Zap className="w-5 h-5" /></div>
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><Users className="w-5 h-5" /></div>
                     </div>
                     <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Un outil qui vous ressemble</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">Que vous soyez une petite école ou un grand groupe, activez seulement ce dont vous avez besoin.</p>
                     </div>
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-2xl p-6 flex flex-col gap-4">
                     {[
                       { label: "Pédagogie", val: "Simple" },
                       { label: "Trésorerie", val: "Claire" },
                       { label: "Élèves", val: "Suivis" }
                     ].map((item, i) => (
                       <div key={i} className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider font-mono">{item.label}</span>
                          <span className="text-xs font-bold text-blue-600">{item.val}</span>
                       </div>
                     ))}
                  </div>
               </motion.div>
            </div>
          </div>
        </section>

        {/* Social Proof CTA */}
        <section className="px-6 py-24">
          <div className="max-w-7xl mx-auto">
             <div className="bg-blue-600 rounded-[64px] p-12 md:p-24 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[500px] h-full bg-white/10 blur-[120px] rounded-full translate-x-1/2 -z-0" />
                
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
                   <div className="max-w-xl">
                      <h2 className="text-4xl md:text-6xl font-display font-black text-white leading-[0.95] mb-8">
                         Prêt à passer au <br/>
                         <span className="text-blue-100 italic">niveau supérieur ?</span>
                      </h2>
                      <p className="text-blue-50 text-lg font-medium mb-10">
                         Rejoignez les directeurs qui ont déjà simplifié leur quotidien. Plus de temps pour vos élèves, moins pour la paperasse.
                      </p>
                      <button 
                        onClick={() => setShowRequestModal(true)}
                        className="inline-flex items-center gap-3 px-10 py-5 bg-white text-blue-600 rounded-2xl font-bold text-lg shadow-2xl transition-all hover:scale-[1.03] active:scale-95"
                      >
                         Démarrer Maintenant <ArrowRight className="w-6 h-6" />
                      </button>
                   </div>
                   <div className="relative flex-1 flex justify-center">
                      <div className="w-full max-w-sm aspect-square bg-white/10 border border-white/20 rounded-[48px] backdrop-blur-2xl flex items-center justify-center relative overflow-hidden shadow-2xl">
                         <School className="w-32 h-32 text-white/40" />
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </section>
      </main>

      {/* Trial Request Modal */}
      <AnimatePresence>
        {showRequestModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowRequestModal(false)}
               className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[40px] shadow-2xl w-full max-w-xl overflow-hidden relative z-[101]"
            >
              <div className="bg-blue-600 p-10 text-white relative">
                 <button 
                   onClick={() => setShowRequestModal(false)}
                   className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                 >
                    <ArrowRight className="w-5 h-5 rotate-180" />
                 </button>
                 <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">Transformation Digitale</span>
                 <h2 className="text-3xl font-display font-black leading-tight mt-2">Démarrer Votre Essai.</h2>
              </div>
              
              {!isSubmitted ? (
                <form onSubmit={handleRequest} className="p-10 space-y-5">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic ml-2">Nom Complet</label>
                         <input 
                           required
                           type="text" 
                           placeholder="Jean Dupont"
                           className="w-full px-5 py-4 bg-gray-50 border border-gray-100 focus:border-blue-600 focus:bg-white rounded-xl outline-none font-bold text-sm transition-all"
                           value={requestData.name}
                           onChange={e => setRequestData({...requestData, name: e.target.value})}
                         />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic ml-2">Établissement</label>
                         <input 
                           required
                           type="text" 
                           placeholder="Lycée Moderne"
                           className="w-full px-5 py-4 bg-gray-50 border border-gray-100 focus:border-blue-600 focus:bg-white rounded-xl outline-none font-bold text-sm transition-all"
                           value={requestData.schoolName}
                           onChange={e => setRequestData({...requestData, schoolName: e.target.value})}
                         />
                      </div>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic ml-2">Email Professionnel</label>
                      <input 
                        required
                        type="email" 
                        placeholder="contact@institution.com"
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 focus:border-blue-600 focus:bg-white rounded-xl outline-none font-bold text-sm transition-all"
                        value={requestData.email}
                        onChange={e => setRequestData({...requestData, email: e.target.value})}
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic ml-2">Téléphone</label>
                      <input 
                        required
                        type="tel" 
                        placeholder="+212 6..."
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 focus:border-blue-600 focus:bg-white rounded-xl outline-none font-bold text-sm transition-all"
                        value={requestData.phone}
                        onChange={e => setRequestData({...requestData, phone: e.target.value})}
                      />
                   </div>
                   <button 
                     type="submit"
                     className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 mt-4"
                   >
                      Envoyer Ma Demande <Zap className="w-5 h-5 fill-current" />
                   </button>
                </form>
              ) : (
                <div className="p-16 text-center">
                   <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-10 h-10" />
                   </div>
                   <h3 className="text-2xl font-display font-black text-gray-900 leading-tight">Demande Reçue.</h3>
                   <p className="text-gray-500 font-medium mt-4">Notre équipe vous contactera dans les plus brefs délais pour configurer votre instance.</p>
                   <button onClick={() => {
                        setShowRequestModal(false);
                        setIsSubmitted(false);
                        setRequestData({ name: '', schoolName: '', email: '', phone: '' });
                   }} className="mt-8 px-8 py-4 bg-gray-900 text-white rounded-xl font-bold text-sm transition-all hover:scale-105 shadow-lg">
                     Terminer
                   </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* School Login Modal */}
      <AnimatePresence>
        {showSchoolLoginModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowSchoolLoginModal(false)}
               className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[40px] shadow-2xl w-full max-w-xl overflow-hidden relative z-[101]"
            >
              <div className="bg-gray-900 p-10 text-white relative">
                 <button 
                   onClick={() => setShowSchoolLoginModal(false)}
                   className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                 >
                    <ArrowRight className="w-5 h-5 rotate-180" />
                 </button>
                 <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Accès Réseau</span>
                 <h2 className="text-3xl font-display font-black leading-tight mt-2">Bienvenue.</h2>
              </div>
              
              <form onSubmit={(e) => {
                 e.preventDefault();
                 if (loginSubdomain) {
                    navigate(`/${loginSubdomain}/login`);
                 }
              }} className="p-10 space-y-6">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic ml-2">Domaine de votre établissement</label>
                    <div className="flex items-center bg-gray-50 border border-gray-100 focus-within:border-blue-600 focus-within:bg-white rounded-xl transition-all overflow-hidden pl-6">
                       <span className="text-gray-400 font-bold text-sm italic">educasys.com/</span>
                       <input 
                         required
                         type="text" 
                         placeholder="miage"
                         autoFocus
                         className="w-full py-4 pr-6 bg-transparent outline-none font-bold text-sm"
                         value={loginSubdomain}
                         onChange={e => setLoginSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                       />
                    </div>
                 </div>
                 <button 
                   type="submit"
                   className="w-full py-5 bg-gray-900 text-white rounded-2xl font-bold shadow-lg transition-all hover:bg-black active:scale-95 flex items-center justify-center gap-3"
                 >
                    Accéder à mon établissement <ArrowRight className="w-5 h-5" />
                 </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-20 px-6">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
            <div className="col-span-1 md:col-span-1">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                  <School className="w-4 h-4" />
                </div>
                <span className="text-lg font-display font-black tracking-tight">EducaSys</span>
              </Link>
              <p className="mt-6 text-sm text-gray-500 font-medium leading-relaxed">
                Simplifiez la gestion de votre école et concentrez-vous sur ce qui compte vraiment : l'éducation de vos élèves.
              </p>
            </div>
            
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-gray-900 mb-6">Produit</h4>
              <ul className="space-y-4 text-sm text-gray-500 font-medium italic">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Plateforme</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Infrastructure</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Tarification</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-gray-900 mb-6">Infrastruture</h4>
              <ul className="space-y-4 text-sm text-gray-500 font-medium italic">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Nexus Cloud</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Sécurité</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Disponibilité</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-gray-900 mb-6">Contact</h4>
              <ul className="space-y-4 text-sm text-gray-500 font-medium italic">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Support Global</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Ventes</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Partenaires</a></li>
              </ul>
            </div>
         </div>
         
         <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              © 2026 NEXUS INFRASTRUCTURES GLOBAL. PROJET EDUCAYSY. TOUS DROITS RÉSERVÉS.
            </p>
            <div className="flex gap-6 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
              <a href="#" className="hover:text-gray-900 transition-colors">Confidentialité</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Conditions d'Utilisation</a>
            </div>
         </div>
      </footer>
    </div>
  );
};
