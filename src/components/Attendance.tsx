import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Filter, 
  UserCheck, 
  Calendar,
  BookOpen,
  Download,
  FileText,
  BarChartHorizontal,
  X,
  Users
} from 'lucide-react';
import { cn, dedupeById } from '../lib/utils';
import { motion } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { api } from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { UserRole } from '../types';

interface AttendanceProps {
  activeRole: UserRole;
  user: any;
}

export const Attendance = ({ activeRole, user }: AttendanceProps) => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [allModules, setAllModules] = useState<any[]>([]);
  const [selectedFiliere, setSelectedFiliere] = useState('');
  const [selectedYear, setSelectedYear] = useState('1');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState<Record<string, { status: string; note: string }>>({});
  const [completeAttendanceLog, setCompleteAttendanceLog] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'input' | 'reports' | 'teacher-reports'>('input');
  const [reportModal, setReportModal] = useState<{isOpen: boolean, type: 'all' | 'student' | 'teacher', student?: any, teacherId?: string, moduleId?: string, startDate: string, endDate: string}>({isOpen: false, type: 'all', startDate: '', endDate: ''});
  const [reportDates, setReportDates] = useState({ start: '', end: '' });
  
  const [filieres, setFilieres] = useState<any[]>([]);

  const canMarkAttendance = activeRole === 'Admin' || activeRole === 'Staff';
  const isViewOnly = false;
  const isTeachersDisabled = user?.disabledFeatures?.includes('teachers');

  useEffect(() => {
    setSelectedFiliere('');
    setSelectedTeacherId('');
    setSelectedModuleId('');
    loadInitialData();
  }, [user?.schoolId]);

  useEffect(() => {
    if (selectedFiliere && selectedYear) {
      loadStudents();
      loadAttendance();
    } else {
      setStudents([]);
      setAttendanceData({});
    }
  }, [selectedFiliere, selectedYear, selectedDate]);

  const loadInitialData = async () => {
    const schoolId = user?.schoolId;
    if (!schoolId) return;
    try {
      const [allFilieres, allStaff, modules] = await Promise.all([
        api.getFilieres(schoolId),
        api.getStaff(schoolId),
        api.getGenericCollection('structures', schoolId)
      ]);
      setFilieres(allFilieres);
      setTeachers(allStaff.filter(s => s.subject.toLowerCase().includes('enseignant') || s.subject.toLowerCase().includes('teacher')));
      setAllModules(modules.filter(m => m.type === 'Matière'));
      
      // Auto-select current user if they are a teacher
      if (activeRole === 'Staff' && user) {
        const matchingStaff = allStaff.find(s => s.email === user.email || s.identifiant === user.identifiant);
        if (matchingStaff) setSelectedTeacherId(matchingStaff.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadStudents = async () => {
    if (!user?.schoolId) return;
    setLoading(true);
    try {
      const data = await api.getStudents(user?.schoolId);
      const filtered = data.filter((s:any) => s.status === 'Active' && s.program === selectedFiliere && s.year?.toString() === selectedYear);
      setStudents(dedupeById(filtered));
    } catch (error) {
      console.error('Error loading students for attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendance = async () => {
    if (!user?.schoolId) return;
    try {
      const data = await api.getGenericCollection('attendance', user?.schoolId);
      const unique = dedupeById(data);
      setCompleteAttendanceLog(unique);
      
      const dailyAttendance = unique.filter((a: any) => a.date === selectedDate && a.filiere === selectedFiliere && a.year === selectedYear);
      
      const formattedData: Record<string, { status: string; note: string }> = {};
      dailyAttendance.forEach((a: any) => {
        formattedData[a.studentId] = { status: a.status, note: a.note || '' };
      });
      setAttendanceData(formattedData);
    } catch (error) {
      console.error('Error loading attendance data:', error);
    }
  };

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: { status, note: prev[studentId]?.note || '' }
    }));
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: { status: prev[studentId]?.status || '', note }
    }));
  };

  const handleMarkAllPresent = () => {
    const newData = { ...attendanceData };
    students.forEach(s => {
      if (!newData[s.id] || !newData[s.id].status) {
        newData[s.id] = { status: 'Present', note: newData[s.id]?.note || '' };
      }
    });
    setAttendanceData(newData);
  };

  const handleSubmitAttendance = async () => {
    setIsSubmitting(true);
    try {
      const promises = students.map(async (student) => {
        const record = attendanceData[student.id];
        if (!record?.status) return;

        const allAttendance = await api.getGenericCollection('attendance', user?.schoolId);
        const existing = allAttendance.find((a: any) => 
          a.date === selectedDate && a.studentId === student.id && a.filiere === selectedFiliere && a.year === selectedYear
        );

        const payload = {
          studentId: student.id,
          studentName: student.name,
          date: selectedDate,
          filiere: selectedFiliere,
          year: selectedYear,
          teacherId: selectedTeacherId,
          moduleId: selectedModuleId,
          moduleName: allModules.find(m => m.id === selectedModuleId)?.name || '',
          status: record.status,
          note: record.note,
          schoolId: user?.schoolId
        };

        if (existing) {
          await api.updateGeneric('attendance', existing.id, payload);
        } else {
          await api.addGeneric('attendance', payload);
        }
      });

      await Promise.all(promises);
      
      if (promises.length > 0) {
        await api.addGeneric('notifications', {
          message: `L'assiduité a été mise à jour (Filière: ${selectedFiliere}, Année: ${selectedYear}, Date: ${selectedDate}).`,
          type: 'info',
          targetRoles: ['Admin', 'Staff'],
          read: false,
          timestamp: new Date().toISOString(),
          schoolId: user?.schoolId
        }).catch(console.error);
      }

      alert('La feuille d\'appel a été enregistrée avec succès.');
      loadAttendance();
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Erreur lors de l\'enregistrement de la présence.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportClassReport = (startDate?: string, endDate?: string) => {
    if (students.length === 0) {
      alert("Aucun étudiant trouvé pour cette classe ou année.");
      return;
    }
    const doc = new jsPDF() as any;
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235);
    doc.text("Rapport d'Assiduite de la Classe", 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Filiere: ${selectedFiliere}`, 20, 30);
    doc.text(`Annee: ${selectedYear}`, 20, 36);
    doc.text(`Periode: ${startDate || 'Tout'} - ${endDate || 'Tout'}`, 20, 42);
    doc.text(`Date génération: ${new Date().toLocaleDateString()}`, 20, 48);
    
    const tableColumn = ["Etudiant", "Presences", "Absences", "Retards", "Taux de Presence"];
    const tableRows: any[] = [];
    
    students.forEach(student => {
       const studentLogs = completeAttendanceLog.filter(log => 
          log.studentId === student.id && 
          log.filiere === selectedFiliere && 
          log.year === selectedYear &&
          (!startDate || log.date >= startDate) && 
          (!endDate || log.date <= endDate)
       );
       const present = studentLogs.filter(log => log.status === 'Present').length;
       const absent = studentLogs.filter(log => log.status === 'Absent').length;
       const retard = studentLogs.filter(log => log.status === 'Late' || log.status === 'Retard').length;
       
       const total = present + absent + retard;
       const rate = total > 0 ? Math.round((present / total) * 100) : 0;
       tableRows.push([student.name, present, absent, retard, `${rate}%`]);
    });
    
    autoTable(doc, { startY: 55, head: [tableColumn], body: tableRows });
    doc.save(`Assiduite_${selectedFiliere}_A${selectedYear}.pdf`);
  };

  const exportStudentReport = (student: any) => {
    const doc = new jsPDF() as any;
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235);
    doc.text("Rapport d'Assiduite Individuel", 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Etudiant: ${student.name}`, 20, 30);
    doc.text(`Filiere: ${selectedFiliere}`, 20, 36);
    doc.text(`Annee: ${selectedYear}`, 20, 42);
    doc.text(`Date génération: ${new Date().toLocaleDateString()}`, 20, 48);
    
    const studentLogs = completeAttendanceLog.filter(log => log.studentId === student.id && log.filiere === selectedFiliere && log.year === selectedYear);
    const tableColumn = ["Date", "Statut", "Note"];
    const tableRows: any[] = [];
    
    studentLogs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).forEach(log => {
       tableRows.push([log.date, log.status, log.note || '']);
    });

    autoTable(doc, { startY: 55, head: [tableColumn], body: tableRows });
    doc.save(`Assiduite_${student.name}.pdf`);
  };

  const exportTeacherReport = (teacherId: string, moduleId?: string, startDate?: string, endDate?: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher) return;

    const doc = new jsPDF() as any;
    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229);
    doc.text("Rapport d'Assiduité par Enseignant", 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Enseignant: ${teacher.name}`, 20, 30);
    if (moduleId) {
      const module = allModules.find(m => m.id === moduleId);
      doc.text(`Matière: ${module?.name}`, 20, 36);
    }
    doc.text(`Periode: ${startDate || 'Tout'} - ${endDate || 'Tout'}`, 20, 42);
    doc.text(`Généré le: ${new Date().toLocaleDateString()}`, 20, 48);
    
    const teacherLogs = completeAttendanceLog.filter(log => 
       log.teacherId === teacherId && 
       (!moduleId || log.moduleId === moduleId) &&
       (!startDate || log.date >= startDate) && 
       (!endDate || log.date <= endDate)
    );

    const tableColumn = ["Date", "Module", "Filière", "Présents", "Absents", "Taux %"];
    const tableRows: any[] = [];
    
    // Group logs by date and module
    const grouped: Record<string, any> = {};
    teacherLogs.forEach(log => {
      const key = `${log.date}_${log.moduleId || 'none'}`;
      if (!grouped[key]) {
        grouped[key] = {
          date: log.date,
          module: log.moduleName || 'N/A',
          filiere: log.filiere,
          present: 0,
          absent: 0,
          total: 0
        };
      }
      grouped[key].total++;
      if (log.status === 'Present') grouped[key].present++;
      else grouped[key].absent++;
    });

    Object.values(grouped).sort((a:any, b:any) => b.date.localeCompare(a.date)).forEach((g: any) => {
      const rate = g.total > 0 ? Math.round((g.present / g.total) * 100) : 0;
      tableRows.push([g.date, g.module, g.filiere, g.present, g.absent, `${rate}%`]);
    });

    autoTable(doc, { startY: 55, head: [tableColumn], body: tableRows });
    doc.save(`Rapport_Enseignant_${teacher.name.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suivi d'Assiduité (3S)</h1>
          <p className="text-gray-500">Contrôle des présences en temps réel et alertes d'absentéisme.</p>
        </div>
        {!isViewOnly && (
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm w-full sm:w-auto items-center">
               <button 
                  onClick={() => setActiveTab('input')}
                  className={cn("flex-1 sm:flex-none px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2", activeTab === 'input' ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-gray-500 hover:bg-gray-50")}
               >
                  <UserCheck className="w-4 h-4" /> Saisie
               </button>
               <button 
                  onClick={() => setActiveTab('reports')}
                  className={cn("flex-1 sm:flex-none px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 justify-center", activeTab === 'reports' ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-gray-500 hover:bg-gray-50")}
               >
                  <BarChartHorizontal className="w-4 h-4" /> Rapports
               </button>
               {activeRole === 'Admin' && !isTeachersDisabled && (
                 <button 
                    onClick={() => setActiveTab('teacher-reports')}
                    className={cn("flex-1 sm:flex-none px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 justify-center", activeTab === 'teacher-reports' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-gray-500 hover:bg-gray-50")}
                 >
                    <BookOpen className="w-4 h-4" /> Rapports Enseignants
                 </button>
               )}
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              {activeTab === 'input' && (
                <>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 text-gray-700 rounded-xl font-medium shadow-sm transition-all">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-transparent border-none outline-none text-xs font-bold w-full" />
                  </div>
                  {canMarkAttendance && selectedFiliere && (
                    <button onClick={handleMarkAllPresent} className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 whitespace-nowrap">
                      <UserCheck className="w-4 h-4" /> Tout Présent
                    </button>
                  )}
                </>
              )}
              {activeTab === 'reports' && selectedFiliere && (
                 <div className="flex gap-2">
                   <button onClick={() => exportClassReport('', '')} className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 whitespace-nowrap">
                      <Download className="w-4 h-4" /> Télécharger Classe
                   </button>
                   <button onClick={() => setReportModal({isOpen: true, type: 'all', startDate: '', endDate: ''})} className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all shadow-lg shadow-green-100 whitespace-nowrap">
                      <BarChartHorizontal className="w-4 h-4" /> Rapport Global
                   </button>
                 </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm w-full">
         <div className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase whitespace-nowrap">
           <Calendar className="w-4 h-4 text-blue-600" /> Filtres:
         </div>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
           <select value={selectedFiliere} onChange={e => setSelectedFiliere(e.target.value)} className="px-4 py-2 border-2 border-gray-100 rounded-xl outline-none focus:border-blue-500 bg-gray-50 font-bold text-xs text-gray-700 w-full transition-all">
             <option value="">-- Programme --</option>
             {filieres.map((f) => <option key={f.id} value={f.name}>{f.name}</option>)}
           </select>
           <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="px-4 py-2 border-2 border-gray-100 rounded-xl outline-none focus:border-blue-500 bg-gray-50 font-bold text-xs text-gray-700 w-full transition-all">
             <option value="1">1ère Année</option>
             <option value="2">2ème Année</option>
           </select>
           
           <select 
            value={selectedTeacherId} 
            onChange={e => setSelectedTeacherId(e.target.value)} 
            disabled={activeRole === 'Staff'}
            className="px-4 py-2 border-2 border-gray-100 rounded-xl outline-none focus:border-blue-500 bg-gray-50 font-bold text-xs text-gray-700 w-full transition-all disabled:opacity-50"
           >
             <option value="">-- Enseignant --</option>
             {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
           </select>

           <select 
            value={selectedModuleId} 
            onChange={e => setSelectedModuleId(e.target.value)} 
            className="px-4 py-2 border-2 border-gray-100 rounded-xl outline-none focus:border-blue-500 bg-gray-50 font-bold text-xs text-gray-700 w-full transition-all"
           >
             <option value="">-- Matière --</option>
             {allModules.filter(m => {
                const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);
                if (selectedTeacher && Array.isArray(selectedTeacher.moduleIds) && selectedTeacher.moduleIds.length > 0) {
                   if (!selectedTeacher.moduleIds.includes(m.id)) return false;
                }
                
                const filiere = filieres.find(f => f.name === selectedFiliere);
                if (!filiere) return true;
                return (Array.isArray(m.filiereIds) && m.filiereIds.includes(filiere.id)) || m.filiereId === filiere.id || !m.filiereId;
             }).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
           </select>
         </div>
      </div>

      {!selectedFiliere ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[32px] p-20 flex flex-col items-center justify-center text-gray-400">
          <BookOpen className="w-16 h-16 mb-4 opacity-20" />
          <p className="font-black text-xl italic uppercase text-gray-500 mb-2">Sélectionnez une filière</p>
          <p className="text-sm font-medium">Veuillez choisir un programme pour afficher les étudiants.</p>
        </div>
      ) : (
        <>
          {activeTab === 'input' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cible</span>
                  <span className="text-sm font-bold text-gray-900">{students.length} Étudiants</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Présents</span>
                    <span className="text-sm font-bold text-green-600">{Object.values(attendanceData).filter((a: any) => a.status === 'Present').length}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Absences</span>
                    <span className="text-sm font-bold text-red-600">{Object.values(attendanceData).filter((a: any) => a.status === 'Absent').length}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Retards</span>
                    <span className="text-sm font-bold text-yellow-600">{Object.values(attendanceData).filter((a: any) => a.status === 'Late').length}</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Étudiant</th>
                        <th className="px-6 py-4 text-center">Statut</th>
                        <th className="px-6 py-4">Commentaire</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {loading ? (
                        <tr><td colSpan={3} className="px-6 py-10 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></td></tr>
                      ) : students.length === 0 ? (
                        <tr><td colSpan={3} className="px-6 py-10 text-center text-gray-400 font-bold uppercase italic text-xs">Aucun étudiant</td></tr>
                      ) : students.map((student) => {
                        const record = attendanceData[student.id] || { status: '', note: '' };
                        return (
                          <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">{student.name?.charAt(0)}</div>
                                <div className="text-sm font-semibold text-gray-900 uppercase italic tracking-tight">{student.name}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className={cn("flex flex-wrap items-center justify-center gap-1.5 p-1.5 bg-gray-50 rounded-2xl w-full sm:w-fit mx-auto shadow-inner border border-gray-100", isViewOnly && "pointer-events-none opacity-80")}>
                                <button onClick={() => handleStatusChange(student.id, 'Present')} className={cn("flex-1 sm:flex-none px-3 py-2 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-1.5", record.status === 'Present' ? "bg-green-500 text-white shadow-md" : "text-gray-400 hover:text-green-500 hover:bg-white")}><CheckCircle2 className="w-3.5 h-3.5" /> PRÉSENT</button>
                                <button onClick={() => handleStatusChange(student.id, 'Absent')} className={cn("flex-1 sm:flex-none px-3 py-2 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-1.5", record.status === 'Absent' ? "bg-red-500 text-white shadow-md" : "text-gray-400 hover:text-red-500 hover:bg-white")}><XCircle className="w-3.5 h-3.5" /> ABSENT</button>
                                <button onClick={() => handleStatusChange(student.id, 'Late')} className={cn("flex-1 sm:flex-none px-3 py-2 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-1.5", record.status === 'Late' ? "bg-yellow-500 text-white shadow-md" : "text-gray-400 hover:text-yellow-600 hover:bg-white")}><Clock className="w-3.5 h-3.5" /> RETARD</button>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <input disabled={isViewOnly} value={record.note || ''} onChange={(e) => handleNoteChange(student.id, e.target.value)} className="bg-white px-3 py-2 border border-gray-100 rounded-lg focus:border-blue-500 outline-none text-xs text-gray-700 w-full" placeholder="Motif..." />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {!isViewOnly && canMarkAttendance && (
                  <div className="p-4 bg-gray-50 flex justify-end">
                    <button onClick={handleSubmitAttendance} disabled={isSubmitting} className={cn("px-8 py-2 text-white font-bold rounded-xl shadow-lg flex items-center gap-2", isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-blue-100")}>
                      {isSubmitting ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <UserCheck className="w-4 h-4" />}
                      Enregistrer
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'reports' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                 {[
                   { label: 'Présence Moyenne', value: `${(completeAttendanceLog.filter(l => l.status === 'Present').length / (completeAttendanceLog.length || 1) * 100).toFixed(1)}%`, color: 'blue' },
                   { label: 'Total Absences', value: completeAttendanceLog.filter(l => l.status === 'Absent').length, color: 'red' },
                   { label: 'Total Retards', value: completeAttendanceLog.filter(l => l.status === 'Late' || l.status === 'Retard').length, color: 'amber' },
                   { label: 'Sessions Évaluées', value: new Set(completeAttendanceLog.map(l => l.date)).size, color: 'purple' }
                 ].map((stat, i) => (
                   <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">{stat.label}</p>
                      <p className={cn("text-2xl font-black italic tracking-tighter", 
                        stat.color === 'blue' ? 'text-blue-600' : 
                        stat.color === 'red' ? 'text-red-600' : 
                        stat.color === 'amber' ? 'text-amber-600' : 'text-purple-600'
                      )}>{stat.value}</p>
                   </div>
                 ))}
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex flex-wrap items-center justify-between gap-4 bg-gray-50/50">
                   <div>
                      <h3 className="font-black text-gray-900 uppercase italic tracking-tighter">Rapport d'Assiduité</h3>
                   </div>
                   <div className="flex gap-2 text-sm">
                      <input type="date" value={reportDates.start} onChange={e => setReportDates(p => ({...p, start: e.target.value}))} className="border p-2 rounded-lg" />
                      <input type="date" value={reportDates.end} onChange={e => setReportDates(p => ({...p, end: e.target.value}))} className="border p-2 rounded-lg" />
                   </div>
                </div>
                <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead className="bg-gray-50 border-y border-gray-100">
                     <tr>
                       <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Étudiant</th>
                       <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Présences</th>
                       <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Absences</th>
                       <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Retards</th>
                       <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Taux (%)</th>
                       <th className="px-6 py-4 text-xs font-bold text-gray-500 text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                     {students.map((student) => {
                       const studentLogs = completeAttendanceLog.filter(log => 
                          log.studentId === student.id && log.filiere === selectedFiliere && log.year === selectedYear &&
                          (!reportDates.start || log.date >= reportDates.start) && (!reportDates.end || log.date <= reportDates.end)
                       );
                       const present = studentLogs.filter(log => log.status === 'Present').length;
                       const absent = studentLogs.filter(log => log.status === 'Absent').length;
                       const retard = studentLogs.filter(log => log.status === 'Late' || log.status === 'Retard').length;
                       const total = present + absent + retard;
                       const rate = total > 0 ? Math.round((present / total) * 100) : 0;
                       
                       return (
                         <tr key={student.id} className="hover:bg-gray-50">
                           <td className="px-6 py-4 font-bold text-gray-900 text-sm">{student.name}</td>
                           <td className="px-6 py-4 text-gray-600">{present}</td>
                           <td className="px-6 py-4 text-red-600">{absent}</td>
                           <td className="px-6 py-4 text-yellow-600">{retard}</td>
                           <td className="px-6 py-4">
                             <span className={cn("px-3 py-1 rounded-full text-xs font-bold", rate >= 80 ? "bg-green-100 text-green-700" : rate >= 50 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700")}>{rate}%</span>
                           </td>
                           <td className="px-6 py-4 text-right">
                             <button onClick={() => exportStudentReport(student)} className="flex items-center gap-2 px-3 py-2 text-blue-600 bg-blue-50 font-bold text-xs uppercase italic tracking-widest rounded-xl hover:bg-blue-100 transition-colors ml-auto"><Download className="w-4 h-4" /> Télécharger</button>
                           </td>
                         </tr>
                       );
                     })}
                   </tbody>
                 </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 italic uppercase">Analyse par Enseignant</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Générez des rapports basés sur l'activité des enseignants</p>
                  </div>
                </div>

                <div className="flex gap-4 mb-6">
                   <select 
                     value={selectedTeacherId} 
                     onChange={(e) => { 
                       setSelectedTeacherId(e.target.value);
                       setSelectedModuleId('');
                     }}
                     className="px-4 py-2 border-2 border-gray-100 rounded-xl outline-none focus:border-indigo-500 bg-gray-50 font-bold text-xs text-gray-700 w-full md:w-64 transition-all"
                   >
                     <option value="">Tous les enseignants</option>
                     {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                   </select>

                   {selectedTeacherId && (
                     <select 
                       value={selectedModuleId} 
                       onChange={(e) => setSelectedModuleId(e.target.value)}
                       className="px-4 py-2 border-2 border-gray-100 rounded-xl outline-none focus:border-indigo-500 bg-gray-50 font-bold text-xs text-gray-700 w-full md:w-64 transition-all"
                     >
                       <option value="">Toutes les matières</option>
                       {allModules.filter(m => (teachers.find(t => t.id === selectedTeacherId)?.moduleIds || []).includes(m.id)).map(m => (
                         <option key={m.id} value={m.id}>{m.name}</option>
                       ))}
                     </select>
                   )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {teachers
                   .filter(t => !selectedTeacherId || t.id === selectedTeacherId)
                   .map(teacher => {
                    const teacherLogs = completeAttendanceLog.filter(l => 
                      l.teacherId === teacher.id && 
                      (!selectedModuleId || l.moduleId === selectedModuleId)
                    );
                    const sessionCount = new Set(teacherLogs.map(l => `${l.date}_${l.moduleId}`)).size;
                    
                    return (
                      <div key={teacher.id} className="p-6 bg-gray-50 rounded-3xl border border-transparent hover:border-indigo-100 transition-all group">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                            {teacher.name.charAt(0)}
                          </div>
                          <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                            {sessionCount} Sessions
                          </span>
                        </div>
                        <h4 className="font-bold text-gray-900 mb-1">{teacher.name}</h4>
                        <p className="text-xs text-gray-400 font-medium mb-6">{teacher.subject}</p>
                        
                        <div className="flex flex-col gap-2">
                          <button 
                            onClick={() => exportTeacherReport(teacher.id, selectedModuleId)}
                            className="w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-[10px] font-black uppercase italic hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2"
                          >
                            <Download className="w-4 h-4" /> Rapport {selectedModuleId ? 'Matière' : 'Global'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {reportModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-900 italic tracking-tight uppercase flex items-center gap-2">
                <BarChartHorizontal className="w-6 h-6 text-blue-600" /> Analyse d'Assiduité
              </h2>
              <button onClick={() => setReportModal({...reportModal, isOpen: false})} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-6 h-6 text-gray-500" /></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Période d'analyse</label>
                <div className="flex gap-4">
                  <input type="date" value={reportModal.startDate} onChange={e => setReportModal({...reportModal, startDate: e.target.value})} className="border-2 border-gray-100 rounded-xl p-3 flex-1 font-bold text-sm outline-none focus:border-blue-500" />
                  <input type="date" value={reportModal.endDate} onChange={e => setReportModal({...reportModal, endDate: e.target.value})} className="border-2 border-gray-100 rounded-xl p-3 flex-1 font-bold text-sm outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="flex items-end">
                <button onClick={() => exportClassReport(reportModal.startDate, reportModal.endDate)} className="w-full bg-gray-900 text-white rounded-xl p-3 font-black text-sm uppercase italic hover:bg-blue-600 transition-all flex items-center justify-center gap-2"><Download className="w-4 h-4" /> Exporter PDF</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase">Performance Étudiants</h4>
                  <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={students.map(s => {
                          const logs = completeAttendanceLog.filter(l => l.studentId === s.id && l.date >= (reportModal.startDate || '0000-00-00') && l.date <= (reportModal.endDate || '9999-99-99'));
                          const present = logs.filter(l => l.status === 'Present').length;
                          const total = logs.length;
                          return { name: s.name.split(' ')[0], rate: total > 0 ? (present/total)*100 : 0 };
                        })}>
                          <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                          <YAxis fontSize={10} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none' }} />
                          <Bar dataKey="rate" fill="#2563eb" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                   </div>
               </div>
               
               <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase">Répartition des Statuts</h4>
                  <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Présent', value: completeAttendanceLog.filter(l => l.status === 'Present' && l.date >= (reportModal.startDate || '0000-00-00') && l.date <= (reportModal.endDate || '9999-99-99')).length },
                              { name: 'Absent', value: completeAttendanceLog.filter(l => l.status === 'Absent' && l.date >= (reportModal.startDate || '0000-00-00') && l.date <= (reportModal.endDate || '9999-99-99')).length },
                              { name: 'Retard', value: completeAttendanceLog.filter(l => (l.status === 'Late' || l.status === 'Retard') && l.date >= (reportModal.startDate || '0000-00-00') && l.date <= (reportModal.endDate || '9999-99-99')).length },
                            ].filter(d => d.value > 0)}
                            cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                          >
                            <Cell fill="#10b981" />
                            <Cell fill="#ef4444" />
                            <Cell fill="#f59e0b" />
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                   </div>
               </div>
            </div>
            
            <div className="mt-8 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden group">
               <div className="relative z-10">
                  <p className="font-black italic uppercase text-lg mb-3 tracking-tighter">EducaSys Analytics Summary</p>
                  <p className="opacity-90 leading-relaxed text-sm font-medium">
                    {students.length > 0 ? (
                      `L'assiduité moyenne de la classe est de ${
                        ((completeAttendanceLog.filter(l => l.status === 'Present').length / (completeAttendanceLog.length || 1)) * 100).toFixed(1)
                      }%.`
                    ) : (
                      "Aucune donnée d'analyse disponible."
                    )}
                  </p>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
