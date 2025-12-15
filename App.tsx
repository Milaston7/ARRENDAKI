
// ... (Imports and existing setup remain unchanged)
import React, { useState, useEffect, useMemo } from 'react';
import Layout from './components/Layout';
import Hero from './components/Hero';
import PropertyCard from './components/PropertyCard';
import PropertyForm from './components/PropertyForm';
import ChatWindow from './components/ChatWindow';
import RegistrationForm from './components/RegistrationForm';
import UserProfile from './components/UserProfile';
// ImageLightbox, TransactionModal, SchedulingModal removed from direct import as they are now in PropertyDetail
import AdminPanel from './components/AdminPanel'; 
import AboutUs from './components/AboutUs'; 
import PropertyDetail from './components/PropertyDetail'; // New Import
import BlogList from './components/BlogList'; // New Import
import TrustSection from './components/TrustSection'; // New Import
import { MOCK_PROPERTIES, MOCK_BLOG_POSTS, MOCK_VISITS, MOCK_USERS, MOCK_CONTRACTS, MOCK_DOCUMENTS, MOCK_AUDIT_LOGS } from './services/mockData';
import { Property, User, FilterState, UserRole, VisitRequest, Notification, BlogPost, Contract, DocumentRecord, AuditLog } from './types';
import { ArrowLeft, CheckCircle, ChevronLeft, ChevronRight, MapPin, Image as ImageIcon, ZoomIn, FileText, ShoppingBag, ExternalLink, ShieldAlert, Film, Lock, Shield, Edit3, BookOpen, Clock, User as UserIcon, Key, ShieldCheck, LogIn, Scale, ServerCrash } from 'lucide-react';

const PROVINCE_HIGHLIGHTS = [
  { 
    name: 'Luanda', 
    image: 'https://images.unsplash.com/photo-1624020942548-18c3973c4391?auto=format&fit=crop&w=600&q=80', // Urban Coastal Skyline (Marginal Vibe)
    count: 342 
  },
  { 
    name: 'Benguela', 
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80', // Beautiful Tropical Beach (Baía Azul/Morena Vibe)
    count: 125 
  },
  { 
    name: 'Huíla', 
    image: 'https://images.unsplash.com/photo-1470723710355-173b4d1ad695?auto=format&fit=crop&w=600&q=80', // Mountain Road / Canyon (Serra da Leba/Tundavala Vibe)
    count: 89 
  },
  { 
    name: 'Namibe', 
    image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80', // Desert meets Ocean (Dunes Vibe)
    count: 45 
  }
];

const App: React.FC = () => {
  const [view, setView] = useState('home'); // home, blog, detail, add-property, chat, login, register, profile, admin, about
  const [user, setUser] = useState<User | null>(null);
  
  // KIÁ CONNECT CENTRAL STATE
  const [properties, setProperties] = useState<Property[]>(MOCK_PROPERTIES);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(MOCK_BLOG_POSTS); // Centralized Blog State
  const [contracts, setContracts] = useState<Contract[]>(MOCK_CONTRACTS);
  const [documents, setDocuments] = useState<DocumentRecord[]>(MOCK_DOCUMENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS); // Lifted state for global auditing
  
  // PROTOCOL STATE: System Integrity
  const [isSystemCritical, setIsSystemCritical] = useState(false);

  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [searchFilters, setSearchFilters] = useState<Partial<FilterState>>({});
  
  // Chat State
  const [currentChatId, setCurrentChatId] = useState<string>('default');

  // Visit Management State
  const [visits, setVisits] = useState<VisitRequest[]>(MOCK_VISITS);

  // Login / 2FA State
  const [isStaffLoginMode, setIsStaffLoginMode] = useState(false);
  const [staffLoginStep, setStaffLoginStep] = useState<'roles' | 'credentials' | '2fa'>('roles');
  const [pendingStaffRole, setPendingStaffRole] = useState<UserRole | null>(null);
  const [staffCredentials, setStaffCredentials] = useState({ email: '', password: '' });
  const [twoFACode, setTwoFACode] = useState('');

  // Standard Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [selectedSimulatedRole, setSelectedSimulatedRole] = useState<UserRole>('tenant');

  // ... (Audit Log and Notification functions same as before)
  const addAuditLog = (action: string, target: string, details: string, status: 'SUCCESS' | 'FAIL' | 'WARNING') => {
      const actorId = user ? user.id : 'SYSTEM';
      const newLog: AuditLog = {
          id: `audit_${Date.now()}`,
          action,
          actor: actorId,
          target,
          timestamp: new Date().toISOString(),
          status,
          details,
          ip: '127.0.0.1' // Mock IP
      };
      setAuditLogs(prev => [newLog, ...prev]);
  };

  const createNotification = (userId: string, title: string, message: string, type: Notification['type']) => {
      const newNotification: Notification = {
          id: `note_${Date.now()}`,
          userId,
          title,
          message,
          type,
          isRead: false,
          timestamp: new Date().toISOString()
      };
      setNotifications(prev => [newNotification, ...prev]);
  };

  // ... (handleUpdateProperty, handleUpdateUser, handleUpdateBlogPost, handleAddBlogPost, handleUpdateContractStatus same as before)
  const handleUpdateProperty = (id: string, updates: Partial<Property>) => {
      const oldProp = properties.find(p => p.id === id);
      setProperties(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
      if (oldProp) {
          if (updates.status && updates.status !== oldProp.status) {
              if (updates.status === 'approved_waiting_payment') {
                  createNotification(oldProp.ownerId, 'Dossiê Kiá Verify Aprovado', `O seu imóvel "${oldProp.title}" passou na verificação de conformidade. Proceda ao pagamento da taxa de publicação para ativar o selo Kiá Verified.`, 'success');
              } else if (updates.status === 'rejected') {
                  createNotification(oldProp.ownerId, 'Dossiê Rejeitado', `O seu imóvel "${oldProp.title}" não passou na verificação. Motivo: ${updates.rejectionReason}. Por favor, corrija os dados.`, 'error');
              } else if (updates.status === 'available') {
                  createNotification(oldProp.ownerId, 'Imóvel Publicado!', `O seu imóvel "${oldProp.title}" está agora visível no mercado com selo Kiá Verified.`, 'success');
              }
          }
      }
  };

  const handleUpdateUser = (id: string, updates: Partial<User>, reason?: string) => { const oldUser = users.find(u => u.id === id); if (oldUser) { if (updates.phone && updates.phone !== oldUser.phone) { addAuditLog('USER_UPDATE_CRITICAL', id, `Telefone alterado de '${oldUser.phone || ''}' para '${updates.phone}'.`, 'WARNING'); } if (updates.email && updates.email !== oldUser.email) { addAuditLog('USER_UPDATE_CRITICAL', id, `Email alterado de '${oldUser.email}' para '${updates.email}'.`, 'WARNING'); } } if (user && user.id === id) { setUser({ ...user, ...updates }); } setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u)); if (updates.accountStatus) { if (updates.accountStatus === 'suspended_legal') { if (user && user.id === id) { alert(`Acesso Temporariamente Suspenso.\n\nMotivo da Auditoria: ${reason || 'Irregularidades detetadas no Dossiê Kiá Verify.'}\nContacte o Compliance.`); handleLogout(); } } else if (updates.accountStatus === 'blocked') { if (user && user.id === id) { alert(`Sessão Invalidada.\n\nMotivo: ${reason || 'Ação administrativa de segurança.'}\nPor favor, faça login novamente para redefinir as credenciais.`); handleLogout(); } } else if (updates.accountStatus === 'active') { createNotification(id, 'Conta Ativada', `O seu acesso foi restaurado. ${reason ? `Nota: ${reason}` : ''}`, 'success'); } } if (updates.isIdentityVerified === true) { createNotification(id, 'Identidade Verificada', 'Parabéns! O seu Dossiê de Identidade foi aprovado pelo Analista. O selo Kiá Verified está ativo.', 'success'); } };
  const handleUpdateBlogPost = (id: string, updates: Partial<BlogPost>) => { setBlogPosts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p)); };
  const handleAddBlogPost = (newPost: BlogPost) => { setBlogPosts(prev => [newPost, ...prev]); };
  const handleUpdateContractStatus = (contractId: string, status: Contract['status'], reason?: string) => { setContracts(prev => prev.map(c => c.id === contractId ? {...c, status, signedAt: status === 'active' ? new Date().toISOString() : c.signedAt } : c)); if (status === 'active') { createNotification(user!.id, 'Contrato Assinado', `O contrato ${contractId} foi assinado digitalmente com sucesso.`, 'success'); addAuditLog('CONTRACT_SIGNED', contractId, `Utilizador ${user!.id} assinou digitalmente o contrato.`, 'SUCCESS'); } else if (status === 'terminated' && reason) { createNotification(user!.id, 'Contrato Recusado', `Recusou o contrato ${contractId}. Motivo: ${reason}. A equipa de Compliance entrará em contacto.`, 'warning'); addAuditLog('CONTRACT_REFUSED', contractId, `Utilizador ${user!.id} recusou o contrato. Motivo: ${reason}`, 'WARNING'); } };

  // UPDATED: Fee Payment Logic simulating integration with ITIM Finance
  const handleFeePayment = (propertyId: string) => {
    const prop = properties.find(p => p.id === propertyId);
    if (!prop) return;

    // Log the user action
    addAuditLog('USER_PAYMENT_SUBMITTED', propertyId, `Utilizador enviou comprovativo de 3.000 AOA.`, 'SUCCESS');

    // 1. Update property status to 'payment_processing' (Pending Reconciliation)
    setProperties(prev => prev.map(p => 
      p.id === propertyId 
      ? { ...p, status: 'payment_processing' } 
      : p
    ));

    // 2. Notify the user
    createNotification(
      prop.ownerId, 
      'Pagamento em Processamento', 
      `O pagamento da taxa para "${prop.title}" foi recebido. O imóvel será publicado assim que a equipa financeira (ITIM) confirmar a reconciliação bancária.`, 
      'info'
    );
  };

  // ... (Rest of component functions: filteredProperties, featuredProperties, handleStandardLogin, etc. - UNCHANGED)
  const filteredProperties = useMemo(() => { return properties.filter(p => { if (p.status !== 'available' && p.status !== 'rented' && p.status !== 'sold') return false; if (searchFilters.province && p.location.province !== searchFilters.province) return false; if (searchFilters.type && p.type !== searchFilters.type) return false; if (searchFilters.minPrice && p.price < searchFilters.minPrice) return false; if (searchFilters.maxPrice && p.price > searchFilters.maxPrice) return false; if (searchFilters.listingType && p.listingType !== searchFilters.listingType) return false; return true; }); }, [properties, searchFilters]);
  const featuredProperties = useMemo(() => { return properties.filter(p => p.isGuaranteed && p.status === 'available').slice(0, 4); }, [properties]);
  const handleStandardLogin = () => { if (!loginEmail || !loginPassword) { alert("Por favor, preencha o email e a senha."); return; } const role = selectedSimulatedRole; let mockUser: User | undefined; const existingUser = users.find(u => u.email === loginEmail); if (existingUser) { mockUser = existingUser; } else { if (role === 'owner') { mockUser = { id: 'owner1', name: 'João Proprietário', email: loginEmail, role: 'owner', group: 'external', accountStatus: 'active', isAuthenticated: true, phone: '923111222', isIdentityVerified: true }; } else if (role === 'broker') { mockUser = { id: 'broker1', name: 'Imobiliária Horizonte', email: loginEmail, role: 'broker', group: 'external', accountStatus: 'active', isAuthenticated: true, phone: '933444555', isIdentityVerified: true }; } else if (role === 'legal_rep') { mockUser = { id: 'rep1', name: 'Dr. Paulo Silva', email: loginEmail, role: 'legal_rep', group: 'external', accountStatus: 'active', isAuthenticated: true, phone: '944555666', isIdentityVerified: true, representedEntityName: 'Grupo Vencedor Lda', representedEntityID: '541223321' }; } else { mockUser = { id: 'usr_123', name: 'Maria Inquilina', email: loginEmail, role: 'tenant', group: 'external', accountStatus: 'active', isAuthenticated: true, phone: '911222333', isIdentityVerified: true }; } } if (mockUser.accountStatus === 'blocked') { alert("ACESSO NEGADO: Conta bloqueada por motivos de segurança. Contacte o suporte."); return; } if (mockUser.accountStatus === 'suspended_legal') { alert("ACESSO SUSPENSO: A sua conta encontra-se sob auditoria de conformidade. Por favor, aguarde o contacto da equipa Kiá Verify."); return; } setUser(mockUser); handleExternalUserRedirect(mockUser); };
  const handleExternalUserRedirect = (user: User) => { if (user.role === 'owner' || user.role === 'broker') { const hasProps = properties.some(p => p.ownerId === user.id); if (!hasProps) { setView('add-property'); return; } const hasPending = properties.some(p => p.ownerId === user.id && p.status === 'pending'); if (hasPending) { setView('profile'); return; } setView('profile'); } else { setView('home'); } };
  const initStaffLogin = (role: UserRole) => { setPendingStaffRole(role); setStaffLoginStep('credentials'); setStaffCredentials({ email: '', password: '' }); setTwoFACode(''); };
  const submitStaffCredentials = () => { if (!staffCredentials.email || !staffCredentials.password) { alert("Por favor, preencha o email e a senha."); return; } setStaffLoginStep('2fa'); };
  const verify2FA = () => { if (twoFACode === '123456') { const role = pendingStaffRole!; const roleNameMap: Record<string, string> = { 'admin': 'Administrador', 'commercial_manager': 'Gestor Comercial', 'security_manager': 'Gestor de Segurança', 'legal_compliance': 'Jurídico & Compliance', 'collaborator': 'Colaborador', 'it_tech': 'Técnico de TI' }; const newStaffUser: User = { id: 'staff_' + role, name: roleNameMap[role] || 'Staff User', email: staffCredentials.email || `${role}@arrendaki.ao`, role: role, group: 'internal', accountStatus: 'active', isAuthenticated: true, is2FAEnabled: true, profileImage: '' }; setUser(newStaffUser); setStaffLoginStep('roles'); setIsStaffLoginMode(false); setTwoFACode(''); setStaffCredentials({ email: '', password: '' }); setView('admin'); } else { alert('Código incorreto. Tente "123456".'); } };
  const handleRegister = (userData: any) => { console.log("Registering user:", userData); const newUser: User = { id: `usr_${Date.now()}`, name: userData.name, email: userData.email, role: userData.role, group: 'external', accountStatus: 'pending_onboarding', isAuthenticated: true, phone: userData.phone, bi: userData.bi, representedEntityName: userData.representedEntityName, representedEntityID: userData.representedEntityID, address: userData.address ? { street: userData.address, municipality: userData.municipality, province: userData.province } : undefined }; setUsers(prev => [...prev, newUser]); setUser(newUser); createNotification(newUser.id, 'Bem-vindo ao Arrendaki', 'A sua conta foi criada. Aguarde a verificação dos documentos.', 'info'); alert("Conta criada com sucesso! Bem-vindo ao Arrendaki."); handleExternalUserRedirect(newUser); };
  const handleLogout = () => { setUser(null); setView('home'); setIsStaffLoginMode(false); setStaffLoginStep('roles'); setLoginEmail(''); setLoginPassword(''); };
  const handleNavigate = (target: string) => { if (target === 'staff_login') { setIsStaffLoginMode(true); setStaffLoginStep('roles'); setView('login'); } else { if (target !== 'login') { setIsStaffLoginMode(false); } setView(target); } };
  const handlePropertyClick = (id: string) => { setSelectedPropertyId(id); setView('detail'); };
  const handleAddPropertySubmit = (newProp: Partial<Property>) => { const fullProp = newProp as Property; fullProp.status = 'pending'; fullProp.isVerified = false; fullProp.ownerId = user?.id || 'unknown'; setProperties([fullProp, ...properties]); setView('profile'); alert("Imóvel submetido para o Dossiê Kiá Verify! O estado 'Pendente' está visível no seu painel."); };
  const handleScheduleVisitSubmit = (visitData: VisitRequest) => { const newVisit: VisitRequest = { ...visitData, id: `visit_${Date.now()}` }; setVisits(prev => [newVisit, ...prev]); };
  const handleUpdateVisitStatus = (visitId: string, status: 'confirmed' | 'rejected') => { setVisits(prev => prev.map(v => v.id === visitId ? { ...v, status } : v)); };
  const handleStartChat = (propertyId: string, ownerId: string) => { if (user?.group === 'internal') { alert("PERMISSÃO NEGADA: Contas de Staff não podem iniciar negociações."); return; } setCurrentChatId(`chat_${propertyId}_${ownerId}`); setView('chat'); };
  const handleOpenChatFromInbox = (chatId: string) => { setCurrentChatId(chatId); setView('chat'); };
  const handleProvinceClick = (provinceName: string) => { setSearchFilters({ ...searchFilters, province: provinceName }); const element = document.getElementById('property-list'); element?.scrollIntoView({ behavior: 'smooth' }); };

  // ... (renderContent and return logic same as before)
  const renderContent = () => {
    if (isSystemCritical && user?.group !== 'internal') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-8 bg-gray-100">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg border-t-4 border-red-600">
                    <ServerCrash className="w-24 h-24 text-red-600 mx-auto mb-6 animate-pulse" />
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Serviço Indisponível (500)</h2>
                    <p className="text-gray-600 mb-6 text-lg">Ocorreu um erro crítico nos nossos servidores. A equipa de TI da Nexus One já foi notificada.</p>
                    <button onClick={() => window.location.reload()} className="mt-6 text-brand-600 font-bold hover:underline">Tentar Recarregar</button>
                </div>
            </div>
        );
    }
    if (user?.group === 'internal' && (view === 'add-property' || view === 'chat')) { return (<div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8"><ShieldAlert className="w-20 h-20 text-red-600 mb-4" /><h2 className="text-3xl font-bold text-gray-900 mb-2">Acesso Restrito (Segregação de Funções)</h2><p className="text-gray-600 max-w-md mb-6">A sua conta <strong>{user.role}</strong> pertence ao Grupo B (Equipa Interna).</p><button onClick={() => setView('admin')} className="bg-gray-900 text-white px-6 py-3 rounded-lg font-bold">Voltar ao Painel Admin</button></div>); }

    switch (view) {
      case 'home': return (<><Hero onSearch={setSearchFilters} onNavigate={setView} /><TrustSection /><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">{/* ... Featured ... */}{!searchFilters.province && !searchFilters.type && !searchFilters.listingType && (<div className="mb-16"><h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center"><MapPin className="h-6 w-6 text-brand-500 mr-2" />Explorar por Província</h2><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{PROVINCE_HIGHLIGHTS.map((prov) => (<div key={prov.name} onClick={() => handleProvinceClick(prov.name)} className="group relative h-48 rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"><img src={prov.image} alt={prov.name} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end"><h3 className="text-white text-xl font-bold">{prov.name}</h3><p className="text-gray-300 text-sm flex items-center">{prov.count} imóveis<ChevronRight className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" /></p></div></div>))}</div></div>)}<div id="property-list"><div className="flex justify-between items-end mb-6"><div><h2 className="text-2xl font-bold text-gray-900">{searchFilters.listingType ? `${searchFilters.listingType} Imóveis` : (searchFilters.province ? `Imóveis em ${searchFilters.province}` : 'Recentes no Arrendaki')}</h2>{searchFilters.listingType && <p className="text-sm text-gray-500">Mostrando apenas opções para {searchFilters.listingType.toLowerCase()}.</p>}</div>{Object.keys(searchFilters).length > 0 && (<button onClick={() => setSearchFilters({})} className="text-sm text-brand-600 hover:text-brand-700 font-medium hover:underline">Limpar Filtros</button>)}</div>{filteredProperties.length > 0 ? (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">{filteredProperties.map(p => (<PropertyCard key={p.id} property={p} onClick={handlePropertyClick} />))}</div>) : (<div className="text-center py-20 bg-white rounded-lg shadow-sm border border-gray-100"><div className="mx-auto h-12 w-12 text-gray-400 mb-4"><MapPin className="h-full w-full" /></div><p className="text-gray-900 font-medium text-lg">Nenhum imóvel encontrado.</p><button onClick={() => setSearchFilters({})} className="mt-2 text-brand-600 font-bold hover:underline">Ver todos</button></div>)}</div></div></>);
      case 'about': return <AboutUs />;
      case 'blog': return (<BlogList posts={blogPosts} onReadMore={(id) => alert(`Navegar para o artigo ${id}`)} />);
      case 'detail': const property = properties.find(p => p.id === selectedPropertyId); if (!property) return <div>Property not found</div>; return (<PropertyDetail property={property} user={user} onBack={() => setView('home')} onLoginNeeded={() => setView('login')} onAddVisit={handleScheduleVisitSubmit} onStartChat={handleStartChat} />);
      case 'add-property': if (!user || user.group === 'internal') { setView('login'); return null; } return (<div className="py-12 px-4"><PropertyForm onSubmit={handleAddPropertySubmit} onCancel={() => setView('home')} /></div>);
      case 'register': return (<div className="px-4"><RegistrationForm onRegister={handleRegister} onCancel={() => setView('login')} /></div>);
      case 'profile': if (!user) { setView('login'); return null; } const userContracts = contracts.filter(c => c.ownerId === user.id || c.tenantId === user.id); const userDocuments = documents.filter(d => { return userContracts.some(c => c.id === d.relatedEntityId); }); return (<UserProfile user={user} userProperties={properties.filter(p => p.ownerId === user.id)} visits={visits} notifications={notifications.filter(n => n.userId === user.id)} contracts={userContracts} documents={userDocuments} onUpdateUser={(updates) => handleUpdateUser(user.id, updates)} onUpdateVisitStatus={handleUpdateVisitStatus} onUpdateContractStatus={handleUpdateContractStatus} onPayFee={handleFeePayment} onBack={() => setView('home')} onOpenChat={handleOpenChatFromInbox} />);
      case 'admin': if (!user || user.group !== 'internal') { setView('login'); return null; } return (<AdminPanel properties={properties} onUpdateProperty={handleUpdateProperty} users={users} onUpdateUser={handleUpdateUser} blogPosts={blogPosts} onUpdateBlogPost={handleUpdateBlogPost} onAddBlogPost={handleAddBlogPost} currentUserRole={user.role} onToggleSystemStatus={() => setIsSystemCritical(!isSystemCritical)} isSystemCritical={isSystemCritical} auditLogs={auditLogs} addAuditLog={addAuditLog} />);
      case 'chat': if (!user || user.group === 'internal') { setView('login'); return null; } const currentProp = properties.find(p => p.id === selectedPropertyId) || properties[0]; return (<div className="max-w-4xl mx-auto py-12 px-4"><div className="flex items-center mb-6"><button onClick={() => setView('profile')} className="mr-3 p-2 bg-gray-100 rounded-full hover:bg-gray-200"><ArrowLeft className="w-5 h-5" /></button><h2 className="text-2xl font-bold">Mensagens Seguras</h2></div><ChatWindow chatId={currentChatId} currentUser="me" onScheduleVisit={() => { if(currentProp) { setSelectedPropertyId(currentProp.id); setView('detail'); } }} onSendProposal={() => { if(currentProp) { setSelectedPropertyId(currentProp.id); setView('detail'); } }} /></div>);
      case 'login': return (<div className="min-h-[80vh] flex items-center justify-center px-4 relative bg-gray-50">{staffLoginStep === '2fa' && (<div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"><div className="bg-white p-8 rounded-xl max-w-sm w-full text-center"><Lock className="w-8 h-8 text-brand-600 mx-auto mb-4" /><h3 className="text-xl font-bold mb-2">Autenticação 2FA</h3><input type="text" value={twoFACode} onChange={(e) => setTwoFACode(e.target.value)} className="text-center text-2xl border-2 border-gray-300 rounded-lg p-2 w-full mb-4" maxLength={6} placeholder="000000"/><button onClick={verify2FA} className="w-full bg-brand-500 text-white py-3 rounded-lg font-bold mb-2">Verificar</button><div className="mt-4 p-2 bg-gray-100 text-xs text-gray-500 rounded">Use o código: <strong>123456</strong></div></div></div>)}<div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">{!isStaffLoginMode ? (<><div className="text-center mb-8"><h2 className="text-3xl font-extrabold text-gray-900 mb-2">Login</h2></div><div className="space-y-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" className="w-full p-2 border rounded-lg" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}/></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Senha</label><input type="password" className="w-full p-2 border rounded-lg" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}/></div><div className="pt-2"><select value={selectedSimulatedRole} onChange={(e) => setSelectedSimulatedRole(e.target.value as UserRole)} className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50"><option value="tenant">Inquilino / Comprador</option><option value="owner">Proprietário</option><option value="broker">Corretor</option><option value="legal_rep">Representante de Terceiros</option></select></div><button onClick={handleStandardLogin} className="w-full bg-brand-500 text-white p-3 rounded-lg font-bold">Entrar</button></div><div className="mt-6 border-t pt-4"><button onClick={() => { setIsStaffLoginMode(true); setStaffLoginStep('roles'); }} className="w-full flex items-center justify-center p-2 text-gray-500 text-sm font-medium"><ShieldAlert className="w-4 h-4 mr-2" /> Acesso Administrativo (Staff)</button></div><div className="mt-4 pt-6 border-t border-gray-100 text-center"><button onClick={() => setView('register')} className="w-full bg-gray-900 text-white p-3 rounded-lg font-bold">Criar Conta Nova</button></div></>) : (<><h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Acesso Corporativo</h2>{staffLoginStep === 'roles' && (<div className="space-y-3"><button onClick={() => initStaffLogin('admin')} className="w-full p-3 bg-gray-900 text-white rounded-lg">Administrador</button><button onClick={() => initStaffLogin('commercial_manager')} className="w-full p-3 border rounded-lg">Gestor Comercial</button><button onClick={() => initStaffLogin('it_tech')} className="w-full p-3 border rounded-lg">TI</button><button onClick={() => setIsStaffLoginMode(false)} className="mt-6 text-sm text-gray-400 w-full text-center">Voltar</button></div>)}{staffLoginStep === 'credentials' && (<div className="space-y-4"><input type="email" placeholder="Email" className="w-full p-2 border rounded-lg" value={staffCredentials.email} onChange={e => setStaffCredentials({...staffCredentials, email: e.target.value})}/><input type="password" placeholder="Senha" className="w-full p-2 border rounded-lg" value={staffCredentials.password} onChange={e => setStaffCredentials({...staffCredentials, password: e.target.value})}/><button onClick={submitStaffCredentials} className="w-full bg-brand-500 text-white py-3 rounded-lg font-bold">Entrar</button></div>)}</>)}</div></div>);
      default: return <div>View not found</div>;
    }
  };

  return (<Layout user={user} onNavigate={handleNavigate} onLoginClick={() => setView('login')} onLogout={handleLogout} currentView={view}>{renderContent()}</Layout>);
};

export default App;
