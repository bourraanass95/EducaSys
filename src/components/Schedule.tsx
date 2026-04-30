import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, MapPin, Clock, User, Trash2, Edit2, X, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, dedupeById } from '../lib/utils';
import { UserRole } from '../types';
import { api } from '../services/api';

interface ScheduleProps {
  activeRole: UserRole;
  user: any;
}

export const Schedule = ({ activeRole, user }: ScheduleProps) => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [filieres, setFilieres] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFiliere, setSelectedFiliere] = useState('');
  const [selectedYear, setSelectedYear] = useState('1');
  
  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [scheduleForm, setScheduleForm] = useState({ day: 'Lundi', startTime: '08:00', endTime: '10:00', name: '', teacher: '', room: '', group: '', year: '1' });

  const [modules, setModules] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);

  const canManage = activeRole === 'Admin' || activeRole === 'Staff';

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [scheds, loadedFilieres, loadedStructures, loadedUsers, loadedStaff] = await Promise.all([
        api.getGenericCollection('schedules', user?.schoolId),
        api.getFilieres(user?.schoolId),
        api.getGenericCollection('structures', user?.schoolId),
        api.getGenericCollection('users', user?.schoolId).catch(() => []), 
        api.getStaff(user?.schoolId).catch(() => [])
      ]);
      setSchedules(dedupeById(scheds));
      setFilieres(dedupeById(loadedFilieres));
      if (loadedStructures) {
         const uniqueStructures = dedupeById(loadedStructures);
         setModules(uniqueStructures.filter(s => s.type === 'Matière'));
         setRooms(uniqueStructures.filter(s => s.type === 'Salle'));
      }
      
      const teacherUsers = dedupeById(loadedUsers || []).filter((u: any) => u.role === 'Teacher');
      const teacherStaff = dedupeById(loadedStaff || []).filter((s: any) => 
        s.subject === 'Enseignant (Teacher)' || 
        s.subject === 'Teacher' || 
        s.subject === 'Professeur' || 
        s.subject === 'Enseignant'
      );
      
      // Combine and remove duplicates by name
      const allTeachersMap = new Map();
      teacherUsers.forEach(t => allTeachersMap.set(t.name, t));
      teacherStaff.forEach(t => allTeachersMap.set(t.name, t));
      
      setTeachers(Array.from(allTeachersMap.values()));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    const { day, startTime, endTime, room, teacher, group } = scheduleForm;

    if (startTime >= endTime) {
      alert('L\'heure de début doit être avant l\'heure de fin.');
      return;
    }

    // Check room occupancy
    const isRoomTaken = schedules.some(s => {
      if (editingSchedule && s.id === editingSchedule.id) return false;
      return s.day === day && s.room === room && s.startTime < endTime && s.endTime > startTime;
    });

    if (isRoomTaken) {
      alert(`La salle "${room}" est déjà occupée sur ce créneau horaire.`);
      return;
    }

    // Check teacher occupancy
    const isTeacherBusy = schedules.some(s => {
      if (editingSchedule && s.id === editingSchedule.id) return false;
      return s.day === day && s.teacher === teacher && s.startTime < endTime && s.endTime > startTime;
    });

    if (isTeacherBusy) {
      alert(`Le professeur "${teacher}" a déjà un cours programmé sur ce créneau.`);
      return;
    }

    // Check group/class occupancy
    const isGroupBusy = schedules.some(s => {
      if (editingSchedule && s.id === editingSchedule.id) return false;
      return s.day === day && s.group === group && s.year === scheduleForm.year && s.startTime < endTime && s.endTime > startTime;
    });

    if (isGroupBusy) {
      alert(`La classe "${group}" a déjà un cours programmé sur ce créneau.`);
      return;
    }

    try {
      if (editingSchedule) {
        await api.updateGeneric('schedules', editingSchedule.id, scheduleForm);
      } else {
        await api.addGeneric('schedules', { ...scheduleForm, schoolId: user?.schoolId });
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      console.error(err);
      alert('Erreur: ' + err.message);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      await api.deleteGeneric('schedules', id);
      await loadData();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Erreur lors de la suppression de la séance.');
    }
  };

  const activeSchedules = (selectedFiliere === '' || selectedYear === '') 
      ? [] 
      : schedules.filter(s => s.group === selectedFiliere && s.year?.toString() === selectedYear);

  const getOccupiedRooms = React.useCallback(() => {
    const { day, startTime, endTime } = scheduleForm;
    if (!day || !startTime || !endTime) return [];
    
    return schedules
      .filter(s => {
        if (editingSchedule && s.id === editingSchedule.id) return false;
        if (s.day !== day) return false;
        if (!s.startTime || !s.endTime) return false;
        return s.startTime < endTime && s.endTime > startTime;
      })
      .map(s => s.room);
  }, [scheduleForm.day, scheduleForm.startTime, scheduleForm.endTime, schedules, editingSchedule]);

  const occupiedRooms = getOccupiedRooms();

  const getSubjectColor = (name: string) => {
    const SUBJECT_COLORS = [
      { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-900', icon: 'text-blue-600' },
      { bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-900', icon: 'text-indigo-600' },
      { bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-900', icon: 'text-purple-600' },
      { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-900', icon: 'text-emerald-600' },
      { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-900', icon: 'text-rose-600' },
      { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-900', icon: 'text-amber-600' },
      { bg: 'bg-cyan-50', border: 'border-cyan-100', text: 'text-cyan-900', icon: 'text-cyan-600' },
      { bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-900', icon: 'text-orange-600' },
    ];

    if (!name) return SUBJECT_COLORS[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % SUBJECT_COLORS.length;
    return SUBJECT_COLORS[index];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Emplois du temps</h1>
          <p className="text-gray-500">Planification hebdomadaire par programme/filière.</p>
        </div>
        {canManage && (
          <button 
            onClick={() => { setEditingSchedule(null); setScheduleForm({ day: 'Lundi', startTime: '08:00', endTime: '10:00', name: '', teacher: '', room: '', group: selectedFiliere || (filieres[0]?.name || ''), year: selectedYear }); setIsModalOpen(true); }}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase italic text-[10px] tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 w-full lg:w-auto"
          >
            <Plus className="w-5 h-5" /> Nouvelle Séance
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm w-full">
           <div className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase whitespace-nowrap">
             <Filter className="w-4 h-4 text-blue-600" />
             Classe:
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
             <select 
               value={selectedFiliere}
               onChange={e => setSelectedFiliere(e.target.value)}
               className="px-4 py-2 border-2 border-gray-100 rounded-xl outline-none focus:border-blue-500 bg-gray-50 font-bold text-gray-700 w-full"
             >
               <option value="" disabled>-- Choisir le programme --</option>
               {filieres.map(f => (
                 <option key={f.id} value={f.name}>{f.name}</option>
               ))}
             </select>
             <select 
               value={selectedYear}
               onChange={e => setSelectedYear(e.target.value)}
               className="px-4 py-2 border-2 border-gray-100 rounded-xl outline-none focus:border-blue-500 bg-gray-50 font-bold text-gray-700 w-full"
             >
               <option value="1">1ère Année</option>
               <option value="2">2ème Année</option>
             </select>
           </div>
        </div>
      {selectedFiliere ? (
        <div className="bg-white border border-gray-100 rounded-[32px] shadow-xl overflow-hidden p-6 relative">
          <div className="absolute top-0 left-0 w-full h-32 bg-blue-50/50" />
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-gray-900 uppercase italic">
                Emploi du temps : {selectedFiliere}
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr>
                    <th className="p-4 border-b-2 border-gray-100 bg-gray-50 uppercase text-[10px] font-black tracking-widest text-gray-400 w-32 text-center">Horaires</th>
                    {days.map(day => (
                      <th key={day} className="p-4 border-b-2 border-gray-100 bg-gray-50 text-center uppercase text-[10px] font-black tracking-widest text-gray-700">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {hours.map((hour) => (
                    <tr key={hour}>
                      <td className="p-4 border-r border-gray-50 text-center text-xs font-bold text-gray-500 bg-gray-50/30 whitespace-nowrap">
                        {`${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`}
                      </td>
                      {days.map(day => {
                        const startingSession = activeSchedules.find(s => 
                          s.day === day && 
                          s.startTime && parseInt(s.startTime) === hour
                        );
                        
                        const isCovered = activeSchedules.find(s => 
                          s.day === day &&
                          s.startTime && s.endTime &&
                          parseInt(s.startTime) < hour &&
                          parseInt(s.endTime) > hour
                        );

                        if (isCovered) return null;

                        const rowSpan = startingSession && startingSession.endTime 
                          ? Math.max(1, parseInt(startingSession.endTime) - parseInt(startingSession.startTime)) 
                          : 1;

                        const session = startingSession;
                        const theme = session ? getSubjectColor(session.name) : null;

                        return (
                          <td key={day} rowSpan={rowSpan} className={cn("p-2 border-r border-gray-50 min-w-[150px] align-top relative group", !session && "bg-white hover:bg-gray-50/50 transition-colors h-32")}> 
                            {session && theme ? (
                              <div 
                                className={cn(
                                  "w-full rounded-xl p-3 border flex flex-col hover:shadow-md transition-shadow",
                                  theme.bg,
                                  theme.border
                                )} 
                                style={{ minHeight: `calc(${rowSpan * 8}rem - 1rem)` }}
                              >
                                <h4 className={cn("font-bold text-xs mb-1 line-clamp-2 pr-6", theme.text)}>{session.name}</h4>
                                <div className="space-y-1 mt-auto pt-2">
                                  <div className={cn("flex items-center gap-1 text-[10px] font-medium", theme.icon)}>
                                    <User className="w-3 h-3" /> {session.teacher}
                                  </div>
                                  <div className={cn("flex items-center gap-1 text-[10px] font-medium", theme.icon)}>
                                    <MapPin className="w-3 h-3" /> {session.room}
                                  </div>
                                  <div className={cn("flex items-center gap-1 text-[10px] font-medium", theme.icon)}>
                                    <Clock className="w-3 h-3" /> {session.startTime} - {session.endTime}
                                  </div>
                                </div>
                                
                                {canManage && (
                                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white shadow-md p-1 rounded-lg">
                                    <button onClick={() => { setEditingSchedule(session); setScheduleForm(session); setIsModalOpen(true); }} className={cn("p-1 hover:bg-gray-50 rounded", theme.icon)}><Edit2 className="w-3 h-3" /></button>
                                    <button onClick={() => handleDeleteSchedule(session.id)} className="p-1 hover:bg-red-50 rounded text-red-600"><Trash2 className="w-3 h-3" /></button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity min-h-[6rem]">
                                {canManage && (
                                  <button onClick={() => { setEditingSchedule(null); setScheduleForm({ day, startTime: `${hour.toString().padStart(2, '0')}:00`, endTime: `${(hour+1).toString().padStart(2, '0')}:00`, name: '', teacher: '', room: '', group: selectedFiliere, year: selectedYear }); setIsModalOpen(true); }} className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center">
                                    <Plus className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[32px] p-20 flex flex-col items-center justify-center text-gray-400">
          <Calendar className="w-16 h-16 mb-4 opacity-20" />
          <p className="font-black text-xl italic uppercase text-gray-500 mb-2">Sélectionnez une filière</p>
          <p className="text-sm font-medium">Veuillez choisir un programme pour afficher son emploi du temps.</p>
        </div>
      )}

      {/* Schedule Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl relative p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{editingSchedule ? 'Modifier la séance' : 'Nouvelle Séance'}</h2>
                </div>
                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <form onSubmit={handleSaveSchedule} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-400">Jour</label>
                    <select value={scheduleForm.day || 'Lundi'} onChange={e => setScheduleForm({...scheduleForm, day: e.target.value})} className="w-full mt-1 px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-blue-500">
                      {days.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-400">Horaires (Début - Fin)</label>
                    <div className="flex items-center gap-2 mt-1">
                      <select value={scheduleForm.startTime || '08:00'} onChange={e => setScheduleForm({...scheduleForm, startTime: e.target.value})} className="w-full px-2 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-blue-500">
                        {hours.map(h => <option key={`start-${h}`} value={`${h.toString().padStart(2, '0')}:00`}>{`${h.toString().padStart(2, '0')}:00`}</option>)}
                      </select>
                      <span className="text-gray-400 font-bold">-</span>
                      <select value={scheduleForm.endTime || '09:00'} onChange={e => setScheduleForm({...scheduleForm, endTime: e.target.value})} className="w-full px-2 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-blue-500">
                        {hours.map(h => <option key={`end-${h}`} value={`${(h+1).toString().padStart(2, '0')}:00`}>{`${(h+1).toString().padStart(2, '0')}:00`}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400">Matière / Cours</label>
                  <select required value={scheduleForm.name || ''} onChange={e => setScheduleForm({...scheduleForm, name: e.target.value})} className="w-full mt-1 px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-blue-500">
                    <option value="" disabled>Choisir un module...</option>
                    {modules.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400">Professeur</label>
                  <select required value={scheduleForm.teacher || ''} onChange={e => setScheduleForm({...scheduleForm, teacher: e.target.value})} className="w-full mt-1 px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-blue-500">
                    <option value="" disabled>Choisir un professeur...</option>
                    {teachers.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-400">Salle</label>
                    <select required value={scheduleForm.room || ''} onChange={e => setScheduleForm({...scheduleForm, room: e.target.value})} className="w-full mt-1 px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-blue-500">
                      <option value="" disabled>Choisir une salle...</option>
                      {rooms.map(r => {
                        const isTaken = occupiedRooms.includes(r.name);
                        return (
                          <option key={r.id} value={r.name} disabled={isTaken}>
                            {r.name} {isTaken ? '(Occupée)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-400">Année</label>
                    <select required value={scheduleForm.year} onChange={e => setScheduleForm({...scheduleForm, year: e.target.value})} className="w-full mt-1 px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-blue-500">
                       <option value="1">1ère Année</option>
                       <option value="2">2ème Année</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold uppercase text-gray-400">Filière concernée</label>
                    <select required value={scheduleForm.group} onChange={e => setScheduleForm({...scheduleForm, group: e.target.value})} className="w-full mt-1 px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-blue-500">
                       <option value="" disabled>Choisir...</option>
                       {filieres.map(f => (
                         <option key={f.id} value={f.name}>{f.name}</option>
                       ))}
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full py-4 mt-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200">
                  {editingSchedule ? 'Mettre à jour' : 'Ajouter'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
