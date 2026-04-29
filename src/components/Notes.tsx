import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  FileCheck, 
  Plus,
  Save,
  ChevronDown,
  BookOpen,
  Filter,
  CheckCircle2,
  X,
  FileDown
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
import { UserRole } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface NotesProps {
  activeRole: UserRole;
  user: any;
}

export const Notes = ({ activeRole, user }: NotesProps) => {
  const [students, setStudents] = useState<any[]>([]);
  const [filieres, setFilieres] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [selectedFiliere, setSelectedFiliere] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [classGrades, setClassGrades] = useState<any[]>([]);

  // Modal State
  const [activeStudent, setActiveStudent] = useState<any | null>(null);
  const [selectedModalModule, setSelectedModalModule] = useState('');
  const [studentGrades, setStudentGrades] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [currentModuleExamCount, setCurrentModuleExamCount] = useState(1);
  const [existingRecordId, setExistingRecordId] = useState<string | null>(null);

  const canEdit = activeRole === 'Admin' || activeRole === 'Staff';

  useEffect(() => {
    loadInitialData();
  }, [user]);

  useEffect(() => {
    if (selectedFiliere && selectedYear) {
      loadStudents();
    } else {
      setStudents([]);
    }
  }, [selectedFiliere, selectedYear]);

  useEffect(() => {
    if (activeStudent && selectedModalModule) {
      loadStudentModuleGrades();
    } else {
      setStudentGrades([]);
      setExistingRecordId(null);
    }
  }, [activeStudent, selectedModalModule]);

  useEffect(() => {
    if (selectedFiliere && selectedYear && selectedModule) {
      loadClassGrades();
    } else {
      setClassGrades([]);
    }
  }, [selectedFiliere, selectedYear, selectedModule]);

  const loadClassGrades = async () => {
    try {
      const allGrades = await api.getGenericCollection('notes_records', user?.schoolId);
      const relevantGrades = allGrades.filter((g: any) => 
        g.filiere === selectedFiliere &&
        g.year === selectedYear &&
        g.module === selectedModule
      );
      setClassGrades(relevantGrades);
    } catch (error) {
      console.error(error);
    }
  };

  const loadInitialData = async () => {
    try {
      const [fData, sData] = await Promise.all([
        api.getFilieres(user?.schoolId),
        api.getGenericCollection('structures', user?.schoolId)
      ]);
      setFilieres(fData);
      const rawModules = sData.filter((s: any) => s.type === 'Matière');
      setModules(rawModules);
    } catch (error) {
      console.error(error);
    }
  };

  const loadStudents = async () => {
    setLoading(true);
    try {
      const allStudents = await api.getStudents(user?.schoolId);
      const filtered = allStudents.filter((s: any) => 
        s.status === 'Active' && 
        s.program === selectedFiliere && 
        s.year?.toString() === selectedYear
      );
      setStudents(filtered);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentModuleGrades = async () => {
    try {
      const allGrades = await api.getGenericCollection('notes_records', user?.schoolId);
      const record = allGrades.find((g: any) => 
        g.studentId === activeStudent.id && 
        g.module === selectedModalModule &&
        g.filiere === selectedFiliere &&
        g.year === selectedYear
      );
      
      const mod = modules.find(m => m.name === selectedModalModule);
      const eCount = mod?.examCount || 1;
      setCurrentModuleExamCount(eCount);

      if (record && record.scores) {
        setExistingRecordId(record.id);
        const scores = [...record.scores];
        // Pad the scores array if examCount is larger than what was stored
        while (scores.length < eCount) scores.push(0);
        setStudentGrades(scores.slice(0, eCount));
      } else {
        setExistingRecordId(null);
        setStudentGrades(Array(eCount).fill(0));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleGradeChange = (index: number, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    setStudentGrades(prev => {
      const current = [...prev];
      current[index] = numValue;
      return current;
    });
  };

  const saveGrades = async () => {
    if (!activeStudent || !selectedModalModule) return;
    setIsSaving(true);
    try {
      const payload = {
        studentId: activeStudent.id,
        studentName: activeStudent.name,
        filiere: selectedFiliere,
        year: selectedYear,
        module: selectedModalModule,
        scores: studentGrades,
        updatedAt: new Date().toISOString(),
        schoolId: user?.schoolId
      };

      if (existingRecordId) {
        await api.updateGeneric('notes_records', existingRecordId, payload);
      } else {
        await api.addGeneric('notes_records', payload);
      }

      await api.addGeneric('notifications', {
        message: `Notes mises à jour pour ${activeStudent.name} (${selectedModalModule}).`,
        type: 'info',
        targetRoles: ['Admin', 'Staff'],
        read: false,
        timestamp: new Date().toISOString(),
        schoolId: user?.schoolId
      }).catch(console.error);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setActiveStudent(null);
      setSelectedModalModule('');
      if (selectedModule === selectedModalModule) {
        loadClassGrades();
      }
    } catch (error) {
      alert('Erreur lors de l\'enregistrement des notes');
    } finally {
      setIsSaving(false);
    }
  };

  const buildStudentPDFContent = (doc: jsPDF, student: any, relevantGrades: any[]) => {
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235); // text-blue-600
    doc.text(`BULLETIN SCOLAIRE`, 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(17, 24, 39); // text-gray-900
    doc.text(`Étudiant: ${student.name}`, 20, 40);
    
    doc.setFontSize(11);
    doc.setTextColor(107, 114, 128); // text-gray-500
    doc.text(`Filière: ${selectedFiliere}`, 20, 50);
    doc.text(`Année: ${selectedYear}${selectedYear === '1' ? 'ère' : 'ème'} Année`, 20, 58);
    doc.text(`Email: ${student.email}`, 20, 66);
    
    const studentGrades = relevantGrades.filter((g: any) => g.studentId === student.id);
    
    const tableData = studentGrades.map((g: any) => {
        const sum = g.scores.reduce((a:number, b:number) => a + b, 0);
        const average = g.scores.length > 0 ? (sum / g.scores.length).toFixed(2) : 'N/A';
        return [g.module, g.scores.join(' | '), average];
    });
    
    let totalAvg = 0;
    if (tableData.length > 0) {
      const sumAvgs = studentGrades.reduce((acc: number, g: any) => {
          return acc + (g.scores.reduce((a:number, b:number) => a + b, 0) / g.scores.length);
      }, 0);
      totalAvg = sumAvgs / studentGrades.length;
    }
    
    autoTable(doc, {
        startY: 80,
        headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
        head: [['Module (Matière)', 'Notes des Évaluations', 'Moyenne du Module']],
        body: tableData.length > 0 ? tableData : [['Aucun module renseigné', '-', '-']],
        foot: tableData.length > 0 ? [['', 'MOYENNE GÉNÉRALE', totalAvg.toFixed(2)]] : [],
        footStyles: { fillColor: [243, 244, 246], textColor: [17, 24, 39], fontStyle: 'bold' }
    });
  };

  const exportPDF = async () => {
    if (!selectedFiliere || !selectedYear || students.length === 0) return;
    setIsExporting(true);
    try {
      const allGrades = await api.getGenericCollection('notes_records', user?.schoolId);
      const relevantGrades = allGrades.filter((g: any) => g.filiere === selectedFiliere && g.year === selectedYear);
      
      const doc = new jsPDF();
      
      students.forEach((student, index) => {
          if (index > 0) {
              doc.addPage();
          }
          buildStudentPDFContent(doc, student, relevantGrades);
      });
      
      doc.save(`Bulletins_Complets_${selectedFiliere}_A${selectedYear}.pdf`);
    } catch (error) {
      console.error("Error generating PDF", error);
      alert('Erreur lors de la génération du PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportSinglePDF = async (e: React.MouseEvent, student: any) => {
    e.stopPropagation();
    try {
      const allGrades = await api.getGenericCollection('notes_records', user?.schoolId);
      const relevantGrades = allGrades.filter((g: any) => g.filiere === selectedFiliere && g.year === selectedYear);
      
      const doc = new jsPDF();
      buildStudentPDFContent(doc, student, relevantGrades);
      
      doc.save(`Bulletin_${student.name.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error("Error generating single PDF", error);
      alert('Erreur lors de la génération du PDF pour cet étudiant.');
    }
  };

  const filiereObj = filieres.find(f => f.name === selectedFiliere);
  const filteredModules = modules.filter(m => {
    if (!filiereObj) return true;
    if (m.filiereIds && Array.isArray(m.filiereIds) && m.filiereIds.length > 0) {
      return m.filiereIds.includes(filiereObj.id);
    }
    return m.filiereId === filiereObj.id || !m.filiereId || m.filiereId === '' || (m.filiereIds && m.filiereIds.length === 0);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter">Gestion des Notes</h1>
          <p className="text-gray-500 font-medium">Saisie des évaluations par module pour chaque étudiant.</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedFiliere && selectedYear && students.length > 0 && (
            <button 
              onClick={exportPDF} 
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition"
            >
              <FileDown className="w-4 h-4" /> 
              {isExporting ? 'Génération...' : 'Extraire Bulletins PDF'}
            </button>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl border border-green-100 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" /> Notes enregistrées avec succès
            </motion.div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-wrap gap-4 items-end">
          <div className="space-y-1.5 flex-1 min-w-[200px]">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2 italic">Classe (Filière)</label>
            <select 
              value={selectedFiliere} 
              onChange={(e) => {
                setSelectedFiliere(e.target.value);
                setSelectedYear('');
              }}
              className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-blue-600 rounded-2xl text-sm font-bold italic outline-none transition-all"
            >
              <option value="">Sélectionner Fillière...</option>
              {filieres.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
            </select>
          </div>
          
          {selectedFiliere && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-1.5 w-40"
            >
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2 italic">Année</label>
              <select 
                value={selectedYear} 
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setSelectedModule('');
                }}
                className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-blue-600 rounded-2xl text-sm font-bold italic outline-none transition-all"
              >
                <option value="">Année...</option>
                <option value="1">1ère Année</option>
                <option value="2">2ème Année</option>
              </select>
            </motion.div>
          )}

          {selectedFiliere && selectedYear && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-1.5 w-64"
            >
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2 italic">Module (Matière)</label>
              <select 
                value={selectedModule} 
                onChange={(e) => setSelectedModule(e.target.value)}
                className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-blue-600 rounded-2xl text-sm font-bold italic outline-none transition-all"
              >
                <option value="">Tous les modules...</option>
                {filteredModules.map(m => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </motion.div>
          )}
        </div>
      {(!selectedFiliere || !selectedYear) ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[48px] p-24 flex flex-col items-center justify-center text-center">
            <BookOpen className="w-20 h-20 text-gray-200 mb-6" />
            <h3 className="text-xl font-black italic text-gray-400 uppercase tracking-tighter mb-2">Configuration requise</h3>
            <p className="text-sm text-gray-400 max-w-xs font-medium">Veuillez sélectionner une filière puis l'année pour voir les étudiants.</p>
        </div>
      ) : loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white p-20 rounded-[48px] border border-gray-100 shadow-sm text-center">
            <p className="text-gray-400 font-bold italic">Aucun étudiant actif trouvé dans cette classe pour l'année sélectionnée.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[48px] border border-gray-100 shadow-sm overflow-hidden p-2">
          <ul className="divide-y divide-gray-50">
            {students.map((student) => (
               <li 
                 key={student.id} 
                 onClick={() => {
                   setActiveStudent(student);
                   setSelectedModalModule(selectedModule || '');
                 }}
                 className="flex items-center justify-between p-4 px-6 hover:bg-gray-50/80 rounded-[32px] cursor-pointer transition-colors group"
               >
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-black italic shadow-inner">
                       {student.name?.[0]}
                    </div>
                    <div>
                       <p className="font-black text-gray-900 italic uppercase tracking-tight">{student.name}</p>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{student.email} • ID: {student.id.substring(0,8)}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-2">
                   <button 
                     type="button"
                     onClick={(e) => exportSinglePDF(e, student)}
                     className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-400 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-100 transition-all uppercase tracking-widest flex items-center gap-1.5"
                   >
                     <FileDown className="w-3.5 h-3.5" /> PDF
                   </button>
                   {selectedModule ? (
                     <div className="flex items-center gap-4">
                       <div className="flex gap-2 bg-gray-50 px-4 py-2 rounded-xl">
                         {Array.from({ length: modules.find(m => m.name === selectedModule)?.examCount || 1 }).map((_, idx) => {
                           const stRecord = classGrades.find(g => g.studentId === student.id);
                           const score = stRecord?.scores?.[idx] !== undefined ? stRecord.scores[idx] : null;
                           return (
                             <div key={idx} className="flex flex-col items-center justify-center">
                               <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">N{idx + 1}</span>
                               <span className={cn(
                                 "text-sm font-black w-8 text-center leading-none",
                                 score === null ? "text-gray-300" : (score >= 10 ? "text-emerald-600" : "text-rose-500")
                               )}>{score !== null ? score : '-'}</span>
                             </div>
                           );
                         })}
                       </div>
                       <div className="px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-xs font-bold text-blue-600 group-hover:bg-blue-100 transition-all uppercase tracking-widest">
                         Éditer
                       </div>
                     </div>
                   ) : (
                     <div className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-400 group-hover:text-blue-600 group-hover:bg-blue-50 group-hover:border-blue-100 transition-all uppercase tracking-widest">
                       Saisir Notes
                     </div>
                   )}
                 </div>
               </li>
            ))}
          </ul>
        </div>
      )}

      {/* Grade Entry Modal */}
      <AnimatePresence>
        {activeStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setActiveStudent(null)} 
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl relative p-8"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-xl font-black text-gray-900 uppercase italic tracking-tight">{activeStudent.name}</h2>
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Saisie des notes</p>
                </div>
                <button onClick={() => setActiveStudent(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Module (Matière)</label>
                  <select 
                    value={selectedModalModule} 
                    onChange={(e) => setSelectedModalModule(e.target.value)}
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 rounded-2xl text-sm font-bold shadow-inner outline-none transition-all"
                  >
                    <option value="">Sélectionner un module...</option>
                    {modules.map(m => (
                      <option key={m.id} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>

                {selectedModalModule && (
                   <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-50 p-6 rounded-[24px] space-y-4 border border-gray-100 shadow-inner">
                      <div className="grid grid-cols-2 gap-4">
                        {studentGrades.map((grade, index) => (
                           <div key={index} className="space-y-2">
                             <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Note {index + 1}</label>
                             <input 
                               type="number"
                               min="0"
                               max="20"
                               step="0.25"
                               disabled={!canEdit}
                               value={grade === null || isNaN(grade) ? '' : grade}
                               onChange={(e) => handleGradeChange(index, e.target.value)}
                               placeholder="0.00"
                               className="w-full px-4 py-4 bg-white border-2 border-transparent focus:border-blue-600 rounded-2xl text-center font-black text-lg transition-all shadow-sm outline-none"
                             />
                           </div>
                        ))}
                      </div>

                      {canEdit && (
                         <button 
                           onClick={saveGrades}
                           disabled={isSaving}
                           className="w-full py-4 mt-4 bg-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-2"
                         >
                           <Save className="w-4 h-4" /> {isSaving ? 'Envoi...' : 'Enregistrer les notes'}
                         </button>
                      )}
                   </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};


