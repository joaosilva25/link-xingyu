import { useEffect } from 'react';
import Card from './Card';
// import bannerOrigem from '../assets/Banner Origem.png';
import bannerEstoque from '../assets/EstoquesemCrise.png';
import bannerTop from '../assets/Live.png';
import bannerLancamento from '../assets/BANNERSEMIJOIASIMPORTADAS.png';
import banner2 from '../assets/BANNER 02.png';
import banner5 from '../assets/BANNER 05.png';
import banner10 from '../assets/BANNER 10.png';

// Mesma origem via proxy — o domínio das consultoras usa CORP same-origin
const CONSULTORA_SCRIPT_SRC = '/xingyu-consultoras/embed/xingyu-popup.js';
const CONSULTORA_API_URL = '/xingyu-consultoras';
const CONSULTORA_TRIGGER_ID = 'falar-com-consultora';

export default function Links() {
  useEffect(() => {
    if (document.querySelector(`script[src="${CONSULTORA_SCRIPT_SRC}"]`)) return;

    const script = document.createElement('script');
    script.src = CONSULTORA_SCRIPT_SRC;
    script.dataset.trigger = `#${CONSULTORA_TRIGGER_ID}`;
    script.dataset.apiUrl = CONSULTORA_API_URL;
    document.body.appendChild(script);
  }, []);

  return (
    <section id="links" className="bg-white">
      <div className="max-w-6xl mx-auto gap-12 flex flex-col pb-4 md:pb-24 pt-0 md:pt-14 px-2">
        <Card
          imageSrc={bannerTop}
          link="https://www.xingyu.com.br/collections/brilho-e-sucesso"
        />
        <Card
          imageSrc={bannerLancamento}
          link="http://si.xingyujewelry.com.br/?utm_source=BANNERBIO&utm_medium=PAGCAPTURA&utm_campaign=10SI&utm_id=LANCAMENTO"
        />
        {/* <Card
          imageSrc={bannerOrigem}
          link="https://www.xingyu.com.br/collections/origem?filter.v.availability=1&filter.v.price.gte=&filter.v.price.lte=&sort_by=created-descending&utm_source=BANNERBIO&utm_medium=COLECAO07&utm_campaign=INSTAGRAM&utm_id=CHINANOBRASIL"
        /> */}
        <Card
          imageSrc={bannerEstoque}
          link="http://estoquesemcrise.xingyujewelry.com.br/?utm_source=INSTAGRAM&utm_medium=BANNERBIO&utm_campaign=ESC&utm_id=PAGCAPTURA"
        />
        <Card imageSrc={banner2} link="https://www.xingyu.com.br" />
        <Card imageSrc={banner5} link="https://vip.xingyujewelry.com.br/" />
        <Card imageSrc={banner10} id={CONSULTORA_TRIGGER_ID} />
      </div>
    </section>
  );
}
