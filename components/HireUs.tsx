



import React, { FC, useState, useRef, useEffect } from 'react';
import { FreelancerProfile } from '../types';
import { SearchIcon, FilterIcon } from './icons/Icons';
import { FilterPanel, Filters, initialFilters } from './FilterPanel';
import { StarRating } from './ui/StarRating';
import { Button } from './ui/Button';
import { useTranslation } from '../context/LanguageContext';
import { HiringPaymentModal } from './HiringPaymentModal';
import { ShieldAlert, ShieldCheck, HeartHandshake, CheckSquare } from 'lucide-react';

const freelancers: FreelancerProfile[] = [
  {
    id: 1, name: 'Alice Johnson', title: 'Senior React & TypeScript Developer',
    skills: ['React', 'TypeScript', 'Next.js', 'GraphQL', 'Node.js'],
    rate: 95, avatarUrl: 'https://i.pravatar.cc/150?u=alice', email: 'alice.johnson@example.com',
    domain: 'Web Development', experience: 7, rating: 4.8,
  },
  {
    id: 2, name: 'Bob Williams', title: 'UI/UX Designer & Frontend Expert',
    skills: ['Figma', 'Tailwind CSS', 'Webflow', 'User Research', 'Prototyping'],
    rate: 80, avatarUrl: 'https://i.pravatar.cc/150?u=bob', email: 'bob.williams@example.com',
    domain: 'Design', experience: 5, rating: 4.9,
  },
  {
    id: 3, name: 'Charlie Brown', title: 'Cloud & DevOps Engineer',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD'],
    rate: 110, avatarUrl: 'https://i.pravatar.cc/150?u=charlie', email: 'charlie.brown@example.com',
    domain: 'Infrastructure', experience: 8, rating: 4.7,
  },
  {
    id: 4, name: 'Diana Miller', title: 'AI & Machine Learning Specialist',
    skills: ['Python', 'TensorFlow', 'PyTorch', 'Gemini API', 'Data Science'],
    rate: 125, avatarUrl: 'https://i.pravatar.cc/150?u=diana', email: 'diana.miller@example.com',
    domain: 'AI/ML', experience: 6, rating: 5.0,
  },
   {
    id: 5, name: 'Ethan Davis', title: 'Mobile App Developer (iOS & Android)',
    skills: ['SwiftUI', 'Kotlin', 'React Native', 'Firebase', 'Mobile UX'],
    rate: 100, avatarUrl: 'https://i.pravatar.cc/150?u=ethan', email: 'ethan.davis@example.com',
    domain: 'Mobile Development', experience: 4, rating: 4.6,
  },
   {
    id: 6, name: 'Fiona Garcia', title: 'Project Manager & Scrum Master',
    skills: ['Agile', 'Scrum', 'Jira', 'Product Roadmap', 'Stakeholder Communication'],
    rate: 85, avatarUrl: 'https://i.pravatar.cc/150?u=fiona', email: 'fiona.garcia@example.com',
    domain: 'Project Management', experience: 10, rating: 4.9,
  }
];

const colorSchemes = [
    { border: 'hover:border-green-300 dark:hover:border-green-500', text: 'text-green-800 dark:text-green-300', bg: 'bg-green-100 dark:bg-green-900/50', accent: 'text-accent' },
    { border: 'hover:border-sky-300 dark:hover:border-sky-500', text: 'text-sky-800 dark:text-sky-300', bg: 'bg-sky-100 dark:bg-sky-900/50', accent: 'text-sky-500' },
    { border: 'hover:border-indigo-300 dark:hover:border-indigo-500', text: 'text-indigo-800 dark:text-indigo-300', bg: 'bg-indigo-100 dark:bg-indigo-900/50', accent: 'text-indigo-500' },
    { border: 'hover:border-rose-300 dark:hover:border-rose-500', text: 'text-rose-800 dark:text-rose-300', bg: 'bg-rose-100 dark:bg-rose-900/50', accent: 'text-rose-500' },
    { border: 'hover:border-amber-300 dark:hover:border-amber-500', text: 'text-amber-800 dark:text-amber-300', bg: 'bg-amber-100 dark:bg-amber-900/50', accent: 'text-amber-500' },
];

interface FreelancerCardProps {
    freelancer: FreelancerProfile;
    colors: typeof colorSchemes[0];
    onStartChat: (freelancer: FreelancerProfile) => void;
    onStartPayment: (freelancer: FreelancerProfile) => void;
}

const FreelancerCard: FC<FreelancerCardProps> = ({ freelancer, colors, onStartChat, onStartPayment }) => {
    const { t } = useTranslation();
    return (
    <div className={`bg-primary dark:bg-slate-800 rounded-xl p-6 flex flex-col items-center text-center shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-slate-200 dark:border-slate-700 ${colors.border}`}>
        <img src={freelancer.avatarUrl} alt={freelancer.name} className="w-24 h-24 rounded-full mb-4 border-4 border-slate-200 dark:border-slate-600" />
        <h3 className="text-xl font-bold text-dark dark:text-secondary">{freelancer.name}</h3>
        <p className={`${colors.accent} font-medium mb-2`}>{freelancer.title}</p>
        <div className="mb-4 flex items-center gap-1.5">
            <StarRating rating={freelancer.rating} />
            <span className="text-sm text-slate-500 dark:text-slate-400">({freelancer.rating.toFixed(1)})</span>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mb-4">
            {freelancer.skills.slice(0,4).map(skill => (
                <span key={skill} className={`${colors.bg} ${colors.text} text-xs font-medium px-2.5 py-1 rounded-full`}>{skill}</span>
            ))}
        </div>
        <div className="mt-auto flex flex-col gap-3 w-full pt-4 border-t border-slate-200 dark:border-slate-700">
             <div className="flex items-center justify-between w-full">
                 <span className="text-2xl font-bold text-dark dark:text-secondary">${freelancer.rate}<span className="text-sm font-normal text-light dark:text-slate-400">/{t('common.hourAbr')}</span></span>
                 <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Escrow Safe</span>
             </div>
             <div className="grid grid-cols-2 gap-2">
                 <button onClick={() => onStartChat(freelancer)} className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold py-2 px-3 rounded-lg text-xs transition-colors">{t('common.contact')}</button>
                 <button onClick={() => onStartPayment(freelancer)} className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-2 px-3 rounded-lg text-xs transition-all shadow-sm">Hire & Pay</button>
             </div>
        </div>
    </div>
)}

interface HireUsProps {
    onStartChat: (freelancer: FreelancerProfile) => void;
}

export const HireUs: FC<HireUsProps> = ({ onStartChat }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFreelancerForPay, setSelectedFreelancerForPay] = useState<FreelancerProfile | null>(null);
  const filterPanelRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const allSkills = [...new Set(freelancers.flatMap(f => f.skills))].sort();
  const allDomains = [...new Set(freelancers.map(f => f.domain))].sort();
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (isFilterOpen && filterPanelRef.current && !filterPanelRef.current.contains(event.target as Node)) {
            setIsFilterOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterOpen]);

  const handleFilterChange = (newFilters: Partial<Filters>) => {
      setFilters(prev => ({...prev, ...newFilters}));
  };

  const clearFilters = () => setFilters(initialFilters);

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.domain && filters.domain !== initialFilters.domain) count++;
    if (filters.skills.length > 0) count++;
    if (filters.payRate.min !== initialFilters.payRate.min || filters.payRate.max !== initialFilters.payRate.max) count++;
    if (filters.experience !== initialFilters.experience) count++;
    if (filters.rating !== initialFilters.rating) count++;
    return count;
  };
  const activeFilterCount = getActiveFilterCount();

  const filteredFreelancers = freelancers.filter(f => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (
        f.name.toLowerCase().includes(term) ||
        f.title.toLowerCase().includes(term) ||
        f.skills.some(skill => skill.toLowerCase().includes(term))
    );
    if (!matchesSearch) return false;

    // New filter logic
    if (filters.domain && f.domain !== filters.domain) return false;
    if (filters.skills.length > 0 && !filters.skills.every(skill => f.skills.includes(skill))) return false;
    if (typeof filters.payRate.min === 'number' && f.rate < filters.payRate.min) return false;
    if (typeof filters.payRate.max === 'number' && f.rate > filters.payRate.max) return false;
    if (filters.experience && f.experience < filters.experience) return false;
    if (filters.rating && f.rating < filters.rating) return false;
    
    return true;
  });


  return (
    <div className="py-8 animate-fade-in mb-16 md:mb-0">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 animate-slide-up">
            <h1 className="text-4xl md:text-5xl font-extrabold text-dark dark:text-primary font-display [text-shadow:0_1px_2px_rgba(0,0,0,0.2)] dark:[text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">{t('hire.title')}</h1>
            <p className="mt-2 text-lg text-light dark:text-slate-400 [text-shadow:0_1px_2px_rgba(0,0,0,0.2)] dark:[text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">{t('hire.subtitle')}</p>
        </div>

        {/* Dynamic Secured Escrow Informational Banner */}
        <div className="mb-8 p-5 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent rounded-3xl border border-emerald-500/20 max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl">
            <ShieldCheck className="w-8 h-8 animate-pulse" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-slate-900 dark:text-white text-base">Clarity 100% Secure Escrow Deposit Guarantee</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
              Hiring via Clarity.AI protects your capital. Your paid deposits are held securely in independent contract vaults until you inspect the progress files and digitally approve release. No upfront risk.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono font-semibold text-slate-400 border-l border-slate-200 dark:border-slate-800 pl-4 py-2">
            <div className="text-center">
              <span className="text-emerald-500 font-bold block text-sm">$0.00</span>
              No Setup Fee
            </div>
            <div className="text-center">
              <img src="https://img.icons8.com/color/48/000000/stripe.png" alt="Stripe Secured Partner" className="h-6 mx-auto mb-0.5" />
              Verified Core partner
            </div>
          </div>
        </div>
        
        <div className="mb-6 max-w-2xl mx-auto flex items-center gap-4 animate-slide-up" style={{ animationDelay: '50ms' }}>
            <div className="relative flex-grow">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <SearchIcon />
                </div>
                <input
                    type="text"
                    placeholder={t('hire.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full py-3 pl-12 pr-4 bg-primary dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-full focus:ring-2 focus:ring-accent focus:outline-none transition text-dark dark:text-secondary shadow-md"
                    aria-label={t('hire.aria.filterFreelancers')}
                />
            </div>
            <button
                onClick={() => {
                  const headers = ["ID", "Name", "Title", "Hour Rate (USD)", "Domain", "Experience (Years)", "Rating"];
                  const rows = filteredFreelancers.map(f => [f.id, `"${f.name}"`, `"${f.title}"`, f.rate, `"${f.domain}"`, f.experience, f.rating]);
                  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute("download", `clarity_freelancers_directory.csv`);
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                }}
                className="py-3 px-4 border-2 border-emerald-500 hover:border-emerald-600 text-emerald-600 dark:text-emerald-450 hover:text-white hover:bg-emerald-500 font-bold rounded-full transition-all flex items-center gap-1.5 focus:outline-none"
                title="Export Filtered Freelancers list as CSV spreadsheet"
            >
              ⬇️ Export
            </button>
            <div ref={filterPanelRef} className="relative">
                <Button variant="secondary" onClick={() => setIsFilterOpen(p => !p)} className="py-3 px-4">
                    <FilterIcon className="w-5 h-5 mr-2" />
                    {t('hire.filters')}
                    {activeFilterCount > 0 && (
                        <span className="ml-2 bg-accent text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{activeFilterCount}</span>
                    )}
                </Button>
                {isFilterOpen && (
                    <div className="absolute top-full right-0 mt-2 z-20">
                        <FilterPanel 
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            onClear={clearFilters}
                            allSkills={allSkills}
                            allDomains={allDomains}
                        />
                    </div>
                )}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-up" style={{animationDelay: '100ms'}}>
            {filteredFreelancers.length > 0 ? (
                filteredFreelancers.map((freelancer, index) => (
                    <FreelancerCard 
                        key={freelancer.id} 
                        freelancer={freelancer} 
                        colors={colorSchemes[index % colorSchemes.length]}
                        onStartChat={onStartChat}
                        onStartPayment={(f) => setSelectedFreelancerForPay(f)}
                    />
                ))
            ) : (
                <div className="md:col-span-2 lg:col-span-3 text-center py-10 bg-primary dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-md">
                    <p className="text-light dark:text-slate-400 text-lg">{t('hire.noResults')}</p>
                </div>
            )}
        </div>
      </div>

      {/* Renders the secure payment gateway popup modal when freelancer is selected */}
      <HiringPaymentModal 
        isOpen={selectedFreelancerForPay !== null}
        onClose={() => setSelectedFreelancerForPay(null)}
        freelancer={selectedFreelancerForPay}
      />
    </div>
  );
};
