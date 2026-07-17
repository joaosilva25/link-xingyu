import Hero from './components/hero';
import Links from './components/Links';
import Footer from './components/Footer';
import TrendBannerAdmin from './pages/TrendBannerAdmin';
import VideoPage from './pages/VideoPage';
import { isAdminRoute } from './config/adminRoute';

function App() {
  if (isAdminRoute(window.location.pathname)) {
    return <TrendBannerAdmin />;
  }

  if (window.location.pathname === '/video') {
    return <VideoPage />;
  }

  return (
    <>
      <section id="center">
        <Hero />
        <Links />
      </section>
      <Footer />
    </>
  );
}

export default App;
