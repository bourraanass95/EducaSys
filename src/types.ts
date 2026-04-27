export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  program: string;
  year: number;
  status: 'Active' | 'On Leave' | 'Graduated';
  gpa: number;
}

export interface Alumnus {
  id: string;
  name: string;
  graduationYear: number;
  program: string;
  currentCompany: string;
  currentRole: string;
  linkedin?: string;
}

export interface Filiere {
  id: string;
  name: string;
  code: string;
  description: string;
  studentCount: number;
  coordinator: string;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Partial' | 'Unpaid';
  type: 'Tuition' | 'Exam';
}

export interface Course {
  id: string;
  name: string;
  teacher: string;
  time: string;
  room: string;
  day: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  courseId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late';
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  type: 'Full-time' | 'Contractor';
}

export interface Exam {
  id: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  type: 'Mid-term' | 'Final' | 'Quiz';
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Todo' | 'Doing' | 'Done';
}

export interface Ticket {
  id: string;
  subject: string;
  author: string;
  date: string;
  status: 'Open' | 'In Progress' | 'Closed';
}

export interface DashboardStats {
  activeStudents: number;
  alumniNetwork: number;
}

export type UserRole = 'Admin' | 'Staff' | 'Teacher' | 'Student';

export interface User {
  id: string;
  identifiant: string;
  name: string;
  role: UserRole;
  schoolId?: string;
  schoolName?: string;
  schoolSubdomain?: string;
  isSuperAdmin?: boolean;
}

export interface TeacherPortalData {
  id: string;
  name: string;
  schedule: Course[];
  assignedClasses: string[];
  pendingGrades: number;
}

export interface StudentPortalData {
  id: string;
  name: string;
  absences: number;
  averageGrade: number;
  unpaidFees: number;
  upcomingExams: Exam[];
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface Internship {
  id: string;
  companyName: string;
  role: string;
  location: string;
  status: 'Open' | 'Closed' | 'Applied';
  stipend?: string;
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  status: 'Available' | 'Borrowed' | 'Reserved';
  category: string;
}

export interface GradeEntry {
  id: string;
  studentId: string;
  subjectId: string;
  score: number;
  weight: number;
  type: 'CC' | 'Exam';
}
