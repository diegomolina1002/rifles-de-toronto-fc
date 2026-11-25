import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Camera,
  CheckCircle2,
  Edit3,
  ImagePlus,
  Lock,
  LogOut,
  Plus,
  Shield,
  Shirt,
  Trash2,
  Trophy,
  Upload,
  Users,
  X
} from 'lucide-react';
import { api, getAdminToken, setAdminToken } from '../api.js';
import { ClubCrest } from '../components/ClubVisuals.jsx';
import { JERSEY_COLOR_OPTIONS } from '../data/clubData.js';

const POSITIONS = ['Portero', 'Defensa', 'Medio', 'Delantero'];
const MATCH_STATUSES = [
  'Programado',
  'Victoria',
  'Empate',
  'Derrota',
  'Victoria — Campeones'
];

const emptyPlayerForm = {
  name: '',
  nickname: '',
  number: '',
  position: 'Medio',
  goals: '0',
  matches: '0'
};

const emptyMatchForm = {
  opponent: '',
  league: 'Liga La Curva CDMX',
  date: '',
  time: '20:00',
  venue: '',
  jersey_color: 'Azul Marino',
  is_upcoming: true,
  score_home: '',
  score_away: '',
  status: 'Programado',
  notes: ''
};

const emptyJerseyForm = {
  name: '',
  edition: '',
  league: 'Liga La Curva CDMX',
  color_hex: '#1E3A8A',
  description: ''
};

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [tab, setTab] = useState('players');
  const [banner, setBanner] = useState(null);

  // Data
  const [players, setPlayers] = useState([]);
  const [jerseys, setJerseys] = useState([]);
  const [matches, setMatches] = useState([]);
  const [photos, setPhotos] = useState([]);

  // Player form
  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const [playerForm, setPlayerForm] = useState(emptyPlayerForm);
  const [playerFile, setPlayerFile] = useState(null);
  const [playerPreview, setPlayerPreview] = useState('');
  const [savingPlayer, setSavingPlayer] = useState(false);

  // Jersey form
  const [editingJerseyId, setEditingJerseyId] = useState(null);
  const [jerseyForm, setJerseyForm] = useState(emptyJerseyForm);
  const [jerseyFile, setJerseyFile] = useState(null);
  const [jerseyPreview, setJerseyPreview] = useState('');
  const [savingJersey, setSavingJersey] = useState(false);

  // Match form
  const [editingMatchId, setEditingMatchId] = useState(null);
  const [matchForm, setMatchForm] = useState(emptyMatchForm);
  const [savingMatch, setSavingMatch] = useState(false);

  // Photo upload form
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoMatchday, setPhotoMatchday] = useState('');
  const [photoCredit, setPhotoCredit] = useState('@aleextasis');
  const [photoFiles, setPhotoFiles] = useState([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  const notify = (type, text) => {
    setBanner({ type, text });
    setTimeout(() => setBanner(null), 4500);
  };

  async function loadAllData() {
    const [p, j, m, ph] = await Promise.all([
      api.getPlayers(),
      api.getJerseys(),
      api.getMatches(),
      api.getGallery()
    ]);
    setPlayers(p);
    setJerseys(j);
    setMatches(m);
    setPhotos(ph);
  }

  useEffect(() => {
    async function check() {
      const token = getAdminToken();
      if (!token) {
        setCheckingAuth(false);
        return;
      }
      try {
        await api.verifyAdmin();
        setAuthenticated(true);
        await loadAllData();
      } catch {
        setAdminToken('');
        setAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    }
    check();
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setAuthError('');
    try {
      const { token } = await api.login(password);
      setAdminToken(token);
      setAuthenticated(true);
      setPassword('');
      await loadAllData();
    } catch (err) {
      setAuthError(err.message || 'Contraseña incorrecta');
    }
  }

  function handleLogout() {
    setAdminToken('');
    setAuthenticated(false);
  }

  // =====================
  // PLAYER HANDLERS
  // =====================
  function handlePlayerFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPlayerFile(file);
    setPlayerPreview(URL.createObjectURL(file));
  }

  function startEditPlayer(p) {
    setEditingPlayerId(p.id);
    setPlayerForm({
      name: p.name,
      nickname: p.nickname || '',
      number: String(p.number),
      position: p.position,
      goals: String(p.goals ?? 0),
      matches: String(p.matches ?? 0)
    });
    setPlayerFile(null);
    setPlayerPreview(p.photo_url || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetPlayerForm() {
    setEditingPlayerId(null);
    setPlayerForm(emptyPlayerForm);
    setPlayerFile(null);
    setPlayerPreview('');
  }

  async function submitPlayer(e) {
    e.preventDefault();
    setSavingPlayer(true);
    try {
      const fd = new FormData();
      fd.append('name', playerForm.name);
      fd.append('nickname', playerForm.nickname);
      fd.append('number', playerForm.number);
      fd.append('position', playerForm.position);
      fd.append('goals', playerForm.goals || '0');
      fd.append('matches', playerForm.matches || '0');
      if (playerFile) fd.append('photo', playerFile);

      if (editingPlayerId) {
        await api.updatePlayer(editingPlayerId, fd);
        notify('ok', 'Jugador actualizado correctamente.');
      } else {
        await api.createPlayer(fd);
        notify('ok', 'Jugador agregado a la plantilla.');
      }
      resetPlayerForm();
      setPlayers(await api.getPlayers());
    } catch (err) {
      notify('err', err.message);
    } finally {
      setSavingPlayer(false);
    }
  }

  async function removePlayer(id, name) {
    if (!window.confirm(`¿Eliminar a ${name} de la plantilla?`)) return;
    try {
      await api.deletePlayer(id);
      setPlayers((prev) => prev.filter((p) => p.id !== id));
      notify('ok', 'Jugador eliminado.');
    } catch (err) {
      notify('err', err.message);
    }
  }

  // =====================
  // JERSEY HANDLERS
  // =====================
  function handleJerseyFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setJerseyFile(file);
    setJerseyPreview(URL.createObjectURL(file));
  }

  function startEditJersey(j) {
    setEditingJerseyId(j.id);
    setJerseyForm({
      name: j.name,
      edition: j.edition || '',
      league: j.league || 'Liga La Curva CDMX',
      color_hex: j.color_hex || '#1E3A8A',
      description: j.description || ''
    });
    setJerseyFile(null);
    setJerseyPreview(j.image_url || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetJerseyForm() {
    setEditingJerseyId(null);
    setJerseyForm(emptyJerseyForm);
    setJerseyFile(null);
    setJerseyPreview('');
  }

  async function submitJersey(e) {
    e.preventDefault();
    if (!editingJerseyId && !jerseyFile) {
      notify('err', 'Sube una fotografía real de la playera.');
      return;
    }
    setSavingJersey(true);
    try {
      const fd = new FormData();
      fd.append('name', jerseyForm.name);
      fd.append('edition', jerseyForm.edition);
      fd.append('league', jerseyForm.league);
      fd.append('color_hex', jerseyForm.color_hex);
      fd.append('description', jerseyForm.description);
      if (jerseyFile) fd.append('image', jerseyFile);

      if (editingJerseyId) {
        await api.updateJersey(editingJerseyId, fd);
        notify('ok', 'Playera actualizada correctamente.');
      } else {
        await api.createJersey(fd);
        notify('ok', 'Playera agregada al Catálogo de Armaduras.');
      }
      resetJerseyForm();
      setJerseys(await api.getJerseys());
    } catch (err) {
      notify('err', err.message);
    } finally {
      setSavingJersey(false);
    }
  }

  async function removeJersey(id, name) {
    if (!window.confirm(`¿Eliminar la playera "${name}" del catálogo?`)) return;
    try {
      await api.deleteJersey(id);
      setJerseys((prev) => prev.filter((j) => j.id !== id));
      notify('ok', 'Playera eliminada.');
    } catch (err) {
      notify('err', err.message);
    }
  }

  // =====================
  // MATCH HANDLERS
  // =====================
  function startEditMatch(m) {
    setEditingMatchId(m.id);
    setMatchForm({
      opponent: m.opponent,
      league: m.league,
      date: m.date,
      time: m.time || '20:00',
      venue: m.venue || '',
      jersey_color: m.jersey_color || 'Azul Marino',
      is_upcoming: Boolean(m.is_upcoming),
      score_home: m.score_home === null || m.score_home === undefined ? '' : String(m.score_home),
      score_away: m.score_away === null || m.score_away === undefined ? '' : String(m.score_away),
      status: m.status || 'Programado',
      notes: m.notes || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetMatchForm() {
    setEditingMatchId(null);
    setMatchForm(emptyMatchForm);
  }

  async function submitMatch(e) {
    e.preventDefault();
    setSavingMatch(true);
    try {
      const payload = {
        ...matchForm,
        is_upcoming: matchForm.is_upcoming ? 1 : 0,
        score_home: matchForm.score_home === '' ? null : Number(matchForm.score_home),
        score_away: matchForm.score_away === '' ? null : Number(matchForm.score_away)
      };

      if (editingMatchId) {
        await api.updateMatch(editingMatchId, payload);
        notify('ok', 'Partido actualizado.');
      } else {
        await api.createMatch(payload);
        notify('ok', 'Partido guardado en el calendario.');
      }
      resetMatchForm();
      setMatches(await api.getMatches());
    } catch (err) {
      notify('err', err.message);
    } finally {
      setSavingMatch(false);
    }
  }

  async function removeMatch(id) {
    if (!window.confirm('¿Eliminar este partido?')) return;
    try {
      await api.deleteMatch(id);
      setMatches((prev) => prev.filter((m) => m.id !== id));
      notify('ok', 'Partido eliminado.');
    } catch (err) {
      notify('err', err.message);
    }
  }

  // =====================
  // PHOTO HANDLERS
  // =====================
  function handleGalleryFiles(e) {
    const selected = Array.from(e.target.files || []);
    setPhotoFiles(selected);
  }

  async function submitPhotos(e) {
    e.preventDefault();
    if (photoFiles.length === 0) {
      notify('err', 'Selecciona al menos una imagen.');
      return;
    }
    setUploadingPhotos(true);
    try {
      const fd = new FormData();
      fd.append('title', photoTitle || 'Partido Rifles de Toronto F.C.');
      fd.append('matchday', photoMatchday);
      fd.append('photographer', photoCredit || '@aleextasis');
      for (const file of photoFiles) {
        fd.append('photos', file);
      }
      await api.uploadGallery(fd);
      notify('ok', `${photoFiles.length} foto(s) subidas a la galería.`);
      setPhotoTitle('');
      setPhotoMatchday('');
      setPhotoFiles([]);
      setPhotos(await api.getGallery());
    } catch (err) {
      notify('err', err.message);
    } finally {
      setUploadingPhotos(false);
    }
  }

  async function removePhoto(id) {
    if (!window.confirm('¿Eliminar esta fotografía de la galería?')) return;
    try {
      await api.deleteGalleryPhoto(id);
      setPhotos((prev) => prev.filter((p) => p.id !== id));
      notify('ok', 'Foto eliminada.');
    } catch (err) {
      notify('err', err.message);
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#060B19] flex items-center justify-center text-slate-300">
        Verificando acceso...
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#060B19] pitch-grid flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-[#0F1C3F] border border-[#1E3A8A] p-7 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-6">
            <ClubCrest className="w-18 h-18 mb-3" showStars={true} />
            <h1 className="font-display font-black text-2xl uppercase tracking-tight">
              Panel Admin
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Rifles de Toronto F.C. · Gestión del Club
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-1.5">
                Contraseña de Administrador
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa la contraseña"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#060B19] border border-[#1E3A8A] text-white placeholder:text-slate-500 focus:outline-none focus:border-[#3B82F6]"
                />
              </div>
            </div>

            {authError && (
              <p className="text-xs font-semibold text-white bg-[#2563EB]/20 border border-[#3B82F6] rounded-lg px-3 py-2">
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#2563EB] hover:bg-[#3B82F6] text-white font-display font-bold text-sm uppercase tracking-wider transition-colors"
            >
              Entrar al Panel
            </button>
          </form>

          <Link
            to="/"
            className="mt-6 inline-flex items-center justify-center gap-2 w-full text-xs font-semibold text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al sitio público
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060B19] text-white pb-16">
      {/* Top Sticky Admin Header */}
      <header className="sticky top-0 z-40 bg-[#060B19]/95 backdrop-blur border-b border-[#1E3A8A]">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-[#3B82F6]" />
            <div>
              <h1 className="font-display font-black text-sm sm:text-base uppercase tracking-wider">
                CMS Rifles F.C.
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Gestión en la nube · Supabase + Vercel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0F1C3F] border border-[#1E3A8A] text-xs font-bold text-slate-200 hover:text-white"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Ver Web
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#13244E] border border-[#1E3A8A] text-xs font-bold text-slate-200 hover:bg-[#2563EB] hover:text-white transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
        {banner && (
          <div
            className={`rounded-xl px-4 py-3 text-sm font-semibold flex items-center gap-2 border ${
              banner.type === 'ok'
                ? 'bg-[#0F1C3F] border-[#3B82F6] text-white'
                : 'bg-[#13244E] border-amber-400/60 text-amber-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#3B82F6]" />
            <span>{banner.text}</span>
          </div>
        )}

        {/* Mobile-friendly 4 Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#0F1C3F] p-1.5 rounded-2xl border border-[#1E3A8A]">
          <button
            type="button"
            onClick={() => setTab('players')}
            className={`py-3 px-2 rounded-xl font-display font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              tab === 'players'
                ? 'bg-[#2563EB] text-white shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Jugadores</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('jerseys')}
            className={`py-3 px-2 rounded-xl font-display font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              tab === 'jerseys'
                ? 'bg-[#2563EB] text-white shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Shirt className="w-4 h-4" />
            <span>Playeras</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('matches')}
            className={`py-3 px-2 rounded-xl font-display font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              tab === 'matches'
                ? 'bg-[#2563EB] text-white shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Partidos</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('photos')}
            className={`py-3 px-2 rounded-xl font-display font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              tab === 'photos'
                ? 'bg-[#2563EB] text-white shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Galería</span>
          </button>
        </div>

        {/* =========================================
            TAB 1: JUGADORES
        ========================================= */}
        {tab === 'players' && (
          <div className="space-y-6">
            <form
              onSubmit={submitPlayer}
              className="rounded-2xl bg-[#0F1C3F] border border-[#1E3A8A] p-5 sm:p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display font-black text-lg uppercase flex items-center gap-2">
                  <Plus className="w-5 h-5 text-[#3B82F6]" />
                  {editingPlayerId ? 'Editar Jugador' : 'Agregar Nuevo Jugador'}
                </h2>
                {editingPlayerId && (
                  <button
                    type="button"
                    onClick={resetPlayerForm}
                    className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1"
                  >
                    <X className="w-4 h-4" /> Cancelar
                  </button>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    required
                    value={playerForm.name}
                    onChange={(e) => setPlayerForm({ ...playerForm, name: e.target.value })}
                    placeholder="Ej. Emiliano Cruz"
                    className="w-full px-3.5 py-3 rounded-xl bg-[#060B19] border border-[#1E3A8A] text-sm text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Apodo
                  </label>
                  <input
                    value={playerForm.nickname}
                    onChange={(e) => setPlayerForm({ ...playerForm, nickname: e.target.value })}
                    placeholder="Ej. El Rifle"
                    className="w-full px-3.5 py-3 rounded-xl bg-[#060B19] border border-[#1E3A8A] text-sm text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                      Dorsal *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="99"
                      required
                      value={playerForm.number}
                      onChange={(e) => setPlayerForm({ ...playerForm, number: e.target.value })}
                      placeholder="10"
                      className="w-full px-3.5 py-3 rounded-xl bg-[#060B19] border border-[#1E3A8A] text-sm text-white focus:outline-none focus:border-[#3B82F6]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                      Posición *
                    </label>
                    <select
                      value={playerForm.position}
                      onChange={(e) => setPlayerForm({ ...playerForm, position: e.target.value })}
                      className="w-full px-3 py-3 rounded-xl bg-[#060B19] border border-[#1E3A8A] text-sm text-white focus:outline-none focus:border-[#3B82F6]"
                    >
                      {POSITIONS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                      Goles
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={playerForm.goals}
                      onChange={(e) => setPlayerForm({ ...playerForm, goals: e.target.value })}
                      className="w-full px-3.5 py-3 rounded-xl bg-[#060B19] border border-[#1E3A8A] text-sm text-white focus:outline-none focus:border-[#3B82F6]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                      Partidos
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={playerForm.matches}
                      onChange={(e) => setPlayerForm({ ...playerForm, matches: e.target.value })}
                      className="w-full px-3.5 py-3 rounded-xl bg-[#060B19] border border-[#1E3A8A] text-sm text-white focus:outline-none focus:border-[#3B82F6]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                  Foto del Jugador (desde dispositivo)
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-[#060B19] border border-dashed border-[#1E3A8A] hover:border-[#3B82F6] text-xs font-bold uppercase tracking-wider text-slate-200">
                    <Upload className="w-4 h-4 text-[#3B82F6]" />
                    <span>{playerFile ? playerFile.name : 'Seleccionar Foto'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePlayerFileChange}
                      className="hidden"
                    />
                  </label>
                  {playerPreview && (
                    <img
                      src={playerPreview}
                      alt="Vista previa"
                      className="w-14 h-14 rounded-xl object-cover border border-[#3B82F6]"
                    />
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={savingPlayer}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#2563EB] hover:bg-[#3B82F6] disabled:opacity-50 font-display font-bold text-xs uppercase tracking-wider transition-colors"
              >
                {savingPlayer
                  ? 'Guardando...'
                  : editingPlayerId
                    ? 'Actualizar Jugador'
                    : 'Guardar Jugador'}
              </button>
            </form>

            <div className="space-y-3">
              <h3 className="font-display font-bold text-sm uppercase tracking-wider text-slate-300">
                Plantilla Actual ({players.length})
              </h3>
              {players.length === 0 ? (
                <div className="rounded-xl bg-[#0F1C3F]/60 border border-dashed border-[#1E3A8A] p-6 text-center text-sm text-slate-300">
                  La plantilla está vacía. Agrega arriba al primer jugador oficial del club.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {players.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-xl bg-[#0F1C3F] border border-[#1E3A8A] p-3.5 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {p.photo_url ? (
                          <img
                            src={p.photo_url}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[#1E3A8A]"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-[#060B19] border border-[#1E3A8A] flex items-center justify-center font-display font-black text-sm text-[#3B82F6] shrink-0">
                            #{p.number}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-display font-bold text-sm text-white truncate">
                            #{p.number} {p.name}
                          </p>
                          <p className="text-xs text-slate-300 truncate">
                            {p.position} · {p.goals}G / {p.matches}PJ
                            {p.nickname ? ` · "${p.nickname}"` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEditPlayer(p)}
                          className="p-2.5 rounded-lg bg-[#060B19] border border-[#1E3A8A] text-slate-200 hover:text-[#3B82F6]"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removePlayer(p.id, p.name)}
                          className="p-2.5 rounded-lg bg-[#060B19] border border-[#1E3A8A] text-slate-200 hover:text-white hover:bg-[#2563EB]"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================
            TAB 2: PLAYERAS / ARMADURAS
        ========================================= */}
        {tab === 'jerseys' && (
          <div className="space-y-6">
            <form
              onSubmit={submitJersey}
              className="rounded-2xl bg-[#0F1C3F] border border-[#1E3A8A] p-5 sm:p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display font-black text-lg uppercase flex items-center gap-2">
                  <Shirt className="w-5 h-5 text-[#3B82F6]" />
                  {editingJerseyId ? 'Editar Playera Oficial' : 'Subir Nueva Playera / Armadura'}
                </h2>
                {editingJerseyId && (
                  <button
                    type="button"
                    onClick={resetJerseyForm}
                    className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1"
                  >
                    <X className="w-4 h-4" /> Cancelar
                  </button>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Nombre de la Playera *
                  </label>
                  <input
                    required
                    value={jerseyForm.name}
                    onChange={(e) => setJerseyForm({ ...jerseyForm, name: e.target.value })}
                    placeholder="Ej. Azul Claro Histórica, Amarilla, Roja..."
                    className="w-full px-3.5 py-3 rounded-xl bg-[#060B19] border border-[#1E3A8A] text-sm text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Liga donde se usa *
                  </label>
                  <input
                    required
                    list="jersey-leagues-list"
                    value={jerseyForm.league}
                    onChange={(e) => setJerseyForm({ ...jerseyForm, league: e.target.value })}
                    placeholder="Ej. Liga La Curva CDMX"
                    className="w-full px-3.5 py-3 rounded-xl bg-[#060B19] border border-[#1E3A8A] text-sm text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                  <datalist id="jersey-leagues-list">
                    <option value="Liga La Curva CDMX" />
                    <option value="Capital Fútbol Rápido" />
                    <option value="Liga ODEMAC · Campo Contreras" />
                    <option value="Edición Histórica" />
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Edición / Etiqueta
                  </label>
                  <input
                    value={jerseyForm.edition}
                    onChange={(e) => setJerseyForm({ ...jerseyForm, edition: e.target.value })}
                    placeholder="Ej. Edición Fundacional, Titular Actual..."
                    className="w-full px-3.5 py-3 rounded-xl bg-[#060B19] border border-[#1E3A8A] text-sm text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Color Representativo
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={jerseyForm.color_hex}
                      onChange={(e) => setJerseyForm({ ...jerseyForm, color_hex: e.target.value })}
                      className="w-12 h-11 rounded-xl bg-[#060B19] border border-[#1E3A8A] p-1 cursor-pointer"
                    />
                    <select
                      value={jerseyForm.color_hex}
                      onChange={(e) => setJerseyForm({ ...jerseyForm, color_hex: e.target.value })}
                      className="flex-1 px-3 py-3 rounded-xl bg-[#060B19] border border-[#1E3A8A] text-sm text-white focus:outline-none focus:border-[#3B82F6]"
                    >
                      {JERSEY_COLOR_OPTIONS.map((c) => (
                        <option key={c.label} value={c.hex}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Historia / Descripción
                  </label>
                  <input
                    value={jerseyForm.description}
                    onChange={(e) => setJerseyForm({ ...jerseyForm, description: e.target.value })}
                    placeholder="Ej. Primera playera en la historia del equipo (Febrero 2026)"
                    className="w-full px-3.5 py-3 rounded-xl bg-[#060B19] border border-[#1E3A8A] text-sm text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                  Fotografía Real de la Playera {editingJerseyId ? '(opcional al editar)' : '*'}
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-[#060B19] border border-dashed border-[#1E3A8A] hover:border-[#3B82F6] text-xs font-bold uppercase tracking-wider text-slate-200">
                    <Upload className="w-4 h-4 text-[#3B82F6]" />
                    <span>{jerseyFile ? jerseyFile.name : 'Subir Foto de Playera'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleJerseyFileChange}
                      className="hidden"
                    />
                  </label>
                  {jerseyPreview && (
                    <img
                      src={jerseyPreview}
                      alt="Vista previa playera"
                      className="w-16 h-16 rounded-xl object-cover border border-[#3B82F6]"
                    />
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={savingJersey}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#2563EB] hover:bg-[#3B82F6] disabled:opacity-50 font-display font-bold text-xs uppercase tracking-wider transition-colors"
              >
                {savingJersey
                  ? 'Guardando...'
                  : editingJerseyId
                    ? 'Actualizar Playera'
                    : 'Publicar Playera'}
              </button>
            </form>

            <div className="space-y-3">
              <h3 className="font-display font-bold text-sm uppercase tracking-wider text-slate-300">
                Armaduras Registradas ({jerseys.length})
              </h3>
              {jerseys.length === 0 ? (
                <div className="rounded-xl bg-[#0F1C3F]/60 border border-dashed border-[#1E3A8A] p-6 text-center text-sm text-slate-300">
                  No hay playeras subidas aún. Sube la primera arriba.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {jerseys.map((j) => (
                    <div
                      key={j.id}
                      className="rounded-xl bg-[#0F1C3F] border border-[#1E3A8A] overflow-hidden flex flex-col"
                    >
                      <div className="aspect-square bg-[#060B19] relative">
                        <img
                          src={j.image_url}
                          alt={j.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full border border-white/50"
                              style={{ backgroundColor: j.color_hex }}
                            />
                            <span className="text-[11px] font-bold uppercase text-[#3B82F6]">
                              {j.league}
                            </span>
                          </div>
                          <p className="font-display font-bold text-base text-white mt-1">
                            {j.name}
                          </p>
                          {j.edition && <p className="text-xs text-slate-300">{j.edition}</p>}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEditJersey(j)}
                            className="flex-1 py-2 rounded-lg bg-[#060B19] border border-[#1E3A8A] text-xs font-bold text-slate-200 hover:text-[#3B82F6] flex items-center justify-center gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => removeJersey(j.id, j.name)}
                            className="p-2 rounded-lg bg-[#060B19] border border-[#1E3A8A] text-slate-200 hover:text-white hover:bg-[#2563EB]"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================
            TAB 3: PARTIDOS
        ========================================= */}
        {tab === 'matches' && (
          <div className="space-y-6">
            <form
              onSubmit={submitMatch}
              className="rounded-2xl bg-[#0F1C3F] border border-[#1E3A8A] p-5 sm:p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display font-black text-lg uppercase flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#3B82F6]" />
                  {editingMatchId ? 'Editar Partido' : 'Programar Próximo Partido / Resultado'}
                </h2>
                {editingMatchId && (
                  <button
                    type="button"
                    onClick={resetMatchForm}
                    className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1"
                  >
                    <X className="w-4 h-4" /> Cancelar
                  </button>
                )}
              </div>

              <label className="flex items-center gap-3 p-3.5 rounded-xl bg-[#060B19] border border-[#1E3A8A] cursor-pointer">
                <input
                  type="checkbox"
                  checked={matchForm.is_upcoming}
                  onChange={(e) =>
                    setMatchForm({
                      ...matchForm,
                      is_upcoming: e.target.checked,
                      status: e.target.checked ? 'Programado' : matchForm.status
                    })
                  }
                  className="w-5 h-5 accent-[#2563EB]"
                />
                <div>
                  <span className="block text-xs font-extrabold uppercase tracking-wider text-[#3B82F6]">
                    Destacar como Próximo Partido (Hero)
                  </span>
                  <span className="block text-[11px] text-slate-300">
                    Aparecerá en la tarjeta principal de la portada.
                  </span>
                </div>
              </label>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Rival *
                  </label>
                  <input
                    required
                    value={matchForm.opponent}
                    onChange={(e) => setMatchForm({ ...matchForm, opponent: e.target.value })}
                    placeholder="Ej. Deportivo Sur F.C."
                    className="w-full px-3.5 py-3 rounded-xl bg-[#060B19] border border-[#1E3A8A] text-sm text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Liga / Torneo *
                  </label>
                  <input
                    required
                    list="leagues-list"
                    value={matchForm.league}
                    onChange={(e) => setMatchForm({ ...matchForm, league: e.target.value })}
                    placeholder="Liga La Curva CDMX"
                    className="w-full px-3.5 py-3 rounded-xl bg-[#060B19] border border-[#1E3A8A] text-sm text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                  <datalist id="leagues-list">
                    <option value="Liga La Curva CDMX" />
                    <option value="Capital Fútbol Rápido" />
                    <option value="Liga ODEMAC" />
                    <option value="Partido Amistoso" />
                  </datalist>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                      Fecha *
                    </label>
                    <input
                      type="date"
                      required
                      value={matchForm.date}
                      onChange={(e) => setMatchForm({ ...matchForm, date: e.target.value })}
                      className="w-full px-3 py-3 rounded-xl bg-[#060B19] border border-[#1E3A8A] text-sm text-white focus:outline-none focus:border-[#3B82F6]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                      Hora
                    </label>
                    <input
                      type="time"
                      value={matchForm.time}
                      onChange={(e) => setMatchForm({ ...matchForm, time: e.target.value })}
                      className="w-full px-3 py-3 rounded-xl bg-[#060B19] border border-[#1E3A8A] text-sm text-white focus:outline-none focus:border-[#3B82F6]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Color de Playera a Usar *
                  </label>
                  <select
                    value={matchForm.jersey_color}
                    onChange={(e) => setMatchForm({ ...matchForm, jersey_color: e.target.value })}
                    className="w-full px-3.5 py-3 rounded-xl bg-[#060B19] border border-[#1E3A8A] text-sm text-white focus:outline-none focus:border-[#3B82F6]"
                  >
                    {JERSEY_COLOR_OPTIONS.map((c) => (
                      <option key={c.label} value={c.label}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Sede / Campo
                  </label>
                  <input
                    value={matchForm.venue}
                    onChange={(e) => setMatchForm({ ...matchForm, venue: e.target.value })}
                    placeholder="Ej. Campo Contreras, Magdalena Contreras"
                    className="w-full px-3.5 py-3 rounded-xl bg-[#060B19] border border-[#1E3A8A] text-sm text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>

                {!matchForm.is_upcoming && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                          Goles Rifles
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={matchForm.score_home}
                          onChange={(e) =>
                            setMatchForm({ ...matchForm, score_home: e.target.value })
                          }
                          className="w-full px-3.5 py-3 rounded-xl bg-[#060B19] border border-[#1E3A8A] text-sm text-white focus:outline-none focus:border-[#3B82F6]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                          Goles Rival
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={matchForm.score_away}
                          onChange={(e) =>
                            setMatchForm({ ...matchForm, score_away: e.target.value })
                          }
                          className="w-full px-3.5 py-3 rounded-xl bg-[#060B19] border border-[#1E3A8A] text-sm text-white focus:outline-none focus:border-[#3B82F6]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                        Resultado / Estado
                      </label>
                      <select
                        value={matchForm.status}
                        onChange={(e) => setMatchForm({ ...matchForm, status: e.target.value })}
                        className="w-full px-3.5 py-3 rounded-xl bg-[#060B19] border border-[#1E3A8A] text-sm text-white focus:outline-none focus:border-[#3B82F6]"
                      >
                        {MATCH_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Notas / Indicaciones
                  </label>
                  <input
                    value={matchForm.notes}
                    onChange={(e) => setMatchForm({ ...matchForm, notes: e.target.value })}
                    placeholder="Ej. Llegar 30 min antes con espinilleras"
                    className="w-full px-3.5 py-3 rounded-xl bg-[#060B19] border border-[#1E3A8A] text-sm text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingMatch}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#2563EB] hover:bg-[#3B82F6] disabled:opacity-50 font-display font-bold text-xs uppercase tracking-wider transition-colors"
              >
                {savingMatch
                  ? 'Guardando...'
                  : editingMatchId
                    ? 'Actualizar Partido'
                    : 'Guardar Partido'}
              </button>
            </form>

            <div className="space-y-3">
              <h3 className="font-display font-bold text-sm uppercase tracking-wider text-slate-300">
                Partidos Registrados ({matches.length})
              </h3>
              <div className="space-y-3">
                {matches.map((m) => (
                  <div
                    key={m.id}
                    className={`rounded-xl p-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      m.is_upcoming
                        ? 'bg-[#13244E] border-[#3B82F6]'
                        : 'bg-[#0F1C3F] border-[#1E3A8A]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {Boolean(m.is_upcoming) && (
                          <span className="px-2 py-0.5 rounded bg-[#2563EB] text-[10px] font-black uppercase tracking-wider">
                            Próximo Partido
                          </span>
                        )}
                        <span className="text-xs font-bold text-[#3B82F6]">{m.league}</span>
                        <span className="text-xs text-slate-300">
                          {m.date} · {m.time}
                        </span>
                      </div>
                      <p className="font-display font-bold text-base text-white">
                        Rifles vs {m.opponent}
                        {m.score_home !== null && m.score_away !== null
                          ? ` (${m.score_home} - ${m.score_away})`
                          : ''}
                      </p>
                      <p className="text-xs text-slate-300">
                        Sede: {m.venue || 'CDMX'} · Playera: {m.jersey_color} · {m.status}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEditMatch(m)}
                        className="p-2.5 rounded-lg bg-[#060B19] border border-[#1E3A8A] text-slate-200 hover:text-[#3B82F6]"
                        title="Editar partido"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeMatch(m.id)}
                        className="p-2.5 rounded-lg bg-[#060B19] border border-[#1E3A8A] text-slate-200 hover:text-white hover:bg-[#2563EB]"
                        title="Eliminar partido"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            TAB 4: GALERÍA DE FOTOS (MULTI-UPLOAD)
        ========================================= */}
        {tab === 'photos' && (
          <div className="space-y-6">
            <form
              onSubmit={submitPhotos}
              className="rounded-2xl bg-[#0F1C3F] border border-[#1E3A8A] p-5 sm:p-6 space-y-4"
            >
              <h2 className="font-display font-black text-lg uppercase flex items-center gap-2">
                <ImagePlus className="w-5 h-5 text-[#3B82F6]" />
                Subir Fotos de Partidos
              </h2>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Título / Encuentro *
                  </label>
                  <input
                    required
                    value={photoTitle}
                    onChange={(e) => setPhotoTitle(e.target.value)}
                    placeholder="Ej. Victoria vs Cuervos"
                    className="w-full px-3.5 py-3 rounded-xl bg-[#060B19] border border-[#1E3A8A] text-sm text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Jornada / Fecha
                  </label>
                  <input
                    value={photoMatchday}
                    onChange={(e) => setPhotoMatchday(e.target.value)}
                    placeholder="Ej. Jornada 7 · La Curva"
                    className="w-full px-3.5 py-3 rounded-xl bg-[#060B19] border border-[#1E3A8A] text-sm text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Crédito Fotógrafo
                  </label>
                  <input
                    value={photoCredit}
                    onChange={(e) => setPhotoCredit(e.target.value)}
                    placeholder="@aleextasis"
                    className="w-full px-3.5 py-3 rounded-xl bg-[#060B19] border border-[#1E3A8A] text-sm text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>
              </div>

              <label className="cursor-pointer flex flex-col items-center justify-center gap-2 p-6 rounded-2xl bg-[#060B19] border-2 border-dashed border-[#1E3A8A] hover:border-[#3B82F6] transition-colors text-center">
                <Upload className="w-7 h-7 text-[#3B82F6]" />
                <span className="text-sm font-bold text-white">
                  {photoFiles.length > 0
                    ? `${photoFiles.length} foto(s) seleccionada(s)`
                    : 'Toca aquí para seleccionar una o varias fotos'}
                </span>
                <span className="text-xs text-slate-400">
                  JPG, PNG o WEBP (hasta 20 fotos por carga)
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleGalleryFiles}
                  className="hidden"
                />
              </label>

              {photoFiles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {photoFiles.map((f, idx) => (
                    <img
                      key={`${f.name}-${idx}`}
                      src={URL.createObjectURL(f)}
                      alt={f.name}
                      className="w-16 h-16 rounded-lg object-cover border border-[#3B82F6]"
                    />
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={uploadingPhotos}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#2563EB] hover:bg-[#3B82F6] disabled:opacity-50 font-display font-bold text-xs uppercase tracking-wider transition-colors"
              >
                {uploadingPhotos ? 'Subiendo fotos...' : 'Publicar en Galería'}
              </button>
            </form>

            <div className="space-y-3">
              <h3 className="font-display font-bold text-sm uppercase tracking-wider text-slate-300">
                Fotos Publicadas ({photos.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="rounded-xl bg-[#0F1C3F] border border-[#1E3A8A] overflow-hidden flex flex-col"
                  >
                    <div className="aspect-[4/3] bg-[#060B19] relative">
                      <img
                        src={photo.image_url}
                        alt={photo.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(photo.id)}
                        className="absolute top-2 right-2 p-2 rounded-lg bg-[#060B19]/85 text-white hover:bg-[#2563EB] transition-colors"
                        title="Eliminar foto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-3">
                      <p className="font-bold text-xs text-white truncate">{photo.title}</p>
                      <p className="text-[11px] text-slate-300 truncate">
                        {photo.matchday || photo.photographer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
