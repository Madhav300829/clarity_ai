import React, { useState, useRef, useEffect, ChangeEvent, KeyboardEvent, ClipboardEvent, FC } from 'react';
import { useTranslation } from '../../context/LanguageContext';

interface OtpInputProps {
    length?: number;
    onComplete: (otp: string) => void;
    onResend: () => void;
}

export const OtpInput: FC<OtpInputProps> = ({ length = 6, onComplete, onResend }) => {
    const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
    const [timer, setTimer] = useState(30);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const { t } = useTranslation();

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (isNaN(Number(value))) return;

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        const combinedOtp = newOtp.join("");
        if (combinedOtp.length === length) {
            onComplete(combinedOtp);
        }

        if (value && index < length - 1 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
            inputRefs.current[index - 1]?.focus();
        }
    };
    
    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').slice(0, length);
        if (!/^\d+$/.test(pasteData)) return;

        const newOtp = [...otp];
        for (let i = 0; i < length; i++) {
            newOtp[i] = pasteData[i] || "";
        }
        setOtp(newOtp);

        const combinedOtp = newOtp.join("");
        if (combinedOtp.length === length) {
            onComplete(combinedOtp);
        }
        
        const nextFocusIndex = Math.min(pasteData.length, length - 1);
        inputRefs.current[nextFocusIndex]?.focus();
    };

    const handleResendClick = () => {
        if (timer === 0) {
            onResend();
            setTimer(30);
            setOtp(new Array(length).fill(""));
            inputRefs.current[0]?.focus();
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="flex gap-2" onPaste={handlePaste}>
                {otp.map((value, index) => (
                    <input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el; }}
                        type="text"
                        value={value}
                        onChange={(e) => handleChange(index, e)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-12 h-14 text-center text-2xl font-bold bg-secondary dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-accent focus:outline-none transition text-dark dark:text-secondary"
                        maxLength={1}
                        aria-label={t('otp.aria.digit', { index: index + 1 })}
                    />
                ))}
            </div>
            <div className="text-sm text-center text-light dark:text-slate-400">
                {timer > 0 ? (
                    <span>{t('otp.resendIn')} <span className="font-bold text-accent">{timer}s</span></span>
                ) : (
                    <button onClick={handleResendClick} className="font-bold text-accent hover:underline">
                        {t('otp.resend')}
                    </button>
                )}
            </div>
        </div>
    );
};