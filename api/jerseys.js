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
        .from('jerseys')
        .select('*')
        .order('id', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (!requireAdmin(req, res)) return;

    if (req.method === 'POST') {
      const { fields, files } = await parseMultipart(req);
      const { name, edition = '', league, color_hex = '#1E3A8A', description = '' } = fields;
      if (!name || !league) {
        return res.status(400).json({ error: 'Nombre de la playera y liga son obligatorios.' });
      }
      const imageFile = files.find((f) => f.fieldname === 'image') || files[0];
      if (!imageFile) {
        return res.status(400).json({ error: 'Sube una fotografía real de la playera.' });
      }

      const imageUrl = await uploadToStorage(supabase, imageFile, 'jerseys');
      const { data, error } = await supabase
        .from('jerseys')
        .insert({
          name: String(name).trim(),
          edition: String(edition).trim(),
          league: String(league).trim(),
          color_hex: String(color_hex).trim() || '#1E3A8A',
          description: String(description).trim(),
          image_url: imageUrl
        })
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      if (!id) return res.status(400).json({ error: 'ID de playera requerido.' });
      const { data: existing } = await supabase.from('jerseys').select('*').eq('id', id).single();
      if (!existing) return res.status(404).json({ error: 'Playera no encontrada.' });

      const { fields, files } = await parseMultipart(req);
      const imageFile = files.find((f) => f.fieldname === 'image') || files[0];
      let imageUrl = existing.image_url;

      if (imageFile) {
        await deleteFromStorage(supabase, existing.image_url);
        imageUrl = await uploadToStorage(supabase, imageFile, 'jerseys');
      }

      const { data, error } = await supabase
        .from('jerseys')
        .update({
          name: String(fields.name ?? existing.name).trim(),
          edition: String(fields.edition ?? existing.edition).trim(),
          league: String(fields.league ?? existing.league).trim(),
          color_hex: String(fields.color_hex ?? existing.color_hex).trim() || '#1E3A8A',
          description: String(fields.description ?? existing.description).trim(),
          image_url: imageUrl
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      if (!id) return res.status(400).json({ error: 'ID de playera requerido.' });
      const { data: existing } = await supabase.from('jerseys').select('*').eq('id', id).single();
      if (!existing) return res.status(404).json({ error: 'Playera no encontrada.' });

      await deleteFromStorage(supabase, existing.image_url);
      const { error } = await supabase.from('jerseys').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ deleted: true, id });
    }

    return res.status(405).json({ error: 'Método no permitido.' });
  } catch (err) {
    console.error('API /jerseys error:', err);
    return res.status(500).json({ error: err.message || 'Error en el servidor.' });
  }
}
