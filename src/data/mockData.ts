import { Student, Alumnus } from '../types';

export const mockStudents: Student[] = [
  {
    id: 'STD-2024-001',
    name: 'Hamza Filali',
    email: 'hamza.filali@miage.edu',
    phone: '+212 661-234567',
    program: 'Génie Logiciel',
    year: 2,
    status: 'Active',
    gpa: 16.5,
  },
  {
    id: 'STD-2024-002',
    name: 'Layla Meziane',
    email: 'layla.meziane@miage.edu',
    phone: '+212 662-345678',
    program: 'Management des Entreprises',
    year: 1,
    status: 'Active',
    gpa: 14.2,
  },
];

export const mockAlumni: Alumnus[] = [
  {
    id: 'ALM-2022-045',
    name: 'Ilyas Alaoui',
    graduationYear: 2022,
    program: 'Systèmes & Réseaux',
    currentCompany: 'OCP Group',
    currentRole: 'Network Engineer',
    linkedin: 'https://linkedin.com/in/ilyas-alaoui',
  },
  {
    id: 'ALM-2021-012',
    name: 'Sofia Kenzi',
    graduationYear: 2021,
    program: 'Génie Logiciel',
    currentCompany: 'Capgemini Morocco',
    currentRole: 'Full Stack Developer',
    linkedin: 'https://linkedin.com/in/sofia-kenzi',
  },
  {
    id: 'ALM-2023-089',
    name: 'Mehdi Chraibi',
    graduationYear: 2023,
    program: 'Management des Entreprises',
    currentCompany: 'Attijariwafa Bank',
    currentRole: 'Project Manager',
    linkedin: 'https://linkedin.com/in/mehdi-chraibi',
  },
];

export const mockFilieres: any[] = [
  { 
    id: 'FIL-GL', 
    name: 'Génie Logiciel', 
    code: 'GL', 
    description: 'Conception et développement d\'applications robustes.', 
    studentCount: 156,
    coordinator: 'Prof. Alami'
  },
  { 
    id: 'FIL-SR', 
    name: 'Systèmes & Réseaux', 
    code: 'SR', 
    description: 'Administration système, sécurité et infrastructures réseaux.', 
    studentCount: 89,
    coordinator: 'Prof. Tazi'
  },
  { 
    id: 'FIL-MSI', 
    name: 'Management des Systèmes d\'Information', 
    code: 'MSI', 
    description: 'Gouvernance IT et gestion de projets technologiques.', 
    studentCount: 112,
    coordinator: 'Prof. Bennani'
  },
  { 
    id: 'FIL-ACG', 
    name: 'Audit & Contrôle de Gestion', 
    code: 'ACG', 
    description: 'Expertise comptable, audit financier et gestion.', 
    studentCount: 75,
    coordinator: 'Prof. Kadiri'
  },
];

export const mockFees: any[] = [
  { id: 'FEE-001', studentName: 'Hamza Filali', amount: 3500, dueDate: '2026-05-01', status: 'Paid', type: 'Tuition' },
  { id: 'FEE-002', studentName: 'Layla Meziane', amount: 3500, dueDate: '2026-05-01', status: 'Unpaid', type: 'Tuition' },
];

export const mockSchedule: any[] = [
  { id: 'SCH-1', name: 'Algorithmique Avancée', teacher: 'Prof. Alami', time: '09:00 - 11:00', room: 'Salle 102', day: 'Lundi' },
  { id: 'SCH-2', name: 'Base de Données SQL', teacher: 'Prof. Tazi', time: '11:15 - 13:15', room: 'Labo A', day: 'Lundi' },
  { id: 'SCH-3', name: 'Management de Projet', teacher: 'Prof. Bennani', time: '14:30 - 16:30', room: 'Amphi B', day: 'Mardi' },
];

export const mockTeachers: any[] = [
  { id: 'TCH-001', name: 'Prof. Mohammed Alami', subject: 'Génie Logiciel', email: 'alami.m@miage.net', phone: '+212 661-000001', type: 'Full-time' },
  { id: 'TCH-002', name: 'Prof. Karima Tazi', subject: 'Systèmes d\'Information', email: 'tazi.k@miage.net', phone: '+212 661-000002', type: 'Contractor' },
];

export const mockExams: any[] = [
  { id: 'EXM-001', subject: 'Java Avancé', date: '2026-05-15', startTime: '09:00', endTime: '12:00', room: 'Amphi A', type: 'Final' },
  { id: 'EXM-002', subject: 'Mathématiques Discrètes', date: '2026-05-17', startTime: '14:30', endTime: '16:30', room: 'Salle 204', type: 'Mid-term' },
];

export const mockTasks: any[] = [
  { id: 'TSK-001', title: 'Correction Examens Mi-parcours', dueDate: '2026-04-25', priority: 'High', status: 'Doing' },
  { id: 'TSK-002', title: 'Mise à jour des syllabi - Bac+3', dueDate: '2026-04-30', priority: 'Medium', status: 'Todo' },
];

export const mockTickets: any[] = [
  { id: 'TCK-001', subject: 'Problème Accès WiFi Labo B', author: 'Hamza Filali', date: '2026-04-19', status: 'In Progress' },
  { id: 'TCK-002', subject: 'Demande Relevé de Notes', author: 'Layla Meziane', date: '2026-04-20', status: 'Open' },
];
