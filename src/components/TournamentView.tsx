import React, { useState } from 'react';
import { useAtta } from '../context/AttaContext';
import { TradingViewChart } from './TradingViewChart';
import { OrderPanel } from './OrderPanel';
import { formatBaseCurrency, formatPercentage } from '../utils/formatters';
import {
  Trophy,
  Lock,
  Sparkles,
  Award,
  Users,
  CheckCircle2,
  Mail,
  ShieldCheck,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { SettingsModal } from './SettingsModal';
import { TournamentCelebrationModal } from './TournamentCelebrationModal';
import { ActivePositionsQuickClose } from './ActivePositionsQuickClose';

export const TournamentView: React.FC = () => {
  const {
    userProfile,
    loginGoogle,
    isWeekendTournamentActive,
    tournamentEquityUSD,
    leaderboard,
    tournamentTimeRemaining,
    showCelebrationModal,
    setShowCelebrationModal,
    settings,
  } = useAtta();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // If user is GUEST and Dev Mode bypass is NOT active: Show Lock Splash Screen
  if (userProfile.authType === 'GUEST' && !settings.devModeBypass) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="bg-dark-800 border border-dark-600/80 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Weekend Tournament Locked
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
            Tournament locked. Please sign in via Email or Google to compete on the global social leaderboard with $100 USD locked seed capital.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3 max-w-md mx-auto">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="py-3 px-6 bg-trade-accent hover:bg-blue-600 text-white font-extrabold text-xs rounded-xl transition-all shadow flex items-center justify-center space-x-2"
            >
              <Mail className="w-4 h-4" />
              <span>Sign In / Sign Up with Email</span>
            </button>

            <button
              onClick={() => loginGoogle()}
              className="py-3 px-6 bg-dark-900 hover:bg-dark-700 border border-dark-600 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-trade-gold" />
              <span>Google OAuth Sign In</span>
            </button>
          </div>
        </div>

        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1920px] mx-auto pb-12">
      {/* Active Tournament Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-dark-800 to-amber-950 border border-amber-500/40 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-trade-gold/20 border border-trade-gold/40 flex items-center justify-center text-trade-gold shadow-lg">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-extrabold text-white tracking-tight">AttaTrader Weekend Tournament</h2>
                {settings.devModeBypass && (
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-[10px] font-bold font-mono">
                    DEVELOPER VERIFICATION ACTIVE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                $100.00 USD Locked Seed Capital - Ranked by Real-Time Total Equity
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-5">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Session Time Remaining</span>
              <span className="text-sm font-extrabold font-mono text-amber-400 flex items-center justify-end space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{tournamentTimeRemaining}</span>
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Tournament Equity</span>
              <span className="text-xl font-extrabold font-mono text-trade-gold">${tournamentEquityUSD.toFixed(2)} USD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Chart & Order Deck + Social Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <TradingViewChart />
          <ActivePositionsQuickClose />
        </div>

        <div className="lg:col-span-4 space-y-6">
          {/* Social Leaderboard */}
          <div className="bg-dark-800 border border-dark-600/80 rounded-2xl p-4 shadow-xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-dark-700 pb-3 mb-3">
              <span className="font-sans font-bold text-white text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-trade-accent" />
                Tournament Leaderboard
              </span>
              <span className="text-[10px] font-sans text-slate-400 uppercase">Live Rank</span>
            </div>

            <div className="divide-y divide-dark-700/60">
              {leaderboard.map((entry) => (
                <div
                  key={entry.userId}
                  className={`py-2.5 px-2 flex items-center justify-between rounded-xl transition-colors ${
                    entry.isCurrentUser ? 'bg-trade-accent/20 border border-trade-accent/40 font-bold' : 'hover:bg-dark-700/40'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                      entry.rank === 1 ? 'bg-amber-400 text-dark-900' : entry.rank === 2 ? 'bg-slate-300 text-dark-900' : entry.rank === 3 ? 'bg-amber-700 text-white' : 'bg-dark-700 text-slate-400'
                    }`}>
                      {entry.rank}
                    </span>
                    <div>
                      <span className="font-sans font-bold text-white block">{entry.displayName}</span>
                      <span className="text-[10px] text-slate-400 font-sans">{entry.authType}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-white block">${entry.totalEquityUSD.toFixed(2)} USD</span>
                    <span className={`text-[10px] ${entry.returnPercent >= 0 ? 'text-trade-green' : 'text-trade-red'}`}>
                      {formatPercentage(entry.returnPercent)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <OrderPanel />
        </div>
      </div>

      <TournamentCelebrationModal
        isOpen={showCelebrationModal}
        onClose={() => setShowCelebrationModal(false)}
      />
    </div>
  );
};

