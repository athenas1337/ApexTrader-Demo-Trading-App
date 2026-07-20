import React from 'react';
import { X, ShieldCheck, Lock, HardDrive, FileCheck, Check } from 'lucide-react';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-dark-800 border border-dark-600 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dark-700 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Application Security & Privacy</h3>
              <p className="text-xs text-slate-400">FinTech Web Application Architecture</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-dark-700 hover:bg-dark-600 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="space-y-4 text-xs text-slate-300">
          <div className="bg-dark-900/80 border border-dark-700 rounded-2xl p-4 flex items-start space-x-3">
            <HardDrive className="w-5 h-5 text-trade-accent shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white text-sm mb-1">Local Guest Persistence</h4>
              <p className="text-slate-400 leading-relaxed">
                Your portfolio, active trades, limit orders, and top-up records are persisted securely in your browser's Local Storage. No external login (Google/OAuth) is required, and your data never leaves your device.
              </p>
            </div>
          </div>

          <div className="bg-dark-900/80 border border-dark-700 rounded-2xl p-4 flex items-start space-x-3">
            <Lock className="w-5 h-5 text-trade-gold shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white text-sm mb-1">Zero Real Financial Risk</h4>
              <p className="text-slate-400 leading-relaxed">
                All balances are denominated in Virtual Seed Tokens (VST). There are no real crypto/forex deposits, external web3 wallet prompts, or monetary transactions.
              </p>
            </div>
          </div>

          <div className="bg-dark-900/80 border border-dark-700 rounded-2xl p-4 flex items-start space-x-3">
            <FileCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white text-sm mb-1">Netlify & Production Hardening</h4>
              <p className="text-slate-400 leading-relaxed">
                Pre-configured with <code className="text-trade-accent bg-dark-800 px-1 py-0.5 rounded font-mono">netlify.toml</code> containing strict security headers:
              </p>
              <ul className="mt-2 space-y-1 text-[11px] text-slate-400 font-mono">
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-trade-green" /> X-Frame-Options: SAMEORIGIN</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-trade-green" /> X-Content-Type-Options: nosniff</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-trade-green" /> Referrer-Policy: strict-origin-when-cross-origin</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-trade-green" /> XSS Input Sanitization & Type Validation</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Close */}
        <div className="mt-6 pt-4 border-t border-dark-700 text-right">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-dark-900 font-extrabold text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/20"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
