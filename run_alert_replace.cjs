const fs = require('fs');
let code = fs.readFileSync('src/components/SuperAdminDashboard.tsx', 'utf-8');

// Replace alerts
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

// Replace window.confirm with setConfirmDialog
code = code.replace(
  /if \(window.confirm\('Supprimer cet administrateur \?'\)\) \{\n\s*try \{\n\s*await api.deleteGeneric\('users', id\);\n\s*showToast\('Administrateur supprimé', 'success'\);\n\s*loadData\(\);\n\s*\} catch \(e\) \{\n\s*console.error\(e\);\n\s*showToast\('Erreur lors de la suppression de l\\'administrateur', 'error'\);\n\s*\}\n\s*\}/g,
  `setConfirmDialog({
      message: 'Supprimer cet administrateur ?',
      onConfirm: async () => {
        try {
          await api.deleteGeneric('users', id);
          showToast('Administrateur supprimé', 'success');
          loadData();
        } catch (e) {
          console.error(e);
          showToast("Erreur lors de la suppression de l'administrateur", 'error');
        }
      }
    });`
);

code = code.replace(
  /if \(window.confirm\('Supprimer cet historique de paiement \?'\)\) \{\n\s*try \{\n\s*await api.deleteGeneric\('payment_history', id\);\n\s*showToast\('Paiement supprimé de l\\'historique', 'success'\);\n\s*loadData\(\);\n\s*\} catch \(e\) \{\n\s*console.error\(e\);\n\s*showToast\('Erreur lors de la suppression du paiement', 'error'\);\n\s*\}\n\s*\}/g,
  `setConfirmDialog({
      message: 'Supprimer cet historique de paiement ?',
      onConfirm: async () => {
        try {
          await api.deleteGeneric('payment_history', id);
          showToast("Paiement supprimé de l'historique", 'success');
          loadData();
        } catch (e) {
          console.error(e);
          showToast('Erreur lors de la suppression du paiement', 'error');
        }
      }
    });`
);

code = code.replace(
  /if \(window.confirm\(\`Restaurer l'instance \$\{school.name\} \?\`\)\) \{\n\s*try \{\n\s*const \{ deletedAt, deletedBy, \.\.\.originalData \} = school;\n\s*\/\/ The originalData already contains 'id', api\.addGeneric will use it\n\s*await api\.addGeneric\('schools', originalData\);\n\s*await api\.deleteGeneric\('deleted_schools', school.id\);\n\s*showToast\('Instance restaurée avec succès', 'success'\);\n\s*loadData\(\);\n\s*\} catch \(e\) \{\n\s*console\.error\(e\);\n\s*showToast\('Erreur lors de la restauration de l\\'instance', 'error'\);\n\s*\}\n\s*\}/g,
  `setConfirmDialog({
      message: \`Restaurer l'instance \${school.name} ?\`,
      onConfirm: async () => {
        try {
          const { deletedAt, deletedBy, ...originalData } = school;
          await api.addGeneric('schools', originalData);
          await api.deleteGeneric('deleted_schools', school.id);
          showToast('Instance restaurée avec succès', 'success');
          loadData();
        } catch (e) {
          console.error(e);
          showToast("Erreur lors de la restauration de l'instance", 'error');
        }
      }
    });`
);

code = code.replace(
  /if \(window.confirm\('Supprimer DÉFINITIVEMENT cette école de l\\'historique \? Cette action est irréversible.'\)\) \{\n\s*try \{\n\s*await api.deleteGeneric\('deleted_schools', id\);\n\s*showToast\('Établissement supprimé définitivement', 'success'\);\n\s*loadData\(\);\n\s*\} catch \(e\) \{\n\s*console.error\(e\);\n\s*showToast\('Erreur lors de la suppression définitive', 'error'\);\n\s*\}\n\s*\}/g,
  `setConfirmDialog({
      message: "Supprimer DÉFINITIVEMENT cette école de l'historique ? Cette action est irréversible.",
      onConfirm: async () => {
        try {
          await api.deleteGeneric('deleted_schools', id);
          showToast('Établissement supprimé définitivement', 'success');
          loadData();
        } catch (e) {
          console.error(e);
          showToast('Erreur lors de la suppression définitive', 'error');
        }
      }
    });`
);

code = code.replace(
  /if \(window.confirm\(\`Restaurer la demande de \$\{request\.name\} \?\`\)\) \{\n\s*try \{\n\s*const \{ deletedAt, deletedBy, \.\.\.originalData \} = request;\n\s*await api.addGeneric\('license_requests', originalData\);\n\s*await api.deleteGeneric\('deleted_requests', request.id\);\n\s*showToast\('Demande restaurée', 'success'\);\n\s*loadData\(\);\n\s*\} catch \(e\) \{\n\s*console.error\(e\);\n\s*showToast\('Erreur lors de la restauration de la demande', 'error'\);\n\s*\}\n\s*\}/g,
  `setConfirmDialog({
      message: \`Restaurer la demande de \${request.name} ?\`,
      onConfirm: async () => {
        try {
          const { deletedAt, deletedBy, ...originalData } = request;
          await api.addGeneric('license_requests', originalData);
          await api.deleteGeneric('deleted_requests', request.id);
          showToast('Demande restaurée', 'success');
          loadData();
        } catch (e) {
          console.error(e);
          showToast('Erreur lors de la restauration de la demande', 'error');
        }
      }
    });`
);

code = code.replace(
  /if \(window.confirm\('Supprimer DÉFINITIVEMENT cette demande de l\\'historique \?'\)\) \{\n\s*try \{\n\s*await api.deleteGeneric\('deleted_requests', id\);\n\s*showToast\('Demande supprimée définitivement', 'success'\);\n\s*loadData\(\);\n\s*\} catch \(e\) \{\n\s*console.error\(e\);\n\s*showToast\('Erreur lors de la suppression définitive', 'error'\);\n\s*\}\n\s*\}/g,
  `setConfirmDialog({
      message: 'Supprimer DÉFINITIVEMENT cette demande de l\\'historique ?',
      onConfirm: async () => {
        try {
          await api.deleteGeneric('deleted_requests', id);
          showToast('Demande supprimée définitivement', 'success');
          loadData();
        } catch (e) {
          console.error(e);
          showToast('Erreur lors de la suppression définitive', 'error');
        }
      }
    });`
);

// One remaining confirm
code = code.replace(
  /if \(confirm\('Supprimer cette demande \?'\)\) \{\n\s*try \{\n\s*await api\.deleteGeneric\('license_requests', req\.id\);\n\s*showToast\('Erreur lors de la suppression', 'error'\);\n\s*loadData\(\);\n\s*\} catch \(e\) \{\n\s*console\.error\(e\);\n\s*showToast\('Erreur lors de la suppression', 'error'\);\n\s*\}\n\s*\}/g,
  `setConfirmDialog({
                                     message: 'Supprimer cette demande ?',
                                     onConfirm: async () => {
                                       try {
                                         const deletedReq = { ...req, deletedAt: new Date().toISOString(), deletedBy: user?.email };
                                         await api.addGeneric('deleted_requests', deletedReq);
                                         await api.deleteGeneric('license_requests', req.id);
                                         showToast('Demande supprimée', 'success');
                                         loadData();
                                       } catch (e) {
                                         console.error(e);
                                         showToast('Erreur lors de la suppression', 'error');
                                       }
                                     }
                                   });`
);

// I noticed the original logic for license request deletion had duplicated error toast instead of success, I fixed it in replacement.

fs.writeFileSync('src/components/SuperAdminDashboard.tsx', code);
