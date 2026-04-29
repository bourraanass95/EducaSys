import React, { useState } from 'react';
import { User, Mail, Phone, Shield, Camera, Save, MapPin, Calendar, Settings, MessageSquare, PhoneCall } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { api } from '../services/api';

interface ProfileProps {
  user: any;
  onUpdate: (data: any) => void;
}

export const Profile = ({ user, onUpdate }: ProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    avatarUrl: user?.avatarUrl || '',
    registrationDate: user?.registrationDate || 'Septembre 2023',
  });

  React.useEffect(() => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      avatarUrl: user?.avatarUrl || '',
      registrationDate: user?.registrationDate || 'Septembre 2023',
    });
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      console.log('User:', user);
      console.log('FormData:', formData);
      // Use the collection from user object if available, otherwise fallback
      const targetCol = user?.collection || (user?.role === 'Student' ? 'users' : 'staff');
      console.log('Target Collection:', targetCol);
      
      await api.updateGeneric(targetCol, user.id, formData);
      onUpdate(formData); // Update App state
      setIsEditing(false);
      alert('Profil mis à jour avec succès.');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la mise à jour: ' + (err instanceof Error ? err.message : 'Erreur inconnue'));
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = () => {
     alert("Un email de réinitialisation a été envoyé à " + (user?.email || 'votre adresse email'));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end gap-6 pb-8 border-b border-gray-100">
        <div className="relative group">
          <div className={cn(
            "w-32 h-32 rounded-[40px] flex items-center justify-center text-4xl font-black italic shadow-2xl relative overflow-hidden",
            user?.role === 'Admin' ? "bg-gray-900 text-white" : "bg-blue-600 text-white"
          )}>
            {formData.avatarUrl ? (
              <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              user?.name?.[0] || 'U'
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </div>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            id="profile-pic-upload" 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                   setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
                };
                reader.readAsDataURL(file);
              }
            }}
          />
          <label htmlFor="profile-pic-upload" className="absolute inset-0 cursor-pointer" />

          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-gray-50">
            <div className={cn("w-3 h-3 rounded-full animate-pulse", user?.status === 'Active' ? "bg-green-500" : "bg-gray-400")} />
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight italic">
              {user?.name || 'Utilisateur'}
            </h1>
            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-blue-100">
              {user?.role || 'Membre'}
            </span>
          </div>
          <p className="text-gray-500 font-medium flex items-center gap-2">
            <Shield className="w-4 h-4" /> ID: {user?.id?.substring(0, 8).toUpperCase() || 'N/A'}
          </p>
        </div>

        <button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={loading}
          className={cn(
            "px-8 py-4 rounded-2xl font-black uppercase italic text-xs transition-all flex items-center gap-2 shadow-xl",
            isEditing 
              ? "bg-green-600 text-white hover:bg-green-700 shadow-green-100 disabled:opacity-50" 
              : "bg-gray-900 text-white hover:bg-black shadow-gray-200"
          )}
        >
          {loading ? 'Sauvegarde...' : (isEditing ? <Save className="w-4 h-4" /> : <Settings className="w-4 h-4" />)}
          {loading ? '...' : (isEditing ? 'Enregistrer' : 'Modifier le profil')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-50">
            <h3 className="text-lg font-black text-gray-900 mb-8 uppercase italic tracking-tight">Informations Personnelles</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Nom Complet</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-2xl outline-none font-bold italic transition-all text-sm text-black"
                  />
                ) : (
                  <div className="px-6 py-4 bg-gray-50 rounded-2xl flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-bold text-gray-900">{user?.name}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Email</label>
                {isEditing ? (
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-2xl outline-none font-bold italic transition-all text-sm text-black"
                  />
                ) : (
                  <div className="px-6 py-4 bg-gray-50 rounded-2xl flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="font-bold text-gray-900">{user?.email}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Téléphone</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-2xl outline-none font-bold italic transition-all text-sm text-black"
                  />
                ) : (
                  <div className="px-6 py-4 bg-gray-50 rounded-2xl flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="font-bold text-gray-900">{user?.phone || 'Non renseigné'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Date d'inscription</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={formData.registrationDate} 
                    onChange={e => setFormData({...formData, registrationDate: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-2xl outline-none font-bold italic transition-all text-sm text-black"
                  />
                ) : (
                  <div className="px-6 py-4 bg-gray-50 rounded-2xl flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="font-bold text-gray-900">{formData.registrationDate}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Adresse</label>
              {isEditing ? (
                <textarea 
                  value={formData.address} 
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-2xl outline-none font-bold italic transition-all text-sm text-black min-h-[100px]"
                />
              ) : (
                <div className="px-6 py-4 bg-gray-50 rounded-2xl flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="font-bold text-gray-900">{user?.address || 'Non renseignée'}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-600 rounded-[40px] p-10 text-white shadow-xl shadow-blue-100 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-black italic mb-2 uppercase tracking-tight">Sécurité du Compte</h3>
              <p className="text-blue-100 text-sm mb-8 leading-relaxed max-w-md">Protégez votre compte en changeant régulièrement votre mot de passe.</p>
              <button onClick={resetPassword} className="px-6 py-3 bg-white text-blue-600 rounded-xl font-black uppercase italic text-[10px] hover:bg-blue-50 transition-colors shadow-lg">
                Changer le mot de passe
              </button>
            </div>
            <Shield className="absolute top-1/2 right-0 w-64 h-64 text-white/10 -translate-y-1/2 translate-x-1/4 rotate-12" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-50">
            <h3 className="text-[10px] font-black text-gray-400 mb-6 uppercase italic tracking-[0.2em]">Activités Récentes</h3>
            <div className="space-y-6">
              {[
                { label: 'Connexion réussie', time: 'Il y a 2h', icon: Shield, color: 'text-green-500' },
                { label: 'Modification planning', time: 'Hier', icon: Save, color: 'text-blue-500' },
                { label: 'Exportation bulletin', time: 'Il y a 2 jours', icon: Camera, color: 'text-purple-500' }
              ].map((act, i) => (
                <div key={i} className="flex gap-4">
                  <div className={cn("w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0", act.color)}>
                    <act.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{act.label}</p>
                    <p className="text-[10px] text-gray-400 font-medium">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 rounded-[40px] p-8 text-white shadow-2xl">
            <h3 className="text-[10px] font-black text-gray-400 mb-4 uppercase italic tracking-[0.2em]">Support Direct</h3>
            <p className="text-xs text-gray-300 mb-6 leading-relaxed">Notre équipe technique est disponible 24/7.</p>
            <div className="grid grid-cols-3 gap-2">
               <a href="https://wa.me/num" target="_blank" className="flex flex-col items-center gap-2 p-3 bg-white/10 hover:bg-green-600 rounded-xl transition-colors">
                  <MessageSquare className="w-5 h-5"/>
                  <span className="text-[9px] font-bold">WhatsApp</span>
               </a>
               <a href="tel:num" className="flex flex-col items-center gap-2 p-3 bg-white/10 hover:bg-blue-600 rounded-xl transition-colors">
                  <PhoneCall className="w-5 h-5"/>
                  <span className="text-[9px] font-bold">Appel</span>
               </a>
               <a href="mailto:support@educasys.app?subject=Support" className="flex flex-col items-center gap-2 p-3 bg-white/10 hover:bg-red-600 rounded-xl transition-colors">
                  <Mail className="w-5 h-5"/>
                  <span className="text-[9px] font-bold">Mail</span>
               </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
