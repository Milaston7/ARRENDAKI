
import React, { useState, useEffect, useRef } from 'react';
import { Property, User, UserRole, Transaction, FlaggedChat, VerificationRequest, BlogPost, Contract, AuditLog, LegalClause, LegalAlert, SystemLog, ServiceHealth, DatabaseQuery } from '../types';
import { MOCK_TRANSACTIONS, MOCK_FLAGGED_CHATS, MOCK_CONTRACTS, MOCK_LEGAL_CLAUSES, MOCK_LEGAL_ALERTS, MOCK_SYSTEM_LOGS, MOCK_SERVICE_HEALTH, MOCK_SLOW_QUERIES } from '../services/mockData';
import { PROVINCES, MUNICIPALITIES_MOCK } from '../constants';
import { 
  LayoutDashboard, Users, ShieldCheck, CheckCircle, XCircle, BarChart, DollarSign, Server,
  Database, Activity, Map, Bell, Download, Ban, PenTool, Save, Send, Trash2, Lock, Unlock,
  RotateCcw, FileText, Edit, AlertTriangle, Eye, MessageSquare, Image as ImageIcon, Plus,
  Filter, Calendar, AlertCircle, FileSearch, UserCheck, Search, ArrowUpRight, Briefcase,
  Home, BookOpen, Clock, LifeBuoy, TrendingDown, Wallet, FileSignature, Megaphone, X, Mail,
  ShieldAlert, Bold, Italic, List, AlignLeft, AlignCenter, AlignRight, Link as LinkIcon, Quote, 
  Heading1, Heading2, Upload, Film, Fingerprint, Info, FileSpreadsheet, PieChart, ArrowRightLeft,
  CreditCard, ZoomIn, Tag, Hash, Phone, RefreshCw, Video, Cpu, HardDrive, CloudLightning, FileCode,
  MapPin, UserPlus, Key, ChevronDown, ChevronUp, Globe, ChevronRight, Zap, Gavel, Scale, Siren, EyeOff, Shield,
  FileWarning, Search as SearchIcon, Printer, History, Terminal, Network, MousePointer, TrendingUp, AlertOctagon, Receipt, CheckSquare,
  FileCheck, Calculator, Paperclip, UserCog, Power, Layers, UserMinus, RefreshCcw, ServerCrash
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

// Extended Transaction Type for Finance Module
interface FinanceTransaction extends Transaction {
    vtt: number; // Value Total Transaction (Base for 2.5%)
    feeCalculated: number;
    feePaid: number;
    cpt: number; // Cost Per Transaction (Variable Costs)
    statusAudit: 'ok' | 'deviation' | 'pending';
    // Security & Integrity Fields
    isLocked: boolean; // Immutability Flag
    paymentHash?: string; // Integrity Hash
    vttEditRequest?: {
        active: boolean;
        newVtt: number;
        approvals: {
            analyst: boolean;
            legal: boolean;
            finance: boolean;
        };
    };
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
      admin: [
        'view_dashboard', 'view_operations_module', 'view_finance_module', 'view_security_module', 
        'view_infrastructure_module', 'view_team_module', 'view_contracts_module', 'view_communication_module',
        'view_compliance_module', 'view_iam_module', 'view_it_module', // Access PCC, IAM, IT
        'manage_properties', 'approve_properties', 'manage_users', 'ban_users', 'contact_users', 
        'manage_finance', 'manage_escrow', 'manage_verification', 'audit_chats', 'manage_infrastructure', 
        'manage_content', 'publish_content', 'approve_content', 'manage_team', 'manage_contracts', 'manage_communications',
        'manage_locations', 'view_audit_module', 'manage_legal_contracts', 'handle_fraud_alerts', 'iam_full_access', 'it_full_access'
      ],
      commercial_manager: [
        'view_dashboard', 'view_operations_module', 'view_finance_module', 'view_contracts_module', 'view_communication_module',
        'manage_properties', 'approve_properties', 'manage_users', 'contact_users',
        'manage_finance', 'manage_escrow', 'manage_content', 'publish_content', 'manage_contracts', 'manage_communications',
        'manage_locations'
      ],
      security_manager: [
        'view_dashboard', 'view_security_module', 'manage_users', 'ban_users',
        'manage_verification', 'audit_chats', 'view_audit_module', 'view_compliance_module', 'handle_fraud_alerts'
      ],
      legal_compliance: [
        'view_dashboard', 'view_contracts_module', 'view_compliance_module', 'view_audit_module', 'view_security_module', 'view_communication_module',
        'manage_contracts', 'manage_legal_contracts', 'handle_fraud_alerts', 'manage_verification', 'contact_users', 'approve_content'
      ],
      it_tech: [
        'view_dashboard', 'view_infrastructure_module', 'manage_infrastructure', 'view_audit_module', 'view_it_module', 'it_full_access'
      ],
      collaborator: [
        'view_dashboard', 'view_operations_module', 'view_communication_module', 'manage_content'
      ],
      tenant: [], owner: [], broker: [], legal_rep: []
  };

  const hasPermission = (permission: string): boolean => {
    const permissions = ROLE_PERMISSIONS[currentUserRole] || [];
    return permissions.includes(permission);
  };

  const [activeModule, setActiveModule] = useState<'operations' | 'finance' | 'security' | 'infrastructure' | 'team' | 'contracts' | 'communication' | 'audit' | 'compliance' | 'iam' | 'it'>('operations');
  const [activeSubTab, setActiveSubTab] = useState<string>('properties');
  const [securityTab, setSecurityTab] = useState<'verify' | 'audits'>('verify');
  
  // Finance Module Tabs
  const [financeTab, setFinanceTab] = useState<'vtt_dashboard' | 'fee_audit' | 'disputes' | 'costs' | 'account_closure'>('vtt_dashboard');

  // Compliance Tabs
  const [complianceTab, setComplianceTab] = useState<'risk_dashboard' | 'supervision' | 'contract_engine' | 'fraud_alerts'>('risk_dashboard');

  // IAM Tabs
  const [iamTab, setIamTab] = useState<'users_list' | 'roles' | 'staff_logs'>('users_list');
  const [iamSearch, setIamSearch] = useState('');
  
  // IAM Management State (Updated for Emergency Functions)
  const [iamModal, setIamModal] = useState<{ isOpen: boolean; type: 'create' | 'edit_role'; user?: User }>({ isOpen: false, type: 'create' });
  const [iamFormData, setIamFormData] = useState({ name: '', email: '', role: 'collaborator' as UserRole, justification: '' });
  
  // IAM Emergency Action State
  const [iamEmergency, setIamEmergency] = useState<{ 
      isOpen: boolean; 
      type: 'reset_pass' | 'block' | 'unblock' | 'offboard' | null; 
      user: User | null; 
  }>({ isOpen: false, type: null, user: null });
  const [emergencyReason, setEmergencyReason] = useState('');
  const [blockType, setBlockType] = useState<'session' | 'fraud'>('session');

  // IT Tabs
  const [itTab, setItTab] = useState<'logs' | 'health' | 'tools' | 'db' | 'connectivity'>('logs');
  const [itLogFilter, setItLogFilter] = useState<'all' | 'error' | 'security'>('all');
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>(MOCK_SYSTEM_LOGS);
  const [serviceHealth, setServiceHealth] = useState<ServiceHealth[]>(MOCK_SERVICE_HEALTH);
  const [slowQueries, setSlowQueries] = useState<DatabaseQuery[]>(MOCK_SLOW_QUERIES);

  // Extended Finance Mock Data with Security Fields
  const [financeTransactions, setFinanceTransactions] = useState<FinanceTransaction[]>([
      { ...MOCK_TRANSACTIONS[0], vtt: 120000, feeCalculated: 3000, feePaid: 3000, cpt: 150, statusAudit: 'ok', isLocked: true, paymentHash: 'SHA:8a7b9c...' }, // Listing Fee (Fixed)
      { 
          id: 'tx_escrow_audit_1', type: 'service_fee', amount: 450000, currency: 'AOA', status: 'completed', date: '2023-10-24', userId: 'user_1',
          vtt: 18000000, feeCalculated: 450000, feePaid: 450000, cpt: 12000, statusAudit: 'ok', isLocked: false 
      },
      { 
          id: 'tx_escrow_audit_2', type: 'service_fee', amount: 120000, currency: 'AOA', status: 'completed', date: '2023-10-25', userId: 'user_2',
          vtt: 5000000, feeCalculated: 125000, feePaid: 120000, cpt: 5000, statusAudit: 'deviation', isLocked: false 
      }
  ]);

  // Editing VTT State
  const [editingVttId, setEditingVttId] = useState<string | null>(null);
  const [tempVttValue, setTempVttValue] = useState<string>('');

  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [contracts, setContracts] = useState<Contract[]>(MOCK_CONTRACTS);
  const [legalClauses, setLegalClauses] = useState<LegalClause[]>(MOCK_LEGAL_CLAUSES);
  const [legalAlerts, setLegalAlerts] = useState<LegalAlert[]>(MOCK_LEGAL_ALERTS);
  
  // Mock Operational Costs
  const [operationalCosts, setOperationalCosts] = useState([
      { id: 'cost_1', type: 'SMS Gateway', amount: 15000, date: '2023-10-27', vendor: 'Unitel', hasProof: true },
      { id: 'cost_2', type: 'KYC API', amount: 45000, date: '2023-10-26', vendor: 'MIREX Integ.', hasProof: true },
      { id: 'cost_3', type: 'Server Hosting', amount: 200000, date: '2023-10-01', vendor: 'AWS', hasProof: false }, // Missing Proof
  ]);

  // Mock Disputes
  const [refundQueue, setRefundQueue] = useState([
      { id: 'ref_1', txId: 'tx_escrow_1', amount: 450000, reason: 'Imóvel não corresponde às fotos', requestedBy: 'Maria Inquilina', stage: 'analyst_review', createdAt: '2023-10-26' },
      { id: 'ref_2', txId: 'tx1', amount: 3000, reason: 'Pagamento duplicado', requestedBy: 'João Proprietário', stage: 'legal_review', createdAt: '2023-10-27' },
      { id: 'ref_3', txId: 'tx_escrow_99', amount: 120000, reason: 'Desistência no prazo legal', requestedBy: 'Cliente Teste', stage: 'approved', createdAt: '2023-10-20' }
  ]);

  // Account Closure State
  const [closureSearch, setClosureSearch] = useState('');
  const [closureTarget, setClosureTarget] = useState<User | null>(null);
  const [closureReportGenerated, setClosureReportGenerated] = useState(false);

  const [viewingProperty, setViewingProperty] = useState<Property | null>(null);
  const [viewingContract, setViewingContract] = useState<Contract | null>(null);

  // --- Kiá Verify State ---
  const [verificationQueue, setVerificationQueue] = useState<VerificationRequest[]>([
      { id: 'v1', userId: 'owner1', type: 'identity', documentUrl: 'https://images.unsplash.com/photo-1544507888-56d73eb6046e?auto=format&fit=crop&w=600&q=80', status: 'pending', submittedAt: '2023-10-26' },
      { id: 'v2', userId: 'owner1', type: 'property_ownership', documentUrl: 'https://images.unsplash.com/photo-1555529733-0e670560f7e1?auto=format&fit=crop&w=600&q=80', status: 'pending', submittedAt: '2023-10-26' },
      { id: 'v3', userId: 'tenant1', type: 'identity', documentUrl: 'https://images.unsplash.com/photo-1589330694653-569b9a13d2f2?auto=format&fit=crop&w=600&q=80', status: 'review_needed', submittedAt: '2023-10-25', reviewedBy: 'staff_1', reviewNotes: 'Foto tremida' }
  ]);
  const [selectedVerification, setSelectedVerification] = useState<VerificationRequest | null>(null);
  const [documentRevealed, setDocumentRevealed] = useState(false);
  const [fieldValidation, setFieldValidation] = useState<Record<string, 'idle' | 'valid' | 'invalid'>>({
      name: 'idle',
      bi: 'idle',
      address: 'idle',
      face: 'idle'
  });
  const [verificationNote, setVerificationNote] = useState('');

  // --- Supervision State ---
  const [supervisionQuery, setSupervisionQuery] = useState('');
  const [supervisionUser, setSupervisionUser] = useState<User | null>(null);

  // --- Contract Engine Editor State ---
  const [editingClause, setEditingClause] = useState<LegalClause | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [editorTitle, setEditorTitle] = useState('');

  // --- Forensic Analysis State ---
  const [selectedAlert, setSelectedAlert] = useState<LegalAlert | null>(null);

  const [auditChats, setAuditChats] = useState<FlaggedChat[]>(MOCK_FLAGGED_CHATS);
  
  // --- BLOG / CMS STATE ---
  const [blogStatusFilter, setBlogStatusFilter] = useState<'all' | 'published' | 'pending_legal' | 'draft'>('all');
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [postRejectionReason, setPostRejectionReason] = useState('');
  
  const [notificationHistory, setNotificationHistory] = useState<any[]>([
      { id: 1, title: 'Manutenção Programada', message: 'A plataforma estará indisponível das 02h às 04h para melhorias.', target: 'Todos', type: 'info', date: '2023-10-25', status: 'sent' },
      { id: 2, title: 'Nova Funcionalidade: Kiá Verify', message: 'Verifique a sua conta hoje e ganhe destaque nos anúncios.', target: 'Proprietários', type: 'promo', date: '2023-10-20', status: 'sent' }
  ]);
  
  const [propertyFilter, setPropertyFilter] = useState<'pending' | 'all'>('pending');
  const [rejectDialog, setRejectDialog] = useState<{ isOpen: boolean; propertyId: string; reason: string }>({
      isOpen: false, propertyId: '', reason: ''
  });

  const [confirmation, setConfirmation] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action: () => void;
    variant: 'danger' | 'warning' | 'info';
  }>({ isOpen: false, title: '', description: '', action: () => {}, variant: 'warning' });

  const triggerCriticalAction = (title: string, description: string, action: () => void, variant: 'danger' | 'warning' | 'info' = 'warning') => {
    setConfirmation({ isOpen: true, title, description, action, variant });
  };

  const handleConfirmAction = () => {
    confirmation.action();
    setConfirmation({ ...confirmation, isOpen: false });
  };

  const addSystemLog = (level: SystemLog['level'], action: string, message: string, statusCode?: number) => {
      const newLog: SystemLog = {
          id: `sys_${Date.now()}`,
          level,
          action,
          message,
          timestamp: new Date().toISOString(),
          statusCode,
          ip: '10.0.0.1'
      };
      setSystemLogs(prev => [newLog, ...prev]);
  };

  // --- IAM HANDLERS & EMERGENCY FUNCTIONS ---

  const handleIamEmergencyAction = (type: 'reset_pass' | 'block' | 'unblock' | 'offboard', user: User) => {
      setIamEmergency({ isOpen: true, type, user });
      setEmergencyReason('');
      setBlockType('session');
  };

  const executeEmergencyAction = () => {
      const { type, user } = iamEmergency;
      if (!user || !type) return;

      if (type === 'reset_pass') {
          // Trigger External Action via Prop
          // In reality this might generate a temp password and email it.
          const tempPass = Math.random().toString(36).slice(-8).toUpperCase();
          // We can't actually change the password on the User object here without extending the type, 
          // but we can log the action and simulate the "Force Logout" effect by updating the accountStatus momentarily or relying on the backend.
          // For Kiá Connect, we update the user status if needed, but primarily log it.
          addAuditLog(
              'IAM_FORCE_PASSWORD_RESET', 
              user.id, 
              `Sessões invalidadas. Credencial temporária enviada para ${user.email}.`, 
              'SUCCESS'
          );
          alert(`Sessão invalidada com sucesso. Nova senha temporária enviada ao utilizador: ${tempPass}`);
      }

      if (type === 'block') {
          const newStatus = blockType === 'fraud' ? 'suspended_legal' : 'blocked';
          const logMsg = blockType === 'fraud' 
              ? `Bloqueio por FRAUDE. Motivo: ${emergencyReason}` 
              : `Bloqueio de SESSÃO. Motivo: ${emergencyReason}`;
          
          // Kiá Connect: Update global state
          onUpdateUser(user.id, { accountStatus: newStatus }, logMsg);
          addAuditLog('IAM_BLOCK_USER', user.id, logMsg, blockType === 'fraud' ? 'WARNING' : 'SUCCESS');
      }

      if (type === 'unblock') {
          if (!emergencyReason) {
              alert("Justificativa obrigatória para desbloqueio.");
              return;
          }
          // Kiá Connect: Update global state
          onUpdateUser(user.id, { accountStatus: 'active' }, `Desbloqueio: ${emergencyReason}`);
          addAuditLog('IAM_UNBLOCK_USER', user.id, `Desbloqueio manual. Justificativa: ${emergencyReason}`, 'WARNING');
      }

      if (type === 'offboard') {
          // Offboarding logic: Block + Rename to deactivate
          onUpdateUser(user.id, { accountStatus: 'blocked', name: `[DESATIVADO] ${user.name}` }, 'Offboarding de Staff');
          addAuditLog('IAM_OFFBOARDING_STAFF', user.id, `Colaborador desativado permanentemente. Sessões mortas.`, 'SUCCESS');
      }

      setIamEmergency({ isOpen: false, type: null, user: null });
  };

  // IAM: Create & Edit Handlers
  const openCreateUserModal = () => {
      setIamFormData({ name: '', email: '', role: 'collaborator', justification: '' });
      setIamModal({ isOpen: true, type: 'create' });
  };

  const openEditRoleModal = (user: User) => {
      setIamFormData({ name: user.name, email: user.email, role: user.role, justification: '' });
      setIamModal({ isOpen: true, type: 'edit_role', user });
  };

  const handleIamSubmit = () => {
      if (iamModal.type === 'create') {
          // Create Logic (Simulated - ideally should call a prop onAddUser)
          // For now we just alert as full create flow isn't in the prompt scope for "Kiá Connect" integration actions
          alert("Funcionalidade de criação de utilizador interno simulada.");
      } else {
          // Edit Role
          if (!iamModal.user) return;
          if (!iamFormData.justification || iamFormData.justification.length < 10) {
              alert("A justificativa de auditoria é obrigatória e deve ter detalhe suficiente.");
              return;
          }
          
          // Kiá Connect: Sync role change
          onUpdateUser(iamModal.user.id, { role: iamFormData.role }, `Alteração de Role: ${iamFormData.justification}`);
          
          addAuditLog(
              'IAM_CHANGE_PERMISSION', 
              iamModal.user.id, 
              `Role alterada de ${iamModal.user.role} para ${iamFormData.role}. Justificativa: ${iamFormData.justification}`, 
              'WARNING'
          );
      }
      setIamModal({ isOpen: false, type: 'create' });
  };

  // --- IT HANDLERS ---
  const handlePurgeCache = () => {
      triggerCriticalAction(
          'Limpar Cache Global (CDN)',
          'Isto irá limpar o cache de imagens e assets estáticos em todos os pontos de presença. Pode causar lentidão temporária. Confirmar?',
          () => {
              alert("Cache invalidado com sucesso. A propagação pode demorar 2 minutos.");
              addSystemLog('info', 'CACHE_PURGE', 'Global CDN cache cleared manually by admin.');
          },
          'warning'
      );
  };

  const handleSimulatePayment = () => {
      alert("Ambiente Sandbox: Transação simulada de 3.000 AOA criada. Verificar logs.");
      addSystemLog('info', 'PAYMENT_SIMULATION', 'Mock transaction 3000 AOA executed in sandbox.', 200);
  };

  // --- Handlers for Financial Security (New) ---
  const handleRequestVTTEdit = (txId: string) => {
      setEditingVttId(txId);
      setTempVttValue('');
  };

  const submitVTTRequest = (txId: string) => {
      const val = parseFloat(tempVttValue);
      if (isNaN(val) || val <= 0) {
          alert('Valor inválido.');
          return;
      }

      setFinanceTransactions(prev => prev.map(tx => 
          tx.id === txId 
          ? { 
              ...tx, 
              vttEditRequest: { 
                  active: true, 
                  newVtt: val, 
                  approvals: { analyst: false, legal: false, finance: false } 
              } 
            } 
          : tx
      ));
      setEditingVttId(null);
      addAuditLog('REQUEST_VTT_CHANGE', txId, `Pedido de alteração de VTT para ${val} iniciado.`, 'WARNING');
  };

  const handleApproveVTT = (txId: string, role: 'analyst' | 'legal' | 'finance') => {
      setFinanceTransactions(prev => prev.map(tx => {
          if (tx.id === txId && tx.vttEditRequest) {
              const newApprovals = { ...tx.vttEditRequest.approvals, [role]: true };
              
              // If all approved, update real VTT
              if (newApprovals.analyst && newApprovals.legal && newApprovals.finance) {
                  addAuditLog('FINALIZE_VTT_CHANGE', txId, `VTT alterado de ${tx.vtt} para ${tx.vttEditRequest.newVtt} após aprovação tripla.`, 'SUCCESS');
                  return {
                      ...tx,
                      vtt: tx.vttEditRequest.newVtt,
                      // Recalculate fee (2.5%)
                      feeCalculated: tx.vttEditRequest.newVtt * 0.025, 
                      vttEditRequest: undefined // Clear request
                  };
              }

              return {
                  ...tx,
                  vttEditRequest: { ...tx.vttEditRequest, approvals: newApprovals }
              };
          }
          return tx;
      }));
  };

  const handleLockTransaction = (txId: string) => {
      triggerCriticalAction(
          'Congelar Dados Financeiros',
          'Esta ação é irreversível. O VTT, Receitas e Custos serão trancados permanentemente para auditoria e fecho de contas. Confirmar?',
          () => {
              setFinanceTransactions(prev => prev.map(tx => 
                  tx.id === txId ? { ...tx, isLocked: true } : tx
              ));
              addAuditLog('LOCK_FINANCIAL_DATA', txId, 'Transação trancada para fecho contabilístico.', 'SUCCESS');
          },
          'danger'
      );
  };

  const handleCrossCheckPayment = (txId: string) => {
      // Simulate checking bank API
      setTimeout(() => {
          const mockHash = `SHA:${Math.random().toString(36).substring(2, 15).toUpperCase()}`;
          setFinanceTransactions(prev => prev.map(tx => 
              tx.id === txId ? { ...tx, paymentHash: mockHash } : tx
          ));
          addAuditLog('PAYMENT_CROSS_CHECK', txId, `Hash gerado: ${mockHash}. Valor validado com Banco.`, 'SUCCESS');
      }, 1000);
  };

  // --- Handlers for Contract Engine ---
  const handleEditClause = (clause: LegalClause) => {
      setEditingClause(clause);
      setEditorTitle(clause.title);
      setEditorContent(clause.content);
  };

  const handleSaveDraftClause = () => {
      if (!editingClause) return;
      const nextVersion = `${parseFloat(editingClause.version).toFixed(1)}-draft`;
      
      setLegalClauses(prev => prev.map(c => 
          c.id === editingClause.id ? { 
              ...c, 
              title: editorTitle, 
              content: editorContent, 
              status: 'draft', 
              version: nextVersion,
              lastUpdated: new Date().toISOString().split('T')[0]
          } : c
      ));
      
      addAuditLog('EDIT_CLAUSE_DRAFT', editingClause.id, `Rascunho salvo: ${nextVersion}`, 'SUCCESS');
      setEditingClause(null);
  };

  const handlePublishClause = () => {
      if (!editingClause) return;
      // Increment version number
      const currentVer = parseFloat(editingClause.version);
      const nextVer = (currentVer + 0.1).toFixed(1);

      triggerCriticalAction(
          'Aprovar e Publicar Cláusula',
          `Esta ação irá atualizar o Motor de Contratos (IA) com a versão ${nextVer}. Certifique-se que não existem impedimentos legais.`,
          () => {
              setLegalClauses(prev => prev.map(c => 
                  c.id === editingClause.id ? { 
                      ...c, 
                      title: editorTitle, 
                      content: editorContent, 
                      status: 'approved', 
                      version: nextVer,
                      approvedBy: currentUserRole,
                      lastUpdated: new Date().toISOString().split('T')[0]
                  } : c
              ));
              addAuditLog('PUBLISH_CLAUSE', editingClause.id, `Versão ${nextVer} aprovada e publicada.`, 'SUCCESS');
              setEditingClause(null);
          },
          'info'
      );
  };

  // --- Handlers for Forensic Analysis ---
  const handleViewForensics = (alert: LegalAlert) => {
      setSelectedAlert(alert);
  };

  const handleSuspendTransaction = (alertId: string, userId: string, txId?: string) => {
    triggerCriticalAction(
        'Suspender Transação',
        'Isto irá bloquear os fundos em Escrow e impedir o fecho do contrato. Confirmar?',
        () => {
            setLegalAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'suspended_transaction' } : a));
            if (txId) {
                setTransactions(prev => prev.map(t => t.id === txId ? { ...t, status: 'suspended_fraud' } : t));
            }
            addAuditLog('SUSPEND_TRANSACTION', txId || 'N/A', `Transação suspensa devido a alerta ${alertId}`, 'WARNING');
        },
        'danger'
    );
  };

  // --- NEW ACTIONS FOR SUPERVISION ---
  const handleUnilateralSuspension = (targetUserId: string) => {
      triggerCriticalAction(
          'Suspensão Unilateral (Jurídica)',
          'Esta ação anula qualquer estado anterior e bloqueia definitivamente o utilizador e suas transações ativas. Notificação legal (SMS/Email) será enviada às partes.',
          () => {
              // Kiá Connect: Update User
              onUpdateUser(targetUserId, { accountStatus: 'suspended_legal' }, 'Suspensão Unilateral pelo PCC');
              addAuditLog('LEGAL_SUSPENSION_UNILATERAL', targetUserId, 'Suspensão total decretada pelo PCC.', 'WARNING');
          },
          'danger'
      );
  };

  const handleUnlockWithRestrictions = (targetUserId: string) => {
      triggerCriticalAction(
          'Desbloqueio Condicional',
          'O utilizador será desbloqueado, mas com limite de transação de 100.000 AOA e monitorização ativa.',
          () => {
              onUpdateUser(targetUserId, { accountStatus: 'active' }, 'Desbloqueio Condicional');
              addAuditLog('LEGAL_UNLOCK_RESTRICTED', targetUserId, 'Desbloqueio condicional aplicado.', 'SUCCESS');
          },
          'warning'
      );
  };

  const handleDownloadLegalReport = (targetUserId: string) => {
      alert('A gerar relatório PDF certificado...');
      addAuditLog('GENERATE_LEGAL_REPORT', targetUserId, 'Relatório forense gerado.', 'SUCCESS');
  };

  const handleSearchUser = () => {
      const found = users.find(u => u.email.includes(supervisionQuery) || u.name.includes(supervisionQuery) || u.id === supervisionQuery);
      if (found) {
          setSupervisionUser(found);
      } else {
          alert('Utilizador não encontrado.');
          setSupervisionUser(null);
      }
  };

  // --- FINANCE HANDLERS (UPDATED for Double Approval) ---
  const handleApproveRefundStep = (refundId: string, currentStage: string) => {
      if (currentStage === 'analyst_review') {
          // STEP 1: Analyst Validation
          triggerCriticalAction(
              'Validação Inicial (Analista)',
              'Confirma que a justificação é válida e a documentação está completa? O pedido será enviado para o Departamento Jurídico.',
              () => {
                  setRefundQueue(prev => prev.map(r => r.id === refundId ? { ...r, stage: 'legal_review' } : r));
                  addAuditLog('REFUND_VALIDATION_ANALYST', refundId, 'Validação de suporte e documentação concluída. Encaminhado para Jurídico.', 'SUCCESS');
              },
              'info'
          );
      } else if (currentStage === 'legal_review') {
          // STEP 2: Legal/Finance Approval
          triggerCriticalAction(
              'Aprovação Final (Jurídico/Finanças)',
              'Esta ação autoriza o desembolso financeiro imediato. Certifique-se que não existem impedimentos legais.',
              () => {
                  setRefundQueue(prev => prev.map(r => r.id === refundId ? { ...r, stage: 'approved' } : r));
                  addAuditLog('REFUND_APPROVAL_LEGAL', refundId, 'Autorização de desembolso concedida.', 'SUCCESS');
                  
                  // STEP 3: System Processing Simulation
                  setTimeout(() => {
                       addAuditLog('SYSTEM_PAYMENT_EXECUTION', refundId, 'Ordem de pagamento enviada ao banco. Ref: PAY-' + Date.now(), 'SUCCESS');
                  }, 1000);
              },
              'warning'
          );
      }
  };

  const handleSearchClosureUser = () => {
      const found = users.find(u => u.email.includes(closureSearch) || u.name.includes(closureSearch));
      if (found) {
          setClosureTarget(found);
          setClosureReportGenerated(false);
      } else {
          alert("Utilizador não encontrado para fecho de conta.");
          setClosureTarget(null);
      }
  };

  const handleGenerateLiquidationReport = () => {
      if(!closureTarget) return;
      alert("Relatório de Liquidação Final (LBC) gerado e pronto para download.");
      addAuditLog('GENERATE_LIQUIDATION_REPORT', closureTarget.id, 'Relatório de saldos e quitação gerado para fecho de conta.', 'SUCCESS');
      setClosureReportGenerated(true);
  };

  const handleCloseAccount = () => {
      if(!closureTarget) return;
      triggerCriticalAction(
          'Encerrar Conta Definitivamente',
          'Isto irá liquidar saldos pendentes, arquivar dados conforme a LBC e desativar o acesso. Ação legal mandatória.',
          () => {
              onUpdateUser(closureTarget.id, { accountStatus: 'blocked', name: `[ENCERRADO] ${closureTarget.name}` }, 'Fecho de Conta (Solicitado)');
              alert(`Conta de ${closureTarget.name} encerrada e relatório de liquidação arquivado.`);
              addAuditLog('ACCOUNT_CLOSURE_FINAL', closureTarget.id, 'Conta encerrada, saldos liquidados e relatório arquivado.', 'WARNING');
              setClosureTarget(null);
              setClosureSearch('');
              setClosureReportGenerated(false);
          },
          'danger'
      );
  };

  const openRejectDialog = (propertyId: string) => {
    setRejectDialog({ isOpen: true, propertyId, reason: '' });
  };

  const confirmRejection = () => {
    if (!rejectDialog.propertyId || !rejectDialog.reason) return;
    
    // Kiá Connect: Update Property Status via Prop -> Triggers Notification in App.tsx
    onUpdateProperty(rejectDialog.propertyId, { 
        status: 'rejected', 
        rejectionReason: rejectDialog.reason 
    });
    
    addAuditLog('REJECT_PROPERTY', rejectDialog.propertyId, `Rejeitado: ${rejectDialog.reason}`, 'SUCCESS');
    
    setRejectDialog({ isOpen: false, propertyId: '', reason: '' });
    setViewingProperty(null); // Close modal
  };

  const handlePropertyAction = (propertyId: string, action: 'approve' | 'reject') => {
    if (action === 'approve') {
        triggerCriticalAction(
            'Aprovar Imóvel',
            'O imóvel ficará disponível para pagamento da taxa de publicação pelo proprietário. Confirmar?',
            () => {
                // Kiá Connect: Update Property Status via Prop -> Triggers Notification in App.tsx
                onUpdateProperty(propertyId, { status: 'approved_waiting_payment' });
                addAuditLog('APPROVE_PROPERTY', propertyId, 'Imóvel aprovado, aguardando pagamento.', 'SUCCESS');
                setViewingProperty(null);
            },
            'info'
        );
    } else {
         openRejectDialog(propertyId);
    }
  };

  // --- COMPLIANCE / KIA VERIFY HANDLERS ---

  const handleOpenVerification = (req: VerificationRequest) => {
      setSelectedVerification(req);
      setDocumentRevealed(false);
      setFieldValidation({ name: 'idle', bi: 'idle', address: 'idle', face: 'idle' });
      setVerificationNote('');
      // Check for blacklist match (Mock)
      if(req.userId === 'usr_suspicious_99') {
          alert("ALERTA: NIF detetado na lista negra de fraudes anteriores.");
      }
  };

  const handleRevealDocument = () => {
      if (!selectedVerification) return;
      setDocumentRevealed(true);
      addAuditLog('VIEW_SECURE_DOCUMENT', selectedVerification.id, `Documento ${selectedVerification.type} visualizado.`, 'SUCCESS');
  };

  const toggleFieldValidation = (field: string) => {
      setFieldValidation(prev => ({
          ...prev,
          [field]: prev[field] === 'valid' ? 'invalid' : 'valid'
      }));
  };

  const handleVerificationDecision = (decision: 'approve' | 'reject' | 'review') => {
      if (!selectedVerification) return;

      const actionMap = {
          approve: { title: 'Aprovar Conformidade', desc: 'Isto irá validar o utilizador e permitir a emissão de contratos. Confirmar?' },
          reject: { title: 'Rejeitar por Falha Grave', desc: 'O utilizador será bloqueado e marcado por fraude. Notificação legal enviada.' },
          review: { title: 'Solicitar Revisão', desc: 'A transação será suspensa até o utilizador corrigir os documentos.' }
      };

      triggerCriticalAction(
          actionMap[decision].title,
          actionMap[decision].desc,
          () => {
              // Update Queue
              setVerificationQueue(prev => prev.map(v => 
                  v.id === selectedVerification.id 
                  ? { ...v, status: decision === 'approve' ? 'approved' : decision === 'reject' ? 'rejected' : 'review_needed', reviewNotes: verificationNote } 
                  : v
              ));

              // Kiá Connect Protocol: Trigger Notification if status changes
              // (In real app, queue update would trigger an event)
              if (decision === 'approve') {
                  // Protocol Action: Approve Dossier
                  onUpdateUser(selectedVerification.userId, { isIdentityVerified: true, accountStatus: 'active' }, 'Aprovação do Dossiê Kiá Verify');
              } else if (decision === 'reject') {
                  onUpdateUser(selectedVerification.userId, { accountStatus: 'suspended_legal' }, 'Rejeição Documental Grave');
              }

              // Log
              addAuditLog(
                  `VERIFY_DECISION_${decision.toUpperCase()}`, 
                  selectedVerification.userId, 
                  `Decisão: ${decision}. Notas: ${verificationNote}`, 
                  decision === 'approve' ? 'SUCCESS' : 'WARNING'
              );

              // If Reject, Create Alert
              if (decision === 'reject') {
                  setLegalAlerts(prev => [{
                      id: `alert_${Date.now()}`,
                      severity: 'critical',
                      type: 'document_fraud',
                      targetUser: selectedVerification.userId,
                      targetUserName: 'Utilizador Rejeitado',
                      description: `Rejeição por fraude documental: ${verificationNote}`,
                      timestamp: new Date().toISOString(),
                      status: 'open'
                  }, ...prev]);
              }

              setSelectedVerification(null);
          },
          decision === 'approve' ? 'info' : decision === 'reject' ? 'danger' : 'warning'
      );
  };

  // --- BLOG / CMS HANDLERS ---
  const handleOpenPostEditor = (post?: BlogPost) => {
    if (post) {
      setEditingPost(JSON.parse(JSON.stringify(post))); // Deep copy
    } else {
      // Create new post template
      const d = new Date();
      const newPost: BlogPost = {
        id: `post_${Date.now()}`, title: '', subtitle: '', slug: '',
        author: 'Novo Autor', category: 'news', status: 'draft',
        date: `${d.getDate()} ${d.toLocaleString('pt-PT', { month: 'short' }).replace('.', '')} ${d.getFullYear()}`,
        content: '<p>Comece a escrever...</p>', excerpt: ''
      };
      setEditingPost(newPost);
    }
    setPostRejectionReason('');
  };

  const handleSavePost = () => {
    if (!editingPost) return;

    if(editingPost.id.startsWith('post_new')) {
        onAddBlogPost(editingPost);
    } else {
        onUpdateBlogPost(editingPost.id, editingPost);
    }

    addAuditLog('SAVE_CONTENT_DRAFT', editingPost.id, `Conteúdo '${editingPost.title}' salvo como rascunho.`, 'SUCCESS');
    setEditingPost(null);
  };

  const handleSubmitForReview = () => {
      if(!editingPost) return;
      onUpdateBlogPost(editingPost.id, { ...editingPost, status: 'pending_legal' });
      addAuditLog('SUBMIT_CONTENT_REVIEW', editingPost.id, 'Conteúdo submetido para revisão legal.', 'SUCCESS');
      setEditingPost(null);
  };

  const handlePublishPost = () => {
      if(!editingPost) return;
      onUpdateBlogPost(editingPost.id, { ...editingPost, status: 'published', approvedBy: currentUserRole });
      addAuditLog('PUBLISH_CONTENT', editingPost.id, 'Conteúdo publicado com sucesso.', 'SUCCESS');
      setEditingPost(null);
  };
  
  const handleRejectPost = () => {
      if(!editingPost || !postRejectionReason) {
          alert('A justificativa de rejeição é obrigatória.');
          return;
      }
      onUpdateBlogPost(editingPost.id, { status: 'rejected', rejectionReason: postRejectionReason });
      addAuditLog('REJECT_CONTENT', editingPost.id, `Conteúdo rejeitado. Motivo: ${postRejectionReason}`, 'WARNING');
      setEditingPost(null);
  };

  const filteredBlogPosts = blogPosts.filter(p => {
      if(blogStatusFilter === 'all') return true;
      return p.status === blogStatusFilter;
  });

  const renderOperations = () => (
    <div className="space-y-6 animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">Gestão de Imóveis</h3>
            <div className="flex space-x-2">
                <button 
                    onClick={() => setPropertyFilter('pending')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold ${propertyFilter === 'pending' ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 border'}`}
                >
                    Pendentes
                </button>
                <button 
                    onClick={() => setPropertyFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold ${propertyFilter === 'all' ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 border'}`}
                >
                    Todos
                </button>
            </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-xs">
                    <tr>
                        <th className="p-4">Imóvel</th>
                        <th className="p-4">Proprietário</th>
                        <th className="p-4">Preço</th>
                        <th className="p-4">Estado</th>
                        <th className="p-4 text-right">Ação</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {properties
                        .filter(p => propertyFilter === 'pending' ? p.status === 'pending' : true)
                        .map(p => (
                        <tr key={p.id} className="hover:bg-gray-50">
                            <td className="p-4">
                                <div className="flex items-center space-x-3">
                                    <img src={p.images[0]} className="w-10 h-10 rounded object-cover" alt="" />
                                    <div>
                                        <p className="font-bold text-gray-900">{p.title}</p>
                                        <p className="text-xs text-gray-500">{p.location.municipality}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4 text-gray-600">{p.ownerId}</td>
                            <td className="p-4 font-mono font-bold">{p.price.toLocaleString()} {p.currency}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                    p.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    p.status === 'available' ? 'bg-green-100 text-green-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {p.status}
                                </span>
                            </td>
                            <td className="p-4 text-right">
                                <button 
                                    onClick={() => setViewingProperty(p)}
                                    className="text-brand-600 hover:text-brand-800 font-bold text-xs"
                                >
                                    Gerir
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );

  const renderFinance = () => (
    <div className="space-y-6 animate-fadeIn">
         <div className="flex space-x-2 border-b border-gray-200 overflow-x-auto pb-1 mb-4">
             {['vtt_dashboard', 'fee_audit', 'disputes', 'costs', 'account_closure'].map(tab => (
                 <button 
                     key={tab}
                     onClick={() => setFinanceTab(tab as any)}
                     className={`px-4 py-2 text-sm font-bold whitespace-nowrap ${financeTab === tab ? 'text-brand-600 border-b-2 border-brand-600' : 'text-gray-500 hover:text-gray-800'}`}
                 >
                     {tab.replace('_', ' ').toUpperCase()}
                 </button>
             ))}
         </div>

         {financeTab === 'vtt_dashboard' && (
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                 <h3 className="font-bold text-lg mb-4">Dashboard VTT (Valor Total de Transação)</h3>
                 <table className="w-full text-sm text-left">
                     <thead>
                         <tr className="text-xs text-gray-500 uppercase border-b">
                             <th className="py-2">Ref Transação</th>
                             <th className="py-2">VTT (Base)</th>
                             <th className="py-2">Fee (2.5%)</th>
                             <th className="py-2">Estado</th>
                             <th className="py-2 text-right">Ações</th>
                         </tr>
                     </thead>
                     <tbody>
                         {financeTransactions.map(tx => (
                             <tr key={tx.id} className="border-b last:border-0 hover:bg-gray-50">
                                 <td className="py-3 font-mono">{tx.id}</td>
                                 <td className="py-3 font-bold">
                                     {editingVttId === tx.id ? (
                                         <div className="flex items-center space-x-2">
                                             <input 
                                                 type="number" 
                                                 className="w-24 p-1 border rounded"
                                                 value={tempVttValue}
                                                 onChange={e => setTempVttValue(e.target.value)}
                                             />
                                             <button onClick={() => submitVTTRequest(tx.id)} className="text-green-600"><CheckCircle className="w-4 h-4"/></button>
                                         </div>
                                     ) : (
                                         <span>{tx.vtt.toLocaleString()} AOA</span>
                                     )}
                                     {tx.vttEditRequest?.active && (
                                         <span className="ml-2 text-[10px] bg-yellow-100 text-yellow-800 px-1 rounded">Em Revisão</span>
                                     )}
                                 </td>
                                 <td className="py-3 text-green-600">{tx.feeCalculated.toLocaleString()} AOA</td>
                                 <td className="py-3">
                                     {tx.isLocked ? <Lock className="w-4 h-4 text-red-500" /> : <Unlock className="w-4 h-4 text-green-500" />}
                                 </td>
                                 <td className="py-3 text-right space-x-2">
                                     {!tx.isLocked && (
                                         <>
                                             <button onClick={() => handleRequestVTTEdit(tx.id)} className="text-blue-600 hover:underline text-xs">Editar VTT</button>
                                             <button onClick={() => handleLockTransaction(tx.id)} className="text-red-600 hover:underline text-xs">Trancar</button>
                                         </>
                                     )}
                                     {tx.vttEditRequest?.active && (
                                         <div className="flex justify-end space-x-1 mt-1">
                                             <button onClick={() => handleApproveVTT(tx.id, 'analyst')} disabled={tx.vttEditRequest.approvals.analyst} className={`p-1 rounded ${tx.vttEditRequest.approvals.analyst ? 'bg-green-200' : 'bg-gray-200'}`} title="Analista">A</button>
                                             <button onClick={() => handleApproveVTT(tx.id, 'legal')} disabled={tx.vttEditRequest.approvals.legal} className={`p-1 rounded ${tx.vttEditRequest.approvals.legal ? 'bg-green-200' : 'bg-gray-200'}`} title="Jurídico">L</button>
                                             <button onClick={() => handleApproveVTT(tx.id, 'finance')} disabled={tx.vttEditRequest.approvals.finance} className={`p-1 rounded ${tx.vttEditRequest.approvals.finance ? 'bg-green-200' : 'bg-gray-200'}`} title="Finanças">F</button>
                                         </div>
                                     )}
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
         )}
         
         {financeTab === 'disputes' && (
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                 <h3 className="font-bold text-lg mb-4">Fila de Reembolsos (Disputas)</h3>
                 {refundQueue.map(refund => (
                     <div key={refund.id} className="border-b last:border-0 py-4 flex justify-between items-center">
                         <div>
                             <p className="font-bold text-gray-800">{refund.reason}</p>
                             <p className="text-xs text-gray-500">ID: {refund.id} | TX: {refund.txId} | {refund.amount.toLocaleString()} AOA</p>
                             <p className="text-xs text-blue-600 mt-1">Estado: {refund.stage.replace('_', ' ').toUpperCase()}</p>
                         </div>
                         <div>
                             {refund.stage === 'analyst_review' && (
                                 <button onClick={() => handleApproveRefundStep(refund.id, 'analyst_review')} className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold">Validar (Analista)</button>
                             )}
                             {refund.stage === 'legal_review' && (
                                 <button onClick={() => handleApproveRefundStep(refund.id, 'legal_review')} className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold">Aprovar Pagamento</button>
                             )}
                             {refund.stage === 'approved' && (
                                 <span className="text-green-600 font-bold text-xs flex items-center"><CheckCircle className="w-4 h-4 mr-1"/> Pago</span>
                             )}
                         </div>
                     </div>
                 ))}
             </div>
         )}

         {financeTab === 'account_closure' && (
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-2xl">
                 <h3 className="font-bold text-lg mb-4 text-red-700">Encerramento de Conta & Liquidação (LBC)</h3>
                 <div className="flex space-x-2 mb-4">
                     <input 
                         type="text" 
                         placeholder="Pesquisar utilizador..." 
                         className="flex-1 p-2 border rounded"
                         value={closureSearch}
                         onChange={e => setClosureSearch(e.target.value)}
                     />
                     <button onClick={handleSearchClosureUser} className="bg-gray-800 text-white px-4 py-2 rounded font-bold">Buscar</button>
                 </div>
                 
                 {closureTarget && (
                     <div className="bg-red-50 p-4 rounded border border-red-200 animate-fadeIn">
                         <p className="font-bold text-gray-900 mb-2">Alvo: {closureTarget.name} ({closureTarget.email})</p>
                         <p className="text-sm text-gray-600 mb-4">Saldo em Escrow: 0.00 AOA (Verificado)</p>
                         
                         <div className="flex space-x-3">
                             {!closureReportGenerated ? (
                                 <button onClick={handleGenerateLiquidationReport} className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold">1. Gerar LBC</button>
                             ) : (
                                 <button onClick={handleCloseAccount} className="bg-red-600 text-white px-4 py-2 rounded text-sm font-bold">2. Encerrar Conta Definitivamente</button>
                             )}
                         </div>
                     </div>
                 )}
             </div>
         )}
    </div>
  );

  const renderSecurity = () => (
      <div className="space-y-6 animate-fadeIn">
          <div className="flex space-x-4 mb-6">
              <button 
                onClick={() => setSecurityTab('verify')}
                className={`px-4 py-2 rounded-lg font-bold ${securityTab === 'verify' ? 'bg-brand-600 text-white' : 'bg-white text-gray-600'}`}
              >
                  Fila de Verificação
              </button>
              <button 
                onClick={() => setSecurityTab('audits')}
                className={`px-4 py-2 rounded-lg font-bold ${securityTab === 'audits' ? 'bg-brand-600 text-white' : 'bg-white text-gray-600'}`}
              >
                  Logs de Segurança
              </button>
          </div>

          {securityTab === 'verify' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Queue List */}
                  <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="p-4 bg-gray-50 border-b font-bold text-gray-700">Pedidos Pendentes ({verificationQueue.filter(v => v.status !== 'approved' && v.status !== 'rejected').length})</div>
                      <div className="divide-y divide-gray-100">
                          {verificationQueue.filter(v => v.status !== 'approved' && v.status !== 'rejected').map(req => (
                              <div 
                                  key={req.id} 
                                  onClick={() => handleOpenVerification(req)}
                                  className={`p-4 cursor-pointer hover:bg-brand-50 transition-colors ${selectedVerification?.id === req.id ? 'bg-brand-50 border-l-4 border-brand-500' : ''}`}
                              >
                                  <div className="flex justify-between items-start">
                                      <span className="font-bold text-sm text-gray-900 capitalize">{req.type.replace('_', ' ')}</span>
                                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${req.status === 'review_needed' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                          {req.status.replace('_', ' ')}
                                      </span>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">User: {req.userId}</p>
                                  <p className="text-xs text-gray-400">{req.submittedAt}</p>
                              </div>
                          ))}
                          {verificationQueue.filter(v => v.status !== 'approved' && v.status !== 'rejected').length === 0 && (
                              <div className="p-8 text-center text-gray-400 text-sm">Fila vazia. Bom trabalho!</div>
                          )}
                      </div>
                  </div>

                  {/* Detail View */}
                  <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative min-h-[400px]">
                      {selectedVerification ? (
                          <div className="animate-fadeIn">
                              <div className="flex justify-between items-start mb-6">
                                  <div>
                                      <h3 className="text-xl font-bold text-gray-900 capitalize">{selectedVerification.type.replace('_', ' ')}</h3>
                                      <p className="text-sm text-gray-500">Submetido por {selectedVerification.userId} em {selectedVerification.submittedAt}</p>
                                  </div>
                                  <div className="flex space-x-2">
                                      <button onClick={() => handleVerificationDecision('review')} className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-yellow-600">Pedir Revisão</button>
                                      <button onClick={() => handleVerificationDecision('reject')} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-700">Rejeitar (Fraude)</button>
                                      <button onClick={() => handleVerificationDecision('approve')} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-700">Aprovar Dossiê</button>
                                  </div>
                              </div>

                              <div className="grid grid-cols-2 gap-6 mb-6">
                                  {/* Document Preview */}
                                  <div className="bg-gray-900 rounded-lg overflow-hidden relative flex items-center justify-center h-80">
                                      {documentRevealed ? (
                                          <img src={selectedVerification.documentUrl} className="max-w-full max-h-full object-contain" alt="Doc" />
                                      ) : (
                                          <div className="text-center">
                                              <Lock className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                                              <p className="text-gray-400 text-sm mb-4">Documento Protegido (PII)</p>
                                              <button onClick={handleRevealDocument} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded text-sm font-bold border border-white/20">Revelar para Auditoria</button>
                                          </div>
                                      )}
                                  </div>

                                  {/* Checklist */}
                                  <div className="space-y-4">
                                      <h4 className="font-bold text-gray-700 border-b pb-2">Checklist de Conformidade</h4>
                                      {[
                                          { key: 'name', label: 'Nome Legível e Coincidente' },
                                          { key: 'bi', label: 'Número de BI/NIF Visível' },
                                          { key: 'address', label: 'Morada Confirmada' },
                                          { key: 'face', label: 'Foto Clara (Sem reflexos)' }
                                      ].map(item => (
                                          <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100" onClick={() => toggleFieldValidation(item.key)}>
                                              <span className="text-sm text-gray-700">{item.label}</span>
                                              {fieldValidation[item.key] === 'valid' 
                                                  ? <CheckCircle className="w-5 h-5 text-green-500" />
                                                  : <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                                              }
                                          </div>
                                      ))}
                                      
                                      <div className="mt-4">
                                          <label className="text-xs font-bold text-gray-500 uppercase">Notas do Auditor</label>
                                          <textarea 
                                              className="w-full mt-1 p-2 border border-gray-300 rounded text-sm h-24"
                                              placeholder="Justifique a decisão..."
                                              value={verificationNote}
                                              onChange={(e) => setVerificationNote(e.target.value)}
                                          ></textarea>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      ) : (
                          <div className="flex flex-col items-center justify-center h-full text-gray-400">
                              <FileSearch className="w-16 h-16 mb-4 opacity-50" />
                              <p className="font-medium">Selecione um pedido para auditar</p>
                          </div>
                      )}
                  </div>
              </div>
          )}
          
          {securityTab === 'audits' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 text-gray-600">
                          <tr>
                              <th className="p-4">Timestamp</th>
                              <th className="p-4">Ação</th>
                              <th className="p-4">Ator</th>
                              <th className="p-4">Alvo</th>
                              <th className="p-4">Detalhes</th>
                              <th className="p-4">Status</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                          {auditLogs.map(log => (
                              <tr key={log.id} className="hover:bg-gray-50">
                                  <td className="p-4 font-mono text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                                  <td className="p-4 font-bold">{log.action}</td>
                                  <td className="p-4 text-gray-600">{log.actor}</td>
                                  <td className="p-4 text-gray-600">{log.target}</td>
                                  <td className="p-4 max-w-xs truncate" title={log.details}>{log.details}</td>
                                  <td className="p-4">
                                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                                          log.status === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                                          log.status === 'FAIL' ? 'bg-red-100 text-red-800' :
                                          'bg-yellow-100 text-yellow-800'
                                      }`}>{log.status}</span>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          )}
      </div>
  );

  const renderCompliance = () => (
      <div className="space-y-6 animate-fadeIn">
          <div className="flex space-x-2 border-b border-gray-200 overflow-x-auto pb-1 mb-4">
              {['risk_dashboard', 'supervision', 'fraud_alerts'].map(tab => (
                  <button 
                      key={tab}
                      onClick={() => setComplianceTab(tab as any)}
                      className={`px-4 py-2 text-sm font-bold whitespace-nowrap ${complianceTab === tab ? 'text-brand-600 border-b-2 border-brand-600' : 'text-gray-500 hover:text-gray-800'}`}
                  >
                      {tab.replace('_', ' ').toUpperCase()}
                  </button>
              ))}
          </div>

          {complianceTab === 'risk_dashboard' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                          <h4 className="text-gray-500 font-bold uppercase text-xs">Alertas Críticos</h4>
                          <ShieldAlert className="w-5 h-5 text-red-500" />
                      </div>
                      <p className="text-3xl font-bold text-gray-900">{legalAlerts.filter(a => a.severity === 'critical' && a.status === 'open').length}</p>
                      <p className="text-xs text-red-500 mt-1">Requerem Ação Imediata</p>
                  </div>
                  {/* More summary cards could be added here */}
              </div>
          )}

          {complianceTab === 'fraud_alerts' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                   <div className="p-4 bg-red-50 border-b border-red-100 font-bold text-red-800 flex items-center">
                       <Siren className="w-5 h-5 mr-2" /> Alertas de Fraude em Tempo Real
                   </div>
                   {legalAlerts.map(alert => (
                       <div key={alert.id} className="p-4 border-b last:border-0 hover:bg-gray-50">
                           <div className="flex justify-between items-start">
                               <div>
                                   <div className="flex items-center space-x-2">
                                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase text-white ${alert.severity === 'critical' ? 'bg-red-600' : 'bg-orange-500'}`}>
                                           {alert.severity}
                                       </span>
                                       <span className="font-bold text-gray-900">{alert.type.replace('_', ' ').toUpperCase()}</span>
                                   </div>
                                   <p className="text-sm text-gray-800 mt-1 font-medium">{alert.description}</p>
                                   <p className="text-xs text-gray-500 mt-1">Alvo: {alert.targetUserName} ({alert.targetUser})</p>
                               </div>
                               <div className="text-right">
                                   <p className="text-xs text-gray-400 mb-2">{new Date(alert.timestamp).toLocaleString()}</p>
                                   {alert.status === 'open' && (
                                       <div className="flex space-x-2 justify-end">
                                           <button onClick={() => handleViewForensics(alert)} className="text-blue-600 text-xs font-bold hover:underline">Análise Forense</button>
                                           <button onClick={() => handleSuspendTransaction(alert.id, alert.targetUser, alert.transactionId)} className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold hover:bg-red-200">Suspender</button>
                                       </div>
                                   )}
                                   {alert.status !== 'open' && (
                                       <span className="text-xs font-bold text-gray-500 uppercase">{alert.status.replace('_', ' ')}</span>
                                   )}
                               </div>
                           </div>
                           {/* Forensics Expanded View */}
                           {selectedAlert?.id === alert.id && (
                               <div className="mt-4 p-4 bg-gray-100 rounded border border-gray-300 animate-fadeIn">
                                   <h5 className="font-bold text-sm mb-2">Dados Forenses (Snapshot)</h5>
                                   <pre className="text-xs bg-black text-green-400 p-3 rounded overflow-x-auto font-mono">
                                       {JSON.stringify({
                                           ip: '197.230.XX.XX',
                                           device: 'Android SM-G991B',
                                           risk_score: 98,
                                           velocity_check: 'FAIL (3 attempts / 10s)',
                                           geo_match: 'MISMATCH (IP: Luanda / Profile: Benguela)'
                                       }, null, 2)}
                                   </pre>
                               </div>
                           )}
                       </div>
                   ))}
              </div>
          )}

          {complianceTab === 'supervision' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-bold text-lg mb-4">Supervisão de Utilizadores</h3>
                  <div className="flex space-x-2 mb-6">
                      <input 
                          type="text" 
                          placeholder="ID, Email ou Nome..." 
                          className="flex-1 p-2 border rounded"
                          value={supervisionQuery}
                          onChange={e => setSupervisionQuery(e.target.value)}
                      />
                      <button onClick={handleSearchUser} className="bg-gray-800 text-white px-4 py-2 rounded font-bold">Investigar</button>
                  </div>

                  {supervisionUser && (
                      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 animate-fadeIn">
                          <div className="flex justify-between items-start mb-4">
                              <div>
                                  <h4 className="text-xl font-bold text-gray-900">{supervisionUser.name}</h4>
                                  <p className="text-sm text-gray-600">{supervisionUser.email} | ID: {supervisionUser.id}</p>
                                  <p className="text-sm mt-1">
                                      Estado Atual: 
                                      <span className={`ml-2 px-2 py-0.5 rounded text-xs font-bold uppercase ${
                                          supervisionUser.accountStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                      }`}>
                                          {supervisionUser.accountStatus}
                                      </span>
                                  </p>
                              </div>
                              <div className="space-x-2">
                                  <button onClick={() => handleDownloadLegalReport(supervisionUser.id)} className="bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded text-xs font-bold hover:bg-gray-50">Relatório Legal (PDF)</button>
                              </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-200 pt-4">
                              <div className="bg-red-50 p-4 rounded border border-red-100">
                                  <h5 className="font-bold text-red-800 mb-2">Ações Punitivas</h5>
                                  <button onClick={() => handleUnilateralSuspension(supervisionUser.id)} className="w-full bg-red-600 text-white py-2 rounded font-bold text-sm hover:bg-red-700 mb-2">Suspensão Unilateral</button>
                                  <p className="text-[10px] text-red-600 leading-tight">Aplica bloqueio total e cancela ordens pendentes. Requer justificação em audit log.</p>
                              </div>
                              <div className="bg-yellow-50 p-4 rounded border border-yellow-100">
                                  <h5 className="font-bold text-yellow-800 mb-2">Ações Corretivas</h5>
                                  <button onClick={() => handleUnlockWithRestrictions(supervisionUser.id)} className="w-full bg-yellow-600 text-white py-2 rounded font-bold text-sm hover:bg-yellow-700 mb-2">Desbloqueio Condicional</button>
                                  <p className="text-[10px] text-yellow-800 leading-tight">Reativa conta com limites reduzidos e monitorização 24h.</p>
                              </div>
                          </div>
                      </div>
                  )}
              </div>
          )}
      </div>
  );

  const renderAudit = () => (
    <div className="space-y-6 animate-fadeIn">
        <h3 className="font-bold text-lg text-gray-800">Trilho de Auditoria do Sistema</h3>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                      <tr>
                          <th className="p-4">Data/Hora</th>
                          <th className="p-4">Ação</th>
                          <th className="p-4">Ator</th>
                          <th className="p-4">Alvo</th>
                          <th className="p-4">Resultado</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                      {auditLogs.map(log => (
                          <tr key={log.id} className="hover:bg-gray-50">
                              <td className="p-4 font-mono text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                              <td className="p-4 font-bold">{log.action}</td>
                              <td className="p-4 text-gray-600">{log.actor}</td>
                              <td className="p-4 text-gray-600">{log.target}</td>
                              <td className="p-4">
                                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                                      log.status === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                                      log.status === 'FAIL' ? 'bg-red-100 text-red-800' :
                                      'bg-yellow-100 text-yellow-800'
                                  }`}>{log.status}</span>
                              </td>
                          </tr>
                      ))}
                  </tbody>
             </table>
        </div>
    </div>
  );

  const renderTeam = () => (
      <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold mb-4">Equipa & Acessos</h3>
          <p className="text-gray-500 mb-4">
              A gestão de utilizadores internos foi centralizada no módulo <strong>IAM & Users</strong>.
              Por favor, aceda a esse módulo para criar, editar ou remover colaboradores.
          </p>
          <button 
              onClick={() => setActiveModule('iam')}
              className="bg-brand-600 text-white px-4 py-2 rounded-lg font-bold flex items-center"
          >
              <UserCog className="w-4 h-4 mr-2" /> Ir para IAM
          </button>
      </div>
  );

  const renderContracts = () => (
      <div className="space-y-6 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-lg mb-4">Motor de Contratos (Editor de Cláusulas)</h3>
              <p className="text-sm text-gray-500 mb-6">
                  Gestão das cláusulas padrão utilizadas pela IA na geração de contratos.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Clauses List */}
                  <div className="md:col-span-1 border-r border-gray-100 pr-4">
                      <h4 className="font-bold text-sm text-gray-700 mb-3 uppercase">Biblioteca de Cláusulas</h4>
                      <div className="space-y-2">
                          {legalClauses.map(clause => (
                              <div 
                                  key={clause.id} 
                                  onClick={() => handleEditClause(clause)}
                                  className={`p-3 rounded border cursor-pointer hover:bg-gray-50 transition-colors ${editingClause?.id === clause.id ? 'bg-brand-50 border-brand-500' : 'border-gray-200'}`}
                              >
                                  <p className="font-bold text-sm text-gray-900">{clause.title}</p>
                                  <div className="flex justify-between items-center mt-1">
                                      <span className="text-xs text-gray-500">v{clause.version}</span>
                                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                          clause.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                      }`}>{clause.status}</span>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* Editor */}
                  <div className="md:col-span-2">
                      {editingClause ? (
                          <div className="animate-fadeIn">
                              <div className="mb-4">
                                  <label className="block text-sm font-bold text-gray-700 mb-1">Título da Cláusula</label>
                                  <input 
                                      type="text" 
                                      className="w-full p-2 border border-gray-300 rounded"
                                      value={editorTitle}
                                      onChange={e => setEditorTitle(e.target.value)}
                                  />
                              </div>
                              <div className="mb-4">
                                  <label className="block text-sm font-bold text-gray-700 mb-1">Conteúdo Legal (Texto Base)</label>
                                  <textarea 
                                      className="w-full p-4 border border-gray-300 rounded font-serif text-sm h-64 leading-relaxed"
                                      value={editorContent}
                                      onChange={e => setEditorContent(e.target.value)}
                                  ></textarea>
                              </div>
                              <div className="flex justify-end space-x-3 bg-gray-50 p-4 rounded">
                                  <button onClick={() => setEditingClause(null)} className="text-gray-600 font-bold text-sm px-3 py-2">Cancelar</button>
                                  <button onClick={handleSaveDraftClause} className="bg-white border border-gray-300 text-gray-700 font-bold text-sm px-4 py-2 rounded hover:bg-gray-50">Guardar Rascunho</button>
                                  <button onClick={handlePublishClause} className="bg-brand-600 text-white font-bold text-sm px-4 py-2 rounded hover:bg-brand-700 flex items-center">
                                      <CheckCircle className="w-4 h-4 mr-2" /> Aprovar e Publicar v{(parseFloat(editingClause.version) + 0.1).toFixed(1)}
                                  </button>
                              </div>
                          </div>
                      ) : (
                          <div className="flex flex-col items-center justify-center h-full text-gray-400">
                              <FileText className="w-16 h-16 mb-4 opacity-30" />
                              <p>Selecione uma cláusula para editar</p>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      </div>
  );

  const renderInfrastructure = () => (
      <div className="space-y-6 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-lg mb-6">Estado da Infraestrutura</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {serviceHealth.map(svc => (
                      <div key={svc.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                           <div className="flex justify-between items-center mb-2">
                               <h4 className="font-bold text-gray-700 text-sm">{svc.name}</h4>
                               {svc.status === 'healthy' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertTriangle className="w-4 h-4 text-red-500" />}
                           </div>
                           <p className="text-2xl font-bold text-gray-900">{svc.latency} ms</p>
                           <p className="text-xs text-gray-500">Última verificação: {svc.lastChecked}</p>
                      </div>
                  ))}
              </div>

              <h4 className="font-bold text-gray-700 mb-4 border-t pt-4">Ações de Manutenção</h4>
              <div className="flex space-x-4">
                   <button onClick={handlePurgeCache} className="bg-white border border-red-300 text-red-700 px-4 py-2 rounded-lg font-bold hover:bg-red-50 flex items-center">
                       <Trash2 className="w-4 h-4 mr-2" /> Limpar Cache CDN
                   </button>
                   <button onClick={handleSimulatePayment} className="bg-white border border-blue-300 text-blue-700 px-4 py-2 rounded-lg font-bold hover:bg-blue-50 flex items-center">
                       <CreditCard className="w-4 h-4 mr-2" /> Simular Pagamento (Sandbox)
                   </button>
              </div>
          </div>
      </div>
  );

  const renderCommunication = () => (
      <div className="space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">Gestão de Conteúdo (Blog)</h3>
              <button onClick={() => handleOpenPostEditor()} className="bg-brand-600 text-white px-4 py-2 rounded-lg font-bold flex items-center">
                  <Plus className="w-4 h-4 mr-2" /> Novo Artigo
              </button>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200">
             <div className="flex space-x-2 border-b border-gray-200 pb-2 mb-4">
                {(['all', 'published', 'pending_legal', 'draft'] as const).map(status => (
                    <button 
                        key={status}
                        onClick={() => setBlogStatusFilter(status)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-full ${blogStatusFilter === status ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        {status.replace('_', ' ').toUpperCase()}
                    </button>
                ))}
             </div>
             
             <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="p-2">Título</th>
                            <th className="p-2">Categoria</th>
                            <th className="p-2">Estado</th>
                            <th className="p-2">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBlogPosts.map(post => (
                            <tr key={post.id} className="border-b last:border-0 hover:bg-gray-50">
                                <td className="p-2 font-bold">{post.title}</td>
                                <td className="p-2 capitalize">{post.category}</td>
                                <td className="p-2">
                                     <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                        post.status === 'published' ? 'bg-green-100 text-green-800' :
                                        post.status === 'pending_legal' ? 'bg-yellow-100 text-yellow-800' :
                                        post.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-600'
                                    }`}>{post.status.replace('_', ' ')}</span>
                                </td>
                                <td className="p-2">
                                    <button onClick={() => handleOpenPostEditor(post)} className="text-brand-600 text-xs font-bold">Gerir</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
             </div>
          </div>
      </div>
  );

  const renderIAM = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex space-x-2 border-b border-gray-200 overflow-x-auto pb-1 mb-4">
        {['users_list', 'roles', 'staff_logs'].map(tab => (
          <button 
            key={tab}
            onClick={() => setIamTab(tab as any)}
            className={`px-4 py-2 text-sm font-bold whitespace-nowrap ${iamTab === tab ? 'text-brand-600 border-b-2 border-brand-600' : 'text-gray-500 hover:text-gray-800'}`}
          >
            {tab.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {iamTab === 'users_list' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Utilizadores Internos (Grupo B)</h3>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input 
                  type="text"
                  placeholder="Pesquisar por nome ou email..."
                  value={iamSearch}
                  onChange={e => setIamSearch(e.target.value)}
                  className="pl-9 pr-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <button onClick={openCreateUserModal} className="bg-brand-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center">
                <UserPlus className="w-4 h-4 mr-2" /> Adicionar Staff
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-xs text-gray-500 uppercase border-b">
                  <th className="py-2 px-4">Utilizador</th>
                  <th className="py-2 px-4">Role</th>
                  <th className="py-2 px-4">Estado da Conta</th>
                  <th className="py-2 px-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.filter(u => u.group === 'internal' && (u.name.toLowerCase().includes(iamSearch.toLowerCase()) || u.email.toLowerCase().includes(iamSearch.toLowerCase()))).map(user => (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="font-bold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs">{user.role}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        user.accountStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>{user.accountStatus.replace('_', ' ')}</span>
                    </td>
                    <td className="py-3 px-4 flex items-center space-x-2">
                      <button onClick={() => openEditRoleModal(user)} className="text-blue-600 hover:underline text-xs font-bold">Editar Role</button>
                      <button onClick={() => handleIamEmergencyAction('reset_pass', user)} className="text-yellow-600 hover:underline text-xs font-bold">Reset Pass</button>
                      {user.accountStatus === 'active' ? (
                        <button onClick={() => handleIamEmergencyAction('block', user)} className="text-red-600 hover:underline text-xs font-bold">Bloquear</button>
                      ) : (
                        <button onClick={() => handleIamEmergencyAction('unblock', user)} className="text-green-600 hover:underline text-xs font-bold">Desbloquear</button>
                      )}
                      <button onClick={() => handleIamEmergencyAction('offboard', user)} className="text-gray-500 hover:underline text-xs font-bold">Offboard</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderITModule = () => (
      <div className="space-y-6 animate-fadeIn">
          <div className="flex space-x-2 border-b border-gray-200 overflow-x-auto pb-1 mb-4">
              {['logs', 'health', 'db', 'connectivity'].map(tab => (
                  <button 
                      key={tab}
                      onClick={() => setItTab(tab as any)}
                      className={`px-4 py-2 text-sm font-bold whitespace-nowrap ${itTab === tab ? 'text-brand-600 border-b-2 border-brand-600' : 'text-gray-500 hover:text-gray-800'}`}
                  >
                      {tab.toUpperCase()}
                  </button>
              ))}
          </div>

          {/* ... (Previous Logs Tab) ... */}
          {itTab === 'logs' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                   <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                       <h4 className="font-bold text-gray-700">Logs do Sistema</h4>
                       <select 
                          className="border border-gray-300 rounded px-2 py-1 text-sm"
                          value={itLogFilter}
                          onChange={e => setItLogFilter(e.target.value as any)}
                       >
                           <option value="all">Todos os Níveis</option>
                           <option value="error">Erros & Críticos</option>
                           <option value="security">Segurança</option>
                       </select>
                   </div>
                   <div className="max-h-[500px] overflow-y-auto">
                       <table className="w-full text-left text-xs font-mono">
                           <thead className="bg-gray-100 text-gray-600 sticky top-0">
                               <tr>
                                   <th className="p-3">Timestamp</th>
                                   <th className="p-3">Level</th>
                                   <th className="p-3">Module</th>
                                   <th className="p-3">Message</th>
                                   <th className="p-3">User/IP</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-100">
                               {systemLogs
                                   .filter(l => itLogFilter === 'all' ? true : itLogFilter === 'security' ? l.level === 'security' : (l.level === 'error' || l.level === 'critical'))
                                   .map(log => (
                                   <tr key={log.id} className="hover:bg-gray-50">
                                       <td className="p-3 text-gray-500 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                                       <td className="p-3">
                                           <span className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                                               log.level === 'info' ? 'bg-blue-100 text-blue-800' :
                                               log.level === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                               log.level === 'security' ? 'bg-purple-100 text-purple-800' :
                                               'bg-red-100 text-red-800'
                                           }`}>{log.level}</span>
                                       </td>
                                       <td className="p-3 font-bold text-gray-700">{log.module || 'System'}</td>
                                       <td className="p-3 text-gray-800">{log.message}</td>
                                       <td className="p-3 text-gray-500">{log.userId || log.ip}</td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   </div>
              </div>
          )}

          {itTab === 'health' && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                       <h4 className="font-bold text-gray-800 mb-4">Uptime de Serviços</h4>
                       <div className="space-y-4">
                           {serviceHealth.map(svc => (
                               <div key={svc.id} className="flex justify-between items-center border-b border-gray-100 pb-2 last:border-0">
                                   <div className="flex items-center">
                                       <div className={`w-2 h-2 rounded-full mr-3 ${svc.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                       <span className="font-medium text-gray-700">{svc.name}</span>
                                   </div>
                                   <div className="text-right">
                                       <p className="text-xs font-bold text-gray-900">{svc.latency}ms</p>
                                       <p className="text-[10px] text-gray-400">{svc.lastChecked}</p>
                                   </div>
                               </div>
                           ))}
                       </div>
                   </div>
               </div>
          )}

          {itTab === 'db' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h4 className="font-bold text-gray-800 mb-4 text-red-600 flex items-center">
                      <AlertOctagon className="w-4 h-4 mr-2" /> Slow Queries (Performance)
                  </h4>
                  <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-mono">
                          <thead className="bg-red-50 text-red-800">
                              <tr>
                                  <th className="p-2">Duration</th>
                                  <th className="p-2">Origin</th>
                                  <th className="p-2">Query Snippet</th>
                              </tr>
                          </thead>
                          <tbody>
                              {slowQueries.map(q => (
                                  <tr key={q.id} className="border-b">
                                      <td className="p-2 font-bold text-red-600">{q.duration}ms</td>
                                      <td className="p-2">{q.origin}</td>
                                      <td className="p-2 text-gray-600 truncate max-w-md" title={q.query}>{q.query}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          )}

          {/* New Connectivity Tab for Kiá Protocol */}
          {itTab === 'connectivity' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                      <Server className="w-5 h-5 mr-2 text-brand-600" />
                      Protocolo Kiá Connect - Controlo de Integridade
                  </h4>
                  
                  <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
                      <h5 className="font-bold text-red-900 mb-2 flex items-center">
                          <ServerCrash className="w-5 h-5 mr-2" />
                          Simulação de Falha Crítica (Protocolo Inverso Ponto 4)
                      </h5>
                      <p className="text-sm text-red-700 mb-4">
                          Esta ação simula um erro 500 no backend. Todos os utilizadores externos (Grupo A) verão imediatamente um ecrã de "Serviço Indisponível".
                          Use isto para testar a resiliência e a resposta a incidentes.
                      </p>
                      
                      <div className="flex items-center justify-between bg-white p-4 rounded border border-red-100">
                          <div>
                              <span className="text-sm font-bold text-gray-700">Estado Atual do Sistema:</span>
                              <span className={`ml-2 px-3 py-1 rounded text-xs font-bold uppercase ${isSystemCritical ? 'bg-red-600 text-white' : 'bg-green-500 text-white'}`}>
                                  {isSystemCritical ? 'CRÍTICO / DOWN' : 'OPERACIONAL'}
                              </span>
                          </div>
                          
                          <button 
                              onClick={() => {
                                  if (onToggleSystemStatus) {
                                      if (isSystemCritical) {
                                          addSystemLog('info', 'SYSTEM_RECOVERY', 'System manually restored by IT Admin.');
                                      } else {
                                          addSystemLog('critical', 'MANUAL_OUTAGE_TRIGGER', 'System outage triggered manually for drill/test.');
                                      }
                                      onToggleSystemStatus();
                                  }
                              }}
                              className={`px-6 py-2 rounded font-bold text-white transition-colors ${isSystemCritical ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                          >
                              {isSystemCritical ? 'Restaurar Serviço' : 'Derrubar Sistema (Simulação)'}
                          </button>
                      </div>
                  </div>
              </div>
          )}
      </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
        <aside className="w-64 bg-gray-900 text-white flex flex-col flex-shrink-0 transition-all duration-300">
            <div className="p-6 flex items-center space-x-3">
                <ShieldCheck className="w-8 h-8 text-brand-500" />
                <span className="text-xl font-bold tracking-tight">Admin<span className="text-brand-500">Panel</span></span>
            </div>
            {/* ... Navigation (Same as before) ... */}
            <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-hide">
                {hasPermission('view_operations_module') && (
                    <button onClick={() => setActiveModule('operations')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeModule === 'operations' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>
                        <LayoutDashboard className="w-5 h-5" /> <span className="font-medium">Operações</span>
                    </button>
                )}
                 {hasPermission('view_communication_module') && (
                    <button onClick={() => setActiveModule('communication')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeModule === 'communication' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>
                        <Megaphone className="w-5 h-5" /> <span className="font-medium">Comunicação</span>
                    </button>
                )}
                {hasPermission('view_iam_module') && (
                    <button onClick={() => setActiveModule('iam')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeModule === 'iam' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>
                        <UserCog className="w-5 h-5" /> <span className="font-medium">IAM & Users</span>
                    </button>
                )}
                {hasPermission('view_finance_module') && (
                    <button onClick={() => setActiveModule('finance')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeModule === 'finance' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>
                        <DollarSign className="w-5 h-5" /> <span className="font-medium">Finanças</span>
                    </button>
                )}
                {hasPermission('view_security_module') && (
                    <button onClick={() => setActiveModule('security')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeModule === 'security' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>
                        <ShieldCheck className="w-5 h-5" /> <span className="font-medium">Segurança</span>
                    </button>
                )}
                {hasPermission('view_compliance_module') && (
                    <button onClick={() => setActiveModule('compliance')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeModule === 'compliance' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>
                        <Scale className="w-5 h-5" /> <span className="font-medium">Compliance</span>
                    </button>
                )}
                {hasPermission('view_audit_module') && (
                    <button onClick={() => setActiveModule('audit')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeModule === 'audit' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>
                        <Activity className="w-5 h-5" /> <span className="font-medium">Auditoria</span>
                    </button>
                )}
                {hasPermission('view_it_module') && (
                    <button onClick={() => setActiveModule('it')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeModule === 'it' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>
                        <Terminal className="w-5 h-5" /> <span className="font-medium">Sistema & TI</span>
                    </button>
                )}
            </nav>
        </aside>

        <main className="flex-1 overflow-y-auto bg-gray-50">
            <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center sticky top-0 z-40">
                <h2 className="text-xl font-bold text-gray-800 capitalize">{activeModule.replace('_', ' ')}</h2>
                <div className="flex items-center space-x-4">
                    {/* System Critical Status Indicator for Internal Team */}
                    {isSystemCritical && (
                        <div className="bg-red-600 text-white text-xs px-3 py-1 rounded font-bold animate-pulse flex items-center">
                            <ServerCrash className="w-4 h-4 mr-2" /> SYSTEM DOWN (SIM)
                        </div>
                    )}
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
                {activeModule === 'security' && renderSecurity()}
                {activeModule === 'compliance' && renderCompliance()}
                {activeModule === 'audit' && renderAudit()}
                {activeModule === 'team' && renderTeam()}
                {activeModule === 'contracts' && renderContracts()}
                {activeModule === 'infrastructure' && renderInfrastructure()}
                {activeModule === 'communication' && renderCommunication()}
                {activeModule === 'iam' && renderIAM()}
                {activeModule === 'it' && renderITModule()}
            </div>
        </main>

        {viewingProperty && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50 shrink-0">
                        <h3 className="text-xl font-bold text-gray-900">Detalhes do Imóvel</h3>
                        <button onClick={() => setViewingProperty(null)} className="text-gray-500 hover:text-gray-800">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="overflow-y-auto p-6 flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <div className="aspect-video rounded-lg overflow-hidden border border-gray-200">
                                    <img src={viewingProperty.images[0]} className="w-full h-full object-cover" alt="Main" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                        viewingProperty.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                        viewingProperty.status === 'available' ? 'bg-green-100 text-green-800' : 
                                        viewingProperty.status === 'approved_waiting_payment' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100'
                                    }`}>
                                        {viewingProperty.status.replace('_', ' ')}
                                    </span>
                                    <h2 className="text-2xl font-bold text-gray-900 mt-2">{viewingProperty.title}</h2>
                                    <p className="text-brand-600 font-bold text-xl">{new Intl.NumberFormat('pt-AO', { style: 'currency', currency: viewingProperty.currency }).format(viewingProperty.price)}</p>
                                </div>
                                <div className="text-sm space-y-2 text-gray-600">
                                    <p><span className="font-bold">Localização:</span> {viewingProperty.location.address}, {viewingProperty.location.municipality}</p>
                                    <p><span className="font-bold">Proprietário:</span> {viewingProperty.ownerId}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {viewingProperty.status === 'pending' && (
                        <div className="p-4 border-t bg-gray-50 flex justify-end space-x-3 shrink-0">
                            <button 
                                onClick={() => openRejectDialog(viewingProperty.id)}
                                className="px-6 py-3 bg-white border border-red-200 text-red-600 rounded-lg font-bold hover:bg-red-50 flex items-center shadow-sm"
                            >
                                <XCircle className="w-5 h-5 mr-2" /> Rejeitar
                            </button>
                            <button 
                                onClick={() => handlePropertyAction(viewingProperty.id, 'approve')}
                                className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 flex items-center shadow-md"
                            >
                                <CheckCircle className="w-5 h-5 mr-2" /> Aprovar & Solicitar Pagamento
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* ... (Existing Reject Dialog and Modals) ... */}
        {/* Important: Ensure SecurityConfirmationModal is used for Kiá Connect actions */}
        <SecurityConfirmationModal 
            isOpen={confirmation.isOpen}
            title={confirmation.title}
            description={confirmation.description}
            onConfirm={handleConfirmAction}
            onCancel={() => setConfirmation({ ...confirmation, isOpen: false })}
            variant={confirmation.variant}
        />
        
        {/* Blog Post Editor Modal */}
        {editingPost && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
                <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
                    <div className="p-4 border-b flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-900">Editor de Conteúdo</h3>
                        <button onClick={() => setEditingPost(null)}><X className="w-5 h-5" /></button>
                    </div>
                    <div className="p-6 space-y-4 overflow-y-auto">
                        <input type="text" placeholder="Título do Artigo" value={editingPost.title} onChange={e => setEditingPost({...editingPost, title: e.target.value})} className="w-full p-2 border rounded font-bold text-xl" />
                        <input type="text" placeholder="Meta Título (SEO)" value={editingPost.metaTitle || ''} onChange={e => setEditingPost({...editingPost, metaTitle: e.target.value})} className="w-full p-2 border rounded text-sm" />
                        <textarea placeholder="Meta Descrição (SEO)" value={editingPost.metaDescription || ''} onChange={e => setEditingPost({...editingPost, metaDescription: e.target.value})} className="w-full p-2 border rounded text-sm h-16"></textarea>
                        <textarea placeholder="Conteúdo HTML..." value={editingPost.content} onChange={e => setEditingPost({...editingPost, content: e.target.value})} className="w-full p-2 border rounded text-sm font-mono h-48"></textarea>
                        
                        {/* Legal Approval Section */}
                        {editingPost.status === 'pending_legal' && (hasPermission('approve_content') || hasPermission('admin')) && (
                             <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                 <h4 className="font-bold text-yellow-800 mb-2">Ação de Compliance (RJC)</h4>
                                 <div className="flex items-center space-x-2">
                                     <button onClick={handlePublishPost} className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold">Aprovar & Publicar</button>
                                     <input type="text" value={postRejectionReason} onChange={e => setPostRejectionReason(e.target.value)} placeholder="Justificativa para rejeitar..." className="flex-1 p-1 border rounded text-xs" />
                                     <button onClick={handleRejectPost} className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold">Rejeitar</button>
                                 </div>
                             </div>
                        )}
                    </div>
                    <div className="bg-gray-50 p-4 border-t flex justify-end space-x-3">
                        <button onClick={() => setEditingPost(null)} className="text-gray-600">Cancelar</button>
                        <button onClick={handleSavePost} className="bg-white border rounded px-3 py-1 font-bold">Guardar Rascunho</button>
                        {hasPermission('publish_content') && editingPost.status !== 'pending_legal' && (
                             <button onClick={handlePublishPost} className="bg-green-600 text-white rounded px-3 py-1 font-bold">Publicar Direto</button>
                        )}
                        {!hasPermission('publish_content') && editingPost.status !== 'pending_legal' && (
                             <button onClick={handleSubmitForReview} className="bg-brand-600 text-white rounded px-3 py-1 font-bold">Submeter p/ Revisão</button>
                        )}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default AdminPanel;
