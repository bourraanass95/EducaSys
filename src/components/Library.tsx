import React from 'react';
import { 
  Library, 
  Search, 
  BookOpen, 
  Book, 
  Clock, 
  ChevronRight, 
  CheckCircle2, 
  ExternalLink,
  Plus,
  Download
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export const LibraryManagement = () => {
  const books = [
    { id: 1, title: 'Clean Architecture', author: 'Robert C. Martin', cat: 'Software Engineering', status: 'Available' },
    { id: 2, title: 'Java: The Complete Reference', author: 'Herbert Schildt', cat: 'Programming', status: 'Borrowed' },
    { id: 3, title: 'Network Security Essential', author: 'William Stallings', cat: 'Cybersecurity', status: 'Available' },
    { id: 4, title: 'The Lean Startup', author: 'Eric Ries', cat: 'Entrepreneurship', status: 'Available' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bibliothèque & Ressources Digitales</h1>
          <p className="text-gray-500">Consultez le catalogue physique et accédez aux ressources pédagogiques en ligne.</p>
        </div>
        <div className="flex gap-2">
           <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 uppercase text-[10px] tracking-widest">
             <Plus className="w-4 h-4" /> Ajouter Livre
           </button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-[32px] border border-gray-100 shadow-sm mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Titre, Auteur, ISBN ou Catégorie..."
            className="w-full pl-14 pr-4 py-4 bg-gray-50/50 border-transparent focus:bg-white focus:border-blue-500 rounded-[24px] text-sm transition-all outline-none font-medium italic"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {books.map((book, index) => (
           <motion.div 
             key={book.id}
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: index * 0.1 }}
             className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm group hover:border-blue-600 transition-all relative overflow-hidden"
           >
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                    <BookOpen className="w-4 h-4" />
                 </button>
              </div>
              <div className="flex items-start gap-4 mb-6">
                 <div className="w-14 h-20 bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-300 relative group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                    <Book className="w-6 h-6" />
                 </div>
                 <div className="flex-1 pr-8">
                    <h3 className="text-sm font-black italic text-gray-900 group-hover:text-blue-600 transition-colors leading-snug">{book.title}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mt-1">{book.author}</p>
                 </div>
              </div>
              <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                 <span className={cn(
                   "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                   book.status === 'Available' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                 )}>
                    {book.status === 'Available' ? 'Disponible' : 'Emprunté'}
                 </span>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{book.cat}</p>
              </div>
           </motion.div>
         ))}
      </div>

      <div className="mt-12 bg-gray-900 rounded-[40px] p-10 text-white relative overflow-hidden">
         <Download className="absolute -right-10 -bottom-10 w-48 h-48 opacity-10" />
         <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl font-black italic mb-4 tracking-tighter uppercase">Espace Ressources Digitales</h2>
            <p className="text-sm opacity-60 leading-relaxed mb-8">Accédez instantanément à plus de 500 supports de cours, examens blancs, et tutoriels vidéo exclusifs pour les étudiants de Groupe MIAGE.</p>
            <div className="grid grid-cols-2 gap-4">
               <button className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 hover:bg-white/10 transition-all text-left">
                  <div className="p-2 bg-blue-600 rounded-lg">
                     <Download className="w-4 h-4" />
                  </div>
                  <div>
                     <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Section</p>
                     <p className="text-xs font-black">Supports de Cours</p>
                  </div>
               </button>
               <button className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 hover:bg-white/10 transition-all text-left">
                  <div className="p-2 bg-purple-600 rounded-lg">
                     <ExternalLink className="w-4 h-4" />
                  </div>
                  <div>
                     <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400">Section</p>
                     <p className="text-xs font-black">Annales Examens</p>
                  </div>
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};
