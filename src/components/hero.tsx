import { Gem, Mouse, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import logo from '../assets/XY.png';
import heroimg from '../assets/BANNERHero2.png';

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

      <section className="relative min-h-[60vh] pt-24 md:pt-0 md:min-h-[80vh] overflow-hidden bg-white">

        <div className="absolute inset-0">
          <img
            src={heroimg}
            alt="Hero"
            className="w-full h-full object-cover object-center hidden md:block"
          />
          <div className="absolute inset-0 bg-black/5 hidden md:block"></div>
        </div>
        {/* Content */}
        <div className="relative z-10 mt-6 px-6 md:px-20 mx-auto md:py-30 w-full grid md:grid-cols-2 gap-12 items-center text-center md:text-left">

          {/* LEFT */}
          <div className="text-white">
            <div className="flex items-center justify-center md:justify-start relative">
              <img
                src={logo}
                alt="Logo"
                className="relative z-10 w-[60px]  mb-6 object-cover"
              />
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl text-orange-500  font-regular leading-[1.0] tracking-tight mb-8" style={{ fontFamily: 'Joly Display, sans-serif' }}>
              Referência em <br></br>Semijoias
            </h1>

            {/* Subtitle */}
            <div className='flex flex-col gap-4 mb-6'>
              <p className="text-black/70 md:pr-32 leading-7  flex items-center justify-center md:justify-start">
                Referência em semijoias premium há mais de 20 anos, com acabamento impecável e preços até 5x menores direto da fábrica.
              </p>
            </div>
            <div
              className={`mt-0 flex md:hidden justify-center md:justify-start transition-all duration-500 ${
                showScrollHint ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
              }`}
            >
              <button
                type="button"
                aria-label="Rolar para baixo"
                className="h-12 w-12 rounded-full mt-4 border border-orange-200 bg-gradient-to-b from-white via-white to-white/60 shadow-[0_10px_24px_rgba(255,255,255,0.75)] backdrop-blur-sm animate-bounce cursor-default flex items-center justify-center"
              >
                <Mouse className="h-5 w-5 text-orange-400" strokeWidth={2} />
              </button>
            </div>

          </div>

        </div>
    

      </section>
    </>
  );
}