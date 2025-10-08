import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import MatrixRain from "@/components/MatrixRain";

export default function Home() {
  return (
    <div className="min-h-screen bg-background relative">
      <MatrixRain />
      <div className="relative z-10">
        <Navbar />
        <HeroSection />
        <FeaturesSection />
      </div>
    </div>
  );
}
