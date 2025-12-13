
import React, { useState } from 'react';
import { Search, MapPin, Home, ShieldCheck, CheckCircle, Banknote } from 'lucide-react';
import { PROVINCES } from '../constants';
import { FilterState } from '../types';

interface HeroProps {
  onSearch: (filters: Partial<FilterState>) => void;
}

const QUICK_PROVINCES = ['Luanda', 'Benguela', 'Huíla', 'Huambo', 'Namibe'];

const Hero: React.FC<HeroProps> = ({ onSearch }) => {
  const [province, setProvince] = useState('');
  const [type, setType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handleSearch = () => {
    onSearch({ 
      province, 
      type,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined
    });
  };

  const handleQuickFilter = (selectedProvince: string) => {
    setProvince(selectedProvince);
    onSearch({ 
      province: selectedProvince, 
      type,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined
    });
  };

  return (
    <div className="relative bg-gray-900 text-white overflow-hidden">
      {/* Background Image Overlay - Authentic Luanda Marginal / Coastal City Night Vibe */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&w=1920&q=80" 
          alt="Angola Real Estate Skyline" 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/40 to-gray-900/90"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-32 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 drop-shadow-lg">
          Encontre o seu lugar <br/> <span className="text-brand-500">ideal em Angola.</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-200 max-w-2xl mb-10 drop-shadow-md">
          De Cabinda ao Cunene. Mais segurança, menos intermediários. 
          Use o <span className="text-brand-400 font-semibold">Arrendaki</span> com Transação Garantida.
        </p>

        {/* Search Box - Responsive Design */}
        <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl p-4 flex flex-col lg:flex-row gap-4 lg:gap-0 items-center">
          
          {/* Location Input */}
          <div className="w-full lg:flex-1 relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
            </div>
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 border-none rounded-md bg-transparent appearance-none truncate cursor-pointer"
            >
              <option value="">Todas as Províncias</option>
              {PROVINCES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Divider */}
          <div className="w-full h-px lg:w-px lg:h-12 bg-gray-200 lg:mx-2"></div>

          {/* Type Input */}
          <div className="w-full lg:flex-1 relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Home className="h-5 w-5 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
            </div>
             <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 border-none rounded-md bg-transparent appearance-none truncate cursor-pointer"
            >
              <option value="">Tipo de Imóvel</option>
              <option value="Apartamento">Apartamento</option>
              <option value="Vivenda">Vivenda</option>
              <option value="Escritório">Escritório</option>
              <option value="Loja">Loja</option>
              <option value="Terreno">Terreno</option>
            </select>
          </div>

          {/* Divider */}
          <div className="w-full h-px lg:w-px lg:h-12 bg-gray-200 lg:mx-2"></div>

          {/* Price Range Inputs */}
          <div className="w-full lg:flex-[1.5] relative flex items-center group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <Banknote className="h-5 w-5 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
            </div>
            <div className="flex items-center w-full pl-10 space-x-2">
                <input
                  type="number"
                  placeholder="Min Kz"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-1/2 py-3 text-gray-900 placeholder-gray-500 focus:outline-none bg-transparent appearance-none text-sm"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Máx Kz"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-1/2 py-3 text-gray-900 placeholder-gray-500 focus:outline-none bg-transparent appearance-none text-sm"
                />
            </div>
          </div>

          {/* Search Button */}
          <button 
            onClick={handleSearch}
            className="w-full lg:w-auto bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 px-8 rounded-xl transition-all duration-200 flex items-center justify-center whitespace-nowrap shadow-lg hover:shadow-brand-500/30 transform hover:-translate-y-0.5 mt-2 lg:mt-0 lg:ml-2"
          >
            <Search className="h-5 w-5 mr-2" />
            Pesquisar
          </button>
        </div>

        {/* Quick Filters */}
        <div className="mt-8 flex flex-wrap justify-center items-center gap-3 animate-fadeIn">
            <span className="text-gray-300 text-sm font-medium">Procurar em:</span>
            {QUICK_PROVINCES.map((p) => (
                <button
                    key={p}
                    onClick={() => handleQuickFilter(p)}
                    className={`px-4 py-1.5 rounded-full border text-sm font-medium transition-all duration-300 backdrop-blur-sm shadow-sm ${
                        province === p 
                        ? 'bg-brand-500 border-brand-500 text-white' 
                        : 'bg-white/10 border-white/20 text-white hover:bg-brand-500 hover:border-brand-500'
                    }`}
                >
                    {p}
                </button>
            ))}
        </div>

        {/* Badges */}
        <div className="mt-10 flex flex-wrap justify-center gap-4 text-sm text-gray-300 font-medium">
            <div className="flex items-center bg-gray-900/50 backdrop-blur-md px-4 py-2 rounded-full border border-gray-700">
                <ShieldCheck className="w-4 h-4 text-green-400 mr-2" />
                Transação Segura (Escrow)
            </div>
             <div className="flex items-center bg-gray-900/50 backdrop-blur-md px-4 py-2 rounded-full border border-gray-700">
                <CheckCircle className="w-4 h-4 text-blue-400 mr-2" />
                Kiá Verify
            </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
