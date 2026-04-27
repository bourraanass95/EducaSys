import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  GraduationCap, 
  Settings, 
  LogOut,
  School,
  DollarSign,
  CalendarDays,
  UserCheck,
  Trophy,
  Megaphone,
  Briefcase,
  Layers,
  ClipboardList,
  BookOpen,
  Library,
  MessageSquare,
  BarChart3,
  Globe
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

import { UserRole } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeRole: UserRole;
  user: any;
}

export const Sidebar = ({ activeTab, setActiveTab, activeRole, user }: SidebarProps) => {
  const isSuperAdmin = user?.isSuperAdmin === true;

  const allSections = [
    {
      title: 'Principal',
      items: [
        { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard, roles: ['Admin', 'Staff', 'Student'] },
        { id: 'director-bi', label: 'Analyses BI', icon: BarChart3, roles: ['Admin', 'Staff'] },
      ]
    },
    {
      title: 'Portails',
      items: [
        { id: 'student-portal', label: 'Espace Étudiant', icon: BookOpen, roles: ['Student'] },
      ]
    },
    {
      title: 'Gestion Académique',
      items: [
        { id: 'academic', label: 'Structure Scolaire', icon: Layers, roles: ['Admin', 'Staff'] },
        { id: 'students', label: 'Base Étudiants', icon: Users, roles: ['Admin', 'Staff'] },
        { id: 'schedule', label: 'Emplois du temps', icon: CalendarDays, roles: ['Admin', 'Staff', 'Student'] },
        { id: 'notes', label: 'Gestion des Notes', icon: Trophy, roles: ['Admin', 'Staff', 'Student'] },
        { id: 'library', label: 'Bibliothèque Digitale', icon: Library, roles: ['Admin', 'Staff', 'Student'] },
      ]
    },
    {
      title: 'Opérations 3S',
      items: [
        { id: 'attendance', label: 'Présences', icon: UserCheck, roles: ['Admin', 'Staff', 'Student'] },
      ]
    },
    {
      title: 'Finance & RH',
      items: [
        { id: 'finance', label: 'Finance & Facturation', icon: DollarSign, roles: ['Admin'] },
        { id: 'teachers', label: 'Gestion des Enseignants', icon: GraduationCap, roles: ['Admin', 'Staff'] },
        { id: 'staff', label: 'Gestion Personnels', icon: Users, roles: ['Admin', 'Staff'] },
      ]
    }
  ];

  const sections = allSections.map(section => ({
    ...section,
    items: section.items.filter(item => {
      const roleMatch = item.roles.includes(activeRole);
      if (item.id === 'super-admin') return roleMatch && isSuperAdmin;
      return roleMatch;
    })
  })).filter(section => section.items.length > 0);

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0 overflow-y-auto">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
          <School className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900 leading-tight tracking-tight uppercase italic">{user?.schoolName || 'EducaSys'}</h2>
          <p className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">{user?.schoolSubdomain ? `${user.schoolSubdomain}.educasys` : 'Global SaaS'}</p>
        </div>
      </div>

      {user?.isSuperAdmin && (
        <div className="px-6 mb-4">
           <Link 
             to="/super-admin"
             className="flex items-center gap-3 px-4 py-3 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] italic shadow-xl shadow-gray-200 transition-all hover:scale-105 active:scale-95"
           >
             <Globe className="w-4 h-4 text-blue-400" />
             Panel Global
           </Link>
        </div>
      )}

      <nav className="flex-1 px-4 mt-2 space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{section.title}</p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group",
                      isActive 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                        : "text-gray-500 hover:bg-gray-50 hover:text-blue-600"
                    )}
                  >
                    <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-gray-400 group-hover:text-blue-600")} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <div className="flex items-center gap-3 px-4 py-3 border-t border-gray-100 pt-6">
          <div className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center font-black italic shadow-sm",
            activeRole === 'Admin' ? "bg-gray-900 text-white" :
            activeRole === 'Student' ? "bg-blue-600 text-white" :
            activeRole === 'Teacher' ? "bg-purple-600 text-white" : "bg-gray-400 text-white"
          )}>
            {activeRole[0]}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-bold text-gray-900 truncate">
               {user?.name || 'Utilisateur EducaSys'}
            </p>
            <p className="text-[10px] text-gray-400 truncate uppercase tracking-widest font-medium">{activeRole}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
