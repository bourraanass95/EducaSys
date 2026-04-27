import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  UserCircle, 
  Search, 
  Filter, 
  Plus, 
  Mail,
  Phone,
  ShieldCheck,
  Trash2,
  Clock,
  MapPin
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole } from '../types';
import { api, StaffMember } from '../services/api';

interface TeachersProps {
  activeRole: UserRole;
  user: any;
}

export const Teachers = ({ activeRole, user }: TeachersProps) => {
  const [teachers, setTeachers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPlanningModalOpen, setIsPlanningModalOpen] = useState(false);
  const [selectedProfessor, setSelectedProfessor] = useState<string | null>(null);
  const [teacherSchedule, setTeacherSchedule] = useState<any[]>([]);
  const [isScheduleLoading, setIsScheduleLoading] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const [previewMember, setPreviewMember] = useState<StaffMember | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    identifiant: '',
    password: '',
    name: '',
    subject: 'Enseignant (Teacher)',
    email: '',
    phone: '',
    type: 'Permanent (CDI)',
    salary: '',
    paymentType: 'Prix fixe',
    hourlyRate: '',
    nationality: ''
  });

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    setLoading(true);
    try {
      const data = await api.getStaff(user?.schoolId);
      const teacherRoles = ['Enseignant (Teacher)', 'Teacher', 'Professeur', 'Enseignant', 'Maître de Conférences', 'Intervenant'];
      const filtered = data.filter(s => teacherRoles.includes(s.subject));
      setTeachers(filtered);
    } catch (error) {
      console.error('Error loading teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowPlanning = async (professorName: string) => {
    setSelectedProfessor(professorName);
    setIsPlanningModalOpen(true);
    setIsScheduleLoading(true);
    try {
      const allSchedules = await api.getGenericCollection('schedules', user?.schoolId);
      const filtered = allSchedules.filter(s => s.teacher === professorName);
      setTeacherSchedule(filtered);
    } catch (error) {
      console.error('Error fetching teacher schedule:', error);
    } finally {
      setIsScheduleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingMember) {
        await api.updateStaff(editingMember.id, formData);
      } else {
        await api.addStaff(formData, user?.schoolId);
      }
      setIsModalOpen(false);
      setEditingMember(null);
      setFormData({ 
        identifiant: '', 
        password: '', 
        name: '', 
        subject: 'Enseignant (Teacher)', 
        email: '', 
        phone: '', 
        type: 'Permanent (CDI)', 
        salary: '', 
        paymentType: 'Prix fixe',
        hourlyRate: '',
        nationality: '' 
      });
      await loadTeachers();
    } catch (error) {
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (member: any) => {
    setEditingMember(member);
    setFormData({
      identifiant: member.identifiant || '',
      password: member.password || '',
      name: member.name,
      subject: member.subject,
      email: member.email,
      phone: member.phone,
      type: member.type,
      salary: member.salary || '',
      paymentType: member.paymentType || 'Prix fixe',
      hourlyRate: member.hourlyRate || '',
      nationality: member.nationality || ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteStaff = async (id: string) => {
    setMemberToDelete(id);
  };

  const confirmDelete = async () => {
    if (!memberToDelete) return;
    try {
      await api.deleteStaff(memberToDelete);
      setMemberToDelete(null);
      await loadTeachers();
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canCreate = activeRole === 'Admin' || activeRole === 'Staff';
  const canDelete = activeRole === 'Admin';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter">Gestion des Enseignants</h1>
          <p className="text-gray-500 font-medium">Administration du corps professoral et des emplois du temps.</p>
        </div>
        {canCreate && (
          <button 
            onClick={() => {
              setEditingMember(null);
              setFormData({ 
                identifiant: '', 
                password: '', 
                name: '', 
                subject: 'Enseignant (Teacher)', 
                email: '', 
                phone: '', 
                type: 'Permanent (CDI)', 
                salary: '', 
                paymentType: 'Prix fixe',
                hourlyRate: '',
                nationality: '' 
              });
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
             <Plus className="w-4 h-4" /> Ajouter un Enseignant
          </button>
        )}
      </div>

      <div className="relative group max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
        <input 
          type="text" 
          placeholder="Rechercher un professeur (nom, email)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all font-medium text-sm shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 animate-pulse h-64" />
          ))
        ) : filteredTeachers.length > 0 ? (
          filteredTeachers.map((member, index) => (
            <motion.div 
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button 
                  onClick={() => handleEdit(member)}
                  className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                >
                  <UserCircle className="w-5 h-5" />
                </button>
                {canDelete && (
                  <button 
                    onClick={() => handleDeleteStaff(member.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div 
                  onClick={() => setPreviewMember(member)}
                  className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl font-bold cursor-pointer hover:bg-indigo-200 transition-colors shadow-sm"
                >
                  {member.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{member.name}</h3>
                  <p className="text-xs text-indigo-600 font-medium">{member.subject}</p>
                </div>
              </div>
              <div className="space-y-3 pt-6 border-t border-gray-50">
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <Mail className="w-4 h-4 opacity-40" /> {member.email}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <Phone className="w-4 h-4 opacity-40" /> {member.phone}
                </div>
                <div className="mt-4 pt-4 flex justify-between items-center">
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase tracking-wider">{member.type}</span>
                  <button 
                    onClick={() => handleShowPlanning(member.name)}
                    className="text-[10px] uppercase font-bold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <Clock className="w-3 h-3" /> Voir Planning
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="lg:col-span-3 py-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-gray-400">
            <Search className="w-12 h-12 mb-2 opacity-20" />
            <p className="font-bold">Aucun enseignant trouvé</p>
          </div>
        )}
      </div>

      {/* CRUD Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                   <h2 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter">
                     {editingMember ? 'Détails Enseignant' : 'Ajouter un Enseignant'}
                   </h2>
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 italic">Gestion du corps professoral</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors shadow-sm"
                >
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-2 italic">Nom complet</label>
                    <input 
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 rounded-2xl text-sm transition-all outline-none font-bold italic"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-2 italic">Titre / Spécialité</label>
                    <select 
                      required
                      value={formData.subject || 'Enseignant (Teacher)'}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 rounded-2xl text-sm transition-all outline-none font-bold italic"
                    >
                       <option value="Enseignant (Teacher)">Enseignant</option>
                       <option value="Professeur">Professeur</option>
                       <option value="Maître de Conférences">Maître de Conférences</option>
                       <option value="Intervenant">Intervenant</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-2 italic">Type de contrat</label>
                    <select 
                      value={formData.type || 'Permanent (CDI)'}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 rounded-2xl text-sm transition-all outline-none font-bold italic"
                    >
                      <option value="Permanent (CDI)">Permanent (CDI)</option>
                      <option value="CDD">CDD</option>
                      <option value="Vacataire">Vacataire</option>
                      <option value="Prestataire">Prestataire</option>
                    </select>
                  </div>
                  <div className="col-span-2 grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-2 italic">Email Professionnel</label>
                      <input 
                        type="email"
                        required
                        value={formData.email || ''}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 rounded-2xl text-sm transition-all outline-none font-bold italic"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-2 italic">Téléphone</label>
                      <input 
                        type="text"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 rounded-2xl text-sm transition-all outline-none font-bold italic"
                      />
                    </div>
                  </div>
                  <div className="col-span-2 grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-2 italic">Type de Paiement</label>
                      <select 
                        value={formData.paymentType}
                        onChange={(e) => setFormData({...formData, paymentType: e.target.value})}
                        className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 rounded-2xl text-sm transition-all outline-none font-bold italic"
                      >
                        <option value="Prix fixe">Prix fixe (Salaire)</option>
                        <option value="Payé à l'heure">Payé à l'heure</option>
                      </select>
                    </div>
                    {formData.paymentType === "Prix fixe" ? (
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-2 italic">Salaire Mensuel (DH)</label>
                        <input 
                          type="number"
                          value={formData.salary || ''}
                          onChange={(e) => setFormData({...formData, salary: e.target.value})}
                          className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 rounded-2xl text-sm transition-all outline-none font-bold italic"
                          placeholder="Ex: 12000"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-2 italic">Taux Horaire (DH/h)</label>
                        <input 
                          type="number"
                          value={formData.hourlyRate || ''}
                          onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
                          className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 rounded-2xl text-sm transition-all outline-none font-bold italic"
                          placeholder="Ex: 250"
                        />
                      </div>
                    )}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-2 italic">Nationalité</label>
                    <input 
                      type="text"
                      value={formData.nationality || ''}
                      onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                      className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 rounded-2xl text-sm transition-all outline-none font-bold italic"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className={cn(
                      "w-full py-5 rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl transition-all flex items-center justify-center gap-2",
                      isSaving ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100"
                    )}
                  >
                    {isSaving ? 'Enregistrement...' : (editingMember ? 'Mettre à jour' : 'Ajouter')}
                    {!isSaving && <Plus className="w-4 h-4" />}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Teacher Planning Modal */}
      <AnimatePresence>
        {isPlanningModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPlanningModalOpen(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                   <h2 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter">
                     Planning : <span className="text-indigo-600">{selectedProfessor}</span>
                   </h2>
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 italic">Emploi du temps hebdomadaire</p>
                </div>
                <button 
                  onClick={() => setIsPlanningModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors shadow-sm"
                >
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto">
                {isScheduleLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                    <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mb-4" />
                    <p className="font-bold italic">Chargement du planning...</p>
                  </div>
                ) : teacherSchedule.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teacherSchedule.map((session, index) => (
                      <motion.div 
                        key={session.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-5 bg-gray-50 rounded-3xl border border-gray-100 relative"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-indigo-600">
                            <Briefcase className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1 italic">{session.day}</p>
                            <h4 className="font-bold text-gray-900 text-sm">{session.name}</h4>
                          </div>
                        </div>
                        <div className="space-y-2 mt-4 pt-4 border-t border-gray-200/50">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3.5 h-3.5 opacity-40" /> 
                            {session.startTime} - {session.endTime}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <ShieldCheck className="w-3.5 h-3.5 opacity-40" /> 
                            {session.group}
                          </div>
                          {session.room && (
                            <div className="flex items-center gap-2 text-xs text-indigo-600 font-bold">
                              <MapPin className="w-3.5 h-3.5" /> {session.room}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[32px] flex flex-col items-center justify-center text-gray-400">
                    <Briefcase className="w-12 h-12 mb-2 opacity-20" />
                    <p className="font-bold italic uppercase tracking-tighter">Aucune séance planifiée</p>
                  </div>
                )}
              </div>
              
              <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end">
                 <button 
                   onClick={() => setIsPlanningModalOpen(false)}
                   className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
                 >
                   Fermer
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {memberToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" 
              onClick={() => setMemberToDelete(null)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white rounded-[32px] p-8 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Supprimer l'enseignant ?</h3>
              <p className="text-sm text-gray-500 mb-6">Cette action est irréversible.</p>
              <div className="flex gap-4">
                <button onClick={() => setMemberToDelete(null)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200">Annuler</button>
                <button onClick={confirmDelete} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700">Supprimer</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Teacher View Modal */}
      <AnimatePresence>
        {previewMember && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewMember(null)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-[24px] bg-indigo-100 flex items-center justify-center text-indigo-600 text-3xl font-bold">
                    {previewMember.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">
                      {previewMember.name}
                    </h2>
                    <p className="text-sm font-bold text-indigo-600 mt-1 uppercase tracking-widest">{previewMember.subject}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setPreviewMember(null)}
                  className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors shadow-sm"
                >
                   <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Email</p>
                    <p className="font-bold text-gray-900 bg-gray-50 p-4 rounded-2xl">{previewMember.email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Téléphone</p>
                    <p className="font-bold text-gray-900 bg-gray-50 p-4 rounded-2xl">{previewMember.phone}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Contrat</p>
                    <p className="font-bold text-gray-900 bg-gray-50 p-4 rounded-2xl">{previewMember.type}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Rémunération</p>
                    <p className="font-bold text-gray-900 bg-gray-50 p-4 rounded-2xl">
                      {previewMember.paymentType === "Payé à l'heure" 
                        ? `${previewMember.hourlyRate || '—'} DH / Heure`
                        : `${previewMember.salary || '—'} DH (Fixe)`
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-gray-50 border-t border-gray-100 flex gap-4">
                <button 
                   onClick={() => {
                     setPreviewMember(null);
                     handleShowPlanning(previewMember.name);
                   }}
                   className="flex-1 py-4 bg-white text-indigo-600 border border-indigo-200 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                 >
                   <Briefcase className="w-4 h-4" /> Planning
                 </button>
                 {canCreate && (
                    <button 
                      onClick={() => {
                        const m = previewMember;
                        setPreviewMember(null);
                        handleEdit(m);
                      }}
                      className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-800 transition-all"
                    >
                      Modifier
                    </button>
                 )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
