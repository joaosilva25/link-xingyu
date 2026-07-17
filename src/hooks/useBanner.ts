import { useEffect, useState } from 'react';

export interface BannerConfig {
  imageUrl: string;
  link: string;
  version?: string;
}

function withCacheBust(imageUrl: string, version?: string) {
  if (!version) return imageUrl;

  const separator = imageUrl.includes('?') ? '&' : '?';
  return `${imageUrl}${separator}v=${encodeURIComponent(version)}`;
}

function isValidImageUrl(imageUrl: string) {
  return (
    imageUrl.startsWith('/') ||
    imageUrl.startsWith('http://') ||
    imageUrl.startsWith('https://')
  );
}

function isValidConfig(data: unknown): data is BannerConfig {
  if (!data || typeof data !== 'object') return false;

  const { imageUrl, link } = data as BannerConfig;
  const trimmedImageUrl = imageUrl?.trim() ?? '';
  const trimmedLink = link?.trim() ?? '';

  return (
    typeof imageUrl === 'string' &&
    trimmedImageUrl.length > 0 &&
    isValidImageUrl(trimmedImageUrl) &&
    typeof link === 'string' &&
    /^https?:\/\//.test(trimmedLink)
  );
}

function normalizeConfig(config: BannerConfig): BannerConfig {
  return {
    imageUrl: withCacheBust(config.imageUrl.trim(), config.version),
    link: config.link.trim(),
    version: config.version,
  };
}

export function useBanner(configPath: string, fallback: BannerConfig) {
  const [config, setConfig] = useState<BannerConfig | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${configPath}?t=${Date.now()}`, {
      signal: controller.signal,
      cache: 'no-store',
    })
      .then((response) => {
        if (!response.ok) throw new Error('Config not found');
        return response.json();
      })
      .then((data) => {
        if (isValidConfig(data)) {
          setConfig(normalizeConfig(data));
          return;
        }

        setConfig(normalizeConfig(fallback));
      })
      .catch(() => {
        setConfig(normalizeConfig(fallback));
      });

    return () => controller.abort();
  }, [configPath, fallback]);

  return {
    config,
    isLoading: config === null,
  };
}
