import React, { FC, useState, FormEvent, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './ui/Button';
import { InputField } from './ui/InputField';
import { UserGroupIcon, AcademicCapIcon, DevicePhoneMobileIcon, EnvelopeIcon } from './icons/Icons';
import { OtpInput } from './ui/OtpInput';
import { CountryCodeInput } from './ui/CountryCodeInput';
import { useTranslation } from '../context/LanguageContext';
import { authenticateUser, authenticateUserByPhone, resetUserPassword, getRegisteredUsers } from '../services/authService';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: () => void;
}

type LoginStep = 'role' | 'method' | 'email' | 'phone' | 'otp' | 'forgotPassword' | 'resetLinkSent' | 'resetPassword';
type UserRole = 'consumer' | 'expert';

export const LoginModal: FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
    const [step, setStep] = useState<LoginStep>('role');
    const [role, setRole] = useState<UserRole | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [countryCode, setCountryCode] = useState('+1');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();

    // Reset state when modal is closed or opened
    useEffect(() => {
        if (isOpen) {
            setStep('role');
            setRole(null);
            setEmail('');
            setPassword('');
            setPhoneNumber('');
            setCountryCode('+1');
            setNewPassword('');
            setConfirmNewPassword('');
            setError(null);
            setIsSubmitting(false);
        }
    }, [isOpen]);
    
    const handleRoleSelect = (selectedRole: UserRole) => {
        setRole(selectedRole);
        setStep('method');
    };

    const handleLoginSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
            const result = await authenticateUser(email, password);
            if (result.success) {
                console.log(`Logged in as: ${result.user?.role} with email: ${email}`);
                setIsSubmitting(false);
                onLoginSuccess();
            } else {
                setError(t('error.auth.invalidCredentials'));
                setIsSubmitting(false);
            }
        } catch (e) {
            setError(t('error.auth.unknown'));
            setIsSubmitting(false);
        }
    };

    const handlePhoneSubmit = (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            console.log(`Sending OTP to: ${countryCode}${phoneNumber}`);
            setIsSubmitting(false);
            setStep('otp');
        }, 1000);
    };

    const handleOtpComplete = async (otp: string) => {
        setIsSubmitting(true);
        setError(null);
        try {
            if (otp === '123456') {
                const fullPhone = `${countryCode}${phoneNumber}`;
                console.log(`Verified OTP for phone: ${fullPhone}`);
                
                // Attempt to authenticate the user by stored phone number
                const result = await authenticateUserByPhone(fullPhone);
                if (result.success) {
                    console.log(`Matched registered phone user: ${result.user?.name}`);
                } else {
                    // Seed guest user session variables to make the app interactive
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('clarity_user_name', `Client ${phoneNumber.slice(-4)}`);
                        localStorage.setItem('clarity_user_role', 'Verified Client');
                        localStorage.setItem('clarity_user_email', `client.${phoneNumber.slice(-4)}@clarity.ai`);
                        localStorage.setItem('clarity_user_status', 'Exploring interactive expert solutions.');
                        window.dispatchEvent(new Event('settings_updated'));
                    }
                }
                setIsSubmitting(false);
                onLoginSuccess();
            } else {
                setError(t('error.auth.invalidOtp'));
                setIsSubmitting(false);
            }
        } catch (e) {
            setError(t('error.auth.unknown'));
            setIsSubmitting(false);
        }
    };
    
    const handleForgotPasswordSubmit = (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setTimeout(() => {
            const users = getRegisteredUsers();
            const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
            if (email.toLowerCase() !== 'test@example.com' && !userExists) {
                setError("No account found with this email. Please register an account first.");
                setIsSubmitting(false);
                return;
            }
            console.log(`Sending reset link to ${email}`);
            setIsSubmitting(false);
            setStep('resetLinkSent');
        }, 1200);
    }

    const handleResetPasswordSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) {
            setError(t('error.auth.passwordsDoNotMatch'));
            return;
        }
        setIsSubmitting(true);
        setError(null);
        try {
            const result = await resetUserPassword(email, newPassword);
            if (result.success) {
                console.log(`Password reset for ${email}`);
                alert(t('loginModal.passwordResetSuccess') || "Password has been reset successfully! You can now log in.");
                setPassword(newPassword); // update password in login form memory for convenience
                setStep('email');
            } else {
                setError(result.error || t('error.auth.unknown'));
            }
        } catch (err) {
            setError(t('error.auth.unknown'));
        } finally {
            setIsSubmitting(false);
        }
    }

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
    
    const MethodButton: FC<{ title: string, icon: React.ReactNode, onClick: () => void }> = ({ title, icon, onClick }) => (
        <button
            onClick={onClick}
            className="w-full text-left p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-secondary dark:bg-slate-800/50 hover:border-accent dark:hover:border-accent hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all duration-300 flex items-center gap-4"
        >
            <div className="w-12 h-12 flex-shrink-0 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-accent">
                {icon}
            </div>
            <div>
                <h4 className="font-bold text-dark dark:text-secondary">{title}</h4>
            </div>
        </button>
    );

    const renderStep = () => {
        switch (step) {
            case 'role':
                return (
                    <div className="space-y-4">
                        <RoleButton
                            roleType="consumer"
                            title={t('loginModal.role.consumer.title')}
                            description={t('loginModal.role.consumer.description')}
                            icon={<UserGroupIcon className="w-7 h-7" />}
                            onClick={() => handleRoleSelect('consumer')}
                        />
                        <RoleButton
                            roleType="expert"
                            title={t('loginModal.role.expert.title')}
                            description={t('loginModal.role.expert.description')}
                            icon={<AcademicCapIcon className="w-7 h-7" />}
                            onClick={() => handleRoleSelect('expert')}
                        />
                    </div>
                );
            case 'method':
                return (
                    <div className="space-y-4">
                        <MethodButton title={t('loginModal.method.email')} icon={<EnvelopeIcon />} onClick={() => setStep('email')} />
                        <MethodButton title={t('loginModal.method.phone')} icon={<DevicePhoneMobileIcon />} onClick={() => setStep('phone')} />
                         <div className="text-center pt-2">
                            <button type="button" onClick={() => setStep('role')} className="text-sm text-accent hover:underline">{t('common.backToRoleSelection')}</button>
                        </div>
                    </div>
                );
            case 'email':
                 return (
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                        <InputField id="login-email" label={t('common.email')} type="email" placeholder="your.email@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                        <InputField id="login-password" label={t('common.password')} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                        <div className="text-right">
                            <button type="button" onClick={() => setStep('forgotPassword')} className="text-sm text-accent hover:underline">{t('loginModal.forgotPassword')}</button>
                        </div>
                        {error && <p className="text-sm text-rose-500 text-center">{error}</p>}
                        <div className="pt-2">
                             <p className="text-center text-xs text-slate-500 dark:text-slate-400 mb-4">
                                {t('loginModal.testCredentials.intro')} (<span className="font-mono text-accent">test@example.com</span> {t('loginModal.testCredentials.and')} <span className="font-mono text-accent">password</span>)
                            </p>
                            <Button type="submit" isLoading={isSubmitting} className="w-full py-3">
                                {t('header.login')}
                            </Button>
                        </div>
                        <div className="text-center">
                            <button type="button" onClick={() => setStep('method')} className="text-sm text-accent hover:underline">{t('common.backToLoginOptions')}</button>
                        </div>
                    </form>
                );
            case 'phone':
                 return (
                    <form onSubmit={handlePhoneSubmit} className="space-y-4">
                        <CountryCodeInput
                            id="login-phone"
                            label={t('common.phoneNumber')}
                            countryCode={countryCode}
                            onCountryCodeChange={setCountryCode}
                            phoneNumber={phoneNumber}
                            onPhoneNumberChange={setPhoneNumber}
                            required
                            placeholder="555 123 4567"
                        />
                        <div className="pt-2">
                            <Button type="submit" isLoading={isSubmitting} className="w-full py-3">
                                {t('loginModal.sendCode')}
                            </Button>
                        </div>
                         <div className="text-center">
                            <button type="button" onClick={() => setStep('method')} className="text-sm text-accent hover:underline">{t('common.backToLoginOptions')}</button>
                        </div>
                    </form>
                );
            case 'otp':
                return (
                    <div className="text-center">
                         <p className="text-light dark:text-slate-400 mb-4">
                            {t('otp.enterCodeSentTo')} <span className="font-semibold text-dark dark:text-secondary">{countryCode}{phoneNumber}</span>.
                        </p>
                        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mb-4">
                            ({t('otp.useTestCode')} <span className="font-mono text-accent">123456</span>)
                        </p>
                        <OtpInput onComplete={handleOtpComplete} onResend={() => console.log('Resending OTP for login...')} />
                        {error && <p className="text-sm text-rose-500 text-center mt-4">{error}</p>}
                        <div className="mt-6 text-center">
                            <button type="button" onClick={() => setStep('phone')} className="text-sm text-accent hover:underline">{t('otp.changePhoneNumber')}</button>
                        </div>
                    </div>
                );
            case 'forgotPassword':
                return (
                    <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400 text-center">{t('loginModal.forgotPasswordInstruction')}</p>
                        <InputField id="forgot-email" label={t('common.email')} type="email" placeholder="your.email@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                        {error && <p className="text-sm text-rose-500 text-center">{error}</p>}
                        <div className="pt-2">
                            <Button type="submit" isLoading={isSubmitting} className="w-full py-3">
                                {t('loginModal.sendResetLink')}
                            </Button>
                        </div>
                        <div className="text-center">
                            <button type="button" onClick={() => setStep('email')} className="text-sm text-accent hover:underline">{t('common.backToLogin')}</button>
                        </div>
                    </form>
                );
            case 'resetLinkSent':
                return (
                    <div className="text-center space-y-4">
                        <p className="text-slate-600 dark:text-slate-300">
                            {t('loginModal.resetLinkSentInstruction')} <span className="font-semibold text-dark dark:text-secondary">{email}</span>.
                        </p>
                        <div className="pt-2">
                            <Button onClick={() => setStep('resetPassword')} className="w-full py-3">
                                {t('loginModal.proceedToReset')}
                            </Button>
                        </div>
                         <div className="text-center">
                            <button type="button" onClick={() => setStep('email')} className="text-sm text-accent hover:underline">{t('common.backToLogin')}</button>
                        </div>
                    </div>
                );
            case 'resetPassword':
                return (
                    <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400 text-center">{t('loginModal.createNewPasswordInstruction')}</p>
                        <InputField id="new-password" label={t('loginModal.newPassword')} type="password" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                        <InputField id="confirm-new-password" label={t('loginModal.confirmNewPassword')} type="password" placeholder="••••••••" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} required />
                        {error && <p className="text-sm text-rose-500 text-center">{error}</p>}
                         <div className="pt-2">
                            <Button type="submit" isLoading={isSubmitting} className="w-full py-3">
                                {t('loginModal.resetPassword')}
                            </Button>
                        </div>
                    </form>
                );
        }
    };
    
    const titles: Record<LoginStep, string> = {
        role: t('loginModal.titles.role'),
        method: t('loginModal.titles.method'),
        email: t('loginModal.titles.email'),
        phone: t('loginModal.titles.phone'),
        otp: t('loginModal.titles.otp'),
        forgotPassword: t('loginModal.titles.forgotPassword'),
        resetLinkSent: t('loginModal.titles.resetLinkSent'),
        resetPassword: t('loginModal.titles.resetPassword'),
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={titles[step]}>
            {renderStep()}
        </Modal>
    );
};