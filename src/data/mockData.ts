import { Student, Alumnus } from '../types';

export const mockStudents: Student[] = [
  // Génie Logiciel (GL)
  { id: 'STD-GL1-001', name: 'Amine El Mansouri', email: 'amine.mansouri@miage.edu', phone: '+212 661-111111', program: 'Génie Logiciel', year: 1, status: 'Active', gpa: 15.2 },
  { id: 'STD-GL1-002', name: 'Sara Idrissi', email: 'sara.idrissi@miage.edu', phone: '+212 661-111112', program: 'Génie Logiciel', year: 1, status: 'Active', gpa: 14.8 },
  { id: 'STD-GL1-003', name: 'Reda Berrada', email: 'reda.berrada@miage.edu', phone: '+212 661-111113', program: 'Génie Logiciel', year: 1, status: 'Active', gpa: 16.0 },
  { id: 'STD-GL2-001', name: 'Hamza Filali', email: 'hamza.filali@miage.edu', phone: '+212 661-234567', program: 'Génie Logiciel', year: 2, status: 'Active', gpa: 16.5 },
  { id: 'STD-GL2-002', name: 'Fatima Zahra Alaoui', email: 'fatima.alaoui@miage.edu', phone: '+212 661-222222', program: 'Génie Logiciel', year: 2, status: 'Active', gpa: 15.5 },
  { id: 'STD-GL2-003', name: 'Youssef Rachidi', email: 'youssef.rachidi@miage.edu', phone: '+212 661-222223', program: 'Génie Logiciel', year: 2, status: 'Active', gpa: 13.9 },
  { id: 'STD-GL3-001', name: 'Salma Tazi', email: 'salma.tazi@miage.edu', phone: '+212 661-333331', program: 'Génie Logiciel', year: 3, status: 'Active', gpa: 17.2 },
  { id: 'STD-GL3-002', name: 'Omar Fassi', email: 'omar.fassi@miage.edu', phone: '+212 661-333332', program: 'Génie Logiciel', year: 3, status: 'Active', gpa: 15.8 },
  { id: 'STD-GL3-003', name: 'Meryem Bennani', email: 'meryem.bennani@miage.edu', phone: '+212 661-333333', program: 'Génie Logiciel', year: 3, status: 'Active', gpa: 16.1 },
  // Systèmes & Réseaux (SR)
  { id: 'STD-SR1-001', name: 'Yassine Kadiri', email: 'yassine.kadiri@miage.edu', phone: '+212 661-444441', program: 'Systèmes & Réseaux', year: 1, status: 'Active', gpa: 14.5 },
  { id: 'STD-SR1-002', name: 'Nora El Amri', email: 'nora.amri@miage.edu', phone: '+212 661-444442', program: 'Systèmes & Réseaux', year: 1, status: 'Active', gpa: 13.5 },
  { id: 'STD-SR1-003', name: 'Mehdi Slaoui', email: 'mehdi.slaoui@miage.edu', phone: '+212 661-444443', program: 'Systèmes & Réseaux', year: 1, status: 'Active', gpa: 15.0 },
  { id: 'STD-SR2-001', name: 'Zineb Mouline', email: 'zineb.mouline@miage.edu', phone: '+212 661-555551', program: 'Systèmes & Réseaux', year: 2, status: 'Active', gpa: 14.2 },
  { id: 'STD-SR2-002', name: 'Adam Chraibi', email: 'adam.chraibi@miage.edu', phone: '+212 661-555552', program: 'Systèmes & Réseaux', year: 2, status: 'Active', gpa: 13.8 },
  { id: 'STD-SR2-003', name: 'Ines Skalli', email: 'ines.skalli@miage.edu', phone: '+212 661-555553', program: 'Systèmes & Réseaux', year: 2, status: 'Active', gpa: 15.5 },
  { id: 'STD-SR3-001', name: 'Tarek Bouabid', email: 'tarek.bouabid@miage.edu', phone: '+212 661-666661', program: 'Systèmes & Réseaux', year: 3, status: 'Active', gpa: 16.0 },
  { id: 'STD-SR3-002', name: 'Hajar El Fassi', email: 'hajar.fassi@miage.edu', phone: '+212 661-666662', program: 'Systèmes & Réseaux', year: 3, status: 'Active', gpa: 14.9 },
  { id: 'STD-SR3-003', name: 'Karim Guessous', email: 'karim.guessous@miage.edu', phone: '+212 661-666663', program: 'Systèmes & Réseaux', year: 3, status: 'Active', gpa: 15.2 },
  // Management des Systèmes d'Information (MSI)
  { id: 'STD-MSI1-001', name: 'Amal Berraf', email: 'amal.berraf@miage.edu', phone: '+212 661-777771', program: 'Management des Systèmes d\'Information', year: 1, status: 'Active', gpa: 14.1 },
  { id: 'STD-MSI1-002', name: 'Hicham Lahlou', email: 'hicham.lahlou@miage.edu', phone: '+212 661-777772', program: 'Management des Systèmes d\'Information', year: 1, status: 'Active', gpa: 13.2 },
  { id: 'STD-MSI1-003', name: 'Sofia Dlimi', email: 'sofia.dlimi@miage.edu', phone: '+212 661-777773', program: 'Management des Systèmes d\'Information', year: 1, status: 'Active', gpa: 15.8 },
  { id: 'STD-MSI2-001', name: 'Jad Mansouri', email: 'jad.mansouri@miage.edu', phone: '+212 661-888881', program: 'Management des Systèmes d\'Information', year: 2, status: 'Active', gpa: 14.7 },
  { id: 'STD-MSI2-002', name: 'Keniza Berrada', email: 'keniza.berrada@miage.edu', phone: '+212 661-888882', program: 'Management des Systèmes d\'Information', year: 2, status: 'Active', gpa: 13.9 },
  { id: 'STD-MSI2-003', name: 'Rayan El Ouardi', email: 'rayan.ouardi@miage.edu', phone: '+212 661-888883', program: 'Management des Systèmes d\'Information', year: 2, status: 'Active', gpa: 15.5 },
  { id: 'STD-MSI3-001', name: 'Nadia El Ghali', email: 'nadia.ghali@miage.edu', phone: '+212 661-999991', program: 'Management des Systèmes d\'Information', year: 3, status: 'Active', gpa: 16.2 },
  { id: 'STD-MSI3-002', name: 'Younes Meziane', email: 'younes.meziane@miage.edu', phone: '+212 661-999992', program: 'Management des Systèmes d\'Information', year: 3, status: 'Active', gpa: 14.8 },
  { id: 'STD-MSI3-003', name: 'Lina Bensaid', email: 'lina.bensaid@miage.edu', phone: '+212 661-999993', program: 'Management des Systèmes d\'Information', year: 3, status: 'Active', gpa: 15.0 },
  // Audit & Contrôle de Gestion (ACG)
  { id: 'STD-ACG1-001', name: 'Imane Sefrioui', email: 'imane.sefrioui@miage.edu', phone: '+212 661-000011', program: 'Audit & Contrôle de Gestion', year: 1, status: 'Active', gpa: 14.3 },
  { id: 'STD-ACG1-002', name: 'Khalid Belghiti', email: 'khalid.belghiti@miage.edu', phone: '+212 661-000012', program: 'Audit & Contrôle de Gestion', year: 1, status: 'Active', gpa: 13.5 },
  { id: 'STD-ACG1-003', name: 'Wiam El Houari', email: 'wiam.houari@miage.edu', phone: '+212 661-000013', program: 'Audit & Contrôle de Gestion', year: 1, status: 'Active', gpa: 15.1 },
  { id: 'STD-ACG2-001', name: 'Anas Skalli', email: 'anas.skalli@miage.edu', phone: '+212 661-000021', program: 'Audit & Contrôle de Gestion', year: 2, status: 'Active', gpa: 14.0 },
  { id: 'STD-ACG2-002', name: 'Rania El Amri', email: 'rania.amri@miage.edu', phone: '+212 661-000022', program: 'Audit & Contrôle de Gestion', year: 2, status: 'Active', gpa: 14.6 },
  { id: 'STD-ACG2-003', name: 'Soufiane Drissi', email: 'soufiane.drissi@miage.edu', phone: '+212 661-000023', program: 'Audit & Contrôle de Gestion', year: 2, status: 'Active', gpa: 13.7 },
  { id: 'STD-ACG3-001', name: 'Salma El Fassi', email: 'salma.fassi@miage.edu', phone: '+212 661-000031', program: 'Audit & Contrôle de Gestion', year: 3, status: 'Active', gpa: 16.5 },
  { id: 'STD-ACG3-002', name: 'Yassine Mernissi', email: 'yassine.mernissi@miage.edu', phone: '+212 661-000032', program: 'Audit & Contrôle de Gestion', year: 3, status: 'Active', gpa: 15.4 },
  { id: 'STD-ACG3-003', name: 'Zineb Mansouri', email: 'zineb.mansouri@miage.edu', phone: '+212 661-000033', program: 'Audit & Contrôle de Gestion', year: 3, status: 'Active', gpa: 15.8 },
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
