import React from 'react';
import { useAtta } from '../context/AttaContext';
import { TournamentDurationOption } from '../context/AttaContext';
import { ShieldCheck, Clock, X, CheckCircle2, Sparkles, Power } from 'lucide-react';

interface DevTournamentConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DevTournamentConfigModal: React.FC<DevTournamentConfigModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { settings, updateSettings, changeTournamentDuration, setDevModeActive } = useAtta();

  if (!isOpen) return null;

  const currentDuration: TournamentDurationOption = settings.tournamentDuration || '24h';

  const handleDurationChange = (option: TournamentDurationOption) => {
    changeTournamentDuration(option);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-gradient-to-b from-dark-800 via-dark-900 to-dark-950 border border-amber-500/50 rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden space-y-4">
        {/* Ambient Top Glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between border-b border-dark-700 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Confidential Dev Control Panel</h3>
              <p className="text-[11px] text-slate-400">Tournament Scheduler & Operational Lifespan</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white bg-dark-700 rounded-xl transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dev Mode Status & Toggle */}
        <div className="bg-dark-900/90 border border-dark-700 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Verification Status</span>
            <span className="text-xs font-extrabold text-amber-400 flex items-center gap-1.5 mt-0.5 font-sans">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{settings.devModeBypass ? 'DEVELOPER VERIFICATION ACTIVE' : 'STANDARD MODE'}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setDevModeActive(!settings.devModeBypass)}
            className={`px-3 py-1.5 rounded-xl font-sans text-xs font-bold transition-all flex items-center space-x-1.5 ${
              settings.devModeBypass
                ? 'bg-amber-500 text-dark-900 shadow hover:bg-amber-400'
                : 'bg-dark-700 text-slate-300 hover:text-white'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{settings.devModeBypass ? 'Turn OFF' : 'Turn ON'}</span>
          </button>
        </div>

        {/* Operational Lifespan Duration Selector */}
        <div className="space-y-2 font-mono text-xs">
          <label className="font-bold text-white text-xs block font-sans flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Operational Tournament Countdown Lifespan</span>
          </label>

          <div className="grid grid-cols-2 gap-2 font-sans font-bold">
            <button
              type="button"
              onClick={() => handleDurationChange('30m')}
              className={`py-2.5 px-3 rounded-xl border text-xs transition-all flex items-center justify-between ${
                currentDuration === '30m'
                  ? 'bg-amber-500 text-dark-900 border-amber-400 font-extrabold shadow'
                  : 'bg-dark-800 text-slate-300 border-dark-700 hover:bg-dark-700'
              }`}
            >
              <span>30 Minutes</span>
              {currentDuration === '30m' && <CheckCircle2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => handleDurationChange('1h')}
              className={`py-2.5 px-3 rounded-xl border text-xs transition-all flex items-center justify-between ${
                currentDuration === '1h'
                  ? 'bg-amber-500 text-dark-900 border-amber-400 font-extrabold shadow'
                  : 'bg-dark-800 text-slate-300 border-dark-700 hover:bg-dark-700'
              }`}
            >
              <span>1 Hour</span>
              {currentDuration === '1h' && <CheckCircle2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => handleDurationChange('12h')}
              className={`py-2.5 px-3 rounded-xl border text-xs transition-all flex items-center justify-between ${
                currentDuration === '12h'
                  ? 'bg-amber-500 text-dark-900 border-amber-400 font-extrabold shadow'
                  : 'bg-dark-800 text-slate-300 border-dark-700 hover:bg-dark-700'
              }`}
            >
              <span>12 Hours</span>
              {currentDuration === '12h' && <CheckCircle2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => handleDurationChange('24h')}
              className={`py-2.5 px-3 rounded-xl border text-xs transition-all flex items-center justify-between ${
                currentDuration === '24h'
                  ? 'bg-amber-500 text-dark-900 border-amber-400 font-extrabold shadow'
                  : 'bg-dark-800 text-slate-300 border-dark-700 hover:bg-dark-700'
              }`}
            >
              <span>24 Hours</span>
              {currentDuration === '24h' && <CheckCircle2 className="w-4 h-4" />}
            </button>
          </div>
          <span className="text-[11px] text-slate-400 font-sans block mt-1">
            Setting the operational lifespan updates the session countdown timer instantly.
          </span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-trade-accent hover:bg-blue-600 text-white font-extrabold text-xs font-sans rounded-xl transition-all shadow"
        >
          Confirm & Save Control Settings
        </button>
      </div>
    </div>
  );
};
