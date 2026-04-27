import React from 'react';
import { 
  Users, 
  GraduationCap, 
  UserCheck, 
  FileEdit, 
  Upload, 
  Calendar,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';
import { api } from '../../services/api';

export const TeacherPortal = ({ user }: { user: any }) => {
  const [schedule, setSchedule] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const allSchedules = await api.getGenericCollection('schedules', user?.schoolId);
        const mySchedule = allSchedules.filter((s:any) => s.teacher === user?.name);
        setSchedule(mySchedule);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <Users className="absolute -right-10 -top-10 w-40 h-40 opacity-10" />
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl font-black italic shadow-lg shadow-blue-500/20">
            {user?.name?.[0] || 'T'}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight italic">Espace Enseignant</h1>
            <p className="opacity-60 text-sm font-medium">Prof. {user?.name || 'Enseignant'} • Département Miage</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
             <button className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:border-blue-500 transition-all text-left group">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all">
                   <UserCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-gray-900 italic uppercase text-[10px] tracking-widest mb-1">Mise à jour</h4>
                <p className="text-sm font-black text-gray-900">Appel & Présences</p>
             </button>
             <button className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:border-blue-500 transition-all text-left group">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-4 group-hover:bg-purple-600 group-hover:text-white transition-all">
                   <FileEdit className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-gray-900 italic uppercase text-[10px] tracking-widest mb-1">Évaluation</h4>
                <p className="text-sm font-black text-gray-900">Saisie des Notes</p>
             </button>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 italic uppercase text-sm tracking-tight flex items-center gap-2">
                   <Calendar className="w-5 h-5 text-blue-600" /> Mon Planning
                </h3>
             </div>
             <div className="p-2">
                {loading ? <p>Chargement...</p> : schedule.length === 0 ? <p>Aucun planning.</p> : schedule.map((item, i) => (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 rounded-2xl transition-all">
                     <div className="flex items-center gap-4">
                        <div className="text-center w-24">
                           <p className="text-[10px] font-bold text-gray-400 leading-none">{item.startTime}</p>
                           <p className="text-xs font-black text-gray-900">{item.endTime}</p>
                        </div>
                        <div className="w-px h-8 bg-gray-100"></div>
                        <div>
                           <p className="text-sm font-bold text-gray-900">{item.name}</p>
                           <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tight">{item.group}</p>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-6 italic uppercase text-sm tracking-tight flex items-center gap-2">
                 <Upload className="w-5 h-5 text-blue-600" /> Upload de Supports
              </h3>
              <div className="border-2 border-dashed border-gray-100 rounded-2xl p-8 flex flex-col items-center justify-center text-center group hover:border-blue-200 transition-all cursor-pointer">
                 <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                 </div>
                 <p className="text-xs font-bold text-gray-900 mb-1">Drag & Drop</p>
                 <p className="text-[10px] text-gray-400">PDF, PPTX, MP4 (Max 100MB)</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
