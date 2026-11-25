import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Shirt,
  Trophy,
  Star,
  Instagram,
  Radio,
  MessageCircle,
  Camera,
  Scissors,
  Users,
  Search,
  X,
  ExternalLink,
  Shield,
  ChevronRight,
  Award,
  Sparkles,
  Music
} from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import AnthemPlayer from '../components/AnthemPlayer.jsx';
import { ClubCrest, SmartPhoto } from '../components/ClubVisuals.jsx';
import { CHAMPIONSHIPS, CLUB_LINKS, TOURNAMENTS, getJerseyStyle } from '../data/clubData.js';
import { api } from '../api.js';

const POSITIONS = ['Todos', 'Portero', 'Defensa', 'Medio', 'Delantero'];

function formatDateEs(dateStr) {
  if (!dateStr) return 'Por confirmar';
  const parsed = new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString('es-MX', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export default function HomePage() {
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [jerseys, setJerseys] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [posFilter, setPosFilter] = useState('Todos');
  const [playerQuery, setPlayerQuery] = useState('');
  const [leagueFilter, setLeagueFilter] = useState('Todas');
  const [selectedJersey, setSelectedJersey] = useState(null);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [anthemSignal, setAnthemSignal] = useState(0);

  useEffect(() => {
    let active = true;
    async function loadClubData() {
      try {
        const [pData, mData, jData, phData] = await Promise.all([
          api.getPlayers(),
          api.getMatches(),
          api.getJerseys(),
          api.getGallery()
        ]);
        if (!active) return;
        setPlayers(Array.isArray(pData) ? pData : []);
        setMatches(Array.isArray(mData) ? mData : []);
        setJerseys(Array.isArray(jData) ? jData : []);
        setPhotos(Array.isArray(phData) ? phData : []);
      } catch (err) {
        console.error('Error cargando datos del club:', err);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadClubData();
    return () => {
      active = false;
    };
  }, []);

  const upcomingMatch = useMemo(() => {
    return matches.find((m) => Boolean(m.is_upcoming)) || matches[0] || null;
  }, [matches]);

  const pastMatches = useMemo(() => {
    return matches.filter((m) => m.id !== upcomingMatch?.id && !m.is_upcoming);
  }, [matches, upcomingMatch]);

  const filteredPlayers = useMemo(() => {
    return players.filter((p) => {
      const matchPos = posFilter === 'Todos' || p.position === posFilter;
      const q = playerQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.nickname || '').toLowerCase().includes(q) ||
        String(p.number).includes(q);
      return matchPos && matchQuery;
    });
  }, [players, posFilter, playerQuery]);

  const jerseyLeagues = useMemo(() => {
    const unique = Array.from(new Set(jerseys.map((j) => j.league).filter(Boolean)));
    return ['Todas', ...unique];
  }, [jerseys]);

  const filteredJerseys = useMemo(() => {
    if (leagueFilter === 'Todas') return jerseys;
    return jerseys.filter((j) => j.league === leagueFilter);
  }, [jerseys, leagueFilter]);

  const totalGoals = useMemo(
    () => players.reduce((acc, p) => acc + (Number(p.goals) || 0), 0),
    [players]
  );

  const upcomingJersey = getJerseyStyle(upcomingMatch?.jersey_color);

  return (
    <div className="min-h-screen bg-[#060B19] text-white pb-16 sm:pb-0">
      <Navbar />

      {/* =====================================================
          1. HERO SECTION (DEEP NAVY THEME)
      ====================================================== */}
      <section
        id="inicio"
        className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 overflow-hidden bg-gradient-to-b from-[#060B19] via-[#0A1128] to-[#060B19] pitch-grid border-b border-[#1E3A8A]/50"
      >
        <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#2563EB]/20 blur-[130px]" />
        <div className="pointer-events-none absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-[#3B82F6]/15 blur-[140px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Hero Left */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#0F1C3F] border border-[#F59E0B]/40 text-xs font-bold uppercase tracking-widest text-[#F59E0B]">
                <span className="flex items-center gap-0.5">
                  <Star className="w-3.5 h-3.5 fill-[#F59E0B]" />
                  <Star className="w-3.5 h-3.5 fill-[#F59E0B]" />
                </span>
                <span>Bicampeones 2026 · Ciudad de México</span>
              </div>

              <div className="flex items-center gap-5">
                <ClubCrest className="w-24 h-24 sm:w-28 sm:h-28 shrink-0" showStars={true} />
                <div>
                  <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight uppercase leading-[0.98]">
                    RIFLES DE{' '}
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-[#3B82F6]">
                      TORONTO F.C.
                    </span>
                  </h1>
                  <p className="mt-3 text-base sm:text-lg text-slate-300 font-medium italic">
                    &ldquo;Forjados en la cancha desde Febrero 2026&rdquo;
                  </p>
                </div>
              </div>

              <p className="text-slate-300/85 text-sm sm:text-base max-w-2xl leading-relaxed">
                Club de fútbol competitivo de la Ciudad de México con garra, disciplina y mentalidad
                campeona. Dos títulos conquistados en nuestro año inaugural compitiendo en las mejores
                ligas de la capital.
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-lg pt-1">
                <div className="bg-[#0F1C3F]/90 border border-[#1E3A8A] rounded-xl p-3.5">
                  <p className="font-display font-black text-2xl sm:text-3xl text-[#F59E0B]">2</p>
                  <p className="text-[11px] uppercase tracking-wider text-slate-300 font-semibold">
                    Títulos 2026
                  </p>
                </div>
                <div className="bg-[#0F1C3F]/90 border border-[#1E3A8A] rounded-xl p-3.5">
                  <p className="font-display font-black text-2xl sm:text-3xl text-white">
                    {players.length}
                  </p>
                  <p className="text-[11px] uppercase tracking-wider text-slate-300 font-semibold">
                    Jugadores
                  </p>
                </div>
                <div className="bg-[#0F1C3F]/90 border border-[#1E3A8A] rounded-xl p-3.5">
                  <p className="font-display font-black text-2xl sm:text-3xl text-[#3B82F6]">
                    {totalGoals}
                  </p>
                  <p className="text-[11px] uppercase tracking-wider text-slate-300 font-semibold">
                    Goles Plantilla
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <a
                  href={CLUB_LINKS.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#2563EB] hover:bg-[#3B82F6] text-white font-display font-bold text-sm uppercase tracking-wider shadow-[0_10px_30px_rgba(37,99,235,0.45)] transition-all hover:-translate-y-0.5"
                >
                  <MessageCircle className="w-5 h-5" />
                  Rétanos a un Amistoso / Visorías
                </a>

                <button
                  type="button"
                  onClick={() => setAnthemSignal((n) => n + 1)}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-[#0F1C3F] hover:bg-[#13244E] border border-[#1E3A8A] text-white font-display font-bold text-sm uppercase tracking-wider transition-all"
                >
                  <Music className="w-4 h-4 text-[#3B82F6]" />
                  Himno Oficial
                </button>
              </div>
            </div>

            {/* Hero Right: Highlighted Upcoming Match Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl bg-[#0F1C3F] border border-[#1E3A8A] p-6 sm:p-7 shadow-2xl overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#2563EB] via-white to-[#2563EB]" />

                <div className="flex items-center justify-between gap-3 mb-5">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2563EB]/20 border border-[#3B82F6]/50 text-[#3B82F6] text-xs font-extrabold uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse" />
                    Próximo Partido
                  </span>
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Temporada 2026
                  </span>
                </div>

                {loading ? (
                  <div className="py-12 text-center text-slate-300 text-sm">
                    Cargando cartelera oficial...
                  </div>
                ) : upcomingMatch ? (
                  <div className="space-y-5">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-[#3B82F6] font-bold">
                        {upcomingMatch.league}
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-4 bg-[#060B19] rounded-xl p-4 border border-[#1E3A8A]/70">
                        <div>
                          <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                            Local / Club
                          </p>
                          <p className="font-display font-black text-base sm:text-lg text-white">
                            Rifles de Toronto
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-[#2563EB] text-white font-display font-black text-xs">
                          VS
                        </span>
                        <div className="text-right">
                          <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                            Rival
                          </p>
                          <p className="font-display font-black text-base sm:text-lg text-white">
                            {upcomingMatch.opponent}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-[#0A1128] border border-[#1E3A8A]/70 rounded-xl p-3 flex items-start gap-2.5">
                        <Calendar className="w-4 h-4 text-[#3B82F6] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[11px] uppercase text-slate-400 font-bold">Fecha</p>
                          <p className="font-semibold text-slate-100 capitalize text-xs sm:text-sm">
                            {formatDateEs(upcomingMatch.date)}
                          </p>
                        </div>
                      </div>

                      <div className="bg-[#0A1128] border border-[#1E3A8A]/70 rounded-xl p-3 flex items-start gap-2.5">
                        <Clock className="w-4 h-4 text-[#3B82F6] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[11px] uppercase text-slate-400 font-bold">Hora</p>
                          <p className="font-semibold text-slate-100 text-xs sm:text-sm">
                            {upcomingMatch.time} hrs
                          </p>
                        </div>
                      </div>

                      <div className="col-span-2 bg-[#0A1128] border border-[#1E3A8A]/70 rounded-xl p-3 flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-[#3B82F6] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[11px] uppercase text-slate-400 font-bold">Sede</p>
                          <p className="font-semibold text-slate-100 text-xs sm:text-sm">
                            {upcomingMatch.venue || 'Por confirmar en CDMX'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Jersey to wear */}
                    <div className="flex items-center justify-between gap-3 bg-[#13244E] border border-[#1E3A8A] rounded-xl px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-7 h-7 rounded-lg border-2 border-white/50 shadow-inner shrink-0"
                          style={{ backgroundColor: upcomingJersey.hex }}
                        />
                        <div>
                          <p className="text-[11px] uppercase tracking-wider text-slate-300 font-bold">
                            Indumentaria Asignada
                          </p>
                          <p className="font-display font-bold text-sm text-white">
                            Playera {upcomingMatch.jersey_color}
                          </p>
                        </div>
                      </div>
                      <Shirt className="w-5 h-5 text-white/80" />
                    </div>

                    {upcomingMatch.notes && (
                      <p className="text-xs text-slate-300 bg-[#060B19]/70 rounded-lg px-3 py-2 border border-[#1E3A8A]/50">
                        {upcomingMatch.notes}
                      </p>
                    )}

                    <a
                      href={CLUB_LINKS.facebookLive}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#060B19] hover:bg-[#2563EB] border border-[#1E3A8A] hover:border-[#3B82F6] text-xs font-display font-bold uppercase tracking-widest transition-all"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse" />
                      <Radio className="w-4 h-4" />
                      Seguir Transmisión en Facebook Live
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-slate-300 py-8 text-center">
                    No hay partidos programados todavía. Configúralo desde el Panel Admin.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          2. VITRINA DE CAMPEONATOS (PALMARÉS - DORADO EXCLUSIVO)
      ====================================================== */}
      <section
        id="palmares"
        className="py-16 sm:py-24 bg-gradient-to-b from-[#060B19] via-[#0F1C3F]/70 to-[#060B19] border-b border-[#F59E0B]/25 relative overflow-hidden"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#F59E0B]/60 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 text-[#F59E0B] text-xs font-extrabold uppercase tracking-[0.2em] mb-2">
                <Trophy className="w-4 h-4" />
                Palmarés Oficial
              </div>
              <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight">
                Vitrina de <span className="gold-shimmer">Campeonatos</span>
              </h2>
            </div>
            <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/35">
              <div className="flex gap-1">
                <Star className="w-5 h-5 fill-[#F59E0B] text-[#F59E0B]" />
                <Star className="w-5 h-5 fill-[#F59E0B] text-[#F59E0B]" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-[#FDE68A] uppercase tracking-wider">
                2 Estrellas en el Escudo
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {CHAMPIONSHIPS.map((cup) => (
              <div
                key={cup.id}
                className="group relative rounded-2xl bg-[#0F1C3F] border border-[#F59E0B]/35 hover:border-[#F59E0B] p-6 sm:p-8 transition-all duration-300 shadow-[0_10px_40px_rgba(245,158,11,0.08)] hover:-translate-y-1"
              >
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F59E0B] to-amber-700 text-[#060B19] flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.4)]">
                    <Trophy className="w-7 h-7 stroke-[2.2]" />
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F59E0B]/15 border border-[#F59E0B]/40 text-[#F59E0B] text-xs font-extrabold uppercase tracking-wider">
                      <Star className="w-3.5 h-3.5 fill-[#F59E0B]" />
                      {cup.star}
                    </span>
                    <p className="text-xs text-slate-300 font-semibold mt-2">{cup.date}</p>
                  </div>
                </div>

                <h3 className="font-display font-black text-xl sm:text-2xl text-white group-hover:text-[#FDE68A] transition-colors">
                  {cup.title}
                </h3>
                <p className="text-xs font-bold uppercase tracking-wider text-[#F59E0B] mt-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {cup.venue}
                </p>
                <p className="mt-4 text-sm text-slate-200 leading-relaxed">{cup.description}</p>
              </div>
            ))}
          </div>

          {/* Official Championship Photo */}
          <div className="mt-8 rounded-2xl overflow-hidden border border-[#F59E0B]/35 bg-[#0F1C3F] grid md:grid-cols-12 items-center">
            <div className="md:col-span-7 aspect-[16/10] md:aspect-auto md:h-80 overflow-hidden bg-[#060B19]">
              <SmartPhoto
                src="/images/campeones-2026.jpg"
                alt="Rifles de Toronto F.C. Campeones 2026"
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div className="md:col-span-5 p-6 sm:p-8 space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F59E0B]/15 border border-[#F59E0B]/40 text-[#F59E0B] text-[11px] font-extrabold uppercase tracking-widest">
                ★★ Bicampeones 2026
              </span>
              <h3 className="font-display font-black text-2xl text-white uppercase">
                Gloria en la Cancha
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed">
                De febrero a noviembre de 2026: un equipo nacido para competir que ya suma dos
                campeonatos oficiales en la Ciudad de México.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          3. TORNEOS EN CURSO Y RESULTADOS RECIENTES
      ====================================================== */}
      <section id="torneos" className="py-16 sm:py-24 bg-[#0A1128] border-b border-[#1E3A8A]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 text-[#3B82F6] text-xs font-extrabold uppercase tracking-[0.2em] mb-2">
              <Award className="w-4 h-4" />
              Competencia Activa
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight">
              Torneos en Curso y Sedes
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl">
              Presencia constante en las ligas más exigentes de la Ciudad de México, cada una con su
              armadura designada.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TOURNAMENTS.map((t) => (
              <div
                key={t.id}
                className="rounded-2xl bg-[#0F1C3F] border border-[#1E3A8A] hover:border-[#3B82F6] p-6 flex flex-col justify-between transition-all hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: t.badgeColor }}
                    />
                    {t.instagram ? (
                      <a
                        href={t.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-[#3B82F6] transition-colors"
                      >
                        <Instagram className="w-3.5 h-3.5" />
                        {t.handle}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-xs font-semibold text-[#3B82F6]">{t.handle}</span>
                    )}
                  </div>

                  <h3 className="font-display font-black text-xl text-white">{t.name}</h3>
                  <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#3B82F6] shrink-0" />
                    {t.venue}
                  </p>
                  <p className="text-sm text-slate-200 mt-4 leading-relaxed">{t.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#1E3A8A]/70">
                  <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-2">
                    Uniformes Oficiales
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {t.jerseys.map((color) => {
                      const swatch = getJerseyStyle(color);
                      return (
                        <span
                          key={color}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#060B19] border border-[#1E3A8A] text-xs font-semibold text-slate-200"
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-white/40"
                            style={{ backgroundColor: swatch.hex }}
                          />
                          {color}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pastMatches.length > 0 && (
            <div className="mt-14">
              <h3 className="font-display font-bold text-lg uppercase tracking-wider text-slate-100 mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#3B82F6]" />
                Resultados y Bitácora Reciente
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pastMatches.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-xl bg-[#13244E] border border-[#1E3A8A] p-4 flex flex-col justify-between gap-3"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-[#3B82F6] truncate">{m.league}</span>
                      <span className="text-slate-300 shrink-0">{formatDateEs(m.date)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-display font-bold text-sm text-white">Rifles F.C.</span>
                      <span className="px-3 py-1 rounded-lg bg-[#060B19] border border-[#1E3A8A] font-display font-black text-base text-white">
                        {m.score_home ?? '-'} : {m.score_away ?? '-'}
                      </span>
                      <span className="font-display font-bold text-sm text-slate-200 text-right">
                        {m.opponent}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-[#0A1128] font-semibold text-white">
                        {m.status}
                      </span>
                      <span>Playera {m.jersey_color}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          4. CATÁLOGO DE ARMADURAS (100% GESTIONADO DESDE /admin)
      ====================================================== */}
      <section id="armaduras" className="py-16 sm:py-24 bg-[#060B19] border-b border-[#1E3A8A]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 text-[#3B82F6] text-xs font-extrabold uppercase tracking-[0.2em] mb-2">
                <Shirt className="w-4 h-4" />
                Museo del Club
              </div>
              <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight">
                Catálogo de Armaduras
              </h2>
              <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-xl">
                Cada camiseta oficial del equipo, administrada directamente desde el panel del club.
              </p>
            </div>

            {jerseyLeagues.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {jerseyLeagues.map((lg) => (
                  <button
                    key={lg}
                    type="button"
                    onClick={() => setLeagueFilter(lg)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                      leagueFilter === lg
                        ? 'bg-[#2563EB] text-white shadow-[0_0_15px_rgba(37,99,235,0.45)]'
                        : 'bg-[#0F1C3F] text-slate-300 hover:text-white border border-[#1E3A8A]'
                    }`}
                  >
                    {lg}
                  </button>
                ))}
              </div>
            )}
          </div>

          {loading ? (
            <div className="py-14 text-center text-slate-300">Cargando equipaciones...</div>
          ) : filteredJerseys.length === 0 ? (
            <div className="rounded-2xl bg-[#0F1C3F]/70 border border-dashed border-[#1E3A8A] p-12 text-center max-w-2xl mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-[#13244E] border border-[#1E3A8A] flex items-center justify-center mx-auto mb-4">
                <Shirt className="w-7 h-7 text-[#3B82F6]" />
              </div>
              <h3 className="font-display font-black text-lg uppercase text-white">
                Museo de Armaduras en actualización
              </h3>
              <p className="text-sm text-slate-300 mt-2">
                Próximamente las fotografías oficiales de nuestras equipaciones. Sube las playeras
                reales desde el{' '}
                <Link to="/admin" className="text-[#3B82F6] underline font-semibold">
                  Panel Admin
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJerseys.map((kit) => (
                <button
                  key={kit.id}
                  type="button"
                  onClick={() => setSelectedJersey(kit)}
                  className="group text-left rounded-2xl bg-[#0F1C3F] border border-[#1E3A8A] hover:border-[#3B82F6] p-4 transition-all duration-300 hover:-translate-y-1 flex flex-col"
                >
                  <div className="relative rounded-xl bg-[#060B19] border border-[#1E3A8A]/70 p-1.5 overflow-hidden">
                    {kit.edition && (
                      <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-md bg-[#060B19]/85 border border-[#1E3A8A] text-[10px] font-extrabold uppercase tracking-widest text-[#3B82F6]">
                        {kit.edition}
                      </span>
                    )}
                    <img
                      src={kit.image_url}
                      alt={kit.name}
                      className="w-full h-64 object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="pt-4 px-1 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full border border-white/50 shrink-0"
                          style={{ backgroundColor: kit.color_hex || '#1E3A8A' }}
                        />
                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-300">
                          {kit.league}
                        </p>
                      </div>
                      <h3 className="font-display font-black text-xl text-white mt-1 group-hover:text-[#3B82F6] transition-colors">
                        {kit.name}
                      </h3>
                      {kit.description && (
                        <p className="text-xs text-slate-300 mt-2 line-clamp-2">
                          {kit.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#1E3A8A]/70 flex items-center justify-between text-xs font-bold text-slate-200">
                      <span>Equipación Oficial</span>
                      <span className="inline-flex items-center gap-1 text-[#3B82F6] group-hover:translate-x-0.5 transition-transform">
                        Inspeccionar <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          5. PLANTILLA OFICIAL (VACÍA POR DEFECTO CON ESTADO ELEGANTE)
      ====================================================== */}
      <section id="plantilla" className="py-16 sm:py-24 bg-[#0A1128] border-b border-[#1E3A8A]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 text-[#3B82F6] text-xs font-extrabold uppercase tracking-[0.2em] mb-2">
                <Users className="w-4 h-4" />
                Roster Oficial 2026
              </div>
              <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight">
                Plantilla de Jugadores
              </h2>
            </div>

            {players.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={playerQuery}
                    onChange={(e) => setPlayerQuery(e.target.value)}
                    placeholder="Buscar nombre, apodo o #"
                    className="w-full sm:w-56 pl-10 pr-4 py-2 rounded-xl bg-[#0F1C3F] border border-[#1E3A8A] text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {POSITIONS.map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => setPosFilter(pos)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                        posFilter === pos
                          ? 'bg-[#2563EB] text-white'
                          : 'bg-[#0F1C3F] text-slate-300 hover:text-white border border-[#1E3A8A]'
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-300">Cargando plantilla...</div>
          ) : players.length === 0 ? (
            <div className="rounded-2xl bg-[#0F1C3F]/80 border border-dashed border-[#1E3A8A] p-12 text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-[#13244E] border border-[#1E3A8A] flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-[#3B82F6]" />
              </div>
              <h3 className="font-display font-black text-xl uppercase text-white">
                Plantilla en actualización
              </h3>
              <p className="text-sm text-slate-300 mt-2">
                Próximamente los jugadores oficiales de <strong className="text-white">Rifles de Toronto F.C.</strong>
              </p>
            </div>
          ) : filteredPlayers.length === 0 ? (
            <div className="rounded-2xl bg-[#0F1C3F] border border-[#1E3A8A] p-10 text-center text-slate-300">
              No se encontraron jugadores con ese filtro.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredPlayers.map((player) => (
                <div
                  key={player.id}
                  className="group relative rounded-2xl bg-[#0F1C3F] border border-[#1E3A8A] hover:border-[#3B82F6] overflow-hidden transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative h-60 bg-gradient-to-b from-[#13244E] to-[#060B19] overflow-hidden">
                    {player.photo_url ? (
                      <img
                        src={player.photo_url}
                        alt={player.name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center relative">
                        <ClubCrest className="w-16 h-16 opacity-40" showStars={false} />
                        <span className="mt-2 text-[11px] uppercase tracking-widest text-slate-400 font-bold">
                          Rifles F.C.
                        </span>
                      </div>
                    )}

                    <div className="absolute top-3 right-3 px-3 py-1 rounded-xl bg-[#060B19]/90 backdrop-blur border border-[#1E3A8A] font-display font-black text-2xl text-white">
                      #{player.number}
                    </div>

                    <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-[#2563EB] text-white text-[10px] font-extrabold uppercase tracking-widest">
                      {player.position}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-display font-black text-lg text-white truncate">
                      {player.name}
                    </h3>
                    <p className="text-xs font-semibold text-[#3B82F6] min-h-[1rem]">
                      {player.nickname ? `"${player.nickname}"` : 'Jugador Oficial'}
                    </p>

                    <div className="mt-4 pt-3 border-t border-[#1E3A8A]/70 grid grid-cols-2 gap-2 text-center">
                      <div className="bg-[#060B19] rounded-lg py-2 border border-[#1E3A8A]/50">
                        <p className="font-display font-black text-lg text-white">
                          {player.goals ?? 0}
                        </p>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                          Goles
                        </p>
                      </div>
                      <div className="bg-[#060B19] rounded-lg py-2 border border-[#1E3A8A]/50">
                        <p className="font-display font-black text-lg text-white">
                          {player.matches ?? 0}
                        </p>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                          Partidos
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          6. GALERÍA DE PARTIDOS Y MULTIMEDIA
      ====================================================== */}
      <section id="galeria" className="py-16 sm:py-24 bg-[#060B19] border-b border-[#1E3A8A]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 text-[#3B82F6] text-xs font-extrabold uppercase tracking-[0.2em] mb-2">
                <Camera className="w-4 h-4" />
                En La Cancha
              </div>
              <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight">
                Galería de Partidos
              </h2>
            </div>

            <a
              href={CLUB_LINKS.instagramPhotographer}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#0F1C3F] border border-[#1E3A8A] hover:border-[#3B82F6] transition-colors"
            >
              <Camera className="w-4 h-4 text-[#3B82F6]" />
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                  Fotografía Oficial del Club
                </p>
                <p className="text-sm font-bold text-white flex items-center gap-1">
                  @aleextasis <ExternalLink className="w-3 h-3 text-slate-400" />
                </p>
              </div>
            </a>
          </div>

          {photos.length === 0 ? (
            <div className="rounded-2xl bg-[#0F1C3F] border border-[#1E3A8A] p-12 text-center text-slate-300">
              Aún no hay fotos en la galería. Sube las primeras desde el Panel Admin.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {photos.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setLightboxPhoto(photo)}
                  className="group relative rounded-2xl overflow-hidden bg-[#0F1C3F] border border-[#1E3A8A] hover:border-[#3B82F6] text-left aspect-[4/3] transition-all"
                >
                  <SmartPhoto
                    src={photo.image_url}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060B19]/95 via-[#060B19]/30 to-transparent flex flex-col justify-end p-5">
                    {photo.matchday && (
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#3B82F6]">
                        {photo.matchday}
                      </span>
                    )}
                    <h3 className="font-display font-bold text-base text-white mt-0.5 line-clamp-2">
                      {photo.title}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                      <Camera className="w-3 h-3 text-[#3B82F6]" />
                      Crédito: {photo.photographer || '@aleextasis'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          7. ALIADOS Y FOOTER
      ====================================================== */}
      <section className="py-14 bg-[#0A1128] border-b border-[#1E3A8A]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-r from-[#0F1C3F] via-[#13244E] to-[#0F1C3F] border border-[#1E3A8A] p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-[#060B19] border border-[#1E3A8A] flex items-center justify-center shrink-0">
                <Scissors className="w-8 h-8 text-[#3B82F6]" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#3B82F6]">
                  Patrocinador Oficial
                </span>
                <h3 className="font-display font-black text-2xl sm:text-3xl text-white mt-0.5">
                  KRD Barbería
                </h3>
                <p className="text-sm text-slate-300 mt-1">
                  Estilo de campeonato dentro y fuera de la cancha. Aliado oficial de Rifles de
                  Toronto F.C.
                </p>
              </div>
            </div>

            <a
              href={CLUB_LINKS.instagramSponsor}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-200 text-[#060B19] font-display font-black text-xs uppercase tracking-wider transition-all"
            >
              <Instagram className="w-4 h-4" />
              Seguir a @krd_barberia
            </a>
          </div>
        </div>
      </section>

      <footer className="bg-[#060B19] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3.5">
            <ClubCrest className="w-11 h-11" showStars={true} />
            <div>
              <p className="font-display font-black text-base uppercase tracking-wider text-white">
                Rifles de Toronto F.C.
              </p>
              <p className="text-xs text-slate-400">
                Fundado en Febrero 2026 · Ciudad de México · ★★ Bicampeones
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={CLUB_LINKS.instagramClub}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F1C3F] border border-[#1E3A8A] hover:border-[#3B82F6] text-xs font-bold text-slate-200 transition-colors"
            >
              <Instagram className="w-4 h-4 text-[#3B82F6]" />
              @riflesfc
            </a>
            <a
              href={CLUB_LINKS.facebookLive}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F1C3F] border border-[#1E3A8A] hover:border-[#3B82F6] text-xs font-bold text-slate-200 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
              <Radio className="w-4 h-4 text-[#3B82F6]" />
              Facebook Live
            </a>
            <a
              href={CLUB_LINKS.instagramPhotographer}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F1C3F] border border-[#1E3A8A] hover:border-[#3B82F6] text-xs font-bold text-slate-200 transition-colors"
            >
              <Camera className="w-4 h-4 text-[#3B82F6]" />
              Foto: @aleextasis
            </a>
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0F1C3F]/70 hover:bg-[#13244E] text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              Admin
            </Link>
          </div>
        </div>
      </footer>

      {/* Floating Anthem Music Player (Bottom Left) */}
      <AnthemPlayer externalOpenSignal={anthemSignal} />

      {/* Floating WhatsApp CTA (Bottom Right) */}
      <a
        href={CLUB_LINKS.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        title={`WhatsApp Rifles de Toronto F.C. (${CLUB_LINKS.whatsappPhoneDisplay})`}
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#2563EB] hover:bg-[#3B82F6] text-white font-display font-bold text-xs uppercase tracking-wider border border-white/20 shadow-[0_10px_30px_rgba(37,99,235,0.5)] transition-all hover:scale-105"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="hidden sm:inline">{CLUB_LINKS.whatsappPhoneDisplay}</span>
      </a>

      {/* Jersey Inspection Modal */}
      {selectedJersey && (
        <div
          className="fixed inset-0 z-50 bg-[#060B19]/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedJersey(null)}
        >
          <div
            className="max-w-lg w-full rounded-2xl bg-[#0F1C3F] border border-[#1E3A8A] p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedJersey(null)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-[#060B19] text-slate-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="rounded-xl bg-[#060B19] border border-[#1E3A8A] p-2 mb-5">
              <img
                src={selectedJersey.image_url}
                alt={selectedJersey.name}
                className="w-full max-h-80 object-contain rounded-lg mx-auto"
              />
            </div>
            {selectedJersey.edition && (
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#3B82F6]">
                {selectedJersey.edition}
              </span>
            )}
            <h3 className="font-display font-black text-2xl text-white mt-1">
              {selectedJersey.name}
            </h3>
            <p className="text-xs font-semibold text-slate-300 mt-1">{selectedJersey.league}</p>
            {selectedJersey.description && (
              <p className="text-sm text-slate-200 mt-4 leading-relaxed">
                {selectedJersey.description}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Photo Lightbox Modal */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 bg-[#060B19]/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <div
            className="max-w-4xl w-full rounded-2xl bg-[#0F1C3F] border border-[#1E3A8A] overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxPhoto(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-[#060B19]/80 text-white hover:bg-[#2563EB] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="bg-[#060B19] max-h-[75vh] flex items-center justify-center">
              <SmartPhoto
                src={lightboxPhoto.image_url}
                alt={lightboxPhoto.title}
                className="max-h-[75vh] w-auto object-contain"
              />
            </div>
            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#3B82F6]">
                  {lightboxPhoto.matchday || 'Galería Oficial'}
                </p>
                <h3 className="font-display font-bold text-lg text-white">{lightboxPhoto.title}</h3>
              </div>
              <a
                href={CLUB_LINKS.instagramPhotographer}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-slate-300 hover:text-[#3B82F6] inline-flex items-center gap-1.5"
              >
                <Camera className="w-4 h-4 text-[#3B82F6]" />
                {lightboxPhoto.photographer || '@aleextasis'}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
