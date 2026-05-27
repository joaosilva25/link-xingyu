import { Gem, Mouse, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import logo from '../assets/XY.png';

export default function Hero() {
  const [showScrollHint, setShowScrollHint] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      setShowScrollHint(window.scrollY <= 1);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div className="w-full bg-white border border-orange-200 backdrop-blur-md py-4 overflow-hidden fixed top-0 left-0 right-0 z-50" style={
        { backdropFilter: 'blur(15px)' }
      }>
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-12 px-8">
              <div className="flex items-center gap-4">
                <Gem className="w-5 h-5 text-[#CD853F]" strokeWidth={1.3}/>
                <span className="text-[#CD853F] text-sm font-medium tracking-widest uppercase">Especialista em Semijoias</span>
              </div>
              <div className="flex items-center gap-4">
                <Sparkles className="w-5 h-5 text-[#CD853F]" strokeWidth={1.3}/>
                <span className="text-[#CD853F] text-sm font-medium tracking-widest uppercase">Joias de Fábrica</span>
              </div>
              <div className="flex items-center gap-4">
                <Gem className="w-5 h-5 text-[#CD853F]" strokeWidth={1.3} />
                <span className="text-[#CD853F]  text-sm font-medium tracking-widest uppercase">Qualidade Premium</span>
              </div>
              <div className="flex items-center gap-4">
                <Sparkles className="w-5 h-5 text-[#CD853F]" strokeWidth={1.3} />
                <span className="text-[#CD853F]  text-sm font-medium tracking-widest uppercase">Acabamento Impecável</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className="min-h-[60vh] pt-16 pb-12 bg-white flex items-center justify-center overflow-hidden">

        {/* Content */}
        <div className="flex flex-col items-center text-center px-6 w-full max-w-2xl mx-auto mt-8">

          <img
            src={logo}
            alt="Logo"
            className="w-[70px] mb-6 object-contain"
          />

          <h1 className="text-5xl md:text-7xl text-orange-500 font-regular leading-[1.0] tracking-tight mb-8" style={{ fontFamily: 'Joly Display, sans-serif' }}>
            Referência em <br />Semijoias
          </h1>

          <p className="text-black/70 leading-7 max-w-md">
            Semijoias premium há mais de 20 anos, com acabamento impecável e preços até 5x menores direto da fábrica.
          </p>

          <div
            className={`mt-6 flex justify-center transition-all duration-500 ${
              showScrollHint ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
            }`}
          >
            <button
              type="button"
              aria-label="Rolar para baixo"
              className="h-12 w-12 rounded-full mt-2 border border-orange-300 bg-gradient-to-b from-white via-white to-white/60 shadow-[0_10px_24px_rgba(255,255,255,0.75)] backdrop-blur-sm animate-bounce cursor-default flex items-center justify-center"
            >
              <Mouse className="h-5 w-5 text-orange-400" strokeWidth={1.4} />
            </button>
          </div>

        </div>

      </section>
    </>
  );
}