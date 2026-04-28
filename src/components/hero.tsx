import { ArrowDownRight, Gem, Sparkles } from 'lucide-react';
import logo from '../assets/XY.png';
import heroimg from '../assets/BANNERHero.png';
import heroMobile from '../assets/BANNERMobile.png';

export default function Hero() {
  return (
    <section className="relative min-h-[95vh] py-24 md:py-0 md:min-h-[80vh] overflow-hidden bg-[#F5F5F5]">

      <div className="absolute inset-0">
        <img
          src={heroimg}
          alt="Hero"
          className="w-full h-full object-cover object-center hidden md:block"
        />
        <div className="absolute inset-0 bg-black/5 hidden md:block"></div>
      </div>
      {/* Content */}
      <div className="relative z-10 px-6 md:px-40 mx-auto md:py-30 w-full grid md:grid-cols-2 gap-12 items-center text-center md:text-left">

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
            Referência em <br></br>Semijoias no Brasil
          </h1>

          {/* Subtitle */}
          <div className='flex flex-col gap-4 mb-6'>
            <p className="text-black/70 md:pr-32 leading-7  flex items-center justify-center md:justify-start ">
              Há mais de 20 anos como referência em semijoias, com qualidade premium, acabamento impecável e preços até 5x menores direto da fábrica. Acesse nosso catálogo exclusivo e descubra o padrão que conquista milhares de clientes
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-center md:justify-start gap-6 mt-12">

            <a
              href="https://chat.whatsapp.com/GgiaeKuxGMB5uSZakNWG2y"
              target="_blank"
              className="group relative inline-flex items-center gap-4 bg-gradient-to-r from-orange-300 to-orange-400 border border-orange-300 text-white px-8 py-4 rounded-2xl font-medium"
            >
              <span className="text-sm tracking-wide uppercase">Acessar grupo exclusivo</span>
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white">
                <ArrowDownRight className="w-4 h-4 text-orange-400 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
              </div>
            </a>
          </div>

        </div>

      </div>
             {/* Mobile Image */}
          <div className="md:hidden mt-2">
            <img
              src={heroMobile}
              alt="Hero Mobile"
              className="w-full h-[500px]  object-cover object-bottom"
            />
          </div>

      {/* Scrolling Banner */}
      <div className="w-full bg-white border border-orange-200 backdrop-blur-md py-4 overflow-hidden md:absolute md:bottom-0 md:left-0" style={
        {backdropFilter: 'blur(15px)'}
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

    </section>
  );
}