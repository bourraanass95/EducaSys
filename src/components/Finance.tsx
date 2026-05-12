import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  CreditCard, 
  AlertCircle, 
  CheckCircle, 
  Download,
  Filter,
  Search,
  ArrowUpRight,
  TrendingDown,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Eye,
  ArrowRight,
  AlertOctagon
} from 'lucide-react';
import { cn, dedupeById } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { UserRole } from '../types';
import { api, Invoice, AdminStats } from '../services/api';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface FinanceProps {
  activeRole: UserRole;
  user: any;
}

export const Finance = ({ activeRole, user }: FinanceProps) => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Income', // 'Income' or 'Expense'
    studentId: '',
    studentName: '',
    amount: 0,
    status: 'Pending',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const canManage = activeRole === 'Admin' || activeRole === 'Staff';
  const canDelete = activeRole === 'Admin';

  useEffect(() => {
    loadData();
    loadStudents();
  }, []);

  const openNewModal = () => {
    setEditingInvoice(null);
    setFormData({
      type: 'Income',
      studentId: '',
      studentName: '',
      amount: 0,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (invoice: any) => {
    setEditingInvoice(invoice);
    setFormData({
      type: invoice.type || 'Normal',
      studentId: invoice.studentId || '',
      studentName: invoice.studentName || invoice.student || '',
      amount: invoice.amount || 0,
      status: invoice.status || 'Pending',
      date: invoice.date || new Date().toISOString().split('T')[0],
      notes: invoice.notes || ''
    });
    setIsModalOpen(true);
  };

  const openInfoModal = (invoice: any) => {
    setSelectedInvoice(invoice);
    setIsInfoModalOpen(true);
  };

  const loadData = async () => {
    try {
      const schoolId = user?.schoolId;
      const [invoiceData, statData] = await Promise.all([
        api.getInvoices(schoolId),
        api.getDashboardStats(schoolId)
      ]);
      setInvoices(dedupeById(invoiceData));
      setStats(statData);
    } catch (error) {
      console.error('Error loading finance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const studentData = await api.getStudents(user?.schoolId);
      setStudents(dedupeById(studentData));
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Find student name if it's an Income payment
      let finalData: any = { ...formData };
      if (formData.type === 'Income' && formData.studentId) {
        const student = students.find(s => s.id === formData.studentId);
        if (student) {
          finalData.studentName = student.name;
          finalData.student = student.name; // For backward compatibility
        }
      } else {
        finalData.student = formData.studentName;
      }

      if (editingInvoice) {
        await api.updateInvoice(editingInvoice.id, finalData);
      } else {
        await api.addInvoice(finalData, user?.schoolId);
      }
      
      setIsModalOpen(false);
      await loadData();
    } catch (error) {
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.updateInvoice(id, { status });
      await loadData();
    } catch (error) {
      console.error('Error updating invoice status:', error);
    }
  };

  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);

  const handleDeleteInvoice = async () => {
    if (!invoiceToDelete) return;
    try {
      const inv = invoices.find(i => i.id === invoiceToDelete);
      await api.deleteInvoice(invoiceToDelete);
      
      if (inv) {
        await api.addGeneric('notifications', {
          message: `Une facture importante a été supprimée (Référence: ${invoiceToDelete}, Étudiant: ${inv.student || inv.studentName}, Montant: ${inv.amount} DH).`,
          type: 'alert',
          targetRoles: ['Admin'],
          read: false,
          schoolId: user?.schoolId,
          timestamp: new Date().toISOString()
        }).catch(console.error);
      }
      
      setInvoiceToDelete(null);
      await loadData();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleDownloadInvoice = (invoice: any) => {
    // PDF Generation using jsPDF
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235); // Blue-600
    doc.text('MIAGE EDUCASYS ERP', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Facture Officielle / Reçu de Paiement', 105, 28, { align: 'center' });
    
    doc.setDrawColor(200);
    doc.line(20, 35, 190, 35);
    
    // Content
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Référence: ${invoice.id}`, 20, 50);
    doc.text(`Date: ${invoice.date}`, 20, 58);
    doc.text(`Statut: ${invoice.status === 'Paid' ? 'RÉGLÉ' : 'EN ATTENTE'}`, 20, 66);
    
    doc.setFontSize(14);
    doc.text('Informations Client:', 20, 85);
    doc.setFontSize(12);
    doc.text(`Nom: ${invoice.studentName || invoice.student}`, 30, 95);
    
    if (invoice.type === 'Income') {
      doc.text('Type: Revenu (Entrée)', 30, 103);
    } else {
      doc.text('Type: Dépense (Sortie)', 30, 103);
    }
    
    // Amount Box
    doc.setDrawColor(37, 99, 235);
    doc.setFillColor(240, 244, 255);
    doc.rect(20, 115, 170, 25, 'FD');
    
    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235);
    doc.text(`MONTANT TOTAL: ${invoice.amount.toLocaleString()} DH`, 105, 131, { align: 'center' });
    
    // Notes
    if (invoice.notes) {
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text('Notes:', 20, 155);
      doc.setFontSize(10);
      doc.setTextColor(100);
      const splitNotes = doc.splitTextToSize(invoice.notes, 160);
      doc.text(splitNotes, 20, 163);
    }
    
    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text('Ce document est généré informatiquement et fait office de pièce justificative.', 105, 280, { align: 'center' });
    doc.text('© 2026 MIAGE EDUCASYS - Système de Gestion Intégré', 105, 285, { align: 'center' });

    doc.save(`facture_${invoice.id}.pdf`);
  };

  const getRevenueByMonth = () => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
    const currentYear = new Date().getFullYear();
    const data = months.map(month => ({ name: month, amount: 0 }));

    invoices.forEach(invoice => {
      if (invoice.status === 'Paid') {
        const date = new Date(invoice.date);
        if (date.getFullYear() === currentYear) {
          const monthIndex = date.getMonth();
          data[monthIndex].amount += Number(invoice.amount || 0);
        }
      }
    });

    // Only show current and past months for the chart to keep it clean
    const currentMonthIndex = new Date().getMonth();
    return data.slice(0, currentMonthIndex + 2); // Show up to next month
  };

  const revenueData = getRevenueByMonth();

  if (loading) {
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
          <h1 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter">Gestion Financière</h1>
          <p className="text-gray-500 font-medium">Suivi des frais de scolarité, facturation et recouvrement.</p>
        </div>
        {canManage && (
          <button 
            onClick={openNewModal}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
             <Plus className="w-4 h-4" /> Nouvelle Facture
          </button>
        )}
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Revenus ce mois</p>
              <span className="text-green-600 text-[10px] font-black bg-green-50 px-2 py-0.5 rounded-full">+100%</span>
            </div>
            <p className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">{stats?.revenueThisMonth.toLocaleString()} DH</p>
            <div className="h-40 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fontWeight: 'bold', fill: '#9ca3af'}}
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{fill: '#f9fafb'}} 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} 
                  />
                  <Bar dataKey="amount" radius={[6, 6, 0, 0]} barSize={40}>
                    {revenueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.amount > 0 ? '#2563eb' : '#e5e7eb'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic mb-1">Résumé Financier</p>
              <h3 className="text-xl font-black text-gray-900 uppercase italic tracking-tighter">Performance Globale</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-gray-50 rounded-2xl">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Factures</p>
                <p className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter">{invoices.length}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-2xl">
                <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1 italic">Payées</p>
                <p className="text-2xl font-black text-green-700 uppercase italic tracking-tighter">
                  {invoices.filter(i => i.status === 'Paid').length}
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-2xl">
                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1 italic">En Attente</p>
                <p className="text-2xl font-black text-red-700 uppercase italic tracking-tighter">
                  {invoices.filter(i => i.status === 'Pending').length}
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-2xl">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1 italic">Taux de Recouv.</p>
                <p className="text-2xl font-black text-blue-700 uppercase italic tracking-tighter">
                  {invoices.length > 0 
                    ? Math.round((invoices.filter(i => i.status === 'Paid').length / invoices.length) * 100) 
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-sm font-black text-gray-900 uppercase italic tracking-tighter">Transactions Récentes</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Rechercher..."
                  className="pl-8 pr-4 py-1.5 bg-gray-50 border-none rounded-full text-[10px] font-bold focus:ring-1 focus:ring-blue-100 outline-none w-48"
                />
              </div>
              <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline px-2">Tout voir</button>
            </div>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[10px] uppercase font-black tracking-widest text-gray-400 italic">
                  <tr>
                    <th className="px-6 py-4">Étudiant</th>
                    <th className="px-6 py-4">Montant</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Statut</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="group hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-black text-gray-900 uppercase italic tracking-tighter">{invoice.student}</div>
                        <div className="flex gap-2 items-center">
                          <div className="text-[10px] text-gray-300">ID: {invoice.id}</div>
                          <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-full",
                             invoice.type === 'Income' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                          )}>
                             {invoice.type === 'Income' ? 'Revenu' : 'Dépense'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-black text-gray-900">{invoice.amount.toLocaleString()} DH</div>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-gray-500">{invoice.date}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-3 py-1 rounded-2xl text-[10px] font-black uppercase tracking-widest",
                          invoice.status === 'Paid' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                        )}>
                          {invoice.status === 'Paid' ? 'Reglé' : 'En Attente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {invoice.status === 'Pending' && canManage && (
                            <button 
                              onClick={() => handleUpdateStatus(invoice.id, 'Paid')}
                              className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                              title="Marquer comme payée"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {canManage && (
                            <button 
                              onClick={() => openEditModal(invoice)}
                              className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                              title="Modifier"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDownloadInvoice(invoice)}
                            className="p-2 hover:bg-white rounded-xl transition-all text-gray-400 hover:text-blue-600 border border-transparent hover:border-blue-100 shadow-sm shadow-transparent hover:shadow-blue-50"
                            title="Télécharger PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openInfoModal(invoice)}
                            className="p-2 hover:bg-white rounded-xl transition-all text-gray-400 hover:text-blue-600 border border-transparent hover:border-blue-100 shadow-sm shadow-transparent hover:shadow-blue-50"
                            title="Plus d'infos"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                          {canDelete && (
                            <button 
                              onClick={() => setInvoiceToDelete(invoice.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm hover:shadow-red-50"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
      </div>

      {isInfoModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setIsInfoModalOpen(false)}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                 <h2 className="text-xl font-black text-gray-900 uppercase italic tracking-tighter">Détails de la Facture</h2>
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 italic">Réf: {selectedInvoice.id}</p>
              </div>
              <button 
                onClick={() => setIsInfoModalOpen(false)}
                className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400"
              >
                <AlertCircle className="w-5 h-5 rotate-45" />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Étudiant / Client</p>
                  <p className="text-sm font-black text-gray-900 uppercase italic">{selectedInvoice.studentName || selectedInvoice.student}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-2xl">
                  <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1 italic">Montant Total</p>
                  <p className="text-sm font-black text-blue-600 italic">{selectedInvoice.amount.toLocaleString()} DH</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Date Émission</p>
                  <p className="text-sm font-bold text-gray-900 italic">{selectedInvoice.date}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Statut Actuel</p>
                  <span className={cn(
                    "inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                    selectedInvoice.status === 'Paid' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  )}>
                    {selectedInvoice.status === 'Paid' ? 'Reglé' : 'En Attente'}
                  </span>
                </div>
              </div>

              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Notes & Observations</p>
                <p className="text-xs text-gray-600 font-medium leading-relaxed italic">
                  {selectedInvoice.notes || "Aucune note particulière pour cette transaction."}
                </p>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => handleDownloadInvoice(selectedInvoice)}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Télécharger PDF
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setIsModalOpen(false)}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                 <h2 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter">
                   {editingInvoice ? 'Modifier la Facture' : 'Émettre une Facture'}
                 </h2>
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 italic">
                   {editingInvoice ? `Référence: ${editingInvoice.id}` : 'Facturation des frais de scolarité'}
                 </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400"
              >
                <AlertCircle className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-2 italic">Type de Facture</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value, studentId: '', studentName: ''})}
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-2xl text-sm transition-all outline-none font-bold italic"
                  >
                    <option value="Income">Revenu (Entrée)</option>
                    <option value="Expense">Dépense (Sortie)</option>
                  </select>
                </div>

                {formData.type === 'Income' ? (
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-2 italic">Étudiant</label>
                    <select 
                      required
                      value={formData.studentId}
                      onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                      className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-2xl text-sm transition-all outline-none font-bold italic"
                    >
                      <option value="">Sélectionner un étudiant...</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.id.substring(0,8)})</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-2 italic">Libellé / Client</label>
                    <input 
                      type="text"
                      required
                      value={formData.studentName}
                      onChange={(e) => setFormData({...formData, studentName: e.target.value})}
                      className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-2xl text-sm transition-all outline-none font-bold italic"
                      placeholder="ex: Frais Administration"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-2 italic">Date de Facturation</label>
                  <input 
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-2xl text-sm transition-all outline-none font-bold italic"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-2 italic">Montant (DH)</label>
                  <input 
                    type="number"
                    required
                    value={isNaN(formData.amount) ? '' : formData.amount}
                    onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-2xl text-sm transition-all outline-none font-bold italic"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-2 italic">Notes / Description</label>
                  <textarea 
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-2xl text-sm transition-all outline-none font-bold italic resize-none"
                    placeholder="Détails supplémentaires..."
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-2 italic">Statut Initial</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-2xl text-sm transition-all outline-none font-bold italic"
                  >
                    <option value="Pending">En Attente</option>
                    <option value="Paid">Réglé</option>
                  </select>
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
                  {isSaving ? 'Enregistrement...' : (editingInvoice ? 'Enregistrer les modifications' : 'Émettre la facture')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {invoiceToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setInvoiceToDelete(null)} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl relative overflow-hidden flex flex-col p-8 text-center items-center">
               <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                 <AlertOctagon className="w-8 h-8 text-red-500" />
               </div>
               <h2 className="text-xl font-black text-gray-900 mb-2">Supprimer la facture ?</h2>
               <p className="text-sm text-gray-500 mb-8">Voulez-vous vraiment supprimer cette facture ? Cette action est irréversible.</p>
               <div className="flex w-full gap-3">
                 <button onClick={() => setInvoiceToDelete(null)} className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-colors">
                   Annuler
                 </button>
                 <button onClick={handleDeleteInvoice} className="flex-1 py-4 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 shadow-lg shadow-red-200 transition-colors">
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
