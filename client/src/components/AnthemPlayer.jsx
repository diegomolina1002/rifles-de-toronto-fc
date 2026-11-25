import { useEffect, useState } from 'react';
import { Disc3, ExternalLink, Pause, Play, Volume2, ChevronDown, ChevronUp } from 'lucide-react';
import { CLUB_LINKS } from '../data/clubData.js';

export default function AnthemPlayer({ externalOpenSignal = 0 }) {
  const [expanded, setExpanded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(18);

  useEffect(() => {
    if (externalOpenSignal > 0) {
      setExpanded(true);
      setPlaying(true);
    }
  }, [externalOpenSignal]);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : +(prev + 0.5).toFixed(1)));
    }, 1000);
    return () => clearInterval(timer);
  }, [playing]);

  function handleTogglePlay() {
    if (!expanded) setExpanded(true);
    setPlaying((prev) => !prev);
  }

  return (
    <div className="fixed bottom-5 left-5 z-40 max-w-[calc(100vw-6.5rem)] sm:max-w-xs w-full">
      <div className="rounded-2xl bg-[#0F1C3F]/95 backdrop-blur-md border border-[#1E3A8A] shadow-[0_14px_40px_rgba(6,11,25,0.85)] overflow-hidden transition-all">
        {/* Compact Header Bar */}
        <div className="p-3 flex items-center gap-3">
          <button
            type="button"
            onClick={handleTogglePlay}
            aria-label={playing ? 'Pausar himno' : 'Activar sonido del himno'}
            className="w-10 h-10 rounded-xl bg-[#2563EB] hover:bg-[#3B82F6] text-white flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(37,99,235,0.45)] transition-colors"
          >
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <Disc3
                className={`w-3.5 h-3.5 text-[#3B82F6] shrink-0 ${
                  playing ? 'animate-spin' : ''
                }`}
              />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#3B82F6] truncate">
                Himno Oficial
              </span>
            </div>
            <p className="font-display font-bold text-xs text-white truncate">
              Triple Lavada (Remix)
            </p>
            <p className="text-[11px] text-slate-300 truncate">Víctor Mendívil</p>
          </div>

          {/* Equalizer + Expand Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-end gap-0.5 h-4">
              <span
                className={`w-1 bg-[#3B82F6] rounded-full ${
                  playing ? 'h-4 eq-bar-1' : 'h-1.5 opacity-60'
                }`}
              />
              <span
                className={`w-1 bg-white rounded-full ${
                  playing ? 'h-4 eq-bar-2' : 'h-2.5 opacity-60'
                }`}
              />
              <span
                className={`w-1 bg-[#3B82F6] rounded-full ${
                  playing ? 'h-4 eq-bar-3' : 'h-2 opacity-60'
                }`}
              />
            </div>

            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              aria-label={expanded ? 'Minimizar reproductor' : 'Expandir reproductor'}
              className="p-1.5 rounded-lg bg-[#0A1128] border border-[#1E3A8A] text-slate-300 hover:text-white transition-colors"
            >
              {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Sleek Progress Bar */}
        <div className="px-3 pb-2.5">
          <div className="h-1 w-full rounded-full bg-[#060B19] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#2563EB] via-[#3B82F6] to-white transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Expanded Spotify Embed & Sound Activation */}
        {expanded && (
          <div className="px-3 pb-3 pt-1 border-t border-[#1E3A8A]/70 space-y-2.5 bg-[#0A1128]/90">
            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <span className="inline-flex items-center gap-1.5 font-semibold text-white">
                <Volume2 className="w-3.5 h-3.5 text-[#3B82F6]" />
                Presiona Play para activar audio
              </span>
              <a
                href={CLUB_LINKS.anthemSpotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#3B82F6] hover:text-white font-semibold"
              >
                Spotify <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <iframe
              title="Himno Rifles de Toronto F.C. - Triple Lavada (Remix)"
              src={CLUB_LINKS.anthemSpotifyEmbed}
              width="100%"
              height="80"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="rounded-xl border border-[#1E3A8A]/60"
            />
          </div>
        )}
      </div>
    </div>
  );
}
