import React, { useState } from 'react';
import { useAtta } from '../context/AttaContext';
import { ChartStyle } from '../types/trading';
import {
  Settings,
  X,
  User,
  Shield,
  Volume2,
  VolumeX,
  Key,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Lock,
  Unlock,
  LogOut,
  Mail,
  Zap,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    userProfile,
    loginEmail,
    loginGoogle,
    logoutUser,
    updateDisplayName,
    settings,
    updateSettings,
    redeemSecretCode,
  } = useAtta();

  const [activeTab, setActiveTab] = useState<'profile' | 'risk' | 'audiovisual' | 'redeem'>('profile');
  const [displayNameInput, setDisplayNameInput] = useState(userProfile.displayName);
  const [emailInput, setEmailInput] = useState('');
  const [redeemInput, setRedeemInput] = useState('');
  const [redeemFeedback, setRedeemFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (userProfile.authType === 'GUEST') {
      if (emailInput.trim()) {
        loginEmail(emailInput.trim(), displayNameInput);
      }
    } else {
      updateDisplayName(displayNameInput);
    }
  };

  const handleRedeemCode = (e: React.FormEvent) => {
    e.preventDefault();
    setRedeemFeedback(null);

    const res = redeemSecretCode(redeemInput);
    if (res.success) {
      setRedeemFeedback({ type: 'success', text: res.message });
      setRedeemInput('');
    } else {
      setRedeemFeedback({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-dark-800 border border-dark-600 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dark-700 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-trade-accent/20 border border-trade-accent/40 flex items-center justify-center text-trade-accent">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">AttaTrader Settings & Modals</h3>
              <p className="text-xs text-slate-400">Account Sync, Preferences & Secret Redeem</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white bg-dark-700 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-4 gap-1 bg-dark-900/80 p-1 rounded-2xl border border-dark-700 mb-5 text-xs font-bold">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-1 ${
              activeTab === 'profile' ? 'bg-trade-accent text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('risk')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-1 ${
              activeTab === 'risk' ? 'bg-trade-accent text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Risk Rules</span>
          </button>

          <button
            onClick={() => setActiveTab('audiovisual')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-1 ${
              activeTab === 'audiovisual' ? 'bg-trade-accent text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Audio/Visual</span>
          </button>

          <button
            onClick={() => setActiveTab('redeem')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-1 ${
              activeTab === 'redeem' ? 'bg-trade-gold text-dark-900 font-extrabold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Redeem Code</span>
          </button>
        </div>

        {/* TAB 1: PROFILE & AUTH HIERARCHY */}
        {activeTab === 'profile' && (
          <div className="space-y-4 overflow-y-auto pr-1 text-xs">
            <div className="bg-dark-900/80 border border-dark-700 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Auth Tier</span>
                <span className="text-sm font-extrabold text-white flex items-center gap-1.5 mt-0.5">
                  {userProfile.authType === 'GUEST' ? (
                    <span className="px-2 py-0.5 bg-dark-700 text-slate-300 rounded border border-dark-600">GUEST MODE</span>
                  ) : userProfile.authType === 'EMAIL_USER' ? (
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded border border-blue-500/30">EMAIL VERIFIED</span>
                  ) : (
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/30">GOOGLE OAUTH VERIFIED</span>
                  )}
                </span>
              </div>

              {userProfile.authType !== 'GUEST' && (
                <button
                  onClick={logoutUser}
                  className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 rounded-xl font-bold transition-all flex items-center space-x-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3 font-mono">
              <div>
                <label className="text-slate-400 font-sans font-bold block mb-1">Display Name / Leaderboard Username</label>
                <input
                  type="text"
                  value={displayNameInput}
                  onChange={(e) => setDisplayNameInput(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-600 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-trade-accent"
                  placeholder="Your Trader Name"
                />
              </div>

              {userProfile.authType === 'GUEST' && (
                <div>
                  <label className="text-slate-400 font-sans font-bold block mb-1">Email Address (Netlify Auth Sync)</label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full bg-dark-900 border border-dark-600 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-trade-accent"
                    placeholder="trader@example.com"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-trade-accent hover:bg-blue-600 text-white font-extrabold font-sans rounded-xl transition-all"
              >
                Save Profile & Sync Display Name
              </button>
            </form>

            {userProfile.authType === 'GUEST' && (
              <div className="pt-2 border-t border-dark-700">
                <span className="text-[11px] text-slate-400 font-bold uppercase block mb-2">Instant Netlify Identity OAuth</span>
                <button
                  type="button"
                  onClick={() => loginGoogle()}
                  className="w-full py-2.5 bg-dark-900 hover:bg-dark-700 border border-dark-600 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4 text-trade-gold" />
                  <span>Authenticate with Google OAuth</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: RISK & TRADING RULES */}
        {activeTab === 'risk' && (
          <div className="space-y-4 font-mono text-xs">
            <div className="bg-dark-900/80 border border-dark-700 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="font-bold text-white text-sm block font-sans">2% Capital Risk Limit Rule</span>
                <span className="text-[11px] text-slate-400 font-sans">Restricts maximum trade margin to 2% of account balance.</span>
              </div>
              <button
                type="button"
                onClick={() => updateSettings({ riskRule2Percent: !settings.riskRule2Percent })}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.riskRule2Percent ? 'bg-trade-green' : 'bg-dark-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.riskRule2Percent ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="bg-dark-900/80 border border-dark-700 rounded-2xl p-4 space-y-2">
              <label className="font-bold text-white text-sm block font-sans">Default Forex Leverage</label>
              <select
                value={settings.defaultForexLeverage}
                onChange={(e) => updateSettings({ defaultForexLeverage: parseInt(e.target.value) })}
                className="w-full bg-dark-800 border border-dark-600 rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                <option value={100}>1:100 Leverage</option>
                <option value={200}>1:200 Leverage</option>
                <option value={300}>1:300 Leverage</option>
                <option value={400}>1:400 Leverage</option>
                <option value={500}>1:500 Leverage</option>
              </select>
            </div>
          </div>
        )}

        {/* TAB 3: AUDIO & VISUAL PREFERENCES */}
        {activeTab === 'audiovisual' && (
          <div className="space-y-4 font-mono text-xs">
            <div className="bg-dark-900/80 border border-dark-700 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="font-bold text-white text-sm block font-sans">Audio Signal Chimes</span>
                <span className="text-[11px] text-slate-400 font-sans">Play Web Audio synthesized chimes on order execution and price alarms.</span>
              </div>
              <button
                type="button"
                onClick={() => updateSettings({ audioSignals: !settings.audioSignals })}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.audioSignals ? 'bg-trade-accent' : 'bg-dark-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.audioSignals ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="bg-dark-900/80 border border-dark-700 rounded-2xl p-4 space-y-2">
              <label className="font-bold text-white text-sm block font-sans">Default Chart Style</label>
              <select
                value={settings.defaultChartStyle}
                onChange={(e) => updateSettings({ defaultChartStyle: e.target.value as ChartStyle })}
                className="w-full bg-dark-800 border border-dark-600 rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                <option value="candles">Candlesticks</option>
                <option value="heikin_ashi">Heikin Ashi</option>
                <option value="line">Line Chart</option>
              </select>
            </div>
          </div>
        )}

        {/* TAB 4: SECRET REDEEM CODE (@thA1337) */}
        {activeTab === 'redeem' && (
          <div className="space-y-4 text-xs font-mono">
            <div className="bg-dark-900/90 border border-dark-700 rounded-2xl p-4 space-y-3">
              <div className="flex items-center space-x-2 text-trade-gold font-sans font-bold text-sm">
                <Key className="w-4 h-4" />
                <span>Enter Case-Sensitive Redeem Code</span>
              </div>

              <form onSubmit={handleRedeemCode} className="space-y-3">
                <input
                  type="text"
                  value={redeemInput}
                  onChange={(e) => setRedeemInput(e.target.value)}
                  placeholder="Enter secret code (e.g. @thA1337)"
                  className="w-full bg-dark-800 border border-dark-600 rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none focus:border-trade-gold"
                />

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-trade-gold to-amber-500 hover:from-amber-500 hover:to-amber-600 text-dark-900 font-extrabold font-sans rounded-xl transition-all shadow"
                >
                  Redeem Code
                </button>
              </form>

              {redeemFeedback && (
                <div
                  className={`p-3 rounded-xl font-sans text-xs font-semibold flex items-center space-x-2 ${
                    redeemFeedback.type === 'success' ? 'bg-trade-green/15 text-trade-green border border-trade-green/30' : 'bg-trade-red/15 text-trade-red border border-trade-red/30'
                  }`}
                >
                  {redeemFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{redeemFeedback.text}</span>
                </div>
              )}
            </div>

            {/* Hidden Developer Mode Bypass Toggle (Unlocked via @thA1337) */}
            {settings.devModeBypass && (
              <div className="bg-amber-500/10 border border-amber-500/40 rounded-2xl p-4 space-y-2 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-amber-400 text-sm block font-sans flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> Developer Mode Bypass Toggle
                    </span>
                    <span className="text-[11px] text-slate-300 font-sans">
                      Bypasses calendar checks to force-activate Weekend Tournament layout on any day of the week!
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSettings({ devModeBypass: !settings.devModeBypass })}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.devModeBypass ? 'bg-amber-500' : 'bg-dark-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-dark-900 transition-transform ${settings.devModeBypass ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
