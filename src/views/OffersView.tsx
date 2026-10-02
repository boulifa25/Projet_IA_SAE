import { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  Clock,
  Users,
  Briefcase,
  Calendar,
  Eye,
  Edit3,
  Trash2,
  Plus,
  Wifi,
  Building2,
  X,
  LayoutGrid,
  List,
} from 'lucide-react';
import {
  internships,
  contractTypeColors,
  statusColors,
  type Internship,
  type InternshipStatus,
} from '@/data/mockData';

type FilterStatus = 'all' | InternshipStatus;

export default function OffersView() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedOffer, setSelectedOffer] = useState<Internship | null>(null);

  const filtered = useMemo(() => {
    return internships.filter((o) => {
      const matchSearch =
        o.title.toLowerCase().includes(search.toLowerCase()) ||
        o.company.toLowerCase().includes(search.toLowerCase()) ||
        o.domain.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  const statusLabels: Record<FilterStatus, string> = {
    all: 'Toutes',
    published: 'Publiées',
    draft: 'Brouillons',
    closed: 'Clôturées',
  };

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="flex flex-1 gap-3 max-w-xl">
          <div className="flex items-center gap-2 px-3 py-2.5 bg-white rounded-xl border border-slate-200 flex-1 focus-within:border-primary-300 transition-colors">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une offre, entreprise, domaine..."
              className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none flex-1"
            />
          </div>
          <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1">
            {(Object.keys(statusLabels) as FilterStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  statusFilter === s
                    ? 'bg-primary-600 text-white shadow-soft'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                {statusLabels[s]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-slate-100 text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-slate-100 text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-soft transition-all hover:shadow-glow active:scale-95">
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span className="hidden sm:inline">Nouvelle offre</span>
          </button>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-slate-500">
        <span className="font-semibold text-slate-700">{filtered.length}</span> offre{filtered.length > 1 ? 's' : ''} trouvée{filtered.length > 1 ? 's' : ''}
      </p>

      {/* Grid view */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((offer) => (
            <div
              key={offer.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-soft hover:border-primary-200 transition-all duration-300 group cursor-pointer flex flex-col"
              onClick={() => setSelectedOffer(offer)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center text-base font-bold text-primary-700 group-hover:scale-110 transition-transform duration-300">
                    {offer.companyLogo}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{offer.company}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {offer.location}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-lg border ${statusColors[offer.status]}`}>
                  {offer.status === 'published' ? 'Publiée' : offer.status === 'draft' ? 'Brouillon' : 'Clôturée'}
                </span>
              </div>

              <h3 className="font-display font-bold text-slate-900 text-base mb-2 group-hover:text-primary-700 transition-colors">
                {offer.title}
              </h3>
              <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">{offer.description}</p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {offer.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-xs font-medium px-2 py-1 bg-slate-50 text-slate-600 rounded-md border border-slate-100">
                    {tag}
                  </span>
                ))}
                {offer.tags.length > 3 && (
                  <span className="text-xs font-medium px-2 py-1 text-slate-400">
                    +{offer.tags.length - 3}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {offer.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {offer.applicants}
                  </span>
                  {offer.remote && (
                    <span className="flex items-center gap-1 text-emerald-600">
                      <Wifi className="w-3.5 h-3.5" />
                      Remote
                    </span>
                  )}
                </div>
                <span className="text-sm font-bold text-primary-600">{offer.salary}</span>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${contractTypeColors[offer.contractType]}`}>
                  {offer.contractType}
                </span>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 rounded-lg text-slate-400 hover:bg-primary-50 hover:text-primary-600 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition-colors">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List view */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Poste</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Entreprise</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Type</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Statut</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Candidats</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((offer) => (
                <tr key={offer.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setSelectedOffer(offer)}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center text-xs font-bold text-primary-700 shrink-0">
                        {offer.companyLogo}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{offer.title}</p>
                        <p className="text-xs text-slate-400">{offer.domain}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <p className="text-sm text-slate-700">{offer.company}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {offer.location}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${contractTypeColors[offer.contractType]}`}>
                      {offer.contractType}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-lg border ${statusColors[offer.status]}`}>
                      {offer.status === 'published' ? 'Publiée' : offer.status === 'draft' ? 'Brouillon' : 'Clôturée'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span className="text-sm font-semibold text-slate-700">{offer.applicants}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-lg text-slate-400 hover:bg-primary-50 hover:text-primary-600 transition-colors" onClick={(e) => { e.stopPropagation(); setSelectedOffer(offer); }}>
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition-colors" onClick={(e) => e.stopPropagation()}>
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors" onClick={(e) => e.stopPropagation()}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Briefcase className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="font-display font-semibold text-slate-700 text-lg">Aucune offre trouvée</h3>
          <p className="text-sm text-slate-400 mt-1">Essayez d'ajuster vos filtres ou créez une nouvelle offre.</p>
        </div>
      )}

      {/* Detail drawer */}
      {selectedOffer && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedOffer(null)}>
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm animate-fade-in" />
          <div
            className="relative w-full max-w-lg bg-white h-full overflow-y-auto scrollbar-thin shadow-2xl animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-br from-primary-700 to-accent-600 p-6 text-white">
              <button
                onClick={() => setSelectedOffer(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-white/15 hover:bg-white/25 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-xl font-bold">
                  {selectedOffer.companyLogo}
                </div>
                <div>
                  <p className="text-primary-100 text-sm">{selectedOffer.company}</p>
                  <h2 className="font-display font-bold text-xl">{selectedOffer.title}</h2>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-semibold px-3 py-1 bg-white/15 rounded-lg backdrop-blur-sm">
                  {selectedOffer.contractType}
                </span>
                <span className="text-xs font-semibold px-3 py-1 bg-white/15 rounded-lg backdrop-blur-sm">
                  {selectedOffer.duration}
                </span>
                <span className="text-xs font-semibold px-3 py-1 bg-white/15 rounded-lg backdrop-blur-sm">
                  {selectedOffer.salary}
                </span>
                {selectedOffer.remote && (
                  <span className="text-xs font-semibold px-3 py-1 bg-white/15 rounded-lg backdrop-blur-sm flex items-center gap-1">
                    <Wifi className="w-3 h-3" />
                    Remote
                  </span>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-display font-semibold text-slate-900 mb-2">Description du poste</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{selectedOffer.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Localisation
                  </p>
                  <p className="text-sm font-semibold text-slate-700">{selectedOffer.location}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    Domaine
                  </p>
                  <p className="text-sm font-semibold text-slate-700">{selectedOffer.domain}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Date limite
                  </p>
                  <p className="text-sm font-semibold text-slate-700">
                    {new Date(selectedOffer.deadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Candidatures
                  </p>
                  <p className="text-sm font-semibold text-slate-700">{selectedOffer.applicants} reçues</p>
                </div>
              </div>

              <div>
                <h3 className="font-display font-semibold text-slate-900 mb-3">Compétences requises</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedOffer.tags.map((tag) => (
                    <span key={tag} className="text-sm font-medium px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg border border-primary-100">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors">
                  Voir les candidatures
                </button>
                <button className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors">
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
