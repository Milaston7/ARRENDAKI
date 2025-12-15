
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
        setTimeout(() => {
            setPaymentStatus('success');
            setTimeout(() => {
                onConfirm();
                // Reset state for next use
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
                                <p className="text-center text-gray-500 text-sm">Aguarde a confirmação da rede. Não feche esta janela.</p>
                            </>
                        )}
                        {paymentStatus === 'success' && (
                            <>
                                <CheckCircle className="w-20 h-20 text-green-500 mb-6" />
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Pagamento Confirmado!</h3>
                                <p className="text-center text-gray-500 text-sm">O seu anúncio será publicado em instantes.</p>
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

  const handleSave = () => {
    onUpdateUser({
      name: formData.name,
      phone: formData.phone,
      address: {
        province: formData.province,
        municipality: formData.municipality,
        street: formData.address
      },
      companyWebsite: formData.companyWebsite,
      licenseNumber: formData.licenseNumber,
      companyName: formData.companyName
    });
    setIsEditing(false);
  };
  
  const handleViewDocument = (doc: DocumentRecord) => {
    const relatedContract = contracts.find(c => c.id === doc.relatedEntityId);
    
    setViewingDocument({
        type: doc.type,
        data: {
            id: doc.id,
            date: doc.date,
            user: user,
            property: relatedContract ? userProperties.find(p => p.id === relatedContract.propertyId) : undefined,
            transactionDetails: {
                amount: doc.amount,
                currency: 'AOA',
                description: doc.title
            }
        }
    });
  };

  const handleViewContract = (contract: Contract) => {
     setViewingDocument({
        type: 'contract',
        data: {
            id: contract.id,
            date: contract.signedAt || contract.startDate,
            user: user,
            property: userProperties.find(p => p.id === contract.propertyId),
            transactionDetails: {
                amount: contract.value,
                currency: contract.currency,
                description: `Contrato de ${contract.type === 'lease' ? 'Arrendamento' : 'Venda'}`
            }
        }
     });
  };

  const handleRefuseContract = () => {
    if (!refuseModal.contractId || !refuseReason.trim()) {
        alert("A justificativa é obrigatória para recusar o contrato.");
        return;
    }
    onUpdateContractStatus(refuseModal.contractId, 'terminated', refuseReason);
    setRefuseModal({ isOpen: false, contractId: null });
    setRefuseReason('');
  };

  const handleConfirmFeePayment = () => {
      if (paymentModalState.propertyId) {
          onPayFee(paymentModalState.propertyId);
      }
      setPaymentModalState({ isOpen: false, propertyId: null });
  };


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

             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Telefone</label>
                 <div className="flex items-center">
                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                    {isEditing ? (
                        <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-2 border border-gray-300 rounded" />
                    ) : (
                        <p className="font-medium text-gray-900">{user.phone}</p>
                    )}
                 </div>
             </div>

             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Endereço</label>
                 <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                    {isEditing ? (
                        <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-2 border border-gray-300 rounded" />
                    ) : (
                        <p className="font-medium text-gray-900">{user.address?.street}</p>
                    )}
                 </div>
             </div>
          </div>
       </div>

       {isBroker && (
         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
             <h3 className="text-lg font-bold text-gray-900 mb-4">Dados Profissionais (Corretor)</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nº Licença / Carteira</label>
                   <div className="flex items-center">
                      <Briefcase className="w-4 h-4 text-gray-400 mr-2" />
                      {isEditing ? (
                          <input type="text" value={formData.licenseNumber} onChange={e => setFormData({...formData, licenseNumber: e.target.value})} className="w-full p-2 border border-gray-300 rounded" />
                      ) : (
                          <p className="font-medium text-gray-900">{user.licenseNumber}</p>
                      )}
                   </div>
                </div>
                 <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Website</label>
                   <div className="flex items-center">
                      <Globe className="w-4 h-4 text-gray-400 mr-2" />
                      {isEditing ? (
                          <input type="text" value={formData.companyWebsite} onChange={e => setFormData({...formData, companyWebsite: e.target.value})} className="w-full p-2 border border-gray-300 rounded" />
                      ) : (
                          <a href={user.companyWebsite} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-600 hover:underline">{user.companyWebsite}</a>
                      )}
                   </div>
                </div>
             </div>
         </div>
       )}
    </div>
  );

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
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {prop.status.replace(/_/g, ' ')}
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
          </div>
        ))}
      </div>
    </div>
  );

  const renderVisits = () => (
    <div className="space-y-4 animate-fadeIn">
        {visits.map(visit => (
            <div key={visit.id} className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col sm:flex-row justify-between sm:items-center">
                <div>
                    <p className="font-bold text-gray-800">{visit.propertyTitle}</p>
                    <p className="text-sm text-gray-500">
                        {new Date(visit.date).toLocaleDateString()} às {visit.time}
                    </p>
                </div>
                 <div className="flex space-x-2 mt-4 sm:mt-0">
                    {visit.status === 'pending' && isOwner && (
                        <>
                            <button onClick={() => onUpdateVisitStatus(visit.id, 'rejected')} className="bg-red-500 text-white px-3 py-1 rounded text-xs font-bold"><XCircle className="w-4 h-4 inline mr-1"/> Rejeitar</button>
                            <button onClick={() => onUpdateVisitStatus(visit.id, 'confirmed')} className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold"><CheckCircle className="w-4 h-4 inline mr-1"/> Confirmar</button>
                        </>
                    )}
                    <span className="text-xs font-bold uppercase">{visit.status}</span>
                 </div>
            </div>
        ))}
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-3 animate-fadeIn">
       {notifications.map(n => (
         <div key={n.id} className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-bold text-gray-800 text-sm">{n.title}</h4>
            <p className="text-sm text-gray-600">{n.message}</p>
            <p className="text-xs text-gray-400 mt-2">{new Date(n.timestamp).toLocaleString()}</p>
         </div>
       ))}
    </div>
  );

  const renderContracts = () => (
    <div className="space-y-4 animate-fadeIn">
        {contracts.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
                <FileText className="mx-auto w-12 h-12 text-gray-300" />
                <p className="mt-4 text-gray-500">Nenhum contrato associado à sua conta.</p>
            </div>
        ) : (
            contracts.map(contract => (
                <div key={contract.id} className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col sm:flex-row justify-between sm:items-center">
                    <div>
                        <div className="flex items-center space-x-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                contract.status === 'active' ? 'bg-green-100 text-green-800' :
                                contract.status === 'pending_signature' ? 'bg-yellow-100 text-yellow-800' :
                                contract.status === 'terminated' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
                            }`}>{contract.status.replace('_', ' ')}</span>
                            <p className="font-bold text-gray-800">{contract.propertyTitle}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">ID: {contract.id} | Início: {new Date(contract.startDate).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                        {contract.status === 'pending_signature' && (
                            <>
                                <button onClick={() => setRefuseModal({ isOpen: true, contractId: contract.id })} className="bg-red-500 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center shadow-sm hover:bg-red-600"><XCircle className="w-4 h-4 mr-1"/> Recusar</button>
                                <button onClick={() => onUpdateContractStatus(contract.id, 'active')} className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center shadow-sm hover:bg-green-700"><FileSignature className="w-4 h-4 mr-1"/> Assinar Digitalmente</button>
                            </>
                        )}
                        {(contract.status === 'active' || contract.status === 'expired' || contract.status === 'terminated') && (
                            <button onClick={() => handleViewContract(contract)} className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center shadow-sm hover:bg-blue-700"><Eye className="w-4 h-4 mr-1"/> Ver Contrato</button>
                        )}
                        <button onClick={() => alert('Ticket de suporte legal criado!')} className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded text-xs font-bold flex items-center hover:bg-gray-200"><HelpCircle className="w-4 h-4 mr-1"/> Suporte</button>
                    </div>
                </div>
            ))
        )}
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-4 animate-fadeIn">
         {documents.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
                <FileText className="mx-auto w-12 h-12 text-gray-300" />
                <p className="mt-4 text-gray-500">Nenhum documento financeiro disponível.</p>
            </div>
        ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                        <tr>
                            <th className="p-3">Documento</th>
                            <th className="p-3">Data</th>
                            <th className="p-3">Valor</th>
                            <th className="p-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {documents.map(doc => (
                        <tr key={doc.id}>
                            <td className="p-3 font-medium text-gray-800 capitalize">{doc.title}</td>
                            <td className="p-3 text-gray-600">{new Date(doc.date).toLocaleDateString()}</td>
                            <td className="p-3 text-gray-800 font-mono">{doc.amount ? new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(doc.amount) : 'N/A'}</td>
                            <td className="p-3 text-right space-x-2">
                                <button onClick={() => handleViewDocument(doc)} className="text-blue-600 hover:underline text-xs font-bold inline-flex items-center"><Eye className="w-3 h-3 mr-1"/>Ver</button>
                                <button onClick={() => handleViewDocument(doc)} className="text-green-600 hover:underline text-xs font-bold inline-flex items-center"><Download className="w-3 h-3 mr-1"/>Baixar</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        )}
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

      {refuseModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center"><AlertTriangle className="w-5 h-5 mr-2 text-red-500"/>Recusar Contrato</h3>
                    <p className="text-sm text-gray-600 mb-4">Por favor, forneça uma justificação clara para a recusa. Esta informação será enviada à equipa de Compliance e ao proprietário, e ficará registada para auditoria.</p>
                    <textarea 
                        value={refuseReason}
                        onChange={(e) => setRefuseReason(e.target.value)}
                        className="w-full h-24 p-2 border border-gray-300 rounded-md text-sm focus:ring-brand-500 focus:border-brand-500"
                        placeholder="Ex: As condições negociadas no chat não estão refletidas no contrato..."
                    />
                </div>
                <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3">
                    <button onClick={() => setRefuseModal({ isOpen: false, contractId: null })} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg text-sm">Cancelar</button>
                    <button onClick={handleRefuseContract} className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg text-sm hover:bg-red-700 shadow-sm">Confirmar Recusa</button>
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
