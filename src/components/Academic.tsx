import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit2, X, ChevronRight, Layers, BookOpen, MapPin, Check, AlertOctagon
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole } from '../types';
import { api } from '../services/api';

interface AcademicProps {
  activeRole: UserRole;
  user: any;
}

export const Academic = ({ activeRole, user }: AcademicProps) => {
  const [structures, setStructures] = useState<any[]>([]);
  const [filieres, setFilieres] = useState<any[]>([]);
  
  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
  const [isFiliereModalOpen, setIsFiliereModalOpen] = useState(false);
  
  const [editingStructure, setEditingStructure] = useState<any>(null);
  const [editingFiliere, setEditingFiliere] = useState<any>(null);
  
  const [structureToDelete, setStructureToDelete] = useState<any | null>(null);
  const [filiereToDelete, setFiliereToDelete] = useState<any | null>(null);
  
  const [structureForm, setStructureForm] = useState({ type: 'Matière', name: '', filiereId: '', examCount: 1 });
  const [filiereForm, setFiliereForm] = useState({ name: '', code: '', duration: '', description: '' });
  
  const [selectedFiliereId, setSelectedFiliereId] = useState<string | null>(null);

  const canManage = activeRole === 'Admin' || activeRole === 'Staff';
  const canDelete = activeRole === 'Admin';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const schoolId = user?.schoolId;
      const [structs, loadedFilieres] = await Promise.all([
        api.getGenericCollection('structures', schoolId).catch(() => []),
        api.getFilieres(schoolId).catch(() => [])
      ]);
      setStructures(structs);
      setFilieres(loadedFilieres);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStructure) {
        await api.updateGeneric('structures', editingStructure.id, structureForm);
      } else {
        await api.addGeneric('structures', { ...structureForm, schoolId: user?.schoolId });
      }
      setIsStructureModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };
  
  const handleSaveFiliere = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFiliere) {
        await api.updateFiliere(editingFiliere.id, filiereForm);
      } else {
        await api.addFiliere(filiereForm, user?.schoolId);
      }
      setIsFiliereModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteStructure = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const s = structures.find(x => x.id === id);
    if (s) setStructureToDelete(s);
  };

  const confirmDeleteStructure = async () => {
    if (!structureToDelete) return;
    await api.deleteGeneric('structures', structureToDelete.id);
    setStructureToDelete(null);
    loadData();
  };

  const handleDeleteFiliere = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const f = filieres.find(x => x.id === id);
    if (f) setFiliereToDelete(f);
  };

  const confirmDeleteFiliere = async () => {
    if (!filiereToDelete) return;
    await api.deleteFiliere(filiereToDelete.id);
    if (selectedFiliereId === filiereToDelete.id) setSelectedFiliereId(null);
    setFiliereToDelete(null);
    loadData();
  };

  const renderFilieres = () => {
    return filieres.map(f => (
      <div 
        key={f.id} 
        onClick={() => setSelectedFiliereId(selectedFiliereId === f.id ? null : f.id)}
        className={cn("p-3 rounded-xl flex items-center justify-between group cursor-pointer transition-colors border", selectedFiliereId === f.id ? "bg-blue-100 border-blue-300 shadow-sm" : "bg-gray-50 hover:bg-blue-50 border-transparent hover:border-blue-100")}
      >
        <span className={cn("text-sm font-bold", selectedFiliereId === f.id ? "text-blue-900" : "text-gray-700")}>{f.name}</span>
        <div className="flex gap-2">
          {canManage && (
            <div className="hidden group-hover:flex gap-1">
                <button onClick={(e) => { e.stopPropagation(); setEditingFiliere(f); setFiliereForm({ name: f.name, code: f.code || '', duration: f.duration || '', description: f.description || '' }); setIsFiliereModalOpen(true); }} className="text-blue-500 hover:text-blue-700 p-1 bg-white rounded-md shadow-sm">
                  <Edit2 className="w-3 h-3" />
                </button>
                {canDelete && (
                  <button onClick={(e) => handleDeleteFiliere(f.id, e)} className="text-red-500 hover:text-red-700 p-1 bg-white rounded-md shadow-sm">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
            </div>
          )}
          {selectedFiliereId === f.id && <Check className="w-4 h-4 text-blue-600" />}
          {selectedFiliereId !== f.id && <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500" />}
        </div>
      </div>
    ));
  };

  const renderModules = () => {
    let modules = structures.filter(s => s.type === 'Matière');
    if (selectedFiliereId) {
      modules = modules.filter(s => s.filiereId === selectedFiliereId || !s.filiereId || s.filiereId === '');
    }
    
    if (modules.length === 0) {
       return <p className="text-xs text-gray-400 italic font-medium p-2 text-center border-2 border-dashed border-gray-100 rounded-xl">Aucun module trouvé.</p>;
    }

    return modules.map(s => (
      <div key={s.id} className="p-3 bg-gray-50 rounded-xl flex items-center justify-between group hover:bg-purple-50 transition-colors border border-transparent hover:border-purple-100">
        <span className="text-sm font-bold text-gray-700">{s.name}</span>
        {canManage ? (
           <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={(e) => { e.stopPropagation(); setEditingStructure(s); setStructureForm({ type: s.type, name: s.name, filiereId: s.filiereId || '', examCount: s.examCount || 1 }); setIsStructureModalOpen(true); }} className="text-purple-500 hover:text-purple-700 p-1 bg-white rounded-md shadow-sm">
                <Edit2 className="w-3 h-3" />
              </button>
              {canDelete && (
                <button onClick={(e) => handleDeleteStructure(s.id, e)} className="text-red-500 hover:text-red-700 p-1 bg-white rounded-md shadow-sm">
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
           </div>
        ) : null}
      </div>
    ));
  };

  const renderSalles = () => {
    return structures.filter(s => s.type === 'Salle').map(s => (
      <div key={s.id} className="p-3 bg-gray-50 rounded-xl flex items-center justify-between group hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-100">
        <span className="text-sm font-bold text-gray-700">{s.name}</span>
        {canManage ? (
           <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={(e) => { e.stopPropagation(); setEditingStructure(s); setStructureForm({ type: s.type, name: s.name, filiereId: '', examCount: 1 }); setIsStructureModalOpen(true); }} className="text-rose-500 hover:text-rose-700 p-1 bg-white rounded-md shadow-sm">
                <Edit2 className="w-3 h-3" />
              </button>
              {canDelete && (
                <button onClick={(e) => handleDeleteStructure(s.id, e)} className="text-red-500 hover:text-red-700 p-1 bg-white rounded-md shadow-sm">
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
           </div>
        ) : null}
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Structure Scolaire</h1>
          <p className="text-gray-500">Organisation des filières, unités d'enseignement (modules) et salles.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden flex flex-col h-[600px]">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full opacity-50 pointer-events-none" />
           <div className="flex justify-between items-center mb-6 relative z-10">
             <h3 className="font-black text-gray-900 flex items-center gap-2 uppercase tracking-tight text-sm">
               <Layers className="w-5 h-5 text-blue-500" /> Filières & Spécialités
             </h3>
             {canManage && (
               <button onClick={() => { setEditingFiliere(null); setFiliereForm({ name: '', code: '', duration: '', description: '' }); setIsFiliereModalOpen(true); }} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 shadow-sm">
                 <Plus className="w-4 h-4" />
               </button>
             )}
           </div>
           <div className="space-y-3 relative z-10 overflow-y-auto flex-1 pr-2">
              {renderFilieres()}
              {filieres.length === 0 && <p className="text-xs text-gray-400 italic">Aucune filière créée.</p>}
           </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden flex flex-col h-[600px]">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-50 rounded-full opacity-50 pointer-events-none" />
           <div className="flex justify-between items-center mb-6 relative z-10">
             <h3 className="font-black text-gray-900 flex items-center gap-2 uppercase tracking-tight text-sm">
               <BookOpen className="w-5 h-5 text-purple-500" /> Modules (UE)
             </h3>
             {canManage && (
               <button onClick={() => { setEditingStructure(null); setStructureForm({ type: 'Matière', name: '', filiereId: selectedFiliereId || '', examCount: 1 }); setIsStructureModalOpen(true); }} className="p-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 shadow-sm">
                 <Plus className="w-4 h-4" />
               </button>
             )}
           </div>
           <div className="space-y-3 relative z-10 overflow-y-auto flex-1 pr-2">
              {renderModules()}
           </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden flex flex-col h-[600px]">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 rounded-full opacity-50 pointer-events-none" />
           <div className="flex justify-between items-center mb-6 relative z-10">
             <h3 className="font-black text-gray-900 flex items-center gap-2 uppercase tracking-tight text-sm">
               <MapPin className="w-5 h-5 text-rose-500" /> Salles de Classe
             </h3>
             {canManage && (
               <button onClick={() => { setEditingStructure(null); setStructureForm({ type: 'Salle', name: '', filiereId: '', examCount: 1 }); setIsStructureModalOpen(true); }} className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 shadow-sm">
                 <Plus className="w-4 h-4" />
               </button>
             )}
           </div>
           <div className="space-y-3 relative z-10 overflow-y-auto flex-1 pr-2">
              {renderSalles()}
              {structures.filter(s => s.type === 'Salle').length === 0 && <p className="text-xs text-gray-400 italic">Aucune salle ajoutée.</p>}
           </div>
        </div>
      </div>

      {/* Filiere Modal */}
      <AnimatePresence>
        {isFiliereModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsFiliereModalOpen(false)} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-md rounded-[32px] shadow-2xl relative p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-black text-gray-900 uppercase italic tracking-tight">{editingFiliere ? 'Modifier Filière' : 'Nouvelle Filière'}</h2>
                </div>
                <button onClick={() => setIsFiliereModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <form onSubmit={handleSaveFiliere} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Nom de la Filière</label>
                  <input required placeholder="ex: Génie Logiciel" value={filiereForm.name} onChange={e => setFiliereForm({...filiereForm, name: e.target.value})} className="w-full mt-1 px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-2xl outline-none font-bold text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Code (Optionnel)</label>
                  <input placeholder="ex: INFO-GL" value={filiereForm.code} onChange={e => setFiliereForm({...filiereForm, code: e.target.value})} className="w-full mt-1 px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-2xl outline-none font-bold text-sm" />
                </div>
                <div>
                   <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Description</label>
                   <textarea rows={3} placeholder="Description..." value={filiereForm.description} onChange={e => setFiliereForm({...filiereForm, description: e.target.value})} className="w-full mt-1 px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-2xl outline-none font-bold text-sm resize-none"></textarea>
                </div>
                <button type="submit" className="w-full py-5 mt-4 bg-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
                  {editingFiliere ? 'Mettre à jour' : 'Ajouter Filière'}
                  <Plus className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Structure Modal */}
      <AnimatePresence>
        {isStructureModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsStructureModalOpen(false)} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-md rounded-[32px] shadow-2xl relative p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-black text-gray-900 uppercase italic tracking-tight">{editingStructure ? 'Modifier' : 'Ajouter'} {structureForm.type}</h2>
                </div>
                <button onClick={() => setIsStructureModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <form onSubmit={handleSaveStructure} className="space-y-4">
                {structureForm.type === 'Matière' && (
                  <>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Assigné à la filière</label>
                    <select disabled={!!editingStructure} value={structureForm.filiereId} onChange={e => setStructureForm({...structureForm, filiereId: e.target.value})} className="w-full mt-1 px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-purple-600 rounded-2xl outline-none font-bold text-sm transition-all shadow-inner disabled:opacity-60">
                      <option value="">Toutes les filières (Commun)</option>
                      {filieres.map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Nombre d'examens (Notes)</label>
                    <input type="number" min="1" max="10" required value={structureForm.examCount} onChange={e => setStructureForm({...structureForm, examCount: parseInt(e.target.value) || 1})} className="w-full mt-1 px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-purple-600 rounded-2xl outline-none font-bold text-sm transition-all shadow-inner" />
                  </div>
                  </>
                )}
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Nom de l'élément</label>
                  <input required placeholder={structureForm.type === 'Salle' ? "ex: Salle 101" : "ex: Algorithmique Avancée"} value={structureForm.name} onChange={e => setStructureForm({...structureForm, name: e.target.value})} className="w-full mt-1 px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-2xl outline-none font-bold text-sm transition-all shadow-inner" />
                </div>
                <button type="submit" className="w-full py-5 mt-4 bg-gray-900 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-black shadow-lg shadow-gray-200 transition-all flex items-center justify-center gap-2">
                  {editingStructure ? 'Mettre à jour' : 'Ajouter'}
                  <Plus className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Delete Filiere Modal */}
      <AnimatePresence>
        {filiereToDelete && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFiliereToDelete(null)} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl relative overflow-hidden flex flex-col p-8 text-center items-center">
               <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                 <AlertOctagon className="w-8 h-8 text-red-500" />
               </div>
               <h2 className="text-xl font-black text-gray-900 mb-2">Supprimer la filière ?</h2>
               <p className="text-sm text-gray-500 mb-8">Voulez-vous vraiment supprimer <span className="font-bold text-gray-900">{filiereToDelete.name}</span> ? C'est irréversible.</p>
               <div className="flex w-full gap-3">
                 <button onClick={() => setFiliereToDelete(null)} className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-colors">
                   Annuler
                 </button>
                 <button onClick={confirmDeleteFiliere} className="flex-1 py-4 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 shadow-lg shadow-red-200 transition-colors">
                   Supprimer
                 </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Structure Modal */}
      <AnimatePresence>
        {structureToDelete && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setStructureToDelete(null)} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl relative overflow-hidden flex flex-col p-8 text-center items-center">
               <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                 <AlertOctagon className="w-8 h-8 text-red-500" />
               </div>
               <h2 className="text-xl font-black text-gray-900 mb-2">Supprimer l'élément ?</h2>
               <p className="text-sm text-gray-500 mb-8">Voulez-vous vraiment supprimer <span className="font-bold text-gray-900">{structureToDelete.name}</span> ?</p>
               <div className="flex w-full gap-3">
                 <button onClick={() => setStructureToDelete(null)} className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-colors">
                   Annuler
                 </button>
                 <button onClick={confirmDeleteStructure} className="flex-1 py-4 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 shadow-lg shadow-red-200 transition-colors">
                   Supprimer
                 </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
