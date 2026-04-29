import React, { useState, useMemo, useRef } from 'react';
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
  Download,
  Folder,
  FileText,
  File,
  FileBadge,
  MoreVertical,
  Trash2,
  Share2,
  FolderPlus,
  Upload,
  ArrowLeft,
  X,
  FileArchive,
  Image as ImageIcon,
  CheckSquare,
  Square,
  AlertTriangle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface LibraryItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId: string | null;
  size?: string;
  extension?: string;
  updatedAt: string;
  createdBy: string;
  url?: string;
}

const MOCK_ITEMS: LibraryItem[] = [
  { id: '1', name: 'Cours de Développement', type: 'folder', parentId: null, updatedAt: '2026-04-20', createdBy: 'Admin' },
  { id: '2', name: 'Examens Blancs 2025', type: 'folder', parentId: null, updatedAt: '2026-04-15', createdBy: 'Dir. Pédagogique' },
  { id: '3', name: 'Ressources Design UI/UX', type: 'folder', parentId: null, updatedAt: '2026-04-10', createdBy: 'Prof. S. Benali' },
  { id: '4', name: 'Algorithmique Avancée.pdf', type: 'file', parentId: '1', size: '2.4 MB', extension: 'pdf', updatedAt: '2026-04-21', createdBy: 'Admin' },
  { id: '5', name: 'Structure de Données.docx', type: 'file', parentId: '1', size: '1.1 MB', extension: 'docx', updatedAt: '2026-04-22', createdBy: 'Admin' },
  { id: '6', name: 'React Fundamentals.zip', type: 'file', parentId: '1', size: '45.8 MB', extension: 'zip', updatedAt: '2026-04-25', createdBy: 'Admin' },
  { id: '7', name: 'Mathématiques Discrtètes.pdf', type: 'file', parentId: '2', size: '3.1 MB', extension: 'pdf', updatedAt: '2026-04-16', createdBy: 'Admin' },
  { id: '8', name: 'Logos_Institutions.png', type: 'file', parentId: '3', size: '540 KB', extension: 'png', updatedAt: '2026-04-11', createdBy: 'Designer' },
];

export const LibraryManagement = () => {
  const [items, setItems] = useState<LibraryItem[]>(MOCK_ITEMS);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  // Selection & Deletion State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [itemToDelete, setItemToDelete] = useState<string[] | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Computed: Path for breadcrumbs
  const breadcrumbs = useMemo(() => {
    const path = [];
    let currentId = currentFolderId;
    while (currentId) {
      const folder = items.find(i => i.id === currentId);
      if (folder) {
        path.unshift(folder);
        currentId = folder.parentId;
      } else {
        break;
      }
    }
    return [{ id: null, name: 'Bibliothèque' }, ...path];
  }, [currentFolderId, items]);

  // Filtered items based on current folder and search
  const currentItems = useMemo(() => {
    if (searchQuery) {
      return items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return items.filter(item => item.parentId === currentFolderId);
  }, [items, currentFolderId, searchQuery]);

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const newFolder: LibraryItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: newFolderName,
      type: 'folder',
      parentId: currentFolderId,
      updatedAt: new Date().toISOString().split('T')[0],
      createdBy: 'Moi'
    };
    setItems([...items, newFolder]);
    setNewFolderName('');
    setShowNewFolderModal(false);
  };

  const confirmDelete = (ids: string[]) => {
    setItemToDelete(ids);
    setShowDeleteConfirm(true);
  };

  const executeDelete = () => {
    if (!itemToDelete) return;
    
    setItems(items.filter(item => {
      // Don't delete if it's one of the selected IDs
      if (itemToDelete.includes(item.id)) return false;
      
      // If it's a folder, also delete its contents (recursive check)
      let parent = item.parentId;
      while (parent) {
        if (itemToDelete.includes(parent)) return false;
        const parentObj = items.find(i => i.id === parent);
        parent = parentObj ? parentObj.parentId : null;
      }
      
      return true;
    }));
    
    setSelectedIds([]);
    setItemToDelete(null);
    setShowDeleteConfirm(false);
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === currentItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentItems.map(i => i.id));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: LibraryItem[] = Array.from(files).map(file => {
      const url = URL.createObjectURL(file);
      return {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: 'file',
        parentId: currentFolderId,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        extension: file.name.split('.').pop() || '',
        updatedAt: new Date().toISOString().split('T')[0],
        createdBy: 'Moi',
        url: url
      };
    });

    setItems(prev => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePreview = (item: LibraryItem) => {
    if (item.type === 'folder') {
      setCurrentFolderId(item.id);
      return;
    }

    if (!item.url) {
      alert("Ce fichier de démonstration n'a pas de contenu réel. Veuillez téléverser un fichier pour tester l'aperçu.");
      return;
    }

    const ext = item.extension?.toLowerCase();
    
    // PDF or Images: Open directly in browser
    if (ext === 'pdf' || ['png', 'jpg', 'jpeg', 'gif'].includes(ext || '')) {
      window.open(item.url, '_blank');
      return;
    }

    // Office Docs: Try online viewer if URL is public (Simulation)
    // Note: Google Docs Viewer won't work with local blob: URLs, 
    // so we fallback to opening the blob or downloading.
    if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext || '')) {
      // If it's a blob URL, we just open it and hope the browser/OS handles the associations
      window.open(item.url, '_blank');
    } else {
      // Fallback for other types
      window.open(item.url, '_blank');
    }
  };

  const handleDownload = (item: LibraryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!item.url) {
      // If it's mock data from MOCK_ITEMS without an actual URL, create a better simulation
      const blob = new Blob(["Contenu simulé pour: " + item.name], { type: "text/plain" });
      const mockUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = mockUrl;
      a.download = item.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = item.url;
    a.download = item.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getFileIcon = (item: LibraryItem) => {
    if (item.type === 'folder') return <Folder className="w-8 h-8 text-blue-500 fill-blue-50" />;
    switch (item.extension?.toLowerCase()) {
      case 'pdf': return <FileText className="w-8 h-8 text-rose-500" />;
      case 'docx':
      case 'doc': return <File className="w-8 h-8 text-blue-600" />;
      case 'zip':
      case 'rar': return <FileArchive className="w-8 h-8 text-orange-500" />;
      case 'png':
      case 'jpg':
      case 'jpeg': return <ImageIcon className="w-8 h-8 text-emerald-500" />;
      default: return <File className="w-8 h-8 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <input 
        type="file" 
        multiple 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileUpload}
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Library className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest italic">Ressources & Documentation</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">
            Espace <span className="text-blue-600">Digital</span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setShowNewFolderModal(true)}
            className="flex-1 md:flex-none px-6 py-3.5 bg-white border border-gray-100 rounded-2xl font-black uppercase italic text-[10px] tracking-widest text-gray-600 hover:text-blue-600 shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <FolderPlus className="w-4 h-4" /> Nouveau Dossier
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 md:flex-none px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase italic text-xs tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" /> Téléverser
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-[32px] border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-1 flex-1 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.id || 'root'}>
                {idx > 0 && <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />}
                <button 
                  onClick={() => { setCurrentFolderId(crumb.id); setSearchQuery(''); setSelectedIds([]); }}
                  className={cn(
                    "whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-black uppercase italic transition-all",
                    crumb.id === currentFolderId 
                      ? "bg-blue-50 text-blue-600" 
                      : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Rechercher une ressource..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-xs font-bold transition-all outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      </div>

      {/* Selection Action Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-blue-600 p-4 rounded-2xl shadow-xl flex items-center justify-between text-white"
          >
            <div className="flex items-center gap-4">
              <span className="text-xs font-black uppercase italic tracking-widest">{selectedIds.length} élément(s) sélectionné(s)</span>
              <button 
                onClick={() => setSelectedIds([])}
                className="text-[10px] font-bold uppercase underline underline-offset-4 hover:text-blue-200 transition-colors"
              >
                Désélectionner tout
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => confirmDelete(selectedIds)}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-black uppercase italic transition-all"
              >
                <Trash2 className="w-4 h-4" /> Supprimer la sélection
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between px-2">
        <button 
          onClick={toggleSelectAll}
          className="flex items-center gap-2 text-[10px] font-black uppercase italic text-gray-400 hover:text-blue-600 transition-colors"
        >
          {selectedIds.length === currentItems.length && currentItems.length > 0 ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
          {selectedIds.length === currentItems.length && currentItems.length > 0 ? 'Désélectionner tout' : 'Tout sélectionner'}
        </button>
        <span className="text-[10px] font-black uppercase italic text-gray-400">{currentItems.length} éléments dans ce dossier</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {currentItems.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key="empty-state"
              className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-gray-50/50 rounded-[40px] border-2 border-dashed border-gray-100"
            >
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Folder className="w-10 h-10 text-gray-200" />
              </div>
              <h3 className="text-xl font-black text-gray-900 italic tracking-tighter uppercase mb-2">Dossier Vide</h3>
              <p className="text-gray-400 text-sm font-medium italic">Commencez par ajouter des ressources ou créer un sous-dossier.</p>
            </motion.div>
          ) : (
            currentItems.map((item) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={cn(
                  "group relative bg-white p-6 rounded-[32px] border transition-all cursor-pointer",
                  selectedIds.includes(item.id) 
                    ? "border-blue-600 bg-blue-50/30 ring-2 ring-blue-100" 
                    : "border-gray-100 shadow-sm hover:border-blue-600 hover:shadow-xl hover:shadow-blue-500/5"
                )}
                onClick={() => handlePreview(item)}
              >
                <div className="flex items-start justify-between mb-8">
                  <div className={cn(
                    "p-4 rounded-2xl transition-all group-hover:scale-110",
                    item.type === 'folder' ? "bg-blue-50 text-blue-600" : "bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 shadow-inner"
                  )}>
                    {getFileIcon(item)}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => toggleSelect(item.id, e)}
                      className={cn(
                        "p-2 rounded-xl transition-all",
                        selectedIds.includes(item.id) ? "text-blue-600 bg-blue-100" : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                      )}
                    >
                      {selectedIds.includes(item.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); confirmDelete([item.id]); }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-black italic text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                    {item.name}
                  </h3>
                  <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-tight italic">
                    <span>{item.type === 'folder' ? 'Dossier' : item.size}</span>
                    <span>{item.updatedAt}</span>
                  </div>
                </div>

                {item.type === 'file' && (
                  <button 
                    onClick={(e) => handleDownload(item, e)}
                    className="absolute bottom-6 right-6 p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all hover:bg-blue-700"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="bg-gray-900 rounded-[40px] p-8 text-white relative overflow-hidden mt-12">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-2xl font-black italic mb-2 tracking-tighter uppercase">Cloud Académique</h2>
            <p className="text-xs opacity-60 italic font-medium">Infrastructure de stockage sécurisée. Vos données sont chiffrées de bout en bout.</p>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1 leading-none">Stockage utilisé</p>
              <p className="text-2xl font-black italic">{(items.filter(i => i.type === 'file').length * 2.4).toFixed(1)} <span className="text-xs opacity-50 uppercase">Mo</span></p>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1 leading-none">Fichiers</p>
              <p className="text-2xl font-black italic">{items.length}</p>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {/* New Folder Modal */}
        {showNewFolderModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewFolderModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-[32px] shadow-2xl z-[210] p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3 text-blue-600">
                  <FolderPlus className="w-5 h-5" />
                  <h3 className="text-xl font-black text-gray-900 tracking-tight italic uppercase">Nouveau Dossier</h3>
                </div>
                <button onClick={() => setShowNewFolderModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black italic text-gray-400 uppercase tracking-widest mb-2 block">Nom du dossier</label>
                  <input 
                    autoFocus
                    type="text" 
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="E.g. Cours de Mathématiques"
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-900 placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-blue-100"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                  />
                </div>
                <button 
                  onClick={handleCreateFolder}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase italic text-xs tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
                >
                  Confirmer la Création
                </button>
              </div>
            </motion.div>
          </>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-[32px] shadow-2xl z-[210] p-8"
            >
              <div className="flex items-center gap-4 mb-6 text-red-600">
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight italic uppercase">Confirmer suppression</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{itemToDelete?.length} élément(s) à supprimer</p>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-8">
                <p className="text-sm text-gray-600 font-medium italic leading-relaxed">
                  Êtes-vous sûr de vouloir supprimer ces éléments ? Cette action est irréversible et supprimera également tout le contenu des dossiers sélectionnés.
                </p>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase italic text-xs tracking-widest hover:bg-gray-200 transition-all"
                >
                  Annuler
                </button>
                <button 
                  onClick={executeDelete}
                  className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black uppercase italic text-xs tracking-widest shadow-xl shadow-red-200 hover:bg-red-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Supprimer
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};


