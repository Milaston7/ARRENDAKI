
import React, { useState, useEffect } from 'react';
import { Property, User, UserRole, Transaction, FlaggedChat, VerificationRequest, BlogPost, Contract, AuditLog, LegalClause, LegalAlert, SystemLog, ServiceHealth, DatabaseQuery } from '../types';
import { MOCK_TRANSACTIONS, MOCK_SYSTEM_LOGS, MOCK_SERVICE_HEALTH, MOCK_SLOW_QUERIES, MOCK_CONTRACTS, MOCK_LEGAL_ALERTS } from '../services/mockData';
import { PROVINCES } from '../constants';
import { 
  LayoutDashboard, Users, ShieldCheck, CheckCircle, XCircle, DollarSign,
  Activity, Bell, Lock, Unlock,
  FileText, Edit, AlertTriangle, Eye, Image as ImageIcon,
  Filter, Calendar, AlertCircle, Search,
  Home, RefreshCcw, ServerCrash, Info, CheckSquare, X,
  MapPin, Loader2, Save, ClipboardCheck, ArrowRight
} from 'lucide-react';

interface SecurityConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant: 'danger' | 'warning' | 'info';
}

const SecurityConfirmationModal: React.FC<SecurityConfirmationModalProps> = ({ isOpen, title, description, onConfirm, onCancel, variant }) => {
  if (!isOpen) return null;
  
  const colors = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    info: 'bg-blue-600 hover:bg-blue-700'
  };

  const icons = {
    danger: <AlertTriangle className="w-6 h-6 text-red-600" />,
    warning: <AlertCircle className="w-6 h-6 text-yellow-600" />,
    info: <Info className="w-6 h-6 text-blue-600" />
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-gray-100 rounded-full mr-3">
             {icons[variant]}
          </div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        </div>
        <p className="text-gray-600 mb-6">{description}</p>
        <div className="flex justify-end space-x-3">
          <button onClick={onCancel} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg">Cancelar</button>
          <button onClick={onConfirm} className={`px-4 py-2 text-white font-bold rounded-lg ${colors[variant]}`}>Confirmar</button>
        </div>
      </div>
    </div>
  );
};

interface FinanceTransaction extends Transaction {
    vtt: number;
    feeCalculated: number;
    feePaid: number;
    cpt: number;
    statusAudit: 'ok' | 'deviation' | 'pending';
    isLocked: boolean;
    paymentHash?: string;
}

interface AdminPanelProps {
  properties: Property[];
  onUpdateProperty: (id: string, updates: Partial<Property>) => void;
  users: User[];
  onUpdateUser: (id: string, updates: Partial<User>, reason?: string) => void;
  blogPosts: BlogPost[];
  onUpdateBlogPost: (id: string, updates: Partial<BlogPost>) => void;
  onAddBlogPost: (newPost: BlogPost) => void;
  currentUserRole: UserRole; 
  onToggleSystemStatus?: () => void;
  isSystemCritical?: boolean;
  auditLogs: AuditLog[];
  addAuditLog: (action: string, target: string, details: string, status: 'SUCCESS' | 'FAIL' | 'WARNING') => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
    properties, 
    onUpdateProperty, 
    users, 
    onUpdateUser,
    blogPosts,
    onUpdateBlogPost,
    onAddBlogPost,
    currentUserRole,
    onToggleSystemStatus,
    isSystemCritical,
    auditLogs,
    addAuditLog
}) => {
  
  const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
      admin: ['view_operations', 'view_finance', 'view_security', 'view_infrastructure', 'manage_all'],
      commercial_manager: ['view_operations', 'view_finance', 'manage_properties'],
      security_manager: ['view_security', 'view_operations', 'manage_users'],
      legal_compliance: ['view_operations', 'view_security', 'manage_contracts'],
      it_tech: ['view_infrastructure', 'manage_system'],
      collaborator: ['view_operations'],
      tenant: [], owner: [], broker: [], legal_rep: []
  };

  const hasPermission = (permission: string): boolean => {
    const permissions = ROLE_PERMISSIONS[currentUserRole] || [];
    return permissions.includes(permission) || permissions.includes('manage_all');
  };

  const [activeModule, setActiveModule] = useState<'operations' | 'finance' | 'security' | 'infrastructure'>('operations');
  
  // Operations State
  const [propertyFilter, setPropertyFilter] = useState<'pending' | 'approved_waiting_payment' | 'payment_processing' | 'all'>('pending');
  const [provinceFilter, setProvinceFilter] = useState<string>('all');
  const [operationsChecklist, setOperationsChecklist] = useState<Record<string, boolean>>({
      geo: false,
      desc: false,
      price: false,
      images: false
  });
  const [viewingProperty, setViewingProperty] = useState<Property | null>(null);
  const [internalNoteInput, setInternalNoteInput] = useState('');

  // Finance State
  const [financeTab, setFinanceTab] = useState<'reconciliation' | 'vtt_dashboard'>('reconciliation');
  const [financeTransactions, setFinanceTransactions] = useState<FinanceTransaction[]>([
      { ...MOCK_TRANSACTIONS[0], vtt: 120000, feeCalculated: 3000, feePaid: 3000, cpt: 150, statusAudit: 'ok', isLocked: true, paymentHash: 'SHA:8a7b9c...', proofUrl: 'https://via.placeholder.com/150' }, 
      { id: 'tx_webhook_1', type: 'listing_fee', amount: 3000, currency: 'AOA', status: 'pending', date: new Date().toISOString(), userId: 'owner1', propertyId: 'prop_pending_payment', propertyTitle: '[PENDENTE] Vivenda Nova', vtt: 0, feeCalculated: 3000, feePaid: 0, cpt: 0, statusAudit: 'pending', isLocked: false, proofUrl: 'https://via.placeholder.com/150' }
  ]);

  // UI State
  const [confirmation, setConfirmation] = useState<{ isOpen: boolean; title: string; description: string; action: () => void; variant: 'danger' | 'warning' | 'info'; }>({ isOpen: false, title: '', description: '', action: () => {}, variant: 'warning' });
  const [rejectDialog, setRejectDialog] = useState<{ isOpen: boolean; propertyId: string; reason: string }>({ isOpen: false, propertyId: '', reason: '' });

  // --- Helpers ---
  const triggerCriticalAction = (title: string, description: string, action: () => void, variant: 'danger' | 'warning' | 'info' = 'warning') => {
    setConfirmation({ isOpen: true, title, description, action, variant });
  };

  const handleConfirmAction = () => {
    confirmation.action();
    setConfirmation({ ...confirmation, isOpen: false });
  };

  // --- Operations Logic ---
  const handleOperationsChecklistToggle = (key: string) => {
      setOperationsChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isChecklistComplete = Object.values(operationsChecklist).every(v => v === true);

  const handlePropertyAction = (propertyId: string, action: 'approve' | 'reject' | 'save_note') => {
    if (action === 'approve') {
        if (!isChecklistComplete) {
            alert("A validação operacional (Checklist) deve estar completa antes de aprovar.");
            return;
        }
        triggerCriticalAction(
            'Aprovar Dossiê Operacional',
            'O imóvel passará para o estado "Aguardando Pagamento". O proprietário será notificado para pagar a Taxa de Listagem (3.000 AOA). Confirmar?',
            () => {
                onUpdateProperty(propertyId, { 
                    status: 'approved_waiting_payment',
                    internalNotes: internalNoteInput 
                });
                addAuditLog('OP_REVIEW_PASSED', propertyId, 'Checklist operacional validada. Aguardando pagamento.', 'SUCCESS');
                setViewingProperty(null);
                setOperationsChecklist({ geo: false, desc: false, price: false, images: false });
                setInternalNoteInput('');
            },
            'info'
        );
    } else if (action === 'save_note') {
        onUpdateProperty(propertyId, { internalNotes: internalNoteInput });
        alert('Nota interna guardada.');
    } else {
         setRejectDialog({ isOpen: true, propertyId, reason: '' });
    }
  };

  const confirmRejection = () => {
    if (!rejectDialog.propertyId || !rejectDialog.reason) return;
    onUpdateProperty(rejectDialog.propertyId, { status: 'rejected', rejectionReason: rejectDialog.reason, internalNotes: internalNoteInput });
    addAuditLog('REJECT_PROPERTY', rejectDialog.propertyId, `Rejeitado: ${rejectDialog.reason}`, 'SUCCESS');
    setRejectDialog({ isOpen: false, propertyId: '', reason: '' });
    setViewingProperty(null);
    setInternalNoteInput('');
  };

  // --- Finance Logic ---
  const handleReconcilePayment = (tx: FinanceTransaction) => {
      triggerCriticalAction(
          'Reconciliar Pagamento (ITIM Finança)',
          `Confirmar receção de ${tx.amount} AOA para o imóvel "${tx.propertyTitle}"? Isto irá gerar o Recibo Oficial e publicar o imóvel no feed.`,
          () => {
              // 1. Update Transaction Status (Local Mock)
              setFinanceTransactions(prev => prev.map(t => t.id === tx.id ? { ...t, status: 'reconciled', statusAudit: 'ok' } : t));
              
              // 2. Update Property Status (Simulated via Prop callback)
              // In a real app, we'd query the DB for the property ID connected to this transaction
              // Here we assume the tx object has it or we can find it in properties
              const relatedProp = properties.find(p => p.id === tx.propertyId || p.title === tx.propertyTitle); // heuristic match
              
              if (relatedProp) {
                  onUpdateProperty(relatedProp.id, { status: 'available', isVerified: true });
                  addAuditLog('FINANCE_RECONCILIATION', relatedProp.id, `Pagamento de ${tx.amount} AOA reconciliado. Imóvel publicado.`, 'SUCCESS');
              } else if (tx.propertyId) {
                   // Fallback if property object not found but ID exists
                   onUpdateProperty(tx.propertyId, { status: 'available', isVerified: true });
                   addAuditLog('FINANCE_RECONCILIATION', tx.propertyId, `Pagamento reconciliado via ID.`, 'SUCCESS');
              }
          },
          'info'
      );
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'pending': return 'bg-yellow-100 text-yellow-800';
          case 'approved_waiting_payment': return 'bg-blue-100 text-blue-800';
          case 'payment_processing': return 'bg-purple-100 text-purple-800';
          case 'available': return 'bg-green-100 text-green-800';
          case 'rejected': return 'bg-red-100 text-red-800';
          default: return 'bg-gray-100 text-gray-800';
      }
  };

  // --- Views ---

  const renderOperations = () => (
    <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
                <h3 className="text-xl font-bold text-gray-800">Kiá Operations</h3>
                <p className="text-sm text-gray-500">Gestão do ciclo de vida dos imóveis.</p>
            </div>
            <div className="flex flex-wrap gap-2">
                <select 
                    value={provinceFilter}
                    onChange={(e) => setProvinceFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg border text-sm bg-white"
                >
                    <option value="all">Todas Províncias</option>
                    {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <div className="flex bg-white rounded-lg border p-1">
                    <button onClick={() => setPropertyFilter('pending')} className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${propertyFilter === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'text-gray-500 hover:bg-gray-50'}`}>Revisão</button>
                    <button onClick={() => setPropertyFilter('approved_waiting_payment')} className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${propertyFilter === 'approved_waiting_payment' ? 'bg-blue-100 text-blue-800' : 'text-gray-500 hover:bg-gray-50'}`}>Aguard. Pagamento</button>
                    <button onClick={() => setPropertyFilter('payment_processing')} className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${propertyFilter === 'payment_processing' ? 'bg-purple-100 text-purple-800' : 'text-gray-500 hover:bg-gray-50'}`}>Reconciliação</button>
                    <button onClick={() => setPropertyFilter('all')} className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${propertyFilter === 'all' ? 'bg-gray-200 text-gray-800' : 'text-gray-500 hover:bg-gray-50'}`}>Todos</button>
                </div>
            </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-xs">
                    <tr>
                        <th className="p-4">Imóvel</th>
                        <th className="p-4 hidden md:table-cell">Proprietário</th>
                        <th className="p-4">Localização</th>
                        <th className="p-4">Preço</th>
                        <th className="p-4">Estado</th>
                        <th className="p-4 text-right">Ação</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {properties
                        .filter(p => propertyFilter === 'all' ? true : p.status === propertyFilter)
                        .filter(p => provinceFilter === 'all' ? true : p.location.province === provinceFilter)
                        .map(p => (
                        <tr key={p.id} className="hover:bg-gray-50 group transition-colors">
                            <td className="p-4">
                                <div className="flex items-center space-x-3">
                                    <img src={p.images[0]} className="w-10 h-10 rounded object-cover border border-gray-200" alt="" />
                                    <div>
                                        <p className="font-bold text-gray-900 line-clamp-1">{p.title}</p>
                                        <p className="text-xs text-gray-400">Ref: {p.id}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4 text-gray-600 text-xs hidden md:table-cell">{p.ownerId}</td>
                            <td className="p-4 text-gray-600 text-xs">
                                <span className="flex items-center"><MapPin className="w-3 h-3 mr-1"/> {p.location.province}</span>
                            </td>
                            <td className="p-4 font-mono font-bold text-xs">{p.price.toLocaleString()} {p.currency}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${getStatusColor(p.status)}`}>
                                    {p.status.replace(/_/g, ' ')}
                                </span>
                            </td>
                            <td className="p-4 text-right">
                                <button 
                                    onClick={() => {
                                        setViewingProperty(p);
                                        setInternalNoteInput(p.internalNotes || '');
                                        setOperationsChecklist({ geo: false, desc: false, price: false, images: false });
                                    }}
                                    className="text-brand-600 hover:text-brand-800 font-bold text-xs bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded transition-colors"
                                >
                                    Gerir Dossiê
                                </button>
                            </td>
                        </tr>
                    ))}
                    {properties.filter(p => (propertyFilter === 'all' ? true : p.status === propertyFilter) && (provinceFilter === 'all' ? true : p.location.province === provinceFilter)).length === 0 && (
                        <tr><td colSpan={6} className="p-8 text-center text-gray-400">Nenhum imóvel encontrado com estes filtros.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );

  const renderFinance = () => (
    <div className="space-y-6 animate-fadeIn">
         <div className="flex space-x-2 border-b border-gray-200 overflow-x-auto pb-1 mb-4">
             {['reconciliation', 'vtt_dashboard'].map(tab => (
                 <button 
                     key={tab}
                     onClick={() => setFinanceTab(tab as any)}
                     className={`px-4 py-2 text-sm font-bold whitespace-nowrap ${financeTab === tab ? 'text-brand-600 border-b-2 border-brand-600' : 'text-gray-500 hover:text-gray-800'}`}
                 >
                     {tab === 'reconciliation' ? 'Reconciliação (Webhooks)' : 'Dashboard VTT'}
                 </button>
             ))}
         </div>

         {financeTab === 'reconciliation' && (
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                 <h3 className="font-bold text-lg mb-4 text-brand-800 flex items-center">
                     <RefreshCcw className="w-5 h-5 mr-2" /> Monitor de Reconciliação Bancária
                 </h3>
                 <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6 flex items-start">
                     <Info className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                     <p className="text-sm text-blue-800">
                         <strong>ITIM Finança:</strong> Valide os pagamentos de Taxa de Listagem (3.000 AOA). 
                         A confirmação gera o Recibo Oficial e muda o estado do imóvel para "Disponível".
                     </p>
                 </div>

                 <table className="w-full text-sm text-left">
                     <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                         <tr>
                             <th className="p-3">Ref Transação</th>
                             <th className="p-3">Imóvel (Alvo)</th>
                             <th className="p-3">Valor</th>
                             <th className="p-3">Gateway</th>
                             <th className="p-3">Comprovativo</th>
                             <th className="p-3">Status</th>
                             <th className="p-3 text-right">Ação</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                         {financeTransactions.filter(t => t.type === 'listing_fee' && t.status === 'pending').map(tx => (
                             <tr key={tx.id} className="hover:bg-gray-50">
                                 <td className="p-3 font-mono">{tx.id}</td>
                                 <td className="p-3 font-medium">{tx.propertyTitle} <span className="text-xs text-gray-400 block">{tx.propertyId}</span></td>
                                 <td className="p-3 font-bold text-green-600">{tx.amount.toLocaleString()} AOA</td>
                                 <td className="p-3 text-xs">MCX Express</td>
                                 <td className="p-3">
                                     {tx.proofUrl ? (
                                         <a href={tx.proofUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline text-xs flex items-center"><ImageIcon className="w-3 h-3 mr-1"/> Ver Imagem</a>
                                     ) : <span className="text-gray-400 text-xs">N/A</span>}
                                 </td>
                                 <td className="p-3"><span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold uppercase">Pendente</span></td>
                                 <td className="p-3 text-right">
                                     <button 
                                        onClick={() => handleReconcilePayment(tx)}
                                        className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-green-700 shadow-sm flex items-center ml-auto"
                                     >
                                         <CheckCircle className="w-3 h-3 mr-1" /> Reconciliar
                                     </button>
                                 </td>
                             </tr>
                         ))}
                         {financeTransactions.filter(t => t.type === 'listing_fee' && t.status === 'pending').length === 0 && (
                             <tr><td colSpan={7} className="p-8 text-center text-gray-400">Nenhum pagamento pendente de reconciliação.</td></tr>
                         )}
                     </tbody>
                 </table>
             </div>
         )}

         {financeTab === 'vtt_dashboard' && (
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                 <h3 className="font-bold text-lg mb-4">Dashboard VTT</h3>
                 <p className="text-sm text-gray-500 mb-4">Transações históricas.</p>
                 <table className="w-full text-sm text-left">
                     <thead>
                         <tr className="text-xs text-gray-500 uppercase border-b">
                             <th className="py-2">Ref Transação</th>
                             <th className="py-2">VTT (Base)</th>
                             <th className="py-2">Fee (2.5%)</th>
                             <th className="py-2">Estado</th>
                         </tr>
                     </thead>
                     <tbody>
                         {financeTransactions.filter(t => t.status === 'completed' || t.status === 'reconciled').map(tx => (
                             <tr key={tx.id} className="border-b last:border-0 hover:bg-gray-50">
                                 <td className="py-3 font-mono">{tx.id}</td>
                                 <td className="py-3 font-bold">{tx.vtt.toLocaleString()} AOA</td>
                                 <td className="py-3 text-green-600">{tx.feeCalculated.toLocaleString()} AOA</td>
                                 <td className="py-3">
                                     {tx.isLocked ? <Lock className="w-4 h-4 text-green-500" /> : <Unlock className="w-4 h-4 text-gray-400" />}
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
         )}
    </div>
  );

  const renderInfrastructure = () => (
      <div className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Infraestrutura do Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h4 className="font-bold mb-4 flex items-center"><Activity className="w-5 h-5 mr-2 text-brand-600"/> Estado dos Serviços</h4>
                  <ul className="space-y-3">
                      {MOCK_SERVICE_HEALTH.map(s => (
                          <li key={s.id} className="flex justify-between items-center border-b border-gray-100 pb-2 last:border-0">
                              <span className="text-sm text-gray-700">{s.name}</span>
                              <div className="flex items-center">
                                  <span className={`w-2 h-2 rounded-full mr-2 ${s.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                  <span className="text-xs text-gray-500">{s.latency}ms</span>
                              </div>
                          </li>
                      ))}
                  </ul>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h4 className="font-bold mb-4 flex items-center"><ServerCrash className="w-5 h-5 mr-2 text-red-600"/> Logs Críticos</h4>
                  <ul className="space-y-3">
                      {MOCK_SYSTEM_LOGS.filter(l => l.level === 'critical' || l.level === 'error').map(l => (
                          <li key={l.id} className="text-xs bg-red-50 p-2 rounded text-red-800 border border-red-100">
                              <span className="font-mono font-bold block">{l.timestamp.split(' ')[1]}</span>
                              {l.message}
                          </li>
                      ))}
                  </ul>
              </div>
          </div>
      </div>
  );

  // --- Main Render ---
  return (
    <div className="flex h-screen bg-gray-50 font-sans">
        <aside className="w-64 bg-gray-900 text-white flex flex-col flex-shrink-0 transition-all duration-300">
            <div className="p-6 flex items-center space-x-3">
                <ShieldCheck className="w-8 h-8 text-brand-500" />
                <span className="text-xl font-bold tracking-tight">Admin<span className="text-brand-500">Panel</span></span>
            </div>
            <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-hide">
                {hasPermission('view_operations') && (
                    <button onClick={() => setActiveModule('operations')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeModule === 'operations' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>
                        <LayoutDashboard className="w-5 h-5" /> <span className="font-medium">Kiá Operations</span>
                    </button>
                )}
                {hasPermission('view_finance') && (
                    <button onClick={() => setActiveModule('finance')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeModule === 'finance' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>
                        <DollarSign className="w-5 h-5" /> <span className="font-medium">ITIM Finança</span>
                    </button>
                )}
                {hasPermission('view_infrastructure') && (
                    <button onClick={() => setActiveModule('infrastructure')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeModule === 'infrastructure' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>
                        <Activity className="w-5 h-5" /> <span className="font-medium">Monitorização TI</span>
                    </button>
                )}
            </nav>
        </aside>

        <main className="flex-1 overflow-y-auto bg-gray-50">
            <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center sticky top-0 z-40">
                <h2 className="text-xl font-bold text-gray-800 capitalize">{activeModule === 'finance' ? 'ITIM Finança' : activeModule.replace('_', ' ')}</h2>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 border-l pl-4 border-gray-200">
                        <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 font-bold text-xs">
                            {currentUserRole.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-700 capitalize">{currentUserRole.replace('_', ' ')}</span>
                    </div>
                </div>
            </header>

            <div className="p-8">
                {activeModule === 'operations' && renderOperations()}
                {activeModule === 'finance' && renderFinance()}
                {activeModule === 'infrastructure' && renderInfrastructure()}
                {activeModule === 'security' && <div className="p-6 text-center text-gray-500">Módulo de Segurança em Desenvolvimento</div>}
            </div>
        </main>

        {/* Modal: Property Operations Checklist */}
        {viewingProperty && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50 shrink-0">
                        <div className="flex items-center space-x-3">
                            <ClipboardCheck className="w-6 h-6 text-brand-600" />
                            <h3 className="text-xl font-bold text-gray-900">Checklist Operacional: {viewingProperty.title}</h3>
                        </div>
                        <button onClick={() => setViewingProperty(null)} className="text-gray-500 hover:text-gray-800"><X className="w-6 h-6" /></button>
                    </div>
                    
                    {/* Visual Lifecycle Progress */}
                    <div className="bg-gray-100 px-8 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between relative">
                            {/* Line */}
                            <div className="absolute left-0 right-0 top-1/2 h-1 bg-gray-300 -z-0"></div>
                            
                            {[
                                { id: 'pending', label: 'Rascunho / Revisão' },
                                { id: 'approved_waiting_payment', label: 'Pagamento Pendente' },
                                { id: 'available', label: 'Ativo (Kiá Verified)' }
                            ].map((step, idx) => {
                                const isActive = viewingProperty.status === step.id;
                                const isPast = 
                                    (step.id === 'pending' && viewingProperty.status !== 'pending') ||
                                    (step.id === 'approved_waiting_payment' && viewingProperty.status === 'available');
                                
                                return (
                                    <div key={step.id} className="relative z-10 flex flex-col items-center bg-gray-100 px-2">
                                        <div className={`w-4 h-4 rounded-full border-2 ${isActive ? 'bg-brand-600 border-brand-600 scale-125' : isPast ? 'bg-green-500 border-green-500' : 'bg-white border-gray-400'}`}></div>
                                        <span className={`text-[10px] font-bold mt-1 uppercase ${isActive ? 'text-brand-800' : 'text-gray-500'}`}>{step.label}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 h-full overflow-hidden">
                        {/* Property Preview Column */}
                        <div className="p-6 overflow-y-auto border-r border-gray-200 bg-gray-50">
                            <img src={viewingProperty.images[0]} className="w-full h-56 object-cover rounded-lg mb-4 shadow-md" alt="Main" />
                            <div className="space-y-3 text-sm text-gray-700 bg-white p-4 rounded-lg border border-gray-200">
                                <p><span className="font-bold text-gray-500 uppercase text-xs">ID do Sistema:</span> <span className="font-mono">{viewingProperty.id}</span></p>
                                <p><span className="font-bold text-gray-500 uppercase text-xs">Proprietário:</span> {viewingProperty.ownerId}</p>
                                <div className="grid grid-cols-2 gap-2 border-t pt-2 mt-2">
                                    <p><span className="font-bold text-gray-500 uppercase text-xs">Preço:</span> <br/>{viewingProperty.price.toLocaleString()} {viewingProperty.currency}</p>
                                    <p><span className="font-bold text-gray-500 uppercase text-xs">Localização:</span> <br/>{viewingProperty.location.municipality}, {viewingProperty.location.province}</p>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-500 uppercase text-xs mb-1">Descrição:</p>
                                    <p className="bg-gray-50 p-2 rounded border text-xs leading-relaxed italic">{viewingProperty.description}</p>
                                </div>
                            </div>
                        </div>

                        {/* Checklist & Action Column */}
                        <div className="p-6 overflow-y-auto flex flex-col">
                            <h4 className="font-bold text-brand-800 mb-4 uppercase text-xs tracking-wide flex items-center">
                                <CheckSquare className="w-4 h-4 mr-2"/> 1.1 Validação Obrigatória
                            </h4>
                            
                            <div className="space-y-3 mb-6 flex-grow">
                                <label className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all ${operationsChecklist.geo ? 'bg-green-50 border-green-200' : 'hover:bg-gray-50'}`}>
                                    <input type="checkbox" checked={operationsChecklist.geo} onChange={() => handleOperationsChecklistToggle('geo')} className="w-5 h-5 text-brand-600 rounded" />
                                    <span className="text-sm font-medium">Geolocalização Válida (Províncias Foco)</span>
                                </label>
                                <label className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all ${operationsChecklist.desc ? 'bg-green-50 border-green-200' : 'hover:bg-gray-50'}`}>
                                    <input type="checkbox" checked={operationsChecklist.desc} onChange={() => handleOperationsChecklistToggle('desc')} className="w-5 h-5 text-brand-600 rounded" />
                                    <span className="text-sm font-medium">Descrição Detalhada & Idioma Correto</span>
                                </label>
                                <label className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all ${operationsChecklist.price ? 'bg-green-50 border-green-200' : 'hover:bg-gray-50'}`}>
                                    <input type="checkbox" checked={operationsChecklist.price} onChange={() => handleOperationsChecklistToggle('price')} className="w-5 h-5 text-brand-600 rounded" />
                                    <span className="text-sm font-medium">Preço Razoável (VTT Coerente)</span>
                                </label>
                                <label className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all ${operationsChecklist.images ? 'bg-green-50 border-green-200' : 'hover:bg-gray-50'}`}>
                                    <input type="checkbox" checked={operationsChecklist.images} onChange={() => handleOperationsChecklistToggle('images')} className="w-5 h-5 text-brand-600 rounded" />
                                    <span className="text-sm font-medium">Fotos Únicas e de Alta Resolução</span>
                                </label>
                            </div>

                            <div className="mb-4">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Notas Internas (Operações)</label>
                                <div className="flex gap-2">
                                    <textarea 
                                        className="w-full border p-2 rounded text-sm h-20 resize-none focus:ring-2 focus:ring-brand-200 outline-none"
                                        placeholder="Ex: Pedir ao proprietário fotos da cozinha..."
                                        value={internalNoteInput}
                                        onChange={e => setInternalNoteInput(e.target.value)}
                                    ></textarea>
                                    <button 
                                        onClick={() => handlePropertyAction(viewingProperty.id, 'save_note')}
                                        className="bg-gray-100 text-gray-600 px-3 rounded hover:bg-gray-200"
                                        title="Guardar Nota"
                                    >
                                        <Save className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex space-x-3 pt-4 border-t mt-auto">
                                <button onClick={() => setRejectDialog({isOpen: true, propertyId: viewingProperty.id, reason: ''})} className="flex-1 bg-white border border-red-200 text-red-600 py-3 rounded-lg font-bold text-sm hover:bg-red-50 transition-colors">
                                    Rejeitar
                                </button>
                                <button 
                                    onClick={() => handlePropertyAction(viewingProperty.id, 'approve')} 
                                    disabled={!isChecklistComplete}
                                    className={`flex-1 py-3 rounded-lg font-bold text-sm text-white flex items-center justify-center shadow-md transition-all ${isChecklistComplete ? 'bg-green-600 hover:bg-green-700 hover:-translate-y-0.5' : 'bg-gray-300 cursor-not-allowed'}`}
                                >
                                    Validar & Enviar <ArrowRight className="w-4 h-4 ml-2" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Rejection Dialog */}
        {rejectDialog.isOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                    <h3 className="text-lg font-bold text-red-600 mb-4 flex items-center"><XCircle className="w-6 h-6 mr-2"/> Motivo da Rejeição</h3>
                    <p className="text-sm text-gray-500 mb-3">O proprietário receberá esta mensagem e deverá corrigir o anúncio.</p>
                    <textarea 
                        className="w-full border p-3 rounded-lg mb-4 h-32 focus:ring-2 focus:ring-red-200 outline-none"
                        placeholder="Ex: As fotos estão desfocadas ou o preço não condiz com a zona..."
                        value={rejectDialog.reason}
                        onChange={e => setRejectDialog({...rejectDialog, reason: e.target.value})}
                    ></textarea>
                    <div className="flex justify-end space-x-2">
                        <button onClick={() => setRejectDialog({isOpen: false, propertyId: '', reason: ''})} className="text-gray-500 font-bold px-4 py-2 hover:bg-gray-100 rounded">Cancelar</button>
                        <button onClick={confirmRejection} className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700 shadow-sm">Confirmar Rejeição</button>
                    </div>
                </div>
            </div>
        )}

        {/* Security Modal */}
        <SecurityConfirmationModal 
            isOpen={confirmation.isOpen}
            title={confirmation.title}
            description={confirmation.description}
            onConfirm={handleConfirmAction}
            onCancel={() => setConfirmation({ ...confirmation, isOpen: false })}
            variant={confirmation.variant}
        />
    </div>
  );
};

export default AdminPanel;
