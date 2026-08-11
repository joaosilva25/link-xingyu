import Card from './Card';
import banner2 from '../assets/BANNER 02.png';
import banner3 from '../assets/BANNER 03.png';
import banner4 from '../assets/BANNER 04.png';
import banner5 from '../assets/BANNER 05.png';
import banner6 from '../assets/BANNER 06.png';
import banner7 from '../assets/BANNER 07.png';
import banner10 from '../assets/BANNER 10.png';
import { useTopBanner } from '../hooks/useTopBanner';
import { useTrendBanner } from '../hooks/useTrendBanner';

function BannerSkeleton() {
  return (
    <div
      aria-hidden
      className="w-full h-[210px] md:h-[400px] rounded-3xl border-4 border-orange-200 bg-orange-50 animate-pulse"
    />
  );
}

export default function Links() {
  const { config: topBanner, isLoading: isTopLoading } = useTopBanner();
  const { config: trendBanner, isLoading: isTrendLoading } = useTrendBanner();

  return (
    <section id="links" className="bg-white">
      <div className="max-w-6xl mx-auto gap-12 flex flex-col pb-4 md:pb-24 pt-0 md:pt-14 px-2">
        {isTopLoading || !topBanner ? (
          <BannerSkeleton />
        ) : (
          <Card imageSrc={topBanner.imageUrl} link={topBanner.link} />
        )}
        {isTrendLoading || !trendBanner ? (
          <BannerSkeleton />
        ) : (
          <Card imageSrc={trendBanner.imageUrl} link={trendBanner.link} />
        )}
        <Card imageSrc={banner2} link="https://www.xingyu.com.br" />
        <Card imageSrc={banner5} link="https://vip.xingyujewelry.com.br/" />
        <Card imageSrc={banner10} link="https://wa.me/+5511925694819" />
      </div>
    </section>
  );
}
