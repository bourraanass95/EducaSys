import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Book, LifeBuoy, Shield, Scale, ArrowLeft, School, CheckCircle2, Mail, Phone, Globe, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const PageLayout = ({ children, title, icon: Icon, description }: { children: React.ReactNode, title: string, icon: any, description: string }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-100 italic">
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <School className="w-6 h-6" />
             </div>
             <span className="text-2xl font-display font-black tracking-tighter text-black uppercase italic">EducaSys</span>
          </Link>
          <Link to="/" className="text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
          </Link>
        </div>
      </nav>

      <div className="pt-40 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-8 shadow-xl">
              <Icon className="w-8 h-8" />
            </div>
            <h1 className="text-5xl font-display font-black italic tracking-tighter uppercase mb-4">{title}</h1>
            <p className="text-xl text-gray-500 font-medium leading-relaxed">{description}</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="prose prose-blue prose-lg max-w-none"
          >
            {children}
          </motion.div>
        </div>
      </div>

      <footer className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest italic">© 2026 EducaSys Global Infrastructure</p>
        </div>
      </footer>
    </div>
  );
};

export const Documentation = () => (
  <PageLayout 
    title="Documentation" 
    icon={Book} 
    description="Tout ce dont vous avez besoin pour maîtriser EducaSys."
  >
    <div className="space-y-12">
      <section>
        <h2 className="text-3xl font-black italic uppercase mb-6 text-blue-600">Introduction</h2>
        <p className="text-gray-600 leading-relaxed font-medium">
          EducaSys est une infrastructure ERP nouvelle génération conçue spécifiquement pour le secteur éducatif au Maroc. 
          Notre plateforme centralise la gestion administrative, académique et financière de votre établissement.
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-8">
        <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-4" />
          <h3 className="text-xl font-bold italic mb-2">Premiers Pas</h3>
          <p className="text-sm text-gray-500 leading-relaxed">Apprenez à configurer votre école, ajouter vos premiers élèves et définir vos filières pédagogiques.</p>
        </div>
        <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <CheckCircle2 className="w-8 h-8 text-blue-500 mb-4" />
          <h3 className="text-xl font-bold italic mb-2">Gestion Financière</h3>
          <p className="text-sm text-gray-500 leading-relaxed">Maîtrisez la facturation, le suivi des impayés et la génération des reçus certifiés.</p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-black italic uppercase mb-6">Modules Disponibles</h2>
        <ul className="space-y-4 list-none p-0">
          {[
            "Portail Académique : Bulletins, Notes, Emplois du temps.",
            "Module RH : Staff administratif et corps professoral.",
            "Espace Parents : Suivi en temps réel des absences et notes.",
            "Infrastructure Cloud : Instance dédiée Miage Nexus ERP."
          ].map(item => (
            <li key={item} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 font-medium italic text-gray-700">
               <div className="w-2 h-2 bg-blue-600 rounded-full" />
               {item}
            </li>
          ))}
        </ul>
      </section>
    </div>
  </PageLayout>
);

export const Support = () => (
  <PageLayout 
    title="Support Client" 
    icon={LifeBuoy} 
    description="Une équipe dédiée basée au Maroc pour vous accompagner 7j/7."
  >
    <div className="space-y-12">
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="p-10 bg-blue-600 rounded-[40px] text-white shadow-xl shadow-blue-600/20">
          <Mail className="w-12 h-12 mb-6 opacity-60" />
          <h3 className="text-2xl font-black italic uppercase mb-2">Email</h3>
          <p className="text-blue-100 mb-6 font-medium italic">Réponse garantie en moins de 2h pour les urgences.</p>
          <a href="mailto:support@educasys.ma" className="text-xl font-black italic">support@educasys.ma</a>
        </div>
        <div className="p-10 bg-gray-900 rounded-[40px] text-white shadow-xl shadow-gray-900/20">
          <Phone className="w-12 h-12 mb-6 opacity-60 text-blue-500" />
          <h3 className="text-2xl font-black italic uppercase mb-2">Téléphone</h3>
          <p className="text-gray-400 mb-6 font-medium italic">Disponible du Lundi au Samedi de 08:30 à 18:30.</p>
          <a href="tel:+212522000000" className="text-xl font-black italic">+212 5 22 00 00 00</a>
        </div>
      </div>

      <section className="p-10 bg-white rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 text-blue-600/5">
          <MessageSquare className="w-32 h-32" />
        </div>
        <h3 className="text-3xl font-black italic uppercase mb-8 tracking-tighter">Foire aux Questions</h3>
        <div className="space-y-6">
          {[
            { q: "Comment se passe l'installation ?", a: "Notre équipe déploie votre instance cloud en 24h et configure vos accès." },
            { q: "Proposez-vous une formation sur site ?", a: "Oui, un conseiller se déplace dans votre établissement pour former votre staff." },
            { q: "Mes données sont-elles en sécurité ?", a: "Toutes les données sont hébergées sur des serveurs sécurisés avec sauvegardes quotidiennes." }
          ].map((item, i) => (
            <div key={i} className="pb-6 border-b border-gray-50 last:border-0">
               <h4 className="font-black italic text-gray-900 mb-2 uppercase text-xs tracking-widest text-blue-600">Q: {item.q}</h4>
               <p className="font-medium text-gray-500 italic leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  </PageLayout>
);

export const Privacy = () => (
  <PageLayout 
    title="Confidentialité" 
    icon={Shield} 
    description="La protection des données de vos élèves est notre priorité absolue."
  >
    <div className="space-y-12 font-medium italic text-gray-600 leading-relaxed">
      <section>
        <h2 className="text-2xl font-black italic uppercase mb-6 text-gray-900">1. Collecte des Données</h2>
        <p>Nous collectons uniquement les informations nécessaires au bon fonctionnement de la scolarité : identité des élèves, tuteurs, notes, et données de facturation. EducaSys agit en tant que sous-traitant pour le compte de l'établissement scolaire.</p>
      </section>

      <section>
        <h2 className="text-2xl font-black italic uppercase mb-6 text-gray-900">2. Conformité CNDP</h2>
        <p>Conformément à la Loi 09-08 relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel au Maroc, nous nous engageons à respecter les normes strictes de confidentialité et de sécurité.</p>
      </section>

      <section>
        <h2 className="text-2xl font-black italic uppercase mb-6 text-gray-900">3. Sécurité des Infrastructures</h2>
        <p>Nos serveurs bénéficient d'un cryptage AES-256 bits et d'une surveillance continue via notre centre d'opérations réseau. Chaque établissement dispose de sa propre base de données isolée.</p>
      </section>
    </div>
  </PageLayout>
);

export const CGU = () => (
  <PageLayout 
    title="Conditions Générales" 
    icon={Scale} 
    description="Conditions d'utilisation des services EducaSys Global."
  >
    <div className="space-y-12 font-medium italic text-gray-600 leading-relaxed">
      <section>
        <h2 className="text-2xl font-black italic uppercase mb-6 text-gray-900">1. Objet du Contrat</h2>
        <p>EducaSys fournit une licence d'utilisation logicielle SaaS (Software as a Service) pour la gestion d'établissements d'enseignement privés et publics.</p>
      </section>

      <section>
        <h2 className="text-2xl font-black italic uppercase mb-6 text-gray-900">2. Obligations du Client</h2>
        <p>L'établissement s'engage à utiliser la plateforme de manière licite et à assurer l'exactitude des données pédagogiques saisies dans le système.</p>
      </section>

      <section>
        <h2 className="text-2xl font-black italic uppercase mb-6 text-gray-900">3. Disponibilité du Service</h2>
        <p>Nous garantissons un taux de disponibilité (SLA) de 99.9%. Les opérations de maintenance sont effectuées en dehors des heures scolaires standards pour minimiser l'impact.</p>
      </section>
    </div>
  </PageLayout>
);
