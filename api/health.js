export default function handler(_req, res) {
  res.status(200).json({
    ok: true,
    club: 'Rifles de Toronto F.C.',
    runtime: 'vercel-serverless',
    timestamp: new Date().toISOString()
  });
}
