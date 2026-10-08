'use client';

import { ArrowUpRight, Clock, Calendar } from 'lucide-react';

const posts = [
  {
    title: 'Understanding React Server Components',
    excerpt: 'Deep dive into RSC architecture and how it changes the way we build React applications.',
    date: 'Dec 15, 2024',
    readTime: '8 min read',
    category: 'React',
    featured: true,
  },
  {
    title: 'TypeScript Best Practices for 2025',
    excerpt: 'Essential patterns and techniques to write cleaner, more maintainable TypeScript code.',
    date: 'Dec 10, 2024',
    readTime: '6 min read',
    category: 'TypeScript',
    featured: false,
  },
  {
    title: 'Building Scalable APIs with Node.js',
    excerpt: 'Learn the architecture patterns that power production-grade Node.js applications.',
    date: 'Dec 5, 2024',
    readTime: '10 min read',
    category: 'Backend',
    featured: false,
  },
];

export default function BlogSection() {
  const featuredPost = posts.find((p) => p.featured);
  const otherPosts = posts.filter((p) => !p.featured);

  return (
    <section id="blog" className="section-padding bg-[#070b0a] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-24">
          <span className="font-jakarta font-bold text-[11px] tracking-[0.2em] uppercase text-[#5ed29c] mb-4 block">
            Latest Insights
          </span>
          <h2 className="font-inter font-extrabold text-[32px] md:text-[48px] lg:text-[56px] text-white tracking-tight leading-tight mb-6">
            From Our <span className="text-[#5ed29c]">Blog</span>
          </h2>
          <p className="font-inter text-[14px] md:text-[16px] text-white/60 max-w-[600px] mx-auto leading-relaxed">
            Stay updated with the latest trends, tutorials, and insights from our team of industry professionals.
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Featured Post */}
          {featuredPost && (
            <div className="group lg:row-span-2 relative p-8 lg:p-10 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#5ed29c]/20 transition-all duration-500 card-hover overflow-hidden flex flex-col justify-between">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-[#5ed29c]/10 text-[#5ed29c] font-jakarta font-bold text-[11px] tracking-wide uppercase mb-6">
                  Featured
                </span>
                <h3 className="font-inter font-bold text-[24px] md:text-[28px] text-white mb-4 group-hover:text-[#5ed29c] transition-colors duration-300 leading-tight">
                  {featuredPost.title}
                </h3>
                <p className="font-inter text-[14px] text-white/50 leading-relaxed mb-8">
                  {featuredPost.excerpt}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-white/40">
                  <span className="flex items-center gap-1.5 font-inter text-[12px]">
                    <Calendar size={14} />
                    {featuredPost.date}
                  </span>
                  <span className="flex items-center gap-1.5 font-inter text-[12px]">
                    <Clock size={14} />
                    {featuredPost.readTime}
                  </span>
                </div>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#5ed29c]/20 transition-colors duration-300"
                >
                  <ArrowUpRight
                    size={18}
                    className="text-white/40 group-hover:text-[#5ed29c] transition-colors"
                  />
                </a>
              </div>

              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(400px circle at 30% 70%, rgba(94,210,156,0.06), transparent 40%)',
                }}
              />
            </div>
          )}

          {/* Other Posts */}
          <div className="flex flex-col gap-6 lg:gap-8">
            {otherPosts.map((post) => (
              <div
                key={post.title}
                className="group relative p-6 lg:p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#5ed29c]/20 transition-all duration-500 card-hover overflow-hidden"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <span className="inline-block px-3 py-1 rounded-full bg-white/5 text-white/40 font-jakarta font-bold text-[11px] tracking-wide uppercase">
                    {post.category}
                  </span>
                  <a
                    href="#"
                    className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#5ed29c]/20 transition-colors duration-300 flex-shrink-0"
                  >
                    <ArrowUpRight
                      size={14}
                      className="text-white/40 group-hover:text-[#5ed29c] transition-colors"
                    />
                  </a>
                </div>

                <h3 className="font-inter font-bold text-[18px] text-white mb-3 group-hover:text-[#5ed29c] transition-colors duration-300 leading-tight">
                  {post.title}
                </h3>
                <p className="font-inter text-[13px] text-white/50 leading-relaxed mb-6">
                  {post.excerpt}
                </p>

                <div className="flex items-center gap-4 text-white/40">
                  <span className="flex items-center gap-1.5 font-inter text-[12px]">
                    <Calendar size={14} />
                    {post.date}
                  </span>
                  <span className="flex items-center gap-1.5 font-inter text-[12px]">
                    <Clock size={14} />
                    {post.readTime}
                  </span>
                </div>

                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(300px circle at 90% 50%, rgba(94,210,156,0.06), transparent 40%)',
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
