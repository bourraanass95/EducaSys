import React, { useEffect, useState, useMemo } from 'react';
import { 
  Users, 
  CheckCircle2,
  List,
  Wallet,
  TrendingDown,
  Globe
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip,
  CartesianGrid
} from 'recharts';
import { api } from '../services/api';
import { cn, dedupeById } from '../lib/utils';

const StatCard = ({ title, value, icon: Icon, color = "blue" }: any) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    amber: "bg-amber-50 text-amber-600",
    gray: "bg-gray-50 text-gray-600",
    red: "bg-red-50 text-red-600",
  };
  
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colors[color as keyof typeof colors] || colors.blue}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
        <p className="text-2xl font-bold text-black">{value}</p>
      </div>
    </div>
  );
};

export const Dashboard = ({ user }: { user: any }) => {
  const [filterFiliere, setFilterFiliere] = useState('all');
  const [loading, setLoading] = useState(true);
  
  const [raw, setRaw] = useState<any>({
    students: [],
    staff: [],
    structures: [],
    filieres: [],
    attendances: [],
    invoices: []
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const schoolId = user?.schoolId;
        const [studentsRes, usersRes, structuresRes, filieresRes, attendanceRes, invoicesRes] = await Promise.all([
          api.getStudents(schoolId).catch(() => []),
          api.getGenericCollection('users', schoolId).catch(() => []),
          api.getGenericCollection('structures', schoolId).catch(() => []),
          api.getFilieres(schoolId).catch(() => []),
          api.getGenericCollection('attendances', schoolId).catch(() => []),
          api.getGenericCollection('invoices', schoolId).catch(() => [])
        ]);
        
        setRaw({
            students: dedupeById(studentsRes),
            staff: dedupeById(usersRes.filter((u:any) => u.role !== 'Student')),
            structures: dedupeById(structuresRes),
            filieres: dedupeById(filieresRes).map((fil: any) => ({
                ...fil,
                studentCount: studentsRes.filter((s:any) => s.program === fil.name && s.status === 'Active').length
            })),
            attendances: dedupeById(attendanceRes),
            invoices: dedupeById(invoicesRes)
        });

      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const computed = useMemo(() => {
    const fStudents = raw.students.filter((s:any) => filterFiliere === 'all' || s.program === filterFiliere);
    const fActiveStudents = fStudents.filter((s:any) => s.status === 'Active');
    const fStudentIds = new Set(fActiveStudents.map((s:any) => s.id));
    const fStudentNames = new Set(fActiveStudents.map((s:any) => s.name));

    let presenceObj = { present: 0, total: 0 };
    raw.attendances.forEach((record: any) => {
        if (record.records) {
            Object.entries(record.records).forEach(([sId, val]:any) => {
               if (fStudentIds.has(sId)) {
                  presenceObj.total++;
                  if (val === 'present') presenceObj.present++;
               }
            });
        }
    });

    let totalDue = 0;
    let totalPaid = 0;
    fActiveStudents.forEach((s: any) => {
      totalDue += parseFloat(s.totalTuition) || 0;
    });

    raw.invoices.forEach((inv: any) => {
       if (fStudentIds.has(inv.studentId) || fStudentNames.has(inv.student) || fStudentNames.has(inv.studentName)) {
          const amt = parseFloat(inv.amount) || 0;
          if (inv.status === 'Paid' || inv.status === 'paid') {
             totalPaid += amt;
          }
       }
    });

    const financeData = [
      { name: 'Réglé', value: totalPaid, color: '#10b981' },
      { name: 'Reste', value: Math.max(0, totalDue - totalPaid), color: '#f59e0b' }
    ].filter(x => x.value > 0);

    const statusCounts: any = {};
    raw.students.forEach((s: any) => {
        const status = s.status || 'Active';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    const statusData = Object.entries(statusCounts).map(([name, value], i) => ({
        name, value, color: ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'][i % 4]
    }));

    const roleCounts: any = {};
    raw.staff.forEach((s: any) => {
        roleCounts[s.role] = (roleCounts[s.role] || 0) + 1;
    });
    const staffRoleData = Object.entries(roleCounts).map(([name, value], i) => ({
        name, value, color: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'][i % 4]
    }));

    return {
      studentsCount: fActiveStudents.length,
      staffCount: raw.staff.length,
      modulesCount: raw.structures.filter((s:any) => s.type === 'Matière').length,
      presenceRate: presenceObj.total > 0 ? Math.round((presenceObj.present / presenceObj.total) * 100) : 100,
      totalPaid,
      totalDue,
      financeData,
      statusData,
      staffRoleData
    };
  }, [raw, filterFiliere]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black">Aperçu Général</h1>
          <p className="text-gray-500 text-sm mt-1">Tableau de bord opérationnel résumant les données du système.</p>
        </div>

        {user?.isSuperAdmin && (
          <Link 
            to="/super-admin"
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-black uppercase italic tracking-widest shadow-xl shadow-gray-200 hover:scale-105 transition-all"
          >
            <Globe className="w-4 h-4 text-blue-400" /> Retour au Panel Global
          </Link>
        )}

        <div>
           <select 
              value={filterFiliere} 
              onChange={e => setFilterFiliere(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none w-full md:w-auto"
           >
              <option value="all">Filières (Toutes)</option>
              {raw.filieres.map((f:any) => <option key={f.id} value={f.name}>{f.name}</option>)}
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Étudiants Actifs" value={computed.studentsCount} icon={Users} color="blue" />
        <StatCard title="Recettes Réalisées" value={`${computed.totalPaid.toLocaleString()} DH`} icon={Wallet} color="green" />
        <StatCard title="Restes à Recouvrir" value={`${Math.max(0, computed.totalDue - computed.totalPaid).toLocaleString()} DH`} icon={TrendingDown} color="amber" />
        <StatCard title="Taux de Présence" value={`${computed.presenceRate}%`} icon={CheckCircle2} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <div className="mb-6">
             <h3 className="text-lg font-bold text-black flex items-center gap-2">
               <Wallet className="w-4 h-4 text-gray-400" />
               État Financier
             </h3>
             <p className="text-xs text-gray-500 mt-1">Recouvrement vs Créances</p>
          </div>
          <div className="flex-1 min-h-[250px]">
             {computed.financeData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie data={computed.financeData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                        {computed.financeData.map((entry:any, index:number) => ( <Cell key={`cell-${index}`} fill={entry.color} /> ))}
                     </Pie>
                     <RechartsTooltip formatter={(value: number) => `${value.toLocaleString()} DH`} />
                  </PieChart>
               </ResponsiveContainer>
             ) : (
               <p className="text-center text-sm text-gray-400 mt-4">Aucune donnée financière</p>
             )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
             <h3 className="font-bold text-black mb-4">Statuts des Étudiants</h3>
             <div className="flex-1 min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie data={computed.statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                        {computed.statusData.map((e:any, i:number) => <Cell key={i} fill={e.color} />)}
                     </Pie>
                     <RechartsTooltip />
                   </PieChart>
                </ResponsiveContainer>
             </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
             <h3 className="font-bold text-black mb-4">Rôles Personnel</h3>
             <div className="flex-1 min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={computed.staffRoleData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} fontSize={10} />
                      <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                      <RechartsTooltip cursor={{fill: '#f8fafc'}} />
                   </BarChart>
                </ResponsiveContainer>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
           <h3 className="font-bold text-black mb-6 flex items-center gap-2">
             <List className="w-5 h-5 text-gray-400" />
             Top 5 Académique (Filtré)
           </h3>
           <div className="space-y-4">
              {raw.students
                .filter((s:any) => filterFiliere === 'all' || s.program === filterFiliere)
                .sort((a:any, b:any) => (parseFloat(b.average) || 0) - (parseFloat(a.average) || 0))
                .slice(0, 5)
                .map((s:any, i:number) => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                       <span className="text-xs font-black text-blue-600 w-4">{i+1}.</span>
                       <div>
                          <p className="text-sm font-bold text-black">{s.name}</p>
                          <p className="text-[10px] text-gray-500">{s.program}</p>
                       </div>
                    </div>
                    <span className="text-sm font-black text-black bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm">
                      {parseFloat(s.average || 0).toFixed(1)}/20
                    </span>
                  </div>
                ))}
              {raw.students.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Aucun étudiant classé</p>}
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
           <h3 className="font-bold text-black mb-6 flex items-center gap-2">
             <CheckCircle2 className="w-5 h-5 text-gray-400" />
             Informations
           </h3>
           <div className="space-y-4 h-full flex flex-col justify-center">
              <p className="text-center text-sm text-gray-500 font-medium">Système de gestion MIAGE Nexus ERP.</p>
              <p className="text-center text-[10px] text-gray-400 italic">Plateforme centralisée pour la gestion académique et administrative.</p>
           </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="mb-6 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <List className="w-5 h-5 text-gray-400" />
              <div>
                <h2 className="text-lg font-bold text-black">Filières Actives</h2>
                <p className="text-xs text-gray-500 mt-1">Liste des programmes configurés</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {raw.filieres.filter((f:any) => filterFiliere === 'all' || f.name === filterFiliere).map((f: any) => (
              <div 
                key={f.id} 
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  {f.code || f.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-semibold text-black text-sm">{f.name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{f.studentCount || 0} Étudiant(s)</p>
                </div>
              </div>
            ))}
          </div>
      </div>
    </div>
  );
};
