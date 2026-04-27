import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  Users, 
  Target, 
  Activity,
  FileDown,
  Filter,
  TrendingUp,
  AlertTriangle,
  Wallet,
  Calendar,
  Layers,
  GraduationCap,
  Clock,
  ChevronDown,
  Search
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area,
  ComposedChart
} from 'recharts';
import { api } from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = {
  primary: '#2563eb',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  purple: '#8b5cf6',
  pink: '#ec4899',
  slate: '#64748b'
};

export const DirectorDashboard = ({ user }: { user: any }) => {
  const [activeTab, setActiveTab] = useState('global');
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState({ 
    filiere: 'all', 
    year: 'all', 
    gender: 'all', 
    status: 'Active',
    dateRange: 'all',
    minAttendance: 0
  });
  
  const [raw, setRaw] = useState<any>({
    students: [],
    staff: [],
    filieres: [],
    notes: [],
    attendances: [],
    invoices: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const schoolId = user?.schoolId;
        const [students, users, filieres, notes, attendances, invoices] = await Promise.all([
          api.getStudents(schoolId).catch(() => []),
          api.getGenericCollection('users', schoolId).catch(() => []),
          api.getFilieres(schoolId).catch(() => []),
          api.getGenericCollection('notes_records', schoolId).catch(() => []),
          api.getGenericCollection('attendances', schoolId).catch(() => []),
          api.getGenericCollection('invoices', schoolId).catch(() => [])
        ]);

        setRaw({
          students,
          staff: users.filter((u:any) => u.role !== 'Student'),
          filieres,
          notes,
          attendances,
          invoices
        });
      } catch (error) {
        console.error("BI Data Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const studentMap = useMemo(() => new Map(raw.students.map((s: any) => [s.id, s])), [raw.students]);
  const studentNameMap = useMemo(() => new Map(raw.students.map((s: any) => [s.name, s])), [raw.students]);

  const filteredStudents = useMemo(() => raw.students.filter((s:any) => 
    (filters.filiere === 'all' || s.program === filters.filiere) &&
    (filters.year === 'all' || s.year?.toString() === filters.year) &&
    (filters.gender === 'all' || s.gender === filters.gender) &&
    (filters.status === 'all' || s.status === filters.status)
  ), [raw.students, filters]);

  const filteredInvoices = useMemo(() => raw.invoices.filter((inv: any) => {
    const student = studentMap.get(inv.studentId) || studentNameMap.get(inv.student);
    return student && (filters.filiere === 'all' || student.program === filters.filiere);
  }), [raw.invoices, studentMap, studentNameMap, filters.filiere]);

  const computed = useMemo(() => {
    const hasData = raw.students.length > 0 || raw.filieres.length > 0;

    // 1. Filtered Dataset
    const fStudents = filteredStudents;
    const fStudentIds = new Set(fStudents.map((s:any) => s.id));

    // 2. Academic Performance Calculations
    const academicNotes = raw.notes.filter((n:any) => filters.filiere === 'all' || n.filiere === filters.filiere);
    let totalScores = 0;
    let scoreCount = 0;
    let passCount = 0;
    let failCount = 0;

    const modulePerformance: any = {};
    academicNotes.forEach((n:any) => {
      if (n.scores && Array.isArray(n.scores)) {
        n.scores.forEach((sc: number) => {
          totalScores += sc;
          scoreCount++;
          if (sc >= 10) passCount++; else failCount++;
          
          const key = n.module || 'Inconnu';
          if (!modulePerformance[key]) modulePerformance[key] = { total: 0, count: 0 };
          modulePerformance[key].total += sc;
          modulePerformance[key].count++;
        });
      }
    });

    const perfModules = Object.entries(modulePerformance).map(([name, data]: [string, any]) => ({
      name,
      average: parseFloat((data.total / data.count).toFixed(2)),
      successRate: Math.round(((data.total / data.count) / 20) * 100)
    })).sort((a,b) => b.average - a.average);

    // 3. Attendance Deep-Dive
    const dailyAttendance: any = {};

    raw.attendances.forEach((att:any) => {
      if (!att.date || att.date === 'N/A') return;
      const dateKey = att.date;
      if (!dailyAttendance[dateKey]) dailyAttendance[dateKey] = { present: 0, total: 0 };
      
      if (att.records) {
        Object.entries(att.records).forEach(([sid, status]) => {
          const student = studentMap.get(sid) as any;
          if (student && (filters.filiere === 'all' || student.program === filters.filiere)) {
            dailyAttendance[dateKey].total++;
            if (status === 'present') dailyAttendance[dateKey].present++;
          }
        });
      }
    });

    const attendanceTimeline = Object.entries(dailyAttendance)
      .map(([date, data]: [string, any]) => ({
        rawDate: date,
        displayDate: new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        rate: data.total > 0 ? parseFloat(((data.present / data.total) * 100).toFixed(1)) : 0
      }))
      .filter(x => x.displayDate !== 'Invalid Date')
      .sort((a,b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime())
      .slice(-15);

    // 4. Financial Deep-Dive
    let totalInvoiced = 0;
    let totalRecovered = 0;
    const revenueByProgram: any = {};
    const revenueTimeline: any = {};

    fStudents.forEach((s: any) => {
      const tuition = parseFloat(s.totalTuition) || 0;
      totalInvoiced += tuition;
      const prog = s.program || 'Inconnu';
      revenueByProgram[prog] = (revenueByProgram[prog] || 0) + tuition;
    });

    raw.invoices.forEach((inv: any) => {
      const amt = parseFloat(inv.amount) || 0;
      if (inv.status === 'Paid' || inv.status === 'paid') {
        const student = studentMap.get(inv.studentId) || studentNameMap.get(inv.student);
        if (student && (filters.filiere === 'all' || student.program === filters.filiere)) {
          totalRecovered += amt;
          
          const date = new Date(inv.createdAt || Date.now());
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          revenueTimeline[monthKey] = (revenueTimeline[monthKey] || 0) + amt;
        }
      }
    });

    const revenueHistory = Object.entries(revenueTimeline).map(([month, value]) => ({
      month,
      value
    })).sort((a,b) => a.month.localeCompare(b.month));

    // 5. TOP Students
    const topStudents = fStudents
      .map((s:any) => ({
        name: s.name,
        average: parseFloat(s.average) || 0,
        program: s.program
      }))
      .sort((a:any, b:any) => b.average - a.average)
      .slice(0, 5);

    return {
      kpis: {
        students: fStudents.length,
        avgGrade: scoreCount > 0 ? (totalScores / scoreCount) : 0,
        attendanceRate: attendanceTimeline.length > 0 ? attendanceTimeline[attendanceTimeline.length-1].rate : 0,
        recoveryRate: totalInvoiced > 0 ? (totalRecovered / totalInvoiced) * 100 : 0,
        staffCount: raw.staff.length
      },
      academics: {
        perfModules,
        topStudents,
        successFail: [
          { name: 'Admis', value: passCount, color: COLORS.success },
          { name: 'Échecs', value: failCount, color: COLORS.danger }
        ]
      },
      demographics: {
        gender: [
          { name: 'Hommes', value: fStudents.filter((s:any) => s.gender === 'M').length, color: COLORS.info },
          { name: 'Femmes', value: fStudents.filter((s:any) => s.gender === 'F').length, color: COLORS.pink }
        ],
        status: Object.entries(raw.students.reduce((acc:any, s:any) => { acc[s.status || 'Active'] = (acc[s.status || 'Active'] || 0) + 1; return acc; }, {})).map(([name, value]) => ({ name, value }))
      },
      finances: {
        totalInvoiced,
        totalRecovered,
        revenueByProgram: Object.entries(revenueByProgram).map(([name, value]) => ({ name, value })),
        revenueHistory,
        comparison: [
          { name: 'Facturé', value: totalInvoiced },
          { name: 'Recouvré', value: totalRecovered }
        ]
      },
      attendanceTimeline,
      isEmpty: !hasData
    };
  }, [raw, filters, filteredStudents, studentMap, studentNameMap]);

  const exportReport = () => {
    if (!computed) return;
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.setTextColor(37, 99, 235);
      doc.text("RAPPORT STRATÉGIQUE BI", 14, 20);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Généré le: ${new Date().toLocaleString()}`, 14, 28);

      autoTable(doc, {
        startY: 35,
        head: [['Indicateur', 'Valeur', 'Statut']],
        body: [
          ['Effectif Étudiant', computed.kpis.students.toString(), 'Normal'],
          ['Moyenne Académique', `${computed.kpis.avgGrade.toFixed(2)}/20`, computed.kpis.avgGrade < 10 ? 'Alerte' : 'Satisfaisant'],
          ['Taux d\'Assiduité', `${computed.kpis.attendanceRate}%`, computed.kpis.attendanceRate < 80 ? 'Alerte' : 'Normal'],
          ['Total Personnel', computed.kpis.staffCount.toString(), 'Actif'],
          ['Taux de Recouvrement', `${computed.kpis.recoveryRate.toFixed(1)}%`, 'Suivi']
        ]
      });

      doc.save(`Rapport_BI_Industrial_${new Date().getTime()}.pdf`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium animate-pulse">Extraction des données MIAGE...</p>
        </div>
      </div>
    );
  }

  if (computed.isEmpty) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-white rounded-[40px] border border-gray-100 shadow-sm">
        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-8">
          <BarChart3 className="w-12 h-12 text-blue-600" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight italic uppercase">Prêt pour l'analyse</h2>
        <p className="text-gray-500 max-w-md mx-auto mb-10 text-lg">
          Votre centre décisionnel est opérationnel. Ajoutez vos premiers étudiants et filières pour commencer à générer des rapports stratégiques.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-10 py-5 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-widest italic text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95"
        >
          Actualiser la Matrice
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            Executive BI Suite
          </h1>
          <p className="text-gray-500 text-sm mt-1">Intelligence décisionnelle en temps réel pour la direction scolaire.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${showFilters ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
          >
            <Filter className="w-4 h-4" />
            Filtres Avancés
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          
          <button 
            onClick={exportReport}
            disabled={isExporting}
            className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            <FileDown className="w-4 h-4" />
            {isExporting ? 'Exportation...' : 'Exporter PDF'}
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50 p-6 rounded-3xl border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Filière Académique</label>
            <select 
              value={filters.filiere}
              onChange={e => setFilters(f => ({ ...f, filiere: e.target.value }))}
              className="w-full bg-white border-0 ring-1 ring-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">Toutes les filières</option>
              {raw.filieres.map((f:any) => <option key={f.id} value={f.name}>{f.name}</option>)}
            </select>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Année d'Étude</label>
            <select 
              value={filters.year}
              onChange={e => setFilters(f => ({ ...f, year: e.target.value }))}
              className="w-full bg-white border-0 ring-1 ring-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">Toutes les années</option>
              <option value="1">1ère Année (L1)</option>
              <option value="2">2ème Année (L2)</option>
              <option value="3">3ème Année (L3)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Statut Étudiant</label>
            <select 
              value={filters.status}
              onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
              className="w-full bg-white border-0 ring-1 ring-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">Tous les statuts</option>
              <option value="Active">Étudiants Actifs</option>
              <option value="Suspended">Suspendus</option>
              <option value="Graduated">Diplômés</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Genre</label>
            <div className="flex bg-white ring-1 ring-gray-200 rounded-xl p-1">
              {['all', 'M', 'F'].map(g => (
                <button 
                  key={g}
                  onClick={() => setFilters(f => ({ ...f, gender: g }))}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${filters.gender === g ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  {g === 'all' ? 'Tous' : g === 'M' ? 'Hommes' : 'Femmes'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Étudiants', value: computed.kpis.students, icon: Users, color: 'blue', sub: 'Effectif filtré' },
          { label: 'Moyenne Générale', value: `${computed.kpis.avgGrade.toFixed(2)}`, icon: Target, color: 'emerald', sub: '/20 Points' },
          { label: 'Taux Présence', value: `${computed.kpis.attendanceRate}%`, icon: Clock, color: 'amber', sub: 'Dernier pointage' },
          { label: 'Recouvrement', value: `${computed.kpis.recoveryRate.toFixed(1)}%`, icon: TrendingUp, color: 'purple', sub: 'Finances' },
          { label: 'Total Personnel', value: computed.kpis.staffCount, icon: Layers, color: 'slate', sub: 'Administratifs & Enseignants' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className={`p-3 rounded-2xl w-fit mb-4 bg-${kpi.color}-50 text-${kpi.color}-600 group-hover:scale-110 transition-transform`}>
              <kpi.icon className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{kpi.label}</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{kpi.value}</h3>
            <p className="text-[10px] text-gray-400 mt-1 font-medium">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Analysis Tabs */}
      <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm w-fit max-w-full overflow-x-auto">
        {[
          { id: 'global', label: 'Vue d\'ensemble' },
          { id: 'academics', label: 'Académique' },
          { id: 'attendance', label: 'Assiduité' },
          { id: 'finances', label: 'Finances' },
          { id: 'details', label: 'Détails' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-blue-600'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
        
        {/* Academic Insight Card */}
        {(activeTab === 'global' || activeTab === 'academics') && (
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="mb-6 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-black text-gray-900">Performance par Module</h3>
                <p className="text-xs text-gray-500 mt-1">Moyennes des évaluations</p>
              </div>
              <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase">Académique</div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={computed.academics.perfModules.slice(0, 8)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" domain={[0, 20]} hide />
                  <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} fontSize={10} fontStyle="bold" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="average" name="Moyenne" radius={[0, 10, 10, 0]} barSize={20}>
                    {computed.academics.perfModules.map((entry:any, i:number) => (
                      <Cell key={`c-${i}`} fill={entry.average >= 14 ? COLORS.success : entry.average >= 10 ? COLORS.primary : COLORS.danger} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {(activeTab === 'academics') && (
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
             <h3 className="text-lg font-black text-gray-900 mb-6">Top 5 Étudiants</h3>
             <div className="space-y-4">
                {computed.academics.topStudents.map((s:any, i:number) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{s.name}</p>
                        <p className="text-[10px] text-gray-400">{s.program}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-blue-600">{s.average}/20</p>
                      <p className="text-[10px] text-gray-400">Moyenne</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}



        {/* Attendance Timeline */}
        {(activeTab === 'global' || activeTab === 'attendance') && (
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="mb-6 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-black text-gray-900">Tendance de l'Assiduité</h3>
                <p className="text-xs text-gray-500 mt-1">Stabilité de la présence sur 15 jours</p>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={computed.attendanceTimeline}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="displayDate" axisLine={false} tickLine={false} fontSize={10} />
                  <YAxis type="number" domain={[0, 100]} hide />
                  <Tooltip />
                  <Area type="monotone" dataKey="rate" name="Taux %" stroke={COLORS.warning} strokeWidth={3} fillOpacity={0.2} fill={COLORS.warning} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Finance Trends */}
        {(activeTab === 'finances' || activeTab === 'global') && (
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black text-gray-900 mb-6">Historical Revenue (Trend)</h3>
            <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={computed.finances.revenueHistory}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={10} />
                   <YAxis axisLine={false} tickLine={false} fontSize={10} tickFormatter={v => `${v/1000}k`} />
                   <Tooltip />
                   <Line type="monotone" dataKey="value" stroke={COLORS.success} strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                 </LineChart>
               </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Demographic Distribution */}
        {(activeTab === 'demographics') && (
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm col-span-1 lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-black text-gray-900 mb-6">Mixité Sociale & Genre</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={computed.demographics.gender} 
                        cx="50%" cy="50%" 
                        innerRadius={60} 
                        outerRadius={90} 
                        paddingAngle={8} 
                        dataKey="value"
                        stroke="none"
                      >
                        {computed.demographics.gender.map((e:any, i:number) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900 mb-6">Statuts Étudiants</h3>
                <div className="space-y-4">
                  {computed.demographics.status.map((s:any, i:number) => (
                    <div key={i} className="flex items-center justify-between">
                       <span className="text-xs font-bold text-gray-500 uppercase">{s.name}</span>
                       <div className="flex items-center gap-4 flex-1 mx-4">
                          <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
                             <div 
                                className="h-full bg-blue-600 rounded-full" 
                                style={{ width: `${(s.value / Math.max(1, computed.kpis.students)) * 100}%` }}
                             />
                          </div>
                          <span className="text-xs font-black text-gray-900 w-8">{s.value}</span>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Data Table */}
        {(activeTab === 'details') && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm col-span-1 lg:col-span-2 overflow-hidden">
             <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                <h3 className="text-lg font-black text-gray-900 uppercase italic tracking-tight">Registre Stratégique Détaillé</h3>
                <span className="text-xs font-bold text-gray-400">{filteredStudents.length} Étudiants Affichés</span>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead className="bg-gray-50 text-[10px] uppercase font-black text-gray-400 tracking-widest italic">
                      <tr>
                        <th className="px-6 py-4">Nom Complet</th>
                        <th className="px-6 py-4">Filière</th>
                        <th className="px-6 py-4">Scolarité Payée</th>
                        <th className="px-6 py-4">Moyenne</th>
                        <th className="px-6 py-4">Assiduité</th>
                        <th className="px-6 py-4">Statut</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                      {filteredStudents.map((s) => {
                        const studentInvoices = filteredInvoices.filter(inv => inv.studentId === s.id);
                        const totalInvoiced = studentInvoices.reduce((acc, inv) => acc + (inv.total || 0), 0);
                        const totalPaid = studentInvoices.filter(inv => inv.status === 'Paid').reduce((acc, inv) => acc + (inv.total || 0), 0);
                        const payRate = totalInvoiced > 0 ? (totalPaid / totalInvoiced) * 100 : 0;
                        
                        const grades = raw.notes.filter((n:any) => n.studentId === s.id);
                        const avg = grades.length > 0 
                          ? grades.reduce((acc:number, n:any) => acc + (n.scores.reduce((a:number, b:number) => a+b, 0) / n.scores.length), 0) / grades.length 
                          : 0;

                        const att = raw.attendances.filter((a:any) => a.studentId === s.id);
                        const pAtt = att.length > 0 ? (att.filter((a:any) => a.status === 'Present' || a.status === 'present').length / att.length) * 100 : 0;

                        return (
                          <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs uppercase italic">{s.name?.[0]}</div>
                                <span className="text-sm font-bold text-gray-900">{s.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs font-medium text-gray-500">{s.program}</td>
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-2">
                                  <div className="h-1.5 w-12 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500" style={{ width: `${payRate}%` }} />
                                  </div>
                                  <span className="text-[10px] font-black text-emerald-600 tracking-tighter">{payRate.toFixed(0)}%</span>
                               </div>
                            </td>
                            <td className={`px-6 py-4 text-xs font-black ${avg >= 10 ? 'text-blue-600' : 'text-rose-600'}`}>{avg.toFixed(2)}</td>
                            <td className={`px-6 py-4 text-xs font-black ${pAtt >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>{pAtt.toFixed(0)}%</td>
                            <td className="px-6 py-4">
                               <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${s.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                                 {s.status}
                               </span>
                            </td>
                          </tr>
                        );
                      })}
                   </tbody>
                </table>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
