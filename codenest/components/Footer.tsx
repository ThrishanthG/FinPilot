'use client';

import { Github, Twitter, Linkedin, Youtube, ArrowUpRight } from 'lucide-react';

const footerLinks = {
  Platform: ['Courses', 'Mentorship', 'Projects', 'Community'],
  Company: ['About', 'Blog', 'Careers', 'Press'],
  Resources: ['Documentation', 'Tutorials', 'FAQ', 'Support'],
  Legal: ['Privacy', 'Terms', 'Cookies', 'Licenses'],
};

const socialLinks = [
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Youtube, href: '#', label: 'YouTube' },
];

export default function Footer() {
  return (
    <footer className="bg-[#070b0a] relative overflow-hidden border-t border-white/5">
      <div className="container-custom section-padding" style={{ paddingBottom: '3rem' }}>
        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-[#5ed29c] flex items-center justify-center">
                <span className="text-[#070b0a] font-inter font-bold text-sm">C</span>
              </div>
              <span className="text-white font-inter font-bold text-xl tracking-tight">
                CodeNest
              </span>
            </a>
            <p className="font-inter text-[14px] text-white/40 leading-relaxed max-w-[320px] mb-8">
              Empowering the next generation of developers with industry-ready skills and real-world experience.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-[#5ed29c]/20 transition-colors duration-300 group"
                  aria-label={social.label}
                >
                  <social.icon
                    size={18}
                    className="text-white/40 group-hover:text-[#5ed29c] transition-colors"
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {(Object.entries(footerLinks) as [string, string[]][]).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-inter font-bold text-[13px] text-white uppercase tracking-wide mb-6">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href={`#${link.toLowerCase()}`}
                      className="font-inter text-[14px] text-white/40 hover:text-[#5ed29c] transition-colors duration-300 flex items-center gap-1 group"
                    >
                      {link}
                      <ArrowUpRight
                        size={12}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-inter text-[12px] text-white/30">
            © 2025 CodeNest. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="font-inter text-[12px] text-white/30 hover:text-white/60 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="font-inter text-[12px] text-white/30 hover:text-white/60 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="font-inter text-[12px] text-white/30 hover:text-white/60 transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
