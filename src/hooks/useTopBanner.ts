import topBannerFallback from '../assets/Live.png';
import { useBanner } from './useBanner';

const FALLBACK_CONFIG = {
  imageUrl: topBannerFallback,
  link: 'https://www.xingyu.com.br/collections/brilho-e-sucesso',
};

export function useTopBanner() {
  return useBanner('/api/top-banner', FALLBACK_CONFIG);
}
