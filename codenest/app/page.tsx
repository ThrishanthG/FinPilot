import Navigation from '../components/Navigation';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import ProjectsSection from '../components/ProjectsSection';
import BlogSection from '../components/BlogSection';
import AboutSection from '../components/AboutSection';
import ResumeSection from '../components/ResumeSection';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <main className="relative bg-[#070b0a] min-h-screen">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <ProjectsSection />
      <BlogSection />
      <AboutSection />
      <ResumeSection />
      <Footer />
    </main>
  );
}
