export interface BannerConfig {
  imageUrl: string;
  link: string;
  version: string;
}

export type BannerId = 'trend' | 'top';

export const BANNER_DEFAULTS: Record<BannerId, BannerConfig> = {
  trend: {
    imageUrl: '/trend-banner.png',
    link: 'https://chinanobrasil.xingyujewelry.com.br/?utm_source=BIOINSTA&utm_medium=PAGCAPTURA&utm_campaign=CHINANOBRASIL&utm_id=LANCAMENTO',
    version: '1',
  },
  top: {
    imageUrl: '/top-banner.png',
    link: 'https://www.xingyu.com.br/collections/07-2026-colecao-primavera-dourada',
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
