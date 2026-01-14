import React, { FC, useState, FormEvent, useEffect } from 'react';
import { Modal } from './Modal';
import { InputField } from './ui/InputField';
import { Button } from './ui/Button';
import { AcademicCapIcon, UserGroupIcon } from './icons/Icons';
import { OtpInput } from './ui/OtpInput';
import { CountryCodeInput } from './ui/CountryCodeInput';
import { useTranslation } from '../context/LanguageContext';
import { sendOtp, verifyOtp, createUserAccount } from '../services/authService';

interface SignUpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type SignUpStep = 'role' | 'form' | 'otp';
type UserRole = 'consumer' | 'expert';

export const SignUpModal: FC<SignUpModalProps> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState<SignUpStep>('role');
    const [role, setRole] = useState<UserRole | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [countryCode, setCountryCode] = useState('+1');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();

    // Effect to reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setStep('role');
            setRole(null);
            setName('');
            setEmail('');
            setPhoneNumber('');
            setCountryCode('+1');
            setPassword('');
            setConfirmPassword('');
            setIsSubmitting(false);
            setError(null);
        }
    }, [isOpen]);

    const handleFormSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        if (password !== confirmPassword) {
            setError(t('error.auth.passwordsDoNotMatch'));
            return;
        }
        setIsSubmitting(true);
        try {
            const fullPhoneNumber = `${countryCode}${phoneNumber}`;
            const result = await sendOtp(fullPhoneNumber);
            // Fix: By checking for success and using an if/else block, we help TypeScript
            // correctly narrow the type of `result` and prevent property access errors.
            if (result.success) {
                setStep('otp');
            } else {
                setError(t(`error.auth.${result.errorCode}`));
            }
        } catch (e) {
            setError(t('error.auth.unknown'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOtpComplete = async (otp: string) => {
        setIsSubmitting(true);
        setError(null);
        try {
            const fullPhoneNumber = `${countryCode}${phoneNumber}`;
            const verificationResult = await verifyOtp(fullPhoneNumber, otp);

            // Fix: Check for verification success first. This clarifies control flow
            // for TypeScript and fixes the property access error.
            if (verificationResult.success) {
                const accountData = { name, email, phone: fullPhoneNumber, role, password };
                const creationResult = await createUserAccount(accountData);

                // Fix: Similarly, check for account creation success, which also fixes the
                // property access error on `creationResult.errorCode`.
                if (creationResult.success) {
                    alert(t('signUpModal.successMessage'));
                    onClose();
                } else {
                    setError(t(`error.auth.${creationResult.errorCode}`));
                }
            } else {
                setError(t(`error.auth.${verificationResult.errorCode}`));
            }
        } catch (e) {
            setError(t('error.auth.unknown'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRoleSelect = (selectedRole: UserRole) => {
        setRole(selectedRole);
        setStep('form');
    };

    const RoleButton: FC<{ roleType: UserRole, title: string, description: string, icon: React.ReactNode, onClick: () => void }> = ({ roleType, title, description, icon, onClick }) => (
        <button
            onClick={onClick}
            className="w-full text-left p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-secondary dark:bg-slate-800/50 hover:border-accent dark:hover:border-accent hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all duration-300 flex items-center gap-4"
        >
            <div className="w-12 h-12 flex-shrink-0 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-accent">
                {icon}
            </div>
            <div>
                <h4 className="font-bold text-dark dark:text-secondary">{title}</h4>
                <p className="text-sm text-light dark:text-slate-400">{description}</p>
            </div>
        </button>
    );
    
    const renderContent = () => {
        if (step === 'role') {
            return (
                <div className="space-y-4">
                    <RoleButton
                        roleType="consumer"
                        title={t('signUpModal.role.consumer.title')}
                        description={t('signUpModal.role.consumer.description')}
                        icon={<UserGroupIcon className="w-7 h-7" />}
                        onClick={() => handleRoleSelect('consumer')}
                    />
                    <RoleButton
                        roleType="expert"
                        title={t('signUpModal.role.expert.title')}
                        description={t('signUpModal.role.expert.description')}
                        icon={<AcademicCapIcon className="w-7 h-7" />}
                        onClick={() => handleRoleSelect('expert')}
                    />
                </div>
            );
        }

        if (step === 'form') {
            return (
                 <form onSubmit={handleFormSubmit} className="space-y-4">
                    <InputField id="signup-name" label={t('common.name')} type="text" placeholder={t('signUpModal.namePlaceholder')} value={name} onChange={e => setName(e.target.value)} required />
                    <InputField id="signup-email" label={t('common.email')} type="email" placeholder="your.email@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                    <CountryCodeInput
                        id="signup-phone"
                        label={t('common.phoneNumber')}
                        countryCode={countryCode}
                        onCountryCodeChange={setCountryCode}
                        phoneNumber={phoneNumber}
                        onPhoneNumberChange={setPhoneNumber}
                        required
                        placeholder="555 123 4567"
                    />
                    <InputField id="signup-password" label={t('common.password')} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                    <InputField id="signup-confirm-password" label={t('signUpModal.confirmPassword')} type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                    {error && <p className="text-sm text-rose-500 text-center">{error}</p>}
                    <div className="pt-2">
                        <Button
                            type="submit" 
                            isLoading={isSubmitting}
                            className="w-full py-3"
                        >
                            {t('signUpModal.sendVerificationCode')}
                        </Button>
                    </div>
                     <div className="text-center">
                        <button type="button" onClick={() => setStep('role')} className="text-sm text-accent hover:underline">{t('common.backToRoleSelection')}</button>
                    </div>
                </form>
            );
        }
        
        if (step === 'otp') {
            return (
                <div className="text-center">
                    <p className="text-light dark:text-slate-400 mb-4">
                        {t('otp.enterCodeSentTo')} <span className="font-semibold text-dark dark:text-secondary">{countryCode}{phoneNumber}</span>.
                    </p>
                    <OtpInput onComplete={handleOtpComplete} onResend={() => console.log('Resending OTP for signup...')} />
                     {error && <p className="text-sm text-rose-500 text-center mt-4">{error}</p>}
                     {isSubmitting && !error && <p className="text-sm text-light dark:text-slate-400 mt-4">{t('signUpModal.verifying')}</p>}
                    <div className="mt-6 text-center">
                        <button type="button" onClick={() => setStep('form')} className="text-sm text-accent hover:underline">{t('otp.changePhoneNumber')}</button>
                    </div>
                </div>
            );
        }

        return null;
    };

    const titles: Record<SignUpStep, string> = {
        role: t('signUpModal.titles.role'),
        form: t('signUpModal.titles.form'),
        otp: t('signUpModal.titles.otp')
    };


    return (
        <Modal isOpen={isOpen} onClose={onClose} title={titles[step]}>
            {renderContent()}
        </Modal>
    );
};
