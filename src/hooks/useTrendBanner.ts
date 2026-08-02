import trendBannerFallback from '../assets/BANNER CHINANOBRASIL.png';
import { useBanner, type BannerConfig } from './useBanner';

export type TrendBannerConfig = BannerConfig;

const FALLBACK_CONFIG: TrendBannerConfig = {
  imageUrl: trendBannerFallback,
  link: 'https://chinanobrasil.xingyujewelry.com.br/?utm_source=BIOINSTA&utm_medium=PAGCAPTURA&utm_campaign=CHINANOBRASIL&utm_id=LANCAMENTO',
};

export const TREND_BANNER_CONFIG_PATH = '/api/trend-banner';

export function useTrendBanner() {
  return useBanner(TREND_BANNER_CONFIG_PATH, FALLBACK_CONFIG);
}
