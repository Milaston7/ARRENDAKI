
import React, { useState, useEffect } from 'react';
import { X, FileText, CreditCard, PenTool, CheckCircle, Lock, Download, ChevronRight, AlertCircle, Building, Smartphone, Loader2, ShieldCheck, Hash, Landmark, MapPin, Phone, Scale, HelpCircle, Sparkles } from 'lucide-react';
import { Property, User } from '../types';
import { generateContract } from '../services/aiService';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
  user: User;
}

type Step = 'form' | 'fee_payment' | 'contract_generation' | 'signature' | 'final_payment' | 'complete';
type PaymentStatus = 'idle' | 'processing' | 'success';
type FeePaymentMethod = 'express' | 'reference' | 'transfer';

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, property, user }) => {
  const [step, setStep] = useState<Step>('form');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [feeMethod, setFeeMethod] = useState<FeePaymentMethod>('express');
  const [biConfirmed, setBiConfirmed] = useState(false);
  
  // AI Contract State
  const [contractText, setContractText] = useState<string>('');
  const [isGeneratingContract, setIsGeneratingContract] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    startDate: new Date().toISOString().split('T')[0],
    duration: '12', // months
    occupants: '1',
    address: user.address?.street || '', // Pre-fill if available
    phone: user.phone || '',
    nif: user.bi || '004729123LA042', // Pre-fill BI/NIF
    notes: ''
  });

  // --- REAL CALCULATIONS ---
  const duration = parseInt(formData.duration) || 1;
  const baseValue = property.price;
  const totalContractValue = property.listingType === 'Arrendar' ? baseValue * duration : baseValue;
  const transactionFee = totalContractValue * 0.025;
  const finalPaymentValue = property.listingType === 'Arrendar' ? baseValue : (baseValue * 0.10); 

  // Reset on open
  useEffect(() => {
    if (isOpen) {
        setStep('form');
        setPaymentStatus('idle');
        setBiConfirmed(false);
        setFeeMethod('express');
        setContractText('');
    }
  }, [isOpen]);

  // Trigger AI generation when entering contract step
  useEffect(() => {
      if (step === 'contract_generation' && !contractText) {
          const fetchContract = async () => {
              setIsGeneratingContract(true);
              const text = await generateContract(property, user, formData);
              setContractText(text);
              setIsGeneratingContract(false);
          };
          fetchContract();
      }
  }, [step, contractText, property, user, formData]);

  if (!isOpen) return null;

  const handleNextStep = (next: Step) => {
    setStep(next);
  };

  const simulatePayment = (nextStep: Step) => {
      setPaymentStatus('processing');
      setTimeout(() => {
          setPaymentStatus('success');
          setTimeout(() => {
              setPaymentStatus('idle');
              setStep(nextStep);
          }, 2000);
      }, 2000);
  };

  const handleLegalSupport = () => {
      const confirm = window.confirm("Você será redirecionado para o WhatsApp da nossa Equipa Jurídica para esclarecimento de dúvidas contratuais. Deseja continuar?");
      if (confirm) {
          // Simulate redirection to WhatsApp Support
          window.open(`https://wa.me/244921442552?text=Olá, preciso de apoio jurídico sobre o contrato do imóvel ${property.id} (${property.title}).`, "_blank");
      }
  };

  const renderPaymentOverlay = () => {
      if (paymentStatus === 'idle') return null;

      return (
        <div className="absolute inset-0 bg-white z-20 flex flex-col items-center justify-center p-8 animate-fadeIn">
            {paymentStatus === 'processing' && (
                <>
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-brand-100 rounded-full animate-ping opacity-75"></div>
                        <div className="bg-white p-4 rounded-full border-2 border-brand-100 relative z-10">
                            <Loader2 className="w-12 h-12 text-brand-600 animate-spin" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">A processar transação...</h3>
                    <p className="text-center text-gray-500 max-w-xs mb-6">
                        Aguarde a confirmação da rede Multicaixa.
                    </p>
                </>
            )}

            {paymentStatus === 'success' && (
                <>
                    <div className="bg-green-100 p-4 rounded-full mb-6 animate-fadeIn">
                        <CheckCircle className="w-16 h-16 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Pagamento Confirmado!</h3>
                </>
            )}
        </div>
      );
  };

  const renderForm = () => (
    <div className="space-y-4 animate-fadeIn">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start">
         <Building className="w-5 h-5 text-blue-600 mr-2 mt-1" />
         <div>
            <h4 className="font-bold text-blue-800">Dados do {property.listingType === 'Arrendar' ? 'Inquilino' : 'Comprador'}</h4>
            <p className="text-sm text-blue-600">Estes dados serão usados para a redação legal do contrato via IA.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
           <div className="relative">
               <input type="text" value={user.name} disabled className="w-full pl-3 pr-3 py-2 bg-gray-100 border rounded-md text-gray-600 font-medium" />
               <CheckCircle className="w-4 h-4 text-green-500 absolute right-3 top-2.5" />
           </div>
        </div>
        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">BI / NIF</label>
           <input 
             type="text" 
             value={formData.nif} 
             onChange={(e) => setFormData({...formData, nif: e.target.value})}
             className="w-full p-2 bg-white border border-gray-300 rounded-md text-gray-800 font-medium" 
           />
        </div>

        <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Morada Completa (Residência Atual)</label>
            <div className="relative">
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input 
                    type="text" 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Ex: Rua Comandante Gika, Edifício Jardim, Apt 2B, Luanda"
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500" 
                />
            </div>
        </div>

        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Telefone de Contacto</label>
           <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="9XX XXX XXX"
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500" 
                />
           </div>
        </div>

        {property.listingType === 'Arrendar' && (
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Início Pretendida</label>
                <input 
                    type="date" 
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md" 
                />
            </div>
        )}

        {property.listingType === 'Arrendar' && (
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duração do Contrato</label>
                <select 
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md bg-white"
                >
                    <option value="6">6 Meses</option>
                    <option value="12">12 Meses (1 Ano)</option>
                    <option value="24">24 Meses (2 Anos)</option>
                    <option value="36">36 Meses (3 Anos)</option>
                </select>
            </div>
        )}
        
        <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações (Opcional)</label>
            <textarea 
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md h-20"
                placeholder="Ex: Pagamento anual adiantado, tenho animais de estimação..."
            ></textarea>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button 
            onClick={() => handleNextStep('fee_payment')}
            disabled={property.listingType === 'Arrendar' && !formData.startDate}
            className="bg-brand-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
            Avançar para Pagamento da Taxa
        </button>
      </div>
    </div>
  );

  const renderFeePayment = () => (
    <div className="space-y-6 animate-fadeIn">
        <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900">Taxa de Serviço & Reserva</h3>
            <p className="text-gray-500 text-sm">Liquide a taxa de serviço Arrendaki para gerar o contrato legal.</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="flex justify-between items-center mb-1">
                <span className="text-gray-600 text-sm">Valor Base</span>
                <span className="font-semibold text-sm">{new Intl.NumberFormat('pt-AO', { style: 'currency', currency: property.currency }).format(baseValue)} {property.listingType === 'Arrendar' ? '/mês' : ''}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
                <span className="text-brand-800 font-bold">Taxa Arrendaki (2.5%)</span>
                <span className="text-brand-600 font-bold text-xl">{new Intl.NumberFormat('pt-AO', { style: 'currency', currency: property.currency }).format(transactionFee)}</span>
            </div>
        </div>

        {/* Payment Methods Tabs */}
        <div>
            <h4 className="font-bold text-gray-800 mb-3 text-sm">Selecionar Método de Pagamento</h4>
            <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
                <button 
                    onClick={() => setFeeMethod('express')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border whitespace-nowrap transition-colors ${feeMethod === 'express' ? 'bg-brand-50 border-brand-500 text-brand-700' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                    <Smartphone className="w-4 h-4" />
                    <span>MCX Express</span>
                </button>
                <button 
                    onClick={() => setFeeMethod('reference')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border whitespace-nowrap transition-colors ${feeMethod === 'reference' ? 'bg-brand-50 border-brand-500 text-brand-700' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                    <Hash className="w-4 h-4" />
                    <span>Referência</span>
                </button>
                <button 
                    onClick={() => setFeeMethod('transfer')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border whitespace-nowrap transition-colors ${feeMethod === 'transfer' ? 'bg-brand-50 border-brand-500 text-brand-700' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                    <Landmark className="w-4 h-4" />
                    <span>Transferência</span>
                </button>
            </div>

            {/* Payment Details Content */}
            <div className="border p-6 rounded-lg bg-white border-gray-200 shadow-sm min-h-[160px] flex flex-col justify-center">
                {feeMethod === 'express' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-bold text-gray-800">Multicaixa Express</p>
                                <p className="text-xs text-gray-500">Número de contacto para cobrança</p>
                            </div>
                            <Smartphone className="w-8 h-8 text-brand-500" />
                        </div>
                        <input 
                            type="tel" 
                            value="921 442 552"
                            readOnly
                            className="w-full border p-3 rounded-lg text-lg tracking-wide bg-gray-50 font-bold text-brand-700" 
                        />
                        <p className="text-xs text-brand-600 bg-brand-50 p-2 rounded">
                            <CheckCircle className="w-3 h-3 inline mr-1" />
                            Receberá uma notificação neste telemóvel para confirmar.
                        </p>
                    </div>
                )}

                {feeMethod === 'reference' && (
                    <div className="text-center space-y-3">
                        <p className="text-sm text-gray-500">Pagamento por Referência</p>
                        <div className="bg-gray-100 p-4 rounded-lg inline-block text-left w-full">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-500 text-sm">Entidade:</span>
                                <span className="font-mono font-bold">00123</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-500 text-sm">Referência:</span>
                                <span className="font-mono font-bold text-brand-600">921 442 552</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 text-sm">Valor:</span>
                                <span className="font-bold">{new Intl.NumberFormat('pt-AO', { style: 'currency', currency: property.currency }).format(transactionFee)}</span>
                            </div>
                        </div>
                    </div>
                )}

                {feeMethod === 'transfer' && (
                     <div className="space-y-3">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 bg-gray-100 rounded-full"><Landmark className="w-5 h-5 text-gray-600" /></div>
                            <div>
                                <p className="font-bold text-sm">Arrendaki Lda</p>
                                <p className="text-xs text-gray-500">Banco BAI</p>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded border border-gray-200 text-center">
                            <p className="text-xs text-gray-500 mb-1">IBAN</p>
                            <p className="font-mono font-bold text-gray-800 text-sm sm:text-base select-all">
                                AO06 0040 0000 9214 4255 2015 2
                            </p>
                        </div>
                        <p className="text-xs text-center text-gray-400">Envie o comprovativo para financeiro@arrendaki.ao</p>
                     </div>
                )}
            </div>
        </div>

        <div className="flex justify-between items-center pt-4">
            <button onClick={() => setStep('form')} className="text-gray-500 hover:text-gray-700 font-medium">Voltar</button>
            <button 
                onClick={() => simulatePayment('contract_generation')}
                className="bg-brand-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-brand-600 flex items-center shadow-lg hover:shadow-xl transition-all"
            >
                {feeMethod === 'express' ? 'Enviar Pedido ao Telemóvel' : 'Confirmar Pagamento'}
            </button>
        </div>
    </div>
  );

  const renderContract = () => {
    return (
    <div className="space-y-4 animate-fadeIn h-full flex flex-col">
         {/* Header Kiá Contract */}
         <div className="bg-gray-900 p-4 rounded-lg flex items-center justify-between shadow-md">
            <div className="flex items-center text-white">
                <Sparkles className="w-6 h-6 mr-3 text-brand-500" />
                <div>
                    <h3 className="font-bold text-lg leading-tight">Kiá Contract AI</h3>
                    <p className="text-xs text-gray-400">Gerado automaticamente por Inteligência Artificial</p>
                </div>
            </div>
            <div className="flex items-center bg-green-500/10 border border-green-500/30 px-3 py-1 rounded text-xs text-green-400 font-bold uppercase">
                <CheckCircle className="w-3 h-3 mr-1" />
                Validado
            </div>
         </div>

         <div className="flex-1 bg-white border-2 border-gray-200 rounded-lg p-8 overflow-y-auto max-h-[350px] shadow-inner font-serif text-sm leading-relaxed text-gray-800 text-justify relative">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                <span className="text-6xl font-bold transform -rotate-45">Arrendaki</span>
            </div>

            {isGeneratingContract ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <Loader2 className="w-12 h-12 text-brand-600 animate-spin" />
                    <p className="text-gray-500 font-medium animate-pulse">A redigir cláusulas legais com IA...</p>
                    <p className="text-xs text-gray-400 max-w-xs text-center">O Gemini está a analisar os dados do imóvel e das partes para criar um contrato seguro.</p>
                </div>
            ) : (
                <div className="whitespace-pre-wrap">
                    {contractText}
                </div>
            )}
         </div>

         {!isGeneratingContract && (
             <div className="flex justify-between pt-4 items-center">
                 <div className="flex space-x-4">
                     <button className="flex items-center text-gray-600 hover:text-gray-900 text-xs sm:text-sm">
                         <Download className="w-4 h-4 mr-1" /> PDF
                     </button>
                     <button onClick={handleLegalSupport} className="flex items-center text-brand-600 hover:text-brand-800 text-xs sm:text-sm font-medium">
                         <Scale className="w-4 h-4 mr-1" /> Suporte Jurídico
                     </button>
                 </div>
                 <button 
                    onClick={() => handleNextStep('signature')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center shadow-md transition-transform hover:-translate-y-0.5"
                >
                    <PenTool className="w-4 h-4 mr-2" />
                    Validar e Assinar
                </button>
             </div>
         )}
    </div>
  )};

  const renderSignature = () => (
      <div className="py-8 space-y-6 animate-fadeIn flex flex-col items-center justify-center h-full">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4 ring-4 ring-blue-100">
              <PenTool className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 text-center">Assinatura Digital</h3>
          <p className="text-gray-500 max-w-md text-center">
              Confirme a sua identidade para assinar legalmente o contrato.
          </p>
          
          <div className="bg-gray-50 p-6 rounded-xl w-full max-w-sm border border-gray-200 mt-4 shadow-inner">
              <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">Signatário:</span>
                  <span className="font-bold text-gray-800">{user.name}</span>
              </div>
              
              {/* Clickable BI Confirmation */}
              <div 
                onClick={() => setBiConfirmed(!biConfirmed)}
                className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${biConfirmed ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-blue-400 bg-white'}`}
              >
                  <div className="flex items-center">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 ${biConfirmed ? 'bg-green-500 border-green-500' : 'border-gray-400'}`}>
                          {biConfirmed && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div>
                          <span className="text-xs text-gray-500 block">Bilhete de Identidade</span>
                          <span className="font-mono font-bold text-gray-800">{formData.nif}</span>
                      </div>
                  </div>
                  <ShieldCheck className={`w-5 h-5 ${biConfirmed ? 'text-green-600' : 'text-gray-300'}`} />
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-500">Data e Hora:</span>
                  <span className="text-sm text-gray-800 font-mono">{new Date().toLocaleString()}</span>
              </div>
          </div>

          <button 
                onClick={() => handleNextStep('final_payment')}
                disabled={!biConfirmed}
                className={`w-full max-w-sm px-8 py-4 rounded-xl font-bold shadow-xl transition-all flex items-center justify-center ${
                    biConfirmed 
                    ? 'bg-blue-700 text-white hover:bg-blue-800 transform hover:-translate-y-1' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
                <PenTool className="w-5 h-5 mr-3" />
                {biConfirmed ? 'ASSINAR CONTRATO' : 'Confirme o BI acima'}
            </button>
      </div>
  );

  const renderFinalPayment = () => (
      <div className="space-y-6 animate-fadeIn">
           <div className="bg-green-50 p-4 rounded-lg border border-green-100 flex items-center justify-center text-center">
                <ShieldCheck className="w-8 h-8 text-green-600 mr-3 flex-shrink-0" />
                <div>
                    <span className="text-green-900 font-bold block">Contrato Assinado com Sucesso.</span>
                    <span className="text-green-700 text-sm">Realize o pagamento para a conta de garantia (Escrow) abaixo.</span>
                </div>
           </div>
           
           <div className="text-center py-2">
                <h3 className="text-lg font-bold text-gray-600 uppercase tracking-wide">
                    {property.listingType === 'Arrendar' ? 'PAGAR (1º Mês)' : 'SINAL (Entrada)'}
                </h3>
                <p className="text-4xl font-extrabold text-gray-900 my-2">
                    {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: property.currency }).format(finalPaymentValue)}
                </p>
           </div>

            {/* Escrow Payment Details - Visible */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {/* Box 1: Reference */}
                 <div className="bg-white border-2 border-brand-100 p-5 rounded-xl shadow-sm relative overflow-hidden">
                     <div className="absolute top-0 right-0 bg-brand-500 text-white text-[10px] px-2 py-1 rounded-bl-lg font-bold">RECOMENDADO</div>
                     <div className="flex items-center mb-3 text-brand-700">
                         <Hash className="w-5 h-5 mr-2" />
                         <span className="font-bold">Pagamento por Referência</span>
                     </div>
                     <div className="space-y-2 bg-gray-50 p-3 rounded">
                         <div className="flex justify-between text-sm">
                             <span className="text-gray-500">Entidade:</span>
                             <span className="font-mono font-bold">00123</span>
                         </div>
                         <div className="flex justify-between text-sm">
                             <span className="text-gray-500">Referência:</span>
                             <span className="font-mono font-bold text-brand-600">921 442 552</span>
                         </div>
                     </div>
                     <button 
                        onClick={() => simulatePayment('complete')}
                        className="w-full mt-3 bg-brand-500 text-white py-2 rounded font-medium text-sm hover:bg-brand-600"
                     >
                         Confirmar Pagamento
                     </button>
                 </div>

                 {/* Box 2: Bank Transfer */}
                 <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
                     <div className="flex items-center mb-3 text-gray-700">
                         <Landmark className="w-5 h-5 mr-2" />
                         <span className="font-bold">Transferência Bancária</span>
                     </div>
                     <div className="space-y-2">
                         <div>
                             <p className="text-xs text-gray-400">Beneficiário</p>
                             <p className="font-bold text-sm text-gray-800">Arrendaki Custódia Lda</p>
                         </div>
                         <div>
                             <p className="text-xs text-gray-400">IBAN (BAI)</p>
                             <p className="font-mono font-bold text-sm text-gray-800 bg-gray-100 p-2 rounded select-all">
                                 AO06 0040 0000 9214 4255 2015 2
                             </p>
                         </div>
                     </div>
                     <button 
                        onClick={() => simulatePayment('complete')}
                        className="w-full mt-3 border border-gray-300 text-gray-600 py-2 rounded font-medium text-sm hover:bg-gray-50"
                     >
                         Já Transferi (Anexar)
                     </button>
                 </div>
            </div>

            <div className="pt-2 text-center bg-blue-50 p-3 rounded-lg">
                 <p className="text-xs text-blue-700 flex items-center justify-center font-medium">
                    <Lock className="w-3 h-3 mr-1.5" />
                    Custódia de Fundos (Escrow): O seu dinheiro está seguro. O valor fica cativo na conta Arrendaki e só é libertado ao proprietário após a sua confirmação de entrada e entrega das chaves.
                 </p>
            </div>
      </div>
  );

  const renderComplete = () => (
      <div className="text-center py-10 animate-fadeIn">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Parabéns!</h2>
          <p className="text-lg text-gray-600 mb-8">
              O pagamento do {property.listingType === 'Arrendar' ? 'arrendamento' : 'sinal'} foi confirmado e o imóvel está garantido. <br/>
              O proprietário entrará em contacto para a entrega das chaves.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg inline-block text-left mb-8">
               <p className="text-sm text-gray-500 mb-1">Próximos passos:</p>
               <ul className="text-sm text-gray-700 space-y-2">
                   <li className="flex items-center"><CheckCircle className="w-3 h-3 text-green-500 mr-2"/> Recibo enviado para o email</li>
                   <li className="flex items-center"><CheckCircle className="w-3 h-3 text-green-500 mr-2"/> Cópia do contrato disponível no perfil</li>
                   <li className="flex items-center"><CheckCircle className="w-3 h-3 text-green-500 mr-2"/> Notificação enviada ao proprietário</li>
               </ul>
          </div>
          <br/>
          <button 
            onClick={onClose}
            className="bg-brand-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-brand-600 shadow-lg"
          >
              Voltar aos meus imóveis
          </button>
      </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] relative">
        {/* Payment Overlay */}
        {renderPaymentOverlay()}

        {/* Header */}
        <div className="bg-gray-900 text-white p-4 flex justify-between items-center shrink-0">
            <div className="flex items-center space-x-2">
                {property.listingType === 'Arrendar' ? <FileText className="w-5 h-5 text-brand-500"/> : <Building className="w-5 h-5 text-brand-500" />}
                <span className="font-bold text-lg">
                    {step === 'complete' ? 'Concluído' : property.listingType === 'Arrendar' ? 'Processo de Arrendamento' : 'Processo de Compra'}
                </span>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
            </button>
        </div>

        {/* Progress Bar */}
        {step !== 'complete' && (
            <div className="bg-gray-100 h-1.5 w-full">
                <div 
                    className="bg-brand-500 h-full transition-all duration-500"
                    style={{ 
                        width: step === 'form' ? '20%' : 
                               step === 'fee_payment' ? '40%' : 
                               step === 'contract_generation' ? '60%' : 
                               step === 'signature' ? '80%' : '100%' 
                    }}
                ></div>
            </div>
        )}

        {/* Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-grow relative">
            {step === 'form' && renderForm()}
            {step === 'fee_payment' && renderFeePayment()}
            {step === 'contract_generation' && renderContract()}
            {step === 'signature' && renderSignature()}
            {step === 'final_payment' && renderFinalPayment()}
            {step === 'complete' && renderComplete()}
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;
