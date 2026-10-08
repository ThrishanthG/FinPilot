'use client';

import { ArrowRight, Download, Mail, MapPin, Phone } from 'lucide-react';

const skills = [
  'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js',
  'Python', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker',
];

const experience = [
  {
    role: 'Senior Frontend Engineer',
    company: 'TechCorp Inc.',
    period: '2022 - Present',
    description: 'Leading frontend architecture decisions and mentoring junior developers.',
  },
  {
    role: 'Full Stack Developer',
    company: 'StartupXYZ',
    period: '2020 - 2022',
    description: 'Built scalable web applications serving 100K+ monthly active users.',
  },
  {
    role: 'Junior Developer',
    company: 'Digital Agency',
    period: '2018 - 2020',
    description: 'Developed responsive websites and e-commerce solutions for clients.',
  },
];

export default function ResumeSection() {
  return (
    <section id="resume" className="section-padding bg-[#070b0a] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left Column — CTA */}
          <div className="flex flex-col justify-center">
            <span className="font-jakarta font-bold text-[11px] tracking-[0.2em] uppercase text-[#5ed29c] mb-4 block">
              Get Started
            </span>
            <h2 className="font-inter font-extrabold text-[32px] md:text-[48px] lg:text-[56px] text-white tracking-tight leading-tight mb-6">
              Ready to Launch Your{' '}
              <span className="text-[#5ed29c]">Career?</span>
            </h2>
            <p className="font-inter text-[14px] md:text-[16px] text-white/60 leading-relaxed mb-10 max-w-[480px]">
              Join thousands of students who have transformed their careers through CodeNest. Start your journey today
              with our career-ready curriculum.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <a
                href="#enroll"
                className="btn-shine inline-flex items-center justify-center gap-3 bg-[#5ed29c] text-[#070b0a] font-inter font-bold text-[14px] uppercase tracking-wide px-8 py-4 rounded-full hover:bg-[#4ab885] transition-all duration-300 hover:shadow-[0_0_30px_rgba(94,210,156,0.3)] hover:scale-105"
              >
                Enroll Now
                <ArrowRight size={18} strokeWidth={2.5} />
              </a>
              <a
                href="#download"
                className="inline-flex items-center justify-center gap-3 bg-white/5 text-white font-inter font-bold text-[14px] uppercase tracking-wide px-8 py-4 rounded-full hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20"
              >
                <Download size={18} />
                Download Syllabus
              </a>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-white/40">
                <Mail size={16} className="text-[#5ed29c]" />
                <span className="font-inter text-[13px]">hello@codenest.io</span>
              </div>
              <div className="flex items-center gap-3 text-white/40">
                <Phone size={16} className="text-[#5ed29c]" />
                <span className="font-inter text-[13px]">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-white/40">
                <MapPin size={16} className="text-[#5ed29c]" />
                <span className="font-inter text-[13px]">San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Right Column — Skills & Experience */}
          <div className="space-y-8">
            {/* Skills */}
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5">
              <h3 className="font-inter font-bold text-[18px] text-white mb-6">
                Skills You Will Master
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-4 py-2 rounded-full bg-[#5ed29c]/10 text-[#5ed29c] font-inter text-[13px] font-medium hover:bg-[#5ed29c]/20 transition-colors duration-300 cursor-default"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Career Path Timeline */}
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5">
              <h3 className="font-inter font-bold text-[18px] text-white mb-6">
                Career Path Preview
              </h3>
              <div className="space-y-6">
                {experience.map((exp) => (
                  <div key={exp.role} className="relative pl-6 border-l border-white/10">
                    <div className="absolute left-0 top-0 w-2 h-2 rounded-full bg-[#5ed29c] -translate-x-[5px]" />
                    <div className="font-inter text-[13px] text-[#5ed29c] mb-1">{exp.period}</div>
                    <div className="font-inter font-bold text-[15px] text-white mb-1">{exp.role}</div>
                    <div className="font-inter text-[13px] text-white/40 mb-1">{exp.company}</div>
                    <div className="font-inter text-[12px] text-white/30">{exp.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
