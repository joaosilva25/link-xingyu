import Card from './Card';
import banner1 from '../assets/BANNER 12.png';
import banner2 from '../assets/BANNER 02.png';
import banner3 from '../assets/BANNER 03.png';
import banner4 from '../assets/BANNER 04.png';
import banner5 from '../assets/BANNER 05.png';
import banner6 from '../assets/BANNER 06.png';
import banner7 from '../assets/BANNER 07.png';
import banner10 from '../assets/BANNER 10.png';

export default function Links() {
  return (
    <section id="links" className="bg-white">
      <div className="max-w-6xl mx-auto gap-12 flex flex-col pb-4 md:pb-24 pt-0 md:pt-14 px-2">
        
        <Card imageSrc={banner1} link="https://chat.whatsapp.com/GgiaeKuxGMB5uSZakNWG2y" />
        <Card imageSrc={banner2} link="https://www.xingyu.com.br/" />
        <Card imageSrc={banner3} link="https://www.xingyu.com.br/collections/rivieiras" />
        <Card imageSrc={banner4} link="https://chat.whatsapp.com/IvudTWrc6Uz09OBCZR1SGT" />
        <Card imageSrc={banner5} link="https://chat.whatsapp.com/FzQcBGHEokbHFCfEjjWNJE" />
        <Card imageSrc={banner6} link="https://www.xingyu.com.br/collections/outlet" />
        <Card imageSrc={banner7} link="https://www.xingyu.com.br/collections/venda-mais" />
        <Card imageSrc={banner10} link="https://wa.me/+5511925694819" />
      </div>
    </section>
  );
}
