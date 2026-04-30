import React, { useState, useEffect } from 'react';
import { Lock, User, ShieldCheck, ArrowRight, ArrowLeft, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../services/api';
import { useParams, useNavigate, Link } from 'react-router-dom';

interface LoginProps {
  onLogin: (user: any) => void;
}

export const Login = ({ onLogin }: LoginProps) => {
  const { subdomain: pathSubdomain } = useParams();
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [school, setSchool] = useState<any>(null);

  useEffect(() => {
    if (pathSubdomain) {
      setSubdomain(pathSubdomain);
    } else {
      const hostname = window.location.hostname;
      if (hostname !== 'localhost' && !hostname.endsWith('.vercel.app') && !hostname.endsWith('.run.app')) {
        const parts = hostname.split('.');
        if (parts.length >= 1) setSubdomain(parts[0]);
      }
    }
  }, [pathSubdomain]);

  useEffect(() => {
    if (subdomain) {
      api.getSchoolBySubdomain(subdomain).then(setSchool).catch(() => {});
    }
  }, [subdomain]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!subdomain) {
        throw new Error('Veuillez accéder au portail via le lien de votre établissement.');
      }

      const user = await api.login(email, password);
      
      if (user.isSuperAdmin) {
        throw new Error('Veuillez utiliser le portail d\'administration globale pour ce compte.');
      }

      if (school && school.status === 'Suspended') {
        throw new Error('Account suspended, contact admin');
      }

      if (school && user.schoolId !== school.id) {
        throw new Error('Identifiant non reconnu pour cet établissement.');
      }

      onLogin(user);
      navigate(`/${subdomain}/dashboard`);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message === 'Identifiants invalides' ? 'Email ou mot de passe incorrect.' : err.message || 'Erreur de connexion.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6 font-sans relative overflow-hidden text-black">
      {/* Abstract Design Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-50/10 -skew-x-12 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-50/30 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2 pointer-events-none" />
      
      <Link 
        to="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors group z-20"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Retour à l'accueil
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[480px] z-10"
      >
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gray-900 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-gray-200 rotate-12 group hover:rotate-0 transition-transform duration-500">
             {school ? (
                <span className="text-3xl font-black text-white italic">{school.name[0]}</span>
             ) : (
                <ShieldCheck className="w-10 h-10 text-white" />
             )}
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter text-black uppercase leading-none">
            {school ? school.name : "EducaSys"}
          </h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-3 italic">
            {school ? `Portail Académique / ${school.subdomain}.edu` : "Digital Education Infrastructure"}
          </p>
        </div>

        <div className="bg-white p-10 rounded-[48px] shadow-2xl shadow-gray-200/50 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black italic uppercase text-gray-400 tracking-widest ml-4">Email ou Identifiant Académique</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email ou Identifiant Académique"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-3xl text-sm transition-all outline-none font-bold italic text-black placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black italic uppercase text-gray-400 tracking-widest ml-4">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-3xl text-sm transition-all outline-none font-bold italic text-black placeholder:text-gray-400"
                />
              </div>
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-red-600 text-[10px] font-black uppercase text-center bg-red-50 p-4 rounded-2xl border border-red-100 italic"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black uppercase italic shadow-2xl shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? "Vérification..." : <>Connecter <ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>
          
          <div className="mt-10 pt-10 border-t border-gray-50 flex flex-col items-center gap-4">
             <Link 
               to="/superadmincnx"
               className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors italic flex items-center gap-2"
             >
               Accès Panel Global <Globe className="w-3 h-3" />
             </Link>
          </div>
        </div>
        
        <p className="text-center mt-8 text-gray-300 text-[10px] font-bold uppercase tracking-[0.3em]">
          Powered by EducaSys Global Infrastructure
        </p>
      </motion.div>
    </div>
  );
};

