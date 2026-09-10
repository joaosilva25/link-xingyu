import { Link } from "lucide-react";

interface CardProps {
  imageSrc: string;
  link?: string;
  id?: string;
}

export default function Card({ imageSrc, link, id }: CardProps) {
  const isPopupTrigger = Boolean(id && !link);

  return (
    <div
      id={id}
      role={isPopupTrigger ? 'button' : undefined}
      tabIndex={isPopupTrigger ? 0 : undefined}
      className="w-full h-[210px] md:h-[400px] rounded-3xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-lg relative group cursor-pointer border-4 border-orange-200"
      style={{ backgroundImage: `url(${imageSrc})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
      onClick={() => link && window.open(link, '_blank')}
      onKeyDown={(event) => {
        if (!isPopupTrigger) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          event.currentTarget.click();
        }
      }}
    >
      {/* Blur overlay on hover */}
      <div 
        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
        style={{ backdropFilter: 'blur(8px)' }}
      >
        <div className="text-center flex flex-col items-center gap-5">
          <Link className="text-white h-10 w-10" strokeWidth={1.3} />
          <span className="text-white text-sm tracking-widest font-medium">VISITAR AGORA</span>
        </div>
      </div>
    </div>
  );
}
