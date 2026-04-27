import React from 'react';
import { 
  Megaphone, 
  Palmtree, 
  Calendar, 
  MapPin, 
  Clock, 
  ChevronRight,
  Plus,
  Info
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

import { UserRole } from '../types';

interface SchoolLifeProps {
  activeRole: UserRole;
}

export const SchoolLife = ({ activeRole }: SchoolLifeProps) => {
  const canPost = activeRole === 'Admin' || activeRole === 'Staff';
  const announcements = [
    { id: 2, title: 'Conférence: L\'IA dans la Cybersécurité', date: '25 Avril 2026', type: 'Event' },
    { id: 3, title: 'Rappel: Paiement de Scolarité Mai', date: '18 Avril 2026', type: 'Finance' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vie Scolaire & Événements</h1>
          <p className="text-gray-500">Tableau d'affichage numérique, calendrier des vacances et événements du campus.</p>
        </div>
        {canPost && (
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
            <Plus className="w-4 h-4" /> Nouvelle Annonce
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notice Board */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
           <div className="bg-blue-600 p-6 text-white">
              <h2 className="text-xl font-bold flex items-center gap-3">
                 <Megaphone className="w-6 h-6" /> Tableau d'Affichage
              </h2>
              <p className="text-sm opacity-80 mt-1">Dernières communications officielles de l'administration.</p>
           </div>
           <div className="divide-y divide-gray-50">
              {announcements.map((ann, index) => (
                 <motion.div 
                   key={ann.id}
                   initial={{ opacity: 0, scale: 0.98 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ delay: index * 0.1 }}
                   className="p-6 hover:bg-gray-50/50 transition-colors flex items-center justify-between group cursor-pointer"
                 >
                    <div className="flex items-center gap-4">
                       <div className={cn(
                         "w-2 h-10 rounded-full",
                         ann.type === 'Official' ? "bg-blue-500" : ann.type === 'Event' ? "bg-purple-500" : "bg-amber-500"
                       )}></div>
                       <div>
                          <h4 className="font-bold text-gray-900 leading-tight">{ann.title}</h4>
                          <p className="text-xs text-gray-400 mt-1">{ann.date}</p>
                       </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-all group-hover:translate-x-1" />
                 </motion.div>
              ))}
           </div>
           <button className="w-full py-4 text-xs font-bold text-gray-400 hover:bg-gray-50 transition-colors border-t border-gray-50 uppercase tracking-widest">
              Historique des Annonces
           </button>
        </div>

        {/* Holidays & Calendar */}
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                 <Palmtree className="w-5 h-5 text-green-600" /> Vacances & Jours Fériés
              </h2>
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl border border-green-100">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-green-600 rounded-xl flex flex-col items-center justify-center text-white font-bold leading-none">
                          <span className="text-[10px] uppercase opacity-80">Mai</span>
                          <span className="text-lg">01</span>
                       </div>
                       <div>
                          <p className="text-sm font-bold text-green-900">Fête du Travail</p>
                          <p className="text-xs text-green-700">Aucun cours - Campus fermé</p>
                       </div>
                    </div>
                 </div>
                 <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 opacity-60">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-gray-400 rounded-xl flex flex-col items-center justify-center text-white font-bold leading-none text-center">
                          <span className="text-[10px] uppercase opacity-80">Juin</span>
                          <span className="text-lg">18</span>
                       </div>
                       <div>
                          <p className="text-sm font-bold text-gray-900">Eid al-Adha (Est.)</p>
                          <p className="text-xs text-gray-500">Date à confirmer</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-gray-900 p-8 rounded-3xl text-white relative overflow-hidden">
              <Calendar className="absolute -right-10 -bottom-10 w-40 h-40 opacity-10" />
              <div className="relative z-10">
                 <h3 className="text-xl font-bold mb-2 tracking-tight">Semaine MIAGE Alumni</h3>
                 <p className="text-sm opacity-60 mb-6 leading-relaxed">Préparez-vous pour le plus grand événement de networking de l'année. Du 15 au 20 Juin.</p>
                 <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-xs">
                       <Clock className="w-4 h-4 text-blue-400" /> Toute la journée
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                       <MapPin className="w-4 h-4 text-blue-400" /> Campus Casa
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
