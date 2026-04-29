import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCircle, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical,
  Mail,
  Phone,
  Briefcase,
  ShieldCheck,
  Trash2,
  Clock,
  MapPin
} from 'lucide-react';
import { cn, dedupeById } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole } from '../types';
import { api, StaffMember } from '../services/api';

interface StaffProps {
  activeRole: UserRole;
  user: any;
}

export const Staff = ({ activeRole, user }: StaffProps) => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const [previewMember, setPreviewMember] = useState<StaffMember | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    identifiant: '',
    password: '',
    name: '',
    subject: 'Personnel (Staff)',
    email: '',
    phone: '',
    type: 'Permanent (CDI)',
    salary: '',
    nationality: ''
  });

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const data = await api.getStaff(user?.schoolId);
      const teacherRoles = ['Enseignant (Teacher)', 'Teacher', 'Professeur', 'Enseignant', 'Maître de Conférences', 'Intervenant'];
      const filtered = data.filter(s => !teacherRoles.includes(s.subject));
      setStaff(dedupeById(filtered));
    } catch (error) {
      console.error('Error loading staff:', error);
    } finally {
      setLoading(false);
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
      setFormData({ identifiant: '', password: '', name: '', subject: 'Personnel (Staff)', email: '', phone: '', type: 'Permanent (CDI)', salary: '', nationality: '' });
      await loadStaff();
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
      await loadStaff();
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canCreate = activeRole === 'Admin' || activeRole === 'Staff';
  const canDelete = activeRole === 'Admin';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter">Gestion du Personnel</h1>
          <p className="text-gray-500 font-medium">Administration des équipes administratives et support.</p>
        </div>
        {canCreate && (
          <button 
            onClick={() => {
              setEditingMember(null);
              setFormData({ identifiant: '', password: '', name: '', subject: 'Personnel (Staff)', email: '', phone: '', type: 'Permanent (CDI)', salary: '', nationality: '' });
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
             <Plus className="w-4 h-4" /> Nouveau Membre
          </button>
        )}
      </div>

      <div className="relative group max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
        <input 
          type="text" 
          placeholder="Rechercher un membre (nom, email)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all font-medium text-sm shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 animate-pulse h-64" />
          ))
        ) : filteredStaff.length > 0 ? (
          filteredStaff.map((member, index) => (
            <motion.div 
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2" >
                <button 
                  onClick={() => handleEdit(member)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
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
                  className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold cursor-pointer hover:bg-blue-200 transition-colors shadow-sm"
                >
                  {member.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{member.name}</h3>
                  <p className="text-xs text-blue-600 font-medium">{member.subject}</p>
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
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="lg:col-span-3 py-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-gray-400">
            <Search className="w-12 h-12 mb-2 opacity-20" />
            <p className="font-bold">Aucun membre trouvé</p>
          </div>
        )}
      </div>

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
                     {editingMember ? 'Détails du Membre' : 'Ajouter un Membre'}
                   </h2>
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 italic">Gestion administrative</p>
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
                  {(formData.subject === 'Administrateur (Admin)' || formData.subject === 'Personnel (Staff)') && (
                    <>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-2 italic">Identifiant</label>
                        <input 
                          type="text"
                          required
                          value={formData.identifiant || ''}
                          onChange={(e) => setFormData({...formData, identifiant: e.target.value})}
                          className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-2xl text-sm transition-all outline-none font-bold italic"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-2 italic">Mot de Passe</label>
                        <input 
                          type="password"
                          required={!editingMember}
                          placeholder={editingMember ? "•••••••• (inchangé)" : "••••••••"}
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-2xl text-sm transition-all outline-none font-bold italic"
                        />
                      </div>
                    </>
                  )}
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-2 italic">Nom complet</label>
                    <input 
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-2xl text-sm transition-all outline-none font-bold italic"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-2 italic">Poste / Rôle</label>
                    <select 
                      required
                      value={formData.subject || 'Personnel (Staff)'}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-2xl text-sm transition-all outline-none font-bold italic"
                    >
                       <option value="Personnel (Staff)">Personnel (Staff)</option>
                       <option value="Administrateur (Admin)">Administrateur</option>
                       <option value="Comptable">Comptable</option>
                       <option value="Surveillant">Surveillant</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-2 italic">Type de contrat</label>
                    <select 
                      value={formData.type || 'Permanent (CDI)'}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-2xl text-sm transition-all outline-none font-bold italic"
                    >
                      <option value="Permanent (CDI)">Permanent (CDI)</option>
                      <option value="CDD">CDD</option>
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
                        className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-2xl text-sm transition-all outline-none font-bold italic"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-2 italic">Téléphone</label>
                      <input 
                        type="text"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-2xl text-sm transition-all outline-none font-bold italic"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className={cn(
                      "w-full py-5 rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl transition-all flex items-center justify-center gap-2",
                      isSaving ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100"
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

      <AnimatePresence>
        {memberToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setMemberToDelete(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-sm bg-white rounded-[32px] p-8 shadow-2xl text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Confirmer la suppression</h3>
              <p className="text-sm text-gray-500 mb-6">Action irréversible.</p>
              <div className="flex gap-4">
                <button onClick={() => setMemberToDelete(null)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200">Annuler</button>
                <button onClick={confirmDelete} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-200">Supprimer</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {previewMember && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPreviewMember(null)} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden">
               <div className="p-8 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-[24px] bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold shadow-inner">
                    {previewMember.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">{previewMember.name}</h2>
                    <p className="text-sm font-bold text-blue-600 mt-1 uppercase tracking-widest">{previewMember.subject}</p>
                  </div>
                </div>
                <button onClick={() => setPreviewMember(null)} className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors shadow-sm"><Plus className="w-5 h-5 rotate-45" /></button>
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
                </div>
              </div>
              <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button onClick={() => setPreviewMember(null)} className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px]">Fermer</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

