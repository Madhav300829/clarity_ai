

import React, { FC, InputHTMLAttributes, useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '../icons/Icons';
import { useTranslation } from '../../context/LanguageContext';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    id: string;
    label: string;
}

export const InputField: FC<InputFieldProps> = ({ id, label, type, ...props }) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const isPasswordField = type === 'password';
    const { t } = useTranslation();

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(prev => !prev);
    };

    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">{label}</label>
            <div className="relative">
                <input 
                    id={id} 
                    type={isPasswordField ? (isPasswordVisible ? 'text' : 'password') : type}
                    className={`w-full p-3 bg-primary dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-accent focus:outline-none transition text-dark dark:text-secondary ${isPasswordField ? 'pr-10' : ''}`} 
                    {...props}
                />
                {isPasswordField && (
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        aria-label={isPasswordVisible ? t('inputField.aria.hidePassword') : t('inputField.aria.showPassword')}
                    >
                        {isPasswordVisible ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                )}
            </div>
        </div>
    );
};