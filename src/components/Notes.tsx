import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  FileCheck, 
  Plus,
  Save,
  ChevronDown,
  BookOpen,
  Filter,
  Search,
  CheckCircle2,
  X,
  FileDown,
  AlertCircle
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
  const [searchStudent, setSearchStudent] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
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
    setSelectedFiliere('');
    setSelectedYear('');
    setSelectedModule('');
    loadInitialData();
  }, [user?.schoolId]);

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
    if (selectedFiliere && selectedYear) {
      loadClassGrades();
    } else {
      setClassGrades([]);
    }
  }, [selectedFiliere, selectedYear, selectedModule]);

  const loadClassGrades = async () => {
    if (!user?.schoolId) return;
    try {
      const allGrades = await api.getGenericCollection('notes_records', user?.schoolId);
      const relevantGrades = allGrades.filter((g: any) => 
        g.filiere === selectedFiliere &&
        g.year === selectedYear &&
        (selectedModule ? g.module === selectedModule : true)
      );
      setClassGrades(relevantGrades);
    } catch (error) {
      console.error(error);
    }
  };

  const loadInitialData = async () => {
    if (!user?.schoolId) return;
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
    if (!user?.schoolId) return;
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

      setToast({ 
        message: `Notes de ${activeStudent.name} enregistrées avec succès pour ${selectedModalModule}.`, 
        type: 'success' 
      });
      setTimeout(() => setToast(null), 4000);
      
      setActiveStudent(null);
      setSelectedModalModule('');
      if (selectedModule === selectedModalModule) {
        loadClassGrades();
      }
    } catch (error) {
      setToast({ message: 'Erreur lors de l\'enregistrement des notes. Veuillez réessayer.', type: 'error' });
      setTimeout(() => setToast(null), 4000);
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

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
    s.email.toLowerCase().includes(searchStudent.toLowerCase())
  );

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
            <div className="flex-1 min-w-[200px]">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Rechercher un étudiant..."
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                  className="w-full pl-12 pr-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-blue-600 rounded-2xl text-sm font-bold italic outline-none transition-all"
                />
              </div>
            </div>
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
        <>
          {selectedFiliere && selectedYear && !selectedModule && !searchStudent && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredModules.map(m => {
                const moduleGrades = classGrades.filter(g => g.module === m.name);
                const scoresList = moduleGrades.map(g => {
                  const s = g.scores || [];
                  return s.length > 0 ? (s.reduce((a:number, b:number) => a + b, 0) / s.length) : 0;
                });
                const avg = scoresList.length > 0 
                  ? (scoresList.reduce((a, b) => a + b, 0) / scoresList.length).toFixed(2)
                  : null;

                return (
                  <motion.button 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={m.id}
                    onClick={() => setSelectedModule(m.name)}
                    className="p-8 bg-white border border-gray-100 rounded-[32px] hover:border-blue-200 hover:shadow-xl transition-all text-left flex flex-col gap-4 group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
                    
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner relative z-10">
                      <BookOpen className="w-7 h-7" />
                    </div>
                    
                    <div className="relative z-10 w-full">
                      <h4 className="font-black text-gray-900 italic uppercase tracking-tighter text-lg leading-tight mb-4 group-hover:text-blue-700 transition-colors">
                        {m.name}
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Moyenne Classe</span>
                          <span className={cn(
                            "text-2xl font-black italic",
                            avg && Number(avg) >= 10 ? "text-emerald-500" : (avg ? "text-rose-500" : "text-gray-200")
                          )}>
                            {avg || '--'}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Participation</span>
                          <span className="text-2xl font-black italic text-gray-900">
                            {moduleGrades.length}<span className="text-gray-300 text-sm ml-1 font-medium">/ {students.length}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between relative z-10">
                      <div className="flex -space-x-2">
                        {moduleGrades.slice(0, 3).map((g, i) => (
                          <div key={i} className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-black italic uppercase">
                            {g.studentName?.[0]}
                          </div>
                        ))}
                        {moduleGrades.length > 3 && (
                          <div className="w-8 h-8 rounded-full bg-blue-50 border-2 border-white flex items-center justify-center text-[10px] font-black text-blue-600">
                            +{moduleGrades.length - 3}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Gérer <ChevronDown className="w-3 h-3 -rotate-90" />
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}

          {(selectedModule || searchStudent) && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-[48px] border border-gray-100 shadow-sm overflow-hidden p-2"
            >
              <ul className="divide-y divide-gray-50">
                {filteredStudents.length === 0 ? (
                  <li className="p-20 text-center text-gray-400 font-bold italic">
                    Aucun étudiant ne correspond à votre recherche.
                  </li>
                ) : (
                  filteredStudents.map(student => (
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
                  )))}
              </ul>
            </motion.div>
          )}
        </>
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

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={cn(
              "fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[320px] max-w-md",
              toast.type === 'success' ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
            )}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-6 h-6 shrink-0" /> : <AlertCircle className="w-6 h-6 shrink-0" />}
            <p className="text-sm font-bold leading-tight">{toast.message}</p>
            <button onClick={() => setToast(null)} className="ml-auto p-1.5 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


