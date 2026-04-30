import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  setDoc,
  getDoc,
  deleteDoc, 
  doc, 
  query, 
  where,
  limit
} from 'firebase/firestore';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting MIAGE Nexus ERP Backend...');

// Firebase configuration is handled inside startServer to remain robust
// during serverless initialization.

// Initialize Firebase Client SDK
let firebaseApp: any;
let db: any;

function getDb() {
  if (db) return db;
  
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  let config;
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } else {
    config = {
      apiKey: process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.VITE_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID,
      firestoreDatabaseId: process.env.VITE_FIREBASE_DATABASE_ID || process.env.FIREBASE_DATABASE_ID || '(default)'
    };
  }
  
  if (!getApps().length) {
    if (!config.apiKey) {
      console.warn('⚠️ Firebase API Key missing in environment.');
    }
    firebaseApp = initializeApp(config);
  } else {
    firebaseApp = getApp();
  }
  
  db = getFirestore(firebaseApp, config.firestoreDatabaseId || '(default)');
  console.log(`Firebase Initialized for project: ${config.projectId}`);
  return db;
}

async function wipeAllData() {
  const database = getDb();
  console.log('🧹 Wiping all data from database...');
  const collectionsToWipe = ['users', 'filieres', 'staff', 'invoices', 'structures', 'schedules', 'attendance', 'audit_logs', 'schools', 'notifications', 'internships', 'books'];
  try {
    for (const colName of collectionsToWipe) {
      const snapshot = await getDocs(collection(database, colName));
      for (const docSnap of snapshot.docs) {
        await deleteDoc(doc(database, colName, docSnap.id));
      }
      console.log(`✅ Cleared collection: ${colName}`);
    }
    console.log('✅ All data wiped successfully!');
    await populateInitialData();
  } catch (err) {
    console.error('❌ Wipe failed:', err);
  }
}

async function populateInitialData() {
  const database = getDb();
  const usersSnap = await getDocs(query(collection(database, 'users'), where('email', '==', 'anassbourra.1995@gmail.com')));
  if (!usersSnap.empty) return;

  console.log('🌱 Populating initial SaaS data (Super Admin Only)...');
  
  // Global Super Admin
  await addDoc(collection(database, 'users'), {
    email: 'anassbourra.1995@gmail.com',
    password: 'admin',
    name: 'Anass Bourra',
    role: 'Admin',
    isSuperAdmin: true,
    createdAt: new Date().toISOString()
  });

  console.log('✅ Initial data populated!');
}

async function createExpressApp() {
  console.log('🚀 Starting Nexus ERP server...');
  
  // Start population in background so we don't block server startup
  populateInitialData().catch(err => console.error('❌ Background population failed:', err));
  
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  
  // Disable caching for API responses to prevent stale data
  app.use('/api', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  // Health check
  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
  
  // Endpoint to wipe all data
  app.post('/api/wipe-database', async (req, res) => {
    await wipeAllData();
    res.json({ success: true, message: 'Database wiped' });
  });

  // Login endpoint - Email or ID based
  app.post('/api/login', async (req, res) => {
    let { identifiant, password } = req.body;
    if (!identifiant || !password) {
      return res.status(400).json({ error: 'Identifiant et mot de passe requis' });
    }

    identifiant = identifiant.trim();
    password = password.trim();
    const identifiantLower = identifiant.toLowerCase();
    
    console.log(`Login attempt: "${identifiant}"`);
    
    try {
      // 1. Try "users" collection (Primary) - Search by email first
      const qEmail = query(collection(getDb(), 'users'), where('email', '==', identifiantLower), limit(1));
      const usersSnapEmail = await getDocs(qEmail);
      
      let docUser = usersSnapEmail.docs[0];
      
      // If not found by email, try by identifiant
      if (!docUser) {
        const qIdent = query(collection(getDb(), 'users'), where('identifiant', '==', identifiant), limit(1));
        const usersSnapIdent = await getDocs(qIdent);
        docUser = usersSnapIdent.docs[0];
      }
      
      if (docUser) {
        const userData = docUser.data() as any;

        if (userData.password !== password) {
          console.log('Password mismatch for user in "users"');
          return res.status(401).json({ error: 'Identifiants invalides' });
        }

        console.log('User authenticated from "users" collection');
        let schoolData = null;
        if (userData.schoolId) {
          const sSnap = await getDoc(doc(getDb(), 'schools', userData.schoolId));
          if (sSnap.exists()) schoolData = sSnap.id; // Just store ID for reference if needed
        }
        
        const role = userData.role || 'Student';
        const isSuperAdmin = userData.isSuperAdmin || false;

        if (!isSuperAdmin && role !== 'Admin' && role !== 'Staff' && role !== 'Student') {
          return res.status(403).json({ error: 'Accès réservé à l\'administration, au personnel et aux étudiants.' });
        }
        
        return res.json({ 
          success: true, 
          user: { 
            id: docUser.id, 
            ...userData, 
            role,
            isSuperAdmin,
            collection: 'users'
          } 
        });
      }
      
      // 2. Try "staff" collection
      const qStaffEmail = query(collection(getDb(), 'staff'), where('email', '==', identifiantLower), limit(1));
      const staffSnapEmail = await getDocs(qStaffEmail);
      
      let docStaff = staffSnapEmail.docs[0];
      
      if (!docStaff) {
        const qStaffIdent = query(collection(getDb(), 'staff'), where('identifiant', '==', identifiant), limit(1));
        const staffSnapIdent = await getDocs(qStaffIdent);
        docStaff = staffSnapIdent.docs[0];
      }
      
      if (docStaff) {
        const staffData = docStaff.data() as any;

        if (staffData.password !== password) {
          console.log('Password mismatch for staff in "staff"');
          return res.status(401).json({ error: 'Identifiants invalides' });
        }

        console.log('User authenticated from "staff" collection');
        let role = staffData.subject || 'Teacher';
        if (role === 'Administration' || role === 'Personnel (Staff)') role = 'Staff';
        if (role === 'Enseignant (Teacher)' || role === 'Teacher' || role === 'Professeur' || role === 'Enseignant') role = 'Teacher';
        if (role === 'Administrateur (Admin)' || role === 'Admin') role = 'Admin';
        
        return res.json({ 
          success: true, 
          user: { 
            id: docStaff.id, 
            ...staffData, 
            role,
            collection: 'staff'
          } 
        });
      }

      console.log('No user found matching credentials');
      res.status(401).json({ error: 'Identifiants invalides' });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error during login' });
    }
  });

  // Dashboard Stats
  app.get('/api/stats', async (req, res) => {
    const schoolId = req.query.schoolId as string;
    try {
      let uQuery, sQuery, iQuery;
      
      if (schoolId) {
        uQuery = query(collection(getDb(), 'users'), where('schoolId', '==', schoolId), where('role', '==', 'Student'));
        sQuery = query(collection(getDb(), 'staff'), where('schoolId', '==', schoolId));
        iQuery = query(collection(getDb(), 'invoices'), where('schoolId', '==', schoolId), where('status', '==', 'Paid'));
      } else {
        uQuery = query(collection(getDb(), 'users'), where('role', '==', 'Student'));
        sQuery = collection(getDb(), 'staff');
        iQuery = query(collection(getDb(), 'invoices'), where('status', '==', 'Paid'));
      }

      const [uSnap, sSnap, iSnap] = await Promise.all([
        getDocs(uQuery),
        getDocs(sQuery),
        getDocs(iQuery)
      ]);

      const studentCount = uSnap.size;
      const teacherCount = sSnap.size;
      const totalRevenue = iSnap.docs.reduce((sum, d) => sum + Number((d.data() as any).amount || 0), 0);

      res.json({
        totalStudents: studentCount,
        activeTeachers: teacherCount,
        revenueThisMonth: totalRevenue,
      });
    } catch (error: any) {
      console.error('Stats error:', error);
      res.json({
        totalStudents: 0,
        activeTeachers: 0,
        revenueThisMonth: 0,
        error: 'Error fetching stats'
      });
    }
  });

  // Generic CRUD with multi-tenant filtering
  app.get('/api/schools/by-subdomain/:subdomain', async (req, res) => {
    try {
      const q = query(collection(getDb(), 'schools'), where('subdomain', '==', req.params.subdomain), limit(1));
      const snap = await getDocs(q);
      if (snap.empty) return res.status(404).json({ error: 'School not found' });
      const school = snap.docs[0];
      res.json({ id: school.id, ...school.data() });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch school' });
    }
  });

  app.get('/api/:collection', async (req, res) => {
    const { schoolId } = req.query;
    try {
      const colName = req.params.collection;
      let q;
      
      if (schoolId && colName !== 'schools') {
        q = query(collection(getDb(), colName), where('schoolId', '==', schoolId));
      } else {
        q = collection(getDb(), colName);
      }
      
      const snap = await getDocs(q);
      const data = snap.docs.map(d => {
        const docData = d.data() as any;
        return { ...docData, originalId: docData.id, id: d.id }; 
      });
      res.json(data);
    } catch (error) {
      console.error(`Fetch error for ${req.params.collection}:`, error);
      res.status(500).json({ error: 'Failed to fetch' });
    }
  });

  app.post('/api/:collection', async (req, res) => {
    try {
      const { id, ...data } = req.body;
      if (id) {
        // Use setDoc to preserve ID (useful for restoration)
        await setDoc(doc(getDb(), req.params.collection, id), {
          ...data,
          updatedAt: new Date().toISOString()
        });
        res.status(201).json({ id, ...data });
      } else {
        const docRef = await addDoc(collection(getDb(), req.params.collection), {
          ...data,
          createdAt: new Date().toISOString()
        });
        res.status(201).json({ id: docRef.id, ...data });
      }
    } catch (error) {
      console.error('Create error:', error);
      res.status(500).json({ error: 'Failed to create' });
    }
  });

  app.put('/api/:collection/:id', async (req, res) => {
    try {
      const dRef = doc(getDb(), req.params.collection, req.params.id);
      await setDoc(dRef, { ...req.body, updatedAt: new Date().toISOString() }, { merge: true });
      res.json({ id: req.params.id, ...req.body });
    } catch (error) {
      console.error('PUT error:', error);
      res.status(500).json({ error: 'Failed to update' });
    }
  });

  app.patch('/api/:collection/:id', async (req, res) => {
    try {
      console.log('PATCH request:', req.params.collection, req.params.id, Object.keys(req.body));
      const dRef = doc(getDb(), req.params.collection, req.params.id);
      await setDoc(dRef, { ...req.body, updatedAt: new Date().toISOString() }, { merge: true });
      res.json({ id: req.params.id, ...req.body });
    } catch (error) {
      console.error('PATCH error:', error);
      res.status(500).json({ error: 'Failed to patch' });
    }
  });

  app.delete('/api/:collection/:id', async (req, res) => {
    try {
      const { collection: colName, id } = req.params;
      console.log(`DELETE request: collection=${colName}, id=${id}`);
      
      const dRef = doc(getDb(), colName, id);
      
      await deleteDoc(dRef);
      console.log(`✅ DELETE successful for ${colName}/${id}`);

      // Cascade delete if it's a school
      if (colName === 'schools') {
        console.log(`Performing cascade delete for school ${id}...`);
        const subColls = ['users', 'staff', 'invoices', 'filieres', 'structures', 'schedules', 'attendance', 'notifications', 'internships'];
        try {
          for (const sub of subColls) {
            const snap = await getDocs(query(collection(getDb(), sub), where('schoolId', '==', id)));
            for (const docSnap of snap.docs) {
              await deleteDoc(doc(getDb(), sub, docSnap.id));
            }
          }
          console.log(`✅ Cascade delete completed for school ${id}`);
        } catch (e) {
          console.error("Cascade delete error:", e);
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({ error: 'Failed to delete' });
    }
  });

  // Vite
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  return app;
}

const appPromise = createExpressApp();

export default async (req: any, res: any) => {
  try {
    const app = await appPromise;
    return app(req, res);
  } catch (error: any) {
    console.error('CRITICAL: Server initialization failed:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'The server failed to start. Please check logs.',
        details: error.message
      });
    }
  }
};

// Local dev server
if (process.env.NODE_ENV !== 'production') {
  const PORT = Number(process.env.PORT) || 3000;
  appPromise.then(app => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Dev server running on http://localhost:${PORT}`);
    });
  });
}
