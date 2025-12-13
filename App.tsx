
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Hero from './components/Hero';
import PropertyCard from './components/PropertyCard';
import PropertyForm from './components/PropertyForm';
import ChatWindow from './components/ChatWindow';
import RegistrationForm from './components/RegistrationForm';
import UserProfile from './components/UserProfile';
import ImageLightbox from './components/ImageLightbox'; 
import TransactionModal from './components/TransactionModal';
import AdminPanel from './components/AdminPanel'; 
import SchedulingModal from './components/SchedulingModal'; // Import new modal
import { MOCK_PROPERTIES, MOCK_BLOG_POSTS, MOCK_VISITS } from './services/mockData';
import { Property, User, FilterState, UserRole, VisitRequest } from './types';
import { ArrowLeft, CheckCircle, ChevronLeft, ChevronRight, MapPin, Image as ImageIcon, ZoomIn, FileText, ShoppingBag, ExternalLink, ShieldAlert, Film, Lock, Shield, Edit3, BookOpen, Clock, User as UserIcon, Key, ShieldCheck, LogIn } from 'lucide-react';

// Images representing provinces with authentic vibes
const PROVINCE_HIGHLIGHTS = [
  { 
    name: 'Luanda', 
    image: 'https://images.unsplash.com/photo-1624020942548-18c3973c4391?auto=format&fit=crop&w=600&q=80', // Urban Coastal Skyline (Marginal Vibe)
    count: 342 
  },
  { 
    name: 'Benguela', 
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80', // Beautiful Tropical Beach (Baía Azul/Morena Vibe)
    count: 125 
  },
  { 
    name: 'Huíla', 
    image: 'https://images.unsplash.com/photo-1470723710355-173b4d1ad695?auto=format&fit=crop&w=600&q=80', // Mountain Road / Canyon (Serra da Leba/Tundavala Vibe)
    count: 89 
  },
  { 
    name: 'Namibe', 
    image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80', // Desert meets Ocean (Dunes Vibe)
    count: 45 
  }
];

const App: React.FC = () => {
  const [view, setView] = useState('home'); // home, blog, detail, add-property, chat, login, register, profile, admin
  const [user, setUser] = useState<User | null>(null);
  const [properties, setProperties] = useState<Property[]>(MOCK_PROPERTIES);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [searchFilters, setSearchFilters] = useState<Partial<FilterState>>({});
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isMainImageLoading, setIsMainImageLoading] = useState(true);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  
  // Visit Management State
  const [visits, setVisits] = useState<VisitRequest[]>(MOCK_VISITS);
  const [isSchedulingModalOpen, setIsSchedulingModalOpen] = useState(false);

  // Login / 2FA State
  const [isStaffLoginMode, setIsStaffLoginMode] = useState(false);
  const [staffLoginStep, setStaffLoginStep] = useState<'roles' | 'credentials' | '2fa'>('roles');
  const [pendingStaffRole, setPendingStaffRole] = useState<UserRole | null>(null);
  const [staffCredentials, setStaffCredentials] = useState({ email: '', password: '' });
  const [twoFACode, setTwoFACode] = useState('');

  // Standard Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [selectedSimulatedRole, setSelectedSimulatedRole] = useState<UserRole>('tenant');

  // Reset image index when opening a property
  useEffect(() => {
    setActiveImageIndex(0);
    setIsLightboxOpen(false);
    setIsTransactionModalOpen(false);
    setIsSchedulingModalOpen(false);
  }, [selectedPropertyId]);

  // Reset loading state when active image changes
  useEffect(() => {
    setIsMainImageLoading(true);
  }, [activeImageIndex, selectedPropertyId]);

  // Simulating filters - Only show available properties to normal users
  const filteredProperties = properties.filter(p => {
    // If Admin/Manager, show pending too (filtered in AdminPanel, but here we filter global list)
    // Actually, AdminPanel receives all properties. 
    // This list is for the PUBLIC view.
    if (p.status !== 'available' && p.status !== 'rented' && p.status !== 'sold') return false; 
    if (searchFilters.province && p.location.province !== searchFilters.province) return false;
    if (searchFilters.type && p.type !== searchFilters.type) return false;
    if (searchFilters.minPrice && p.price < searchFilters.minPrice) return false;
    if (searchFilters.maxPrice && p.price > searchFilters.maxPrice) return false;
    return true;
  });

  // Featured Properties Logic
  const featuredProperties = properties.filter(p => p.isGuaranteed && p.status === 'available').slice(0, 4);

  // Regular Login
  const handleStandardLogin = () => {
    if (!loginEmail || !loginPassword) {
        alert("Por favor, preencha o email e a senha.");
        return;
    }

    // SIMULATION MAPPING
    const role = selectedSimulatedRole;
    let mockUser: User;

    if (role === 'owner') {
        mockUser = { id: 'owner1', name: 'João Proprietário', email: loginEmail, role: 'owner', isAuthenticated: true, phone: '923111222', isIdentityVerified: true };
    } else if (role === 'broker') {
        mockUser = { id: 'broker1', name: 'Imobiliária Horizonte', email: loginEmail, role: 'broker', isAuthenticated: true, phone: '933444555', isIdentityVerified: true };
    } else if (role === 'legal_rep') {
        mockUser = { id: 'rep1', name: 'Dr. Paulo Silva', email: loginEmail, role: 'legal_rep', isAuthenticated: true, phone: '944555666', isIdentityVerified: true, representedEntityName: 'Grupo Vencedor Lda', representedEntityID: '541223321' };
    } else {
        // Tenant
        mockUser = { id: 'usr_123', name: 'Maria Inquilina', email: loginEmail, role: 'tenant', isAuthenticated: true, phone: '911222333', isIdentityVerified: true };
    }

    setUser(mockUser);
    setView('home');
  };

  // Staff Login Init - Step 1: Select Role
  const initStaffLogin = (role: UserRole) => {
      setPendingStaffRole(role);
      setStaffLoginStep('credentials');
      setStaffCredentials({ email: '', password: '' });
      setTwoFACode('');
  };

  // Staff Login - Step 2: Submit Credentials
  const submitStaffCredentials = () => {
    if (!staffCredentials.email || !staffCredentials.password) {
        alert("Por favor, preencha o email e a senha.");
        return;
    }
    // Mock validation
    setStaffLoginStep('2fa');
  };

  // 2FA Verification Mock - Step 3: Verify Code
  const verify2FA = () => {
      if (twoFACode === '123456') {
          const role = pendingStaffRole!;
          const roleNameMap: Record<string, string> = {
              'admin': 'Administrador',
              'commercial_manager': 'Gestor Comercial',
              'security_manager': 'Gestor de Segurança',
              'collaborator': 'Colaborador',
              'it_tech': 'Técnico de TI'
          };

          setUser({
              id: 'staff_' + role,
              name: roleNameMap[role] || 'Staff User',
              email: staffCredentials.email || `${role}@arrendaki.ao`,
              role: role,
              isAuthenticated: true,
              is2FAEnabled: true,
              profileImage: '' // Placeholder
          });
          
          // Reset State
          setStaffLoginStep('roles');
          setIsStaffLoginMode(false);
          setTwoFACode('');
          setStaffCredentials({ email: '', password: '' });
          
          setView('admin');
      } else {
          alert('Código incorreto. Tente "123456".');
      }
  };

  const handleRegister = (userData: any) => {
    // Simulating backend registration
    console.log("Registering user:", userData);
    setUser({
      id: `usr_${Date.now()}`,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      isAuthenticated: true,
      phone: userData.phone,
      // Pass other fields
      bi: userData.bi,
      // nif: userData.bi, // fallback - REMOVED: User type does not have 'nif' property
      representedEntityName: userData.representedEntityName,
      representedEntityID: userData.representedEntityID,
      address: userData.address ? { street: userData.address, municipality: userData.municipality, province: userData.province } : undefined
    });
    alert("Conta criada com sucesso! Bem-vindo ao Arrendaki.");
    setView('home');
  };

  const handleUpdateUser = (updates: Partial<User>) => {
      if (user) {
          setUser({ ...user, ...updates });
      }
  };

  const handleLogout = () => {
    setUser(null);
    setView('home');
    setIsStaffLoginMode(false);
    setStaffLoginStep('roles');
    setLoginEmail('');
    setLoginPassword('');
  };

  const handlePropertyClick = (id: string) => {
    setSelectedPropertyId(id);
    setView('detail');
  };

  const handleAddPropertySubmit = (newProp: Partial<Property>) => {
    const fullProp = newProp as Property;
    // New properties are Pending by default
    fullProp.status = 'pending';
    fullProp.isVerified = false;
    fullProp.ownerId = user?.id || 'unknown';
    
    setProperties([fullProp, ...properties]);
    setView('home');
    alert("Imóvel submetido para análise! Receberá uma notificação quando for aprovado pela administração.");
  };

  const handleUpdateProperty = (id: string, updates: Partial<Property>) => {
      setProperties(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleStartTransaction = () => {
    if (!user) {
        setView('login');
        return;
    }
    setIsTransactionModalOpen(true);
  };

  // Visit Logic
  const handleScheduleVisitSubmit = (visitData: Partial<VisitRequest>) => {
      const newVisit: VisitRequest = {
          id: `visit_${Date.now()}`,
          ...visitData
      } as VisitRequest;
      setVisits(prev => [newVisit, ...prev]);
  };

  const handleUpdateVisitStatus = (visitId: string, status: 'confirmed' | 'rejected') => {
      setVisits(prev => prev.map(v => v.id === visitId ? { ...v, status } : v));
  };

  const nextImage = (imagesLength: number) => {
    setActiveImageIndex((prev) => (prev + 1) % imagesLength);
  };

  const prevImage = (imagesLength: number) => {
    setActiveImageIndex((prev) => (prev - 1 + imagesLength) % imagesLength);
  };

  const handleProvinceClick = (provinceName: string) => {
    setSearchFilters({ ...searchFilters, province: provinceName });
    // Scroll to list
    const element = document.getElementById('property-list');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderContent = () => {
    switch (view) {
      case 'home':
        return (
          <>
            <Hero onSearch={setSearchFilters} />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              
              {/* FEATURED PROPERTIES SECTION */}
              {!searchFilters.province && !searchFilters.type && featuredProperties.length > 0 && (
                <div className="mb-16 animate-fadeIn">
                   <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                          <div className="p-2.5 bg-accent-50 rounded-xl border border-accent-100">
                              <ShieldCheck className="h-6 w-6 text-accent-600" />
                          </div>
                          <div>
                              <h2 className="text-2xl font-bold text-gray-900 leading-tight">Imóveis em Destaque</h2>
                              <p className="text-sm text-gray-500">Transação Garantida & Kiá Verify</p>
                          </div>
                      </div>
                      <button 
                        onClick={() => {
                            setSearchFilters({}); // Reset filters just in case
                            const el = document.getElementById('property-list');
                            el?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="hidden md:flex items-center text-sm font-bold text-brand-600 hover:text-brand-700"
                      >
                          Ver Todos <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                   </div>

                   <div className="relative">
                       <div className="flex space-x-6 overflow-x-auto pb-8 pt-2 scrollbar-hide snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
                          {featuredProperties.map((p) => (
                            <div key={p.id} className="min-w-[85%] sm:min-w-[380px] snap-center transform transition-transform hover:-translate-y-1">
                              <PropertyCard property={p} onClick={handlePropertyClick} />
                            </div>
                          ))}
                       </div>
                       {/* Gradient fade on right for mobile indication of scroll */}
                       <div className="absolute right-0 top-0 bottom-8 w-12 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none md:hidden"></div>
                   </div>
                </div>
              )}

              {/* Explore by Province Section */}
              {!searchFilters.province && !searchFilters.type && (
                <div className="mb-16">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <MapPin className="h-6 w-6 text-brand-500 mr-2" />
                    Explorar por Província
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {PROVINCE_HIGHLIGHTS.map((prov) => (
                      <div 
                        key={prov.name}
                        onClick={() => handleProvinceClick(prov.name)}
                        className="group relative h-48 rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                      >
                        <img 
                          src={prov.image} 
                          alt={prov.name}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end">
                          <h3 className="text-white text-xl font-bold">{prov.name}</h3>
                          <p className="text-gray-300 text-sm flex items-center">
                            {prov.count} imóveis
                            <ChevronRight className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div id="property-list">
                <div className="flex justify-between items-end mb-6">
                   <h2 className="text-2xl font-bold text-gray-900">
                    {searchFilters.province ? `Imóveis em ${searchFilters.province}` : 'Recentes no Arrendaki'}
                  </h2>
                  {Object.keys(searchFilters).length > 0 && (
                    <button 
                      onClick={() => setSearchFilters({})} 
                      className="text-sm text-brand-600 hover:text-brand-700 font-medium hover:underline"
                    >
                      Limpar Filtros
                    </button>
                  )}
                </div>

                {filteredProperties.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProperties.map(p => (
                      <PropertyCard key={p.id} property={p} onClick={handlePropertyClick} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-gray-100">
                    <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                      <MapPin className="h-full w-full" />
                    </div>
                    <p className="text-gray-900 font-medium text-lg">Nenhum imóvel encontrado nesta zona.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        );

      case 'blog':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fadeIn">
              <div className="text-center mb-12">
                  <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Blog Arrendaki</h1>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">Notícias, dicas e tendências do mercado imobiliário em Angola.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {MOCK_BLOG_POSTS.map(post => (
                      <div key={post.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-gray-100 flex flex-col h-full group">
                          <div className="h-48 overflow-hidden bg-gray-200 relative">
                              {post.image ? (
                                  <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-brand-50 text-brand-300">
                                      <BookOpen className="w-12 h-12" />
                                  </div>
                              )}
                              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-700">
                                  Notícias
                              </div>
                          </div>
                          <div className="p-6 flex flex-col flex-grow">
                              <div className="flex items-center text-xs text-gray-500 mb-3 space-x-3">
                                  <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {post.date}</span>
                                  <span className="flex items-center"><UserIcon className="w-3 h-3 mr-1" /> {post.author}</span>
                              </div>
                              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-brand-600 transition-colors">{post.title}</h3>
                              <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-grow">{post.excerpt}</p>
                              <button className="text-brand-600 font-bold text-sm flex items-center hover:underline mt-auto">
                                  Ler artigo completo <ChevronRight className="w-4 h-4 ml-1" />
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
        );

      case 'detail':
        const property = properties.find(p => p.id === selectedPropertyId);
        if (!property) return <div>Property not found</div>;
        
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${property.location.address}, ${property.location.municipality}, ${property.location.province}, Angola`)}`;

        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
            <ImageLightbox 
                isOpen={isLightboxOpen}
                onClose={() => setIsLightboxOpen(false)}
                images={property.images}
                activeIndex={activeImageIndex}
                onIndexChange={setActiveImageIndex}
            />

            {user && (
                <TransactionModal 
                    isOpen={isTransactionModalOpen}
                    onClose={() => setIsTransactionModalOpen(false)}
                    property={property}
                    user={user}
                />
            )}

            {user && (
                <SchedulingModal 
                    isOpen={isSchedulingModalOpen}
                    onClose={() => setIsSchedulingModalOpen(false)}
                    property={property}
                    user={user}
                    onSubmit={handleScheduleVisitSubmit}
                />
            )}

            <button onClick={() => setView('home')} className="mb-4 flex items-center text-gray-600 hover:text-brand-500">
              <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
            </button>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Images & Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Main Image Carousel */}
                    <div 
                        className="relative h-96 bg-gray-900 rounded-xl overflow-hidden shadow-lg group select-none flex items-center justify-center cursor-zoom-in"
                        onClick={() => setIsLightboxOpen(true)}
                    >
                      
                      {/* Loading Skeleton */}
                      {isMainImageLoading && (
                        <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center z-10">
                           <ImageIcon className="h-12 w-12 text-gray-600 opacity-50" />
                        </div>
                      )}

                      <img 
                        src={property.images[activeImageIndex]} 
                        alt={property.title} 
                        loading="lazy"
                        decoding="async"
                        onLoad={() => setIsMainImageLoading(false)}
                        className={`w-full h-full object-contain transition-opacity duration-300 ${isMainImageLoading ? 'opacity-0' : 'opacity-100'}`}
                      />

                       {/* Hover Overlay Hint */}
                       <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                            <ZoomIn className="text-white opacity-0 group-hover:opacity-70 w-12 h-12 drop-shadow-lg transform scale-50 group-hover:scale-100 transition-all duration-300" />
                       </div>
                      
                      {/* Navigation Controls */}
                      {property.images.length > 1 && (
                        <>
                          <button 
                            onClick={(e) => { e.stopPropagation(); prevImage(property.images.length); }}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm z-20"
                          >
                            <ChevronLeft className="h-6 w-6" />
                          </button>
                          
                          <button 
                            onClick={(e) => { e.stopPropagation(); nextImage(property.images.length); }}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm z-20"
                          >
                            <ChevronRight className="h-6 w-6" />
                          </button>

                          {/* Dots */}
                          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-20">
                            {property.images.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={(e) => { e.stopPropagation(); setActiveImageIndex(idx); }}
                                className={`w-2 h-2 rounded-full transition-all shadow-sm ${
                                  idx === activeImageIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Image Gallery Thumbnails */}
                    {property.images.length > 1 && (
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
                        {property.images.map((img, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => setActiveImageIndex(idx)}
                            className={`relative h-20 bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-100 transition-all ${
                              idx === activeImageIndex 
                                ? 'ring-2 ring-brand-500 ring-offset-2 opacity-100' 
                                : 'opacity-60 grayscale hover:grayscale-0'
                            }`}
                          >
                             <img 
                                src={img} 
                                alt={`${property.title} - ${idx + 1}`} 
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover"
                              />
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
                                <a 
                                    href={googleMapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-500 flex items-center mt-1 hover:text-brand-500 hover:underline w-fit group"
                                    title="Ver no Google Maps"
                                >
                                    <MapPin className="h-4 w-4 mr-1 group-hover:text-brand-500" />
                                    {property.location.address}, {property.location.municipality}, {property.location.province}
                                    <ExternalLink className="h-3 w-3 ml-1 opacity-50 group-hover:opacity-100" />
                                </a>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-bold text-brand-600">
                                    {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: property.currency }).format(property.price)}
                                </p>
                                <p className="text-sm text-gray-500">{property.listingType === 'Arrendar' ? '/mês' : ''}</p>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h3 className="font-semibold text-lg mb-3">Descrição</h3>
                            <p className="text-gray-600 leading-relaxed">{property.description}</p>
                        </div>
                        
                        {/* Video Tour Section */}
                        {property.videoUrl && (
                            <div className="mt-8">
                                <h3 className="font-semibold text-lg mb-3 flex items-center">
                                    <Film className="w-5 h-5 mr-2 text-gray-700" />
                                    Vídeo Tour
                                </h3>
                                <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-sm relative group">
                                    <video controls className="w-full h-full" src={property.videoUrl}>
                                        Seu navegador não suporta a tag de vídeo.
                                    </video>
                                </div>
                            </div>
                        )}

                        <div className="mt-8">
                            <h3 className="font-semibold text-lg mb-3">Comodidades</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {property.features.map(f => (
                                    <div key={f} className="flex items-center text-gray-600 bg-gray-50 p-2 rounded">
                                        <CheckCircle className="h-4 w-4 text-brand-500 mr-2" />
                                        <span className="text-sm">{f}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar / Actions */}
                <div className="space-y-6">
                    {/* Action Box */}
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 sticky top-24">
                         {property.isGuaranteed && (
                            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                                <h4 className="font-bold text-green-800 flex items-center mb-2">
                                    <CheckCircle className="h-5 w-5 mr-2" /> Transação Garantida
                                </h4>
                                <p className="text-xs text-green-700">
                                    Este imóvel beneficia da proteção Arrendaki. O seu dinheiro fica seguro até assinar o contrato.
                                </p>
                            </div>
                        )}

                        <div className="space-y-3">
                            <button 
                                onClick={handleStartTransaction}
                                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 rounded-lg transition-all shadow-md transform hover:-translate-y-0.5 flex items-center justify-center text-lg"
                            >
                                {property.listingType === 'Arrendar' ? (
                                    <><FileText className="w-5 h-5 mr-2"/> Iniciar Arrendamento</>
                                ) : (
                                    <><ShoppingBag className="w-5 h-5 mr-2"/> Iniciar Compra</>
                                )}
                            </button>
                            
                            <button 
                                onClick={() => user ? setView('chat') : setView('login')}
                                className="w-full bg-white border border-gray-300 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Contactar Proprietário
                            </button>

                            <button 
                                onClick={() => user ? setIsSchedulingModalOpen(true) : setView('login')}
                                className="w-full bg-white border border-brand-500 text-brand-600 font-bold py-3 rounded-lg hover:bg-brand-50 transition-colors"
                            >
                                Agendar Visita
                            </button>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        );

      case 'add-property':
        return (
          <div className="py-12 px-4">
             <PropertyForm onSubmit={handleAddPropertySubmit} onCancel={() => setView('home')} />
          </div>
        );

      case 'register':
        return (
          <div className="px-4">
            <RegistrationForm onRegister={handleRegister} onCancel={() => setView('login')} />
          </div>
        );

      case 'profile':
        if (!user) { setView('login'); return null; }
        return (
            <UserProfile 
                user={user} 
                userProperties={properties.filter(p => p.ownerId === user.id)}
                visits={visits}
                onUpdateUser={handleUpdateUser}
                onUpdateVisitStatus={handleUpdateVisitStatus}
                onBack={() => setView('home')}
            />
        );
      
      case 'admin':
         if (!user || !['admin', 'commercial_manager', 'security_manager', 'it_tech', 'collaborator'].includes(user.role)) { setView('login'); return null; }
         return (
             <AdminPanel 
                properties={properties} 
                onUpdateProperty={handleUpdateProperty}
                currentUserRole={user.role}
             />
         );

      case 'chat':
        const currentProp = properties.find(p => p.id === selectedPropertyId) || properties[0];
        return (
          <div className="max-w-4xl mx-auto py-12 px-4">
              <h2 className="text-2xl font-bold mb-6">Mensagens Seguras</h2>
              <ChatWindow 
                  chatId="123" 
                  currentUser="me"
                  onScheduleVisit={() => {
                      if(currentProp) {
                          // Ensure scheduling works even if navigated from general chat if we have context
                          setSelectedPropertyId(currentProp.id);
                          setIsSchedulingModalOpen(true);
                      }
                  }}
                  onSendProposal={() => {
                      if(currentProp) {
                          setSelectedPropertyId(currentProp.id);
                          handleStartTransaction();
                      }
                  }}
              />
          </div>
        );

      case 'login':
          return (
              <div className="min-h-[80vh] flex items-center justify-center px-4 relative bg-gray-50">
                  {/* 2FA Modal */}
                  {staffLoginStep === '2fa' && (
                      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                          <div className="bg-white p-8 rounded-xl max-w-sm w-full text-center">
                              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <Lock className="w-8 h-8 text-brand-600" />
                              </div>
                              <h3 className="text-xl font-bold mb-2">Autenticação 2FA</h3>
                              <p className="text-sm text-gray-500 mb-6">Insira o código enviado para o seu dispositivo corporativo.</p>
                              <input 
                                type="text" 
                                value={twoFACode}
                                onChange={(e) => setTwoFACode(e.target.value)}
                                className="text-center text-2xl tracking-widest font-mono border-2 border-gray-300 rounded-lg p-2 w-full mb-4 focus:border-brand-500 focus:outline-none"
                                maxLength={6}
                                placeholder="000000"
                              />
                              <button 
                                onClick={verify2FA}
                                className="w-full bg-brand-500 text-white py-3 rounded-lg font-bold hover:bg-brand-600 mb-2"
                              >
                                  Verificar
                              </button>
                              <button 
                                onClick={() => setStaffLoginStep('credentials')}
                                className="text-sm text-gray-400 hover:text-gray-600"
                              >
                                  Voltar
                              </button>
                              <div className="mt-4 p-2 bg-gray-100 text-xs text-gray-500 rounded">
                                  Use o código: <strong>123456</strong>
                              </div>
                          </div>
                      </div>
                  )}

                  <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
                      {!isStaffLoginMode ? (
                          <>
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Login</h2>
                                <p className="text-gray-500 text-sm">Aceda à sua conta Arrendaki</p>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <div className="relative">
                                        <UserIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                                        <input 
                                            type="email"
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500"
                                            placeholder="seu.email@exemplo.com"
                                            value={loginEmail}
                                            onChange={(e) => setLoginEmail(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                                    <div className="relative">
                                        <Key className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                                        <input 
                                            type="password"
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500"
                                            placeholder="••••••••"
                                            value={loginPassword}
                                            onChange={(e) => setLoginPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Simulation Role Selector */}
                                <div className="pt-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Simular Perfil (Demo)</label>
                                    <select 
                                        value={selectedSimulatedRole}
                                        onChange={(e) => setSelectedSimulatedRole(e.target.value as UserRole)}
                                        className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                                    >
                                        <option value="tenant">Inquilino / Comprador</option>
                                        <option value="owner">Proprietário</option>
                                        <option value="broker">Corretor</option>
                                        <option value="legal_rep">Representante de Terceiros</option>
                                    </select>
                                </div>

                                <button 
                                    onClick={handleStandardLogin}
                                    className="w-full bg-brand-500 text-white p-3 rounded-lg font-bold hover:bg-brand-600 transition-colors shadow-md flex justify-center items-center"
                                >
                                    <LogIn className="w-5 h-5 mr-2" /> Entrar
                                </button>
                            </div>

                            <div className="mt-6 border-t pt-4">
                                <button 
                                    onClick={() => { setIsStaffLoginMode(true); setStaffLoginStep('roles'); }}
                                    className="w-full flex items-center justify-center p-2 text-gray-500 hover:text-gray-800 text-sm font-medium"
                                >
                                    <ShieldAlert className="w-4 h-4 mr-2" />
                                    Acesso Administrativo (Staff)
                                </button>
                            </div>

                            <div className="mt-4 pt-6 border-t border-gray-100 text-center">
                                <p className="text-gray-500 mb-4 text-sm">Ainda não tem conta?</p>
                                <button 
                                    onClick={() => setView('register')} 
                                    className="w-full bg-gray-900 text-white p-3 rounded-lg font-bold hover:bg-gray-800 transition-colors"
                                >
                                    Criar Conta Nova
                                </button>
                            </div>
                          </>
                      ) : (
                          <>
                             <div className="flex items-center justify-center mb-6">
                                 <div className="p-3 bg-gray-900 rounded-full">
                                    <Shield className="w-8 h-8 text-white" />
                                 </div>
                             </div>
                             <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Acesso Corporativo</h2>
                             
                             {staffLoginStep === 'roles' && (
                                <>
                                    <p className="text-gray-500 mb-8 text-sm text-center">Selecione o seu perfil de acesso.</p>
                                    <div className="space-y-3">
                                        <button 
                                            onClick={() => initStaffLogin('admin')}
                                            className="w-full p-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium border border-transparent"
                                        >
                                            Administrador (Super User)
                                        </button>
                                        <button 
                                            onClick={() => initStaffLogin('commercial_manager')}
                                            className="w-full p-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
                                        >
                                            Gestor / Manager
                                        </button>
                                        <button 
                                            onClick={() => initStaffLogin('collaborator')}
                                            className="w-full p-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 flex items-center justify-center"
                                        >
                                            <Edit3 className="w-4 h-4 mr-2" />
                                            Colaborador (Conteúdo)
                                        </button>
                                        <button 
                                            onClick={() => initStaffLogin('security_manager')}
                                            className="w-full p-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
                                        >
                                            Gestor de Segurança
                                        </button>
                                        <button 
                                            onClick={() => initStaffLogin('it_tech')}
                                            className="w-full p-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
                                        >
                                            Técnico de TI
                                        </button>
                                    </div>
                                    <button 
                                        onClick={() => setIsStaffLoginMode(false)}
                                        className="mt-6 text-sm text-gray-400 hover:text-gray-600 w-full text-center"
                                    >
                                        Voltar ao login público
                                    </button>
                                </>
                             )}

                             {staffLoginStep === 'credentials' && (
                                <div className="text-left animate-fadeIn">
                                    <p className="text-gray-500 mb-6 text-sm text-center">
                                        Autenticação para <span className="font-bold text-gray-800 uppercase">{pendingStaffRole?.replace('_', ' ')}</span>
                                    </p>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Email / Username</label>
                                            <div className="relative">
                                                <UserIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                                                <input 
                                                    type="email" 
                                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500"
                                                    placeholder="user@arrendaki.ao"
                                                    value={staffCredentials.email}
                                                    onChange={e => setStaffCredentials({...staffCredentials, email: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Senha</label>
                                            <div className="relative">
                                                <Key className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                                                <input 
                                                    type="password" 
                                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500"
                                                    placeholder="••••••••"
                                                    value={staffCredentials.password}
                                                    onChange={e => setStaffCredentials({...staffCredentials, password: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-6 space-y-3">
                                        <button 
                                            onClick={submitStaffCredentials}
                                            className="w-full bg-brand-500 text-white py-3 rounded-lg font-bold hover:bg-brand-600"
                                        >
                                            Entrar
                                        </button>
                                        <button 
                                            onClick={() => setStaffLoginStep('roles')}
                                            className="w-full text-sm text-gray-500 hover:text-gray-800"
                                        >
                                            Voltar
                                        </button>
                                    </div>
                                </div>
                             )}
                          </>
                      )}

                      {!isStaffLoginMode && (
                        <button onClick={() => setView('home')} className="mt-6 text-sm text-gray-400 hover:text-gray-600 w-full text-center">
                            Voltar ao início
                        </button>
                      )}
                  </div>
              </div>
          )

      default:
        return <div>View not found</div>;
    }
  };

  return (
    <Layout 
      user={user} 
      onNavigate={(v) => setView(v)} 
      onLoginClick={() => setView('login')}
      onLogout={handleLogout}
      currentView={view}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
