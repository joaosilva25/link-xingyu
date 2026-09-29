'use client';

import { useEffect } from 'react';
import Card from './Card';
import type { Banner } from '@/types/banner';
import bannerBlackFriday from '../assets/BANNER BIO BlackFriday.png';
import bannerLancamento from '../assets/BANNER BIO - Lunar.png';
import banner2 from '../assets/BANNER 02.png';
import banner5 from '../assets/BANNER 05.png';
import banner10 from '../assets/BANNER 10.png';

function assetSrc(asset: string | { src: string }) {
  return typeof asset === 'string' ? asset : asset.src;
}

// Mesma origem via proxy — o domínio das consultoras usa CORP same-origin
const CONSULTORA_SCRIPT_SRC = '/xingyu-consultoras/embed/xingyu-popup.js';
const CONSULTORA_API_URL = '/xingyu-consultoras';
const CONSULTORA_TRIGGER_ID = 'falar-com-consultora';

const FALLBACK_BANNERS = [
  {
    imageSrc: assetSrc(bannerLancamento),
    link: 'https://www.xingyu.com.br/collections/colecao-lunar?utm_source=BANNER&utm_medium=INSTABIO&utm_campaign=10SI&utm_id=COLECAOLUNAR',
  },
  {
    imageSrc: assetSrc(bannerBlackFriday),
    link: 'http://ab.xingyujewelry.com.br/?utm_source=BANNERINSTA&utm_medium=BIOCAPTURA&utm_campaign=11AB&utm_id=LANCAMENTO',
  },
  { imageSrc: assetSrc(banner2), link: 'https://www.xingyu.com.br' },
  { imageSrc: assetSrc(banner5), link: 'https://vip.xingyujewelry.com.br/' },
];

export default function Links({ banners }: { banners?: Banner[] }) {
  useEffect(() => {
    const STYLE_ID = 'xingyu-consultant-popup-center';
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement('style');
      style.id = STYLE_ID;
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

  const fromCms = banners !== undefined;

  return (
    <section id="links" className="bg-white">
      <div className="max-w-6xl mx-auto gap-12 flex flex-col pb-4 md:pb-24 pt-0 md:pt-14 px-2">
        {fromCms
          ? banners.map((banner) => (
              <Card
                key={banner.id}
                imageSrc={banner.image_url}
                link={banner.destination_url ? `/r/${banner.id}` : undefined}
                newTab={banner.open_new_tab}
                label={banner.alt_text || banner.internal_name}
              />
            ))
          : FALLBACK_BANNERS.map((banner) => (
              <Card key={banner.link} imageSrc={banner.imageSrc} link={banner.link} />
            ))}
        <Card imageSrc={assetSrc(banner10)} id={CONSULTORA_TRIGGER_ID} />
      </div>
    </section>
  );
}
