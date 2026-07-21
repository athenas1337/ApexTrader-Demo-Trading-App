import React from 'react';
import { X, ShieldCheck, Lock, HardDrive, FileCheck, Check, Key } from 'lucide-react';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-dark-800 border border-dark-600 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-dark-700 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">AttaTrader Security & Auth Audit</h3>
              <p className="text-xs text-slate-400">Tiered Sync & Secret Code Engine</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white bg-dark-700 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-slate-300">
          <div className="bg-dark-900/80 border border-dark-700 rounded-2xl p-4 flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-trade-accent shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white text-sm mb-1">3-Tier User Auth Hierarchy</h4>
              <p className="text-slate-400 leading-relaxed">
                Supports GUEST mode for local demo trading, plus Email and Google OAuth Netlify Identity authentication to unlock Weekend Tournaments and sync display names cleanly to the social leaderboard.
              </p>
            </div>
          </div>

          <div className="bg-dark-900/80 border border-dark-700 rounded-2xl p-4 flex items-start space-x-3">
            <Key className="w-5 h-5 text-trade-gold shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white text-sm mb-1">Secret Code Validation (@thA1337)</h4>
              <p className="text-slate-400 leading-relaxed">
                Case-sensitive string validator for secret redeem code <code className="text-trade-gold bg-dark-800 px-1 py-0.5 rounded font-mono">@thA1337</code> unlocking Developer Mode Bypass Toggle.
              </p>
            </div>
          </div>

          <div className="bg-dark-900/80 border border-dark-700 rounded-2xl p-4 flex items-start space-x-3">
            <FileCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white text-sm mb-1">Currency Calibration & Hardening</h4>
              <ul className="mt-2 space-y-1 text-[11px] text-slate-400 font-mono">
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-trade-green" /> USD-to-IDR exchange rate calibrated to 17,500 IDR base range</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-trade-green" /> XSS Input Sanitization & Fault-Tolerant Hydration Storage</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-trade-green" /> Netlify Security Headers & SSL Encryption</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-dark-700 text-right">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-dark-900 font-extrabold text-xs rounded-xl transition-all shadow"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
