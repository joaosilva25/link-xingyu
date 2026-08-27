import Card from './Card';
// import bannerOrigem from '../assets/Banner Origem.png';
import bannerGoldenSeason from '../assets/BannerGoldenSeason.png';
import bannerEstoque from '../assets/EstoquesemCrise.png';
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
        {/* <Card
          imageSrc={bannerOrigem}
          link="https://www.xingyu.com.br/collections/origem?filter.v.availability=1&filter.v.price.gte=&filter.v.price.lte=&sort_by=created-descending&utm_source=BANNERBIO&utm_medium=COLECAO07&utm_campaign=INSTAGRAM&utm_id=CHINANOBRASIL"
        /> */}
         <Card
          imageSrc={bannerGoldenSeason}
          link="https://www.xingyu.com.br/collections/colecao-golden-season-27-08-2026?utm_source=BANNER&utm_medium=BIOINSTA&utm_campaign=OATS&utm_id=LANCAMENTO08 "
        />
         <Card
          imageSrc={bannerEstoque}
          link="http://estoquesemcrise.xingyujewelry.com.br/?utm_source=INSTAGRAM&utm_medium=BANNERBIO&utm_campaign=ESC&utm_id=PAGCAPTURA"
        />
        <Card imageSrc={banner2} link="https://www.xingyu.com.br" />
        <Card imageSrc={banner5} link="https://vip.xingyujewelry.com.br/" />
        <Card imageSrc={banner10} link="https://wa.me/+5511925694819" />
      </div>
    </section>
  );
}
