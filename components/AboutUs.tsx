
import React from 'react';
import { ShieldCheck, Smartphone, Users, Zap, Building, Lock, CheckCircle, ArrowRight } from 'lucide-react';

const AboutUs: React.FC = () => {
  return (
    <div className="bg-white min-h-screen animate-fadeIn">
      {/* Hero Section */}
      <div className="relative bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-brand-900/90 mix-blend-multiply" />
          <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2070&q=80" 
            alt="Luanda Modern City" 
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Arrendaki
          </h1>
          <p className="text-xl md:text-2xl font-light text-gray-300 max-w-3xl mx-auto mb-8">
            Sem intermediários. Com toda a confiança. <br/>
            <span className="text-brand-500 font-bold">O seu imóvel, Kiá!</span>
          </p>
          <div className="flex justify-center space-x-4">
             <div className="flex items-center text-sm font-medium bg-white/10 px-4 py-2 rounded-full border border-white/20">
                <Smartphone className="w-4 h-4 mr-2 text-brand-400" /> Mobile-First PropTech
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Mission & Value */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Facilitador de Confiança</h2>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                    O Arrendaki é uma plataforma PropTech inovadora, desenvolvida com uma abordagem estritamente 
                    <strong> mobile-first</strong>, dedicada a redefinir a forma como as transações imobiliárias ocorrem em Angola.
                </p>
                <p className="text-gray-600 text-lg leading-relaxed">
                    Fundamentado na premissa de que a confiança deve ser acessível e garantida, atuamos promovendo a 
                    ligação direta entre proprietários e interessados, removendo as ineficiências e os riscos associados à mediação tradicional.
                </p>
            </div>
            <div className="bg-brand-50 p-8 rounded-2xl border border-brand-100">
                <h3 className="text-xl font-bold text-brand-800 mb-4 flex items-center">
                    <Users className="w-6 h-6 mr-2" /> Missão e Proposta de Valor
                </h3>
                <p className="text-brand-900 mb-6">
                    A nossa missão é <strong>Democratizar</strong> o mercado imobiliário em Angola.
                </p>
                <ul className="space-y-4">
                    <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-brand-600 mr-3 mt-0.5" />
                        <span className="text-brand-800 text-sm">Conexão direta entre proprietários e inquilinos/compradores.</span>
                    </li>
                    <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-brand-600 mr-3 mt-0.5" />
                        <span className="text-brand-800 text-sm">Eliminação de intermediários e taxas abusivas.</span>
                    </li>
                    <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-brand-600 mr-3 mt-0.5" />
                        <span className="text-brand-800 text-sm">Promoção de transações transparentes e seguras.</span>
                    </li>
                </ul>
            </div>
        </div>

        {/* Kiá Verify Section */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden mb-24">
            <div className="bg-accent-600 px-8 py-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center">
                    <ShieldCheck className="w-8 h-8 mr-3" />
                    O Coração da Confiança: Kiá Verify
                </h2>
                <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Serviço Garantido</span>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                    <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center text-accent-700 mb-2">
                        <Zap className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-gray-900">Zero Intermediários</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        Proprietários e clientes interagem diretamente, resultando numa 
                        <strong> poupança substancial de comissões</strong> (que tipicamente variam entre 5% a 10% do valor total).
                    </p>
                </div>
                <div className="space-y-3">
                    <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center text-accent-700 mb-2">
                        <Lock className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-gray-900">Segurança Auditável</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        Por uma taxa competitiva de <strong>2,5%</strong>, executamos um rigoroso processo de verificação documental (identidade, título de propriedade e procurações), garantindo legitimidade.
                    </p>
                </div>
                <div className="space-y-3">
                    <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center text-accent-700 mb-2">
                        <Smartphone className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-gray-900">Fecho Digital</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        Processo padronizado culminando na geração de um <strong>Contrato Kiá</strong> legalmente válido e na facilitação segura do pagamento.
                    </p>
                </div>
            </div>
        </div>

        {/* Nexus One Section */}
        <div className="border-t border-gray-200 pt-16">
            <div className="text-center mb-12">
                <h2 className="text-2xl font-bold text-gray-900">Desenvolvimento e Inovação</h2>
                <p className="text-gray-500 mt-2">Um projeto concebido e gerido pela Nexus One.</p>
            </div>

            <div className="bg-gray-900 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                    <Building className="w-64 h-64" />
                </div>
                
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div>
                        <h3 className="text-3xl font-bold mb-6 text-brand-500">Nexus One</h3>
                        <p className="text-gray-300 text-lg mb-6 font-light">
                            Desenvolvimento e Projecto.
                        </p>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                            O Arrendaki, através da Nexus One, compromete-se a ser o parceiro tecnológico que Angola precisa para transformar a transação imobiliária de um processo de risco numa experiência simples, rápida e segura.
                        </p>
                    </div>
                    <div className="space-y-6">
                        <div className="flex">
                            <div className="mt-1 mr-4">
                                <div className="w-2 h-2 bg-brand-500 rounded-full"></div>
                            </div>
                            <div>
                                <h4 className="font-bold text-white mb-1">Estratégia Tecnológica</h4>
                                <p className="text-sm text-gray-400">Arquitetura mobile-first, escalabilidade e segurança da infraestrutura.</p>
                            </div>
                        </div>
                        <div className="flex">
                            <div className="mt-1 mr-4">
                                <div className="w-2 h-2 bg-brand-500 rounded-full"></div>
                            </div>
                            <div>
                                <h4 className="font-bold text-white mb-1">Conformidade Operacional</h4>
                                <p className="text-sm text-gray-400">Workflow de compliance Kiá Verify em parceria com consultores legais, cumprindo os requisitos regulamentares angolanos.</p>
                            </div>
                        </div>
                        <div className="flex">
                            <div className="mt-1 mr-4">
                                <div className="w-2 h-2 bg-brand-500 rounded-full"></div>
                            </div>
                            <div>
                                <h4 className="font-bold text-white mb-1">Gestão de Produto</h4>
                                <p className="text-sm text-gray-400">Liderança em UX/UI e evolução funcional com foco na transparência.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default AboutUs;
