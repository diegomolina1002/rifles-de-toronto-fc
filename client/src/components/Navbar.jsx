import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Lock, Radio } from 'lucide-react';
import { ClubCrest } from './ClubVisuals.jsx';
import { CLUB_LINKS } from '../data/clubData.js';

const NAV_LINKS = [
  { href: '#inicio', label: 'Inicio' },
  { href: '#palmares', label: 'Palmarés' },
  { href: '#torneos', label: 'Torneos' },
  { href: '#armaduras', label: 'Armaduras' },
  { href: '#plantilla', label: 'Plantilla' },
  { href: '#galeria', label: 'Galería' }
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[#060B19]/90 backdrop-blur-md border-b border-[#1E3A8A]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand */}
        <a href="#inicio" className="flex items-center gap-3 group shrink-0">
          <ClubCrest className="w-12 h-12" showStars={true} />
          <div className="leading-tight">
            <span className="block font-display font-black text-sm sm:text-base tracking-wider uppercase text-white group-hover:text-[#3B82F6] transition-colors">
              Rifles de Toronto
            </span>
            <span className="block text-[11px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
              F.C. · CDMX · Est. 2026
            </span>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-xs font-bold uppercase tracking-widest text-slate-300 hover:text-white transition-colors relative py-1 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-0.5 after:bg-[#3B82F6] hover:after:w-full after:transition-all"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Actions: Live Button (red dot ONLY) + Admin */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <a
            href={CLUB_LINKS.facebookLive}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#0F1C3F] hover:bg-[#2563EB] border border-[#1E3A8A] text-white font-display font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:scale-105"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DC2626] opacity-85"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#DC2626]"></span>
            </span>
            <span className="hidden xs:inline sm:inline">Ver En Vivo</span>
            <Radio className="w-3.5 h-3.5 sm:hidden" />
          </a>

          <Link
            to="/admin"
            title="Panel Administrativo"
            className="p-2.5 rounded-lg bg-[#0F1C3F] border border-[#1E3A8A] text-slate-300 hover:text-white hover:border-[#3B82F6] transition-colors"
          >
            <Lock className="w-4 h-4" />
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="lg:hidden p-2.5 rounded-lg bg-[#0F1C3F] border border-[#1E3A8A] text-slate-200 hover:text-white"
            aria-label="Abrir menú"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#060B19]/98 border-b border-[#1E3A8A]/70 px-4 py-4 space-y-1">
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider text-slate-200 hover:bg-[#0F1C3F] hover:text-white"
            >
              {item.label}
            </a>
          ))}
          <Link
            to="/admin"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-300 hover:bg-[#0F1C3F] hover:text-[#3B82F6]"
          >
            <Lock className="w-4 h-4" />
            Panel Admin
          </Link>
        </div>
      )}
    </header>
  );
}
