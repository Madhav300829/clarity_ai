import React, { FC, useState, useEffect } from 'react';
import { XMarkIcon, WalletIcon, CoinIcon, SpinnerIcon } from './icons/Icons';
import { Button } from './ui/Button';
import { useTranslation } from '../context/LanguageContext';
import { Smartphone, QrCode, CreditCard, ChevronRight, PlusCircle, ArrowUpRight, ArrowDownLeft, ShieldCheck, Check } from 'lucide-react';

interface WalletPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'escrow_hold' | 'credit_earn';
  amount: number;
  currency: string;
  date: string;
  label: string;
  status: 'completed' | 'pending';
}

export const WalletPanel: FC<WalletPanelProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  
  // Wallet state persisted in localStorage
  const [balance, setBalance] = useState<number>(250);
  const [credits, setCredits] = useState<number>(120);
  const [activeTab, setActiveTab] = useState<'funds' | 'credits'>('funds');
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'tx_101',
      type: 'deposit',
      amount: 150.00,
      currency: 'USD',
      date: '2026-05-28 14:32',
      label: 'Secure UPI Escrow Deposit',
      status: 'completed'
    },
    {
      id: 'tx_102',
      type: 'credit_earn',
      amount: 20,
      currency: 'Credits',
      date: '2026-05-27 10:15',
      label: 'Knowledge Hub Helpful Upvote Match',
      status: 'completed'
    },
    {
      id: 'tx_103',
      type: 'escrow_hold',
      amount: 100.00,
      currency: 'USD',
      date: '2026-05-26 18:45',
      label: 'Hired Expert Active Milestone Vault Lock',
      status: 'completed'
    }
  ]);

  // Input States for Adding Funds
  const [fundingAmount, setFundingAmount] = useState<string>('50');
  const [fundingMethod, setFundingMethod] = useState<'upi' | 'card'>('upi');
  const [fundingUpiId, setFundingUpiId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [addFundsSuccess, setAddFundsSuccess] = useState<boolean>(false);
  const [showAddSection, setShowAddSection] = useState<boolean>(false);

  // Load from localStorage
  useEffect(() => {
    const savedBalance = localStorage.getItem('clarity_wallet_balance');
    const savedCredits = localStorage.getItem('clarity_wallet_credits');
    const savedTxs = localStorage.getItem('clarity_wallet_transactions');
    if (savedBalance) setBalance(parseFloat(savedBalance));
    if (savedCredits) setCredits(parseInt(savedCredits, 10));
    if (savedTxs) {
      try {
        setTransactions(JSON.parse(savedTxs));
      } catch (e) {
        console.error(e);
      }
    }
  }, [isOpen]);

  // Sync to localStorage Helper
  const syncWallet = (newBalance: number, newCredits: number, newTxs: Transaction[]) => {
    setBalance(newBalance);
    setCredits(newCredits);
    setTransactions(newTxs);
    localStorage.setItem('clarity_wallet_balance', newBalance.toString());
    localStorage.setItem('clarity_wallet_credits', newCredits.toString());
    localStorage.setItem('clarity_wallet_transactions', JSON.stringify(newTxs));
    
    // Dispatch a storage event or window update so Header or other components update instantly
    window.dispatchEvent(new Event('wallet_updated'));
  };

  const handleAddFundsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(fundingAmount);
    if (!amountNum || amountNum <= 0) return;

    setIsProcessing(true);
    setAddFundsSuccess(false);

    setTimeout(() => {
      const newBalance = balance + amountNum;
      const newTx: Transaction = {
        id: `tx_${Date.now()}`,
        type: 'deposit',
        amount: amountNum,
        currency: 'USD',
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        label: fundingMethod === 'upi' ? `Instant UPI Deposit (${fundingUpiId || 'UPI App'})` : 'Encrypted Credit Card Deposit',
        status: 'completed'
      };
      
      const newTxs = [newTx, ...transactions];
      syncWallet(newBalance, credits, newTxs);

      setIsProcessing(false);
      setAddFundsSuccess(true);
      setFundingAmount('50');
      
      // Auto-hide success screen after a couple of seconds
      setTimeout(() => {
        setAddFundsSuccess(false);
        setShowAddSection(false);
      }, 2000);
    }, 1500);
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        ></div>
      )}
      <div className={`fixed top-20 right-4 md:right-32 z-50 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-250/80 dark:border-slate-800 w-96 transform transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'}`}>
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-emerald-500/5 to-transparent rounded-t-3xl">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-500/10 text-emerald-550 rounded-lg">
              <WalletIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {t('dashboard.myWallet.title')}
              </h3>
              <p className="text-[10px] text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Secured Partner Escrow account
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white p-1 rounded-full transition-colors bg-slate-100/50 dark:bg-slate-800/50"
          >
            <XMarkIcon />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 gap-1 p-2 bg-slate-50 dark:bg-slate-850/60 border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => {
              setActiveTab('funds');
              setShowAddSection(false);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'funds' ? 'bg-white dark:bg-slate-800 text-emerald-500 shadow-sm' : 'text-slate-500'}`}
          >
            💵 {t('dashboard.myWallet.funds')}
          </button>
          <button
            onClick={() => {
              setActiveTab('credits');
              setShowAddSection(false);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'credits' ? 'bg-white dark:bg-slate-800 text-emerald-500 shadow-sm' : 'text-slate-500'}`}
          >
            ✨ {t('dashboard.myWallet.credits')}
          </button>
        </div>

        {/* Body content */}
        <div className="p-4 max-h-[460px] overflow-y-auto space-y-4">
          
          {/* Funds Tab View */}
          {activeTab === 'funds' && (
            <>
              {/* Balance Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 text-white relative overflow-hidden shadow-lg shadow-emerald-500/20">
                <div className="absolute right-0 bottom-0 translate-y-4 translate-x-4 opacity-10">
                  <WalletIcon className="w-40 h-40" />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-white/80 font-semibold">{t('dashboard.myWallet.balance')}</span>
                    <h2 className="text-3xl font-extrabold mt-1 tracking-tight">${balance.toFixed(2)}</h2>
                  </div>
                  <span className="bg-white/20 text-white px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm">
                    {t('dashboard.myWallet.currency')}: USD
                  </span>
                </div>
                
                {/* Micro Escrow alert info line */}
                <p className="text-[10px] text-emerald-100 mt-4 leading-relaxed bg-white/10 p-2 rounded-xl border border-white/10 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  No processing or platform escrow transfer fees applied
                </p>
                
                <div className="grid grid-cols-2 gap-2 mt-4 pt-1">
                  <button
                    onClick={() => {
                      setShowAddSection(!showAddSection);
                    }}
                    className="py-2 bg-white text-emerald-600 hover:bg-emerald-50 text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-emerald-500" />
                    {t('dashboard.myWallet.addFunds')}
                  </button>
                  <button
                    onClick={() => {
                      alert("Withdrawal pipeline requests require account tax registration verification.");
                    }}
                    className="py-2 bg-emerald-600/30 hover:bg-emerald-600/40 text-white text-xs font-bold rounded-xl transition-all border border-white/20"
                  >
                    {t('dashboard.myWallet.withdraw')}
                  </button>
                </div>
              </div>

              {/* Add funds collapsible interactive section */}
              {showAddSection && (
                <div className="p-4 border border-emerald-500/10 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-2xl space-y-3 relative overflow-hidden">
                  <h4 className="font-bold text-xs text-slate-800 dark:text-white uppercase tracking-wider flex items-center justify-between">
                    <span>Add Instantly & Safely</span>
                    <button onClick={() => setShowAddSection(false)} className="text-slate-400 hover:text-slate-900">&times;</button>
                  </h4>

                  {addFundsSuccess ? (
                    <div className="p-4 bg-emerald-500/15 text-emerald-600 text-center rounded-xl space-y-1">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto text-sm">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <p className="font-bold text-xs">Payment Deposited!</p>
                      <p className="text-[10px] text-slate-400">Vault balances instantly adjusted.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleAddFundsSubmit} className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">ADD AMOUNT (USD)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">$</span>
                          <input
                            type="number"
                            value={fundingAmount}
                            onChange={(e) => setFundingAmount(e.target.value)}
                            className="w-full pl-7 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl font-bold font-mono outline-none text-xs"
                            min="5"
                            max="10000"
                            required
                          />
                        </div>
                      </div>

                      {/* Payment Method toggle */}
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setFundingMethod('upi')}
                          className={`py-1.5 rounded-lg border text-[10px] font-bold flex items-center justify-center gap-1 ${fundingMethod === 'upi' ? 'border-emerald-500 bg-white dark:bg-slate-800 text-emerald-500' : 'border-slate-200 text-slate-500'}`}
                        >
                          <Smartphone className="w-3 h-3 text-emerald-500" />
                          UPI App / VPA
                        </button>
                        <button
                          type="button"
                          onClick={() => setFundingMethod('card')}
                          className={`py-1.5 rounded-lg border text-[10px] font-bold flex items-center justify-center gap-1 ${fundingMethod === 'card' ? 'border-emerald-500 bg-white dark:bg-slate-800 text-emerald-500' : 'border-slate-200 text-slate-500'}`}
                        >
                          <CreditCard className="w-3 h-3 text-emerald-500" />
                          Credit Card
                        </button>
                      </div>

                      {fundingMethod === 'upi' ? (
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-slate-400">UPI VPA ADDRESS (e.g. user@okhdfcbank)</label>
                          <input
                            type="text"
                            value={fundingUpiId}
                            onChange={(e) => setFundingUpiId(e.target.value)}
                            placeholder="claritypay@okhdfc"
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl outline-none font-mono text-xs"
                            required
                          />
                          <p className="text-[9px] text-slate-400">Loads secure push checkout sandbox handshake.</p>
                        </div>
                      ) : (
                        <div className="space-y-1.5 text-center p-2 rounded-xl bg-slate-50/50 dark:bg-slate-850/50 border border-slate-200/50 text-xs">
                          💳 Simulated Card checkout instantly.
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-1"
                      >
                        {isProcessing ? (
                          <>
                            <SpinnerIcon className="w-4 h-4 text-white" />
                            Gateway Processing...
                          </>
                        ) : (
                          `Deposit $${parseFloat(fundingAmount) || 0} Safely`
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Transactions list */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Recent Activities
                </h4>
                <div className="space-y-2 bg-slate-50 dark:bg-slate-850 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {transactions.filter(tx => tx.currency !== 'Credits').map(tx => (
                    <div key={tx.id} className="flex justify-between items-center p-2 rounded-xl hover:bg-white dark:hover:bg-slate-805 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-xl ${tx.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                          {tx.type === 'deposit' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-250">{tx.label}</p>
                          <p className="text-[10px] text-slate-400">{tx.date}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-bold font-mono ${tx.type === 'deposit' ? 'text-emerald-500' : 'text-slate-600 dark:text-slate-350'}`}>
                        {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Credits Tab View */}
          {activeTab === 'credits' && (
            <>
              {/* Credits Balance Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500 via-sky-600 to-indigo-700 text-white relative overflow-hidden shadow-lg shadow-indigo-500/15">
                <div className="absolute right-0 bottom-0 translate-y-4 translate-x-4 opacity-10">
                  <CoinIcon className="w-40 h-40" />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-white/80 font-semibold">{t('dashboard.myCredits.title')}</span>
                    <h2 className="text-3xl font-extrabold mt-1 tracking-tight flex items-center gap-1.5">
                      <span>{credits}</span>
                      <span className="text-sm font-normal text-indigo-200">Credits</span>
                    </h2>
                  </div>
                  <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-[9px] font-bold uppercase backdrop-blur-sm">
                    Non-Exchangeable
                  </span>
                </div>
                
                {/* Micro tooltip info line */}
                <p className="text-[10px] text-indigo-100 mt-4 leading-relaxed bg-white/10 p-2.5 rounded-xl border border-white/15">
                  {t('dashboard.myCredits.tooltip')}
                </p>
              </div>

              {/* Credits History section */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Credits Tracking
                </h4>
                <div className="space-y-2 bg-slate-50 dark:bg-slate-850 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {transactions.filter(tx => tx.currency === 'Credits').map(tx => (
                    <div key={tx.id} className="flex justify-between items-center p-2 rounded-xl">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
                          <ArrowDownLeft className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-250">{tx.label}</p>
                          <p className="text-[10px] text-slate-400">{tx.date}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-indigo-500 font-mono">
                        +{tx.amount} cr
                      </span>
                    </div>
                  ))}
                  
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 rounded-xl leading-relaxed">
                    🌟 Earn <strong>+20 Credits</strong> for each helpful response shared in the Knowledge Hub tab.
                  </div>
                </div>
              </div>
            </>
          )}

        </div>

        {/* Footer info lock banner */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-b-3xl text-[10px] text-slate-400 text-center border-t border-slate-100 dark:border-slate-800/80 font-mono">
          🔒 Clarity Secured Core Escrow Vault Node Encryption Active
        </div>
      </div>
    </>
  );
};
