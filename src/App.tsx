/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Students } from './components/Students';
import { Staff } from './components/Staff';
import { Teachers } from './components/Teachers';
import { Notes } from './components/Notes';
import { Finance } from './components/Finance';
import { Academic } from './components/Academic';
import { Schedule } from './components/Schedule';
import { Attendance } from './components/Attendance';
import { InternshipBoard } from './components/Internships';
import { LibraryManagement } from './components/Library';
import { DirectorDashboard } from './components/DirectorDashboard';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { Login } from './components/Login';
import { Profile } from './components/Profile';
import { SchoolProfile } from './components/SchoolProfile';
import { Search, User, School, LogOut, Menu, X as CloseIcon, ChevronDown, Command, Globe as GlobeIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole } from './types';
import { cn } from './lib/utils';
import { api } from './services/api';
import { NotificationsMenu } from './components/NotificationsMenu';

import { Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { GlobalHome } from './components/GlobalHome';
import { SchoolLanding } from './components/SchoolLanding';
import { SuperAdminLogin } from './components/SuperAdminLogin';
import { NAVIGATION_SECTIONS } from './constants';

const SchoolLayout = ({ 
  children, 
  subdomain, 
  portalUser, 
  isAuthenticated, 
  activeTab, 
  setActiveTab, 
  activeRole, 
  isSidebarOpen, 
  setIsSidebarOpen, 
  handleLogout, 
  showProfileMenu, 
  setShowProfileMenu, 
  profileMenuRef, 
  setShowCommandPalette 
}: any) => {
  if (!isAuthenticated) {
    // Avoid double slash which can be interpreted as a protocol-relative URL
    const loginTarget = subdomain && subdomain !== '' ? `/${subdomain}/login` : '/superadmincnx';
    return <Navigate to={loginTarget} />;
  }
  
  return (
    <div className="flex min-h-screen bg-brand-bg font-sans text-brand-text">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setIsSidebarOpen(false);
        }} 
        activeRole={activeRole} 
        user={portalUser}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 px-4 md:px-8 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-20 border-b border-gray-50/50">
          <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
             <button 
               onClick={() => setIsSidebarOpen(true)}
               className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors"
               aria-label="Open Menu"
             >
               <Menu className="w-5 h-5 md:w-6 md:h-6" />
             </button>
             
             <div className="flex items-center gap-2 min-w-0 max-w-[150px] sm:max-w-none">
                {portalUser?.schoolLogoUrl ? (
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden border border-gray-100/50 shadow-sm">
                    <img src={portalUser.schoolLogoUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100/30">
                    <School className="w-4 h-4 text-blue-600" />
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-blue-600/70 italic truncate">
                    {subdomain}
                  </span>
                  <h1 className="text-sm md:text-base font-black text-black truncate leading-tight">
                    {NAVIGATION_SECTIONS.flatMap(s => s.items).find(i => i.id === activeTab)?.label || 'Aperçu'}
                  </h1>
                </div>
             </div>
             
             <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100/50 rounded-2xl ml-8 w-64 group focus-within:bg-white focus-within:border-blue-200 transition-all focus-within:shadow-sm">
                <Search className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500" />
                <input 
                  type="text" 
                  placeholder="Recherche (Ctrl + K)" 
                  className="bg-transparent border-none outline-none text-xs font-bold text-black placeholder:text-gray-400 w-full"
                  onFocus={() => setShowCommandPalette(true)}
                  readOnly
                />
                <span className="text-[10px] font-black text-gray-300 border border-gray-200 px-1.5 py-0.5 rounded-md">/</span>
             </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
            <button 
              onClick={() => setShowCommandPalette(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
            >
              <Search className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gray-50/50 border border-transparent hover:border-gray-100 rounded-xl text-gray-400 hover:text-blue-600 transition-all cursor-pointer group">
              <GlobeIcon className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
              <span className="text-[10px] font-black tracking-widest italic group-hover:translate-x-0.5 transition-transform">FR</span>
            </div>

            <NotificationsMenu activeRole={activeRole} user={portalUser} />
            
            <div className="hidden md:block h-6 w-px bg-gray-100"></div>

            <div className="relative" ref={profileMenuRef}>
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowProfileMenu(!showProfileMenu);
                }}
                className="flex items-center gap-2 sm:gap-3 group"
              >
                <div className="text-right hidden lg:block">
                  <p className="text-[11px] font-black text-black italic group-hover:text-blue-600 transition-colors truncate max-w-[100px]">
                    {portalUser?.name || 'Profil'}
                  </p>
                  <p className="text-[9px] text-blue-600/80 font-black uppercase tracking-widest">{activeRole}</p>
                </div>
                
                <div className={cn(
                  "w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black italic shadow-md relative group-hover:ring-2 ring-blue-500/20 ring-offset-2 transition-all",
                  activeRole === 'Admin' ? "bg-gray-900 text-white" : "bg-blue-500 text-white shadow-blue-500/20"
                )}>
                  {portalUser?.avatarUrl ? (
                    <img src={portalUser.avatarUrl} alt="" className="w-full h-full object-cover rounded-xl" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="text-sm">{(portalUser?.name?.[0] || activeRole[0])}</span>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-sm">
                    <ChevronDown className={cn("w-2 h-2 text-gray-400 transition-transform duration-300", showProfileMenu && "rotate-180")} />
                  </div>
                </div>
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-56 bg-white rounded-[24px] shadow-2xl border border-gray-100 p-2 z-[300]"
                  >
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveTab('profile');
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-xs font-bold text-gray-700 italic">Modifier Profil</span>
                    </button>

                    <div className="h-[1px] bg-gray-50 my-2 mx-2"></div>

                    <button 
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-xl transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                        <LogOut className="w-4 h-4 text-red-600" />
                      </div>
                      <span className="text-xs font-bold text-red-600 italic">Déconnexion</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
        <footer className="px-4 md:px-8 py-4 border-t border-gray-50/50 text-[10px] text-gray-400 flex flex-col sm:flex-row justify-between items-center bg-white gap-2">
          <p className="font-bold italic">© 2026 {portalUser?.schoolName || 'EducaSys'} - Nexus Powered</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" /> 
              Online
            </span>
            <span className="font-mono opacity-60">v2.4.0-LT</span>
          </div>
        </footer>
      </main>
    </div>
  );
};

const renderSchoolContent = (activeTab: string, activeRole: UserRole, portalUser: any, onUpdateUser: (data: any) => void) => {
  switch (activeTab) {
    case 'dashboard':
      return (activeRole === 'Admin' || activeRole === 'Staff' || activeRole === 'Director') ? <Dashboard user={portalUser} /> : <div className="p-12 text-center text-gray-400 italic">Accès non autorisé</div>;
    case 'director-bi': return <DirectorDashboard user={portalUser} />;
    case 'internships': return <InternshipBoard activeRole={activeRole} />;
    case 'library': return <LibraryManagement />;
    case 'staff': return <Staff activeRole={activeRole} user={portalUser} />;
    case 'teachers': return <Teachers activeRole={activeRole} user={portalUser} />;
    case 'students': return <Students activeRole={activeRole} user={portalUser} />;
    case 'academic': return <Academic activeRole={activeRole} user={portalUser} />;
    case 'schedule': return <Schedule activeRole={activeRole} user={portalUser} />;
    case 'notes': return <Notes activeRole={activeRole} user={portalUser} />;
    case 'attendance': return <Attendance activeRole={activeRole} user={portalUser} />;
    case 'finance': return <Finance activeRole={activeRole} user={portalUser} />;
    case 'school-profile': return <SchoolProfile user={portalUser} onUpdate={onUpdateUser} />;
    case 'profile': return <Profile user={portalUser} onUpdate={onUpdateUser} />;
    default: return <Dashboard user={portalUser} />;
  }
};

const SchoolPortal = ({ 
  activeUser, 
  isAuthenticated, 
  activeTab, 
  setActiveTab, 
  activeRole, 
  isSidebarOpen, 
  setIsSidebarOpen, 
  handleLogout, 
  handleUpdateUser,
  showProfileMenu, 
  setShowProfileMenu, 
  profileMenuRef, 
  setShowCommandPalette 
}: any) => {
  const { subdomain: pathSubdomain } = useParams();
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [currentSchool, setCurrentSchool] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Detect subdomain from path or hostname
    if (pathSubdomain) {
      setSubdomain(pathSubdomain);
    } else {
      const hostname = window.location.hostname;
      if (hostname !== 'localhost' && !hostname.endsWith('.vercel.app') && !hostname.endsWith('.run.app')) {
        const parts = hostname.split('.');
        if (parts.length >= 1) setSubdomain(parts[0]);
      }
    }
  }, [pathSubdomain]);

  const fetchSchool = async () => {
    if (!subdomain) return;
    try {
      const school = await api.getSchoolBySubdomain(subdomain);
      setCurrentSchool(school);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (subdomain) {
      fetchSchool();
    } else {
      setLoading(false);
    }
  }, [subdomain]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent"></div></div>;

  const portalUser = currentSchool && (activeUser?.isSuperAdmin || activeUser?.schoolId === currentSchool.id) ? {
    ...activeUser,
    schoolId: currentSchool.id,
    schoolName: currentSchool.name,
    schoolSubdomain: currentSchool.subdomain,
    schoolLogoUrl: currentSchool.logoUrl,
    schoolAddress: currentSchool.address,
    schoolEmail: currentSchool.contactEmail,
    schoolPhone: currentSchool.phone,
    schoolWebsite: currentSchool.website
  } : activeUser;

  const handleUpdate = (data: any) => {
    if (activeTab === 'school-profile') {
      // If updating school profile, refresh school data
      fetchSchool();
    }
    handleUpdateUser(data);
  };

  return (
    <SchoolLayout 
      subdomain={subdomain || ''} 
      portalUser={portalUser}
      isAuthenticated={isAuthenticated}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      activeRole={activeRole}
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
      handleLogout={handleLogout}
      showProfileMenu={showProfileMenu}
      setShowProfileMenu={setShowProfileMenu}
      profileMenuRef={profileMenuRef}
      setShowCommandPalette={setShowCommandPalette}
    >
      {renderSchoolContent(activeTab, activeRole, portalUser, handleUpdate)}
    </SchoolLayout>
  );
};

const RootRoute = ({ onShowRequest }: any) => {
  const [subdomain, setSubdomain] = useState<string | null>(null);
  
  useEffect(() => {
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && !hostname.endsWith('.vercel.app') && !hostname.endsWith('.run.app')) {
      const parts = hostname.split('.');
      if (parts.length >= 1) {
        const sub = parts[0];
        if (sub !== 'www' && sub !== 'app') setSubdomain(sub);
      }
    }
  }, []);

  if (subdomain) {
    return <Navigate to={`/${subdomain}`} replace />;
  }

  return <GlobalHome />;
};

export default function App() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('activeUser');
    if (saved) {
      const user = JSON.parse(saved);
      return (user.role as UserRole) || 'Admin';
    }
    return 'Admin';
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('isAuthenticated') === 'true');
  const [activeUser, setActiveUser] = useState<any>(() => {
    const saved = localStorage.getItem('activeUser');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated.toString());
    localStorage.setItem('activeUser', JSON.stringify(activeUser));
  }, [isAuthenticated, activeUser]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileMenuRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      if (e.key === 'Escape') {
        setShowCommandPalette(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    api.testConnection();
  }, []);

  const handleLogin = (user: any) => {
    setActiveRole(user.role as UserRole);
    setActiveUser(user);
    setIsAuthenticated(true);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveUser(null);
    navigate('/');
  };

  const handleUpdateUser = (updatedData: any) => {
    setActiveUser((prev: any) => ({ ...prev, ...updatedData }));
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<RootRoute />} />
          
          {/* Super Admin Access */}
          <Route path="/superadmincnx" element={<SuperAdminLogin onLogin={handleLogin} />} />
          <Route path="/super-admin" element={
            isAuthenticated && activeUser?.isSuperAdmin ? 
            <SuperAdminDashboard user={activeUser} onLogout={handleLogout} /> : 
            <Navigate to="/superadmincnx" />
          } />
          
          {/* School Access */}
          <Route path="/:subdomain" element={<SchoolLanding onShowRequest={() => navigate('/')} />} />
          <Route path="/:subdomain/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/:subdomain/dashboard" element={
            <SchoolPortal 
              activeUser={activeUser}
              isAuthenticated={isAuthenticated}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              activeRole={activeRole}
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
              handleLogout={handleLogout}
              handleUpdateUser={handleUpdateUser}
              showProfileMenu={showProfileMenu}
              setShowProfileMenu={setShowProfileMenu}
              profileMenuRef={profileMenuRef}
              setShowCommandPalette={setShowCommandPalette}
            />
          } />
          
          {/* Fallback endpoints */}
          <Route path="/login" element={<Navigate to="/superadmincnx" />} />
          <Route path="/dashboard" element={
             isAuthenticated ? (
               activeUser?.isSuperAdmin ? <Navigate to="/super-admin" /> : 
               <Navigate to={`/${activeUser?.schoolSubdomain || 'miage'}/dashboard`} />
             ) : <Navigate to="/" />
          } />
      </Routes>

      {/* Command Palette Modal (Keep here as it's global) */}
      <AnimatePresence>
          {showCommandPalette && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowCommandPalette(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[500]"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                className="fixed top-24 left-1/2 -translate-x-1/2 w-full max-w-xl bg-white rounded-3xl shadow-2xl z-[510] overflow-hidden border border-gray-100"
              >
                <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                  <Search className="w-5 h-5 text-blue-600" />
                  <input 
                    autoFocus
                    placeholder="Tapez un module, un étudiant ou une action..."
                    className="w-full bg-transparent border-none outline-none text-sm font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="px-2 py-1 bg-gray-50 rounded-lg text-[10px] font-black text-gray-400 border border-gray-100 uppercase italic">Esc</div>
                </div>

                <div className="max-h-96 overflow-y-auto p-2 scrollbar-none">
                  {NAVIGATION_SECTIONS.map((section) => (
                    <div key={section.title} className="mb-4 last:mb-0">
                      <p className="px-3 py-1 text-[9px] font-black text-gray-400 uppercase tracking-widest italic">{section.title}</p>
                      <div className="space-y-1 mt-1">
                        {section.items
                          .filter(item => 
                            item.label.toLowerCase().includes(searchQuery.toLowerCase()) && 
                            item.roles.includes(activeRole)
                          )
                          .map((item) => (
                            <button
                              key={item.id}
                              onClick={() => {
                                setActiveTab(item.id);
                                setShowCommandPalette(false);
                                setSearchQuery('');
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 rounded-xl group transition-all"
                            >
                              <div className="p-2 bg-gray-50 rounded-lg text-gray-400 group-hover:bg-white group-hover:text-blue-600 transition-all">
                                <item.icon className="w-4 h-4" />
                              </div>
                              <span className="text-xs font-bold text-gray-700 group-hover:text-blue-700 transition-colors">{item.label}</span>
                              <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronDown className="w-4 h-4 text-blue-300 -rotate-90" />
                              </div>
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                  
                  {searchQuery && NAVIGATION_SECTIONS.every(s => !s.items.some(i => i.label.toLowerCase().includes(searchQuery.toLowerCase()))) && (
                    <div className="p-12 text-center">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-6 h-6 text-gray-300" />
                      </div>
                      <p className="text-xs font-bold text-gray-400 italic">Aucun résultat pour "{searchQuery}"</p>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[9px] font-black text-gray-400 uppercase italic tracking-widest">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 bg-gray-200 rounded flex items-center justify-center text-[7px] border border-gray-300">↑↓</div> Naviguer</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 bg-gray-200 rounded flex items-center justify-center text-[7px] border border-gray-300">↵</div> Sélectionner</span>
                  </div>
                  <div>EducaSys Command Line</div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
    </>
  );
}
