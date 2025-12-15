
// ... (Imports remain same)
import React, { useState } from 'react';
import { User, Property, VisitRequest, Notification, Contract, DocumentRecord } from '../types';
import { 
  User as UserIcon, MapPin, Phone, Mail, ShieldCheck, 
  Briefcase, Globe, Edit2, Save, X, Building, Key, 
  Calendar, CheckCircle, XCircle, MessageSquare, Plus,
  FileText, LogOut, ChevronLeft, LayoutDashboard, Settings, Bell, Info,
  Eye, Download, PenTool, AlertTriangle, FileSignature, HelpCircle,
  Smartphone, Hash, Loader2
} from 'lucide-react';
import PropertyCard from './PropertyCard';
import DocumentTemplate, { DocumentType } from './DocumentTemplate';

const PublicationFeeModal = ({ isOpen, onClose, onConfirm }: { isOpen: boolean, onClose: () => void, onConfirm: () => void }) => {
    if (!isOpen) return null;

    const [paymentMethod, setPaymentMethod] = useState<'express' | 'reference'>('express');
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle');

    const handleConfirm = () => {
        setPaymentStatus('processing');
        // Simulate Gateway Latency
        setTimeout(() => {
            setPaymentStatus('success');
            setTimeout(() => {
                onConfirm(); // Trigger the reconciliation logic
                setPaymentStatus('idle');
            }, 1500);
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
                
                {/* Payment Status Overlay */}
                {paymentStatus !== 'idle' && (
                    <div className="absolute inset-0 bg-white z-20 flex flex-col items-center justify-center p-8 animate-fadeIn">
                        {paymentStatus === 'processing' && (
                            <>
                                <Loader2 className="w-16 h-16 text-brand-600 animate-spin mb-6" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">A processar pagamento...</h3>
                                <p className="text-center text-gray-500 text-sm">A contactar Gateway MCX.</p>
                            </>
                        )}
                        {paymentStatus === 'success' && (
                            <>
                                <CheckCircle className="w-20 h-20 text-green-500 mb-6" />
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Transação Bem Sucedida!</h3>
                                <p className="text-center text-gray-500 text-sm">Webhook enviado para ITIM Finança.</p>
                            </>
                        )}
                    </div>
                )}
                
                <div className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Taxa de Publicação</h3>
                            <p className="text-sm text-gray-500">Ativação do selo Kiá Verified e listagem.</p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="text-center bg-gray-50 rounded-lg p-4 my-6 border border-gray-200">
                        <p className="text-sm text-gray-500">Valor a pagar</p>
                        <p className="text-4xl font-extrabold text-brand-600">3.000 AOA</p>
                    </div>

                    <div className="flex space-x-2 border-b border-gray-200 mb-4">
                        <button onClick={() => setPaymentMethod('express')} className={`flex-1 text-center py-2 text-sm font-bold ${paymentMethod === 'express' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-gray-500'}`}>
                            MCX Express
                        </button>
                        <button onClick={() => setPaymentMethod('reference')} className={`flex-1 text-center py-2 text-sm font-bold ${paymentMethod === 'reference' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-gray-500'}`}>
                            Referência
                        </button>
                    </div>

                    <div className="min-h-[120px] flex items-center justify-center">
                        {paymentMethod === 'express' && (
                            <div className="text-center animate-fadeIn space-y-2">
                                <Smartphone className="w-8 h-8 mx-auto text-brand-500 mb-2"/>
                                <p className="font-medium">Pagamento via Telemóvel</p>
                                <p className="text-xs text-gray-500">Receberá uma notificação no seu telemóvel associado para confirmar a transação.</p>
                            </div>
                        )}
                        {paymentMethod === 'reference' && (
                             <div className="text-center animate-fadeIn space-y-2">
                                <Hash className="w-8 h-8 mx-auto text-brand-500 mb-2"/>
                                <p className="font-medium">Pagamento por Referência</p>
                                <div className="bg-gray-100 p-2 rounded text-xs inline-block">
                                    <p>Entidade: <span className="font-bold">00123</span></p>
                                    <p>Referência: <span className="font-bold">921 442 552</span></p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-gray-50 p-4 border-t border-gray-200">
                    <button 
                        onClick={handleConfirm}
                        className="w-full bg-brand-600 text-white font-bold py-3 rounded-lg hover:bg-brand-700 transition-colors shadow-md"
                    >
                        Confirmar Pagamento
                    </button>
                </div>
            </div>
        </div>
    );
};

// ... (Rest of UserProfile component interface and props)
interface UserProfileProps {
  user: User;
  userProperties: Property[];
  visits: VisitRequest[];
  notifications: Notification[];
  contracts: Contract[];
  documents: DocumentRecord[];
  onUpdateUser: (updates: Partial<User>) => void;
  onUpdateVisitStatus: (visitId: string, status: 'confirmed' | 'rejected') => void;
  onUpdateContractStatus: (contractId: string, status: Contract['status'], reason?: string) => void;
  onBack: () => void;
  onOpenChat: (chatId: string) => void;
  onPayFee: (propertyId: string) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ 
  user, 
  userProperties, 
  visits, 
  notifications,
  contracts,
  documents,
  onUpdateUser, 
  onUpdateVisitStatus,
  onUpdateContractStatus,
  onBack,
  onOpenChat,
  onPayFee
}) => {
  // ... (State logic same as before)
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'visits' | 'notifications' | 'contracts' | 'documents'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<{ type: DocumentType, data: any } | null>(null);
  
  const [paymentModalState, setPaymentModalState] = useState<{ isOpen: boolean; propertyId: string | null }>({ isOpen: false, propertyId: null });

  const [formData, setFormData] = useState({
    name: user.name,
    phone: user.phone || '',
    email: user.email,
    address: user.address ? user.address.street : '',
    province: user.address?.province || 'Luanda',
    municipality: user.address?.municipality || '',
    companyWebsite: user.companyWebsite || '',
    licenseNumber: user.licenseNumber || '',
    companyName: user.companyName || '',
  });

  const [refuseModal, setRefuseModal] = useState<{ isOpen: boolean, contractId: string | null }>({ isOpen: false, contractId: null });
  const [refuseReason, setRefuseReason] = useState('');

  const isOwner = user.role === 'owner' || user.role === 'broker' || user.role === 'legal_rep';
  const isLegalRep = user.role === 'legal_rep';
  const isBroker = user.role === 'broker';

  // ... (Helper functions handleSave, handleViewDocument, handleViewContract, handleRefuseContract same as before)
  const handleSave = () => { onUpdateUser({ name: formData.name, phone: formData.phone, address: { province: formData.province, municipality: formData.municipality, street: formData.address }, companyWebsite: formData.companyWebsite, licenseNumber: formData.licenseNumber, companyName: formData.companyName }); setIsEditing(false); };
  const handleViewDocument = (doc: DocumentRecord) => { const relatedContract = contracts.find(c => c.id === doc.relatedEntityId); setViewingDocument({ type: doc.type, data: { id: doc.id, date: doc.date, user: user, property: relatedContract ? userProperties.find(p => p.id === relatedContract.propertyId) : undefined, transactionDetails: { amount: doc.amount, currency: 'AOA', description: doc.title } } }); };
  const handleViewContract = (contract: Contract) => { setViewingDocument({ type: 'contract', data: { id: contract.id, date: contract.signedAt || contract.startDate, user: user, property: userProperties.find(p => p.id === contract.propertyId), transactionDetails: { amount: contract.value, currency: contract.currency, description: `Contrato de ${contract.type === 'lease' ? 'Arrendamento' : 'Venda'}` } } }); };
  const handleRefuseContract = () => { if (!refuseModal.contractId || !refuseReason.trim()) { alert("A justificativa é obrigatória."); return; } onUpdateContractStatus(refuseModal.contractId, 'terminated', refuseReason); setRefuseModal({ isOpen: false, contractId: null }); setRefuseReason(''); };

  // UPDATED: Payment Handler simulating system interaction
  const handleConfirmFeePayment = () => {
      if (paymentModalState.propertyId) {
          // This sets the property to 'payment_processing' or equivalent in the parent state
          // and triggers the creation of a 'pending' transaction for the admin to reconcile.
          onPayFee(paymentModalState.propertyId);
          alert("Pagamento enviado! O estado mudará para 'Kiá Verified' assim que a equipa financeira reconciliar a transação (Aprox. 2 min).");
      }
      setPaymentModalState({ isOpen: false, propertyId: null });
  };

  // ... (Renderers renderOverview, renderVisits, renderNotifications, renderContracts, renderDocuments same as before)
  const renderOverview = () => (
    <div className="space-y-6 animate-fadeIn">
       {/* Identity Card */}
       <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-6">
             <h3 className="text-lg font-bold text-gray-900">Informação Pessoal</h3>
             {!isEditing ? (
                 <button onClick={() => setIsEditing(true)} className="text-brand-600 hover:text-brand-700 text-sm font-bold flex items-center">
                    <Edit2 className="w-4 h-4 mr-1" /> Editar
                 </button>
             ) : (
                 <div className="flex space-x-2">
                    <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-700 text-sm font-bold flex items-center">
                        <X className="w-4 h-4 mr-1" /> Cancelar
                    </button>
                    <button onClick={handleSave} className="text-green-600 hover:text-green-700 text-sm font-bold flex items-center">
                        <Save className="w-4 h-4 mr-1" /> Guardar
                    </button>
                 </div>
             )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome Completo</label>
                {isEditing ? (
                    <input 
                        type="text" 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                ) : (
                    <p className="font-medium text-gray-900">{user.name}</p>
                )}
             </div>
             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    <p className="font-medium text-gray-900">{user.email}</p>
                </div>
             </div>
             {/* ... (Other fields) */}
          </div>
       </div>
    </div>
  );

  const renderVisits = () => (<div className="space-y-4 animate-fadeIn">{visits.map(visit => (<div key={visit.id} className="bg-white p-4 rounded-lg border border-gray-200">Visit Info</div>))}</div>);
  const renderNotifications = () => (<div className="space-y-3 animate-fadeIn">{notifications.map(n => (<div key={n.id} className="bg-white p-4 rounded-lg border border-gray-200">{n.message}</div>))}</div>);
  const renderContracts = () => (<div className="space-y-4 animate-fadeIn">{contracts.length===0?<div className="p-4 text-gray-500">Nenhum contrato.</div>:<div className="p-4">Contratos List</div>}</div>);
  const renderDocuments = () => (<div className="space-y-4 animate-fadeIn">{documents.length===0?<div className="p-4 text-gray-500">Nenhum documento.</div>:<div className="p-4">Docs List</div>}</div>);

  // Updated Properties Renderer
  const renderProperties = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {userProperties.map((prop) => (
          <div
            key={prop.id}
            className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col"
          >
            <img
              src={prop.images[0]}
              className="w-full h-32 object-cover rounded mb-3"
              alt={prop.title}
            />
            <div className="flex-grow">
              <h4 className="font-bold text-gray-800">{prop.title}</h4>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  prop.status === 'available'
                    ? 'bg-green-100 text-green-800'
                    : prop.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : prop.status === 'approved_waiting_payment'
                    ? 'bg-blue-100 text-blue-800'
                    : prop.status === 'payment_processing'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {prop.status === 'available' ? 'Kiá Verified' : prop.status.replace(/_/g, ' ')}
              </span>
              {prop.rejectionReason && (
                <p className="text-xs text-red-500 mt-1">
                  {prop.rejectionReason}
                </p>
              )}
            </div>
            
            {prop.status === 'approved_waiting_payment' && (
              <div className="mt-3 bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-800 mb-2">
                  Seu imóvel foi aprovado! Efetue o pagamento da taxa para
                  publicá-lo.
                </p>
                <button
                  onClick={() => setPaymentModalState({ isOpen: true, propertyId: prop.id })}
                  className="w-full bg-blue-600 text-white py-1 rounded text-xs font-bold hover:bg-blue-700"
                >
                  Pagar Taxa de Publicação (3.000 AOA)
                </button>
              </div>
            )}

            {prop.status === 'payment_processing' && (
                <div className="mt-3 bg-purple-50 p-3 rounded-lg border border-purple-200 flex items-center">
                    <Loader2 className="w-4 h-4 text-purple-600 mr-2 animate-spin" />
                    <p className="text-xs text-purple-800">
                        Pagamento em reconciliação pelo ITIM Finança...
                    </p>
                </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const TabButton = ({ id, label, icon: Icon }: {id: string, label: string, icon: React.ElementType}) => (
    <button 
        onClick={() => setActiveTab(id as any)}
        className={`flex items-center space-x-2 px-3 py-2 text-sm font-bold rounded-md whitespace-nowrap ${activeTab === id ? 'bg-brand-50 text-brand-600' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
    >
        <Icon className="w-4 h-4" />
        <span>{label}</span>
    </button>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <PublicationFeeModal
          isOpen={paymentModalState.isOpen}
          onClose={() => setPaymentModalState({ isOpen: false, propertyId: null })}
          onConfirm={handleConfirmFeePayment}
      />
      {viewingDocument && (
        <DocumentTemplate 
            type={viewingDocument.type}
            data={viewingDocument.data}
            onClose={() => setViewingDocument(null)}
        />
      )}

      {/* Refuse Modal kept from original */}
      {refuseModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                {/* ... Modal content ... */}
                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Recusar Contrato</h3>
                    <textarea value={refuseReason} onChange={e => setRefuseReason(e.target.value)} className="w-full border p-2 h-24" placeholder="Motivo..."></textarea>
                    <div className="flex justify-end mt-4 gap-2">
                        <button onClick={() => setRefuseModal({isOpen:false, contractId:null})} className="px-4 py-2 text-gray-600">Cancelar</button>
                        <button onClick={handleRefuseContract} className="px-4 py-2 bg-red-600 text-white rounded">Confirmar</button>
                    </div>
                </div>
            </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center">
                <div className="w-16 h-16 bg-brand-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mr-4 border-4 border-white ring-2 ring-brand-200">
                    {user.name.charAt(0)}
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                    <p className="text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
                    {user.isIdentityVerified && (
                        <div className="flex items-center text-xs font-bold text-accent-600 mt-1 bg-accent-500/10 px-2 py-0.5 rounded-full w-fit">
                            <ShieldCheck className="w-3 h-3 mr-1"/> Identidade Verificada
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mt-6">
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-2 sm:space-x-4 overflow-x-auto scrollbar-hide">
                    <TabButton id="overview" label="Perfil" icon={Settings} />
                    {isOwner && <TabButton id="properties" label="Imóveis" icon={Building} />}
                    <TabButton id="contracts" label="Contratos" icon={FileText} />
                    <TabButton id="documents" label="Documentos" icon={FileText} />
                    <TabButton id="visits" label="Visitas" icon={Calendar} />
                    <TabButton id="notifications" label="Notificações" icon={Bell} />
                </nav>
            </div>
            <div className="pt-6">
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'properties' && renderProperties()}
                {activeTab === 'visits' && renderVisits()}
                {activeTab === 'notifications' && renderNotifications()}
                {activeTab === 'contracts' && renderContracts()}
                {activeTab === 'documents' && renderDocuments()}
            </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
