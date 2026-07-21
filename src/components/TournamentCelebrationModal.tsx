import React, { useEffect } from 'react';
import { useAtta } from '../context/AttaContext';
import { formatPercentage } from '../utils/formatters';
import { Trophy, Award, Sparkles, X, CheckCircle2, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TournamentCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TournamentCelebrationModal: React.FC<TournamentCelebrationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { userProfile, tournamentEquityUSD, leaderboard } = useAtta();

  const userEntry = leaderboard.find((entry) => entry.isCurrentUser) || {
    rank: 1,
    totalEquityUSD: tournamentEquityUSD,
    returnPercent: tournamentEquityUSD - 100,
  };

  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.4 },
        });
      } catch (e) {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isGold = userEntry.rank === 1;
  const isSilver = userEntry.rank === 2;
  const isBronze = userEntry.rank === 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg animate-fade-in">
      <div className="bg-gradient-to-b from-dark-800 via-dark-900 to-dark-950 border border-trade-gold/50 rounded-3xl max-w-lg w-full p-6 text-center shadow-2xl relative overflow-hidden space-y-5">
        {/* Background Ambient Glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-trade-gold/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white bg-dark-700 rounded-xl transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Big Trophy Icon */}
        <div className="relative inline-block mt-2">
          <div className="w-20 h-20 rounded-3xl bg-trade-gold/20 border-2 border-trade-gold/60 flex items-center justify-center text-trade-gold shadow-2xl mx-auto animate-bounce">
            <Trophy className="w-10 h-10" />
          </div>
          <Sparkles className="w-6 h-6 text-amber-300 absolute -top-2 -right-2 animate-spin" />
        </div>

        <div>
          <div className="inline-flex items-center space-x-1.5 bg-trade-gold/15 border border-trade-gold/40 text-trade-gold px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Tournament Winner Celebration</span>
          </div>

          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Session Leaderboard Podia Achieved!
          </h2>
          <p className="text-xs text-slate-300 max-w-md mx-auto mt-1 leading-relaxed font-mono">
            Congratulations <span className="text-white font-bold">{userProfile.displayName}</span>! You secured a top-tier rank on the AttaTrader Weekend Tournament leaderboard!
          </p>
        </div>

        {/* Rank & Equity Card */}
        <div className="bg-dark-800/90 border border-dark-600 rounded-2xl p-4 font-mono grid grid-cols-2 gap-4">
          <div className="border-r border-dark-700 pr-2">
            <span className="text-[10px] font-sans font-bold text-slate-400 uppercase block">
              Final Placement
            </span>
            <span
              className={`text-2xl font-extrabold flex items-center justify-center space-x-1 mt-1 ${
                isGold ? 'text-amber-400' : isSilver ? 'text-slate-300' : 'text-amber-600'
              }`}
            >
              <Award className="w-6 h-6 inline mr-1" />
              <span>Rank #{userEntry.rank}</span>
            </span>
          </div>

          <div className="pl-2">
            <span className="text-[10px] font-sans font-bold text-slate-400 uppercase block">
              Session Total Equity
            </span>
            <span className="text-2xl font-extrabold text-trade-gold block mt-1">
              ${userEntry.totalEquityUSD.toFixed(2)}
            </span>
            <span
              className={`text-[11px] block mt-0.5 ${
                userEntry.returnPercent >= 0 ? 'text-trade-green' : 'text-trade-red'
              }`}
            >
              {formatPercentage(userEntry.returnPercent)} Return
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-trade-gold via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-dark-900 font-extrabold text-sm rounded-xl transition-all shadow-xl shadow-trade-gold/20 flex items-center justify-center space-x-2"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>Claim Glory & Return to Workstation</span>
        </button>
      </div>
    </div>
  );
};
