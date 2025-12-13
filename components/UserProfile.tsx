
import React, { useState, useRef } from 'react';
import { User, Property, VisitRequest, Contract } from '../types';
import { MOCK_CONTRACTS } from '../services/mockData';
import { User as UserIcon, BarChart2, Upload, MapPin, Save, Home, CheckCircle, Clock, FileText, Bell, Calendar, ChevronRight, Shield, Server, Lock, PenTool, CalendarDays, X, Check, FileSignature, Download, Briefcase, Building, ArrowLeft, RefreshCw, XCircle } from 'lucide-react';
import { PROVINCES } from '../constants';

interface UserProfileProps {
  user: User;
  userProperties: Property[]; // Properties owned by this user
  visits: VisitRequest[];
  onUpdateUser: (updatedUser: Partial<User>) => void;
  onUpdateVisitStatus: (visitId: string, status: 'confirmed' | 'rejected') => void;
  onBack?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, userProperties, visits, onUpdateUser, onUpdateVisitStatus, onBack }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'contracts' | 'dashboard' | 'notifications' | 'visits'>('profile');
  
  // Refs for file uploads
  const profileImageRef = useRef<HTMLInputElement>(null);

  // Local state for forms
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    dob: user.dob || '',
    nationality: user.nationality || 'Angolana',
    bi: user.bi || '',
    
    // Corporate
    companyName: user.companyName || '',
    repName: user.repName || '',
    repType: user.repType || 'Procurador',
    
    // Broker
    licenseNumber: user.licenseNumber || '',

    // Third-Party Rep
    representedEntityName: user.representedEntityName || '',
    representedEntityID: user.representedEntityID || '',

    // Address
    province: user.address?.province || '',
    municipality: user.address?.municipality || '',
    street: user.address?.street || '',
  });

  // State for Contracts
  const [myContracts, setMyContracts] = useState<Contract[]>(
      MOCK_CONTRACTS.filter(c => c.tenantId === user.id || c.ownerId === user.id)
  );
  const [signingContractId, setSigningContractId] = useState<string | null>(null);
  const [biConfirmed, setBiConfirmed] = useState(false);

  // Added 'collaborator' to internal staff list
  const isInternalStaff = ['admin', 'commercial_manager', 'security_manager', 'it_tech', 'collaborator'].includes(user.role);
  
  // LOGIC UPDATE: Treat Legal Reps as "Owner Entities" who manage properties
  const isOwnerEntity = user.role === 'owner' || user.role === 'broker' || user.role === 'legal_rep';
  
  const isCorporate = !!user.companyName; 
  const isLegalRep = user.role === 'legal_rep';

  const handleSaveProfile = () => {
    onUpdateUser({
      name: formData.name,
      phone: formData.phone,
      dob: formData.dob,
      nationality: formData.nationality,
      bi: formData.bi,
      companyName: formData.companyName,
      repName: formData.repName,
      repType: formData.repType,
      licenseNumber: formData.licenseNumber,
      representedEntityName: formData.representedEntityName,
      representedEntityID: formData.representedEntityID,
      address: {
        province: formData.province,
        municipality: formData.municipality,
        street: formData.street
      }
    });
    alert('Alterações guardadas com sucesso!');
  };

  // File Upload Handlers (Mock)
  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const objectUrl = URL.createObjectURL(file);
        onUpdateUser({ profileImage: objectUrl });
        alert("Foto de perfil atualizada!");
    }
  };

  const handleSignContract = (contractId: string) => {
      setBiConfirmed(false);
      setSigningContractId(contractId);
  };

  const handleRenewContract = (contractId: string) => {
      const confirm = window.confirm("Deseja iniciar o processo de renovação por mais 1 ano?");
      if(confirm) {
          setMyContracts(prev => prev.map(c => 
              c.id === contractId ? { ...c, status: 'active', endDate: '2025-12-31' } : c // Mock extension
          ));
          alert("Pedido de renovação enviado ao inquilino/proprietário.");
      }
  };

  const handleTerminateContract = (contractId: string) => {
      const confirm = window.confirm("Tem a certeza? Esta ação iniciará a rescisão do contrato.");
      if(confirm) {
          setMyContracts(prev => prev.map(c => 
              c.id === contractId ? { ...c, status: 'terminated' } : c
          ));
          alert("Contrato marcado como não renovado/rescindido.");
      }
  };

  const handleDownloadContract = (contractId: string) => {
      alert(`A iniciar download do contrato ${contractId}.pdf ...`);
  };

  const confirmSignature = () => {
      setMyContracts(prev => prev.map(c => 
          c.id === signingContractId 
          ? { ...c, status: 'active', signedAt: new Date().toISOString().split('T')[0] } 
          : c
      ));
      setSigningContractId(null);
      alert("Contrato assinado digitalmente com sucesso!");
  };

  const getRoleLabel = () => {
      switch(user.role) {
          case 'admin': return 'Administrador';
          case 'commercial_manager': return 'Gerente Comercial';
          case 'security_manager': return 'Gestor de Segurança';
          case 'it_tech': return 'Técnico de TI';
          case 'collaborator': return 'Colaborador';
          case 'owner': return 'Proprietário';
          case 'broker': return 'Corretor';
          case 'legal_rep': return 'Representante de Terceiros';
          default: return 'Inquilino / Comprador';
      }
  };

  const getRoleIcon = () => {
      switch(user.role) {
          case 'admin': return <Shield className="w-10 h-10" />;
          case 'commercial_manager': return <BarChart2 className="w-10 h-10" />;
          case 'security_manager': return <Lock className="w-10 h-10" />;
          case 'it_tech': return <Server className="w-10 h-10" />;
          case 'collaborator': return <PenTool className="w-10 h-10" />;
          case 'legal_rep': return <Shield className="w-10 h-10" />;
          default: return <UserIcon className="w-10 h-10" />;
      }
  };

  const renderVisitsTab = () => {
      const myVisits = visits.filter(v => v.tenantId === user.id);
      const incomingVisits = visits.filter(v => v.ownerId === user.id);

      return (
          <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center border-b pb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                      {isOwnerEntity ? 'Solicitações de Visita (Recebidas)' : 'Minhas Visitas (Enviadas)'}
                  </h2>
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                      {isOwnerEntity ? incomingVisits.length : myVisits.length} agendamentos
                  </span>
              </div>

              {isOwnerEntity ? (
                  // OWNER / AGENT VIEW (Incoming Requests)
                  <div className="grid grid-cols-1 gap-4">
                      {incomingVisits.length === 0 ? (
                          <div className="text-center py-10 text-gray-500">Não tem solicitações de visita pendentes.</div>
                      ) : (
                          incomingVisits.map(visit => (
                              <div key={visit.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                                      <div className="flex items-center space-x-4 mb-4 md:mb-0">
                                          <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                                              <img src={visit.propertyImage} className="w-full h-full object-cover" alt="Property" />
                                          </div>
                                          <div>
                                              <h4 className="font-bold text-gray-900 text-sm">{visit.propertyTitle}</h4>
                                              <p className="text-xs text-gray-500 mt-1">Interessado: <span className="font-medium text-gray-700">{visit.tenantName}</span></p>
                                              <div className="flex items-center text-xs text-gray-600 mt-1">
                                                  <CalendarDays className="w-3 h-3 mr-1" />
                                                  {new Date(visit.date).toLocaleDateString()} às {visit.time}
                                              </div>
                                          </div>
                                      </div>
                                      
                                      <div className="flex flex-col items-end space-y-2 w-full md:w-auto">
                                          {visit.status === 'pending' ? (
                                              <div className="flex space-x-2 w-full md:w-auto">
                                                  <button 
                                                      onClick={() => onUpdateVisitStatus(visit.id, 'rejected')}
                                                      className="flex-1 md:flex-none px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 flex items-center justify-center"
                                                  >
                                                      <X className="w-3 h-3 mr-1" /> Rejeitar
                                                  </button>
                                                  <button 
                                                      onClick={() => onUpdateVisitStatus(visit.id, 'confirmed')}
                                                      className="flex-1 md:flex-none px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 flex items-center justify-center shadow-sm"
                                                  >
                                                      <Check className="w-3 h-3 mr-1" /> Confirmar
                                                  </button>
                                              </div>
                                          ) : (
                                              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                                  visit.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                              }`}>
                                                  {visit.status === 'confirmed' ? 'Confirmada' : 'Rejeitada'}
                                              </span>
                                          )}
                                          {visit.message && (
                                              <p className="text-xs text-gray-500 italic bg-gray-50 p-2 rounded max-w-xs text-right">
                                                  "{visit.message}"
                                              </p>
                                          )}
                                      </div>
                                  </div>
                              </div>
                          ))
                      )}
                  </div>
              ) : (
                  // TENANT VIEW (Outgoing Requests)
                  <div className="grid grid-cols-1 gap-4">
                      {myVisits.length === 0 ? (
                          <div className="text-center py-10 text-gray-500">Ainda não agendou nenhuma visita.</div>
                      ) : (
                          myVisits.map(visit => (
                              <div key={visit.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                  <div className="flex items-center space-x-4">
                                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                                          <img src={visit.propertyImage} className="w-full h-full object-cover" alt="Property" />
                                      </div>
                                      <div className="flex-1">
                                          <div className="flex justify-between items-start">
                                              <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{visit.propertyTitle}</h4>
                                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                  visit.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                  visit.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                              }`}>
                                                  {visit.status === 'pending' ? 'Pendente' : visit.status === 'confirmed' ? 'Confirmada' : 'Cancelada'}
                                              </span>
                                          </div>
                                          <div className="flex items-center text-xs text-gray-600 mt-2">
                                              <CalendarDays className="w-3 h-3 mr-1" />
                                              {new Date(visit.date).toLocaleDateString()}
                                              <span className="mx-2">•</span>
                                              <Clock className="w-3 h-3 mr-1" />
                                              {visit.time}
                                          </div>
                                          {visit.status === 'confirmed' && (
                                              <p className="text-xs text-green-600 mt-1 font-medium">Compareça no local à hora marcada.</p>
                                          )}
                                      </div>
                                  </div>
                              </div>
                          ))
                      )}
                  </div>
              )}
          </div>
      );
  };

  const renderContractsTab = () => (
      <div className="space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-xl font-bold text-gray-800">Meus Contratos</h2>
              <button className="text-sm text-brand-600 font-medium hover:underline flex items-center">
                  <FileText className="w-4 h-4 mr-1"/> Ver Arquivo
              </button>
          </div>

          {myContracts.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <FileSignature className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhum contrato ativo ou pendente encontrado.</p>
              </div>
          ) : (
              <div className="grid grid-cols-1 gap-4">
                  {myContracts.map(contract => (
                      <div key={contract.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:border-brand-300 transition-colors">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                              <div className="mb-4 md:mb-0">
                                  <div className="flex items-center mb-1">
                                      <h4 className="font-bold text-gray-900 text-lg mr-2">{contract.propertyTitle}</h4>
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                          contract.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                                          contract.status === 'pending_signature' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                          'bg-gray-50 text-gray-600 border-gray-200'
                                      }`}>
                                          {contract.status === 'active' ? 'Vigente' : contract.status === 'pending_signature' ? 'Por Assinar' : contract.status === 'terminated' ? 'Terminado' : contract.status}
                                      </span>
                                  </div>
                                  <div className="text-sm text-gray-500 space-y-1">
                                      <p>Ref: {contract.id} • {contract.type === 'lease' ? 'Arrendamento' : 'Venda'}</p>
                                      <p>Outorgante: <span className="font-medium text-gray-700">{user.role === 'owner' ? contract.tenantName : contract.ownerName}</span></p>
                                      <p className="text-xs flex items-center mt-1">
                                          <Clock className="w-3 h-3 mr-1" />
                                          {contract.startDate} {contract.endDate ? `até ${contract.endDate}` : ''}
                                      </p>
                                  </div>
                              </div>

                              <div className="flex flex-col items-end space-y-2 w-full md:w-auto">
                                  <div className="text-xl font-bold text-brand-600">
                                      {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: contract.currency }).format(contract.value)}
                                  </div>
                                  
                                  <div className="flex space-x-2 w-full md:w-auto">
                                      <button 
                                        onClick={() => handleDownloadContract(contract.id)}
                                        className="flex-1 md:flex-none flex items-center justify-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                                      >
                                          <Download className="w-4 h-4 mr-1" /> PDF
                                      </button>
                                      
                                      {/* Signature Button - Available for Owner Entities too */}
                                      {contract.status === 'pending_signature' && (
                                          <button 
                                              onClick={() => handleSignContract(contract.id)}
                                              className="flex-1 md:flex-none flex items-center justify-center px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm transition-colors"
                                          >
                                              <PenTool className="w-4 h-4 mr-1" /> Assinar
                                          </button>
                                      )}

                                      {/* Management Buttons for Owner Entities (Owners, Brokers, Legal Reps) */}
                                      {contract.status === 'active' && isOwnerEntity && (
                                          <>
                                            <button 
                                                onClick={() => handleRenewContract(contract.id)}
                                                className="flex-1 md:flex-none flex items-center justify-center px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-bold hover:bg-green-100"
                                            >
                                                <RefreshCw className="w-3 h-3 mr-1" /> Renovar
                                            </button>
                                            <button 
                                                onClick={() => handleTerminateContract(contract.id)}
                                                className="flex-1 md:flex-none flex items-center justify-center px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100"
                                            >
                                                <XCircle className="w-3 h-3 mr-1" /> Rescindir
                                            </button>
                                          </>
                                      )}
                                  </div>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          )}

          {/* Signature Modal */}
          {signingContractId && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
                      <button 
                          onClick={() => setSigningContractId(null)}
                          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                      >
                          <X className="w-6 h-6" />
                      </button>
                      
                      <div className="text-center mb-6">
                          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                              <PenTool className="w-8 h-8 text-blue-600" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900">Assinatura Digital Kiá</h3>
                          <p className="text-sm text-gray-500">Para concluir, confirme a sua identidade.</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
                          <div 
                              onClick={() => setBiConfirmed(!biConfirmed)}
                              className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${biConfirmed ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white hover:border-blue-400'}`}
                          >
                              <div className="flex items-center">
                                  <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 shrink-0 ${biConfirmed ? 'bg-green-500 border-green-500' : 'border-gray-400'}`}>
                                      {biConfirmed && <Check className="w-3.5 h-3.5 text-white" />}
                                  </div>
                                  <div>
                                      {isLegalRep ? (
                                          <>
                                            <span className="text-xs text-gray-500 block">Declaração de Representação</span>
                                            <span className="font-bold text-gray-800 text-sm leading-tight block">
                                                Declaro que possuo poderes legais para assinar em nome de {user.representedEntityName || 'entidade representada'}.
                                            </span>
                                          </>
                                      ) : (
                                          <>
                                            <span className="text-xs text-gray-500 block">Confirmo que sou portador do BI</span>
                                            <span className="font-mono font-bold text-gray-800">{user.bi || '004729123LA042'}</span>
                                          </>
                                      )}
                                  </div>
                              </div>
                          </div>
                      </div>

                      <button 
                          onClick={confirmSignature}
                          disabled={!biConfirmed}
                          className={`w-full py-3 rounded-xl font-bold flex items-center justify-center transition-all ${
                              biConfirmed 
                              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg' 
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                      >
                          Confirmar Assinatura
                      </button>
                  </div>
              </div>
          )}
      </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back Button */}
      {onBack && (
          <button onClick={onBack} className="flex items-center text-gray-500 hover:text-gray-900 mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Início
          </button>
      )}

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Minha Conta</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <div className={`p-6 border-b border-brand-100 flex flex-col items-center ${isInternalStaff ? 'bg-gray-900' : 'bg-brand-50'}`}>
                {/* Profile Image Upload */}
                <input 
                    type="file" 
                    ref={profileImageRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                />
                <div 
                    onClick={() => profileImageRef.current?.click()}
                    className="w-24 h-24 rounded-full bg-gray-200 mb-3 overflow-hidden border-4 border-white shadow-sm relative group cursor-pointer"
                >
                    {user.profileImage ? (
                        <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className={`w-full h-full flex items-center justify-center ${isInternalStaff ? 'bg-gray-700 text-white' : 'bg-brand-100 text-brand-500'}`}>
                             {getRoleIcon()}
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="w-6 h-6 text-white" />
                    </div>
                </div>
                <h3 className={`font-bold text-center ${isInternalStaff ? 'text-white' : 'text-gray-900'}`}>{user.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full capitalize mt-1 ${isInternalStaff ? 'bg-gray-700 text-gray-300' : 'text-brand-600 bg-brand-100'}`}>
                    {getRoleLabel()}
                </span>
             </div>
             
             <nav className="p-2 space-y-1">
                <button 
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-gray-100 text-brand-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <UserIcon className="w-5 h-5" />
                    <span>Dados Pessoais</span>
                </button>
                
                {/* Contracts Tab - New */}
                {!isInternalStaff && (
                    <button 
                        onClick={() => setActiveTab('contracts')}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'contracts' ? 'bg-gray-100 text-brand-600' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <FileSignature className="w-5 h-5" />
                        <span>Contratos</span>
                    </button>
                )}

                {/* Common for Tenant/Owner/Rep */}
                {!isInternalStaff && (
                    <button 
                        onClick={() => setActiveTab('visits')}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'visits' ? 'bg-gray-100 text-brand-600' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <CalendarDays className="w-5 h-5" />
                        <span>Visitas</span>
                    </button>
                )}
                
                {/* Tenant Specific Tabs (HIDDEN FOR INTERNAL STAFF & OWNERS) */}
                {!isOwnerEntity && !isInternalStaff && (
                    <button 
                        onClick={() => setActiveTab('notifications')}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'notifications' ? 'bg-gray-100 text-brand-600' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Bell className="w-5 h-5" />
                        <span>Notificações</span>
                    </button>
                )}

                {/* Owner Entity Specific Tabs (Owners, Brokers, Legal Reps) */}
                {isOwnerEntity && (
                    <button 
                        onClick={() => setActiveTab('dashboard')}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-gray-100 text-brand-600' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <BarChart2 className="w-5 h-5" />
                        <span>Gestão de Imóveis</span>
                    </button>
                )}
             </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 animate-fadeIn">
            
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center border-b pb-4">
                        <h2 className="text-xl font-bold text-gray-800">Editar Perfil</h2>
                        {isInternalStaff && (
                            <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full flex items-center">
                                <Shield className="w-3 h-3 mr-1" /> Conta Corporativa
                            </span>
                        )}
                    </div>
                    
                    <h3 className="text-md font-bold text-gray-700">Identificação & Contactos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                            <input 
                                type="text" 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input 
                                type="email" 
                                value={formData.email}
                                disabled
                                className="w-full p-2 border border-gray-200 bg-gray-50 rounded-md text-gray-500 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                            <input 
                                type="tel" 
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                placeholder="+244 9XX XXX XXX"
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                            <input 
                                type="date" 
                                value={formData.dob}
                                onChange={(e) => setFormData({...formData, dob: e.target.value})}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nacionalidade</label>
                            <select 
                                value={formData.nationality}
                                onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            >
                                <option value="Angolana">Angolana</option>
                                <option value="Estrangeira">Estrangeira</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {isCorporate ? 'NIF' : 'Nº Bilhete de Identidade'}
                            </label>
                            <input 
                                type="text" 
                                value={formData.bi}
                                onChange={(e) => setFormData({...formData, bi: e.target.value})}
                                className="w-full p-2 border border-gray-300 rounded-md font-mono"
                            />
                        </div>
                    </div>

                    {/* Corporate Fields */}
                    {isCorporate && (
                        <div className="pt-4 border-t border-gray-100">
                            <h3 className="text-md font-bold text-gray-700 mb-4 flex items-center">
                                <Building className="w-4 h-4 mr-2" /> Dados da Empresa
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Razão Social</label>
                                    <input 
                                        type="text" 
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Representante Legal</label>
                                    <input 
                                        type="text" 
                                        value={formData.repName}
                                        onChange={(e) => setFormData({...formData, repName: e.target.value})}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Função / Cargo</label>
                                    <input 
                                        type="text" 
                                        value={formData.repType}
                                        onChange={(e) => setFormData({...formData, repType: e.target.value})}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Legal Rep (Third-Party) Fields */}
                    {isLegalRep && (
                        <div className="pt-4 border-t border-gray-100">
                            <h3 className="text-md font-bold text-gray-700 mb-4 flex items-center">
                                <Shield className="w-4 h-4 mr-2" /> Entidade Representada
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Entidade/Proprietário</label>
                                    <input 
                                        type="text" 
                                        value={formData.representedEntityName}
                                        onChange={(e) => setFormData({...formData, representedEntityName: e.target.value})}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">NIF/BI da Entidade</label>
                                    <input 
                                        type="text" 
                                        value={formData.representedEntityID}
                                        onChange={(e) => setFormData({...formData, representedEntityID: e.target.value})}
                                        className="w-full p-2 border border-gray-300 rounded-md font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Broker Fields */}
                    {user.role === 'broker' && (
                        <div className="pt-4 border-t border-gray-100">
                            <h3 className="text-md font-bold text-gray-700 mb-4 flex items-center">
                                <Briefcase className="w-4 h-4 mr-2" /> Dados Profissionais
                            </h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nº Carteira Profissional / Licença INH</label>
                                <input 
                                    type="text" 
                                    value={formData.licenseNumber}
                                    onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                            </div>
                        </div>
                    )}

                    <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-md font-bold text-gray-800 mb-4 flex items-center">
                            <MapPin className="w-5 h-5 mr-2 text-gray-500" /> Morada
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Província</label>
                                <select 
                                    value={formData.province}
                                    onChange={(e) => setFormData({...formData, province: e.target.value})}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                >
                                    <option value="">Selecionar...</option>
                                    {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Município</label>
                                <input 
                                    type="text"
                                    value={formData.municipality}
                                    onChange={(e) => setFormData({...formData, municipality: e.target.value})}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço Completo</label>
                                <input 
                                    type="text"
                                    value={formData.street}
                                    onChange={(e) => setFormData({...formData, street: e.target.value})}
                                    placeholder="Rua, Bairro, Nº Casa / Edifício"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button 
                            onClick={handleSaveProfile}
                            className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-2 rounded-md font-bold flex items-center shadow-sm transition-transform hover:-translate-y-0.5"
                        >
                            <Save className="w-4 h-4 mr-2" /> Guardar Alterações
                        </button>
                    </div>
                </div>
            )}

            {/* CONTRACTS TAB */}
            {activeTab === 'contracts' && renderContractsTab()}

            {/* VISITS TAB */}
            {activeTab === 'visits' && renderVisitsTab()}

            {/* DASHBOARD TAB (Owners/Brokers/Legal Reps) */}
            {activeTab === 'dashboard' && isOwnerEntity && (
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-800 border-b pb-4">Painel de Gestão</h2>
                    <p className="text-gray-500">Métricas e gestão de anúncios em breve...</p>
                </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-800 border-b pb-4">Notificações</h2>
                    <p className="text-gray-500">Sem novas notificações.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
