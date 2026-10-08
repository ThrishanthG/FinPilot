'use client';

import { CheckCircle, Star, Users, Award } from 'lucide-react';

const stats = [
  { icon: Users, value: '5,000+', label: 'Students Enrolled' },
  { icon: Star, value: '4.9', label: 'Average Rating' },
  { icon: Award, value: '150+', label: 'Industry Mentors' },
  { icon: CheckCircle, value: '92%', label: 'Job Placement Rate' },
];

const values = [
  {
    title: 'Practical Learning',
    description:
      'We believe in learning by doing. Every course is packed with real-world projects and hands-on exercises.',
  },
  {
    title: 'Industry Relevance',
    description:
      'Our curriculum is shaped by current market demands and updated regularly to reflect industry changes.',
  },
  {
    title: 'Community First',
    description:
      "Join a thriving community of learners and professionals who support each other's growth.",
  },
];

export default function AboutSection() {
  return (
    <section id="about" className="section-padding bg-[#070b0a] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="container-custom">
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-16 md:mb-24">
          <div>
            <span className="font-jakarta font-bold text-[11px] tracking-[0.2em] uppercase text-[#5ed29c] mb-4 block">
              About Us
            </span>
            <h2 className="font-inter font-extrabold text-[32px] md:text-[48px] lg:text-[56px] text-white tracking-tight leading-tight mb-6">
              Building the Next Generation of{' '}
              <span className="text-[#5ed29c]">Developers</span>
            </h2>
          </div>
          <div className="flex items-end">
            <p className="font-inter text-[14px] md:text-[16px] text-white/60 leading-relaxed">
              CodeNest was founded with a simple mission: make high-quality coding education accessible to everyone. We
              partner with industry professionals to deliver curriculum that actually prepares you for the real world.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-16 md:mb-24">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="group p-6 lg:p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#5ed29c]/20 transition-all duration-500 text-center card-hover"
            >
              <div className="w-12 h-12 rounded-xl bg-[#5ed29c]/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-[#5ed29c]/20 transition-colors duration-300">
                <stat.icon size={24} className="text-[#5ed29c]" />
              </div>
              <div className="font-inter font-extrabold text-[28px] md:text-[36px] text-white mb-1 group-hover:text-[#5ed29c] transition-colors duration-300">
                {stat.value}
              </div>
              <div className="font-inter text-[12px] md:text-[13px] text-white/40 uppercase tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {values.map((value, index) => (
            <div
              key={value.title}
              className="group relative p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#5ed29c]/20 transition-all duration-500 card-hover"
            >
              <span className="font-inter font-extrabold text-[48px] text-white/[0.03] leading-none absolute top-6 right-6">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="font-inter font-bold text-[18px] text-white mb-4 group-hover:text-[#5ed29c] transition-colors duration-300">
                {value.title}
              </h3>
              <p className="font-inter text-[14px] text-white/50 leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
