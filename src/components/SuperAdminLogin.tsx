import React, { useState } from 'react';
import { ShieldCheck, Lock, User, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

interface SuperAdminLoginProps {
  onLogin: (user: any) => void;
}

export const SuperAdminLogin = ({ onLogin }: SuperAdminLoginProps) => {
  const [identifiant, setIdentifiant] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const user = await api.login(identifiant, password);
      
      if (!user.isSuperAdmin) {
        throw new Error('Cet accès est réservé exclusivement à l\'administration globale.');
      }

      onLogin(user);
      navigate('/super-admin');
    } catch (err: any) {
      setError(err.message || 'Identifiants super-admin incorrects.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-blue-500/5 blur-[120px] -z-10 rounded-full scale-50" />
      
      <Link 
        to="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-blue-500 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Retour au Portail Public
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
           <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/30 ring-4 ring-blue-500/10">
              <ShieldCheck className="w-8 h-8 text-white" />
           </div>
           <h1 className="text-3xl font-black text-black uppercase italic tracking-tighter">Nexus <span className="text-blue-500">Core</span></h1>
           <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Global SaaS Administration</p>
        </div>

        <div className="bg-white border border-gray-100 p-10 rounded-[40px] shadow-2xl shadow-gray-200/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic ml-1">ID Global / Email</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text"
                  required
                  value={identifiant}
                  onChange={(e) => setIdentifiant(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent focus:border-blue-500/50 rounded-2xl text-black text-sm outline-none transition-all font-medium"
                  placeholder="admin-global"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic ml-1">Clé d'Accès</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent focus:border-blue-500/50 rounded-2xl text-black text-sm outline-none transition-all font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-red-600 text-xs font-bold bg-red-50 p-4 rounded-xl border border-red-100"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase italic shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Accéder au Noyau <ArrowRight className="w-5 h-5" /></>}
            </button>

            <button
              type="button"
              onClick={() => {
                setIdentifiant('anassbourra.1995@gmail.com');
                setPassword('admin');
              }}
              className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl text-[10px] font-black uppercase italic tracking-widest transition-all border border-gray-100 mt-2"
            >
              Connexion Rapide (Test)
            </button>
          </form>
        </div>
        
        <p className="text-center mt-8 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
          Propriété Exclusive de EducaSys Global
        </p>
      </motion.div>
    </div>
  );
};
