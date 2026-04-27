import React, { useState } from 'react';
import { 
  Building, 
  Search, 
  Plus, 
  MapPin, 
  Briefcase, 
  Calendar, 
  FileText,
  Heart,
  ChevronRight,
  Filter
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

import { UserRole } from '../types';

interface InternshipBoardProps {
  activeRole: UserRole;
}

export const InternshipBoard = ({ activeRole }: InternshipBoardProps) => {
  const canPublish = activeRole === 'Admin' || activeRole === 'Staff';
  const offers = [
    { id: 1, company: 'OCP Group', role: 'Intern Software Engineer', location: 'Casablanca/El Jadida', type: 'PFE', status: 'Applied' },
    { id: 2, company: 'Attijariwafa Bank', role: 'Business Analyst Intern', location: 'Casablanca (Head Office)', type: 'Stage Technique', status: 'Open' },
    { id: 3, company: 'X-HUB', role: 'Full Stack Java Intern', location: 'Remote/Casablanca', type: 'PFE', status: 'Applied' },
    { id: 4, company: 'CGI Morocco', role: 'DevOps Intern', location: 'Casablanca', type: 'Stage Observations', status: 'Open' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Stages & PFE</h1>
          <p className="text-gray-500">Postulez aux offres de nos partenaires et gérez vos conventions de stage.</p>
        </div>
        {canPublish && (
          <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 uppercase text-[10px] tracking-widest">
            <Plus className="w-4 h-4" /> Publier une offre
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
           {offers.map((offer, index) => (
             <motion.div 
               key={offer.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: index * 0.1 }}
               className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-100/50 transition-all group border-l-4 border-l-transparent hover:border-l-blue-600"
             >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                   <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all relative overflow-hidden">
                         <Building className="w-8 h-8 relative z-10" />
                      </div>
                      <div>
                         <h3 className="text-lg font-black italic text-gray-900 group-hover:text-blue-600 transition-colors">{offer.role}</h3>
                         <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-tight">{offer.company}</span>
                            <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">{offer.type}</span>
                         </div>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Lieu</p>
                         <p className="text-xs font-bold text-gray-900 italic">{offer.location}</p>
                      </div>
                      <button className={cn(
                        "px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                        offer.status === 'Applied' ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100"
                      )}>
                         {offer.status === 'Applied' ? 'Déjà Postulé' : 'Postuler'}
                      </button>
                   </div>
                </div>
             </motion.div>
           ))}
        </div>

        <div className="space-y-6">
           <div className="bg-gray-900 p-8 rounded-[40px] text-white">
              <h3 className="text-xl font-bold mb-6 italic tracking-tight flex items-center gap-2">
                 <FileText className="w-6 h-6 text-blue-400" /> Conventions & Suivi
              </h3>
              <div className="space-y-6">
                 <div className="relative pl-8 border-l border-white/10 before:absolute before:left-[-4px] before:top-0 before:w-2 before:h-2 before:bg-blue-400 before:rounded-full">
                    <p className="text-xs font-bold text-white mb-1 uppercase tracking-tight">Stage d'Observation</p>
                    <p className="text-[10px] text-gray-400 italic">Généré le 12 Fév 2026 • Validé par Administration</p>
                    <button className="mt-3 flex items-center gap-2 text-[10px] font-bold text-blue-400 hover:text-white transition-colors">
                       <FileText className="w-3.5 h-3.5" /> Télécharger Convention
                    </button>
                 </div>
                 <div className="relative pl-8 border-l border-white/10 before:absolute before:left-[-4px] before:top-0 before:w-2 before:h-2 before:bg-gray-600 before:rounded-full opacity-40">
                    <p className="text-xs font-bold text-white mb-1 uppercase tracking-tight">Stage Technique</p>
                    <p className="text-[10px] text-gray-400 italic">Prévu pour Juillet 2026</p>
                 </div>
              </div>
              <button className="w-full mt-10 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all italic">
                 Déposer un rapport de stage
              </button>
           </div>

           <div className="bg-blue-600 p-8 rounded-[40px] text-white shadow-2xl shadow-blue-200/50">
              <Heart className="w-10 h-10 mb-4 opacity-40" />
              <h4 className="text-lg font-bold mb-2 tracking-tight italic">Réseau d'Entreprises MIAGE</h4>
              <p className="text-xs opacity-80 leading-relaxed mb-6">Accédez à plus de 150 entreprises partenaires privilégiées pour vos stages et premier emploi.</p>
              <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-black/20 px-4 py-2 rounded-xl hover:bg-black/30 transition-all">
                 Voir l'annuaire partenaires <ChevronRight className="w-4 h-4" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};
