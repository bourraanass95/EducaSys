const fs = require('fs');
let code = fs.readFileSync('src/components/SuperAdminDashboard.tsx', 'utf-8');

// Add states
code = code.replace(
  "const [showRequestEditModal, setShowRequestEditModal] = useState(false);",
  "const [showRequestEditModal, setShowRequestEditModal] = useState(false);\n  const [confirmDialog, setConfirmDialog] = useState<{message: string, onConfirm: () => void} | null>(null);\n  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);\n  const showToast = (message: string, type: 'success' | 'error' = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 3000); };"
);

// Add UI at the end
code = code.replace(
  "</AnimatePresence>\n    </div>",
  `</AnimatePresence>
      <AnimatePresence>
        {confirmDialog && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-[32px] shadow-2xl p-8 max-w-sm w-full text-center">
               <h3 className="text-xl font-black mb-4 uppercase italic">Confirmation</h3>
               <p className="text-gray-500 font-medium mb-8 text-sm">{confirmDialog.message}</p>
               <div className="flex gap-4">
                 <button onClick={() => setConfirmDialog(null)} className="flex-1 py-4 bg-gray-100 rounded-2xl font-black uppercase italic text-xs hover:bg-gray-200">Annuler</button>
                 <button onClick={() => { confirmDialog.onConfirm(); setConfirmDialog(null); }} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase italic text-xs hover:bg-blue-700 shadow-xl shadow-blue-200">Confirmer</button>
               </div>
             </motion.div>
          </div>
        )}
        {toast && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className={\`fixed bottom-8 right-8 px-6 py-4 rounded-2xl shadow-2xl z-[200] font-black uppercase italic text-xs text-white \${toast.type === 'error' ? 'bg-rose-500 shadow-rose-200' : 'bg-emerald-500 shadow-emerald-200'}\`}>
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>`
);

// Replace simple alerts and confirms
code = code.replace(/alert\("Seul un Administrateur Global peut gérer les autres admins."\);/g, "showToast('Seul un Administrateur Global peut gérer les autres admins.', 'error');");
code = code.replace(/alert\('Administrateur supprimé'\);/g, "showToast('Administrateur supprimé', 'success');");
code = code.replace(/alert\('Erreur lors de la suppression de l\\'administrateur'\);/g, "showToast('Erreur lors de la suppression de l\\'administrateur', 'error');");
code = code.replace(/alert\('Paiement supprimé de l\\'historique'\);/g, "showToast('Paiement supprimé de l\\'historique', 'success');");
code = code.replace(/alert\('Erreur lors de la suppression du paiement'\);/g, "showToast('Erreur lors de la suppression du paiement', 'error');");
code = code.replace(/alert\('Instance restaurée avec succès'\);/g, "showToast('Instance restaurée avec succès', 'success');");
code = code.replace(/alert\('Erreur lors de la restauration de l\\'instance'\);/g, "showToast('Erreur lors de la restauration de l\\'instance', 'error');");
code = code.replace(/alert\('Établissement supprimé définitivement'\);/g, "showToast('Établissement supprimé définitivement', 'success');");
code = code.replace(/alert\('Erreur lors de la suppression définitive'\);/g, "showToast('Erreur lors de la suppression définitive', 'error');");
code = code.replace(/alert\('Demande restaurée'\);/g, "showToast('Demande restaurée', 'success');");
code = code.replace(/alert\('Erreur lors de la restauration de la demande'\);/g, "showToast('Erreur lors de la restauration de la demande', 'error');");
code = code.replace(/alert\('Demande supprimée définitivement'\);/g, "showToast('Demande supprimée définitivement', 'success');");
code = code.replace(/alert\("Seul le Super Admin principal peut supprimer des établissements."\);/g, "showToast('Seul le Super Admin principal peut supprimer des établissements.', 'error');");
code = code.replace(/alert\('Instance mise en corbeille \\(Historique\\)'\);/g, "showToast('Instance mise en corbeille (Historique)', 'success');");
code = code.replace(/alert\('Erreur lors de la suppression'\);/g, "showToast('Erreur lors de la suppression', 'error');");
code = code.replace(/alert\('Erreur lors de la gestion de l\\'admin'\);/g, "showToast('Erreur lors de la gestion de l\\'admin', 'error');");
code = code.replace(/alert\('Erreur lors de la gestion de l\\'instance'\);/g, "showToast('Erreur lors de la gestion de l\\'instance', 'error');");
code = code.replace(/alert\('Base de données réinitialisée. Rechargez la page.'\);/g, "showToast('Base de données réinitialisée. Rechargez la page.', 'success');");
code = code.replace(/alert\('Erreur lors de la réinitialisation'\);/g, "showToast('Erreur lors de la réinitialisation', 'error');");
code = code.replace(/alert\('Erreur lors de la mise à jour du paiement'\);/g, "showToast('Erreur lors de la mise à jour du paiement', 'error');");
code = code.replace(/alert\('Erreur lors du chargement des infos admin'\);/g, "showToast('Erreur lors du chargement des infos admin', 'error');");
code = code.replace(/alert\('Erreur lors de la mise à jour de la demande'\);/g, "showToast('Erreur lors de la mise à jour de la demande', 'error');");
code = code.replace(/alert\("Seul le Super Admin principal peut réinitialiser le système."\);/g, "showToast('Seul le Super Admin principal peut réinitialiser le système.', 'error');");

// Replacing window.confirm blocks
const replaceConfirm = (regex, message) => {
  // We match the specific if block and rewrite it
  // Example for handleDeleteAdmin
};

// Instead of complex regex for window.confirm, let's just do it manually with multi_edit for safety
fs.writeFileSync('src/components/SuperAdminDashboard.tsx', code);
