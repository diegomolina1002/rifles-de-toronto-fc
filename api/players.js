import { getResourceId, requireAdmin } from './_lib/auth.js';
import { parseMultipart } from './_lib/multipart.js';
import { deleteFromStorage, getSupabaseAdmin, uploadToStorage } from './_lib/supabase.js';

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  try {
    const supabase = getSupabaseAdmin();
    const id = getResourceId(req);

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('number', { ascending: true })
        .order('id', { ascending: true });
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (!requireAdmin(req, res)) return;

    if (req.method === 'POST') {
      const { fields, files } = await parseMultipart(req);
      const { name, nickname = '', number, position, goals = 0, matches = 0 } = fields;
      if (!name || !number || !position) {
        return res.status(400).json({ error: 'Nombre, dorsal y posición son obligatorios.' });
      }
      const photoFile = files.find((f) => f.fieldname === 'photo') || files[0];
      const photoUrl = photoFile ? await uploadToStorage(supabase, photoFile, 'players') : '';

      const { data, error } = await supabase
        .from('players')
        .insert({
          name: String(name).trim(),
          nickname: String(nickname).trim(),
          number: Number(number),
          position: String(position).trim(),
          goals: Number(goals) || 0,
          matches: Number(matches) || 0,
          photo_url: photoUrl
        })
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      if (!id) return res.status(400).json({ error: 'ID de jugador requerido.' });
      const { data: existing, error: fetchErr } = await supabase
        .from('players')
        .select('*')
        .eq('id', id)
        .single();
      if (fetchErr || !existing) return res.status(404).json({ error: 'Jugador no encontrado.' });

      const { fields, files } = await parseMultipart(req);
      const photoFile = files.find((f) => f.fieldname === 'photo') || files[0];
      let photoUrl = existing.photo_url;

      if (photoFile) {
        await deleteFromStorage(supabase, existing.photo_url);
        photoUrl = await uploadToStorage(supabase, photoFile, 'players');
      } else if (fields.clearPhoto === 'true') {
        await deleteFromStorage(supabase, existing.photo_url);
        photoUrl = '';
      }

      const { data, error } = await supabase
        .from('players')
        .update({
          name: String(fields.name ?? existing.name).trim(),
          nickname: String(fields.nickname ?? existing.nickname).trim(),
          number: Number(fields.number ?? existing.number),
          position: String(fields.position ?? existing.position).trim(),
          goals: Number(fields.goals ?? existing.goals) || 0,
          matches: Number(fields.matches ?? existing.matches) || 0,
          photo_url: photoUrl
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      if (!id) return res.status(400).json({ error: 'ID de jugador requerido.' });
      const { data: existing } = await supabase.from('players').select('*').eq('id', id).single();
      if (!existing) return res.status(404).json({ error: 'Jugador no encontrado.' });

      await deleteFromStorage(supabase, existing.photo_url);
      const { error } = await supabase.from('players').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ deleted: true, id });
    }

    return res.status(405).json({ error: 'Método no permitido.' });
  } catch (err) {
    console.error('API /players error:', err);
    return res.status(500).json({ error: err.message || 'Error en el servidor.' });
  }
}
