import { useState } from 'react';
import { Star, Camera } from 'lucide-react';

export function ClubCrest({ className = 'w-11 h-11', showStars = true }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className={`relative inline-flex flex-col items-center justify-center select-none ${className}`}>
      {!imgError ? (
        <img
          src="/images/escudo.png"
          alt="Escudo Rifles de Toronto F.C."
          onError={() => setImgError(true)}
          className="w-full h-full object-cover rounded-full ring-2 ring-[#F59E0B]/60 drop-shadow-[0_4px_16px_rgba(37,99,235,0.45)]"
        />
      ) : (
        <>
          {showStars && (
            <div className="flex items-center gap-0.5 mb-0.5">
              <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B] drop-shadow-[0_0_6px_rgba(245,158,11,0.75)]" />
              <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B] drop-shadow-[0_0_6px_rgba(245,158,11,0.75)]" />
            </div>
          )}
          <svg viewBox="0 0 100 110" className="w-full h-full drop-shadow-[0_4px_14px_rgba(37,99,235,0.45)]">
            <defs>
              <linearGradient id="shieldGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#13244E" />
                <stop offset="100%" stopColor="#060B19" />
              </linearGradient>
            </defs>
            <path
              d="M50 4 L92 18 V55 C92 80 72 98 50 106 C28 98 8 80 8 55 V18 Z"
              fill="url(#shieldGrad)"
              stroke="#F59E0B"
              strokeWidth="3.5"
            />
            <path
              d="M50 12 L84 23 V54 C84 74 68 89 50 96 C32 89 16 74 16 54 V23 Z"
              fill="none"
              stroke="#2563EB"
              strokeWidth="2.5"
            />
            <path d="M18 42 L82 42 L82 54 L18 54 Z" fill="#2563EB" />
            <text
              x="50"
              y="51"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="11"
              fontWeight="900"
              fontFamily="Montserrat, sans-serif"
              letterSpacing="1.5"
            >
              RIFLES
            </text>
            <text
              x="50"
              y="76"
              textAnchor="middle"
              fill="#F59E0B"
              fontSize="20"
              fontWeight="900"
              fontFamily="Montserrat, sans-serif"
            >
              RT
            </text>
            <text
              x="50"
              y="90"
              textAnchor="middle"
              fill="#94A3B8"
              fontSize="8"
              fontWeight="700"
              fontFamily="Inter, sans-serif"
            >
              2026
            </text>
          </svg>
        </>
      )}
    </div>
  );
}

export function SmartPhoto({ src, alt, className = 'w-full h-full object-cover' }) {
  const [imgError, setImgError] = useState(false);

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={alt}
        onError={() => setImgError(true)}
        className={className}
        loading="lazy"
      />
    );
  }

  return (
    <div className="w-full h-full min-h-[200px] bg-gradient-to-br from-[#0F1C3F] via-[#0A1128] to-[#060B19] flex flex-col items-center justify-center p-6 text-center border border-[#1E3A8A]/40">
      <div className="w-12 h-12 rounded-full bg-[#2563EB]/20 border border-[#3B82F6]/40 flex items-center justify-center mb-3">
        <Camera className="w-6 h-6 text-[#3B82F6]" />
      </div>
      <p className="font-display font-bold text-sm text-white/90 uppercase tracking-wider">
        Rifles de Toronto F.C.
      </p>
      <p className="text-xs text-slate-400 mt-1">Foto en cancha · @aleextasis</p>
    </div>
  );
}
