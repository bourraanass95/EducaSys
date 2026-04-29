import React, { useState, useEffect } from 'react';
import { 
  School, 
  Plus, 
  ExternalLink, 
  ShieldCheck, 
  User, 
  Users, 
  Globe, 
  Mail, 
  Phone,
  LayoutDashboard,
  Building2,
  MoreVertical,
  Activity,
  ArrowRight,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  X,
  Edit2,
  Trash2,
  Download,
  RefreshCcw,
  Trash,
  Info,
  LogOut
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'motion/react';
import { cn, dedupeById } from '../lib/utils';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const SuperAdminDashboard = ({ user, onLogout }: { user?: any, onLogout?: () => void }) => {
  const navigate = useNavigate();
  const [schools, setSchools] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [deletedSchools, setDeletedSchools] = useState<any[]>([]);
  const [deletedRequests, setDeletedRequests] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'instances' | 'requests' | 'admins' | 'history'>('instances');
  const [historyTab, setHistoryTab] = useState<'payments' | 'schools' | 'requests'>('payments');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showPaymentEditModal, setShowPaymentEditModal] = useState(false);
  const [showRequestEditModal, setShowRequestEditModal] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{message: string, onConfirm: () => void} | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({message, type});
    setTimeout(() => setToast(null), 3000);
  };
  const [editingSchool, setEditingSchool] = useState<any>(null);
  const [editingAdmin, setEditingAdmin] = useState<any>(null);
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [editingRequest, setEditingRequest] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState<'alphabet' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isWiping, setIsWiping] = useState(false);
  
  // Payment Alert State
  const [showPaymentReminder, setShowPaymentReminder] = useState<any>(null); // For the 3-day popup

  const [requestForm, setRequestForm] = useState({
    name: '',
    schoolName: '',
    email: '',
    phone: '',
    status: 'Pending'
  });

  const [schoolForm, setSchoolForm] = useState({
    name: '',
    subdomain: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    status: 'Active',
    adminEmail: '',
    adminPassword: '',
    adminUserId: ''
  });

  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  const isSuperSuperAdmin = user?.isSuperAdmin || user?.email === 'anassbourra.1995@gmail.com';
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        schoolsData, 
        requestsData, 
        usersData,
        payData,
        delSchoolData,
        delReqData
      ] = await Promise.all([
        api.getGenericCollection('schools'),
        api.getGenericCollection('license_requests'),
        api.getGenericCollection('users'),
        api.getGenericCollection('payment_history'),
        api.getGenericCollection('deleted_schools'),
        api.getGenericCollection('deleted_requests')
      ]);
      
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const now = new Date();

      const processedSchools = (schoolsData || []).map(school => {
        // Reset logic: If month changed, status becomes pending unless it's already paid for this month
        const lastMonth = school.lastPaymentMonth || '';
        let status = school.paymentAlertStatus || 'pending';
        
        if (lastMonth < currentMonth && status === 'paid') {
          status = 'pending';
        }

        // 3-day reminder logic
        if (status === 'not_yet' && school.notYetTimestamp) {
          const timestamp = new Date(school.notYetTimestamp);
          const diffDays = Math.ceil((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays >= 3) {
            // This triggers the popup
            setShowPaymentReminder(school);
          }
        }

        return { ...school, paymentAlertStatus: status };
      });

      setSchools(dedupeById(processedSchools));
      setRequests(dedupeById(requestsData));
      setAdmins(dedupeById((usersData || []).filter((u: any) => u.isSuperAdmin && u.email !== 'anassbourra.1995@gmail.com')));
      setPaymentHistory(dedupeById(payData));
      setDeletedSchools(dedupeById(delSchoolData));
      setDeletedRequests(dedupeById(delReqData));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentAction = async (schoolId: string, action: 'paid' | 'not_yet') => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const update: any = {
      paymentAlertStatus: action,
      updatedAt: new Date().toISOString()
    };

    if (action === 'paid') {
      update.lastPaymentMonth = currentMonth;
    } else {
      update.notYetTimestamp = new Date().toISOString();
    }

    try {
      await api.updateGeneric('schools', schoolId, update);
      
      // Log payment history if confirming payment
      if (action === 'paid') {
        const school = schools.find(s => s.id === schoolId);
        await api.addGeneric('payment_history', {
          schoolId,
          schoolName: school?.name,
          month: currentMonth,
          confirmedAt: new Date().toISOString(),
          confirmedBy: user?.email
        });
      }

      loadData();
      if (showPaymentReminder?.id === schoolId) {
        setShowPaymentReminder(null);
      }
    } catch (e) {
      console.error(e);
      showToast('Erreur lors de la mise à jour du paiement', 'error');
    }
  };

  const handleSubmitSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSchool) {
        // Update School (could be in schools or deleted_schools)
        const collection = editingSchool.deletedAt ? 'deleted_schools' : 'schools';
        await api.updateGeneric(collection, editingSchool.id, {
          name: schoolForm.name,
          subdomain: schoolForm.subdomain,
          firstName: schoolForm.firstName,
          lastName: schoolForm.lastName,
          email: schoolForm.email,
          phone: schoolForm.phone,
          address: schoolForm.address,
          status: schoolForm.status
        });

        // Update Admin User if exists
        if (schoolForm.adminUserId) {
          const adminUpdate: any = {
            email: schoolForm.adminEmail,
            name: `${schoolForm.firstName} ${schoolForm.lastName}`
          };
          if (schoolForm.adminPassword) {
            adminUpdate.password = schoolForm.adminPassword;
          }
          await api.updateGeneric('users', schoolForm.adminUserId, adminUpdate);
        }
      } else {
        // 1. Create School
        const schoolId = await api.addGeneric('schools', { 
          name: schoolForm.name,
          subdomain: schoolForm.subdomain,
          firstName: schoolForm.firstName,
          lastName: schoolForm.lastName,
          email: schoolForm.email,
          phone: schoolForm.phone,
          address: schoolForm.address,
          status: schoolForm.status,
          createdAt: new Date().toISOString() 
        });

        // 2. Create Admin User for this school
        await api.addGeneric('users', {
          email: schoolForm.adminEmail,
          password: schoolForm.adminPassword,
          name: `${schoolForm.firstName} ${schoolForm.lastName}`,
          role: 'Admin',
          schoolId: schoolId,
          createdAt: new Date().toISOString()
        });
      }
      setShowAddModal(false);
      setEditingSchool(null);
      setSchoolForm({ name: '', subdomain: '', firstName: '', lastName: '', email: '', phone: '', address: '', status: 'Active', adminEmail: '', adminPassword: '', adminUserId: '' });
      loadData();
    } catch (e) {
      console.error(e);
      showToast('Erreur lors de la gestion de l\'instance', 'error');
    }
  };

  const confirmWipeDatabase = async () => {
    setShowWipeConfirm(false);
    setIsWiping(true);
    try {
      const res = await fetch('/api/wipe-database', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('Base de données réinitialisée. Rechargez la page.', 'success');
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
      showToast('Erreur lors de la réinitialisation', 'error');
    } finally {
      setIsWiping(false);
    }
  };

  const confirmDeleteSchool = async () => {
    if (!schoolToDelete?.id) return;
    if (!isSuperSuperAdmin) {
      showToast('Seul le Super Admin principal peut supprimer des établissements.', 'error');
      return;
    }
    try {
      setSchools(prev => prev.filter(s => s.id !== schoolToDelete.id));
      // Log deletion
      await api.addGeneric('deleted_schools', {
        ...schoolToDelete,
        deletedAt: new Date().toISOString(),
        deletedBy: user?.email
      });
      
      await api.deleteGeneric('schools', schoolToDelete.id);
      showToast('Instance mise en corbeille (Historique)', 'success');
      loadData();
      setSchoolToDelete(null);
    } catch (e) {
      console.error(e);
      showToast('Erreur lors de la suppression', 'error');
      loadData();
    }
  };

  const openAddModal = (initialData?: { name?: string, email?: string, phone?: string, contactName?: string }) => {
    setEditingSchool(null);
    const domain = initialData?.name ? initialData.name.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
    
    let fName = '';
    let lName = '';
    if (initialData?.contactName) {
      const parts = initialData.contactName.trim().split(/\s+/);
      fName = parts[0] || '';
      lName = parts.slice(1).join(' ') || '';
    }

    const prefix = `${fName.toLowerCase()}.${lName.toLowerCase()}`.replace(/[^a-z0-9.]/g, '') || 'admin';

    setSchoolForm({ 
      name: initialData?.name || '', 
      subdomain: domain, 
      firstName: fName,
      lastName: lName,
      email: initialData?.email || '', 
      phone: initialData?.phone || '', 
      address: '', 
      status: 'Active',
      adminEmail: domain ? `${prefix}@${domain}.edu` : '',
      adminPassword: Math.random().toString(36).slice(-8),
      adminUserId: ''
    });
    setShowAddModal(true);
  };

  const handleSubmitAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAdmin) {
        await api.updateGeneric('users', editingAdmin.id, {
          name: adminForm.name,
          email: adminForm.email,
          ...(adminForm.password ? { password: adminForm.password } : {})
        });
      } else {
        await api.addGeneric('users', {
          ...adminForm,
          role: 'Admin',
          isSuperAdmin: true,
          createdAt: new Date().toISOString()
        });
      }
      setShowAdminModal(false);
      setEditingAdmin(null);
      setAdminForm({ name: '', email: '', password: '' });
      loadData();
    } catch (e) {
      console.error(e);
      showToast('Erreur lors de la gestion de l\'admin', 'error');
    }
  };

  const openEditAdminModal = (admin: any) => {
    setEditingAdmin(admin);
    setAdminForm({
      name: admin.name,
      email: admin.email,
      password: '' // Keep empty for security, only update if typed
    });
    setShowAdminModal(true);
  };

  const handleDeleteAdmin = async (id: string) => {
    if (!isSuperSuperAdmin) {
      showToast('Seul un Administrateur Global peut gérer les autres admins.', 'error');
      return;
    }
    setConfirmDialog({
      message: 'Supprimer cet administrateur ?',
      onConfirm: async () => {
        try {
          setAdmins(prev => prev.filter(a => a.id !== id));
          await api.deleteGeneric('users', id);
          showToast('Administrateur supprimé', 'success');
          loadData();
        } catch (e) {
          console.error(e);
          showToast("Erreur lors de la suppression de l'administrateur", 'error');
          loadData();
        }
      }
    });
  };

  const handleDeletePayment = async (id: string) => {
    if (!id) return;
    setConfirmDialog({
      message: 'Supprimer cet historique de paiement ?',
      onConfirm: async () => {
        try {
          setPaymentHistory(prev => prev.filter(p => p.id !== id));
          await api.deleteGeneric('payment_history', id);
          showToast("Paiement supprimé de l'historique", 'success');
          loadData();
        } catch (e) {
          console.error(e);
          showToast('Erreur lors de la suppression du paiement', 'error');
          loadData();
        }
      }
    });
  };

  const handleUpdatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateGeneric('payment_history', editingPayment.id, {
        month: editingPayment.month,
        schoolName: editingPayment.schoolName,
        confirmedAt: editingPayment.confirmedAt,
        confirmedBy: editingPayment.confirmedBy
      });
      setShowPaymentEditModal(false);
      setEditingPayment(null);
      loadData();
    } catch (e) {
      console.error(e);
      showToast('Erreur lors de la mise à jour du paiement', 'error');
    }
  };

  const handleDownloadReceipt = (payment: any) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(37, 99, 235); // Blue-600
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("RECU DE PAIEMENT", 20, 25);
    
    doc.setFontSize(10);
    doc.text("NEXUS INFRASTRUCTURE - EDUCASYS GLOBAL", 140, 25);

    // Body
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text(`Établissement: ${payment.schoolName}`, 20, 60);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`ID Transaction: ${payment.id}`, 20, 70);
    doc.text(`Période de facturation: ${payment.month}`, 20, 80);
    doc.text(`Date de confirmation: ${new Date(payment.confirmedAt).toLocaleString()}`, 20, 90);
    doc.text(`Confirmé par: ${payment.confirmedBy}`, 20, 100);

    // separator
    doc.setDrawColor(229, 231, 235);
    doc.line(20, 110, 190, 110);

    // Info Section
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    const footerText = [
      "Ce document fait office de preuve de paiement pour les services d'infrastructure Nexus.",
      "Le paiement a été validé par le centre d'administration EDUCA SYS GLOBAL.",
      "Veuillez conserver ce reçu pour votre comptabilité."
    ];
    
    doc.text(footerText[0], 20, 130);
    doc.text(footerText[1], 20, 137);
    doc.text(footerText[2], 20, 144);

    // Footer
    doc.setFontSize(8);
    doc.text(`Généré le ${new Date().toLocaleString()}`, 20, 280);
    doc.text("© 2026 Nexus Infrastructure. Tous droits réservés.", 130, 280);

    doc.save(`Recu_Paiement_${payment.schoolName}_${payment.month}.pdf`);
  };

  const handleRestoreSchool = async (school: any) => {
    if (!school?.id) return;
    setConfirmDialog({
      message: `Restaurer l'instance ${school.name} ?`,
      onConfirm: async () => {
        try {
          setDeletedSchools(prev => prev.filter(s => s.id !== school.id));
          const { deletedAt, deletedBy, originalId, ...originalData } = school;
          if (originalId) { originalData.id = originalId; }
          await api.addGeneric('schools', originalData);
          await api.deleteGeneric('deleted_schools', school.id);
          showToast('Instance restaurée avec succès', 'success');
          loadData();
        } catch (e) {
          console.error(e);
          showToast("Erreur lors de la restauration de l'instance", 'error');
          loadData();
        }
      }
    });
  };

  const handlePermanentDeleteSchool = async (id: string) => {
    if (!id) return;
    setConfirmDialog({
      message: "Supprimer DÉFINITIVEMENT cette école de l'historique ? Cette action est irréversible.",
      onConfirm: async () => {
        try {
          setDeletedSchools(prev => prev.filter(s => s.id !== id));
          await api.deleteGeneric('deleted_schools', id);
          showToast('Établissement supprimé définitivement', 'success');
          loadData();
        } catch (e) {
          console.error(e);
          showToast('Erreur lors de la suppression définitive', 'error');
          loadData();
        }
      }
    });
  };

  const handleRestoreRequest = async (request: any) => {
    if (!request?.id) return;
    setConfirmDialog({
      message: `Restaurer la demande de ${request.name} ?`,
      onConfirm: async () => {
        try {
          setDeletedRequests(prev => prev.filter(r => r.id !== request.id));
          const { deletedAt, deletedBy, originalId, ...originalData } = request;
          if (originalId) { originalData.id = originalId; }
          await api.addGeneric('license_requests', originalData);
          await api.deleteGeneric('deleted_requests', request.id);
          showToast('Demande restaurée', 'success');
          loadData();
        } catch (e) {
          console.error(e);
          showToast('Erreur lors de la restauration de la demande', 'error');
          loadData();
        }
      }
    });
  };

  const handlePermanentDeleteRequest = async (id: string) => {
    if (!id) return;
    setConfirmDialog({
      message: "Supprimer DÉFINITIVEMENT cette demande de l'historique ?",
      onConfirm: async () => {
        try {
          setDeletedRequests(prev => prev.filter(r => r.id !== id));
          await api.deleteGeneric('deleted_requests', id);
          showToast('Demande supprimée définitivement', 'success');
          loadData();
        } catch (e) {
          console.error(e);
          showToast('Erreur lors de la suppression définitive', 'error');
          loadData();
        }
      }
    });
  };

  const openEditRequestModal = (request: any) => {
    setEditingRequest(request);
    setRequestForm({
      name: request.name || '',
      schoolName: request.schoolName || '',
      email: request.email || '',
      phone: request.phone || '',
      status: request.status || 'Pending'
    });
    setShowRequestEditModal(true);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRequest) {
        const collection = editingRequest.deletedAt ? 'deleted_requests' : 'license_requests';
        await api.updateGeneric(collection, editingRequest.id, {
          name: requestForm.name,
          schoolName: requestForm.schoolName,
          email: requestForm.email,
          phone: requestForm.phone,
          status: requestForm.status
        });
        loadData();
        setShowRequestEditModal(false);
        setEditingRequest(null);
      }
    } catch (e) {
      console.error(e);
      showToast('Erreur lors de la mise à jour de la demande', 'error');
    }
  };

  const openEditModal = async (school: any, isDeleted: boolean = false) => {
    setEditingSchool(school);
    setLoading(true);
    try {
      const users = await api.getGenericCollection('users', school.id);
      const admin = users.find((u: any) => u.role === 'Admin');
      
      setSchoolForm({ 
        name: school.name || '', 
        subdomain: school.subdomain || '', 
        firstName: school.firstName || '',
        lastName: school.lastName || '',
        email: school.email || '', 
        phone: school.phone || '', 
        address: school.address || '', 
        status: school.status || 'Active',
        adminEmail: admin ? admin.email : '',
        adminPassword: '', // Leave empty unless changing
        adminUserId: admin ? admin.id : ''
      });
      setShowAddModal(true);
    } catch (e) {
      console.error(e);
      showToast('Erreur lors du chargement des infos admin', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredSchools = schools
    .filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.subdomain.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'All' || s.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const modifier = sortOrder === 'asc' ? 1 : -1;
      if (sortBy === 'alphabet') {
        return modifier * a.name.localeCompare(b.name);
      } else {
        return modifier * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      }
    });

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Dynamic Header (Light Theme) */}
      <div className="bg-white pt-12 pb-32 px-8 relative overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 bg-blue-50/50 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/30 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
        
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="text-left">
            <div className="flex items-center gap-3 text-blue-600 mb-2">
               <Globe className="w-5 h-5 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">Infrastructure Globale Nexus</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 uppercase italic tracking-tighter leading-none mb-2">
              Panel <span className="text-blue-600">Global</span>
            </h1>
            <p className="text-gray-500 text-sm font-medium">Gestion multi-tenant et déploiement d'instances EducaSys</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
             {onLogout && (
               <button 
                  type="button"
                  onClick={onLogout}
                  className="flex-1 md:flex-none px-4 md:px-6 py-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-2xl font-black uppercase italic text-xs transition-all flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
               >
                  <LogOut className="w-4 h-4" /> <span className="sm:inline">Quitter</span>
               </button>
             )}
             <button 
                type="button"
                onClick={() => {
                  if (!isSuperSuperAdmin) {
                    showToast('Seul le Super Admin principal peut réinitialiser le système.', 'error');
                    return;
                  }
                  setShowWipeConfirm(true);
                }}
                disabled={isWiping}
                className="flex-1 md:flex-none px-4 md:px-6 py-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-2xl font-black uppercase italic text-xs transition-all flex items-center justify-center gap-2 whitespace-nowrap"
             >
                {isWiping ? 'Reset...' : 'Vider Tout'}
             </button>
             <button 
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 md:flex-none px-4 md:px-6 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-900 rounded-2xl font-black uppercase italic text-xs transition-all flex items-center justify-center gap-2 whitespace-nowrap"
             >
                <ArrowLeft className="w-4 h-4" /> <span className="sm:inline">Retour</span>
             </button>
             <button 
                type="button"
                onClick={() => openAddModal()}
                className="w-full md:w-auto px-6 md:px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase italic text-sm shadow-2xl shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
             >
                <Plus className="w-5 h-5" /> Déployer Nouvelle Instance
             </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 -mt-16 relative z-20">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
           {[
             { label: 'Instances Totales', val: schools.length, icon: Building2, col: 'blue' },
             { label: 'Demandes en Attente', val: requests.filter(r => r.status === 'Pending').length, icon: Users, col: 'emerald' },
             { label: 'Uptime Global', val: '99.9%', icon: Activity, col: 'indigo' },
             { label: 'Requêtes / Sec', val: '42', icon: Globe, col: 'rose' }
           ].map((stat, i) => (
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               key={stat.label}
               className="bg-white p-6 rounded-[32px] shadow-xl shadow-gray-200/50 border border-white flex items-center gap-4 group hover:scale-[1.02] transition-all cursor-default"
             >
                <div className={`p-4 rounded-2xl shrink-0 ${
                  stat.col === 'blue' ? 'bg-blue-50 text-blue-600' :
                  stat.col === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                  stat.col === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                  'bg-rose-50 text-rose-600'
                } group-hover:rotate-12 transition-transform`}>
                   <stat.icon className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic leading-none mb-1 truncate">{stat.label}</p>
                   <p className="text-2xl font-black text-gray-900 truncate">{stat.val}</p>
                </div>
             </motion.div>
           ))}
        </div>
        
        <div className="flex gap-4 mb-6 overflow-x-auto pb-2 scrollbar-none">
           <button 
             onClick={() => setActiveTab('instances')}
             className={`px-6 py-3 rounded-2xl font-black uppercase tracking-widest italic text-xs transition-all whitespace-nowrap ${activeTab === 'instances' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
           >
             Instances Déployées
           </button>
           <button 
             onClick={() => setActiveTab('requests')}
             className={`px-6 py-3 rounded-2xl font-black uppercase tracking-widest italic text-xs transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'requests' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
           >
             Demandes d'Essai {requests.filter(r => r.status === 'Pending').length > 0 && <span className="bg-rose-500 text-white w-5 h-5 flex items-center justify-center rounded-full text-[9px]">{requests.filter(r => r.status === 'Pending').length}</span>}
           </button>
           <button 
             onClick={() => setActiveTab('admins')}
             className={`px-6 py-3 rounded-2xl font-black uppercase tracking-widest italic text-xs transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'admins' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
           >
             Gestion Admins
           </button>
           <button 
             onClick={() => setActiveTab('history')}
             className={`px-6 py-3 rounded-2xl font-black uppercase tracking-widest italic text-xs transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
           >
             Historiques
           </button>
        </div>

        {activeTab === 'instances' ? (
        <div className="bg-white rounded-[48px] shadow-2xl shadow-gray-200/50 border border-white overflow-hidden">
           <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-50/30">
              <div>
                <h3 className="text-xl font-black text-gray-900 uppercase italic tracking-tight">Répertoire des Instances</h3>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Liste des établissements déployés</p>
              </div>
              
              <div className="flex items-center gap-3">
                 <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Rechercher une école..."
                      className="pl-12 pr-4 py-3 bg-white border border-gray-100 focus:border-blue-500 rounded-2xl text-sm font-medium outline-none w-full md:w-64 transition-all"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                 </div>
                 <div className="flex items-center gap-2">
                   {/* Sort View */}
                   <div className="flex bg-white border border-gray-100 rounded-2xl p-1 shadow-sm">
                      <button 
                        onClick={() => {
                          if (sortBy === 'alphabet') {
                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                          } else {
                            setSortBy('alphabet');
                            setSortOrder('asc');
                          }
                        }}
                        className={cn(
                          "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1",
                          sortBy === 'alphabet' ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-gray-400 hover:text-gray-600"
                        )}
                      >
                        A-Z
                        {sortBy === 'alphabet' && (
                          sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        )}
                      </button>
                      <button 
                        onClick={() => {
                          if (sortBy === 'date') {
                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                          } else {
                            setSortBy('date');
                            setSortOrder('desc');
                          }
                        }}
                        className={cn(
                          "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1",
                          sortBy === 'date' ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-gray-400 hover:text-gray-600"
                        )}
                      >
                        Date
                        {sortBy === 'date' && (
                          sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        )}
                      </button>
                   </div>

                   <div className="relative group">
                      <button className="p-3 bg-white border border-gray-100 group-hover:border-gray-200 rounded-2xl text-gray-400 transition-all flex items-center gap-2 shadow-sm">
                         <Filter className="w-5 h-5" />
                         <span className="text-[10px] font-black uppercase tracking-widest italic hidden md:block">Filtrer</span>
                      </button>
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl p-2 hidden group-hover:block z-50">
                         {['All', 'Active', 'Suspended', 'Deployment'].map(st => (
                           <button 
                             key={st}
                             onClick={() => setFilterStatus(st)}
                             className={cn(
                               "block w-full text-left px-4 py-2 text-sm rounded-xl transition-all",
                               filterStatus === st ? "bg-blue-50 text-blue-600 font-bold" : "text-gray-600 hover:bg-gray-50"
                             )}>
                             {st === 'All' ? 'Tous les statuts' : st}
                           </button>
                         ))}
                      </div>
                   </div>
                 </div>
              </div>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Établissement</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Paiement Mensuel</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Sous-domaine</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Statut Système</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Support Client</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest italic text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  <AnimatePresence mode='popLayout'>
                    {filteredSchools.map((school, i) => (
                      <motion.tr 
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={school.id} 
                        className="hover:bg-blue-50/30 transition-colors group"
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center font-black text-white rotate-6 group-hover:rotate-0 transition-transform shadow-lg shadow-gray-200/50">
                              {school.name[0]}
                            </div>
                            <div>
                              <p className="font-black text-gray-900 uppercase italic tracking-tight">{school.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Déployé le {new Date(school.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                           {school.paymentAlertStatus === 'paid' ? (
                             <div className="inline-flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase italic bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                               <CheckCircle2 className="w-3 h-3" /> Payé ({school.lastPaymentMonth})
                             </div>
                           ) : (
                             <div className="flex flex-col gap-2">
                               <div className="flex items-center gap-2 text-rose-600 font-black text-[10px] uppercase italic animate-pulse">
                                 <AlertCircle className="w-3 h-3" /> Paiement requis
                               </div>
                               <div className="flex gap-2">
                                 <button 
                                   type="button"
                                   onClick={() => handlePaymentAction(school.id, 'paid')}
                                   className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all"
                                 >
                                   Confirmé
                                 </button>
                                 <button 
                                   type="button"
                                   onClick={() => handlePaymentAction(school.id, 'not_yet')}
                                   className={cn(
                                     "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                     school.paymentAlertStatus === 'not_yet' ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                   )}
                                 >
                                   Pas encore
                                 </button>
                               </div>
                             </div>
                           )}
                        </td>
                        <td className="px-8 py-6">
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl text-[10px] font-black text-gray-600 uppercase tracking-widest group-hover:bg-blue-600 group-hover:text-white transition-all cursor-pointer shadow-sm">
                            <Globe className="w-3 h-3" />
                            {school.subdomain}.edu
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className={cn(
                            "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border",
                            school.status === 'Suspended' 
                              ? "bg-rose-50 text-rose-600 border-rose-100" 
                              : "bg-emerald-50 text-emerald-600 border-emerald-100"
                          )}>
                            {school.status === 'Suspended' ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                            {school.status || 'Active'}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="space-y-1">
                             <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                <Mail className="w-3 h-3 text-blue-400" />
                                {school.email}
                             </div>
                             <div className="flex items-center gap-2 text-[10px] font-medium text-gray-400 uppercase tracking-tight">
                                <Phone className="w-3 h-3" />
                                {school.phone || 'Non renseigné'}
                             </div>
                          </div>
                        </td>
                         <td className="px-8 py-6 text-right">
                           <div className="flex items-center justify-end gap-2">
                             <button 
                               type="button"
                               onClick={() => openEditModal(school)}
                               className="p-3 bg-white hover:bg-gray-50 border border-gray-100 rounded-2xl text-gray-400 hover:text-blue-600 transition-all shadow-sm"
                             >
                               <Edit2 className="w-4 h-4" />
                             </button>
                             <Link 
                               to={`/${school.subdomain}/dashboard`}
                               className="p-3 bg-white hover:bg-indigo-50 border border-gray-100 rounded-2xl text-gray-400 hover:text-indigo-600 transition-all shadow-sm"
                             >
                               <ExternalLink className="w-4 h-4" />
                             </Link>
                             <button 
                               type="button"
                               onClick={() => setSchoolToDelete(school)}
                               className="p-3 bg-white hover:bg-rose-50 border border-gray-100 rounded-2xl text-gray-400 hover:text-rose-600 transition-all shadow-sm"
                             >
                               <X className="w-4 h-4" />
                             </button>
                           </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>

              {filteredSchools.length === 0 && !loading && (
                <div className="p-32 text-center">
                   <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Search className="w-10 h-10 text-gray-200" />
                   </div>
                   <h3 className="text-xl font-black text-gray-900 uppercase italic">Aucun Résultat</h3>
                   <p className="text-gray-400 font-medium max-w-xs mx-auto mt-2">Nous n'avons trouvé aucune instance correspondant à votre recherche.</p>
                </div>
              )}
           </div>

           <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Système Global v4.2.0 • EducaSys Cloud Infrastructure</p>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-black text-gray-600 uppercase italic tracking-widest">Tous les services sont opérationnels</span>
              </div>
           </div>
        </div>
        ) : activeTab === 'requests' ? (
        <div className="bg-white rounded-[48px] shadow-2xl shadow-gray-200/50 border border-white overflow-hidden">
           <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-50/30">
              <div>
                <h3 className="text-xl font-black text-gray-900 uppercase italic tracking-tight">Demandes d'Essai</h3>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Gérer les demandes de licence</p>
              </div>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Date</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Nom Complet</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Établissement</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Contact</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Statut</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest italic text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  <AnimatePresence mode='popLayout'>
                    {requests.filter(req => req.status !== 'Accepted').map((req, i) => (
                      <motion.tr 
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={req.id} 
                        className="hover:bg-blue-50/30 transition-colors group"
                      >
                        <td className="px-8 py-6 text-sm text-gray-600 font-medium">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-6 font-bold text-gray-900">
                          {req.name}
                        </td>
                        <td className="px-8 py-6 text-sm text-blue-600 font-black italic uppercase">
                          {req.schoolName}
                        </td>
                        <td className="px-8 py-6">
                           <div className="space-y-1">
                              <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                 <Mail className="w-3 h-3 text-blue-400" />
                                 <a href={`mailto:${req.email}`} className="hover:underline">{req.email}</a>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] font-medium text-gray-400 uppercase tracking-tight">
                                 <Phone className="w-3 h-3" />
                                 {req.phone || 'Non renseigné'}
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <div className={cn(
                             "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border",
                             req.status === 'Pending' ? "bg-amber-50 text-amber-600 border-amber-100" :
                             req.status === 'Accepted' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                             "bg-rose-50 text-rose-600 border-rose-100"
                           )}>
                             {req.status === 'Pending' ? <Clock className="w-3 h-3" /> :
                              req.status === 'Accepted' ? <CheckCircle2 className="w-3 h-3" /> :
                              <AlertCircle className="w-3 h-3" />}
                             {req.status === 'Pending' ? 'En Attente' : req.status === 'Accepted' ? 'Acceptée' : 'Rejetée'}
                           </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <div className="flex items-center justify-end gap-2">
                             {req.status === 'Pending' && (
                               <>
                                 <button 
                                   onClick={async () => {
                                      await api.updateGeneric('license_requests', req.id, { status: 'Accepted' });
                                      openAddModal({ name: req.schoolName, email: req.email, phone: req.phone, contactName: req.name });
                                      loadData();
                                   }}
                                   className="px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all"
                                 >
                                   Accepter
                                 </button>
                                 <button 
                                   onClick={async () => {
                                      await api.updateGeneric('license_requests', req.id, { status: 'Rejected' });
                                      loadData();
                                   }}
                                   className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all"
                                 >
                                   Rejeter
                                 </button>
                               </>
                             )}
                             <button 
                               onClick={() => {
                                   setConfirmDialog({
                                     message: 'Supprimer cette demande ?',
                                     onConfirm: async () => {
                                       try {
                                         setRequests(prev => prev.filter(r => r.id !== req.id));
                                         await api.addGeneric('deleted_requests', {
                                           ...req,
                                           deletedAt: new Date().toISOString(),
                                           deletedBy: user?.email
                                         });
                                         await api.deleteGeneric('license_requests', req.id);
                                         showToast('Demande supprimée', 'success');
                                         loadData();
                                       } catch (e) {
                                         console.error(e);
                                         showToast('Erreur lors de la suppression', 'error');
                                         loadData();
                                       }
                                     }
                                   });
                               }}
                               className="p-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-400 hover:text-gray-600 transition-all shadow-sm"
                             >
                               <X className="w-4 h-4" />
                             </button>
                           </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>

              {requests.filter(req => req.status !== 'Accepted').length === 0 && !loading && (
                <div className="p-32 text-center">
                   <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Search className="w-10 h-10 text-gray-200" />
                   </div>
                   <h3 className="text-xl font-black text-gray-900 uppercase italic">Aucune Demande</h3>
                   <p className="text-gray-400 font-medium max-w-xs mx-auto mt-2">Aucune demande de licence n'a été soumise.</p>
                </div>
              )}
           </div>
        </div>
        ) : activeTab === 'admins' ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-gray-900 uppercase italic">Gestion des Administrateurs</h3>
                <p className="text-gray-400 text-[10px] font-bold uppercase mt-1">Personnes autorisées à accéder au panel global</p>
              </div>
              <button 
                onClick={() => setShowAdminModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase italic text-xs shadow-lg shadow-blue-200"
              >
                Ajouter un Admin
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {admins.map(admin => (
                 <div key={admin.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                       <button 
                         onClick={() => openEditAdminModal(admin)}
                         className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all font-bold"
                       >
                         <Edit2 className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={() => handleDeleteAdmin(admin.id)}
                         className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black mb-4">
                       {admin.name[0]}
                    </div>
                    <h4 className="font-black text-gray-900 uppercase italic tracking-tight">{admin.name}</h4>
                    <p className="text-xs text-gray-400 font-bold mb-4">{admin.email}</p>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg text-[10px] font-black text-gray-500 uppercase tracking-widest">
                       <ShieldCheck className="w-3 h-3" /> Accès Global
                    </div>
                 </div>
               ))}
               {admins.length === 0 && (
                 <div className="col-span-full p-20 text-center bg-white rounded-[32px] border border-dashed border-gray-200 text-gray-400 italic font-bold">
                    Aucun autre administrateur configuré
                 </div>
               )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex bg-white p-2 rounded-2xl border border-gray-100 shadow-sm w-fit">
               {['payments', 'schools', 'requests'].map((ht: any) => (
                 <button 
                   key={ht}
                   onClick={() => setHistoryTab(ht)}
                   className={cn(
                     "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                     historyTab === ht ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-gray-600"
                   )}
                 >
                   {ht === 'payments' ? 'Paiements' : ht === 'schools' ? 'Écoles Supprimées' : 'Demandes Supprimées'}
                 </button>
               ))}
            </div>

            <div className="bg-white rounded-[48px] shadow-2xl border border-white overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead className="bg-gray-50/80">
                     <tr>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Date</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Sujet / Entité</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Détails</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Par</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest italic text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                      {historyTab === 'payments' && paymentHistory.sort((a,b) => new Date(b.confirmedAt).getTime() - new Date(a.confirmedAt).getTime()).map(h => (
                        <tr key={`pay-${h.id}`}>
                           <td className="px-8 py-6 text-xs text-gray-500 font-bold">{new Date(h.confirmedAt).toLocaleString()}</td>
                           <td className="px-8 py-6 font-black text-gray-900 uppercase italic text-sm">{h.schoolName}</td>
                           <td className="px-8 py-6">
                              <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase italic border border-emerald-100">Paiement {h.month}</span>
                           </td>
                           <td className="px-8 py-6 text-xs text-blue-600 font-bold italic">{h.confirmedBy}</td>
                           <td className="px-8 py-6 text-right">
                              <div className="flex items-center justify-end gap-2 text-gray-400">
                                 <button onClick={() => handleDownloadReceipt(h)} className="p-2 hover:bg-gray-50 hover:text-emerald-600 rounded-xl transition-all" title="Télécharger reçu"><Download className="w-4 h-4" /></button>
                                 <button onClick={() => { setEditingPayment(h); setShowPaymentEditModal(true); }} className="p-2 hover:bg-gray-50 hover:text-blue-600 rounded-xl transition-all" title="Modifier"><Edit2 className="w-4 h-4" /></button>
                                 <button onClick={() => handleDeletePayment(h.id)} className="p-2 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all" title="Supprimer"><Trash2 className="w-4 h-4" /></button>
                              </div>
                           </td>
                        </tr>
                      ))}
                      {historyTab === 'schools' && deletedSchools.map(h => (
                        <tr key={`del-sch-${h.id}`}>
                           <td className="px-8 py-6 text-xs text-gray-500 font-bold">{new Date(h.deletedAt).toLocaleString()}</td>
                           <td className="px-8 py-6 font-black text-gray-900 uppercase italic text-sm">{h.name}</td>
                           <td className="px-8 py-6 italic text-gray-400 text-xs">Suppression définitive de l'instance ({h.subdomain})</td>
                           <td className="px-8 py-6 text-xs text-rose-600 font-bold italic">{h.deletedBy}</td>
                           <td className="px-8 py-6 text-right">
                              <div className="flex items-center justify-end gap-2 text-gray-400">
                                 <button type="button" onClick={() => handleRestoreSchool(h)} className="p-2 hover:bg-gray-50 hover:text-emerald-600 rounded-xl transition-all" title="Restaurer"><RefreshCcw className="w-4 h-4" /></button>
                                 <button type="button" onClick={() => openEditModal(h, true)} className="p-2 hover:bg-gray-50 hover:text-blue-600 rounded-xl transition-all" title="Voir/Modifier"><Edit2 className="w-4 h-4" /></button>
                                 <button type="button" onClick={() => handlePermanentDeleteSchool(h.id)} className="p-2 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all" title="Supprimer définitivement"><Trash className="w-4 h-4" /></button>
                              </div>
                           </td>
                        </tr>
                      ))}
                      {historyTab === 'requests' && deletedRequests.map(h => (
                        <tr key={`del-req-${h.id}`}>
                           <td className="px-8 py-6 text-xs text-gray-500 font-bold">{new Date(h.deletedAt).toLocaleString()}</td>
                           <td className="px-8 py-6 font-black text-gray-900 uppercase italic text-sm">{h.schoolName} ({h.name})</td>
                           <td className="px-8 py-6 italic text-gray-400 text-xs">Demande de licence {h.status}</td>
                           <td className="px-8 py-6 text-xs text-rose-600 font-bold italic">{h.deletedBy}</td>
                           <td className="px-8 py-6 text-right">
                              <div className="flex items-center justify-end gap-2 text-gray-400">
                                 <button type="button" onClick={() => handleRestoreRequest(h)} className="p-2 hover:bg-gray-50 hover:text-emerald-600 rounded-xl transition-all" title="Restaurer"><RefreshCcw className="w-4 h-4" /></button>
                                 <button type="button" onClick={() => openEditRequestModal(h)} className="p-2 hover:bg-gray-50 hover:text-blue-600 rounded-xl transition-all" title="Voir/Modifier"><Edit2 className="w-4 h-4" /></button>
                                 <button type="button" onClick={() => handlePermanentDeleteRequest(h.id)} className="p-2 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all" title="Supprimer définitivement"><Trash className="w-4 h-4" /></button>
                              </div>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Admin */}
      <AnimatePresence>
        {showAdminModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden border border-white"
             >
                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                  <h3 className="text-xl font-black uppercase italic">
                    {editingAdmin ? 'Modifier' : 'Nouvel'} <span className="text-blue-600">Admin Global</span>
                  </h3>
                  <button onClick={() => { setShowAdminModal(false); setEditingAdmin(null); }} className="text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <form onSubmit={handleSubmitAdmin} className="p-8 space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2 italic">Nom complet</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm focus:bg-white focus:border-blue-600 border-2 border-transparent"
                      value={adminForm.name}
                      onChange={e => setAdminForm({...adminForm, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2 italic">Email</label>
                    <input 
                      required
                      type="email" 
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm focus:bg-white focus:border-blue-600 border-2 border-transparent"
                      value={adminForm.email}
                      onChange={e => setAdminForm({...adminForm, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2 italic">Mot de passe</label>
                    <input 
                      required
                      type="password" 
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm focus:bg-white focus:border-blue-600 border-2 border-transparent"
                      value={adminForm.password}
                      onChange={e => setAdminForm({...adminForm, password: e.target.value})}
                    />
                  </div>
                     <div className="flex gap-4 pt-4">
                    <button 
                      type="button" 
                      onClick={() => { setShowAdminModal(false); setEditingAdmin(null); setAdminForm({ name: '', email: '', password: '' }); }}
                      className="flex-1 px-6 py-4 bg-gray-100 rounded-2xl font-black uppercase italic text-xs hover:bg-gray-200 transition-all"
                    >
                      Annuler
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase italic text-xs hover:bg-blue-500 transition-all shadow-lg shadow-blue-200"
                    >
                      {editingAdmin ? 'Mettre à jour' : 'Ajouter'}
                    </button>
                  </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="bg-white rounded-[48px] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-white"
             >
                <div className="bg-white p-10 text-gray-900 relative shrink-0">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/50 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2" />
                   <h2 className="text-3xl font-black uppercase italic tracking-tighter relative z-10">
                     {editingSchool ? 'Modifier' : 'Déployer'} <span className="text-blue-600">Instance</span>
                   </h2>
                   <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2 relative z-10 italic">Nexus Orchestration Engine</p>
                   
                   <button 
                     type="button"
                     onClick={() => { setShowAddModal(false); setEditingSchool(null); }}
                     className="absolute top-8 right-8 w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-2xl flex items-center justify-center transition-all group z-50"
                   >
                     <X className="w-5 h-5 text-gray-400" />
                   </button>
                </div>
                
                <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
                  <form onSubmit={handleSubmitSchool} className="p-10 space-y-8">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic ml-4 leading-none">Nom de l'Etablissement</label>
                        <input 
                          required
                          type="text" 
                          placeholder="Lycée International Miage"
                          className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-[24px] outline-none font-bold text-sm transition-all shadow-inner"
                          value={schoolForm.name || ''}
                          onChange={e => {
                             const name = e.target.value;
                             const generatedSubdomain = name.toLowerCase().replace(/[^a-z0-9]/g, '');
                             if (!editingSchool) {
                               const prefix = `${(schoolForm.firstName || '').toLowerCase()}.${(schoolForm.lastName || '').toLowerCase()}`.replace(/[^a-z0-9.]/g, '') || 'admin';
                               const generatedAdminEmail = generatedSubdomain ? `${prefix}@${generatedSubdomain}.edu` : '';
                               setSchoolForm({...schoolForm, name, subdomain: generatedSubdomain, adminEmail: generatedAdminEmail});
                             } else {
                               setSchoolForm({...schoolForm, name, subdomain: generatedSubdomain});
                             }
                          }}
                        />
                     </div>

                     <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100 space-y-6">
                        <div className="col-span-2">
                           <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest italic leading-none">Informations de Contact Utilisateur</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic ml-4 leading-none">Prénom</label>
                              <input 
                                required
                                type="text" 
                                placeholder="Jean"
                                className="w-full px-6 py-4 bg-white border-2 border-transparent focus:border-blue-600 rounded-[24px] outline-none font-bold text-sm transition-all shadow-inner"
                                value={schoolForm.firstName || ''}
                                onChange={e => {
                                  const firstName = e.target.value;
                                  if (!editingSchool) {
                                    const lastName = schoolForm.lastName || '';
                                    const prefix = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`.replace(/[^a-z0-9.]/g, '') || 'admin';
                                    const domain = schoolForm.name ? schoolForm.name.toLowerCase().replace(/[^a-z0-9]/g, '') : 'etablissement';
                                    setSchoolForm({
                                      ...schoolForm, 
                                      firstName,
                                      adminEmail: `${prefix}@${domain}.edu`
                                    })
                                  } else {
                                    setSchoolForm({...schoolForm, firstName});
                                  }
                                }}
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic ml-4 leading-none">Nom</label>
                              <input 
                                required
                                type="text" 
                                placeholder="Dupont"
                                className="w-full px-6 py-4 bg-white border-2 border-transparent focus:border-blue-600 rounded-[24px] outline-none font-bold text-sm transition-all shadow-inner"
                                value={schoolForm.lastName || ''}
                                onChange={e => {
                                  const lastName = e.target.value;
                                  if (!editingSchool) {
                                    const firstName = schoolForm.firstName || '';
                                    const prefix = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`.replace(/[^a-z0-9.]/g, '') || 'admin';
                                    const domain = schoolForm.name ? schoolForm.name.toLowerCase().replace(/[^a-z0-9]/g, '') : 'etablissement';
                                    setSchoolForm({
                                      ...schoolForm, 
                                      lastName,
                                      adminEmail: `${prefix}@${domain}.edu`
                                    })
                                  } else {
                                    setSchoolForm({...schoolForm, lastName});
                                  }
                                }}
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic ml-4 leading-none">Email Personnel</label>
                              <input 
                                required
                                type="email" 
                                placeholder="jean.dupont@gmail.com"
                                className="w-full px-6 py-4 bg-white border-2 border-transparent focus:border-blue-600 rounded-[24px] outline-none font-bold text-sm transition-all shadow-inner"
                                value={schoolForm.email || ''}
                                onChange={e => setSchoolForm({...schoolForm, email: e.target.value})}
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic ml-4 leading-none">Téléphone</label>
                              <input 
                                required
                                type="text" 
                                placeholder="+212 5XX XX XX XX"
                                className="w-full px-6 py-4 bg-white border-2 border-transparent focus:border-blue-600 rounded-[24px] outline-none font-bold text-sm transition-all shadow-inner"
                                value={schoolForm.phone || ''}
                                onChange={e => setSchoolForm({...schoolForm, phone: e.target.value})}
                              />
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-6 p-6 bg-blue-50/50 rounded-[32px] border border-blue-100">
                        <div className="col-span-2">
                           <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest italic mb-4">
                             {editingSchool ? 'Identifiants de Connexion Admin' : "Création de l'Administrateur Initial"}
                           </p>
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic ml-4 leading-none">Email Admin</label>
                           <input 
                             required
                             type="email" 
                             placeholder="jean@ecole.edu"
                             className="w-full px-6 py-4 bg-white border-2 border-transparent focus:border-blue-600 rounded-[24px] outline-none font-bold text-sm transition-all shadow-inner"
                             value={schoolForm.adminEmail || ''}
                             onChange={e => setSchoolForm({...schoolForm, adminEmail: e.target.value})}
                           />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic ml-4 leading-none">
                             {editingSchool ? 'Changer Mot de Passe (laisser vide si inchangé)' : 'Mot de Passe Admin'}
                           </label>
                           <input 
                             required={!editingSchool}
                             type="password" 
                             placeholder={editingSchool ? "Nouveau mot de passe" : "••••••••"}
                             className="w-full px-6 py-4 bg-white border-2 border-transparent focus:border-blue-600 rounded-[24px] outline-none font-bold text-sm transition-all shadow-inner"
                             value={schoolForm.adminPassword || ''}
                             onChange={e => setSchoolForm({...schoolForm, adminPassword: e.target.value})}
                           />
                        </div>
                     </div>

                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic ml-4 leading-none">Statut du Système</label>
                        <select 
                           className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-[24px] outline-none font-bold text-sm transition-all shadow-inner"
                           value={schoolForm.status || 'Active'}
                           onChange={e => setSchoolForm({...schoolForm, status: e.target.value})}
                        >
                           <option value="Active">Opérationnel (Active)</option>
                           <option value="Suspended">Suspendu (Maintenance)</option>
                           <option value="Deployment">En cours de déploiement</option>
                        </select>
                     </div>

                     <div className="flex gap-4 pt-6">
                        <button 
                          type="button"
                          onClick={() => { setShowAddModal(false); setEditingSchool(null); }}
                          className="flex-1 px-8 py-5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-[28px] font-black uppercase italic transition-all active:scale-95"
                        >
                           Annuler
                        </button>
                        <button 
                          type="submit"
                          className="flex-1 px-8 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[28px] font-black uppercase italic shadow-2xl shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                           {editingSchool ? 'Mettre à jour' : 'Lancer Déploiement'} <ArrowRight className="w-5 h-5" />
                        </button>
                     </div>
                  </form>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Delete School Modal */}
      <AnimatePresence>
        {schoolToDelete && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="bg-white rounded-[48px] shadow-2xl w-full max-w-md overflow-hidden border border-white text-center"
             >
                <div className="p-10 space-y-6">
                  <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500">
                    <AlertCircle className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900 mb-2">Supprimer l'instance ?</h3>
                    <p className="text-gray-500 text-sm font-medium">Vous êtes sur le point de supprimer <span className="font-bold text-gray-900">{schoolToDelete.name}</span>. Toutes les données associées (utilisateurs, paiements) seront effacées.</p>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={() => setSchoolToDelete(null)}
                      className="flex-1 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-[24px] font-black uppercase italic transition-all"
                    >
                      Annuler
                    </button>
                    <button 
                      onClick={confirmDeleteSchool}
                      className="flex-1 px-6 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-[24px] font-black uppercase italic shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-2"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Wipe Database Modal */}
      <AnimatePresence>
        {showWipeConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="bg-white rounded-[48px] shadow-2xl w-full max-w-md overflow-hidden border border-white text-center border-rose-100"
             >
                <div className="p-10 space-y-6 bg-rose-50/30">
                  <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-600 animate-pulse">
                    <AlertCircle className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-rose-600 mb-2">Danger : Réinitialisation</h3>
                    <p className="text-gray-600 text-sm font-medium">Vous êtes sur le point d'effacer <strong>TOUTES</strong> les écoles et données. Cette action est irréversible.</p>
                  </div>
                  <div className="flex flex-col gap-3 pt-4">
                    <button 
                      onClick={confirmWipeDatabase}
                      className="w-full px-6 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-[24px] font-black uppercase italic shadow-lg shadow-rose-200 transition-all"
                    >
                      Oui, tout effacer
                    </button>
                    <button 
                      onClick={() => setShowWipeConfirm(false)}
                      className="w-full px-6 py-4 bg-white border-2 border-gray-100 hover:bg-gray-50 text-gray-600 rounded-[24px] font-black uppercase italic transition-all"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Monthly Payment Recurring Reminder (3-day logic) */}
      <AnimatePresence>
        {showPaymentReminder && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="bg-white rounded-[48px] shadow-2xl w-full max-w-md overflow-hidden border border-white text-center"
             >
                <div className="p-10 space-y-6">
                  <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-500">
                    <Clock className="w-10 h-10" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900 mb-2">Relance de Paiement</h2>
                    <p className="text-gray-500 text-sm font-medium">
                      L'école <span className="font-black italic text-gray-900">{showPaymentReminder.name}</span> n'a pas encore confirmé son règlement mensuel. 
                      <br/><span className="text-amber-600 font-bold uppercase text-[10px] mt-2 block tracking-widest tracking-tighter italic">Relance automatique après 3 jours</span>
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 pt-4">
                    <button 
                      onClick={() => handlePaymentAction(showPaymentReminder.id, 'paid')}
                      className="w-full px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[24px] font-black uppercase italic shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" /> Confirmer le Paiement
                    </button>
                    <button 
                      onClick={() => setShowPaymentReminder(null)}
                      className="w-full px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-[24px] font-black uppercase italic transition-all"
                    >
                      Plus tard
                    </button>
                  </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showPaymentEditModal && editingPayment && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[120] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden border border-white"
             >
                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                  <h3 className="text-xl font-black uppercase italic">Modifier <span className="text-blue-600">Paiement</span></h3>
                  <button onClick={() => { setShowPaymentEditModal(false); setEditingPayment(null); }} className="text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <form onSubmit={handleUpdatePayment} className="p-8 space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2 italic">Établissement</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm focus:bg-white focus:border-blue-600 border-2 border-transparent"
                      value={editingPayment.schoolName}
                      onChange={e => setEditingPayment({...editingPayment, schoolName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2 italic">Mois (YYYY-MM)</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm focus:bg-white focus:border-blue-600 border-2 border-transparent"
                      value={editingPayment.month}
                      onChange={e => setEditingPayment({...editingPayment, month: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2 italic">Confirmé par</label>
                    <input 
                      required
                      type="email" 
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm focus:bg-white focus:border-blue-600 border-2 border-transparent"
                      value={editingPayment.confirmedBy}
                      onChange={e => setEditingPayment({...editingPayment, confirmedBy: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button" 
                      onClick={() => { setShowPaymentEditModal(false); setEditingPayment(null); }}
                      className="flex-1 px-6 py-4 bg-gray-100 rounded-2xl font-black uppercase italic text-xs hover:bg-gray-200 transition-all"
                    >
                      Annuler
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase italic text-xs hover:bg-blue-500 transition-all shadow-lg shadow-blue-200"
                    >
                      Mettre à jour
                    </button>
                  </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showRequestEditModal && editingRequest && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[120] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden border border-white"
             >
                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                  <h3 className="text-xl font-black uppercase italic">Modifier <span className="text-blue-600">Demande</span></h3>
                  <button onClick={() => { setShowRequestEditModal(false); setEditingRequest(null); }} className="text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <form onSubmit={handleSubmitRequest} className="p-8 space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2 italic">Nom complet</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm focus:bg-white focus:border-blue-600 border-2 border-transparent"
                      value={requestForm.name}
                      onChange={e => setRequestForm({...requestForm, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2 italic">Établissement</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm focus:bg-white focus:border-blue-600 border-2 border-transparent"
                      value={requestForm.schoolName}
                      onChange={e => setRequestForm({...requestForm, schoolName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2 italic">Email</label>
                    <input 
                      required
                      type="email" 
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm focus:bg-white focus:border-blue-600 border-2 border-transparent"
                      value={requestForm.email}
                      onChange={e => setRequestForm({...requestForm, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2 italic">Statut</label>
                    <select 
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm focus:bg-white focus:border-blue-600 border-2 border-transparent"
                      value={requestForm.status}
                      onChange={e => setRequestForm({...requestForm, status: e.target.value})}
                    >
                       <option value="Pending">En Attente</option>
                       <option value="Accepted">Acceptée</option>
                       <option value="Rejected">Rejetée</option>
                    </select>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button" 
                      onClick={() => { setShowRequestEditModal(false); setEditingRequest(null); }}
                      className="flex-1 px-6 py-4 bg-gray-100 rounded-2xl font-black uppercase italic text-xs hover:bg-gray-200 transition-all"
                    >
                      Annuler
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase italic text-xs hover:bg-blue-500 transition-all shadow-lg shadow-blue-200"
                    >
                      Mettre à jour
                    </button>
                  </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {confirmDialog && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-[32px] shadow-2xl p-8 max-w-sm w-full text-center">
               <h3 className="text-xl font-black mb-4 uppercase italic">Confirmation</h3>
               <p className="text-gray-500 font-medium mb-8 text-sm">{confirmDialog.message}</p>
               <div className="flex gap-4">
                 <button onClick={() => setConfirmDialog(null)} className="flex-1 py-4 bg-gray-100 rounded-2xl font-black uppercase italic text-xs hover:bg-gray-200">Annuler</button>
                 <button onClick={() => { confirmDialog.onConfirm(); setConfirmDialog(null); }} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase italic text-xs hover:bg-blue-700 shadow-xl shadow-blue-200">Confirmer</button>
               </div>
             </motion.div>
          </div>
        )}
        {toast && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className={`fixed bottom-8 right-8 px-6 py-4 rounded-2xl shadow-2xl z-[200] font-black uppercase italic text-xs text-white ${toast.type === 'error' ? 'bg-rose-500 shadow-rose-200' : 'bg-emerald-500 shadow-emerald-200'}`}>
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
