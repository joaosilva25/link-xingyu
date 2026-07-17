import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readBannerConfig, saveBanner } from '../lib/bannerStore.js';
import { parseMultipart } from '../lib/parseMultipart.js';
import { checkAdminPassword } from '../lib/trendBannerAuth.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const bannerConfig = await readBannerConfig('top');
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json(bannerConfig);
    } catch {
      return res.status(500).json({ error: 'Não foi possível carregar a configuração.' });
    }
  }

  if (req.method === 'PUT') {
    const auth = checkAdminPassword(req.headers['x-admin-password'] as string | undefined);
    if (!auth.ok) {
      return res.status(auth.status).json({ error: auth.error });
    }

    try {
      const { fields, file } = await parseMultipart(req);
      const link = fields.link?.trim() ?? '';

      if (!/^https?:\/\//.test(link)) {
        return res.status(400).json({ error: 'Informe um link válido (http ou https).' });
      }

      const bannerConfig = await saveBanner(
        'top',
        link,
        file ? { buffer: file.buffer, mimeType: file.mimeType } : undefined,
      );

      return res.status(200).json(bannerConfig);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao salvar o banner.';
      return res.status(500).json({ error: message });
    }
  }

  res.setHeader('Allow', 'GET, PUT');
  return res.status(405).json({ error: 'Método não permitido.' });
}
