import trendBannerFallback from '../assets/BANNER BIO Plano Escala2.png';
import { useBanner, type BannerConfig } from './useBanner';

export type TrendBannerConfig = BannerConfig;

const FALLBACK_CONFIG: TrendBannerConfig = {
  imageUrl: trendBannerFallback,
  link: 'https://chat.whatsapp.com/GgiaeKuxGMB5uSZakNWG2y',
};

export const TREND_BANNER_CONFIG_PATH = '/trend-banner.json';

export function useTrendBanner() {
  return useBanner(TREND_BANNER_CONFIG_PATH, FALLBACK_CONFIG);
}
