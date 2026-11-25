import crypto from 'node:crypto';

export function createToken() {
  const secret = process.env.TOKEN_SECRET || 'rifles_toronto_fc_2026_secret_key';
  const payload = Buffer.from(
    JSON.stringify({ role: 'admin', exp: Date.now() + 1000 * 60 * 60 * 24 * 7 })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyToken(token) {
  const secret = process.env.TOKEN_SECRET || 'rifles_toronto_fc_2026_secret_key';
  if (!token || typeof token !== 'string' || !token.includes('.')) return false;
  const [payload, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return false;
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return decoded.role === 'admin' && decoded.exp > Date.now();
  } catch {
    return false;
  }
}

export function requireAdmin(req, res) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!verifyToken(token)) {
    res.status(401).json({ error: 'No autorizado. Inicia sesión en el panel admin.' });
    return false;
  }
  return true;
}

export function getResourceId(req) {
  if (req.query?.id) return Number(req.query.id);
  const cleanUrl = (req.url || '').split('?')[0];
  const segments = cleanUrl.split('/').filter(Boolean);
  const last = segments[segments.length - 1];
  const parsed = Number(last);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}
