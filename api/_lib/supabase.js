import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';
import path from 'node:path';

export const STORAGE_BUCKET = 'club-media';

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      'Faltan variables de entorno de Supabase (VITE_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY).'
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

export async function uploadToStorage(supabase, file, folder = 'general') {
  if (!file || !file.buffer) return '';
  const ext = path.extname(file.filename || '.jpg').toLowerCase() || '.jpg';
  const safeBase =
    path
      .basename(file.filename || 'img', ext)
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .slice(0, 32) || 'media';
  const objectPath = `${folder}/${safeBase}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(objectPath, file.buffer, {
      contentType: file.mimeType || 'image/jpeg',
      upsert: false
    });

  if (error) {
    throw new Error(`Error subiendo imagen a Supabase Storage: ${error.message}`);
  }

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(objectPath);
  return data.publicUrl;
}

export async function deleteFromStorage(supabase, publicUrl) {
  if (!publicUrl || !publicUrl.includes(`/storage/v1/object/public/${STORAGE_BUCKET}/`)) return;
  const parts = publicUrl.split(`/storage/v1/object/public/${STORAGE_BUCKET}/`);
  const objectPath = parts[1];
  if (!objectPath) return;
  await supabase.storage.from(STORAGE_BUCKET).remove([decodeURIComponent(objectPath)]);
}
