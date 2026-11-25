import { getResourceId, requireAdmin } from './_lib/auth.js';
import { parseJsonBody } from './_lib/multipart.js';
import { getSupabaseAdmin } from './_lib/supabase.js';

export default async function handler(req, res) {
  try {
    const supabase = getSupabaseAdmin();
    const id = getResourceId(req);

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('is_upcoming', { ascending: false })
        .order('date', { ascending: false })
        .order('id', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (!requireAdmin(req, res)) return;

    if (req.method === 'POST') {
      const body = await parseJsonBody(req);
      const {
        opponent,
        league,
        date,
        time = '20:00',
        venue = '',
        jersey_color = 'Azul Marino',
        is_upcoming = true,
        score_home = null,
        score_away = null,
        status = 'Programado',
        notes = ''
      } = body;

      if (!opponent || !league || !date) {
        return res.status(400).json({ error: 'Rival, torneo y fecha son obligatorios.' });
      }

      const upcomingBool = Boolean(Number(is_upcoming) || is_upcoming === true);
      if (upcomingBool) {
        await supabase.from('matches').update({ is_upcoming: false }).eq('is_upcoming', true);
      }

      const { data, error } = await supabase
        .from('matches')
        .insert({
          opponent: String(opponent).trim(),
          league: String(league).trim(),
          date: String(date).trim(),
          time: String(time).trim(),
          venue: String(venue).trim(),
          jersey_color: String(jersey_color).trim(),
          is_upcoming: upcomingBool,
          score_home: score_home === '' || score_home === null ? null : Number(score_home),
          score_away: score_away === '' || score_away === null ? null : Number(score_away),
          status: String(status).trim(),
          notes: String(notes).trim()
        })
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      if (!id) return res.status(400).json({ error: 'ID de partido requerido.' });
      const { data: existing } = await supabase.from('matches').select('*').eq('id', id).single();
      if (!existing) return res.status(404).json({ error: 'Partido no encontrado.' });

      const body = await parseJsonBody(req);
      const upcomingBool =
        body.is_upcoming !== undefined
          ? Boolean(Number(body.is_upcoming) || body.is_upcoming === true)
          : existing.is_upcoming;

      if (upcomingBool && !existing.is_upcoming) {
        await supabase.from('matches').update({ is_upcoming: false }).eq('is_upcoming', true);
      }

      const scoreHome =
        body.score_home === undefined
          ? existing.score_home
          : body.score_home === '' || body.score_home === null
            ? null
            : Number(body.score_home);
      const scoreAway =
        body.score_away === undefined
          ? existing.score_away
          : body.score_away === '' || body.score_away === null
            ? null
            : Number(body.score_away);

      const { data, error } = await supabase
        .from('matches')
        .update({
          opponent: String(body.opponent ?? existing.opponent).trim(),
          league: String(body.league ?? existing.league).trim(),
          date: String(body.date ?? existing.date).trim(),
          time: String(body.time ?? existing.time).trim(),
          venue: String(body.venue ?? existing.venue).trim(),
          jersey_color: String(body.jersey_color ?? existing.jersey_color).trim(),
          is_upcoming: upcomingBool,
          score_home: scoreHome,
          score_away: scoreAway,
          status: String(body.status ?? existing.status).trim(),
          notes: String(body.notes ?? existing.notes).trim()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      if (!id) return res.status(400).json({ error: 'ID de partido requerido.' });
      const { error } = await supabase.from('matches').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ deleted: true, id });
    }

    return res.status(405).json({ error: 'Método no permitido.' });
  } catch (err) {
    console.error('API /matches error:', err);
    return res.status(500).json({ error: err.message || 'Error en el servidor.' });
  }
}
