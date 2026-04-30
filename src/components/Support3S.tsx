import React from 'react';
import { 
  ClipboardList, 
  Ticket, 
  BookOpen, 
  Search, 
  Filter, 
  MoreHorizontal,
  Clock,
  AlertCircle,
  CheckCircle2,
  Plus
} from 'lucide-react';
import { mockTasks, mockTickets } from '../data/mockData';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export const Support3S = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">3S - Suivi Scolaire & Support</h1>
          <p className="text-gray-500">Tâches administratives, tickets de support et gestion des ressources pédagogiques.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
          <Plus className="w-4 h-4" /> Nouveau Ticket
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Tasks Section */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
             <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                   <ClipboardList className="w-5 h-5 text-blue-600" /> Tâches & Workflow
                </h2>
                <div className="flex gap-2">
                   <button className="text-[10px] uppercase font-bold text-gray-400 hover:text-blue-600 transition-colors">Tout Voir</button>
                </div>
             </div>
             <div className="p-4 space-y-3">
                {mockTasks.map((task) => (
                   <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl border border-transparent hover:border-gray-200 transition-all">
                      <div className="flex items-center gap-4">
                         <div className={cn(
                           "p-2 rounded-lg",
                           task.status === 'Done' ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                         )}>
                            {task.status === 'Done' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                         </div>
                         <div>
                            <p className="text-sm font-bold text-gray-900">{task.title}</p>
                            <p className="text-[10px] text-gray-400 font-medium tracking-tight">Echéance: {task.dueDate}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <span className={cn(
                           "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                           task.priority === 'High' ? "text-red-600 bg-red-50" : "text-blue-600 bg-blue-50"
                         )}>
                            {task.priority}
                         </span>
                         <button className="text-gray-300 hover:text-gray-600">
                            <MoreHorizontal className="w-4 h-4" />
                         </button>
                      </div>
                   </div>
                ))}
             </div>
          </div>

          {/* Tickets Section */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
             <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                   <Ticket className="w-5 h-5 text-purple-600" /> Centre de Support (Tickets)
                </h2>
             </div>
             <div className="divide-y divide-gray-50">
                {mockTickets.map((ticket) => (
                   <div key={ticket.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold">
                            {ticket.author.charAt(0)}
                         </div>
                         <div>
                            <h4 className="text-sm font-bold text-gray-900">{ticket.subject}</h4>
                            <p className="text-xs text-gray-500">Par {ticket.author} • {ticket.date}</p>
                         </div>
                      </div>
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        ticket.status === 'Open' ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                      )}>
                         {ticket.status}
                      </span>
                   </div>
                ))}
             </div>
          </div>
        </div>

        <div className="space-y-6">
           {/* Textbooks & Resources */}
           <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                 <BookOpen className="w-5 h-5 text-indigo-600" /> Manuels & Ressources
              </h3>
              <div className="space-y-4">
                 <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 group cursor-pointer hover:bg-white hover:border-blue-200 transition-all">
                    <p className="text-sm font-bold text-gray-900 mb-1">Architecture SI v2.4</p>
                    <p className="text-[10px] text-gray-400 font-medium">Digital Library • 12MB</p>
                 </div>
                 <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 group cursor-pointer hover:bg-white hover:border-blue-200 transition-all">
                    <p className="text-sm font-bold text-gray-900 mb-1">Maths Discrètes - S3</p>
                    <p className="text-[10px] text-gray-400 font-medium">PDF Ressource • 8MB</p>
                 </div>
              </div>
              <button className="w-full mt-6 py-2.5 text-xs font-bold text-blue-600 border border-blue-100 rounded-xl hover:bg-blue-50 transition-colors">
                 Accéder à la Bibliothèque
              </button>
           </div>

           <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
              <h4 className="flex items-center gap-2 text-amber-900 font-bold mb-2">
                 <AlertCircle className="w-5 h-5" /> Maintenance Système
              </h4>
              <p className="text-xs text-amber-700 leading-relaxed">Le portail EducaSys sera inaccessible ce dimanche de 02:00 à 04:00 pour une mise à jour des modules 3S.</p>
           </div>
        </div>
      </div>
    </div>
  );
};
