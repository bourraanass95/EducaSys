import React, { useState } from 'react';
import { School, MapPin, Mail, Phone, Globe, Save, Settings, Camera, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { api } from '../services/api';

interface SchoolProfileProps {
  user: any;
  onUpdate: (data: any) => void;
}

export const SchoolProfile = ({ user, onUpdate }: SchoolProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.schoolName || 'EducaSys',
    address: user?.schoolAddress || 'Non renseignée',
    contactEmail: user?.schoolEmail || 'contact@educasys.app',
    phone: user?.schoolPhone || 'Non renseigné',
    website: user?.schoolWebsite || 'www.educasys.app',
    logoUrl: user?.schoolLogoUrl || '',
  });

  React.useEffect(() => {
    setFormData({
      name: user?.schoolName || 'EducaSys',
      address: user?.schoolAddress || 'Non renseignée',
      contactEmail: user?.schoolEmail || 'contact@educasys.app',
      phone: user?.schoolPhone || 'Non renseigné',
      website: user?.schoolWebsite || 'www.educasys.app',
      logoUrl: user?.schoolLogoUrl || '',
    });
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Assuming schools collection
      await api.updateGeneric('schools', user.schoolId, formData);
      onUpdate({
          schoolName: formData.name,
          schoolAddress: formData.address,
          schoolEmail: formData.contactEmail,
          schoolPhone: formData.phone,
          schoolWebsite: formData.website,
          schoolLogoUrl: formData.logoUrl
      });
      setIsEditing(false);
      alert('Informations école mises à jour avec succès');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end gap-6 pb-8 border-b border-gray-100">
        <div className="relative group">
          <div className="w-32 h-32 rounded-[40px] flex items-center justify-center bg-blue-600 text-white shadow-2xl relative overflow-hidden">
            {formData.logoUrl ? (
              <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <School className="w-16 h-16" />
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </div>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            id="school-logo-upload" 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                   setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
                };
                reader.readAsDataURL(file);
              }
            }}
          />
          <label htmlFor="school-logo-upload" className="absolute inset-0 cursor-pointer" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight italic">
              {isEditing ? (
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-2 py-1 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-lg outline-none font-black italic transition-all text-3xl text-black"
                  />
                ) : formData.name}
            </h1>
          </div>
          <p className="text-gray-500 font-medium flex items-center gap-2">
            <Globe className="w-4 h-4" /> Subdomain: {user?.schoolSubdomain || 'N/A'}
          </p>
        </div>

        <button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={loading || (user?.role !== 'Admin' && user?.role !== 'Director' && !user?.isSuperAdmin)}
          className={cn(
            "px-8 py-4 rounded-2xl font-black uppercase italic text-xs transition-all flex items-center gap-2 shadow-xl",
            isEditing 
              ? "bg-green-600 text-white hover:bg-green-700 shadow-green-100 disabled:opacity-50" 
              : "bg-gray-900 text-white hover:bg-black shadow-gray-200 disabled:opacity-50 disabled:bg-gray-300"
          )}
        >
          {loading ? 'Sauvegarde...' : (isEditing ? <Save className="w-4 h-4" /> : <Settings className="w-4 h-4" />)}
          {loading ? '...' : (isEditing ? 'Enregistrer' : 'Modifier les infos')}
        </button>
      </div>

      <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-50">
        <h3 className="text-lg font-black text-gray-900 mb-8 uppercase italic tracking-tight">Détails de l'école</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Field: Address */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Adresse</label>
            {isEditing ? (
              <input 
                type="text" 
                value={formData.address} 
                onChange={e => setFormData({...formData, address: e.target.value})}
                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-2xl outline-none font-bold italic transition-all text-sm text-black"
              />
            ) : (
              <div className="px-6 py-4 bg-gray-50 rounded-2xl flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="font-bold text-gray-900">{formData.address}</span>
              </div>
            )}
          </div>
          
          {/* Field: Contact Email */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Email de Contact</label>
            {isEditing ? (
              <input 
                type="email" 
                value={formData.contactEmail} 
                onChange={e => setFormData({...formData, contactEmail: e.target.value})}
                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-2xl outline-none font-bold italic transition-all text-sm text-black"
              />
            ) : (
              <div className="px-6 py-4 bg-gray-50 rounded-2xl flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="font-bold text-gray-900">{formData.contactEmail}</span>
              </div>
            )}
          </div>

          {/* Field: Phone */}
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
                <span className="font-bold text-gray-900">{formData.phone}</span>
              </div>
            )}
          </div>
          
          {/* Field: Website */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Site Web</label>
            {isEditing ? (
              <input 
                type="text" 
                value={formData.website} 
                onChange={e => setFormData({...formData, website: e.target.value})}
                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-2xl outline-none font-bold italic transition-all text-sm text-black"
              />
            ) : (
              <div className="px-6 py-4 bg-gray-50 rounded-2xl flex items-center gap-3">
                <Globe className="w-4 h-4 text-gray-400" />
                <span className="font-bold text-gray-900">{formData.website}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-50 mt-8">
        <h3 className="text-lg font-black text-gray-900 mb-2 uppercase italic tracking-tight">Modèles de documents</h3>
        <p className="text-sm font-medium text-gray-500 mb-8">Uploadez vos propres modèles pour les bulletins, certificats, reçus... Le système incrustera automatiquement les données (notes, informations, etc.) sur ces fonds d'écran ou canvas lors de l'impression ou de la génération.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 border-2 border-dashed border-gray-200 rounded-3xl text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
               <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*,.pdf" />
               <div className="flex justify-center mb-4"><Camera className="w-8 h-8 text-blue-400" /></div>
               <h4 className="font-bold text-gray-900 mb-1">Modèle de bulletin (Fond)</h4>
               <p className="text-xs text-gray-500">Uploader votre image de fond de bulletin</p>
            </div>
            <div className="p-6 border-2 border-dashed border-gray-200 rounded-3xl text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
               <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*,.pdf" />
               <div className="flex justify-center mb-4"><Camera className="w-8 h-8 text-blue-400" /></div>
               <h4 className="font-bold text-gray-900 mb-1">Certificat de Scolarité</h4>
               <p className="text-xs text-gray-500">Modèle pour certificat</p>
            </div>
        </div>
      </div>
      
      <div className="bg-amber-50 rounded-[40px] p-6 border border-amber-100 flex gap-4 items-center text-amber-900">
        <AlertCircle className="w-10 h-10 text-amber-600 shrink-0" />
        <div>
          <h4 className="font-black italic uppercase">Zone de Danger</h4>
          <p className="text-xs font-medium">Les modifications apportées au profil de l'école affecteront tous les utilisateurs et les documents officiels.</p>
        </div>
      </div>
    </div>
  );
};
