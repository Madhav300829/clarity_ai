


import React, { FC, ChangeEvent } from 'react';
import { Button } from './ui/Button';
import { useTranslation } from '../context/LanguageContext';

export interface Filters {
    domain: string;
    skills: string[];
    payRate: { min: number | string, max: number | string };
    experience: number | null;
    rating: number | null;
}

export const initialFilters: Filters = {
    domain: '',
    skills: [],
    payRate: { min: '', max: '' },
    experience: null,
    rating: null,
};

interface FilterPanelProps {
    filters: Filters;
    onFilterChange: (newFilters: Partial<Filters>) => void;
    onClear: () => void;
    allSkills: string[];
    allDomains: string[];
}

const FilterLabel: FC<{children: React.ReactNode}> = ({ children }) => (
    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">{children}</label>
);

const experienceLevels = [
    { labelKey: 'filter.experience.1plus', value: 1 },
    { labelKey: 'filter.experience.3plus', value: 3 },
    { labelKey: 'filter.experience.5plus', value: 5 },
    { labelKey: 'filter.experience.10plus', value: 10 },
];

const ratingLevels = [
    { labelKey: 'filter.rating.4plus', value: 4 },
    { labelKey: 'filter.rating.3plus', value: 3 },
];

export const FilterPanel: FC<FilterPanelProps> = ({
    filters,
    onFilterChange,
    onClear,
    allSkills,
    allDomains,
}) => {
    const { t } = useTranslation();
    
    const handleSkillToggle = (skill: string) => {
        const newSkills = filters.skills.includes(skill)
            ? filters.skills.filter(s => s !== skill)
            : [...filters.skills, skill];
        onFilterChange({ skills: newSkills });
    };

    const handlePayRateChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        onFilterChange({ 
            payRate: {
                ...filters.payRate,
                [name]: value === '' ? '' : parseInt(value, 10),
            }
        });
    };
    
    const handleRadioChange = (filterName: 'experience' | 'rating', value: number) => {
        const currentValue = filters[filterName];
        if (currentValue === value) {
            onFilterChange({ [filterName]: null }); // Deselect if clicked again
        } else {
            onFilterChange({ [filterName]: value });
        }
    };


    return (
        <div className="bg-primary dark:bg-slate-800 p-4 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 w-80 animate-fade-in">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-dark dark:text-secondary">{t('filter.title')}</h3>
                <Button variant="ghost" onClick={onClear} className="text-sm px-2 py-1 !font-medium text-accent hover:bg-green-50 dark:hover:bg-green-900/20">{t('filter.clearAll')}</Button>
            </div>
            <div className="space-y-5">
                {/* Domain */}
                <div>
                    <FilterLabel>{t('filter.domain.label')}</FilterLabel>
                    <select
                        value={filters.domain}
                        onChange={e => onFilterChange({ domain: e.target.value })}
                        className="w-full p-2 bg-primary dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-accent focus:outline-none transition text-dark dark:text-secondary"
                    >
                        <option value="">{t('filter.domain.all')}</option>
                        {allDomains.map(domain => <option key={domain} value={domain}>{domain}</option>)}
                    </select>
                </div>

                {/* Pay Rate */}
                <div>
                    <FilterLabel>{t('filter.payRate.label')}</FilterLabel>
                    <div className="flex items-center gap-2">
                        <input type="number" name="min" placeholder={t('filter.payRate.min')} value={filters.payRate.min} onChange={handlePayRateChange} className="w-full p-2 bg-primary dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-accent focus:outline-none transition text-dark dark:text-secondary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                        <span className="text-slate-400">-</span>
                        <input type="number" name="max" placeholder={t('filter.payRate.max')} value={filters.payRate.max} onChange={handlePayRateChange} className="w-full p-2 bg-primary dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-accent focus:outline-none transition text-dark dark:text-secondary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                    </div>
                </div>
                
                {/* Experience & Rating */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <FilterLabel>{t('filter.experience.label')}</FilterLabel>
                        <div className="space-y-2">
                            {experienceLevels.map(level => (
                                <label key={level.value} className="flex items-center gap-2 text-sm text-dark dark:text-secondary cursor-pointer">
                                    <input type="radio" name="experience" value={level.value} checked={filters.experience === level.value} onChange={() => handleRadioChange('experience', level.value)} className="h-4 w-4 text-accent border-slate-300 focus:ring-accent" />
                                    {t(level.labelKey)}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <FilterLabel>{t('filter.rating.label')}</FilterLabel>
                         <div className="space-y-2">
                            {ratingLevels.map(level => (
                                <label key={level.value} className="flex items-center gap-2 text-sm text-dark dark:text-secondary cursor-pointer">
                                    <input type="radio" name="rating" value={level.value} checked={filters.rating === level.value} onChange={() => handleRadioChange('rating', level.value)} className="h-4 w-4 text-accent border-slate-300 focus:ring-accent" />
                                    {t(level.labelKey)}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            
                {/* Skills */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                     <FilterLabel>{t('filter.skills.label', { count: filters.skills.length })}</FilterLabel>
                     <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 max-h-32 overflow-y-auto pr-2">
                        {allSkills.map(skill => (
                            <label key={skill} className="flex items-center gap-2 text-sm text-dark dark:text-secondary cursor-pointer">
                                <input type="checkbox" checked={filters.skills.includes(skill)} onChange={() => handleSkillToggle(skill)} className="h-4 w-4 rounded text-accent border-slate-300 focus:ring-accent" />
                                <span className="truncate" title={skill}>{skill}</span>
                            </label>
                        ))}
                     </div>
                </div>
            </div>
        </div>
    );
};