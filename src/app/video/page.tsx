import { Sora } from "next/font/google";
import VideoPage from "@/components/VideoPage";
import "../../bio.css";

const sora = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function Page() {
  return (
    <div className={sora.className}>
      <VideoPage />
    </div>
  );
}
