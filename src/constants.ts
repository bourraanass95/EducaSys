import { 
  LayoutDashboard, 
  Users, 
  Layers, 
  CalendarDays, 
  Trophy, 
  Library, 
  UserCheck, 
  DollarSign, 
  GraduationCap, 
  BookOpen, 
  BarChart3
} from 'lucide-react';

export const NAVIGATION_SECTIONS = [
  {
    title: 'Principal',
    items: [
      { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard, roles: ['Admin', 'Staff'] },
      { id: 'director-bi', label: 'Analyses BI', icon: BarChart3, roles: ['Admin', 'Staff'] },
    ]
  },
  {
    title: 'Gestion Académique',
    items: [
      { id: 'academic', label: 'Structure Scolaire', icon: Layers, roles: ['Admin', 'Staff'] },
      { id: 'students', label: 'Base Étudiants', icon: Users, roles: ['Admin', 'Staff'] },
      { id: 'schedule', label: 'Emplois du temps', icon: CalendarDays, roles: ['Admin', 'Staff'] },
      { id: 'notes', label: 'Gestion des Notes', icon: Trophy, roles: ['Admin', 'Staff'] },
      { id: 'library', label: 'Bibliothèque Digitale', icon: Library, roles: ['Admin', 'Staff'] },
    ]
  },
  {
    title: 'Opérations 3S',
    items: [
      { id: 'attendance', label: 'Présences', icon: UserCheck, roles: ['Admin', 'Staff'] },
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
