import React, { useState, useEffect } from 'react';
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
  Sparkles,
  ShieldCheck,
  Star,
  Trophy,
  GraduationCap,
  Layout,
  Smartphone,
  MousePointer2,
  Clock,
  Briefcase,
  LogIn,
  Menu,
  X
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
  const [isAnnual, setIsAnnual] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const FeatureCard = ({ icon: Icon, title, description }: any) => (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group"
    >
      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold mb-3 text-black">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans transition-colors duration-300 overflow-x-hidden">
      {/* Navbar */}
      <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled ? 'py-4' : 'py-8'}`}>
        <nav className={`max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between transition-all duration-300 rounded-full ${scrolled ? 'bg-white/80 backdrop-blur-xl border border-gray-100 shadow-2xl mx-4' : 'bg-transparent mx-4'}`}>
          <Link to="/" className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/40">
                <School className="w-6 h-6" />
             </div>
             <span className="text-2xl font-display font-black tracking-tighter text-black">EducaSys</span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {['Fonctionnalités', 'Démo'].map((link) => (
              <a key={link} href={`#${link.toLowerCase()}`} className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors uppercase tracking-widest">{link}</a>
            ))}
          </div>

           <div className="flex items-center gap-2 md:gap-4">
            <Link 
              to="/superadmincnx" 
              className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest italic text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Globe className="w-3 h-3" />
              Global Panel
            </Link>
            <button 
              onClick={() => setShowSchoolLoginModal(true)}
              className="text-[10px] font-black text-gray-400 hover:text-blue-600 transition-colors px-2 md:px-4 py-2 uppercase tracking-widest italic flex items-center gap-2"
              title="Connexion"
            >
              <span className="hidden sm:inline">Connexion</span>
              <LogIn className="w-5 h-5 sm:hidden" />
            </button>
            <button 
              onClick={() => setShowRequestModal(true)}
              className="bg-blue-600 hover:bg-blue-700 hover:scale-105 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full font-bold text-xs md:text-sm shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
            >
              <span className="hidden sm:inline">Demander Démo</span>
              <span className="sm:hidden">Démo</span>
            </button>
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-blue-600"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-white z-[120] p-8 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between mb-12">
                <Link to="/" className="flex items-center gap-3" onClick={() => setIsMenuOpen(false)}>
                   <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                      <School className="w-6 h-6" />
                   </div>
                   <span className="text-2xl font-display font-black tracking-tighter text-black">EducaSys</span>
                </Link>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <div className="flex flex-col gap-6">
                {['Fonctionnalités', 'Démo'].map((link) => (
                  <a 
                    key={link} 
                    href={`#${link.toLowerCase()}`} 
                    onClick={() => setIsMenuOpen(false)}
                    className="text-xl font-black text-gray-900 uppercase italic tracking-tighter hover:text-blue-600 transition-colors"
                  >
                    {link}
                  </a>
                ))}
              </div>

              <div className="mt-auto space-y-4">
                <Link 
                  to="/superadmincnx" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest italic text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  Global Panel
                </Link>
                <button 
                  onClick={() => { setShowSchoolLoginModal(true); setIsMenuOpen(false); }}
                  className="w-full px-6 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest italic text-xs hover:bg-black transition-all"
                >
                  Connexion École
                </button>
                <button 
                  onClick={() => { setShowRequestModal(true); setIsMenuOpen(false); }}
                  className="w-full px-6 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest italic text-xs hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all"
                >
                  Demander Démo
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hero */}
      <section className="relative pt-44 pb-32 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150vw] h-[1000px] bg-gradient-to-b from-blue-50 to-transparent -z-10 rounded-[100%]" />
        
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/5 border border-blue-600/10 rounded-full mb-8">
              <Sparkles className="w-3 h-3 text-blue-600" />
              <span className="text-[10px] font-black tracking-[0.2em] uppercase text-blue-600">Standard de Point 2026</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-display font-black tracking-tight leading-[0.9] mb-8 text-black transition-colors">
              Gérez Votre École <br className="hidden md:block" /> 
              Sans Stress 🚀
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-black font-medium leading-relaxed mb-12 transition-colors">
              La solution complète pour digitaliser votre établissement. Élèves, professeurs, notes et finances, tout est là 🏫✨
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <button 
                onClick={() => setShowRequestModal(true)}
                className="w-full sm:w-auto px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-blue-600/30 transition-all hover:scale-105 active:scale-95"
              >
                Démarrer Maintenant
              </button>
              <button 
                className="w-full sm:w-auto px-10 py-5 bg-white text-black border border-gray-100 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all shadow-sm"
              >
                Voir une Vidéo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-20 border-y border-gray-50">
         <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-[11px] font-black tracking-[0.3em] uppercase text-gray-400 mb-12 italic">Ils nous font confiance</p>
            <div className="flex flex-wrap justify-center gap-x-16 gap-y-8 grayscale opacity-60 hover:opacity-100 transition-opacity">
               {["Collège Al Andalous", "Lycée Ibn Khaldoun", "École Excellence Casablanca", "Groupe Atlas", "Institut Al Farabi"].map((name) => (
                 <span key={name} className="text-lg font-display font-black tracking-tighter text-black whitespace-nowrap">{name.toUpperCase()}</span>
               ))}
            </div>
         </div>
      </section>

      {/* Results Section */}

      {/* Features Grid */}
      <section id="fonctionnalités" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-display font-black tracking-tight mb-6 text-black">Tout ce dont vous avez besoin ⚡️</h2>
            <p className="text-gray-600 max-w-xl mx-auto font-medium">Une suite d'outils puissants pour piloter votre école comme un pro.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Layout} 
              title="Multi-écoles 🏢" 
              description="Chaque école dispose d'un espace isolé et sécurisé. Parfait pour les groupes scolaires." 
            />
            <FeatureCard 
              icon={Clock} 
              title="Absences en direct ⏱️" 
              description="Suivez les présences en temps réel." 
            />
            <FeatureCard 
              icon={Trophy} 
              title="Notes & Bulletins 📊" 
              description="Calculez les moyennes instantanément et générez des bulletins professionnels en un clic." 
            />
            <FeatureCard 
              icon={Smartphone} 
              title="Mobile First 📱" 
              description="Accédez à votre campus depuis votre smartphone, tablette ou ordinateur. Partout, tout le temps." 
            />
            <FeatureCard 
              icon={ShieldCheck} 
              title="Sécurité Totale 🔐" 
              description="Vos données sont protégées par les plus hauts standards de sécurité." 
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-display font-black tracking-tight mb-20 text-black">C'est simple comme bonjour 👋</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-blue-600/30 to-transparent" />
            
            {[
              { title: "On prépare votre espace 🛠️", desc: "On configure votre instance dédiée en quelques minutes selon vos besoins." },
              { title: "Formez votre équipe 🎓", desc: "On accompagne votre staff pour une prise en main rapide et sans friction." },
              { title: "Pilotez sereinement 🚀", desc: "Suivez tout en temps réel et libérez-vous des tâches administratives lourdes." }
            ].map((step, i) => (
              <div key={i} className="relative z-10">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl mx-auto mb-8 shadow-xl shadow-blue-600/20">{i + 1}</div>
                <h3 className="text-xl font-bold mb-4 text-black">{step.title}</h3>
                <p className="text-gray-600 text-sm italic">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
             {[
               { q: "EducaSys a transformé notre façon de gérer les absences. Tout est centralisé et sécurisé.", a: "Directrice", s: "Lycée Ibn Khaldoun" },
               { q: "Le tableau de bord Nexus nous donne une vision claire des performances dès le matin. Indispensable.", a: "Directeur Adjoint", s: "Groupe Scolaire Atlas" },
               { q: "L'installation a pris moins d'une heure. L'équipe a été très réactive pour la formation du personnel.", a: "Administrateur", s: "Collège Al Andalous" }
             ].map((t, i) => (
               <div key={i} className="p-8 bg-white glass-morphism rounded-[32px] italic border border-gray-100">
                 <p className="text-lg mb-8 leading-relaxed text-gray-700">"{t.q}"</p>
                 <div className="flex items-center gap-4 justify-center md:justify-start">
                    <div className="w-10 h-10 bg-gray-100 rounded-full" />
                    <div>
                       <p className="text-sm font-bold text-black">{t.a}</p>
                       <p className="text-[10px] uppercase font-black tracking-widest text-blue-600">{t.s}</p>
                    </div>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="px-6 py-24">
        <div className="max-w-7xl mx-auto bg-gradient-to-br from-blue-600 to-blue-800 rounded-[64px] p-12 md:p-24 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-3xl rounded-full" />
          <h2 className="text-4xl md:text-6xl font-display font-black tracking-tight mb-8 text-white">On passe au digital ? 🚀</h2>
          <p className="text-blue-100 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-12">
            Rejoignez les établissements qui nous font déjà confiance. Démarrage instantané, support local 🇲🇦
          </p>
          <button 
             onClick={() => setShowRequestModal(true)}
             className="px-12 py-6 bg-white text-blue-600 rounded-full font-bold text-xl shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-4 mx-auto"
          >
            Prendre rendez-vous <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* Vision 2026 Roadmap */}
      <section className="py-32 px-6 bg-gray-900 rounded-[64px] mx-4 mb-20 relative overflow-hidden" id="vision">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-widest italic mb-8">
            <Sparkles className="w-4 h-4" />
            L'Avenir de l'Éducation
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter mb-8">
            Vision <span className="text-blue-500">2026</span> : Au-delà du Cloud.
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg mb-20 font-medium italic">
            Nous ne construisons pas juste un logiciel, mais une infrastructure intelligente capable de prédire les succès de demain.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { year: 'Q3 2025', title: 'LMS Intégré', desc: 'Plateforme de cours interactifs avec correction IA automatique.' },
              { year: 'Q1 2026', title: 'Blockchain Diploma', desc: 'Certification infalsifiable des diplômes via la technologie Blockchain.' },
              { year: 'Q4 2026', title: 'Nexus VR Campus', desc: 'Immersion totale en réalité virtuelle pour les Travaux Pratiques.' }
            ].map((milestone, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -10 }}
                className="p-8 bg-white/5 border border-white/10 rounded-[32px] text-left hover:bg-white/[0.08] transition-all"
              >
                <div className="text-blue-500 font-mono text-xs font-black uppercase tracking-widest mb-4">{milestone.year}</div>
                <h3 className="text-xl font-black text-white italic mb-2">{milestone.title}</h3>
                <p className="text-gray-500 text-sm italic font-medium leading-relaxed">{milestone.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20 text-center md:text-left">
            <div className="col-span-1">
              <div className="flex items-center gap-3 justify-center md:justify-start">
                 <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                    <School className="w-5 h-5" />
                 </div>
                 <span className="text-xl font-display font-black tracking-tight text-black">EducaSys</span>
              </div>
              <p className="mt-6 text-sm text-gray-600 font-medium leading-relaxed italic">
                L'infrastructure intelligente pour l'éducation moderne au Maroc et dans la région MENA ⚡️
              </p>
            </div>
              {['Produit', 'Ressources', 'Légal'].map((col, i) => (
                <div key={col}>
                   <h4 className="text-xs font-black uppercase tracking-widest text-black mb-8">{col}</h4>
                   <ul className="space-y-4 text-sm text-gray-500 font-medium italic">
                      {i === 0 && ['Fonctionnalités', 'Changelog'].map(l => <li key={l}><a href="#">{l}</a></li>)}
                      {i === 1 && ['Documentation', 'Support', 'Blog'].map(l => <li key={l}><a href="#">{l}</a></li>)}
                      {i === 2 && ['Mentions légales', 'Confidentialité', 'CGU'].map(l => <li key={l}><a href="#">{l}</a></li>)}
                   </ul>
                </div>
              ))}
          </div>
          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-widest font-mono text-gray-400">
             <p>© 2026 EducaSys. Tous droits réservés.</p>
             <p className="flex items-center gap-2">Fait avec ❤️ au Maroc <span className="text-lg">🇲🇦</span></p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AnimatePresence>
        {showRequestModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowRequestModal(false)}
               className="absolute inset-0 bg-brand-bg/80 backdrop-blur-md" 
             />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-3xl md:rounded-[48px] border border-gray-100 shadow-3xl w-full max-w-xl overflow-hidden relative z-[201]"
              >
                 <div className="p-6 md:p-10 text-black">
                    {!isSubmitted ? (
                      <>
                        <h2 className="text-3xl font-display font-black italic mb-2 text-black">Demander une démo.</h2>
                        <p className="text-gray-500 text-sm italic mb-8">Un expert vous accompagnera dans la découverte du système dès demain.</p>
                        <form onSubmit={handleRequest} className="space-y-4">
                           <input required type="text" placeholder="Nom Complet" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-600 transition-all font-bold text-sm text-black" value={requestData.name} onChange={e => setRequestData({...requestData, name: e.target.value})} />
                           <input required type="text" placeholder="Établissement" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-600 transition-all font-bold text-sm text-black" value={requestData.schoolName} onChange={e => setRequestData({...requestData, schoolName: e.target.value})} />
                           <input required type="email" placeholder="Email Professionnel" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-600 transition-all font-bold text-sm text-black" value={requestData.email} onChange={e => setRequestData({...requestData, email: e.target.value})} />
                           <input required type="tel" placeholder="Téléphone" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-600 transition-all font-bold text-sm text-black" value={requestData.phone} onChange={e => setRequestData({...requestData, phone: e.target.value})} />
                           <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/20 active:scale-95 transition-all mt-4">Envoyer la demande</button>
                        </form>
                      </>
                    ) : (
                      <div className="text-center py-10 text-black">
                         <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
                         <h3 className="text-2xl font-black mb-4">Message Envoyé !</h3>
                         <p className="text-gray-500 italic mb-8">Merci de votre intérêt. Votre conseiller prendra contact avec vous d'ici 24h.</p>
                         <button onClick={() => setShowRequestModal(false)} className="px-10 py-4 bg-gray-100 rounded-2xl font-bold">Fermer</button>
                      </div>
                    )}
                 </div>
              </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSchoolLoginModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowSchoolLoginModal(false)}
               className="absolute inset-0 bg-brand-bg/80 backdrop-blur-md" 
             />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-3xl md:rounded-[48px] border border-gray-100 shadow-3xl w-full max-w-xl overflow-hidden relative z-[201]"
              >
                 <div className="p-6 md:p-10 text-black">
                    <h2 className="text-3xl font-display font-black italic mb-8 text-black">Accès Instance.</h2>
                    <form onSubmit={(e) => {
                       e.preventDefault();
                       if (loginSubdomain) navigate(`/${loginSubdomain}/login`);
                    }} className="space-y-6">
                       <div className="bg-gray-50 border border-gray-100 p-6 rounded-3xl flex items-center gap-2 focus-within:border-blue-600 transition-all">
                          <span className="text-gray-400 font-mono font-bold italic">educasys.app/</span>
                          <input 
                            required 
                            type="text" 
                            placeholder="mon-ecole" 
                            className="bg-transparent border-none outline-none flex-1 font-bold text-black uppercase italic tracking-widest placeholder:text-gray-300"
                            value={loginSubdomain}
                            onChange={e => setLoginSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                          />
                       </div>
                       <button type="submit" className="w-full py-5 bg-gray-900 text-white rounded-2xl font-bold text-lg active:scale-95 transition-all">Rejoindre le Campus</button>
                    </form>
                 </div>
              </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
