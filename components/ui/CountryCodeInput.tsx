

import React, { FC } from 'react';
import { useTranslation } from '../../context/LanguageContext';

interface CountryCodeInputProps {
    id: string;
    label: string;
    countryCode: string;
    onCountryCodeChange: (value: string) => void;
    phoneNumber: string;
    onPhoneNumberChange: (value: string) => void;
    required?: boolean;
    placeholder?: string;
}

const countries = [
    { code: '+1', nameKey: 'country.usa' },
    { code: '+44', nameKey: 'country.uk' },
    { code: '+91', nameKey: 'country.india' },
    { code: '+61', nameKey: 'country.australia' },
    { code: '+81', nameKey: 'country.japan' },
    { code: '+49', nameKey: 'country.germany' },
    { code: '+33', nameKey: 'country.france' },
];

export const CountryCodeInput: FC<CountryCodeInputProps> = ({ 
    id, 
    label, 
    countryCode, 
    onCountryCodeChange, 
    phoneNumber, 
    onPhoneNumberChange, 
    required,
    placeholder
}) => {
    const { t } = useTranslation();
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">{label}</label>
            <div className="flex">
                <select
                    value={countryCode}
                    onChange={(e) => onCountryCodeChange(e.target.value)}
                    className="p-3 bg-primary dark:bg-slate-700 border border-r-0 border-slate-300 dark:border-slate-600 rounded-l-md focus:ring-2 focus:ring-accent focus:outline-none transition text-dark dark:text-secondary"
                    aria-label={t('countryCode.aria.countryCode')}
                >
                    {countries.map(country => (
                        <option key={country.code} value={country.code}>{t(country.nameKey)} ({country.code})</option>
                    ))}
                </select>
                <input 
                    id={id} 
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => onPhoneNumberChange(e.target.value)}
                    required={required}
                    placeholder={placeholder}
                    className="w-full p-3 bg-primary dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-r-md focus:ring-2 focus:ring-accent focus:outline-none transition text-dark dark:text-secondary" 
                />
            </div>
        </div>
    );
};