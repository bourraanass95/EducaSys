import React from 'react';
import { 
  User, 
  BookMarked, 
  Calendar, 
  DollarSign, 
  Clock, 
  FileCheck,
  Download,
  AlertCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';
import { api } from '../../services/api';

export const StudentPortal = ({ user }: { user: any }) => {
  const [stats, setStats] = React.useState({ grades: '...', absences: '...', status: '...', nextExam: '...' });

  React.useEffect(() => {
    const fetchStudentStats = async () => {
      try {
        const [notes, attendance] = await Promise.all([
          api.getGenericCollection('notes_records', user?.schoolId),
          api.getGenericCollection('attendance', user?.schoolId)
        ]);

        const myNotes = notes.filter((n:any) => n.studentId === user?.id);
        const myAttendance = attendance.filter((a:any) => a.studentId === user?.id);

        let avg = 0;
        if (myNotes.length > 0) {
          const sums = myNotes.reduce((acc, n) => acc + (n.scores.reduce((a:number, b:number) => a+b, 0) / n.scores.length), 0);
          avg = sums / myNotes.length;
        }

        const absCount = myAttendance.filter((a:any) => a.status === 'Absent').length;

        setStats({
          grades: myNotes.length > 0 ? avg.toFixed(1) : 'N/A',
          absences: absCount.toString().padStart(2, '0'),
          status: 'Régulier',
          nextExam: '15 Mai'
        });
      } catch (e) {
        console.error(e);
      }
    };
    if (user) fetchStudentStats();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 rounded-3xl text-white shadow-xl">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-3xl font-black italic border border-white/20">
            {user?.name?.[0] || 'S'}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight italic">Bienvenue, {user?.name?.split(' ')[0]} !</h1>
            <p className="opacity-80 text-sm font-medium">{user?.program || 'Programme Miage'} • ID: {user?.id?.substring(0,8) || 'STD-000'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Moyenne Générale', val: stats.grades, unit: '/20', icon: BookMarked, col: 'blue' },
          { label: 'Absences', val: stats.absences, unit: 'Sessions', icon: Clock, col: 'red' },
          { label: 'Frais Scolaires', val: 'Actif', unit: '', icon: DollarSign, col: 'green' },
          { label: 'Prochain Examen', val: stats.nextExam, unit: '', icon: Calendar, col: 'purple' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
             <div className="flex items-center gap-4">
                <div className={cn(
                  "p-3 rounded-xl",
                  stat.col === 'blue' ? "bg-blue-50 text-blue-600" :
                  stat.col === 'red' ? "bg-red-50 text-red-600" :
                  stat.col === 'green' ? "bg-green-50 text-green-600" : "bg-purple-50 text-purple-600"
                )}>
                   <stat.icon className="w-5 h-5" />
                </div>
                <div>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                   <p className="text-xl font-black italic text-gray-900">{stat.val}<span className="text-xs ml-0.5 opacity-40">{stat.unit}</span></p>
                </div>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Grades/Course Material */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 italic uppercase text-sm tracking-tight">
                   <BookMarked className="w-5 h-5 text-blue-600" /> Ressources & Supports
                </h3>
                <button className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Tout voir</button>
             </div>
             <div className="p-2">
                {[
                  { subject: 'Architecture Cloud', type: 'PDF • Cours', size: '2.4 MB' },
                  { subject: 'Algorithmique S4', type: 'Video • Lab', size: '45 MB' },
                  { subject: 'Anglais Technique', type: 'PDF • Homework', size: '1.2 MB' },
                ].map((res, i) => (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 rounded-2xl transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-gray-100 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <Download className="w-4 h-4" />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-gray-900">{res.subject}</p>
                          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">{res.type} • {res.size}</p>
                       </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
             <h3 className="font-bold text-gray-900 mb-6 italic uppercase text-sm tracking-tight flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" /> Notifications
             </h3>
             <div className="space-y-4">
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                   <p className="text-xs font-bold text-amber-900">Conseil de Classe</p>
                   <p className="text-[10px] text-amber-700 mt-1">Le conseil de classe S1 est prévu pour le 25 Avril. Assurez-vous d'avoir validé vos TP.</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                   <p className="text-xs font-bold text-blue-900">Nouveau Support</p>
                   <p className="text-[10px] text-blue-700 mt-1">Prof. Alami a ajouté le support "Microservices v4" dans le module Architecture.</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);
