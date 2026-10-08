'use client';

import { ArrowUpRight, Github, ExternalLink } from 'lucide-react';

const projects = [
  {
    title: 'E-Commerce API',
    category: 'Backend',
    description: 'Full-featured REST API with authentication, payments, and inventory management.',
    tech: ['Node.js', 'Express', 'MongoDB', 'Stripe'],
    github: '#',
    live: '#',
  },
  {
    title: 'TaskFlow Dashboard',
    category: 'Frontend',
    description: 'Real-time collaborative task management with drag-and-drop interface.',
    tech: ['React', 'TypeScript', 'Tailwind', 'Socket.io'],
    github: '#',
    live: '#',
  },
  {
    title: 'AI Chat Interface',
    category: 'Full Stack',
    description: 'Intelligent chatbot with natural language processing and context awareness.',
    tech: ['Next.js', 'OpenAI', 'Prisma', 'PostgreSQL'],
    github: '#',
    live: '#',
  },
  {
    title: 'Crypto Tracker',
    category: 'Frontend',
    description: 'Live cryptocurrency dashboard with real-time price updates and portfolio tracking.',
    tech: ['React', 'Chart.js', 'CoinGecko API', 'Tailwind'],
    github: '#',
    live: '#',
  },
];

export default function ProjectsSection() {
  return (
    <section id="projects" className="section-padding bg-[#070b0a] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="container-custom">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 md:mb-24">
          <div>
            <span className="font-jakarta font-bold text-[11px] tracking-[0.2em] uppercase text-[#5ed29c] mb-4 block">
              Portfolio
            </span>
            <h2 className="font-inter font-extrabold text-[32px] md:text-[48px] lg:text-[56px] text-white tracking-tight leading-tight">
              Featured <span className="text-[#5ed29c]">Projects</span>
            </h2>
          </div>
          <a
            href="#all-projects"
            className="mt-6 md:mt-0 inline-flex items-center gap-2 text-white/60 hover:text-[#5ed29c] font-inter text-[14px] transition-colors duration-300 group"
          >
            View All Projects
            <ArrowUpRight
              size={18}
              className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300"
            />
          </a>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {projects.map((project, index) => (
            <div
              key={project.title}
              className="group relative p-8 lg:p-10 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#5ed29c]/20 transition-all duration-500 card-hover overflow-hidden"
            >
              {/* Background Number */}
              <span className="absolute top-6 right-6 font-inter font-extrabold text-[80px] md:text-[100px] text-white/[0.02] leading-none select-none">
                {String(index + 1).padStart(2, '0')}
              </span>

              {/* Category Tag */}
              <span className="inline-block px-3 py-1 rounded-full bg-[#5ed29c]/10 text-[#5ed29c] font-jakarta font-bold text-[11px] tracking-wide uppercase mb-6">
                {project.category}
              </span>

              {/* Content */}
              <h3 className="font-inter font-bold text-[22px] md:text-[24px] text-white mb-3 group-hover:text-[#5ed29c] transition-colors duration-300">
                {project.title}
              </h3>
              <p className="font-inter text-[14px] text-white/50 leading-relaxed mb-6 max-w-[400px]">
                {project.description}
              </p>

              {/* Tech Stack */}
              <div className="flex flex-wrap gap-2 mb-8">
                {project.tech.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 rounded-md bg-white/5 text-white/40 font-inter text-[12px]"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Links */}
              <div className="flex items-center gap-4">
                <a
                  href={project.github}
                  className="flex items-center gap-2 text-white/40 hover:text-[#5ed29c] font-inter text-[13px] transition-colors duration-300"
                >
                  <Github size={16} />
                  Source
                </a>
                <a
                  href={project.live}
                  className="flex items-center gap-2 text-white/40 hover:text-[#5ed29c] font-inter text-[13px] transition-colors duration-300"
                >
                  <ExternalLink size={16} />
                  Live Demo
                </a>
              </div>

              {/* Hover Glow */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(400px circle at 80% 20%, rgba(94,210,156,0.06), transparent 40%)',
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
