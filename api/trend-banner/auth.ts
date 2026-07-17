import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkAdminPassword } from '../../lib/trendBannerAuth.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const auth = checkAdminPassword(req.headers['x-admin-password'] as string | undefined);
  if (!auth.ok) {
    return res.status(auth.status).json({ error: auth.error });
  }

  return res.status(200).json({ ok: true });
}
