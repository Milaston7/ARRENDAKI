
import React, { useEffect, useState } from 'react';
import { Home, ShieldCheck, Download, Printer, X, QrCode, ExternalLink, CheckCircle } from 'lucide-react';
import { User, Property } from '../types';
import Logo from './Logo';

export type DocumentType = 'contract' | 'invoice' | 'receipt';

interface DocumentTemplateProps {
  type: DocumentType;
  data: {
    id: string; // Contract ID, Invoice Number, or Receipt Number
    date: string;
    user: User; // The logged in user viewing it
    partyB?: User; // The other party (for contracts)
    property?: Property;
    transactionDetails?: {
      amount: number;
      currency: string;
      description: string;
      reference?: string;
      method?: string;
    };
    contractContent?: string; // Raw text for contract overrides
  };
  onClose: () => void;
}

const DocumentTemplate: React.FC<DocumentTemplateProps> = ({ type, data, onClose }) => {
  const { id, date, user, property, transactionDetails, contractContent } = data;
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Simulate loading/rendering time
    setTimeout(() => setIsReady(true), 500);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real environment, this would fetch a Blob from the backend.
    // Here, we trigger the browser's print-to-pdf dialog.
    window.print();
  };

  const handleOpenNewTab = () => {
    // Simulates opening in new tab (In a real app, this would be a route like /documents/:id)
    const newWindow = window.open('', '_blank');
    if (newWindow) {
        newWindow.document.write(`<html><head><title>${type.toUpperCase()} - ${id}</title></head><body><h1>Documento em Processamento...</h1><p>Esta funcionalidade requer backend real.</p></body></html>`);
    }
  };

  // --- BRANDING HEADER ---
  const Header = () => (
    <div className="flex justify-between items-start border-b-4 border-brand-500 pb-6 mb-8">
      <div className="flex items-center">
        {/* New Logo Implementation */}
        <Logo className="h-16 w-auto mr-4" />
        
        <div className="pl-4 border-l border-gray-200">
          <div className="flex items-center text-xs text-brand-700 font-bold uppercase tracking-wide bg-brand-50 px-2 py-1 rounded">
             <ShieldCheck className="w-3 h-3 mr-1" /> Imobiliária Segura & Verificada
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Licença AMI: 1234/ANG</p>
        </div>
      </div>
      <div className="text-right">
        <h2 className="text-2xl font-black text-gray-800 uppercase tracking-wide">
          {type === 'contract' ? 'Contrato Kiá' : type === 'invoice' ? 'Fatura' : 'Recibo'}
        </h2>
        <p className="text-sm text-gray-500 font-mono mt-1">Nº {id}</p>
        <p className="text-sm text-gray-600 font-medium">Emissão: {new Date(date).toLocaleDateString('pt-AO')}</p>
      </div>
    </div>
  );

  // --- BRANDING FOOTER (Nexus One) ---
  const Footer = () => (
    <div className="mt-auto pt-8 border-t-2 border-gray-100">
      <div className="flex justify-between items-end">
        <div className="text-[10px] text-gray-500 leading-relaxed">
          <p className="font-bold text-gray-700 uppercase mb-1">Desenvolvido e Gerido por:</p>
          <p className="font-bold">Nexus One - Desenvolvimento e Projeto, Lda</p>
          <p>NIF: 5001234567</p>
          <p>Localização: Luanda, Benguela Angola</p>
          <p className="text-brand-600 font-medium mt-1">www.nexusone.ao • suporte@arrendaki.ao</p>
        </div>
        <div className="flex flex-col items-end">
           <div className="mb-2 bg-white p-1 border border-gray-200">
               <QrCode className="w-14 h-14 text-gray-900" />
           </div>
           <p className="text-[9px] text-gray-400 font-mono text-right uppercase">
             Processado por Arrendaki System.<br/>
             Valide a autenticidade com este código.
           </p>
        </div>
      </div>
      <div className="w-full bg-gradient-to-r from-brand-500 to-green-600 h-1.5 mt-4 rounded-full"></div>
    </div>
  );

  // --- CONTENT RENDERERS ---

  const renderInvoice = () => {
    const amount = transactionDetails?.amount || 0;
    const currency = transactionDetails?.currency || 'AOA';
    const ivaRate = 0.14; // 14%
    // Assuming the passed amount is the BASE amount for service fees, or Total depending on logic.
    // For this example, we treat 'amount' as Base and add Tax.
    const ivaAmount = amount * ivaRate;
    const totalAmount = amount + ivaAmount;

    return (
      <div className="space-y-8 font-sans">
        {/* Entities */}
        <div className="grid grid-cols-2 gap-12">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Dados do Emitente</h3>
            <p className="font-bold text-gray-800 text-sm">Nexus One - Desenvolvimento e Projeto, Lda</p>
            <p className="text-xs text-gray-600">NIF: 5001234567</p>
            <p className="text-xs text-gray-600">Luanda, Angola</p>
          </div>
          <div className="p-4 rounded-lg border border-gray-200">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Dados do Cliente</h3>
            <p className="font-bold text-gray-800 text-sm">{user.name}</p>
            <p className="text-xs text-gray-600">NIF/BI: {user.bi || 'Consumidor Final'}</p>
            <p className="text-xs text-gray-600">{user.address?.province || 'Angola'}</p>
          </div>
        </div>

        {/* Invoice Table */}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-y border-gray-200">
              <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase">Descrição do Serviço</th>
              <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase text-right">Taxa IVA</th>
              <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase text-right">Valor Base</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-4 px-4 text-sm text-gray-800">
                {transactionDetails?.description || 'Serviço de Transação Garantida - Kiá Verify'}
                <br/><span className="text-xs text-gray-500 italic">Ref. Pagamento: {transactionDetails?.reference} ({transactionDetails?.method})</span>
              </td>
              <td className="py-4 px-4 text-sm text-gray-800 text-right">14%</td>
              <td className="py-4 px-4 text-sm text-gray-800 font-bold text-right">
                {new Intl.NumberFormat('pt-AO', { style: 'currency', currency }).format(amount)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-1/2 md:w-1/3 space-y-3 bg-gray-50 p-6 rounded-xl border border-gray-200">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Total Ilíquido</span>
              <span>{new Intl.NumberFormat('pt-AO', { style: 'currency', currency }).format(amount)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Total IVA (14%)</span>
              <span>{new Intl.NumberFormat('pt-AO', { style: 'currency', currency }).format(ivaAmount)}</span>
            </div>
            <div className="w-full h-px bg-gray-300 my-2"></div>
            <div className="flex justify-between text-lg font-black text-gray-900">
              <span>TOTAL A PAGAR</span>
              <span className="text-brand-600">{new Intl.NumberFormat('pt-AO', { style: 'currency', currency }).format(totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderReceipt = () => (
    <div className="space-y-8 font-sans">
       <div className="bg-green-50 border-2 border-green-100 p-8 rounded-xl text-center shadow-sm">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
             <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-green-800 font-black text-2xl mb-2 tracking-tight">PAGAMENTO RECEBIDO</h3>
          <p className="text-green-700 text-sm font-medium">Este documento serve como quitação oficial da transação.</p>
       </div>

       <div className="space-y-6 text-gray-700 text-sm border-t border-b border-gray-100 py-8">
          <div className="grid grid-cols-3 gap-4 items-center">
             <span className="font-bold text-gray-500 uppercase text-xs">Recebemos de</span>
             <span className="col-span-2 font-medium border-b border-gray-200 pb-1">{user.name} (NIF: {user.bi})</span>
          </div>
          <div className="grid grid-cols-3 gap-4 items-center">
             <span className="font-bold text-gray-500 uppercase text-xs">A Importância de</span>
             <span className="col-span-2 font-mono font-bold text-lg bg-gray-50 px-3 py-2 rounded text-brand-700">
                {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: transactionDetails?.currency || 'AOA' }).format(transactionDetails?.amount || 0)}
             </span>
          </div>
          <div className="grid grid-cols-3 gap-4 items-center">
             <span className="font-bold text-gray-500 uppercase text-xs">Referente a</span>
             <span className="col-span-2 font-medium border-b border-gray-200 pb-1">{transactionDetails?.description}</span>
          </div>
          <div className="grid grid-cols-3 gap-4 items-center">
             <span className="font-bold text-gray-500 uppercase text-xs">Método / Ref</span>
             <span className="col-span-2 font-medium border-b border-gray-200 pb-1">{transactionDetails?.method} | REF: {transactionDetails?.reference}</span>
          </div>
       </div>

       <div className="bg-gray-50 p-4 rounded text-xs text-gray-500 text-center italic">
           O valor mencionado encontra-se livre de impostos adicionais, tendo sido processada a respetiva fatura fiscal anteriormente.
       </div>

       <div className="pt-8 flex justify-center">
          <div className="text-center">
             <div className="font-script text-4xl text-brand-700 mb-2 transform -rotate-3">Nexus One Finance</div>
             <div className="border-t border-gray-300 w-64 mx-auto pt-2 text-[10px] text-gray-400 uppercase font-bold tracking-widest">Assinatura Autorizada</div>
          </div>
       </div>
    </div>
  );

  const renderContract = () => {
    // Fallback standard clauses if AI generation wasn't stored/passed
    const standardClauses = `
CLÁUSULA 1ª (OBJETO)
O PRIMEIRO OUTORGANTE é dono e legítimo proprietário da fração autónoma designada por "${property?.title}", sita em ${property?.location.address}, ${property?.location.municipality}, ${property?.location.province}.

CLÁUSULA 2ª (DURAÇÃO)
O presente contrato tem a duração de 12 (doze) meses, com início em ${new Date(date).toLocaleDateString()} e termo em ${new Date(new Date(date).setFullYear(new Date(date).getFullYear() + 1)).toLocaleDateString()}.

CLÁUSULA 3ª (RENDA/PREÇO)
1. A renda/preço acordada é de ${new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(transactionDetails?.amount || 0)}.
2. O pagamento será efetuado até ao dia 8 de cada mês através de transferência bancária.

CLÁUSULA 4ª (FINALIDADE)
O imóvel destina-se exclusivamente a habitação própria do SEGUNDO OUTORGANTE, não lhe podendo ser dado outro uso sem autorização escrita do PRIMEIRO OUTORGANTE.

CLÁUSULA 5ª (CONSERVAÇÃO)
O SEGUNDO OUTORGANTE reconhece que recebe o imóvel em bom estado de conservação, obrigando-se a mantê-lo no mesmo estado.

CLÁUSULA 6ª (OBRAS)
Não poderão ser realizadas quaisquer obras de alteração na estrutura ou divisões do imóvel sem consentimento prévio e escrito.

CLÁUSULA 7ª (DESPESAS)
Todas as despesas de consumo corrente (água, energia, comunicações) são da exclusiva responsabilidade do SEGUNDO OUTORGANTE.

CLÁUSULA 8ª (CAUÇÃO)
Como garantia do cumprimento das obrigações, é prestada uma caução no valor de um mês de renda.

CLÁUSULA 9ª (RESOLUÇÃO)
O incumprimento de qualquer cláusula deste contrato confere à outra parte o direito de o resolver nos termos da lei.

CLÁUSULA 10ª (FORO)
Para dirimir quaisquer litígios emergentes deste contrato, as partes elegem o foro da Comarca de ${property?.location.province}, com expressa renúncia a qualquer outro.
    `;

    return (
      <div className="space-y-8 text-justify text-xs sm:text-sm leading-relaxed font-serif text-gray-800">
         <div className="text-center mb-8 bg-gray-50 py-4 border-y border-gray-200">
            <h2 className="text-xl font-bold uppercase tracking-widest text-gray-900">
               Contrato de {property?.listingType === 'Arrendar' ? 'Arrendamento Urbano' : 'Promessa de Compra e Venda'}
            </h2>
            <p className="font-bold text-brand-600 mt-1">ID TRANSAÇÃO: {id}</p>
         </div>

         <div className="space-y-4">
             <p>
               <strong>ENTRE:</strong>
             </p>
             <p>
               <strong>1. PRIMEIRO OUTORGANTE (Proprietário):</strong><br/>
               ID Sistema: {property?.ownerId} (Dados completos em arquivo seguro Arrendaki), doravante designado por "Senhorio/Vendedor".
             </p>
             <p>
               <strong>2. SEGUNDO OUTORGANTE (Cliente):</strong><br/>
               <strong>{user.name}</strong>, portador do BI nº <strong>{user.bi}</strong>, residente em {user.address?.street || 'Morada não especificada'}, {user.address?.municipality}, doravante designado por "Inquilino/Comprador".
             </p>
             <p className="mt-4">
               É celebrado o presente Contrato, que se rege pelas seguintes cláusulas:
             </p>
         </div>
         
         <div className="pl-4 md:pl-8 border-l-4 border-gray-200 my-6 space-y-6">
            <div className="whitespace-pre-wrap font-medium text-gray-700">
                {contractContent || standardClauses}
            </div>
         </div>

         <div className="mt-16 pt-8 border-t border-gray-300">
            <p className="text-center mb-12 italic text-gray-500">Celebrado digitalmente através da plataforma Arrendaki em {new Date(date).toLocaleDateString()}.</p>
            
            <div className="grid grid-cols-2 gap-12 md:gap-24">
                <div className="text-center">
                   <div className="mb-4 h-20 flex items-end justify-center relative">
                      <div className="absolute inset-0 border-b border-gray-400"></div>
                      {/* Simulated Digital Signature */}
                      <span className="font-script text-3xl text-blue-900 z-10 bg-white px-2 mb-2 transform -rotate-2">Sign_{property?.ownerId}</span>
                   </div>
                   <div className="font-bold text-xs uppercase tracking-wider">Primeiro Outorgante</div>
                   <div className="text-[9px] text-gray-500 mt-1">Assinado digitalmente via Kiá Verify</div>
                </div>
                <div className="text-center">
                   <div className="mb-4 h-20 flex items-end justify-center relative">
                      <div className="absolute inset-0 border-b border-gray-400"></div>
                      {/* User Signature */}
                      <span className="font-script text-3xl text-blue-900 z-10 bg-white px-2 mb-2 transform rotate-1">{user.name.split(' ')[0]}_Sig</span>
                   </div>
                   <div className="font-bold text-xs uppercase tracking-wider">Segundo Outorgante</div>
                   <div className="text-[9px] text-gray-500 mt-1">Assinado digitalmente em {new Date(date).toLocaleString()}</div>
                </div>
             </div>
         </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4 overflow-y-auto print:bg-white print:p-0 print:static print:block">
      <div className="bg-white w-full md:max-w-[210mm] min-h-screen md:min-h-[297mm] shadow-2xl relative flex flex-col print:shadow-none print:w-full print:max-w-none print:h-auto">
        
        {/* Floating Actions (Hidden on Print) - ADJUSTED FOR TABLET */}
        {/* Changed md:absolute to lg:absolute to keep sticky behavior on tablets (md) */}
        <div className="sticky top-0 left-0 right-0 bg-white/90 backdrop-blur border-b border-gray-200 p-3 flex justify-between items-center print:hidden z-50 lg:absolute lg:top-4 lg:right-4 lg:bg-transparent lg:border-none lg:justify-end lg:space-x-2 lg:p-0">
           <span className="lg:hidden font-bold text-gray-700">Visualizar Documento</span>
           <div className="flex space-x-2">
               <button 
                 onClick={handlePrint}
                 className="bg-gray-100 text-gray-700 p-2 rounded-full hover:bg-gray-200 transition-colors shadow-sm border border-gray-200"
                 title="Imprimir"
               >
                 <Printer className="w-5 h-5" />
               </button>
               <button 
                 onClick={handleOpenNewTab}
                 className="bg-gray-100 text-gray-700 p-2 rounded-full hover:bg-gray-200 transition-colors shadow-sm border border-gray-200"
                 title="Abrir em Novo Separador"
               >
                 <ExternalLink className="w-5 h-5" />
               </button>
               <button 
                 onClick={handleDownload}
                 className="bg-brand-500 text-white px-4 py-2 rounded-full hover:bg-brand-600 transition-colors shadow-sm flex items-center font-bold text-xs"
                 title="Baixar PDF"
               >
                 <Download className="w-4 h-4 mr-2" /> Baixar PDF
               </button>
               <button 
                 onClick={onClose}
                 className="bg-gray-800 text-white p-2 rounded-full hover:bg-gray-900 transition-colors shadow-sm"
                 title="Fechar"
               >
                 <X className="w-5 h-5" />
               </button>
           </div>
        </div>

        {/* Paper Content - Adjusted margin for tablet */}
        {/* Changed md:mt-0 to lg:mt-0 to account for sticky header on tablets */}
        <div className="p-8 md:p-16 flex-1 flex flex-col h-full relative mt-0 md:mt-0 lg:mt-0">
           {/* Watermark */}
           <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none overflow-hidden print:opacity-[0.05]">
                <Logo className="w-96 h-96 opacity-20" variant="icon" />
           </div>

           {isReady ? (
               <div className="animate-fadeIn flex flex-col h-full">
                   <Header />
                   
                   <div className="flex-1 relative z-10 mb-12">
                      {type === 'invoice' && renderInvoice()}
                      {type === 'receipt' && renderReceipt()}
                      {type === 'contract' && renderContract()}
                   </div>

                   <Footer />
               </div>
           ) : (
               <div className="flex items-center justify-center h-full">
                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
               </div>
           )}
        </div>
      </div>
      
      {/* Print Styles */}
      <style>{`
        @media print {
          @page { size: A4; margin: 1cm; }
          body { background-color: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:w-full { max-width: 100% !important; width: 100% !important; margin: 0 !important; }
          .print\\:block { display: block !important; }
          .print\\:opacity-\\[0\\.05\\] { opacity: 0.05 !important; }
        }
        .font-script { font-family: 'Brush Script MT', cursive; }
      `}</style>
    </div>
  );
};

export default DocumentTemplate;
