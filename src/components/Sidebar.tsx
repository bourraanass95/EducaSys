import React from 'react';
import { 
  School,
  Globe,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { NAVIGATION_SECTIONS } from '../constants';

import { UserRole } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeRole: UserRole;
  user: any;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar = ({ activeTab, setActiveTab, activeRole, user, isOpen, onClose }: SidebarProps) => {
  const isSuperAdmin = user?.isSuperAdmin === true;
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const sections = NAVIGATION_SECTIONS.map(section => ({
    ...section,
    items: section.items.filter(item => {
      const roleMatch = item.roles.includes(activeRole);
      if (item.id === 'super-admin') return roleMatch && isSuperAdmin;
      return roleMatch;
    })
  })).filter(section => section.items.length > 0);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[60] lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <aside className={cn(
        "bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0 transition-all duration-300 z-[70]",
        "fixed lg:sticky top-0 left-0 bottom-0",
        isCollapsed ? "w-20" : "w-64",
        isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
      )}>
        <div
          onClick={() => setActiveTab('school-profile')}
          className={cn("p-6 flex items-center gap-3 relative w-full", isCollapsed ? "justify-center px-0" : "hover:bg-gray-50 transition-colors cursor-pointer")}
        >
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20 overflow-hidden">
          {user?.schoolLogoUrl ? (
            <img src={user.schoolLogoUrl} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <School className="w-6 h-6" />
          )}
        </div>
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }}
            className="overflow-hidden text-left"
          >
            <h2 className="font-display font-black text-black leading-none tracking-tight uppercase italic truncate">{user?.schoolName || 'EducaSys'}</h2>
            <p className="text-[9px] text-gray-400 font-bold tracking-[0.2em] uppercase mt-1 truncate">{user?.schoolSubdomain || 'Cloud'}</p>
          </motion.div>
        )}
        
        <button 
          onClick={(e) => { e.stopPropagation(); setIsCollapsed(!isCollapsed); }}
          className="absolute -right-3 top-10 w-6 h-6 bg-white border border-gray-100 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors z-[60]"
        >
          <ChevronRight className={cn("w-3 h-3 transition-transform text-gray-400", isCollapsed ? "" : "rotate-180")} />
        </button>
      </div>

      {user?.isSuperAdmin && !isCollapsed && (
        <div className="px-6 mb-6">
           <Link 
             to="/super-admin"
             className="flex items-center gap-3 px-4 py-3 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] italic shadow-lg shadow-gray-200 transition-all hover:scale-105 active:scale-95"
           >
             <Globe className="w-4 h-4 text-blue-400" />
             Panel Global
           </Link>
        </div>
      )}

      {user?.isSuperAdmin && isCollapsed && (
        <div className="px-6 mb-6 flex justify-center">
           <Link 
             to="/super-admin"
             className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center shadow-md transition-all hover:scale-110"
             title="Panel Global"
           >
             <Globe className="w-4 h-4 text-blue-400" />
           </Link>
        </div>
      )}

      <nav className="flex-1 px-4 mt-2 space-y-8 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {sections.map((section) => (
          <div key={section.title} className="space-y-2">
            {!isCollapsed && (
              <p className="px-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">{section.title}</p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    title={isCollapsed ? item.label : ""}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all relative group",
                      isActive 
                        ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20" 
                        : "text-gray-500 hover:bg-gray-50 hover:text-blue-600"
                    )}
                  >
                    <Icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-white" : "text-gray-400 group-hover:text-blue-600")} />
                    {!isCollapsed && <span>{item.label}</span>}
                    {isActive && isCollapsed && (
                       <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-l-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {!isCollapsed && (
        <div className="p-4 mt-auto mb-2">
          <div className="bg-gray-50 border border-gray-100 rounded-[24px] p-4 flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center font-black italic shadow-sm shrink-0",
              activeRole === 'Admin' ? "bg-gray-900 text-white" : "bg-blue-500 text-white"
            )}>
              {activeRole[0]}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-black text-black truncate">
                 {user?.name || 'Utilisateur'}
              </p>
              <p className="text-[9px] text-gray-400 truncate uppercase tracking-widest font-black italic">{activeRole}</p>
            </div>
          </div>
        </div>
      )}
      
      {isCollapsed && (
        <div className="p-4 mt-auto mb-2 flex justify-center">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center font-black italic shadow-lg animate-pulse-subtle",
            activeRole === 'Admin' ? "bg-gray-900 text-white" : "bg-blue-500 text-white"
          )}>
            {activeRole[0]}
          </div>
        </div>
      )}
    </aside>
    </>
  );
};
