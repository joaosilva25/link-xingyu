import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { BANNER_STORAGE, type BannerId } from '../lib/bannerTypes.js';
import { getBannerImagePath, readBannerConfig, saveBanner } from '../lib/bannerStore.js';
import { checkAdminPassword } from '../lib/trendBannerAuth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT, 'dist');
const PORT = Number(process.env.PORT) || 3001;
const isProd = process.env.NODE_ENV === 'production';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
      return;
    }

    cb(new Error('Formato de imagem não suportado. Use PNG, JPG ou WEBP.'));
  },
});

const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/trend-banner/auth', (req, res) => {
  const auth = checkAdminPassword(req.get('x-admin-password'));
  if (!auth.ok) {
    res.status(auth.status).json({ error: auth.error });
    return;
  }

  res.json({ ok: true });
});

function registerBannerRoutes(id: BannerId) {
  const { slug } = BANNER_STORAGE[id];
  const apiPath = `/api/${slug}`;

  app.get(apiPath, async (_req, res) => {
    try {
      const config = await readBannerConfig(id);
      res.json(config);
    } catch {
      res.status(500).json({ error: 'Não foi possível carregar a configuração.' });
    }
  });

  app.put(apiPath, upload.single('image'), async (req, res) => {
    const auth = checkAdminPassword(req.get('x-admin-password'));
    if (!auth.ok) {
      res.status(auth.status).json({ error: auth.error });
      return;
    }

    const link = typeof req.body.link === 'string' ? req.body.link.trim() : '';
    if (!/^https?:\/\//.test(link)) {
      res.status(400).json({ error: 'Informe um link válido (http ou https).' });
      return;
    }

    try {
      const config = await saveBanner(
        id,
        link,
        req.file ? { buffer: req.file.buffer, mimeType: req.file.mimetype } : undefined,
      );
      res.json(config);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao salvar o banner.';
      res.status(500).json({ error: message });
    }
  });

  app.get(`/${slug}.json`, async (_req, res) => {
    try {
      const config = await readBannerConfig(id);
      res.setHeader('Cache-Control', 'no-store');
      res.json(config);
    } catch {
      res.status(500).json({ error: 'Não foi possível carregar a configuração.' });
    }
  });

  app.get(`/${slug}.png`, (_req, res) => {
    res.sendFile(getBannerImagePath(id), (error) => {
      if (error) {
        res.status(404).end();
      }
    });
  });
}

registerBannerRoutes('top');
registerBannerRoutes('trend');

app.use((error: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({ error: 'Imagem muito grande. Máximo: 5MB.' });
    return;
  }

  if (error instanceof Error) {
    res.status(400).json({ error: error.message });
    return;
  }

  next(error);
});

if (isProd) {
  app.use(express.static(DIST_DIR));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
  if (!process.env.TREND_BANNER_ADMIN_PASSWORD) {
    console.warn('Aviso: defina TREND_BANNER_ADMIN_PASSWORD para habilitar o painel admin.');
  }
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    console.log('Armazenamento dos banners: Vercel Blob');
  } else {
    console.log('Armazenamento dos banners: filesystem (public/)');
  }
  if (isProd) {
    console.log(`Site em produção servido a partir de ${DIST_DIR}`);
  }
});
