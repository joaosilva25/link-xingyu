import topBannerFallback from '../assets/BANNERPRINCIPAL.png';
import { useBanner } from './useBanner';

const FALLBACK_CONFIG = {
  imageUrl: topBannerFallback,
  link: 'https://www.xingyu.com.br',
};

export function useTopBanner() {
  return useBanner('/api/top-banner', FALLBACK_CONFIG);
}
