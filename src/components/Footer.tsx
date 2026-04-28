import logo from '../assets/XY.png'

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col items-center gap-4">
        <div className="flex flex-col items-center gap-3">
          <img src={logo} alt="Xingyu" className="w-18 h-18 object-contain" />
          <a href="https://www.xingyu.com.br" className="text-black/80 text-xm hover:underline">www.xingyu.com.br</a>
        </div>
        <p className="text-black/80 text-xs">
          © 2026 Xingyu - Todos os direitos reservados
        </p>
      </div>
    </footer>
  )
}

export default Footer
