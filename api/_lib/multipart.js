import Busboy from 'busboy';

export function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      return resolve({ fields: req.body || {}, files: [] });
    }

    const busboy = Busboy({
      headers: req.headers,
      limits: { fileSize: 10 * 1024 * 1024, files: 20 }
    });

    const fields = {};
    const files = [];

    busboy.on('field', (name, val) => {
      fields[name] = val;
    });

    busboy.on('file', (fieldname, fileStream, info) => {
      const { filename, mimeType } = info;
      if (!mimeType || !mimeType.startsWith('image/')) {
        fileStream.resume();
        return;
      }
      const chunks = [];
      fileStream.on('data', (chunk) => chunks.push(chunk));
      fileStream.on('end', () => {
        if (chunks.length > 0) {
          files.push({
            fieldname,
            filename: filename || 'upload.jpg',
            mimeType,
            buffer: Buffer.concat(chunks)
          });
        }
      });
    });

    busboy.on('finish', () => resolve({ fields, files }));
    busboy.on('error', reject);
    req.pipe(busboy);
  });
}

export async function parseJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}
