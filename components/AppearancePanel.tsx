import React, { FC, useRef, ChangeEvent } from 'react';
import { Background } from '../types';
import { XMarkIcon, PhotoIcon, SunIcon, MoonIcon } from './icons/Icons';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../context/LanguageContext';

interface AppearancePanelProps {
    isOpen: boolean;
    onClose: () => void;
    onBackgroundChange: (background: Background) => void;
    currentBackground: Background;
}

const colors = [
    // Light
    { name: 'White', value: '#ffffff' },
    { name: 'Slate Light', value: '#f8fafc' },
    { name: 'Stone', value: '#fafaf9' },
    { name: 'Sky Light', value: '#f0f9ff' },
    { name: 'Mint Light', value: '#f0fdfa' },
    { name: 'Green Light', value: '#f0fdf4' },
    { name: 'Rose Light', value: '#fff1f2' },
    { name: 'Indigo Light', value: '#eef2ff' },
    // Dark
    { name: 'Slate Dark', value: '#1e293b' },
    { name: 'Gray Dark', value: '#1f2937' },
    { name: 'Zinc Dark', value: '#27272a' },
    { name: 'Neutral Dark', value: '#262626' },
    { name: 'Midnight', value: '#172554' },
    { name: 'Deep Forest', value: '#14532d' },
    { name: 'Royal Purple', value: '#581c87' },
    { name: 'Deep Crimson', value: '#991b1b' },
];

const images = [
    { name: 'Galaxy', value: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2071&auto=format&fit=crop' },
    { name: 'Landscape', value: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop' },
    { name: 'Abstract', value: 'https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?q=80&w=1974&auto=format&fit=crop' },
    { name: 'Gradient', value: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop' },
    { name: 'Geometric', value: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=1974&auto=format&fit=crop' },
    { name: 'Tech', value: 'https://images.unsplash.com/photo-1550745165-9bc0b252726a?q=80&w=2070&auto=format&fit=crop' },
    { name: 'Waves', value: 'https://images.unsplash.com/photo-1511202329382-a56b84a44b55?q=80&w=2070&auto=format&fit=crop' },
    { name: 'Mountain', value: 'https://images.unsplash.com/photo-1542224566-6e85f2ba5773?q=80&w=2072&auto=format&fit=crop' },
    { name: 'Aurora', value: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=2066&auto=format&fit=crop' },
];

const SectionTitle: FC<{children: React.ReactNode}> = ({ children }) => (
    <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 mt-4">{children}</h4>
);

export const AppearancePanel: FC<AppearancePanelProps> = ({ isOpen, onClose, onBackgroundChange, currentBackground }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { theme, toggleTheme } = useTheme();
    const { t } = useTranslation();

    const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    onBackgroundChange({ type: 'custom', value: event.target.result as string });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const isSelected = (type: Background['type'], value: string) => {
        if (type === 'custom') return currentBackground.type === 'custom';
        return currentBackground.type === type && currentBackground.value === value;
    };

    return (
        <>
            {isOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-black bg-opacity-30"
                    onClick={onClose}
                    aria-hidden="true"
                ></div>
            )}
            <div className={`fixed bottom-6 right-6 z-50 bg-primary dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 w-80 p-4 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-dark dark:text-secondary text-lg">{t('appearance.title')}</h3>
                    <button onClick={onClose} className="text-slate-400 dark:text-slate-500 hover:text-dark dark:hover:text-secondary p-1 rounded-full"><XMarkIcon /></button>
                 </div>
                
                 {/* Theme Switcher */}
                <SectionTitle>{t('appearance.mode')}</SectionTitle>
                <div className="p-1 bg-slate-100 dark:bg-slate-700 rounded-lg flex">
                    <button
                        onClick={theme === 'dark' ? toggleTheme : undefined}
                        className={`w-1/2 py-2 text-sm font-semibold rounded-md flex items-center justify-center gap-2 transition-colors ${theme === 'light' ? 'bg-white shadow text-accent' : 'text-slate-500 hover:text-white'}`}
                    >
                        <SunIcon className="w-5 h-5"/> {t('appearance.light')}
                    </button>
                     <button
                        onClick={theme === 'light' ? toggleTheme : undefined}
                        className={`w-1/2 py-2 text-sm font-semibold rounded-md flex items-center justify-center gap-2 transition-colors ${theme === 'dark' ? 'bg-slate-800 shadow text-accent' : 'text-slate-400 hover:text-slate-800'}`}
                    >
                        <MoonIcon className="w-5 h-5" /> {t('appearance.dark')}
                    </button>
                </div>

                {/* Color Options */}
                <SectionTitle>{t('appearance.colors')}</SectionTitle>
                <div className="grid grid-cols-8 gap-2 mb-4">
                    {colors.map(color => (
                        <button
                            key={color.name}
                            onClick={() => onBackgroundChange({ type: 'color', value: color.value })}
                            className={`w-full aspect-square rounded-md border-2 transition-transform transform hover:scale-110 ${isSelected('color', color.value) ? 'border-accent' : 'border-slate-200 dark:border-slate-600'}`}
                            style={{ backgroundColor: color.value }}
                            aria-label={t('appearance.aria.setBackgroundColor', { colorName: color.name })}
                        ></button>
                    ))}
                </div>

                {/* Image Options */}
                <SectionTitle>{t('appearance.images')}</SectionTitle>
                <div className="grid grid-cols-3 gap-2 mb-4">
                    {images.map(image => (
                         <button
                            key={image.name}
                            onClick={() => onBackgroundChange({ type: 'image', value: image.value })}
                            className={`h-12 rounded-md bg-cover bg-center border-2 transition-transform transform hover:scale-105 ${isSelected('image', image.value) ? 'border-accent' : 'border-transparent'}`}
                            style={{ backgroundImage: `url(${image.value})` }}
                            aria-label={t('appearance.aria.setBackgroundImage', { imageName: image.name })}
                        ></button>
                    ))}
                </div>

                {/* Custom Upload */}
                <SectionTitle>{t('appearance.custom')}</SectionTitle>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full flex items-center justify-center gap-2 p-3 text-sm font-semibold rounded-md text-slate-700 dark:text-slate-300 bg-secondary dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors border-2 ${isSelected('custom', currentBackground.value) ? 'border-accent' : 'border-slate-200 dark:border-slate-600'}`}
                >
                    <PhotoIcon className="w-5 h-5" />
                    {t('appearance.uploadImage')}
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*"
                />
            </div>
        </>
    );
};