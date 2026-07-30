import topBannerFallback from '../assets/PrimaveraDourada.jpg';
import { useBanner } from './useBanner';

const FALLBACK_CONFIG = {
  imageUrl: topBannerFallback,
  link: 'https://www.xingyu.com.br/collections/07-2026-colecao-primavera-dourada',
};

export function useTopBanner() {
  return useBanner('/api/top-banner', FALLBACK_CONFIG);
}
