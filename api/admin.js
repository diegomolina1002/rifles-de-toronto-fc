import { createToken, requireAdmin } from './_lib/auth.js';
import { parseJsonBody } from './_lib/multipart.js';

export default async function handler(req, res) {
  const action =
    req.query?.action ||
    (req.url || '').split('?')[0].split('/').filter(Boolean).pop();

  if (req.method === 'POST' && action === 'login') {
    try {
      const body = await parseJsonBody(req);
      const expectedPassword = process.env.ADMIN_PASSWORD || 'rifles2026';
      if (!body?.password || body.password !== expectedPassword) {
        return res.status(401).json({ error: 'Contraseña incorrecta.' });
      }
      return res.status(200).json({ token: createToken() });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  if (req.method === 'GET' && action === 'verify') {
    if (!requireAdmin(req, res)) return;
    return res.status(200).json({ authenticated: true });
  }

  return res.status(405).json({ error: 'Método o acción no permitida.' });
}
