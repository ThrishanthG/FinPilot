'use client';

import { Layers, Users, Award, Zap, RefreshCw, Briefcase } from 'lucide-react';

const features = [
  {
    icon: Layers,
    title: 'Hands-On Projects',
    description: 'Build real-world applications from day one. Every lesson culminates in a portfolio-worthy project.',
  },
  {
    icon: Users,
    title: '1-on-1 Mentorship',
    description: 'Work directly with senior engineers who have years of industry experience at top companies.',
  },
  {
    icon: Award,
    title: 'Industry Certificates',
    description: 'Earn credentials recognized by leading tech companies and included in our hiring network.',
  },
  {
    icon: Zap,
    title: 'Live Coding Sessions',
    description: 'Join weekly live sessions where instructors code in real-time and answer your questions instantly.',
  },
  {
    icon: RefreshCw,
    title: 'Updated Curriculum',
    description: 'Our syllabus evolves monthly based on job market data so you always learn the most relevant skills.',
  },
  {
    icon: Briefcase,
    title: 'Career Support',
    description: 'From resume reviews to mock interviews, our career team helps you land your first or next role.',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="section-padding bg-[#070b0a] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-16 md:mb-24">
          <span className="font-jakarta font-bold text-[11px] tracking-[0.2em] uppercase text-[#5ed29c] mb-4 block">
            WHY CODENEST
          </span>
          <h2 className="font-inter font-extrabold text-[32px] md:text-[48px] lg:text-[56px] text-white tracking-tight leading-tight mb-6">
            Everything You Need{' '}
            <span className="text-[#5ed29c]">to Succeed</span>
          </h2>
          <p className="font-inter text-[14px] md:text-[16px] text-white/60 max-w-[540px] mx-auto leading-relaxed">
            We've designed every aspect of CodeNest to remove the friction between learning to code and landing a job.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#5ed29c]/20 transition-all duration-500 card-hover overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-[#5ed29c]/10 flex items-center justify-center mb-6 group-hover:bg-[#5ed29c]/20 transition-colors duration-300">
                <feature.icon size={22} className="text-[#5ed29c]" />
              </div>

              <h3 className="font-inter font-bold text-[18px] text-white mb-3 group-hover:text-[#5ed29c] transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="font-inter text-[14px] text-white/50 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Glow */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(350px circle at 50% 0%, rgba(94,210,156,0.07), transparent 60%)',
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
