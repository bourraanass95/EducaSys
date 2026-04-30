const BASE_URL = '/api';

export interface AdminStats {
  totalStudents: number;
  activeTeachers: number;
  revenueThisMonth: number;
}

export interface StaffMember {
  id: string;
  identifiant?: string;
  name: string;
  subject: string;
  email: string;
  phone: string;
  type: string;
  salary?: string;
  paymentType?: string;
  hourlyRate?: string;
  nationality?: string;
  moduleIds?: string[];
}

export interface Invoice {
  id: string;
  studentName: string;
  amount: number;
  createdAt?: string;
  status: string;
}

export const api = {
  async login(identifiant: string, password: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifiant, password })
    });
    
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Server returned non-JSON response:', text);
      throw new Error('Le serveur a renvoyé une réponse invalide (non-JSON). Vérifiez la configuration du serveur.');
    }
    
    if (!res.ok) throw new Error(data.error || 'Failed to login');
    return data.user;
  },

  async getDashboardStats(schoolId?: string): Promise<AdminStats> {
    const url = schoolId ? `${BASE_URL}/stats?schoolId=${schoolId}` : `${BASE_URL}/stats`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  async getStudents(schoolId?: string): Promise<any[]> {
    const url = schoolId ? `${BASE_URL}/users?schoolId=${schoolId}` : `${BASE_URL}/users`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch users');
    const users = await res.json();
    return users.filter((u: any) => u.role === 'Student');
  },

  async addStudent(student: any, schoolId: string): Promise<string> {
    const res = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...student, role: 'Student', schoolId })
    });
    if (!res.ok) throw new Error('Failed to add student');
    const data = await res.json();
    return data.id;
  },

  async updateStudent(id: string, data: any): Promise<void> {
    const res = await fetch(`${BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update student');
  },

  async deleteStudent(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/users/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete student');
  },

  async getFilieres(schoolId?: string): Promise<any[]> {
    const url = schoolId ? `${BASE_URL}/filieres?schoolId=${schoolId}` : `${BASE_URL}/filieres`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch filieres');
    return res.json();
  },

  async addFiliere(filiere: any, schoolId: string): Promise<string> {
    const res = await fetch(`${BASE_URL}/filieres`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...filiere, schoolId })
    });
    const data = await res.json();
    return data.id;
  },

  async updateFiliere(id: string, data: any): Promise<void> {
    await fetch(`${BASE_URL}/filieres/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  async deleteFiliere(id: string): Promise<void> {
    await fetch(`${BASE_URL}/filieres/${id}`, { method: 'DELETE' });
  },

  async getStaff(schoolId?: string): Promise<StaffMember[]> {
    const url = schoolId ? `${BASE_URL}/staff?schoolId=${schoolId}` : `${BASE_URL}/staff`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch staff');
    return res.json();
  },

  async addStaff(member: Omit<StaffMember, 'id'>, schoolId: string): Promise<string> {
    const res = await fetch(`${BASE_URL}/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...member, schoolId })
    });
    if (!res.ok) throw new Error('Failed to add staff');
    const data = await res.json();
    return data.id;
  },

  async updateStaff(id: string, data: Partial<StaffMember>): Promise<void> {
    const res = await fetch(`${BASE_URL}/staff/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update staff');
  },

  async deleteStaff(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/staff/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete staff');
  },

  async getInvoices(schoolId?: string): Promise<Invoice[]> {
    const url = schoolId ? `${BASE_URL}/invoices?schoolId=${schoolId}` : `${BASE_URL}/invoices`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch invoices');
    return res.json();
  },

  async addInvoice(invoice: any, schoolId: string): Promise<string> {
    const res = await fetch(`${BASE_URL}/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...invoice, schoolId })
    });
    if (!res.ok) throw new Error('Failed to add invoice');
    const data = await res.json();
    return data.id;
  },

  async updateInvoice(id: string, data: any): Promise<void> {
    const res = await fetch(`${BASE_URL}/invoices/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update invoice');
  },

  async deleteInvoice(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/invoices/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete invoice');
  },

  async getGenericCollection(colName: string, schoolId?: string): Promise<any[]> {
    const url = schoolId ? `${BASE_URL}/${colName}?schoolId=${schoolId}` : `${BASE_URL}/${colName}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch ${colName}`);
    return res.json();
  },

  async getSchoolBySubdomain(subdomain: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/schools/by-subdomain/${subdomain}`);
    if (!res.ok) throw new Error('School not found');
    return res.json();
  },

  async addGeneric(colName: string, data: any): Promise<string> {
    const res = await fetch(`${BASE_URL}/${colName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`Failed to create in ${colName}`);
    const result = await res.json();
    return result.id;
  },

  async updateGeneric(colName: string, id: string, data: any): Promise<void> {
    const res = await fetch(`${BASE_URL}/${colName}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`Failed to update in ${colName}`);
  },

  async deleteGeneric(colName: string, id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/${colName}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Failed to delete in ${colName}`);
  },

  async testConnection() {
    return true;
  },

  async seedDataIfEmpty() {
    // Relying on hardcoded seeds in server.ts
  }
};
