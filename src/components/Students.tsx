import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, Download, Mail, MapPin, Phone, BookOpen, Trophy,
  MoreVertical, Plus, Trash2, Edit2, X, AlertOctagon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, dedupeById } from '../lib/utils';
import { UserRole } from '../types';
import { api } from '../services/api';

interface StudentsProps {
  activeRole: UserRole;
  user: any;
}

export const Students = ({ activeRole, user }: StudentsProps) => {
  const [students, setStudents] = useState<any[]>([]);
  const [filieres, setFilieres] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiliere, setSelectedFiliere] = useState('Tous');
  const [selectedStatus, setSelectedStatus] = useState('Tous');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [previewStudent, setPreviewStudent] = useState<any | null>(null);
  
  const [studentToDelete, setStudentToDelete] = useState<any | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    identifiant: '', 
    password: '', 
    name: '', 
    imageUrl: '',
    dateOfBirth: '',
    placeOfBirth: '',
    gender: 'M',
    nationality: '',
    cinOrPassport: '',
    address: '',
    email: '', 
    phone: '', 
    whatsappPhone: '',
    parentPhone: '',
    parentName: '',
    lastDegree: '',
    totalTuition: 0,
    program: 'MIAGE', 
    year: '1', 
    status: 'Active',
    registrationYear: new Date().getFullYear().toString(),
    deactivationYear: ''
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
        };
        reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const schoolId = user?.schoolId;
      const [studentsData, filieresData, invoicesData] = await Promise.all([
        api.getStudents(schoolId).catch(err => []),
        api.getFilieres(schoolId).catch(err => []),
        api.getGenericCollection('invoices', schoolId).catch(err => [])
      ]);
      // Set the first filiere as default if exists
      if (filieresData.length > 0) {
        setFormData(prev => ({ ...prev, program: filieresData[0].name }));
      }
      setStudents(dedupe(studentsData));
      setFilieres(dedupe(filieresData));
      setInvoices(dedupe(invoicesData));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to deduplicate items by ID
  const dedupe = (arr: any[]) => {
    const seen = new Set();
    return (arr || []).filter(item => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  };

  const loadStudents = async () => {
    try {
      const data = await api.getStudents(user?.schoolId).catch(err => []);
      setStudents(dedupe(data));
    } catch (error) {
    }
  };

  const resetForm = () => {
    setFormData({ 
      identifiant: '', 
      password: '', 
      name: '', 
      imageUrl: '',
      dateOfBirth: '',
      placeOfBirth: '',
      gender: 'M',
      nationality: '',
      cinOrPassport: '',
      address: '',
      email: '', 
      phone: '', 
      whatsappPhone: '',
      parentPhone: '',
      parentName: '',
      lastDegree: '',
      totalTuition: 0,
      program: filieres.length > 0 ? filieres[0].name : 'MIAGE', 
      year: '1', 
      status: 'Active',
      registrationYear: new Date().getFullYear().toString(),
      deactivationYear: ''
    });
    setEditingStudent(null);
  };

  const handleOpenModal = (student: any = null) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        identifiant: student.identifiant || '', password: student.password || '', name: student.name || '',
        imageUrl: student.imageUrl || '',
        dateOfBirth: student.dateOfBirth || '', placeOfBirth: student.placeOfBirth || '', gender: student.gender || 'M',
        nationality: student.nationality || '', cinOrPassport: student.cinOrPassport || '', address: student.address || '',
        email: student.email || '', phone: student.phone || '', whatsappPhone: student.whatsappPhone || '',
        parentPhone: student.parentPhone || '', parentName: student.parentName || '', lastDegree: student.lastDegree || '',
        totalTuition: student.totalTuition || 0,
        program: student.program || (filieres.length > 0 ? filieres[0].name : 'MIAGE'),
        year: student.year?.toString() || '1', status: student.status || 'Active',
        registrationYear: student.registrationYear || new Date().getFullYear().toString(),
        deactivationYear: student.deactivationYear || ''
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = { 
        ...formData, 
        year: parseInt(formData.year),
        totalTuition: parseFloat(formData.totalTuition as any) || 0
      };

      if (editingStudent) {
        await api.updateStudent(editingStudent.id, payload);
        setSuccessMessage('Étudiant mis à jour avec succès');
      } else {
        await api.addStudent(payload, user?.schoolId);
        setSuccessMessage('Nouvel étudiant ajouté avec succès');
      }
      setIsModalOpen(false);
      resetForm();
      setTimeout(() => loadStudents(), 500);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('Error saving student:', error);
      alert('Erreur: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;
    setLoading(true);
    try {
      await api.deleteStudent(studentToDelete.id);
      await loadStudents();
      setStudentToDelete(null);
      setSuccessMessage('Profil étudiant supprimé avec succès.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error deleting student:', error);
    } finally {
      setLoading(false);
    }
  };

  const canManage = activeRole === 'Admin' || activeRole === 'Staff';
  const canDelete = activeRole === 'Admin';

  const filteredStudents = students.filter(student => {
    const name = student.name || '';
    const id = student.id || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFiliere = selectedFiliere === 'Tous' || student.program === selectedFiliere;
    const matchesStatus = selectedStatus === 'Tous' || student.status === selectedStatus;
    return matchesSearch && matchesFiliere && matchesStatus;
  });

  if (loading && students.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Base de données Étudiants</h1>
          <p className="text-gray-500">Gestion complète des profils académiques et administratifs.</p>
        </div>
        {successMessage && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-green-50 border border-green-100 px-4 py-2 rounded-xl">
            <p className="text-xs font-bold text-green-600 uppercase italic">✔️ {successMessage}</p>
          </motion.div>
        )}
        {canManage && (
          <div className="flex gap-2">
            <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 uppercase text-xs tracking-widest font-black italic">
              <Plus className="w-4 h-4" /> Nouvel Étudiant
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-8 w-full">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Rechercher un étudiant, No. ID, ou matricule..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 rounded-xl text-sm transition-all outline-none"
          />
        </div>
        <div className="flex h-10 gap-2 w-full md:w-auto">
          <select 
            value={selectedFiliere}
            onChange={(e) => setSelectedFiliere(e.target.value)}
            className="px-3 border border-gray-100 rounded-xl text-xs font-semibold text-gray-600 bg-gray-50/50 outline-none focus:border-blue-500 flex-1 md:flex-none"
          >
            <option value="Tous">Programme: Tous</option>
            {filieres.map(f => (
              <option key={f.id} value={f.name}>{f.name}</option>
            ))}
          </select>
          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 border border-gray-100 rounded-xl text-xs font-semibold text-gray-600 bg-gray-50/50 outline-none focus:border-blue-500 flex-1 md:flex-none"
          >
            <option value="Tous">Statut: Tous</option>
            <option value="Active">Active</option>
            <option value="Non Active">Non Active</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student, index) => {
          
          const studentInvoices = invoices.filter(inv => 
             (inv.studentId === student.id || inv.student === student.name || inv.studentName === student.name) 
             && (inv.status === 'Paid' || inv.status === 'paid')
          );
          const totalPaid = studentInvoices.reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);
          const totalDue = (student.totalTuition || 0) - totalPaid;

          return (
          <motion.div 
            key={student.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-[32px] border-2 border-gray-50 hover:border-blue-100 transition-all duration-300 shadow-sm hover:shadow-xl group overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4">
                  <div 
                    className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black italic text-xl shadow-lg shadow-blue-100 cursor-pointer overflow-hidden relative group"
                    onClick={() => setPreviewStudent(student)}
                  >
                    {student.imageUrl ? (
                        <img src={student.imageUrl} alt={student.name} className="w-full h-full object-cover" />
                    ) : (
                        student.name?.split(' ').map((n: string) => n[0]).join('')
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <Search className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 italic uppercase tracking-tight">{student.name}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{student.program}</p>
                  </div>
                </div>
                {canManage && (
                  <div className="flex gap-1">
                    <button onClick={() => handleOpenModal(student)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {canDelete && (
                      <button onClick={() => setStudentToDelete(student)} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                 <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                    <Mail className="w-4 h-4 text-blue-400" />
                    {student.email}
                 </div>
                 <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                    <Phone className="w-4 h-4 text-blue-400" />
                    {student.phone}
                 </div>
                 <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    {student.status === 'Active' 
                      ? `Niveau: Année ${student.year}` 
                      : `Scolarité: ${student.registrationYear || '?'} - ${student.deactivationYear || '?'}`
                    }
                 </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-50">
                 <div className="mb-2">
                    <div className="flex justify-between items-center mb-1">
                       <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Scolarité</span>
                       <span className="text-xs font-bold text-gray-900">{totalPaid} / {student.totalTuition || 0} MAD</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                       <div className={cn("h-1.5 rounded-full transition-all", ((totalPaid / (student.totalTuition || 1)) >= 1) ? 'bg-green-500' : 'bg-blue-500')} style={{ width: `${Math.min((totalPaid / (student.totalTuition || 1)) * 100, 100)}%` }}></div>
                    </div>
                 </div>
                 {totalDue > 0 && <span className="text-[10px] font-black uppercase text-red-500 tracking-widest leading-none">Reste à payer: {totalDue} MAD</span>}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className={cn("w-2 h-2 rounded-full", student.status === 'Active' ? "bg-green-500 animate-pulse" : "bg-gray-400")} />
                   <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{student.status}</span>
                </div>
                {student.gpa && (
                  <div className="bg-blue-50 px-4 py-2 rounded-xl">
                    <span className="text-[10px] font-black text-blue-600 uppercase italic">GPA: {student.gpa}/20</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )})}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {studentToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setStudentToDelete(null)} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl relative overflow-hidden flex flex-col p-8 text-center items-center">
               <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                 <AlertOctagon className="w-8 h-8 text-red-500" />
               </div>
               <h2 className="text-xl font-black text-gray-900 mb-2">Supprimer l'étudiant ?</h2>
               <p className="text-sm text-gray-500 mb-8">Voulez-vous vraiment supprimer le profil de <span className="font-bold text-gray-900">{studentToDelete.name}</span> ? Cette action est irréversible et supprimera toutes les ressources associées.</p>
               <div className="flex w-full gap-3">
                 <button onClick={() => setStudentToDelete(null)} className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-colors">
                   Annuler
                 </button>
                 <button onClick={confirmDelete} className="flex-1 py-4 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 shadow-lg shadow-red-200 transition-colors">
                   Supprimer
                 </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-[48px] shadow-2xl relative flex flex-col p-8 scrollbar-hide">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 italic uppercase tracking-tighter">
                    {editingStudent ? 'Éditer Étudiant' : 'Nouvel Étudiant'}
                  </h2>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest italic">Nexus Academic Management</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center mb-6">
                  <div className="relative w-28 h-28 rounded-3xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden group hover:border-blue-500 transition-colors">
                     {formData.imageUrl ? (
                       <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Avatar" />
                     ) : (
                       <div className="text-gray-400 text-xs text-center p-2 font-bold italic tracking-widest">PHOTO<br/><span className="text-[10px] font-medium">+ AJOUTER</span></div>
                     )}
                     <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 italic">Identifiant Unique (Matricule / ID)*</label>
                    <input required type="text" value={formData.identifiant} onChange={(e) => setFormData({...formData, identifiant: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-3xl outline-none font-bold italic transition-all text-sm" />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 italic">Nom Complet (nom + prénom)*</label>
                    <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-3xl outline-none font-bold italic transition-all text-sm" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 italic">Date de naissance</label>
                    <input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-3xl outline-none font-bold italic transition-all text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 italic">Lieu de naissance</label>
                    <input type="text" value={formData.placeOfBirth} onChange={(e) => setFormData({...formData, placeOfBirth: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-3xl outline-none font-bold italic transition-all text-sm" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 italic">Genre</label>
                    <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-3xl outline-none font-bold italic transition-all text-sm">
                      <option value="M">Masculin</option>
                      <option value="F">Féminin</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 italic">Nationalité</label>
                    <input type="text" value={formData.nationality} onChange={(e) => setFormData({...formData, nationality: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-3xl outline-none font-bold italic transition-all text-sm" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 italic">CIN / Passport</label>
                    <input type="text" value={formData.cinOrPassport} onChange={(e) => setFormData({...formData, cinOrPassport: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-3xl outline-none font-bold italic transition-all text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 italic">Email Personnel*</label>
                    <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-3xl outline-none font-bold italic transition-all text-sm" />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 italic">Adresse complète</label>
                    <textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} rows={2} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-3xl outline-none font-bold italic transition-all text-sm resize-none"></textarea>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 italic">Téléphone personnel</label>
                    <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-3xl outline-none font-bold italic transition-all text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 italic">WhatsApp Number</label>
                    <input type="text" value={formData.whatsappPhone} onChange={(e) => setFormData({...formData, whatsappPhone: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-3xl outline-none font-bold italic transition-all text-sm" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 italic">Téléphone Parent</label>
                    <input type="text" value={formData.parentPhone} onChange={(e) => setFormData({...formData, parentPhone: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-3xl outline-none font-bold italic transition-all text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 italic">Nom du Parent</label>
                    <input type="text" value={formData.parentName} onChange={(e) => setFormData({...formData, parentName: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-3xl outline-none font-bold italic transition-all text-sm" />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 italic">Dernier diplôme / filière bac + moyenne</label>
                    <input type="text" value={formData.lastDegree} onChange={(e) => setFormData({...formData, lastDegree: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-3xl outline-none font-bold italic transition-all text-sm" placeholder="Ex: Baccalauréat SVT - 14.5/20" />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 italic">Frais de Scolarité Globaux (MAD)</label>
                    <input type="number" value={isNaN(formData.totalTuition as number) ? '' : formData.totalTuition} onChange={(e) => setFormData({...formData, totalTuition: parseFloat(e.target.value)})} className="w-full px-5 py-4 bg-green-50 text-green-900 border-2 border-transparent focus:bg-white focus:border-green-600 rounded-3xl outline-none font-bold transition-all text-sm" placeholder="Ex: 35000" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 italic">Programme*</label>
                    <select value={formData.program} onChange={(e) => setFormData({...formData, program: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-3xl outline-none font-bold italic transition-all text-sm">
                      {filieres.map(f => (
                        <option key={f.id} value={f.name}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 italic">Année Actuelle*</label>
                    <select value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-3xl outline-none font-bold italic transition-all text-sm">
                      <option value="1">1ère Année</option>
                      <option value="2">2ème Année</option>
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 italic">Statut</label>
                    <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-3xl outline-none font-bold italic transition-all text-sm">
                      <option value="Active">Active</option>
                      <option value="Non Active">Non Active</option>
                    </select>
                  </div>
                  <div className="space-y-1 md:col-span-2 grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 italic">Année Entrée</label>
                      <input type="text" placeholder="2024" value={formData.registrationYear} onChange={(e) => setFormData({...formData, registrationYear: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-3xl outline-none font-bold italic transition-all text-sm" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 italic">Année Sortie</label>
                      <input type="text" placeholder="2026" value={formData.deactivationYear} onChange={(e) => setFormData({...formData, deactivationYear: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-3xl outline-none font-bold italic transition-all text-sm" />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button type="submit" disabled={isSaving} className={cn("w-full py-5 rounded-3xl font-black uppercase tracking-widest text-xs transition-all shadow-xl flex items-center justify-center gap-2", isSaving ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100")}>
                    {isSaving ? 'Enregistrement...' : (editingStudent ? 'Enregistrer les modifications' : 'Créer le profil étudiant')}
                    {!isSaving && <Plus className="w-4 h-4" />}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Preview Modal */}
      <AnimatePresence>
        {previewStudent && (
           <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPreviewStudent(null)} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-[48px] shadow-2xl relative flex flex-col p-8 scrollbar-hide">
                  <div className="flex justify-between items-start mb-6">
                     <div className="flex gap-6 items-center">
                        <div className="w-24 h-24 rounded-[32px] bg-blue-100 flex items-center justify-center overflow-hidden shadow-inner shrink-0">
                            {previewStudent.imageUrl ? (
                                <img src={previewStudent.imageUrl} className="w-full h-full object-cover" alt="Profile" />
                            ) : (
                                <span className="text-3xl font-black text-blue-600 italic">{previewStudent.name?.split(' ').map((n: string) => n[0]).join('')}</span>
                            )}
                        </div>
                        <div>
                          <h2 className="text-3xl font-black text-gray-900 italic uppercase tracking-tighter">{previewStudent.name}</h2>
                          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-1">{previewStudent.program} - Année {previewStudent.year}</p>
                          <span className="inline-block mt-3 px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-green-100">{previewStudent.status}</span>
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                        {canManage && (
                           <button 
                              onClick={() => {
                                 const studentToEdit = previewStudent;
                                 setPreviewStudent(null);
                                 handleOpenModal(studentToEdit);
                              }} 
                              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition-colors text-xs uppercase"
                           >
                              <Edit2 className="w-4 h-4" /> Éditer
                           </button>
                        )}
                        <button onClick={() => setPreviewStudent(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-6 h-6 text-gray-400" /></button>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mt-6 border-t border-gray-100 pt-8">
                      <div className="space-y-1">
                         <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Identifiant</span>
                         <p className="text-sm font-bold text-gray-900">{previewStudent.identifiant || '-'}</p>
                      </div>
                      <div className="space-y-1">
                         <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Email</span>
                         <p className="text-sm font-bold text-gray-900">{previewStudent.email || '-'}</p>
                      </div>
                      <div className="space-y-1">
                         <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Téléphone</span>
                         <p className="text-sm font-bold text-gray-900">{previewStudent.phone || '-'}</p>
                      </div>
                      <div className="space-y-1">
                         <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">WhatsApp</span>
                         <p className="text-sm font-bold text-gray-900">{previewStudent.whatsappPhone || '-'}</p>
                      </div>
                      <div className="space-y-1">
                         <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Date & Lieu de naissance</span>
                         <p className="text-sm font-bold text-gray-900">{previewStudent.dateOfBirth || '-'} à {previewStudent.placeOfBirth || '-'}</p>
                      </div>
                      <div className="space-y-1">
                         <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Genre & Nationalité</span>
                         <p className="text-sm font-bold text-gray-900">{previewStudent.gender === 'M' ? 'Masculin' : (previewStudent.gender === 'F' ? 'Féminin' : '-')} - {previewStudent.nationality || '-'}</p>
                      </div>
                      <div className="space-y-1">
                         <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">CIN / Passport</span>
                         <p className="text-sm font-bold text-gray-900">{previewStudent.cinOrPassport || '-'}</p>
                      </div>
                      <div className="space-y-1">
                         <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Parent / Tuteur</span>
                         <p className="text-sm font-bold text-gray-900">{previewStudent.parentName || '-'} ({previewStudent.parentPhone || '-'})</p>
                      </div>
                      <div className="space-y-1">
                         <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Frais de Scolarité Globaux</span>
                         <p className="text-sm font-bold text-gray-900">
                           {invoices.filter(inv => (inv.studentId === previewStudent.id || inv.student === previewStudent.name || inv.studentName === previewStudent.name) && (inv.status === 'Paid' || inv.status === 'paid')).reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0)} / {previewStudent.totalTuition || 0} MAD
                         </p>
                      </div>
                      <div className="space-y-1">
                         <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Période académique</span>
                         <p className="text-sm font-bold text-gray-900">{previewStudent.registrationYear || '?'} - {previewStudent.deactivationYear || 'Présent'}</p>
                      </div>
                      <div className="space-y-1 md:col-span-2">
                         <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Adresse Complète</span>
                         <p className="text-sm font-bold text-gray-900">{previewStudent.address || '-'}</p>
                      </div>
                      <div className="space-y-1 md:col-span-2">
                         <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Dernier Diplôme / Filière BAC</span>
                         <p className="text-sm font-bold text-gray-900">{previewStudent.lastDegree || '-'}</p>
                      </div>
                  </div>
              </motion.div>
           </div>
        )}
      </AnimatePresence>
    </div>
  );
};
