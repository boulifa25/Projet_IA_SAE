import { Link } from 'react-router-dom';
import {
  Briefcase,
  FileText,
  Building2,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Users,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react';
import Logo from '@/components/Logo';

const features = [
  {
    icon: Briefcase,
    title: 'Gestion des offres',
    desc: 'Publiez et gérez toutes vos offres de stage en un seul endroit, avec suivi en temps réel.',
    color: 'bg-primary-50 text-primary-600',
  },
  {
    icon: FileText,
    title: 'Suivi des candidatures',
    desc: 'Évaluez les candidatures des étudiants avec scores de compatibilité et statuts détaillés.',
    color: 'bg-accent-50 text-accent-600',
  },
  {
    icon: Building2,
    title: 'Réseau d\'entreprises',
    desc: 'Gérez vos relations avec les entreprises partenaires et suivez les embauches réalisées.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: Users,
    title: 'Suivi des étudiants',
    desc: 'Accompagnez chaque étudiant dans son parcours et son placement en stage.',
    color: 'bg-amber-50 text-amber-600',
  },
];

const stats = [
  { value: '500+', label: 'Étudiants placés' },
  { value: '200+', label: 'Entreprises partenaires' },
  { value: '1 000+', label: 'Offres publiées' },
  { value: '98%', label: 'Taux de satisfaction' },
];

const steps = [
  { num: '01', title: 'Créez votre compte', desc: 'Inscrivez-vous en quelques secondes avec votre email.' },
  { num: '02', title: 'Publiez vos offres', desc: 'Ajoutez vos offres de stage et partagez-les avec les étudiants.' },
  { num: '03', title: 'Suivez les candidatures', desc: 'Évaluez et placez vos étudiants dans les meilleures entreprises.' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo className="w-9 h-9 drop-shadow-sm" />
            <div>
              <h1 className="font-display font-bold text-slate-900 text-lg leading-none">StageIO</h1>
              <p className="text-xs text-slate-400">Gestion des stages</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Connexion
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 px-4 py-2.5 rounded-xl shadow-soft transition-all hover:shadow-glow active:scale-95"
            >
              S'inscrire
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 right-10 w-72 h-72 bg-primary-100 rounded-full blur-3xl opacity-60" />
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-accent-100 rounded-full blur-3xl opacity-50" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 text-sm font-semibold rounded-full border border-primary-100 mb-6">
                <Sparkles className="w-4 h-4" />
                La plateforme N°1 pour les écoles
              </span>
              <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-slate-900 leading-tight tracking-tight mb-6">
                Gérez vos stages{' '}
                <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
                  simplement
                </span>
                , placez vos étudiants{' '}
                <span className="bg-gradient-to-r from-accent-500 to-primary-600 bg-clip-text text-transparent">
                  efficacement
                </span>
              </h1>
              <p className="text-lg text-slate-500 leading-relaxed mb-8 max-w-xl">
                Centralisez la gestion des offres de stage, le suivi des candidatures
                et vos relations avec les entreprises partenaires sur une plateforme
                moderne et intuitive.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/register"
                  className="flex items-center gap-2 px-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-soft transition-all hover:shadow-glow active:scale-95"
                >
                  Commencer gratuitement
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-colors"
                >
                  J'ai déjà un compte
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-8">
                <div className="flex -space-x-2">
                  {['AD', 'LM', 'ED', 'HL', 'CB'].map((initials) => (
                    <div key={initials} className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-xs font-semibold ring-2 ring-white">
                      {initials}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">Approuvé par 200+ écoles</p>
                </div>
              </div>
            </div>

            <div className="relative animate-fade-in">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.pexels.com/photos/5257894/pexels-photo-5257894.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                  alt="Étudiants et professionnels en stage"
                  className="w-full h-[420px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/40 to-transparent" />
              </div>
              {/* Floating cards */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-soft border border-slate-100 p-4 w-52 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">51 étudiants placés</p>
                    <p className="text-xs text-slate-400">Ce mois-ci</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-soft border border-slate-100 p-4 w-48 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">+34 candidatures</p>
                    <p className="text-xs text-slate-400">Cette semaine</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display font-extrabold text-4xl lg:text-5xl bg-gradient-to-br from-primary-600 to-accent-500 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-500 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-50 text-accent-700 text-sm font-semibold rounded-full border border-accent-100 mb-4">
              Fonctionnalités
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-lg text-slate-500">
              Une plateforme complète pour gérer l'ensemble du parcours de stage de vos étudiants.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-soft hover:border-primary-200 transition-all duration-300 group"
                >
                  <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6" strokeWidth={2} />
                  </div>
                  <h3 className="font-display font-bold text-slate-900 text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 mb-4">
              Comment ça marche
            </h2>
            <p className="text-lg text-slate-500">
              Trois étapes simples pour transformer la gestion des stages de votre école.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.num} className="relative">
                <div className="bg-white rounded-2xl border border-slate-200 p-8 h-full">
                  <span className="font-display font-extrabold text-5xl text-primary-100">{step.num}</span>
                  <h3 className="font-display font-bold text-slate-900 text-xl mt-4 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 via-primary-600 to-accent-600 p-10 sm:p-16 text-center text-white">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-400/20 rounded-full translate-y-1/2 blur-2xl" />
            <div className="relative">
              <ShieldCheck className="w-12 h-12 mx-auto mb-6 text-white/80" />
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl mb-4">
                Prêt à digitaliser la gestion de vos stages ?
              </h2>
              <p className="text-primary-100 text-lg mb-8 max-w-xl mx-auto">
                Rejoignez les écoles qui font confiance à StageIO pour placer leurs étudiants.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 font-bold rounded-xl shadow-soft hover:bg-primary-50 transition-all hover:shadow-glow active:scale-95"
              >
                Créer un compte gratuit
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Logo className="w-7 h-7" />
            <span className="font-display font-bold text-slate-900">StageIO</span>
          </div>
          <p className="text-sm text-slate-400">© 2026 StageIO. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
