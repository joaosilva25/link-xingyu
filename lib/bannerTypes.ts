export interface BannerConfig {
  imageUrl: string;
  link: string;
  version: string;
}

export type BannerId = 'trend' | 'top';

export const BANNER_DEFAULTS: Record<BannerId, BannerConfig> = {
  trend: {
    imageUrl: '/trend-banner.png',
    link: 'https://chat.whatsapp.com/GgiaeKuxGMB5uSZakNWG2y',
    version: '1',
  },
  top: {
    imageUrl: '/top-banner.png',
    link: 'https://www.xingyu.com.br',
    version: '1',
  },
};

export const BANNER_STORAGE: Record<
  BannerId,
  {
    slug: string;
    publicConfigFile: string;
    publicImageFile: string;
    blobConfigPath: string;
    blobImagePath: string;
  }
> = {
  trend: {
    slug: 'trend-banner',
    publicConfigFile: 'trend-banner.json',
    publicImageFile: 'trend-banner.png',
    blobConfigPath: 'trend-banner/config.json',
    blobImagePath: 'trend-banner/image',
  },
  top: {
    slug: 'top-banner',
    publicConfigFile: 'top-banner.json',
    publicImageFile: 'top-banner.png',
    blobConfigPath: 'top-banner/config.json',
    blobImagePath: 'top-banner/image',
  },
};
