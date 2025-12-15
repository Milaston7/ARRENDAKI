
import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Home, Banknote, Navigation, CheckCircle } from 'lucide-react';
import { PROVINCES, MUNICIPALITIES_MOCK } from '../constants';
import { FilterState } from '../types';

interface HeroProps {
  onSearch: (filters: Partial<FilterState>) => void;
  onNavigate: (view: string) => void;
}

const Hero: React.FC<HeroProps> = ({ onSearch, onNavigate }) => {
  const [province, setProvince] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [type, setType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [listingType, setListingType] = useState('');

  // Debounce logic for prices to auto-search without needing to click the button every time
  useEffect(() => {
    const timer = setTimeout(() => {
        // Only auto-search if there's a value or if we are clearing values
        if (minPrice || maxPrice || (minPrice === '' && maxPrice === '')) {
            onSearch({ 
                province, 
                municipality,
                type,
                listingType,
                minPrice: minPrice ? Number(minPrice) : undefined,
                maxPrice: maxPrice ? Number(maxPrice) : undefined
            });
        }
    }, 600); // 600ms delay

    return () => clearTimeout(timer);
  }, [minPrice, maxPrice]); // Only re-run if prices change

  const handleManualSearch = () => {
    onSearch({ 
      province, 
      municipality,
      type,
      listingType,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined
    });
    
    // Smooth scroll to results
    setTimeout(() => {
        const element = document.getElementById('property-list');
        element?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const availableMunicipalities = province 
    ? (MUNICIPALITIES_MOCK[province] || MUNICIPALITIES_MOCK['Default']) 
    : [];

  return (
    <div className="relative bg-gray-900 text-white overflow-hidden pb-16">
      {/* Background Image Overlay */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1920&q=80" 
          alt="Angola Real Estate" 
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/40 via-gray-900/60 to-gray-900"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 flex flex-col items-center text-center">
        
        {/* Headlines */}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 drop-shadow-xl animate-fadeIn">
          Encontre o seu imóvel ideal em <span className="text-brand-500">Angola</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-200 max-w-3xl mb-12 drop-shadow-md font-light animate-fadeIn">
          A plataforma mais segura para comprar, vender e arrendar. <br className="hidden md:block" />
          Sem intermediários, com transação garantida e verificação documental.
        </p>

        {/* Search Box */}
        <div id="search-container" className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl p-2 md:p-3 flex flex-col lg:flex-row gap-2 lg:gap-0 items-center transform transition-all hover:scale-[1.01] duration-300 animate-fadeIn">
          
          <div className="w-full lg:flex-1 relative group border-b lg:border-b-0 lg:border-r border-gray-100">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
            <select
              value={province}
              onChange={(e) => { setProvince(e.target.value); setMunicipality(''); }}
              className="block w-full pl-12 pr-4 py-4 text-gray-900 bg-transparent focus:ring-0 focus:outline-none font-medium appearance-none cursor-pointer"
            >
              <option value="">Província</option>
              {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="w-full lg:flex-1 relative group border-b lg:border-b-0 lg:border-r border-gray-100">
            <Navigation className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${!province ? 'text-gray-300' : 'text-gray-400 group-focus-within:text-brand-500'}`} />
            <select
              value={municipality}
              onChange={(e) => setMunicipality(e.target.value)}
              disabled={!province}
              className={`block w-full pl-12 pr-4 py-4 text-gray-900 bg-transparent focus:ring-0 focus:outline-none font-medium appearance-none cursor-pointer ${!province ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="">Município</option>
              {availableMunicipalities.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="w-full lg:flex-1 relative group border-b lg:border-b-0 lg:border-r border-gray-100">
            <Home className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
             <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="block w-full pl-12 pr-4 py-4 text-gray-900 bg-transparent focus:ring-0 focus:outline-none font-medium appearance-none cursor-pointer"
            >
              <option value="">Tipo</option>
              <option value="Apartamento">Apartamento</option>
              <option value="Vivenda">Vivenda</option>
              <option value="Escritório">Escritório</option>
              <option value="Loja">Loja</option>
              <option value="Terreno">Terreno</option>
            </select>
          </div>

          <div className="w-full lg:flex-[1.2] relative flex items-center group px-4 py-2 lg:py-0">
            <Banknote className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
            <div className="flex items-center w-full space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full py-2 bg-transparent focus:outline-none text-gray-900 placeholder-gray-400 font-medium"
                />
                <span className="text-gray-300">-</span>
                <input
                  type="number"
                  placeholder="Max (Kz)"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full py-2 bg-transparent focus:outline-none text-gray-900 placeholder-gray-400 font-medium"
                />
            </div>
          </div>

          <button 
            onClick={handleManualSearch}
            className="w-full lg:w-auto bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 px-10 rounded-xl lg:rounded-l-none lg:rounded-r-xl transition-all shadow-lg flex items-center justify-center whitespace-nowrap mt-2 lg:mt-0"
          >
            <Search className="h-5 w-5 mr-2" />
            Pesquisar
          </button>
        </div>

        {/* Quick Tags */}
        <div className="mt-10 flex flex-wrap justify-center gap-3 animate-fadeIn">
            {['Luanda Centro', 'Talatona', 'Kilamba', 'Benguela', 'Viana'].map(tag => (
                <button 
                    key={tag}
                    onClick={() => {
                        // Simple quick action simulation
                        const el = document.getElementById('property-list');
                        el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm transition-colors"
                >
                    {tag}
                </button>
            ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center w-full max-w-4xl animate-fadeIn delay-100">
            <div className="flex flex-col items-center group">
                <div className="bg-brand-500/20 p-3 rounded-full mb-3 group-hover:bg-brand-500/30 transition-colors">
                    <CheckCircle className="w-6 h-6 text-brand-500" />
                </div>
                <h3 className="font-bold text-lg">Verificação Kiá</h3>
                <p className="text-sm text-gray-400">Todos os proprietários e imóveis são validados manualmente.</p>
            </div>
            <div className="flex flex-col items-center group">
                <div className="bg-blue-500/20 p-3 rounded-full mb-3 group-hover:bg-blue-500/30 transition-colors">
                    <Banknote className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="font-bold text-lg">Pagamento Seguro</h3>
                <p className="text-sm text-gray-400">O seu dinheiro fica protegido até receber as chaves (Escrow).</p>
            </div>
            <div className="flex flex-col items-center group">
                <div className="bg-green-500/20 p-3 rounded-full mb-3 group-hover:bg-green-500/30 transition-colors">
                    <Navigation className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="font-bold text-lg">Visitas Agendadas</h3>
                <p className="text-sm text-gray-400">Marque visitas reais com proprietários verificados.</p>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Hero;
