import { useState } from 'react';
import { Play } from 'lucide-react';

const YOUTUBE_VIDEO_ID = 'zfKmNTc4T44';
const COLLECTION_URL =
  'https://www.xingyu.com.br/collections/as-mais-vendidas?sort_by=created-descending&utm_source=PAGINADEVIDEO&utm_medium=BOTAO&utm_campaign=PLANOESCALA&utm_id=LANCAMENTO';

export default function VideoPage() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-10 sm:px-6 sm:py-16">
      <img
        src="/background3.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
        style={{ filter: 'grayscale(100%) contrast(1.1)', opacity: 0.45 }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_65%_at_50%_50%,rgba(0,0,0,0.75)_0%,rgba(0,0,0,0.4)_55%,rgba(0,0,0,0.1)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center text-center">
        <div className="relative w-full max-w-4xl">
          <div className="relative aspect-[4/3] overflow-hidden border border-white/10 sm:aspect-video">
            {isPlaying ? (
              <iframe
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&rel=0`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsPlaying(true)}
                aria-label="Reproduzir vídeo"
                className="group absolute inset-0 flex cursor-pointer items-center justify-center transition-colors"
              >
                <img
                  src={`https://img.youtube.com/vi/${YOUTUBE_VIDEO_ID}/maxresdefault.jpg`}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 h-full w-full object-cover opacity-70 transition-opacity group-hover:opacity-85"
                />
                <div className="relative z-10">
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white transition-colors group-hover:bg-black/80 sm:h-20 sm:w-20">
                    <Play
                      className="ml-1 h-7 w-7 fill-white sm:h-8 sm:w-8"
                      strokeWidth={0}
                      aria-hidden
                    />
                  </span>
                </div>
              </button>
            )}
          </div>

          <div className="mt-8 flex w-full justify-center">
            <a
              href={COLLECTION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full max-w-[22rem] cursor-pointer items-center justify-center whitespace-nowrap bg-[#ff4500] px-8 py-4 text-sm font-bold uppercase text-white sm:w-1/2 sm:max-w-md sm:px-12 sm:py-5 sm:text-base"
            >
              Acessar coleção agora
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
