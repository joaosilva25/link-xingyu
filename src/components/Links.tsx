import Card from './Card';
import bannerTrend from '../assets/BANNER CHINANOBRASIL.png';
import bannerAltaTemporada from '../assets/BANNER ALTATEMPORADA.png';
import bannerTop from '../assets/Live.png';
import banner2 from '../assets/BANNER 02.png';
import banner5 from '../assets/BANNER 05.png';
import banner10 from '../assets/BANNER 10.png';

export default function Links() {
  return (
    <section id="links" className="bg-white">
      <div className="max-w-6xl mx-auto gap-12 flex flex-col pb-4 md:pb-24 pt-0 md:pt-14 px-2">
        <Card
          imageSrc={bannerTop}
          link="https://www.xingyu.com.br/collections/brilho-e-sucesso"
        />
        <Card
          imageSrc={bannerTrend}
          link="https://chinanobrasil.xingyujewelry.com.br/?utm_source=BIOINSTA&utm_medium=PAGCAPTURA&utm_campaign=CHINANOBRASIL&utm_id=LANCAMENTO"
        />
        <Card
          imageSrc={bannerAltaTemporada}
          link="https://oat.xingyujewelry.com.br/?utm_source=BANNER&utm_medium=BIOINSTA&utm_campaign=OATS&utm_id=PAGCAPTURA"
        />
        <Card imageSrc={banner2} link="https://www.xingyu.com.br" />
        <Card imageSrc={banner5} link="https://vip.xingyujewelry.com.br/" />
        <Card imageSrc={banner10} link="https://wa.me/+5511925694819" />
      </div>
    </section>
  );
}
