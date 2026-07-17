import fs from 'fs/promises';
import path from 'path';
import { list, put } from '@vercel/blob';
import {
  BANNER_DEFAULTS,
  BANNER_STORAGE,
  type BannerConfig,
  type BannerId,
} from './bannerTypes.js';

const ROOT = process.cwd();
export const PUBLIC_DIR = path.join(ROOT, 'public');

const ALLOWED_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

function isBlobStorageEnabled() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function extensionForMime(mimeType: string) {
  if (mimeType === 'image/jpeg') return 'jpg';
  if (mimeType === 'image/webp') return 'webp';
  return 'png';
}

function getPaths(id: BannerId) {
  const storage = BANNER_STORAGE[id];
  return {
    configPath: path.join(PUBLIC_DIR, storage.publicConfigFile),
    imagePath: path.join(PUBLIC_DIR, storage.publicImageFile),
    defaultImageUrl: BANNER_DEFAULTS[id].imageUrl,
    blobConfigPath: storage.blobConfigPath,
    blobImagePath: storage.blobImagePath,
  };
}

function normalizeConfig(id: BannerId, data: Partial<BannerConfig>): BannerConfig {
  const defaults = BANNER_DEFAULTS[id];

  return {
    imageUrl: data.imageUrl?.trim() || defaults.imageUrl,
    link: data.link?.trim() || defaults.link,
    version: String(data.version ?? defaults.version),
  };
}

async function readBannerConfigFromFilesystem(id: BannerId): Promise<BannerConfig> {
  const { configPath } = getPaths(id);

  try {
    const raw = await fs.readFile(configPath, 'utf-8');
    const data = JSON.parse(raw) as Partial<BannerConfig>;
    return normalizeConfig(id, data);
  } catch {
    return { ...BANNER_DEFAULTS[id] };
  }
}

async function readBannerConfigFromBlob(id: BannerId): Promise<BannerConfig | null> {
  const { blobConfigPath } = getPaths(id);
  const { blobs } = await list({ prefix: blobConfigPath, limit: 1 });

  if (blobs.length === 0) {
    return null;
  }

  const response = await fetch(blobs[0].url, { cache: 'no-store' });
  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as Partial<BannerConfig>;
  return normalizeConfig(id, data);
}

async function writeBannerConfigToFilesystem(id: BannerId, link: string, imageUrl: string) {
  const { configPath } = getPaths(id);
  const config: BannerConfig = {
    imageUrl,
    link: link.trim(),
    version: String(Date.now()),
  };

  await fs.mkdir(PUBLIC_DIR, { recursive: true });
  await fs.writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`, 'utf-8');

  return config;
}

async function writeBannerConfigToBlob(id: BannerId, link: string, imageUrl: string) {
  const { blobConfigPath } = getPaths(id);
  const config: BannerConfig = {
    imageUrl,
    link: link.trim(),
    version: String(Date.now()),
  };

  await put(blobConfigPath, JSON.stringify(config), {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json',
  });

  return config;
}

export async function readBannerConfig(id: BannerId): Promise<BannerConfig> {
  if (isBlobStorageEnabled()) {
    const blobConfig = await readBannerConfigFromBlob(id);
    if (blobConfig) {
      return blobConfig;
    }

    return readBannerConfigFromFilesystem(id);
  }

  return readBannerConfigFromFilesystem(id);
}

async function writeBannerImage(id: BannerId, buffer: Buffer, mimeType: string) {
  if (!ALLOWED_IMAGE_TYPES.has(mimeType)) {
    throw new Error('Formato de imagem não suportado. Use PNG, JPG ou WEBP.');
  }

  if (buffer.byteLength > 5 * 1024 * 1024) {
    throw new Error('Imagem muito grande. Máximo: 5MB.');
  }

  const { imagePath, defaultImageUrl, blobImagePath } = getPaths(id);

  if (isBlobStorageEnabled()) {
    const blob = await put(`${blobImagePath}.${extensionForMime(mimeType)}`, buffer, {
      access: 'public',
      addRandomSuffix: false,
      contentType: mimeType,
    });

    return blob.url;
  }

  await fs.mkdir(PUBLIC_DIR, { recursive: true });
  await fs.writeFile(imagePath, buffer);

  return defaultImageUrl;
}

export async function saveBanner(
  id: BannerId,
  link: string,
  image?: { buffer: Buffer; mimeType: string },
) {
  const currentConfig = await readBannerConfig(id);
  let imageUrl = currentConfig.imageUrl;

  if (image) {
    imageUrl = await writeBannerImage(id, image.buffer, image.mimeType);
  }

  if (isBlobStorageEnabled()) {
    return writeBannerConfigToBlob(id, link, imageUrl);
  }

  return writeBannerConfigToFilesystem(id, link, imageUrl);
}

export function getBannerImagePath(id: BannerId) {
  return getPaths(id).imagePath;
}
