import { useEffect } from 'react';
import Card from './Card';
import bannerBlackFriday from '../assets/BANNER BIO BlackFriday.png';
import bannerLancamento from '../assets/BANNER BIO - Lunar.png';
import banner2 from '../assets/BANNER 02.png';
import banner5 from '../assets/BANNER 05.png';
import banner10 from '../assets/BANNER 10.png';

// Mesma origem via proxy — o domínio das consultoras usa CORP same-origin
const CONSULTORA_SCRIPT_SRC = '/xingyu-consultoras/embed/xingyu-popup.js';
const CONSULTORA_API_URL = '/xingyu-consultoras';
const CONSULTORA_TRIGGER_ID = 'falar-com-consultora';

export default function Links() {
  useEffect(() => {
    const STYLE_ID = 'xingyu-consultant-popup-center';
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement('style');
      style.id = STYLE_ID;
      // Força centro mesmo com o CSS do embed (mobile usa align-items:end)
      style.textContent = `
        .xingyu-consultant-popup {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          place-items: center !important;
        }
        .xingyu-consultant-popup__dialog {
          position: fixed !important;
          top: 50% !important;
          left: 50% !important;
          right: auto !important;
          bottom: auto !important;
          width: min(calc(100vw - 24px), 28rem) !important;
          max-height: calc(100dvh - 24px) !important;
          margin: 0 !important;
          transform: translate(-50%, -50%) !important;
        }
        .xingyu-consultant-popup.is-open .xingyu-consultant-popup__dialog {
          transform: translate(-50%, -50%) !important;
        }
      `;
      document.head.appendChild(style);
    }

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
        {/* <Card
          imageSrc={bannerOrigem}
          link="https://www.xingyu.com.br/collections/origem?filter.v.availability=1&filter.v.price.gte=&filter.v.price.lte=&sort_by=created-descending&utm_source=BANNERBIO&utm_medium=COLECAO07&utm_campaign=INSTAGRAM&utm_id=CHINANOBRASIL"
        /> */}
        <Card
          imageSrc={bannerLancamento}
          link="https://www.xingyu.com.br/collections/colecao-lunar?utm_source=BANNER&utm_medium=INSTABIO&utm_campaign=10SI&utm_id=COLECAOLUNAR"
        />
           <Card
          imageSrc={bannerBlackFriday}
          link="http://ab.xingyujewelry.com.br/?utm_source=BANNERINSTA&utm_medium=BIOCAPTURA&utm_campaign=11AB&utm_id=LANCAMENTO"
        />
        <Card imageSrc={banner2} link="https://www.xingyu.com.br" />
        <Card imageSrc={banner5} link="https://vip.xingyujewelry.com.br/" />
        <Card imageSrc={banner10} id={CONSULTORA_TRIGGER_ID} />
      </div>
    </section>
  );
}
