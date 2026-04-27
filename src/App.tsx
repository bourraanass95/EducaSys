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
import { StudentPortal } from './components/portals/StudentPortal';
import { InternshipBoard } from './components/Internships';
import { LibraryManagement } from './components/Library';
import { DirectorDashboard } from './components/DirectorDashboard';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { Login } from './components/Login';
import { Search, Settings, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole } from './types';
import { cn } from './lib/utils';
import { api } from './services/api';
import { NotificationsMenu } from './components/NotificationsMenu';

import { Routes, Route, Navigate, useLocation, useParams, useNavigate } from 'react-router-dom';
import { GlobalHome } from './components/GlobalHome';
import { SchoolLanding } from './components/SchoolLanding';

import { SuperAdminLogin } from './components/SuperAdminLogin';

export default function App() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeRole, setActiveRole] = useState<UserRole>('Admin');
  const [activeUser, setActiveUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  const SchoolLayout = ({ children, subdomain, portalUser }: { children: React.ReactNode, subdomain: string, portalUser: any }) => {
    if (!isAuthenticated) return <Navigate to={`/${subdomain}/login`} />;
    
    return (
      <div className="flex min-h-screen bg-[#FDFDFD] font-sans text-gray-900">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          activeRole={activeRole} 
          user={portalUser}
        />
        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-16 px-8 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-20 border-b border-gray-50">
            <div className="flex-1">
               <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 italic">Instance: {subdomain}</span>
            </div>
            <div className="flex items-center gap-4 gap-md-6 flex-wrap md:flex-nowrap justify-end w-full">
              <NotificationsMenu activeRole={activeRole} user={portalUser} />
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all group"
              >
                <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
              <div className="h-8 w-[1px] bg-gray-100 mx-2"></div>
              <div className="flex items-center gap-3 pl-2">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-black text-gray-900 italic">{portalUser?.name || 'User Profil'}</p>
                  <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">{activeRole}</p>
                </div>
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center font-black italic shadow-lg",
                  activeRole === 'Admin' ? "bg-gray-900 text-white" :
                  activeRole === 'Staff' ? "bg-blue-500 text-white" :
                  activeRole === 'Student' ? "bg-blue-600 text-white" :
                  activeRole === 'Teacher' ? "bg-purple-600 text-white" : "bg-gray-400 text-white"
                )}>
                  {portalUser?.name?.[0] || activeRole[0]}
                </div>
              </div>
            </div>
          </header>
          <div className="flex-1 p-8 overflow-y-auto">
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
          <footer className="px-8 py-4 border-t border-gray-50 text-[10px] text-gray-400 flex justify-between items-center bg-white">
            <p>© 2026 {portalUser?.schoolName || 'EducaSys'} - Nexus Powered</p>
          </footer>
        </main>
      </div>
    );
  };

  const renderSchoolContent = (portalUser: any) => {
    switch (activeTab) {
      case 'dashboard':
        return (activeRole === 'Admin' || activeRole === 'Staff') ? <Dashboard user={portalUser} /> : 
               activeRole === 'Student' ? <StudentPortal user={portalUser} /> : <div className="p-12 text-center text-gray-400 italic">Accès non autorisé</div>;
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
      default: return <Dashboard user={portalUser} />;
    }
  };

  const SchoolPortal = () => {
    const { subdomain } = useParams();
    const [currentSchool, setCurrentSchool] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchSchool = async () => {
        try {
          const school = await api.getSchoolBySubdomain(subdomain || '');
          setCurrentSchool(school);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };
      fetchSchool();
    }, [subdomain]);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent"></div></div>;

    const portalUser = currentSchool && activeUser?.isSuperAdmin ? {
      ...activeUser,
      schoolId: currentSchool.id,
      schoolName: currentSchool.name,
      schoolSubdomain: currentSchool.subdomain
    } : activeUser;

    return (
      <SchoolLayout subdomain={subdomain || ''} portalUser={portalUser}>
        {renderSchoolContent(portalUser)}
      </SchoolLayout>
    );
  };

  return (
    <Routes>
      <Route path="/" element={<GlobalHome />} />
        
        {/* Super Admin Access */}
        <Route path="/superadmincnx" element={<SuperAdminLogin onLogin={handleLogin} />} />
        <Route path="/super-admin" element={
          isAuthenticated && activeUser?.isSuperAdmin ? 
          <div className="min-h-screen bg-gray-50 p-8">
            <SuperAdminDashboard user={activeUser} /> 
            <button onClick={handleLogout} className="mt-8 text-xs font-bold text-red-600 uppercase tracking-widest flex items-center gap-2">
               <LogOut className="w-4 h-4" /> Quitter Panel Global
            </button>
          </div> : 
          <Navigate to="/superadmincnx" />
        } />
        
        {/* School Access */}
        <Route path="/:subdomain" element={<SchoolLanding onShowRequest={() => navigate('/')} />} />
        <Route path="/:subdomain/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/:subdomain/dashboard" element={<SchoolPortal />} />
        
        {/* Fallback endpoints */}
        <Route path="/login" element={<Navigate to="/superadmincnx" />} />
        <Route path="/dashboard" element={
           isAuthenticated ? (
             activeUser?.isSuperAdmin ? <Navigate to="/super-admin" /> : 
             <Navigate to={`/${activeUser?.schoolSubdomain || 'miage'}/dashboard`} />
           ) : <Navigate to="/" />
        } />
      </Routes>
    );
  }
