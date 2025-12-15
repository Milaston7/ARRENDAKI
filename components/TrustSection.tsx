
import React from 'react';
import { ShieldCheck, FileSignature, Lock, ArrowRight } from 'lucide-react';

const TrustSection: React.FC = () => {
  return (
    <div className="bg-white py-16 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-brand-600 font-bold tracking-wide uppercase text-sm">Transparência Total</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2 mb-4">
            O que garantem os <span className="text-brand-600">2,5%</span>?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Ao contrário das comissões tradicionais (5-10%), a nossa taxa de serviço cobre exclusivamente a sua segurança jurídica e financeira.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300 relative group">
            <div className="absolute top-0 right-0 bg-gray-200 text-gray-500 font-bold px-4 py-2 rounded-bl-2xl rounded-tr-xl text-sm group-hover:bg-brand-500 group-hover:text-white transition-colors">
              Passo 1
            </div>
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Kiá Verify</h3>
            <p className="text-gray-600 leading-relaxed">
              Auditamos a identidade do proprietário e a titularidade do imóvel antes de qualquer pagamento. <strong>Zero burlas.</strong>
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300 relative group">
            <div className="absolute top-0 right-0 bg-gray-200 text-gray-500 font-bold px-4 py-2 rounded-bl-2xl rounded-tr-xl text-sm group-hover:bg-brand-500 group-hover:text-white transition-colors">
              Passo 2
            </div>
            <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600 mb-6 group-hover:scale-110 transition-transform">
              <FileSignature className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Kiá Contract</h3>
            <p className="text-gray-600 leading-relaxed">
              A nossa IA Jurídica gera um contrato formal, blindado e válido em Angola, protegendo ambas as partes.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300 relative group">
            <div className="absolute top-0 right-0 bg-gray-200 text-gray-500 font-bold px-4 py-2 rounded-bl-2xl rounded-tr-xl text-sm group-hover:bg-brand-500 group-hover:text-white transition-colors">
              Passo 3
            </div>
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-6 group-hover:scale-110 transition-transform">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Kiá Escrow</h3>
            <p className="text-gray-600 leading-relaxed">
              O seu dinheiro fica cativo numa conta segura e só é libertado ao proprietário após a entrega das chaves.
            </p>
          </div>
        </div>
        
        <div className="mt-12 text-center">
            <div className="inline-flex items-center bg-green-50 px-6 py-3 rounded-full border border-green-200">
                <span className="flex h-3 w-3 relative mr-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-sm font-medium text-green-800">
                    Mais de <strong>250 Contratos Seguros</strong> fechados este mês.
                </span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TrustSection;
