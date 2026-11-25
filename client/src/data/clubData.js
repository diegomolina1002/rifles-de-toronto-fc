export const CLUB_LINKS = {
  facebookLive: 'https://www.facebook.com/share/18nMZGsD5f/?mibextid=wwXIfr',
  whatsapp:
    'https://wa.me/525540890204?text=Hola%20Rifles%20de%20Toronto,%20queremos%20armar%20un%20partido',
  whatsappPhoneDisplay: '55 4089 0204',
  instagramClub: 'https://www.instagram.com/riflesfc',
  instagramPhotographer: 'https://www.instagram.com/aleextasis',
  instagramSponsor: 'https://www.instagram.com/krd_barberia',
  instagramLaCurva: 'https://www.instagram.com/lacurva_cdmx',
  instagramCapital: 'https://www.instagram.com/capitalfutbolrapido',
  anthemSpotifyUrl: 'https://open.spotify.com/track/5ArzGqbjaXegfi0UAr06ok',
  anthemSpotifyEmbed:
    'https://open.spotify.com/embed/track/5ArzGqbjaXegfi0UAr06ok?utm_source=generator&theme=0'
};

export const CHAMPIONSHIPS = [
  {
    id: 1,
    star: '1ª Estrella',
    date: '3 de Noviembre, 2026',
    title: 'Campeones Liga Universidad Motolinía',
    venue: 'Universidad Motolinía, CDMX',
    description:
      'El primer trofeo en las vitrinas del club. Consagración histórica con juego vertical, garra defensiva y contundencia frente al arco.'
  },
  {
    id: 2,
    star: '2ª Estrella',
    date: '15 de Noviembre, 2026',
    title: 'Campeones de Copa — Liga ODEMAC',
    venue: 'Campo Contreras, Magdalena Contreras, CDMX',
    description:
      'Solo doce días después del primer título, la armadura amarilla levantó la Copa ODEMAC sellando el bicampeonato 2026.'
  }
];

export const TOURNAMENTS = [
  {
    id: 'lacurva',
    name: 'Liga La Curva CDMX',
    venue: 'Sede Sur / CDMX',
    instagram: CLUB_LINKS.instagramLaCurva,
    handle: '@lacurva_cdmx',
    jerseys: ['Azul Marino', 'Negra', 'Roja'],
    badgeColor: '#2563EB',
    description:
      'Competencia nocturna de alta intensidad donde el club despliega su armadura titular Azul Marino y alternativas Negra y Roja.'
  },
  {
    id: 'capital',
    name: 'Capital Fútbol Rápido',
    venue: 'Cancha Capital, CDMX',
    instagram: CLUB_LINKS.instagramCapital,
    handle: '@capitalfutbolrapido',
    jerseys: ['Blanca'],
    badgeColor: '#FFFFFF',
    description:
      'Ritmo vertiginoso en cancha rápida con bardas. Aquí Rifles salta al terreno defendiendo la armadura Blanca.'
  },
  {
    id: 'odemac',
    name: 'Liga ODEMAC',
    venue: 'Campo Contreras, Magdalena Contreras, CDMX',
    instagram: null,
    handle: 'Campo Contreras',
    jerseys: ['Amarilla'],
    badgeColor: '#3B82F6',
    description:
      'Nuestra casa dorada en la Magdalena Contreras y escenario de la 2ª Estrella de Copa. Uniforme oficial: Amarilla.'
  }
];

export const JERSEY_COLOR_OPTIONS = [
  { label: 'Azul Marino', hex: '#1E3A8A' },
  { label: 'Azul Claro Histórica', hex: '#38BDF8' },
  { label: 'Roja', hex: '#DC2626' },
  { label: 'Negra', hex: '#0F172A' },
  { label: 'Amarilla', hex: '#FACC15' },
  { label: 'Blanca', hex: '#F8FAFC' }
];

export function getJerseyStyle(colorName = '') {
  const found = JERSEY_COLOR_OPTIONS.find(
    (c) =>
      c.label.toLowerCase() === String(colorName).toLowerCase() ||
      String(colorName).toLowerCase().includes(c.label.toLowerCase())
  );
  return found || { label: colorName || 'Azul Marino', hex: '#1E3A8A' };
}
