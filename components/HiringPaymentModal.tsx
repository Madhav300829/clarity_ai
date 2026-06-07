import React, { FC, useState, useEffect } from 'react';
import { FreelancerProfile } from '../types';
import { 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Calendar, 
  User, 
  DollarSign, 
  Clock, 
  Briefcase, 
  Loader2, 
  FileText, 
  Download, 
  ArrowRight,
  Sparkles,
  RefreshCw,
  Wallet,
  Smartphone,
  QrCode,
  AlertCircle
} from 'lucide-react';

interface HiringPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  freelancer: FreelancerProfile | null;
}

type PaymentStep = 'milestone' | 'details' | 'otp' | 'success';
type PaymentMethod = 'card' | 'upi' | 'wallet' | 'bank';
type UpiApp = 'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'amazonpay';
type UpiMethod = 'vpa' | 'qr';

export const HiringPaymentModal: FC<HiringPaymentModalProps> = ({ isOpen, onClose, freelancer }) => {
  const [step, setStep] = useState<PaymentStep>('milestone');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi'); // Default to UPI as requested!
  const [hours, setHours] = useState<number>(10);
  const [milestoneDesc, setMilestoneDesc] = useState<string>('Milestone 1: Dynamic High-Quality Work & Iterations');
  
  // UPI Specific State
  const [selectedUpiApp, setSelectedUpiApp] = useState<UpiApp>('gpay');
  const [upiMethod, setUpiMethod] = useState<UpiMethod>('vpa');
  const [upiId, setUpiId] = useState<string>('');
  const [qrCodeTimer, setQrCodeTimer] = useState<number>(300); // 5 minutes countdown
  const [isVerifyingVpa, setIsVerifyingVpa] = useState<boolean>(false);
  const [vpaVerified, setVpaVerified] = useState<boolean>(false);
  const [vpaError, setVpaError] = useState<string>('');

  // Card Details State
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardHolder, setCardHolder] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvv, setCardCvv] = useState<string>('');
  
  // Error state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  
  // OTP state
  const [otpCode, setOtpCode] = useState<string[]>(['', '', '', '']);
  const [otpError, setOtpError] = useState<string>('');

  // UPI Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen && paymentMethod === 'upi' && upiMethod === 'qr' && qrCodeTimer > 0) {
      interval = setInterval(() => {
        setQrCodeTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, paymentMethod, upiMethod, qrCodeTimer]);

  // Reset/Auto-fill values on freelancer load
  useEffect(() => {
    if (isOpen) {
      setStep('milestone');
      setCardNumber('');
      setCardHolder('');
      setCardExpiry('');
      setCardCvv('');
      setErrors({});
      setOtpCode(['', '', '', '']);
      setOtpError('');
      setUpiId('');
      setVpaVerified(false);
      setVpaError('');
      setQrCodeTimer(300);
      setSelectedUpiApp('gpay');
      setUpiMethod('vpa');
    }
  }, [isOpen, freelancer]);

  if (!isOpen || !freelancer) return null;

  // Cost calculation
  const subtotal = freelancer.rate * hours;
  const platformFee = Math.round(subtotal * 0.05); // 5%
  const processingFee = 2.50; // Flat Stripe/SSL processing
  const totalAmount = subtotal + platformFee + processingFee;

  // Format credit card typing
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let formatted = '';
    for (let i = 0; i < raw.length && i < 16; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += raw[i];
    }
    setCardNumber(formatted);
    if (errors.cardNumber) {
      setErrors(prev => ({ ...prev, cardNumber: '' }));
    }
  };

  // Format expiry MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let formatted = '';
    if (raw.length > 0) {
      formatted = raw.substring(0, 2);
      if (raw.length > 2) {
        formatted += '/' + raw.substring(2, 4);
      }
    }
    setCardExpiry(formatted);
    if (errors.cardExpiry) {
      setErrors(prev => ({ ...prev, cardExpiry: '' }));
    }
  };

  const handleCardCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/gi, '').substring(0, 3);
    setCardCvv(val);
    if (errors.cardCvv) {
      setErrors(prev => ({ ...prev, cardCvv: '' }));
    }
  };

  // Determine credit card type emoji/text
  const getCardType = (num: string) => {
    const clean = num.replace(/\s+/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(clean)) return 'Mastercard';
    if (clean.startsWith('34') || clean.startsWith('37')) return 'American Express';
    return 'Credit Card';
  };

  const getCardGradient = () => {
    const type = getCardType(cardNumber);
    if (type === 'Visa') return 'from-indigo-600 via-purple-600 to-indigo-800';
    if (type === 'Mastercard') return 'from-orange-600 via-rose-600 to-amber-600';
    if (type === 'American Express') return 'from-cyan-600 via-sky-600 to-blue-700';
    return 'from-slate-800 via-slate-700 to-slate-900';
  };

  const validateMilestone = () => {
    const errs: { [key: string]: string } = {};
    if (hours < 1) errs.hours = 'Minimum 1 hour required';
    if (!milestoneDesc.trim()) errs.milestoneDesc = 'Please describe the milestone scope';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateDetails = () => {
    if (paymentMethod === 'upi') {
      if (upiMethod === 'vpa') {
        if (!upiId.trim() || !upiId.includes('@')) {
          setVpaError('Please enter a valid UPI VPA address (e.g., name@bank)');
          return false;
        }
      }
      return true;
    }

    if (paymentMethod !== 'card') {
      return true; // Simple sandbox logic for other options
    }

    const errs: { [key: string]: string } = {};
    const cleanNum = cardNumber.replace(/\s+/g, '');
    
    if (cleanNum.length !== 16) {
      errs.cardNumber = 'Invalid card number. Must be 16 digits.';
    }
    if (!cardHolder.trim()) {
      errs.cardHolder = 'Cardholder name is required.';
    }
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      errs.cardExpiry = 'Requires MM/YY formatting.';
    } else {
      const [mm, yy] = cardExpiry.split('/');
      const month = parseInt(mm, 10);
      if (month < 1 || month > 12) {
        errs.cardExpiry = 'Expiry month must be between 01 and 12';
      }
    }
    if (cardCvv.length < 3) {
      errs.cardCvv = 'CVV must be 3 digits';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateMilestone()) {
      setStep('details');
    }
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDetails()) return;

    setIsProcessing(true);

    if (paymentMethod === 'upi') {
      const appLabel = selectedUpiApp === 'gpay' ? 'Google Pay' :
                       selectedUpiApp === 'phonepe' ? 'PhonePe' :
                       selectedUpiApp === 'paytm' ? 'Paytm' :
                       selectedUpiApp === 'bhim' ? 'BHIM UPI' : 'Amazon Pay';

      if (upiMethod === 'vpa') {
        setProcessingStatus(`Sending payment confirmation request to ${upiId} on ${appLabel}...`);
        setTimeout(() => {
          setProcessingStatus('Awaiting secure UPI PIN entry on your smartphone device...');
          setTimeout(() => {
            setIsProcessing(false);
            setStep('success');
          }, 1800);
        }, 1500);
      } else {
        setProcessingStatus(`Confirming secure dynamic ${appLabel} QR checkout handshake...`);
        setTimeout(() => {
          setProcessingStatus('Securing milestone escrow fund vault custody...');
          setTimeout(() => {
            setIsProcessing(false);
            setStep('success');
          }, 1200);
        }, 1250);
      }
      return;
    }

    setProcessingStatus('Establishing encrypted tunneling (SSL-256)...');

    // Simulate gateway handshakes
    setTimeout(() => {
      setProcessingStatus('Securing milestone escrow fund custody...');
      setTimeout(() => {
        setProcessingStatus('Generating dynamic secure OTP challenge code...');
        setTimeout(() => {
          setIsProcessing(false);
          setStep('otp');
        }, 1200);
      }, 1000);
    }, 1000);
  };

  const handleOtpChange = (index: number, val: string) => {
    const cleanVal = val.replace(/[^0-9]/g, '').substring(0, 1);
    const newOtp = [...otpCode];
    newOtp[index] = cleanVal;
    setOtpCode(newOtp);
    setOtpError('');

    // Advance focus
    if (cleanVal && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) {
        (nextInput as HTMLInputElement).focus();
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) {
        (prevInput as HTMLInputElement).focus();
      }
    }
  };

  const handleVerifyOtp = () => {
    const joined = otpCode.join('');
    if (joined.length < 4) {
      setOtpError('Please fill out the full security code.');
      return;
    }

    setIsProcessing(true);
    setProcessingStatus('Verifying security signature...');

    setTimeout(() => {
      setIsProcessing(false);
      setStep('success');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md transition-all duration-300">
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden m-4 max-h-[90vh] flex flex-col">
        
        {/* Modal Decorative Glowing backdrops */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 dark:bg-emerald-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 dark:bg-teal-500/15 rounded-full blur-3xl -z-10" />

        {/* Modal Header bar */}
        <div className="px-6 py-5 border-b border-slate-150 dark:border-slate-850 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2 ml-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                Secure Escrow Gateway
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300">256-Bit SSL</span>
              </h2>
              <p className="text-xs text-slate-500">Milestone payments held safely until contract conditions are met.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 transition-all font-semibold text-slate-600 dark:text-slate-300 text-sm"
          >
            ✕
          </button>
        </div>

        {/* Wizard Progression Stepper */}
        <div className="px-8 py-3 bg-slate-100/50 dark:bg-slate-950/30 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-400 font-mono">
          <div className={`flex items-center gap-1 font-bold ${step === 'milestone' ? 'text-emerald-500' : 'text-emerald-500/70'}`}>
            <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] mr-1">1</span>
            Milestone Options
          </div>
          <div className="w-12 h-[1px] bg-slate-200 dark:bg-slate-800" />
          <div className={`flex items-center gap-1 ${step === 'details' ? 'text-emerald-500 font-bold' : step === 'otp' || step === 'success' ? 'text-emerald-500/70' : 'text-slate-400'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] mr-1 ${step !== 'milestone' ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-600'}`}>2</span>
            Secure Billing
          </div>
          <div className="w-12 h-[1px] bg-slate-200 dark:bg-slate-800" />
          <div className={`flex items-center gap-1 ${step === 'otp' ? 'text-emerald-500 font-bold' : step === 'success' ? 'text-emerald-500/70' : 'text-slate-400'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] mr-1 ${step === 'otp' || step === 'success' ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-600'}`}>3</span>
            Authentication
          </div>
          <div className="w-12 h-[1px] bg-slate-200 dark:bg-slate-800" />
          <div className={`flex items-center gap-1 ${step === 'success' ? 'text-emerald-500 font-bold' : 'text-slate-400'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] mr-1 ${step === 'success' ? 'bg-emerald-500 text-white' : 'bg-slate-300'}`}>4</span>
            Contract Approved
          </div>
        </div>

        {/* Scrollable Container Form */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 relative">

          {/* Loader Overlay when API is interacting */}
          {isProcessing && (
            <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/95 z-50 flex flex-col justify-center items-center">
              <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mb-4" />
              <p className="text-slate-800 dark:text-slate-100 font-semibold text-lg">{processingStatus}</p>
              <span className="text-xs text-slate-500 mt-2 font-mono">Ensuring maximum cryptographic defense layer</span>
            </div>
          )}

          {/* STEP 1: CONFIGURE CONTRACT / HOURS */}
          {step === 'milestone' && (
            <form onSubmit={handleNextToPayment} className="space-y-6">
              {/* Profile Bar Mini */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <img src={freelancer.avatarUrl} alt={freelancer.name} className="w-12 h-12 rounded-full border border-slate-200" />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">{freelancer.name}</h3>
                  <p className="text-xs text-slate-500 mb-1">{freelancer.title}</p>
                  <p className="text-emerald-600 dark:text-emerald-400 font-mono text-xs font-semibold">Standard Freelance Rate: ${freelancer.rate}/hour</p>
                </div>
              </div>

              {/* Scope Input */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Contract Milestone Focus / Description</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-3.5 text-slate-400">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={milestoneDesc}
                    onChange={(e) => setMilestoneDesc(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200 text-sm focus:outline-none"
                    placeholder="Describe the scope of hours paid for (e.g. Design Prototype)"
                  />
                </div>
                {errors.milestoneDesc && <p className="text-xs font-sans text-red-500 mt-1">{errors.milestoneDesc}</p>}
              </div>

              {/* Slider selector for payment budget calculation */}
              <div className="bg-slate-50 dark:bg-slate-850/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/80 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5Fixed">
                    <Clock className="w-4 h-4 text-emerald-500" /> Contract Hours Required
                  </span>
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-sm rounded-lg">
                    {hours} Standard Hours
                  </span>
                </div>
                
                <input
                  type="range"
                  min="3"
                  max="120"
                  value={hours}
                  onChange={(e) => setHours(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />

                <div className="flex justify-between text-xs font-mono text-slate-500">
                  <span>3 hrs (Quick task)</span>
                  <span>40 hrs (Full week)</span>
                  <span>120 hrs (Major project)</span>
                </div>
              </div>

              {/* Calculation review dashboard widget */}
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800 p-5 space-y-3.5">
                <h4 className="font-bold text-xs font-mono uppercase text-slate-400 tracking-wider">Estimated Project Funding</h4>
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                  <span>Subtotal Contract Rate ({hours} hrs x ${freelancer.rate})</span>
                  <span className="font-mono text-slate-800 dark:text-white font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    Clarity Escrow Protection Fee (5%)
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-emerald-500 cursor-help" title="Guarantees safe payment holding and dispute support">?</span>
                  </span>
                  <span className="font-mono text-slate-800 dark:text-white">${platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 pb-3 border-b border-dashed border-slate-200 dark:border-slate-800">
                  <span>SSL Security Handling & Stripe gateway fee</span>
                  <span className="font-mono text-slate-800 dark:text-white">${processingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="font-bold text-slate-800 dark:text-white">Total Secure Escrow Deposit</span>
                  <span className="text-2xl font-black font-mono text-emerald-500">${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Submit to Step 2 */}
              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-base flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-emerald-500/10 active:scale-[0.99] transition-all"
              >
                Configure Billing & Pay Escrow
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          )}          {/* STEP 2: BILLING METHOD & CARD COMPONENT */}
          {step === 'details' && (
            <form onSubmit={handleProcessPayment} className="space-y-6">
              
              {/* Tabs for choosing billing gateway type */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-100/60 dark:bg-slate-800/40 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('upi');
                    setErrors({});
                  }}
                  className={`py-2 px-1.5 rounded-lg text-xs font-bold leading-tight flex items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'upi' 
                      ? 'bg-white dark:bg-slate-700 text-emerald-500 shadow-sm border border-slate-200/55 dark:border-slate-600' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                  Instant UPI
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('card');
                    setErrors({});
                  }}
                  className={`py-2 px-1.5 rounded-lg text-xs font-bold leading-tight flex items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'card' 
                      ? 'bg-white dark:bg-slate-700 text-emerald-500 shadow-sm border border-slate-200/55 dark:border-slate-600' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Credit Card
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('wallet');
                    setErrors({});
                  }}
                  className={`py-2 px-1.5 rounded-lg text-xs font-bold leading-tight flex items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'wallet' 
                      ? 'bg-white dark:bg-slate-700 text-emerald-500 shadow-sm border border-slate-200/55 dark:border-slate-600' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Wallet className="w-3.5 h-3.5" />
                  E-Wallets
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('bank');
                    setErrors({});
                  }}
                  className={`py-2 px-1.5 rounded-lg text-xs font-bold leading-tight flex items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'bank' 
                      ? 'bg-white dark:bg-slate-700 text-emerald-500 shadow-sm border border-slate-200/55 dark:border-slate-600' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Bank Wire
                </button>
              </div>

              {/* CARD DETAILS LAYOUT WITH LIVE PREVIEW */}
              {paymentMethod === 'card' ? (
                <div className="space-y-6">
                  {/* Visually stunning credit card mock-up in Wallpaper style */}
                  <div className={`w-full max-w-sm mx-auto h-48 rounded-2xl p-6 bg-gradient-to-tr text-white relative shadow-xl transform hover:scale-[1.02] transition-all duration-300 ${getCardGradient()}`}>
                    {/* Metallic microchip overlay */}
                    <div className="absolute top-6 left-6 w-11 h-8 rounded bg-gradient-to-tr from-yellow-300 via-yellow-200 to-yellow-500 opacity-80 flex items-center justify-center">
                      <div className="grid grid-cols-2 gap-[1px] w-8 h-5 border border-amber-950/20" />
                    </div>

                    <div className="absolute top-6 right-6 font-mono font-black text-lg tracking-tight">
                      CLARITY CARD
                    </div>

                    <div className="mt-14 font-mono text-xl tracking-widest text-shadow-sm font-semibold">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </div>

                    <div className="mt-6 flex justify-between items-end">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-white/60 block font-mono">Card Holder</span>
                        <span className="text-sm font-semibold tracking-wider font-mono truncate max-w-[150px] uppercase block">
                          {cardHolder || 'Your Full Name'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-white/60 block font-mono text-right">Expires</span>
                        <span className="text-sm font-semibold tracking-wider font-mono text-right block">
                          {cardExpiry || 'MM/YY'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Form fields for dynamic card typing */}
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Cardholder Name</label>
                      <div className="relative">
                        <div className="absolute left-3.5 top-3.5 text-slate-400">
                          <User className="w-4.5 h-4.5" />
                        </div>
                        <input
                          type="text"
                          value={cardHolder}
                          onChange={(e) => {
                            setCardHolder(e.target.value);
                            if (errors.cardHolder) setErrors(prev => ({ ...prev, cardHolder: '' }));
                          }}
                          className={`w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-850 border rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200 text-sm focus:outline-none ${
                            errors.cardHolder ? 'border-red-500' : 'border-slate-200 dark:border-slate-755'
                          }`}
                          placeholder="Johnathan Doe"
                          maxLength={32}
                        />
                      </div>
                      {errors.cardHolder && <p className="text-xs text-red-500 mt-1">{errors.cardHolder}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Credit Card Number</label>
                      <div className="relative">
                        <div className="absolute left-3.5 top-3.5 text-slate-400">
                          <CreditCard className="w-4.5 h-4.5" />
                        </div>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          className={`w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-850 border rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200 text-sm focus:outline-none font-mono ${
                            errors.cardNumber ? 'border-red-500' : 'border-slate-200 dark:border-slate-755'
                          }`}
                          placeholder="4111 2222 3333 4444"
                          maxLength={19}
                        />
                        <div className="absolute right-3.5 top-3.5 text-xs text-slate-400 font-mono font-bold">
                          {getCardType(cardNumber)}
                        </div>
                      </div>
                      {errors.cardNumber && <p className="text-xs text-red-500 mt-1">{errors.cardNumber}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Expiration Date</label>
                        <div className="relative">
                          <div className="absolute left-3.5 top-3.5 text-slate-400">
                            <Calendar className="w-4.5 h-4.5" />
                          </div>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={handleExpiryChange}
                            className={`w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-850 border rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200 text-sm focus:outline-none font-mono ${
                              errors.cardExpiry ? 'border-red-500' : 'border-slate-200 dark:border-slate-755'
                            }`}
                            placeholder="MM/YY"
                            maxLength={5}
                          />
                        </div>
                        {errors.cardExpiry && <p className="text-xs text-red-500 mt-1">{errors.cardExpiry}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">CVV Badge Code</label>
                        <div className="relative">
                          <div className="absolute left-3.5 top-3.5 text-slate-400">
                            <Lock className="w-4.5 h-4.5" />
                          </div>
                          <input
                            type="password"
                            value={cardCvv}
                            onChange={handleCardCvvChange}
                            className={`w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-850 border rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200 text-sm focus:outline-none font-mono ${
                              errors.cardCvv ? 'border-red-500' : 'border-slate-200 dark:border-slate-755'
                            }`}
                            placeholder="•••"
                            maxLength={3}
                          />
                        </div>
                        {errors.cardCvv && <p className="text-xs text-red-500 mt-1">{errors.cardCvv}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              ) : paymentMethod === 'upi' ? (
                <div className="space-y-6">
                  {/* Select UPI Application */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Select UPI Application</label>
                    <div className="grid grid-cols-5 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUpiApp('gpay');
                          setVpaVerified(false);
                          setVpaError('');
                        }}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all outline-none ${
                          selectedUpiApp === 'gpay'
                            ? 'border-emerald-500 bg-emerald-50/20 dark:bg-slate-800/80 ring-2 ring-emerald-500/10'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="w-5 h-5 flex items-center justify-center font-bold text-xs bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500 text-white rounded-full">
                          G
                        </div>
                        <span className="text-[10px] font-bold">GPay</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUpiApp('phonepe');
                          setVpaVerified(false);
                          setVpaError('');
                        }}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all outline-none ${
                          selectedUpiApp === 'phonepe'
                            ? 'border-emerald-500 bg-emerald-50/20 dark:bg-slate-800/80 ring-2 ring-emerald-500/10'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="w-5 h-5 flex items-center justify-center text-[10px] font-black bg-indigo-600 text-white rounded-lg">
                          Pe
                        </div>
                        <span className="text-[10px] font-bold">PhonePe</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUpiApp('paytm');
                          setVpaVerified(false);
                          setVpaError('');
                        }}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all outline-none ${
                          selectedUpiApp === 'paytm'
                            ? 'border-emerald-500 bg-emerald-50/20 dark:bg-slate-800/80 ring-2 ring-emerald-500/10'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="w-5 h-5 flex items-center justify-center text-[8px] font-extrabold bg-sky-500 text-white rounded-full">
                          pay
                        </div>
                        <span className="text-[10px] font-bold">Paytm</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUpiApp('bhim');
                          setVpaVerified(false);
                          setVpaError('');
                        }}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all outline-none ${
                          selectedUpiApp === 'bhim'
                            ? 'border-emerald-500 bg-emerald-50/20 dark:bg-slate-800/80 ring-2 ring-emerald-500/10'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="w-5 h-5 flex items-center justify-center gap-[1px] bg-amber-500 text-[9px] font-black text-white rounded-md">
                          B
                        </div>
                        <span className="text-[10px] font-bold">BHIM</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUpiApp('amazonpay');
                          setVpaVerified(false);
                          setVpaError('');
                        }}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all outline-none ${
                          selectedUpiApp === 'amazonpay'
                            ? 'border-emerald-500 bg-emerald-50/20 dark:bg-slate-800/80 ring-2 ring-emerald-500/10'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="w-5 h-5 flex items-center justify-center bg-zinc-900 border border-amber-500 text-[8px] font-extrabold text-amber-500 rounded-lg">
                          a
                        </div>
                        <span className="text-[10px] font-bold">Amazon</span>
                      </button>
                    </div>
                  </div>

                  {/* Toggle UPI VPA vs QR Code methods */}
                  <div className="flex border-b border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setUpiMethod('vpa');
                        setVpaError('');
                      }}
                      className={`flex-1 py-2.5 text-center text-xs font-bold border-b-2 transition-all ${
                        upiMethod === 'vpa'
                          ? 'border-emerald-500 text-emerald-500'
                          : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Instant Pay with UPI ID (VPA)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUpiMethod('qr');
                        setVpaError('');
                      }}
                      className={`flex-1 py-2.5 text-center text-xs font-bold border-b-2 transition-all ${
                        upiMethod === 'qr'
                          ? 'border-emerald-500 text-emerald-500'
                          : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Scan Dynamic QR Code
                    </button>
                  </div>

                  {upiMethod === 'vpa' ? (
                    <div className="space-y-4 pt-1">
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-slate-550 dark:text-slate-400">Enter UPI ID / Virtual Payment Address (VPA)</label>
                        <div className="flex gap-2.5">
                          <div className="relative flex-1">
                            <span className="absolute left-3.5 top-3 text-slate-400 text-sm font-bold font-mono">@</span>
                            <input
                              type="text"
                              value={upiId}
                              onChange={(e) => {
                                setUpiId(e.target.value);
                                setVpaVerified(false);
                                setVpaError('');
                              }}
                              className={`w-full pl-9 pr-3.5 py-2.5 bg-white dark:bg-slate-850 border rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200 text-sm focus:outline-none font-mono ${
                                vpaError ? 'border-red-500' : 'border-slate-200 dark:border-slate-750'
                              }`}
                              placeholder={
                                selectedUpiApp === 'gpay' ? 'username@okhdfcbank' : 
                                selectedUpiApp === 'phonepe' ? '9876543210@ybl' : 
                                selectedUpiApp === 'paytm' ? 'user@paytm' : 'username@bhim'
                              }
                            />
                          </div>

                          {/* Live Simulator verification action */}
                          <button
                            type="button"
                            onClick={() => {
                              if (!upiId.trim() || !upiId.includes('@')) {
                                setVpaError('Provide a full VPA address with an "@" symbol');
                                return;
                              }
                              setIsVerifyingVpa(true);
                              setVpaError('');
                              setTimeout(() => {
                                setIsVerifyingVpa(false);
                                setVpaVerified(true);
                              }, 1200);
                            }}
                            disabled={isVerifyingVpa || !upiId.trim()}
                            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            {isVerifyingVpa ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Verifying
                              </>
                            ) : vpaVerified ? (
                              <span className="text-emerald-500 font-bold">✓ Verified</span>
                            ) : (
                              'Verify UPI ID'
                            )}
                          </button>
                        </div>
                        {vpaError && (
                          <p className="text-xs text-red-500 font-medium">{vpaError}</p>
                        )}
                        {vpaVerified && (
                          <div className="p-2.5 bg-emerald-500/10 border border-emerald-550/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>VPA Match Found: <strong>John Doe (Handshake Confirmed via Core Node)</strong></span>
                          </div>
                        )}
                      </div>

                      {/* Fast selection suffixes buttons */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tap to auto-append default handle</span>
                        <div className="flex flex-wrap gap-1.5">
                          {['@okhdfcbank', '@okaxis', '@ybl', '@paytm', '@okicici', '@apl'].map((handle) => (
                            <button
                              key={handle}
                              type="button"
                              onClick={() => {
                                const cleanBase = upiId.split('@')[0] || 'clarityuser';
                                setUpiId(cleanBase + handle);
                                setVpaVerified(false);
                                setVpaError('');
                              }}
                              className="text-[11px] px-2.5 py-1 bg-slate-50 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-705 border border-slate-200 dark:border-slate-750 text-slate-600 dark:text-slate-350 rounded-lg transition-all font-mono"
                            >
                              {handle}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Interactive push simulated notification info bar */}
                      <div className="p-3 bg-blue-500/5 rounded-2xl border border-blue-500/10 text-xs text-blue-600 dark:text-blue-400 flex items-start gap-2.5 leading-relaxed">
                        <Smartphone className="w-4 h-4 mt-0.5 shrink-0 animate-bounce" />
                        <div>
                          <strong>Immediate Mobile Push Security Request</strong>
                          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                            Upon submitting, a secure push request request notification will be delivered instantly to your device for dynamic one-tap checkout approval.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 text-center py-2">
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800 text-left flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Scan this code using any UPI Application</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">Compatible with Google Pay, PhonePe, Paytm, BHIM and all banking apps.</p>
                        </div>
                        <div className="px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold rounded-lg shrink-0">
                          {Math.floor(qrCodeTimer / 60)}:{(qrCodeTimer % 60).toString().padStart(2, '0')} min remaining
                        </div>
                      </div>

                      <div className="w-44 h-44 bg-white dark:bg-slate-950 rounded-2xl mx-auto flex items-center justify-center border-4 border-slate-150 dark:border-slate-850 relative overflow-hidden shadow-lg p-4">
                        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-transparent -z-10" />
                        <div className="text-center w-full">
                          {/* Rich Simulated UPI QR */}
                          <div className="w-28 h-28 mx-auto border border-slate-300 dark:border-slate-800 p-1 flex flex-col justify-between bg-white rounded-lg relative">
                            {/* Inner App Center logo overlay to look premium */}
                            <div className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-slate-900 border border-white flex items-center justify-center font-bold text-slate-100 text-[10px] shadow-md z-10">
                              {selectedUpiApp === 'gpay' ? 'GPay' : 
                               selectedUpiApp === 'phonepe' ? 'Pe' : 
                               selectedUpiApp === 'paytm' ? 'pay' : 'UPI'}
                            </div>
                            
                            <div className="flex justify-between h-4 w-full">
                              <div className="w-4 h-4 bg-slate-900 rounded-[2px]" />
                              <div className="w-4 h-4 bg-slate-900 rounded-[2px]" />
                            </div>
                            <div className="text-slate-500 font-mono text-[6px] tracking-tighter leading-none py-1">
                              SECURE CLARITY NODE CODES
                            </div>
                            <div className="flex justify-between h-4 w-full">
                              <div className="w-4 h-4 bg-slate-900 rounded-[2px]" />
                              <div className="w-3.5 h-3.5 bg-emerald-500 rounded-[2px]" />
                            </div>
                          </div>
                          <span className="text-[10px] text-emerald-500 font-bold block mt-3 font-mono">ID: escrow-{freelancer.id}@clarity</span>
                        </div>
                      </div>

                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsProcessing(true);
                            setProcessingStatus('Simulating dynamic handshake feedback...');
                            setTimeout(() => {
                              setIsProcessing(false);
                              setStep('success');
                            }, 1200);
                          }}
                          className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-1 cursor-pointer mx-auto"
                        >
                          💸 Simulate Sandbox QR Payment Scan
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : paymentMethod === 'wallet' ? (
                <div className="space-y-4 py-4 text-center">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800 text-left">
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Scan Clarity secure UPI Code or pay via wallet link</h4>
                    <p className="text-xs text-slate-400 mt-1">Make direct instantaneous payments from any supported wallet app.</p>
                  </div>
                  <div className="w-44 h-44 bg-zinc-200 dark:bg-zinc-800 rounded-2xl mx-auto flex items-center justify-center border-4 border-slate-100 dark:border-slate-800 relative overflow-hidden shadow-inner group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent -z-10" />
                    {/* Visual QR element */}
                    <div className="text-center p-4">
                      <div className="font-mono text-[9px] tracking-wide mb-1 text-slate-500">CLARITY PAY QR</div>
                      <div className="w-24 h-24 mx-auto border-2 border-slate-800 dark:border-slate-250 p-1 flex flex-col gap-1 justify-between bg-white">
                        <div className="flex justify-between h-4 w-full">
                          <div className="w-4 h-4 bg-slate-900 animate-pulse" />
                          <div className="w-4 h-4 bg-slate-900" />
                        </div>
                        <div className="text-slate-800 font-mono text-[7px] leading-tight select-none">SCAN ENCRYPTED CONTRACT DIRECTLY FROM PHONE</div>
                        <div className="flex justify-between h-4 w-full">
                          <div className="w-4 h-4 bg-slate-900" />
                          <div className="w-3 h-3 bg-emerald-500" />
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-500 font-bold block mt-2 font-mono">ID: pay@clarity</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">Scan this code using your standard camera or payment utility.</p>
                </div>
              ) : (
                <div className="space-y-4 py-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-105 dark:border-slate-800/80">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-emerald-500" /> Instant Escrow Wire Instructions
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Make secure bank wire transfers. Once submitted, funds are cleared automatically into contract custody upon detection of unique identifier.
                  </p>
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-2 text-xs font-mono">
                    <div className="flex justify-between"><span className="text-slate-400">Bank Name</span><span className="text-slate-800 dark:text-slate-200 font-medium font-sans">CLARITY HORIZON SVB</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Account Number</span><span className="text-slate-800 dark:text-slate-200 font-medium">9842 1248 1192 4891</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Routing Transit Number</span><span className="text-slate-800 dark:text-slate-200 font-medium">021000021</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Payment Reference (Mandatory)</span><span className="text-emerald-500 font-black">CL-ESCROW-{freelancer.id}-{hours}</span></div>
                  </div>
                </div>
              )}

              {/* Secure terms checkbox and submit button */}
              <div className="space-y-4">
                <p className="text-[11px] text-slate-400 leading-tight">
                  By clicking "Deposit into Secure Escrow", you authorize Clarity.AI to place a reserve deposit of <strong className="font-bold text-slate-900 dark:text-white">${totalAmount.toFixed(2)}</strong> on your account. Settlement occurs automatically once the freelancer completes work and files a completion claim.
                </p>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep('milestone')}
                    className="py-3.5 px-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold text-sm transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg active:scale-[0.99] transition-all"
                  >
                    Confirm & Deposit ${totalAmount.toFixed(2)}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* STEP 3: OTP VERIFICATION CHALLENGE */}
          {step === 'otp' && (
            <div className="space-y-6 text-center py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Lock className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-white">Verify Dynamic OTP Code</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">
                  To safeguard your funds and authorize this <strong className="font-bold text-slate-900 dark:text-white">${totalAmount.toFixed(2)}</strong> transaction, provide the smart-challenge code sent to your registered device.
                </p>
                <div className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-mono font-medium text-slate-500">
                  Demo Auth Challenge Token Code: <span className="font-bold text-emerald-500">1234</span>
                </div>
              </div>

              {/* OTP Squares Input Grid */}
              <div className="flex justify-center gap-4.5 my-8">
                {otpCode.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-input-${i}`}
                    type="text"
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-16 h-16 bg-slate-50 dark:bg-slate-850 text-2xl font-black text-center text-slate-800 dark:text-white rounded-2xl border-2 border-slate-200 dark:border-slate-750 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none focus:scale-105 transition-all font-mono"
                    maxLength={1}
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              {otpError && (
                <p className="text-xs text-red-500 font-sans font-medium mb-4">{otpError}</p>
              )}

              <div className="space-y-4 max-w-sm mx-auto">
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-all shadow-md active:scale-[0.98]"
                >
                  Verify Transaction Code
                </button>
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-250 transition-colors block mx-auto underline"
                >
                  Change Payment Method
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS INVOICE RECEIPT */}
          {step === 'success' && (
            <div className="space-y-6 text-center animate-fade-in py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-2 relative">
                <CheckCircle2 className="w-10 h-10 animate-pulse text-emerald-500" />
                <div className="absolute -inset-1 rounded-full border border-emerald-500/30 animate-ping -z-10" />
              </div>

              <div className="space-y-1.5">
                <h3 className="font-display font-black text-3xl text-slate-900 dark:text-white">Escrow Secured!</h3>
                <p className="text-emerald-500 text-sm font-semibold tracking-wide uppercase font-mono">Contract Approved & Safe Deposits Loaded</p>
                <p className="text-slate-500 text-xs max-w-sm mx-auto">
                  A verification confirmation has been sent to both you and <span className="font-semibold text-slate-800 dark:text-slate-200">{freelancer.name}</span>.
                </p>
              </div>

              {/* Detailed invoice box */}
              <div className="max-w-md mx-auto bg-slate-50 dark:bg-slate-950/40 rounded-3xl p-6 border border-slate-100 dark:border-slate-850/80 text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl -z-10" />
                
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800/80 mb-4">
                  <span className="font-mono text-xs text-slate-400">INVOICE TXN ID</span>
                  <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">#CL-ESCROW-{Math.floor(100000 + Math.random() * 900000)}</span>
                </div>

                <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-1"><User className="w-3.5 h-3.5" /> Client Entity</span>
                    <span className="text-slate-800 dark:text-slate-250 font-semibold">Self-Entity (Client Partner)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> Appointed Freelancer</span>
                    <span className="text-slate-800 dark:text-teal-400 font-bold">{freelancer.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Allocated Task Duration</span>
                    <span className="font-mono text-slate-800 dark:text-slate-250 font-bold">{hours} Hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> Milestone Objective</span>
                    <span className="text-slate-800 dark:text-slate-250 truncate max-w-[200px] font-medium" title={milestoneDesc}>{milestoneDesc}</span>
                  </div>
                  
                  <div className="border-t border-dashed border-slate-200 dark:border-slate-800/80 pt-4 mt-2 flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-800 dark:text-white">Funds Deposited Securely</span>
                    <span className="text-xl font-mono text-emerald-500 font-black">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Action options */}
              <div className="flex flex-col gap-3 max-w-sm mx-auto pt-2">
                <button
                  type="button"
                  onClick={() => {
                    alert('Successfully saved PDF invoice document reference locally!');
                  }}
                  className="w-full py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all text-xs font-bold flex items-center justify-center gap-2 text-slate-700 dark:text-slate-300"
                >
                  <Download className="w-4 h-4 text-emerald-500" />
                  Save Certified PDF Receipt
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm hover:opacity-95 shadow-md active:scale-[0.98] transition-all"
                >
                  Return to Freelancers Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer bar */}
        <div className="px-6 py-4 border-t border-slate-150 dark:border-slate-850 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20 text-xs text-slate-400">
          <div className="flex items-center gap-1 ml-1">
            <Lock className="w-3.5 h-3.5 text-emerald-400 mr-1" />
            Military Grade 256-Bit SSL Secured
          </div>
          <div>
            Powered by Clarity SafePay™ Escrow
          </div>
        </div>
      </div>
    </div>
  );
};
