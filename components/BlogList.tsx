import React, { useState, useEffect } from 'react';
import { BlogPost } from '../types';
import { Clock, User, ChevronRight, BookOpen, ShieldCheck, Download, PlusCircle, ArrowLeft, Share2, Facebook, Linkedin, Twitter, Tag, Wallet, Smartphone, Home } from 'lucide-react';

interface BlogListProps {
  posts: BlogPost[];
  onReadMore: (postId: string) => void;
}

const BlogList: React.FC<BlogListProps> = ({ posts, onReadMore }) => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Reading progress logic
  useEffect(() => {
    if (!selectedPost) {
        // Reset scroll position and progress bar when returning to list
        const progressBar = document.getElementById('reading-progress');
        if (progressBar) progressBar.style.transform = `scaleX(0)`;
        window.scrollTo(0, 0);
        return;
    };

    const scrollListener = () => {
        const element = document.documentElement;
        const totalHeight = element.scrollHeight - element.clientHeight;
        const scrollPosition = element.scrollTop;
        
        // Prevent division by zero if content is smaller than viewport
        if (totalHeight <= 0) return;

        const progress = (scrollPosition / totalHeight);
        
        const progressBar = document.getElementById('reading-progress');
        if (progressBar) {
            progressBar.style.transform = `scaleX(${progress})`;
        }
    };

    window.addEventListener('scroll', scrollListener, { passive: true });
    return () => window.removeEventListener('scroll', scrollListener);
  }, [selectedPost]);

  const parseDate = (dateStr: string): Date => {
    const months: {[key: string]: number} = {
        'Jan': 0, 'Fev': 1, 'Mar': 2, 'Abr': 3, 'Mai': 4, 'Jun': 5,
        'Jul': 6, 'Ago': 7, 'Set': 8, 'Out': 9, 'Nov': 10, 'Dez': 11
    };
    const parts = dateStr.split(' ');
    if (parts.length !== 3) return new Date();
    
    const day = parseInt(parts[0], 10);
    const month = months[parts[1]];
    const year = parseInt(parts[2], 10);
    
    if (isNaN(day) || month === undefined || isNaN(year)) return new Date();
    
    return new Date(year, month, day);
  };

  const filteredPosts = posts
    .filter(p => p.status === 'published')
    .filter(p => activeCategory === 'all' || p.category === activeCategory)
    .sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime());

  const categories = [
      { id: 'all', label: 'Todos', icon: BookOpen },
      { id: 'legal', label: 'Jurídico', icon: ShieldCheck },
      { id: 'safety', label: 'Segurança', icon: ShieldCheck },
      { id: 'market', label: 'Mercado', icon: Tag },
      { id: 'tips', label: 'Dicas', icon: Tag }
  ];

  // Render Single Article
  if (selectedPost) {
      return (
          <div className="bg-white min-h-screen animate-fadeIn">
              <div id="reading-progress" className="fixed top-0 left-0 h-1 bg-brand-500 w-full z-[60] origin-left" style={{ transform: 'scaleX(0)' }}></div>

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                  <button 
                    onClick={() => setSelectedPost(null)}
                    className="flex items-center text-gray-500 hover:text-brand-600 mb-8 font-medium transition-colors"
                  >
                      <ArrowLeft className="w-5 h-5 mr-2" /> Voltar ao Blog
                  </button>

                  <div className="flex flex-col lg:flex-row gap-12">
                      {/* Article Content */}
                      <article className="flex-1 max-w-4xl">
                          <header className="mb-8">
                              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                                  <span className="uppercase font-bold tracking-wide text-brand-600">{selectedPost.category}</span>
                                  <span>•</span>
                                  <span>{selectedPost.date}</span>
                              </div>
                              <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4 font-serif">
                                  {selectedPost.title}
                              </h1>
                              <p className="text-xl text-gray-600 font-light mb-6">
                                  {selectedPost.subtitle || selectedPost.excerpt}
                              </p>
                              
                              <div className="flex items-center justify-between border-y border-gray-100 py-4">
                                  <div className="flex items-center">
                                      <div className="w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center text-brand-600 font-bold text-lg mr-4 border border-brand-100">
                                          {selectedPost.author.charAt(0)}
                                      </div>
                                      <div>
                                          <p className="font-bold text-gray-900">{selectedPost.author}</p>
                                          {selectedPost.author.includes('Jurídico') || selectedPost.author.includes('Segurança') ? (
                                              <p className="text-xs text-accent-600 flex items-center font-medium">
                                                  <ShieldCheck className="w-3 h-3 mr-1" /> Autoridade Verificada
                                              </p>
                                          ) : null}
                                      </div>
                                  </div>
                                  <div className="flex space-x-2 text-gray-400">
                                      <button className="p-2 hover:bg-gray-100 rounded-full"><Facebook className="w-5 h-5" /></button>
                                      <button className="p-2 hover:bg-gray-100 rounded-full"><Linkedin className="w-5 h-5" /></button>
                                      <button className="p-2 hover:bg-gray-100 rounded-full"><Share2 className="w-5 h-5" /></button>
                                  </div>
                              </div>
                          </header>

                          {selectedPost.image && (
                              <div className="mb-10 rounded-xl overflow-hidden shadow-lg border border-gray-100">
                                  <img src={selectedPost.image} alt={selectedPost.title} className="w-full h-auto object-cover max-h-[500px]" />
                              </div>
                          )}

                          <div className="prose prose-lg max-w-none text-gray-800 font-serif leading-relaxed" dangerouslySetInnerHTML={{ __html: selectedPost.content }} />
                      </article>

                      {/* Sticky CTA Sidebar */}
                      <aside className="w-full lg:w-80 lg:sticky top-24 self-start space-y-6">
                          {/* CTA for Owners */}
                          <div className="bg-brand-50 border-2 border-brand-200 rounded-2xl p-6 text-center shadow-sm">
                              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-brand-100">
                                 <Home className="w-6 h-6 text-brand-600" />
                              </div>
                              <h3 className="font-bold text-brand-900 text-lg">É Proprietário?</h3>
                              <p className="text-sm text-brand-800 mt-2 mb-4">Liste o seu imóvel e garanta a segurança Kiá Verify.</p>
                              <button className="w-full bg-brand-500 text-white font-bold py-3 rounded-lg hover:bg-brand-600 transition-colors flex items-center justify-center shadow-md">
                                  <Wallet className="w-4 h-4 mr-2" /> Pagar Taxa (3.000 AOA)
                              </button>
                          </div>
                          {/* CTA for Tenants */}
                          <div className="bg-gray-800 text-white rounded-2xl p-6 text-center shadow-sm">
                              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-gray-600">
                                 <Smartphone className="w-6 h-6 text-gray-200" />
                              </div>
                              <h3 className="font-bold text-lg">É Inquilino?</h3>
                              <p className="text-sm text-gray-300 mt-2 mb-4">Pesquise apenas imóveis verificados e seguros.</p>
                              <button className="w-full bg-white text-gray-900 font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
                                  <Download className="w-4 h-4 mr-2" /> Baixar a App
                              </button>
                          </div>
                      </aside>
                  </div>
              </div>
          </div>
      );
  }

  // Render Blog List
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-gray-800 text-white py-16 md:py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Kiá Content</h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Conselhos de segurança, dicas de mercado e atualizações legais para um negócio imobiliário sem surpresas.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center space-x-1 md:space-x-2 mb-12 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(cat => (
                <button 
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 md:px-4 py-2 rounded-full font-bold text-sm transition-colors whitespace-nowrap flex items-center ${
                        activeCategory === cat.id 
                        ? 'bg-brand-600 text-white shadow-md' 
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                >
                    <cat.icon className="w-4 h-4 mr-2 opacity-70" />
                    {cat.label}
                </button>
            ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map(post => (
                <div 
                    key={post.id} 
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group flex flex-col cursor-pointer"
                    onClick={() => setSelectedPost(post)}
                >
                    <div className="relative h-48 overflow-hidden">
                        <img 
                            src={post.image} 
                            alt={post.title} 
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                        />
                         <div className="absolute top-3 left-3 bg-white/90 text-brand-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider backdrop-blur-sm">
                            {post.category}
                        </div>
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight h-14">{post.title}</h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow">{post.excerpt}</p>
                        <div className="mt-auto border-t border-gray-100 pt-4 flex justify-between items-center">
                            <div className="flex items-center text-xs text-gray-500">
                                <User className="w-4 h-4 mr-1.5" />
                                <span>{post.author}</span>
                            </div>
                            <span className="flex items-center text-xs text-brand-600 font-bold group-hover:underline">
                                Ler Mais <ChevronRight className="w-4 h-4 ml-1" />
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default BlogList;
