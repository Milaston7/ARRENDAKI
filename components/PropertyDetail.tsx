
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, MapPin, ExternalLink, ChevronLeft, ChevronRight, 
  ZoomIn, Film, CheckCircle, FileText, ShoppingBag, 
  Share2, Heart, ImageIcon, DollarSign, Facebook, Link as LinkIcon, Smartphone, Eye
} from 'lucide-react';
import { Property, User, VisitRequest, Contract } from '../types';
import { MOCK_CONTRACTS } from '../services/mockData';
import ImageLightbox from './ImageLightbox';
import TransactionModal from './TransactionModal';
import SchedulingModal from './SchedulingModal';
import DocumentTemplate from './DocumentTemplate';

interface PropertyDetailProps {
  property: Property;
  user: User | null;
  onBack: () => void;
  onLoginNeeded: () => void;
  onAddVisit: (visit: VisitRequest) => void;
  onStartChat: (propertyId: string, ownerId: string) => void; // New Prop
}

const PropertyDetail: React.FC<PropertyDetailProps> = ({ 
  property, 
  user, 
  onBack, 
  onLoginNeeded, 
  onAddVisit,
  onStartChat
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isMainImageLoading, setIsMainImageLoading] = useState(true);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isSchedulingModalOpen, setIsSchedulingModalOpen] = useState(false);
  
  // State for Historical Contract Viewing
  const [viewingContract, setViewingContract] = useState<Contract | null>(null);

  // Interaction State
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Swipe state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Reset loading when image changes
  useEffect(() => {
    setIsMainImageLoading(true);
  }, [activeImageIndex]);

  // Logic to find if user has a history with this property
  const existingContract = user ? MOCK_CONTRACTS.find(c => 
      c.propertyId === property.id && 
      (c.tenantId === user.id || c.ownerId === user.id)
  ) : null;

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${property.location.address}, ${property.location.municipality}, ${property.location.province}, Angola`)}`;

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  // Touch handlers for swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null); 
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      setActiveImageIndex((prev) => (prev + 1) % property.images.length);
    } else if (isRightSwipe) {
      setActiveImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
    }
  };

  const handleStartTransaction = () => {
    if (!user) {
        onLoginNeeded();
        return;
    }
    setIsTransactionModalOpen(true);
  };

  const handleScheduleClick = () => {
      if (!user) {
          onLoginNeeded();
          return;
      }
      setIsSchedulingModalOpen(true);
  };

  const handleMessageClick = () => {
      if (!user) {
          onLoginNeeded();
          return;
      }
      onStartChat(property.id, property.ownerId);
  };

  const toggleFavorite = () => {
      setIsFavorite(!isFavorite);
      // In a real app, this would verify login and call an API
  };

  const handleShare = (platform: 'whatsapp' | 'facebook' | 'copy') => {
      const url = window.location.href; // Mock URL
      const text = `Veja este imóvel no Arrendaki: ${property.title}`;
      
      if (platform === 'whatsapp') {
          window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
      } else if (platform === 'facebook') {
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
      } else {
          navigator.clipboard.writeText(`${text} - ${url}`);
          alert('Link copiado para a área de transferência!');
      }
      setShowShareMenu(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Modals */}
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
              onSubmit={(visitData) => {
                  onAddVisit(visitData as VisitRequest);
                  setIsSchedulingModalOpen(false);
              }}
          />
      )}

      {/* Contract Viewer Modal */}
      {viewingContract && user && (
          <DocumentTemplate 
              type="contract"
              data={{
                  id: viewingContract.id,
                  date: viewingContract.signedAt || viewingContract.startDate,
                  user: user,
                  property: property,
                  transactionDetails: {
                      amount: viewingContract.value,
                      currency: viewingContract.currency,
                      description: `Contrato de ${viewingContract.type === 'lease' ? 'Arrendamento' : 'Venda'}`,
                      reference: 'HISTORICO',
                      method: 'Kiá Contract'
                  }
              }}
              onClose={() => setViewingContract(null)}
          />
      )}

      {/* Header Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button 
            onClick={onBack} 
            className="flex items-center text-gray-600 hover:text-brand-500 font-medium transition-colors bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm hover:shadow-md"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar à pesquisa
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Multimedia & Details */}
          <div className="lg:col-span-2 space-y-6">
              
              {/* --- INTERACTIVE CAROUSEL --- */}
              <div className="space-y-4">
                  <div 
                      className="relative h-[400px] md:h-[500px] bg-gray-900 rounded-2xl overflow-hidden shadow-xl group select-none flex items-center justify-center touch-pan-y"
                      onTouchStart={onTouchStart}
                      onTouchMove={onTouchMove}
                      onTouchEnd={onTouchEnd}
                  >
                    {/* Loading Skeleton */}
                    {isMainImageLoading && (
                      <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center z-10">
                         <ImageIcon className="h-16 w-16 text-gray-700 opacity-50" />
                      </div>
                    )}

                    {/* Main Image */}
                    <img 
                      src={property.images[activeImageIndex]} 
                      alt={property.title} 
                      loading="lazy"
                      decoding="async"
                      onLoad={() => setIsMainImageLoading(false)}
                      onClick={() => setIsLightboxOpen(true)}
                      className={`w-full h-full object-cover cursor-zoom-in transition-opacity duration-500 ${isMainImageLoading ? 'opacity-0' : 'opacity-100'}`}
                    />

                     {/* Image Overlay Gradient */}
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 pointer-events-none"></div>

                     {/* Zoom Hint */}
                     <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
                          <ZoomIn className="w-5 h-5" />
                     </div>
                    
                    {/* Navigation Controls (Arrows) */}
                    {property.images.length > 1 && (
                      <>
                        <button 
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white text-white hover:text-gray-900 p-3 rounded-full backdrop-blur-md border border-white/30 transition-all shadow-lg opacity-0 group-hover:opacity-100 translate-x-[-20px] group-hover:translate-x-0 z-20"
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </button>
                        
                        <button 
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white text-white hover:text-gray-900 p-3 rounded-full backdrop-blur-md border border-white/30 transition-all shadow-lg opacity-0 group-hover:opacity-100 translate-x-[20px] group-hover:translate-x-0 z-20"
                        >
                          <ChevronRight className="h-6 w-6" />
                        </button>

                        {/* Dots Indicator */}
                        <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-2 z-20">
                          {property.images.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={(e) => { e.stopPropagation(); setActiveImageIndex(idx); }}
                              className={`h-2 rounded-full transition-all duration-300 shadow-sm ${
                                idx === activeImageIndex 
                                ? 'bg-brand-500 w-8' 
                                : 'bg-white/60 hover:bg-white w-2'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Strip */}
                  {property.images.length > 1 && (
                    <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
                      {property.images.map((img, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => setActiveImageIndex(idx)}
                          className={`relative h-20 w-32 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 snap-start border-2 ${
                            idx === activeImageIndex 
                              ? 'border-brand-500 ring-2 ring-brand-200 ring-offset-1 opacity-100 scale-105' 
                              : 'border-transparent opacity-60 hover:opacity-100 grayscale hover:grayscale-0'
                          }`}
                        >
                           <img 
                              src={img} 
                              alt={`Thumbnail ${idx + 1}`} 
                              className="w-full h-full object-cover"
                            />
                        </div>
                      ))}
                    </div>
                  )}
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6 mb-6">
                      <div>
                          <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mb-2">{property.title}</h1>
                          <a 
                              href={googleMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-500 flex items-center hover:text-brand-600 transition-colors w-fit group text-sm"
                          >
                              <MapPin className="h-4 w-4 mr-1.5 text-brand-500 group-hover:animate-bounce" />
                              {property.location.address}, {property.location.municipality}, {property.location.province}
                              <ExternalLink className="h-3 w-3 ml-1 opacity-50 group-hover:opacity-100" />
                          </a>
                      </div>
                      <div className="text-left md:text-right bg-gray-50 px-6 py-3 rounded-xl border border-gray-200">
                          <p className="text-3xl font-extrabold text-brand-600 tracking-tight">
                              {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: property.currency }).format(property.price)}
                          </p>
                          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{property.listingType === 'Arrendar' ? '/mês' : 'Preço Total'}</p>
                      </div>
                  </div>

                  <div className="mb-8">
                      <h3 className="font-bold text-lg mb-3 text-gray-900">Sobre este imóvel</h3>
                      <p className="text-gray-600 leading-relaxed text-lg">{property.description}</p>
                  </div>

                  {/* Nova Secção de Custos */}
                  <div className="mb-8 bg-gray-50 border border-gray-200 rounded-xl p-6">
                      <h3 className="font-bold text-lg mb-4 text-gray-900 flex items-center">
                          <DollarSign className="w-5 h-5 mr-2 text-brand-600" />
                          Transparência de Custos da Transação
                      </h3>
                      <div className="space-y-3 mb-6">
                          <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600 flex items-center">
                                  <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                                  Taxa de Serviço (Kiá Verify - 2.5%)
                              </span>
                              <span className="font-bold text-gray-900">
                                  {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: property.currency }).format(property.price * 0.025)}
                              </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600 flex items-center">
                                  <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                                  Taxa de Listagem (Custo Operacional)
                              </span>
                              <span className="font-bold text-gray-900">
                                  {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(3000)}
                              </span>
                          </div>
                          <div className="border-t border-gray-200 my-2 pt-2">
                              <div className="flex justify-between items-center">
                                  <span className="font-bold text-brand-800">Total de Taxas Estimadas</span>
                                  <span className="font-bold text-brand-600 text-lg">
                                      {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: property.currency }).format((property.price * 0.025) + (property.currency === 'AOA' ? 3000 : 3000 / 850))}
                                  </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                  * A Taxa de Serviço garante a verificação documental e segurança dos fundos (Escrow).
                              </p>
                          </div>
                      </div>
                      <button 
                          onClick={handleStartTransaction}
                          className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-lg transition-all shadow-md flex items-center justify-center transform hover:-translate-y-0.5"
                      >
                          Iniciar Transação
                      </button>
                  </div>
                  
                  {/* Video Tour Section */}
                  {property.videoUrl && (
                      <div className="mb-8">
                          <h3 className="font-bold text-lg mb-4 flex items-center text-gray-900">
                              <Film className="w-5 h-5 mr-2 text-brand-500" />
                              Vídeo Tour
                          </h3>
                          <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg relative group border border-gray-800">
                              <video controls className="w-full h-full" src={property.videoUrl}>
                                  Seu navegador não suporta a tag de vídeo.
                              </video>
                          </div>
                      </div>
                  )}

                  <div>
                      <h3 className="font-bold text-lg mb-4 text-gray-900">Comodidades & Características</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {property.features.map(f => (
                              <div key={f} className="flex items-center text-gray-700 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 hover:border-brand-200 transition-colors">
                                  <CheckCircle className="h-5 w-5 text-brand-500 mr-3 flex-shrink-0" />
                                  <span className="text-sm font-medium">{f}</span>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>

          {/* Right Column: Actions Sidebar */}
          <div className="space-y-6">
              {/* Action Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 sticky top-24">
                   {/* Historical Contract Check */}
                   {existingContract && (
                      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm animate-fadeIn">
                          <h4 className="font-bold text-blue-800 flex items-center mb-2">
                              <FileText className="h-5 w-5 mr-2" /> Histórico Kiá
                          </h4>
                          <p className="text-xs text-blue-700 leading-snug mb-3">
                              Você possui um contrato registado para este imóvel ({existingContract.status === 'active' ? 'Ativo' : 'Arquivado'}).
                          </p>
                          <button
                              onClick={() => setViewingContract(existingContract)}
                              className="w-full bg-white border border-blue-300 text-blue-700 font-bold py-2 rounded-lg text-sm hover:bg-blue-50 transition-colors flex items-center justify-center"
                          >
                              <Eye className="w-4 h-4 mr-2" /> Ver Contrato Original
                          </button>
                      </div>
                   )}

                   {property.isGuaranteed && (
                      <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 shadow-inner">
                          <h4 className="font-bold text-green-800 flex items-center mb-2">
                              <CheckCircle className="h-5 w-5 mr-2" /> Transação Garantida
                          </h4>
                          <p className="text-xs text-green-700 leading-snug">
                              Este imóvel beneficia da proteção Arrendaki (Escrow). O seu dinheiro fica seguro numa conta cativa até assinar o contrato digital.
                          </p>
                      </div>
                  )}

                  <div className="space-y-3">
                      <button 
                          onClick={handleStartTransaction}
                          className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl transition-all shadow-md transform hover:-translate-y-0.5 flex items-center justify-center text-lg active:scale-95"
                      >
                          {property.listingType === 'Arrendar' ? (
                              <><FileText className="w-5 h-5 mr-2"/> Iniciar Arrendamento</>
                          ) : (
                              <><ShoppingBag className="w-5 h-5 mr-2"/> Iniciar Compra</>
                          )}
                      </button>
                      
                      <div className="grid grid-cols-2 gap-3">
                          <button 
                              onClick={handleMessageClick} 
                              className="w-full bg-white border-2 border-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm"
                          >
                              Mensagem
                          </button>

                          <button 
                              onClick={handleScheduleClick}
                              className="w-full bg-white border-2 border-brand-500 text-brand-600 font-bold py-3 rounded-xl hover:bg-brand-50 transition-colors text-sm"
                          >
                              Agendar Visita
                          </button>
                      </div>

                      {/* --- NEW: FAVORITES & SHARE BUTTONS --- */}
                      <div className="grid grid-cols-2 gap-3 mt-3">
                          <button 
                              onClick={toggleFavorite}
                              className={`w-full flex items-center justify-center py-2.5 rounded-lg text-sm font-medium transition-colors border ${isFavorite ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
                          >
                              <Heart className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                              {isFavorite ? 'Guardado' : 'Favoritos'}
                          </button>

                          <div className="relative">
                              <button 
                                  onClick={() => setShowShareMenu(!showShareMenu)}
                                  className={`w-full flex items-center justify-center py-2.5 rounded-lg text-sm font-medium transition-colors border ${showShareMenu ? 'bg-brand-50 border-brand-200 text-brand-600' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
                              >
                                  <Share2 className="w-4 h-4 mr-2" />
                                  Partilhar
                              </button>
                              
                              {showShareMenu && (
                                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 p-2 animate-fadeIn flex flex-col gap-1">
                                      <button 
                                          onClick={() => handleShare('whatsapp')}
                                          className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-md transition-colors"
                                      >
                                          <Smartphone className="w-4 h-4 mr-2 text-green-600" /> WhatsApp
                                      </button>
                                      <button 
                                          onClick={() => handleShare('facebook')}
                                          className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors"
                                      >
                                          <Facebook className="w-4 h-4 mr-2 text-blue-600" /> Facebook
                                      </button>
                                      <button 
                                          onClick={() => handleShare('copy')}
                                          className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                                      >
                                          <LinkIcon className="w-4 h-4 mr-2 text-gray-500" /> Copiar Link
                                      </button>
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-100">
                      <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                              <div className="w-full h-full flex items-center justify-center bg-brand-100 text-brand-600 font-bold text-lg">
                                  {property.ownerId.charAt(0).toUpperCase()}
                              </div>
                          </div>
                          <div>
                              <p className="text-xs text-gray-500 uppercase font-bold">Anunciado por</p>
                              <p className="font-bold text-gray-900">ID: {property.ownerId}</p>
                              {property.isVerified && (
                                  <span className="text-xs text-green-600 flex items-center font-medium">
                                      <CheckCircle className="w-3 h-3 mr-1" /> Identidade Verificada
                                  </span>
                              )}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
