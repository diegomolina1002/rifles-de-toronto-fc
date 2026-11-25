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
        .from('gallery')
        .select('*')
        .order('id', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (!requireAdmin(req, res)) return;

    if (req.method === 'POST') {
      const { fields, files } = await parseMultipart(req);
      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'Selecciona al menos una foto para subir.' });
      }
      const {
        title = 'Partido Rifles de Toronto F.C.',
        matchday = '',
        photographer = '@aleextasis'
      } = fields;

      const rowsToInsert = [];
      for (let i = 0; i < files.length; i++) {
        const imageUrl = await uploadToStorage(supabase, files[i], 'gallery');
        rowsToInsert.push({
          title: files.length > 1 ? `${String(title).trim()} (${i + 1})` : String(title).trim(),
          matchday: String(matchday).trim(),
          photographer: String(photographer).trim() || '@aleextasis',
          image_url: imageUrl
        });
      }

      const { data, error } = await supabase.from('gallery').insert(rowsToInsert).select();
      if (error) throw error;
      return res.status(201).json(data || []);
    }

    if (req.method === 'DELETE') {
      if (!id) return res.status(400).json({ error: 'ID de foto requerido.' });
      const { data: existing } = await supabase.from('gallery').select('*').eq('id', id).single();
      if (!existing) return res.status(404).json({ error: 'Foto no encontrada.' });

      await deleteFromStorage(supabase, existing.image_url);
      const { error } = await supabase.from('gallery').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ deleted: true, id });
    }

    return res.status(405).json({ error: 'Método no permitido.' });
  } catch (err) {
    console.error('API /gallery error:', err);
    return res.status(500).json({ error: err.message || 'Error en el servidor.' });
  }
}
