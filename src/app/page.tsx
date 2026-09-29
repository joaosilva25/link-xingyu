import { Sora } from "next/font/google";
import Footer from "@/components/Footer";
import Hero from "@/components/hero";
import Links from "@/components/Links";
import { getPublicBanners } from "@/lib/banner-queries";
import { hasDatabaseEnv } from "@/lib/env";
import "../bio.css";

const sora = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const dynamic = "force-dynamic";

export default async function Home() {
  const fromCms = hasDatabaseEnv();
  const banners = fromCms ? await getPublicBanners() : [];

  return (
    <main className={`bio-page ${sora.className}`}>
      <section id="center">
        <Hero />
        <Links banners={fromCms ? banners : undefined} />
      </section>
      <Footer />
    </main>
  );
}
