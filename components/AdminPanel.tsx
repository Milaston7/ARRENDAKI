
import React, { useState, useEffect, useRef } from 'react';
import { Property, User, UserRole, Transaction, FlaggedChat, VerificationRequest, BlogPost, Contract } from '../types';
import { MOCK_TRANSACTIONS, MOCK_FLAGGED_CHATS, MOCK_USERS, MOCK_CONTRACTS, MOCK_BLOG_POSTS } from '../services/mockData';
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  BarChart, 
  DollarSign, 
  Server,
  Database,
  Activity,
  Map,
  Bell,
  Download,
  Ban,
  PenTool,
  Save,
  Send,
  Trash2,
  Lock,
  FileText,
  Edit,
  AlertTriangle,
  Eye,
  MessageSquare,
  Image as ImageIcon,
  Plus,
  Filter,
  Calendar,
  AlertCircle,
  FileSearch,
  UserCheck,
  Search,
  ArrowUpRight,
  Briefcase,
  Home,
  BookOpen,
  Clock,
  LifeBuoy,
  TrendingDown,
  Wallet,
  FileSignature,
  Megaphone,
  X,
  Mail,
  ShieldAlert,
  Bold, 
  Italic, 
  List, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Link as LinkIcon, 
  Quote, 
  Heading1, 
  Heading2,
  Upload,
  Film,
  Fingerprint,
  Info,
  FileSpreadsheet,
  PieChart,
  ArrowRightLeft,
  CreditCard,
  ZoomIn,
  Tag,
  Hash
} from 'lucide-react';

// --- ACL CONFIGURATION ---

type Permission = 
  | 'view_dashboard'
  | 'view_operations_module'
  | 'view_finance_module'
  | 'view_security_module'
  | 'view_infrastructure_module'
  | 'view_team_module'
  | 'view_contracts_module'
  | 'view_communication_module'
  | 'manage_properties'
  | 'approve_properties'
  | 'manage_users'
  | 'ban_users'
  | 'contact_users'
  | 'manage_finance'
  | 'manage_escrow'
  | 'manage_verification'
  | 'manage_contracts'
  | 'manage_communications'
  | 'audit_chats'
  | 'manage_infrastructure'
  | 'manage_content'
  | 'publish_content'
  | 'manage_team';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'view_dashboard', 'view_operations_module', 'view_finance_module', 'view_security_module', 
    'view_infrastructure_module', 'view_team_module', 'view_contracts_module', 'view_communication_module',
    'manage_properties', 'approve_properties', 'manage_users', 'ban_users', 'contact_users', 
    'manage_finance', 'manage_escrow', 'manage_verification', 'audit_chats', 'manage_infrastructure', 
    'manage_content', 'publish_content', 'manage_team', 'manage_contracts', 'manage_communications'
  ],
  commercial_manager: [
    'view_dashboard', 'view_operations_module', 'view_finance_module', 'view_contracts_module', 'view_communication_module',
    'manage_properties', 'approve_properties', 'manage_users', 'contact_users',
    'manage_finance', 'manage_escrow', 'manage_content', 'publish_content', 'manage_contracts', 'manage_communications'
  ],
  security_manager: [
    'view_dashboard', 'view_security_module', 'manage_users', 'ban_users',
    'manage_verification', 'audit_chats'
  ],
  it_tech: [
    'view_dashboard', 'view_infrastructure_module', 'manage_infrastructure'
  ],
  collaborator: [
    'view_dashboard', 'view_operations_module', 'manage_content'
  ],
  tenant: [], owner: [], broker: [], legal_rep: []
};

interface AdminPanelProps {
  properties: Property[];
  onUpdateProperty: (id: string, updates: Partial<Property>) => void;
  currentUserRole: UserRole; 
}

// --- RICH TEXT EDITOR TOOLBAR COMPONENT ---
const RichTextToolbar = () => (
    <div className="flex items-center space-x-1 border-b border-gray-200 p-2 bg-gray-50 rounded-t-lg">
        <button type="button" className="p-1.5 hover:bg-gray-200 rounded text-gray-600" title="Negrito"><Bold className="w-4 h-4" /></button>
        <button type="button" className="p-1.5 hover:bg-gray-200 rounded text-gray-600" title="Itálico"><Italic className="w-4 h-4" /></button>
        <div className="w-px h-4 bg-gray-300 mx-2"></div>
        <button type="button" className="p-1.5 hover:bg-gray-200 rounded text-gray-600" title="Título 1"><Heading1 className="w-4 h-4" /></button>
        <button type="button" className="p-1.5 hover:bg-gray-200 rounded text-gray-600" title="Título 2"><Heading2 className="w-4 h-4" /></button>
        <div className="w-px h-4 bg-gray-300 mx-2"></div>
        <button type="button" className="p-1.5 hover:bg-gray-200 rounded text-gray-600" title="Lista"><List className="w-4 h-4" /></button>
        <button type="button" className="p-1.5 hover:bg-gray-200 rounded text-gray-600" title="Citação"><Quote className="w-4 h-4" /></button>
        <div className="w-px h-4 bg-gray-300 mx-2"></div>
        <button type="button" className="p-1.5 hover:bg-gray-200 rounded text-gray-600" title="Link"><LinkIcon className="w-4 h-4" /></button>
        <div className="ml-auto flex items-center space-x-1">
            <button type="button" className="p-1.5 hover:bg-gray-200 rounded text-gray-600"><AlignLeft className="w-4 h-4" /></button>
            <button type="button" className="p-1.5 hover:bg-gray-200 rounded text-gray-600"><AlignCenter className="w-4 h-4" /></button>
            <button type="button" className="p-1.5 hover:bg-gray-200 rounded text-gray-600"><AlignRight className="w-4 h-4" /></button>
        </div>
    </div>
);

// --- CRITICAL ACTION MODAL COMPONENT ---
interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

const SecurityConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, title, description, onConfirm, onCancel, variant = 'warning' }) => {
  if (!isOpen) return null;
  
  const colors = {
    danger: 'bg-red-50 text-red-700 border-red-200',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200'
  };

  const btnColors = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    info: 'bg-blue-600 hover:bg-blue-700'
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
        <div className={`p-6 border-b ${variant === 'danger' ? 'border-red-100' : 'border-gray-100'}`}>
          <div className="flex items-center space-x-3 mb-2">
            <div className={`p-2 rounded-full ${colors[variant]}`}>
               {variant === 'danger' ? <AlertTriangle className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
            </div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
        </div>
        <div className="p-4 bg-gray-50 flex justify-end space-x-3">
          <button onClick={onCancel} className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium">Cancelar</button>
          <button onClick={onConfirm} className={`px-4 py-2 text-white rounded-lg font-bold shadow-sm ${btnColors[variant]}`}>
            Confirmar Ação
          </button>
        </div>
      </div>
    </div>
  );
};

// --- KPI WIDGET COMPONENT ---
interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend?: string;
    trendDirection?: 'up' | 'down';
    color: 'blue' | 'green' | 'orange' | 'purple' | 'red';
    subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, trendDirection, color, subtitle }) => {
    const colorStyles = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        green: 'bg-green-50 text-green-600 border-green-100',
        orange: 'bg-orange-50 text-orange-600 border-orange-100',
        purple: 'bg-purple-50 text-purple-600 border-purple-100',
        red: 'bg-red-50 text-red-600 border-red-100'
    };

    const trendColor = trendDirection === 'up' ? 'text-green-600' : trendDirection === 'down' ? 'text-red-600' : 'text-gray-500';
    const TrendIcon = trendDirection === 'up' ? ArrowUpRight : trendDirection === 'down' ? TrendingDown : null;

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                    <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</h3>
                    {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
                </div>
                <div className={`p-3 rounded-xl border ${colorStyles[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            {trend && (
                <div className={`flex items-center mt-4 text-xs font-bold ${trendColor}`}>
                    {TrendIcon && <TrendIcon className="w-3 h-3 mr-1" />}
                    <span>{trend}</span>
                    <span className="text-gray-400 font-normal ml-1">vs ontem</span>
                </div>
            )}
        </div>
    );
};

const AdminPanel: React.FC<AdminPanelProps> = ({ properties, onUpdateProperty, currentUserRole }) => {
  
  const hasPermission = (permission: Permission): boolean => {
    const permissions = ROLE_PERMISSIONS[currentUserRole] || [];
    return permissions.includes(permission);
  };

  const getDefaultModule = () => {
      if (hasPermission('view_operations_module')) return 'operations';
      if (hasPermission('view_contracts_module')) return 'contracts';
      if (hasPermission('view_communication_module')) return 'communication';
      if (hasPermission('view_security_module')) return 'security';
      if (hasPermission('view_finance_module')) return 'finance';
      if (hasPermission('view_infrastructure_module')) return 'infrastructure';
      if (hasPermission('view_team_module')) return 'team';
      return 'operations';
  };

  const getDefaultSubTab = (module: string) => {
    if (module === 'operations') {
        if (hasPermission('view_dashboard')) return 'dashboard';
        if (hasPermission('manage_properties')) return 'properties';
        if (hasPermission('manage_content')) return 'blog';
        if (hasPermission('manage_users')) return 'users';
        return 'dashboard';
    }
    if (module === 'finance') return 'dashboard';
    if (module === 'security') return 'verify';
    if (module === 'infrastructure') return 'infrastructure'; 
    if (module === 'communication') return 'push_notifications';
    return 'dashboard';
  };

  const initialModule = getDefaultModule();
  const [activeModule, setActiveModule] = useState<'operations' | 'finance' | 'security' | 'infrastructure' | 'team' | 'contracts' | 'communication'>(initialModule);
  const [activeSubTab, setActiveSubTab] = useState<string>(getDefaultSubTab(initialModule));
  
  useEffect(() => {
    setActiveSubTab(getDefaultSubTab(activeModule));
  }, [activeModule]);

  // Data States
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [contracts, setContracts] = useState<Contract[]>(MOCK_CONTRACTS);
  
  const [contractFilters, setContractFilters] = useState({
      search: '', user: '', date: '', status: 'all' as 'all' | 'active' | 'expired' | 'terminated'
  });

  const [verificationQueue, setVerificationQueue] = useState<VerificationRequest[]>([
      { id: 'v1', userId: 'owner1', type: 'identity', documentUrl: 'https://images.unsplash.com/photo-1544507888-56d73eb6046e?auto=format&fit=crop&w=600&q=80', status: 'pending', submittedAt: '2023-10-26' },
      { id: 'v2', userId: 'owner1', type: 'property_ownership', documentUrl: 'https://images.unsplash.com/photo-1555529733-0e670560f7e1?auto=format&fit=crop&w=600&q=80', status: 'pending', submittedAt: '2023-10-26' },
      { id: 'v3', userId: 'tenant1', type: 'identity', documentUrl: 'https://images.unsplash.com/photo-1589330694653-569b9a13d2f2?auto=format&fit=crop&w=600&q=80', status: 'review_needed', submittedAt: '2023-10-25', reviewedBy: 'staff_1', reviewNotes: 'Foto tremida' }
  ]);
  const [inspectingRequest, setInspectingRequest] = useState<VerificationRequest | null>(null);
  const [verificationActionNote, setVerificationActionNote] = useState('');

  const [auditChats, setAuditChats] = useState<FlaggedChat[]>(MOCK_FLAGGED_CHATS);
  const [viewingChatLog, setViewingChatLog] = useState<FlaggedChat | null>(null);
  
  const [usersList, setUsersList] = useState<User[]>(MOCK_USERS);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  
  // Notification Module State
  const [notificationHistory, setNotificationHistory] = useState([
      { id: 1, title: 'Manutenção Programada', message: 'A plataforma estará indisponível das 02h às 04h para melhorias.', target: 'Todos', type: 'info', date: '2023-10-25', status: 'sent' },
      { id: 2, title: 'Nova Funcionalidade: Kiá Verify', message: 'Verifique a sua conta hoje e ganhe destaque nos anúncios.', target: 'Proprietários', type: 'promo', date: '2023-10-20', status: 'sent' }
  ]);
  const [notifForm, setNotifForm] = useState({ 
      title: '', 
      message: '', 
      target: 'all' as 'all' | 'tenant' | 'owner' | 'broker', 
      type: 'info' as 'info' | 'warning' | 'promo' 
  });

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(MOCK_BLOG_POSTS);
  const [showBlogEditor, setShowBlogEditor] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<BlogPost> & { video?: string }>({});
  
  const blogImageInputRef = useRef<HTMLInputElement>(null);
  const blogVideoInputRef = useRef<HTMLInputElement>(null);

  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [propertyFilter, setPropertyFilter] = useState<'pending' | 'all'>('pending');
  
  // Finance Reports State
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [reportType, setReportType] = useState('all');

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

  // --- ACTION HANDLERS ---

  const handlePropertyAction = (id: string, action: 'approve' | 'archive') => {
      triggerCriticalAction(
        action === 'approve' ? 'Aprovar Imóvel' : 'Arquivar Imóvel',
        `Tem a certeza que deseja ${action === 'approve' ? 'publicar' : 'arquivar'} este imóvel?`,
        () => {
           if (action === 'approve') {
                onUpdateProperty(id, { status: 'available', isVerified: true });
            } else {
                onUpdateProperty(id, { status: 'archived' });
            }
        },
        action === 'archive' ? 'warning' : 'info'
      );
  };

  const openRejectDialog = (id: string) => {
      setRejectDialog({ isOpen: true, propertyId: id, reason: '' });
  };

  const confirmRejection = () => {
      if (!rejectDialog.reason.trim()) {
          alert("A justificação é obrigatória para rejeitar um imóvel. O proprietário precisa saber o motivo.");
          return;
      }
      
      onUpdateProperty(rejectDialog.propertyId, { 
          status: 'rejected', 
          rejectionReason: rejectDialog.reason 
      });
      
      // Simulate sending notification
      alert(`Imóvel rejeitado com sucesso. Uma notificação com o motivo foi enviada ao proprietário.`);
      
      setRejectDialog({ isOpen: false, propertyId: '', reason: '' });
  };

  const handleTransactionAction = (id: string, action: 'confirm' | 'reject') => {
      triggerCriticalAction(
          'Reconciliação Financeira',
          'Confirma que recebeu este montante na conta bancária da empresa? Esta ação é irreversível.',
          () => {
             setTransactions(prev => prev.map(t => 
                t.id === id ? { ...t, status: action === 'confirm' ? 'completed' : 'failed' } : t
            ));
          },
          'warning'
      );
  };

  const handleEscrowAction = (id: string, action: 'release' | 'refund', amount: number) => {
      const isRelease = action === 'release';
      triggerCriticalAction(
          isRelease ? 'Libertar Fundos (Proprietário)' : 'Reembolsar (Inquilino)',
          isRelease 
            ? `Vai transferir ${new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(amount)} para o proprietário. A comissão Arrendaki já foi deduzida. Confirmar?`
            : `Vai devolver a totalidade do valor ao inquilino. Esta ação cancela a transação garantida.`,
          () => {
              setTransactions(prev => prev.map(t => 
                  t.id === id ? { ...t, status: isRelease ? 'released' : 'refunded' } : t
              ));
          },
          isRelease ? 'info' : 'warning'
      );
  };

  const handleGenerateInvoice = (transaction: Transaction) => {
      alert(`A gerar Fatura Pro-forma #${transaction.id} para ${transaction.userName}... Download iniciado.`);
  };

  const exportToCSV = () => {
      const headers = ["ID", "Tipo", "Valor", "Moeda", "Estado", "Data", "Utilizador", "Propriedade", "Referencia"];
      
      const filteredData = transactions.filter(t => {
          const matchType = reportType === 'all' || t.type === reportType;
          // Simple date filtering (mock logic)
          const matchDate = (!reportStartDate || t.date >= reportStartDate) && (!reportEndDate || t.date <= reportEndDate);
          return matchType && matchDate;
      });

      const rows = filteredData.map(t => [
          t.id, 
          t.type, 
          t.amount, 
          t.currency, 
          t.status, 
          t.date, 
          t.userName || t.userId, 
          t.propertyTitle || t.propertyId,
          t.reference
      ].join(","));

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `relatorio_arrendaki_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const exportToPDF = () => {
      alert("A gerar PDF com todas as faturas selecionadas... (Simulação)");
  };

  const handleProcessVerification = (action: 'approve' | 'reject' | 'review_needed') => {
      if (!inspectingRequest) return;

      if ((action === 'reject' || action === 'review_needed') && !verificationActionNote.trim()) {
          alert("É obrigatório adicionar uma nota justificativa para esta ação.");
          return;
      }

      const updatedRequest: VerificationRequest = {
          ...inspectingRequest,
          status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'review_needed',
          reviewedBy: currentUserRole,
          reviewedAt: new Date().toISOString(),
          reviewNotes: verificationActionNote
      };

      // Update the queue state
      setVerificationQueue(prev => prev.map(req => req.id === inspectingRequest.id ? updatedRequest : req));

      // Business Logic: If approved, verify the user or property
      if (action === 'approve') {
          if (inspectingRequest.type === 'identity') {
              // Mark user as verified
              setUsersList(prev => prev.map(u => 
                  u.id === inspectingRequest.userId 
                  ? { ...u, isIdentityVerified: true } 
                  : u
              ));
              alert(`Documento aprovado. O utilizador ${inspectingRequest.userId} agora tem o selo Kiá Verify.`);
          } else if (inspectingRequest.type === 'property_ownership') {
              // In a real app, we'd link this to a specific property.
              // For now, we simulate success.
              alert(`Documento de propriedade aprovado.`);
          }
      }

      setInspectingRequest(null);
      setVerificationActionNote('');
  };

  const handleResolveAudit = (id: string, action: 'confirm_violation' | 'false_positive') => {
      triggerCriticalAction(
          action === 'confirm_violation' ? 'Confirmar Violação' : 'Marcar como Falso Positivo',
          action === 'confirm_violation' ? 'Esta ação confirmará que o utilizador tentou contornar a plataforma.' : 'O alerta será removido e o chat marcado como seguro.',
          () => {
              setAuditChats(prev => prev.filter(c => c.id !== id));
              setViewingChatLog(null);
          },
          action === 'confirm_violation' ? 'warning' : 'info'
      );
  };

  const handleToggleUserStatus = (userId: string, currentStatus: string) => {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      triggerCriticalAction(
          newStatus === 'suspended' ? 'Suspender Utilizador' : 'Reativar Utilizador',
          newStatus === 'suspended' ? 'O utilizador perderá acesso imediato à plataforma. Tem a certeza?' : 'O acesso do utilizador será restaurado.',
          () => {
              setUsersList(prev => prev.map(u => {
                  if (u.id === userId) return { ...u, status: newStatus };
                  return u;
              }));
              if (editingUser && editingUser.id === userId) {
                  setEditingUser(prev => prev ? { ...prev, status: newStatus as any } : null);
              }
              if (viewingUser && viewingUser.id === userId) {
                  setViewingUser(prev => prev ? { ...prev, status: newStatus as any } : null);
              }
          },
          newStatus === 'suspended' ? 'danger' : 'warning'
      );
  };

  const handleStartContact = (user: User) => {
      alert(`A iniciar chat seguro com ${user.name}... (Simulação)`);
  };

  const handleDeletePost = (id: string) => {
    triggerCriticalAction(
        'Eliminar Artigo', 
        'Esta ação não pode ser desfeita. Tem a certeza que deseja eliminar este artigo do blog?', 
        () => {
            setBlogPosts(prev => prev.filter(p => p.id !== id));
        }, 
        'danger'
    );
  };

  const handleSavePost = (status: 'draft' | 'pending_approval' | 'published') => {
     if(!currentPost.title) return alert("O título é obrigatório");
     
     if (currentPost.id) {
        // Editing existing
        setBlogPosts(prev => prev.map(p => 
            p.id === currentPost.id 
            ? { ...p, ...currentPost, status: status } as BlogPost
            : p
        ));
     } else {
         // Creating new
         const newPost: BlogPost = {
             id: Date.now().toString(),
             title: currentPost.title!,
             author: 'Eu (Admin)',
             status: status,
             date: new Date().toLocaleDateString('pt-AO', { day: 'numeric', month: 'short', year: 'numeric' }),
             excerpt: currentPost.excerpt,
             image: currentPost.image
         };
         setBlogPosts(prev => [newPost, ...prev]);
     }
     
     setShowBlogEditor(false);
     setCurrentPost({});
  };

  const handleContractAction = (contractId: string, action: 'terminate' | 'renew') => {
      triggerCriticalAction(
          action === 'terminate' ? 'Terminar Contrato' : 'Renovar Contrato',
          action === 'terminate' 
            ? 'Esta ação anula legalmente o contrato ativo. Tem a certeza?' 
            : 'Isto irá estender a validade do contrato por mais 12 meses.',
          () => {
              setContracts(prev => prev.map(c => 
                  c.id === contractId 
                  ? { 
                      ...c, 
                      status: action === 'terminate' ? 'terminated' : 'active',
                      endDate: action === 'renew' ? '2025-10-01' : c.endDate 
                    } 
                  : c
              ));
          },
          action === 'terminate' ? 'danger' : 'info'
      );
  };

  const handleSendPushNotification = () => {
      if(!notifForm.title || !notifForm.message) return alert("Preencha título e mensagem");

      triggerCriticalAction(
          'Enviar Notificação em Massa',
          `Esta mensagem será enviada para ${notifForm.target === 'all' ? 'TODOS os utilizadores' : `o grupo: ${notifForm.target.toUpperCase()}`}. Confirma?`,
          () => {
              const targetLabel = notifForm.target === 'all' ? 'Todos' : 
                                  notifForm.target === 'tenant' ? 'Inquilinos' : 
                                  notifForm.target === 'owner' ? 'Proprietários' : 'Corretores';
              
              const newNotif = {
                  id: Date.now(),
                  title: notifForm.title,
                  message: notifForm.message,
                  target: targetLabel,
                  type: notifForm.type,
                  date: new Date().toISOString().split('T')[0],
                  status: 'sent'
              };
              
              setNotificationHistory([newNotif, ...notificationHistory]);
              setNotifForm({ title: '', message: '', target: 'all', type: 'info' });
              alert('Notificação enviada com sucesso!');
          },
          'info'
      );
  };

  const handleDownloadContract = (contractId: string) => {
      alert(`A transferir contrato ${contractId}... (Simulação de PDF)`);
  };

  // Blog File Handlers
  const handleBlogFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const objectUrl = URL.createObjectURL(file);
          if (type === 'image') {
              setCurrentPost(prev => ({ ...prev, image: objectUrl }));
          } else {
              setCurrentPost(prev => ({ ...prev, video: objectUrl }));
          }
      }
  };

  // --- RENDERERS ---

  const renderOperations = () => {
    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Sub Navigation */}
        <div className="flex space-x-4 border-b border-gray-200 pb-1 overflow-x-auto">
           {hasPermission('view_dashboard') && (
              <button 
                  onClick={() => setActiveSubTab('dashboard')}
                  className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeSubTab === 'dashboard' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                  Dashboard
              </button>
           )}
           {hasPermission('manage_properties') && (
              <button 
                  onClick={() => setActiveSubTab('properties')}
                  className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeSubTab === 'properties' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                  Imóveis
              </button>
           )}
           {hasPermission('manage_users') && (
              <button 
                  onClick={() => setActiveSubTab('users')}
                  className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeSubTab === 'users' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                  Utilizadores
              </button>
           )}
           {hasPermission('manage_content') && (
              <button 
                  onClick={() => setActiveSubTab('blog')}
                  className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeSubTab === 'blog' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                  Blog & Conteúdo
              </button>
           )}
        </div>

        {activeSubTab === 'dashboard' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <StatCard title="Total Imóveis" value={properties.length} icon={Home} color="blue" trend="+5%" trendDirection="up" />
               <StatCard title="Utilizadores" value={usersList.length} icon={Users} color="purple" trend="+12" trendDirection="up" />
               <StatCard title="Contratos Ativos" value={contracts.filter(c => c.status === 'active').length} icon={FileText} color="green" />
               <StatCard title="Receita (Mês)" value="Kz 4.2M" icon={DollarSign} color="orange" trend="+8%" trendDirection="up" />
           </div>
        )}

        {activeSubTab === 'properties' && (
            <div className="space-y-4">
               {/* Filters */}
               <div className="flex justify-between items-center mb-4">
                  <div className="flex space-x-2">
                      <button onClick={() => setPropertyFilter('pending')} className={`px-3 py-1.5 rounded-md text-sm font-medium ${propertyFilter === 'pending' ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'}`}>Pendentes</button>
                      <button onClick={() => setPropertyFilter('all')} className={`px-3 py-1.5 rounded-md text-sm font-medium ${propertyFilter === 'all' ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'}`}>Todos</button>
                  </div>
               </div>

               {/* List */}
               <div className="space-y-3">
                  {properties
                    .filter(p => propertyFilter === 'pending' ? p.status === 'pending' : true)
                    .map(property => (
                      <div key={property.id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
                          <img src={property.images[0]} alt="" className="w-20 h-20 rounded-lg object-cover" />
                          <div className="flex-1">
                              <div className="flex justify-between">
                                  <h4 className="font-bold text-gray-900">{property.title}</h4>
                                  <span className={`px-2 py-0.5 text-xs rounded-full font-bold uppercase ${
                                      property.status === 'available' ? 'bg-green-100 text-green-800' :
                                      property.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                      property.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                  }`}>{property.status}</span>
                              </div>
                              <p className="text-sm text-gray-500">{property.location.municipality}, {property.location.province}</p>
                              <p className="text-sm font-bold text-brand-600">{new Intl.NumberFormat('pt-AO', { style: 'currency', currency: property.currency }).format(property.price)}</p>
                          </div>
                          <div className="flex space-x-2 w-full md:w-auto">
                              {property.status === 'pending' && (
                                  <>
                                      <button onClick={() => handlePropertyAction(property.id, 'approve')} className="flex-1 md:flex-none px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700">Aprovar</button>
                                      <button onClick={() => openRejectDialog(property.id)} className="flex-1 md:flex-none px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700">Rejeitar</button>
                                  </>
                              )}
                              {property.status === 'available' && (
                                  <button onClick={() => handlePropertyAction(property.id, 'archive')} className="flex-1 md:flex-none px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50">Arquivar</button>
                              )}
                          </div>
                      </div>
                  ))}
                  {properties.filter(p => propertyFilter === 'pending' ? p.status === 'pending' : true).length === 0 && (
                      <div className="text-center py-10 text-gray-500">Nenhum imóvel encontrado.</div>
                  )}
               </div>
            </div>
        )}

        {activeSubTab === 'users' && (
            <div className="space-y-4">
                 {/* Simplified User List */}
                 {usersList.map(u => (
                     <div key={u.id} className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-center">
                         <div className="flex items-center space-x-3">
                             <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold">
                                 {u.name.charAt(0)}
                             </div>
                             <div>
                                 <h4 className="font-bold text-gray-900">{u.name}</h4>
                                 <p className="text-xs text-gray-500">{u.role} • {u.email}</p>
                             </div>
                         </div>
                         <button 
                            onClick={() => handleToggleUserStatus(u.id, u.status || 'active')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${u.status === 'suspended' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}
                         >
                             {u.status === 'suspended' ? 'Suspenso' : 'Ativo'}
                         </button>
                     </div>
                 ))}
            </div>
        )}
        
        {activeSubTab === 'blog' && (
             <div className="space-y-4">
                 <div className="flex justify-between items-center mb-4">
                     <h3 className="text-lg font-bold">Artigos Publicados</h3>
                     <button 
                        onClick={() => { setShowBlogEditor(true); setCurrentPost({}); }}
                        className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center"
                     >
                         <Plus className="w-4 h-4 mr-2" /> Novo Artigo
                     </button>
                 </div>
                 
                 {showBlogEditor ? (
                     <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                         <div className="flex justify-between items-center mb-4">
                             <h4 className="font-bold text-lg">Editor de Conteúdo</h4>
                             <button onClick={() => setShowBlogEditor(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
                         </div>
                         <div className="space-y-4">
                             <input 
                                type="text" 
                                placeholder="Título do Artigo" 
                                className="w-full text-xl font-bold border-b border-gray-300 pb-2 focus:outline-none focus:border-brand-500"
                                value={currentPost.title || ''}
                                onChange={e => setCurrentPost({...currentPost, title: e.target.value})}
                             />
                             <div className="flex space-x-2">
                                <button className="p-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-600" onClick={() => blogImageInputRef.current?.click()}>
                                    <ImageIcon className="w-4 h-4" />
                                </button>
                                <input type="file" ref={blogImageInputRef} className="hidden" accept="image/*" onChange={(e) => handleBlogFileUpload(e, 'image')} />
                             </div>
                             {currentPost.image && <img src={currentPost.image} alt="Preview" className="w-full h-48 object-cover rounded-lg" />}
                             <textarea 
                                placeholder="Escreva o conteúdo aqui..." 
                                className="w-full h-48 p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-brand-500"
                                value={currentPost.excerpt || ''}
                                onChange={e => setCurrentPost({...currentPost, excerpt: e.target.value})}
                             ></textarea>
                             <div className="flex justify-end space-x-3">
                                 <button onClick={() => handleSavePost('draft')} className="px-4 py-2 text-gray-600 font-medium">Guardar Rascunho</button>
                                 <button onClick={() => handleSavePost('published')} className="px-4 py-2 bg-brand-600 text-white font-bold rounded-lg">Publicar</button>
                             </div>
                         </div>
                     </div>
                 ) : (
                     <div className="grid grid-cols-1 gap-4">
                         {blogPosts.map(post => (
                             <div key={post.id} className="flex bg-white border border-gray-200 rounded-xl p-4 items-center justify-between">
                                 <div className="flex items-center space-x-4">
                                     <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                                         {post.image ? <img src={post.image} className="w-full h-full object-cover" /> : <BookOpen className="w-8 h-8 m-auto text-gray-400" />}
                                     </div>
                                     <div>
                                         <h4 className="font-bold text-gray-900 line-clamp-1">{post.title}</h4>
                                         <div className="flex items-center text-xs text-gray-500 space-x-2 mt-1">
                                             <span className={`px-2 py-0.5 rounded-full ${post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                 {post.status === 'published' ? 'Publicado' : 'Rascunho'}
                                             </span>
                                             <span>{post.date}</span>
                                         </div>
                                     </div>
                                 </div>
                                 <div className="flex space-x-2">
                                     <button onClick={() => { setCurrentPost(post); setShowBlogEditor(true); }} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><Edit className="w-4 h-4" /></button>
                                     <button onClick={() => handleDeletePost(post.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                 </div>
                             </div>
                         ))}
                     </div>
                 )}
             </div>
        )}
      </div>
    );
  };

  const renderFinance = () => {
      // Filter Logic for transactions
      const feeTransactions = transactions.filter(t => t.type === 'listing_fee' || (t.type !== 'escrow_deposit' && t.amount <= 5000));
      const escrowTransactions = transactions.filter(t => t.type === 'escrow_deposit');

      // KPIs
      const totalRevenue = feeTransactions.filter(t => t.status === 'completed').reduce((acc, t) => acc + t.amount, 0);
      const pendingReconciliation = feeTransactions.filter(t => t.status === 'pending').length;
      const escrowHeld = escrowTransactions.filter(t => t.status === 'escrow_held').reduce((acc, t) => acc + t.amount, 0);

      return (
          <div className="space-y-6 animate-fadeIn">
              
              {/* Finance Navigation */}
              <div className="flex space-x-4 border-b border-gray-200 pb-1 overflow-x-auto">
                  <button onClick={() => setActiveSubTab('dashboard')} className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeSubTab === 'dashboard' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                      Visão Geral
                  </button>
                  <button onClick={() => setActiveSubTab('reconciliation')} className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeSubTab === 'reconciliation' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                      Reconciliação (3.000 Kz)
                  </button>
                  <button onClick={() => setActiveSubTab('escrow')} className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeSubTab === 'escrow' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                      Gestão de Escrow (2.5%)
                  </button>
                  <button onClick={() => setActiveSubTab('reports')} className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeSubTab === 'reports' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                      Relatórios & Exportação
                  </button>
              </div>

              {/* FINANCE DASHBOARD TAB */}
              {activeSubTab === 'dashboard' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <StatCard 
                            title="Receita de Listings" 
                            value={new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(totalRevenue)} 
                            icon={DollarSign} 
                            color="green" 
                            trend="+15%" 
                            trendDirection="up" 
                        />
                        <StatCard 
                            title="Valor em Custódia" 
                            value={new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(escrowHeld)} 
                            icon={Lock} 
                            color="blue" 
                            subtitle="Aguardando fecho de contrato"
                        />
                        <StatCard 
                            title="Pendentes Validação" 
                            value={pendingReconciliation} 
                            icon={Activity} 
                            color="orange" 
                            subtitle="Taxas de 3.000 Kz"
                        />
                    </div>
                    
                    {/* Visual Revenue Chart Simulation */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                            <PieChart className="w-5 h-5 mr-2 text-gray-500" />
                            Distribuição de Receita
                        </h3>
                        <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
                            <div className="w-[70%] bg-blue-500" title="Escrow (70%)"></div>
                            <div className="w-[30%] bg-green-500" title="Listings (30%)"></div>
                        </div>
                        <div className="flex mt-2 text-xs font-medium text-gray-500 space-x-4">
                            <span className="flex items-center"><div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div> Comissões (2.5%)</span>
                            <span className="flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div> Taxas Fixas (Listings)</span>
                        </div>
                    </div>
                  </>
              )}

              {/* RECONCILIATION TAB */}
              {activeSubTab === 'reconciliation' && (
                  <div className="space-y-4">
                      <div className="bg-orange-50 border border-orange-100 p-4 rounded-lg flex items-start">
                          <AlertCircle className="w-5 h-5 text-orange-600 mr-2 mt-0.5" />
                          <div>
                              <h4 className="text-sm font-bold text-orange-800">Reconciliação de Taxas de Listagem</h4>
                              <p className="text-xs text-orange-700">Verifique os comprovativos de 3.000 AOA via Multicaixa Express ou Referência.</p>
                          </div>
                      </div>

                      {feeTransactions.map(t => (
                          <div key={t.id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center shadow-sm">
                              <div className="flex items-center mb-3 md:mb-0 w-full md:w-auto">
                                  <div className={`p-3 rounded-full mr-4 shrink-0 ${t.status === 'completed' ? 'bg-green-100 text-green-600' : t.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>
                                      <CreditCard className="w-5 h-5" />
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-gray-900">Taxa de Listagem</h4>
                                      <p className="text-sm text-gray-500">{t.userName} • {t.date}</p>
                                      <div className="flex items-center mt-1">
                                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded font-mono mr-2">Ref: {t.reference}</span>
                                          {t.reference?.startsWith('9') ? <span className="text-[10px] text-blue-600 font-bold">MCX Express</span> : <span className="text-[10px] text-purple-600 font-bold">Referência</span>}
                                      </div>
                                  </div>
                              </div>
                              <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 mt-3 md:mt-0">
                                  <span className="font-bold text-gray-800 text-lg">{new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(t.amount)}</span>
                                  {t.status === 'pending' ? (
                                      <div className="flex space-x-2">
                                          <button onClick={() => handleTransactionAction(t.id, 'confirm')} className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 shadow-sm">Confirmar</button>
                                          <button onClick={() => handleTransactionAction(t.id, 'reject')} className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100">Rejeitar</button>
                                      </div>
                                  ) : (
                                      <div className="text-right">
                                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${t.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                              {t.status === 'completed' ? 'Pago' : 'Falhou'}
                                          </span>
                                          <button onClick={() => handleGenerateInvoice(t)} className="block text-xs text-gray-400 hover:text-brand-500 mt-1 flex items-center justify-end w-full">
                                              <Download className="w-3 h-3 mr-1" /> Recibo
                                          </button>
                                      </div>
                                  )}
                              </div>
                          </div>
                      ))}
                  </div>
              )}

              {/* ESCROW TAB */}
              {activeSubTab === 'escrow' && (
                  <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 flex items-start">
                          <Lock className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                          <div>
                              <h4 className="font-bold text-blue-900 text-sm">Controlo de Fundos em Escrow</h4>
                              <p className="text-xs text-blue-800 mt-1">
                                  Estes valores estão na conta bancária do Arrendaki. Só devem ser libertados após a confirmação da assinatura do contrato e entrega das chaves.
                                  <br/><strong>A comissão de 2.5% é deduzida automaticamente ao libertar.</strong>
                              </p>
                          </div>
                      </div>
                      
                      {escrowTransactions.map(t => {
                          const commission = t.amount * 0.025;
                          const netOwnerAmount = t.amount - commission;

                          return (
                              <div key={t.id} className="bg-white border border-gray-200 rounded-xl p-0 overflow-hidden shadow-sm">
                                  <div className="p-4 flex flex-col md:flex-row justify-between relative">
                                      {t.status === 'escrow_held' && <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">EM CUSTÓDIA</div>}
                                      
                                      <div>
                                          <h4 className="font-bold text-gray-900 text-lg">{t.propertyTitle}</h4>
                                          <p className="text-sm text-gray-500">Inquilino: <span className="font-medium text-gray-800">{t.userName}</span></p>
                                          <div className="mt-2 text-xs text-gray-400 space-x-3">
                                              <span>ID: {t.id}</span>
                                              <span>Data: {t.date}</span>
                                              <span>Ref: {t.reference}</span>
                                          </div>
                                      </div>
                                      
                                      <div className="mt-4 md:mt-0 text-right">
                                          <p className="text-sm text-gray-500">Valor Total Depositado</p>
                                          <p className="text-2xl font-bold text-gray-900">{new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(t.amount)}</p>
                                      </div>
                                  </div>

                                  {/* Calculation Breakdown */}
                                  <div className="bg-gray-50 px-4 py-3 border-t border-b border-gray-200 grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                          <p className="text-gray-500 text-xs">Comissão Arrendaki (2.5%)</p>
                                          <p className="font-bold text-green-600">+{new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(commission)}</p>
                                      </div>
                                      <div className="text-right">
                                          <p className="text-gray-500 text-xs">A Transferir ao Proprietário</p>
                                          <p className="font-bold text-blue-600">{new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(netOwnerAmount)}</p>
                                      </div>
                                  </div>

                                  {t.status === 'escrow_held' ? (
                                      <div className="p-4 flex space-x-3">
                                          <button 
                                              onClick={() => handleEscrowAction(t.id, 'release', netOwnerAmount)} 
                                              className="flex-1 bg-green-600 text-white py-3 rounded-lg text-sm font-bold hover:bg-green-700 flex items-center justify-center shadow-md"
                                          >
                                              <ArrowRightLeft className="w-4 h-4 mr-2" /> Libertar {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(netOwnerAmount)}
                                          </button>
                                          <button 
                                              onClick={() => handleEscrowAction(t.id, 'refund', t.amount)}
                                              className="flex-1 bg-white border border-red-200 text-red-700 py-3 rounded-lg text-sm font-bold hover:bg-red-50 flex items-center justify-center"
                                          >
                                              <XCircle className="w-4 h-4 mr-2" /> Devolver Totalidade
                                          </button>
                                      </div>
                                  ) : (
                                      <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
                                          <span className={`font-bold text-sm uppercase flex items-center justify-center ${t.status === 'released' ? 'text-green-600' : 'text-red-600'}`}>
                                              {t.status === 'released' ? <CheckCircle className="w-4 h-4 mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                                              {t.status === 'released' ? 'Fundos Libertados ao Proprietário' : 'Reembolsado ao Inquilino'}
                                          </span>
                                      </div>
                                  )}
                              </div>
                          );
                      })}
                  </div>
              )}

              {/* REPORTS TAB */}
              {activeSubTab === 'reports' && (
                  <div className="space-y-6">
                      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                          <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                              <FileSpreadsheet className="w-5 h-5 mr-2 text-brand-600" />
                              Exportar Relatórios
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                              <div>
                                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Data Início</label>
                                  <input 
                                      type="date" 
                                      value={reportStartDate} 
                                      onChange={e => setReportStartDate(e.target.value)} 
                                      className="w-full p-2 border border-gray-300 rounded-lg text-sm" 
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Data Fim</label>
                                  <input 
                                      type="date" 
                                      value={reportEndDate} 
                                      onChange={e => setReportEndDate(e.target.value)} 
                                      className="w-full p-2 border border-gray-300 rounded-lg text-sm" 
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Tipo de Transação</label>
                                  <select 
                                      value={reportType} 
                                      onChange={e => setReportType(e.target.value)} 
                                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                                  >
                                      <option value="all">Todas</option>
                                      <option value="listing_fee">Taxas de Listagem</option>
                                      <option value="escrow_deposit">Depósitos Escrow</option>
                                  </select>
                              </div>
                          </div>
                          <div className="flex space-x-3">
                              <button 
                                  onClick={exportToCSV}
                                  className="flex-1 bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-gray-800 flex items-center justify-center shadow-md"
                              >
                                  <FileSpreadsheet className="w-4 h-4 mr-2" /> Exportar CSV (Excel)
                              </button>
                              <button 
                                  onClick={exportToPDF}
                                  className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-50 flex items-center justify-center"
                              >
                                  <FileText className="w-4 h-4 mr-2" /> Gerar PDF
                              </button>
                          </div>
                      </div>

                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                          <div className="p-4 bg-gray-50 border-b border-gray-200">
                              <h4 className="font-bold text-gray-700 text-sm">Pré-visualização de Dados Recentes</h4>
                          </div>
                          <div className="overflow-x-auto">
                              <table className="w-full text-sm text-left">
                                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                                      <tr>
                                          <th className="px-4 py-3">ID</th>
                                          <th className="px-4 py-3">Data</th>
                                          <th className="px-4 py-3">Tipo</th>
                                          <th className="px-4 py-3">Utilizador</th>
                                          <th className="px-4 py-3 text-right">Valor</th>
                                          <th className="px-4 py-3 text-center">Estado</th>
                                      </tr>
                                  </thead>
                                  <tbody>
                                      {transactions.slice(0, 5).map(t => (
                                          <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                                              <td className="px-4 py-3 font-mono text-xs">{t.id}</td>
                                              <td className="px-4 py-3">{t.date}</td>
                                              <td className="px-4 py-3 capitalize">{t.type.replace('_', ' ')}</td>
                                              <td className="px-4 py-3">{t.userName}</td>
                                              <td className="px-4 py-3 text-right font-bold">{t.amount} {t.currency}</td>
                                              <td className="px-4 py-3 text-center">
                                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                      t.status === 'completed' || t.status === 'released' ? 'bg-green-100 text-green-700' :
                                                      t.status === 'pending' || t.status === 'escrow_held' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                                  }`}>
                                                      {t.status}
                                                  </span>
                                              </td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      );
  };

  const renderSecurity = () => {
    // Sub-tabs for security are 'verify' and 'audits' (derived from activeSubTab logic or just tabs here)
    const [securityTab, setSecurityTab] = useState<'verify' | 'audits'>('verify');
    
    const pendingVerifications = verificationQueue.filter(v => v.status !== 'approved' && v.status !== 'rejected').length;
    const verifiedUsersCount = usersList.filter(u => u.isIdentityVerified).length;
    const activeThreats = auditChats.length;

    // Quick Action Reasons
    const rejectionReasons = ["Foto Ilegível", "Documento Expirado", "Dados não coincidem", "Falta Verso"];
    const reviewReasons = ["Confirmar com Supervisor", "Suspeita de Fraude", "Requer Contacto Telefónico"];

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Security KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Fila de Verificação</p>
                        <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{pendingVerifications}</h3>
                        <p className="text-xs text-orange-500 font-medium">Pendentes de Ação</p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-lg">
                        <FileSearch className="w-6 h-6 text-orange-600" />
                    </div>
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Kiá Verified</p>
                        <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{verifiedUsersCount}</h3>
                        <p className="text-xs text-green-600 font-medium">Utilizadores Certificados</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                        <Fingerprint className="w-6 h-6 text-green-600" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Alertas de NLP</p>
                        <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{activeThreats}</h3>
                        <p className="text-xs text-red-600 font-medium">Conversas Suspeitas</p>
                    </div>
                    <div className="p-3 bg-red-100 rounded-lg">
                        <ShieldAlert className="w-6 h-6 text-red-600" />
                    </div>
                </div>
            </div>

            <div className="flex space-x-4 border-b border-gray-200 pb-1">
                <button 
                    onClick={() => setSecurityTab('verify')}
                    className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors ${securityTab === 'verify' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Fila de Verificação
                </button>
                <button 
                    onClick={() => setSecurityTab('audits')}
                    className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors ${securityTab === 'audits' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Auditoria de Chats
                </button>
            </div>

            {securityTab === 'verify' && hasPermission('manage_verification') && (
                <div className="space-y-4">
                     {/* Split View: Queue List (Left) | Inspector (Right) */}
                     <div className="flex flex-col lg:flex-row gap-6 h-[600px]">
                        {/* List - Scrollable */}
                        <div className={`flex-1 space-y-3 overflow-y-auto pr-2 ${inspectingRequest ? 'hidden lg:block' : ''}`}>
                             {pendingVerifications === 0 && (
                                 <div className="text-center py-12 bg-gray-50 rounded-xl border-dashed border-gray-300 border-2">
                                     <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-2" />
                                     <p className="text-gray-500 font-medium">Tudo limpo! Nenhuma verificação pendente.</p>
                                 </div>
                             )}
                             {verificationQueue
                                .filter(v => v.status !== 'approved' && v.status !== 'rejected')
                                .sort((a,b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                                .map(req => {
                                 const userDetails = usersList.find(u => u.id === req.userId);
                                 return (
                                     <div 
                                        key={req.id} 
                                        onClick={() => setInspectingRequest(req)}
                                        className={`bg-white p-4 rounded-xl border cursor-pointer hover:shadow-md transition-all ${inspectingRequest?.id === req.id ? 'border-brand-500 ring-2 ring-brand-100 bg-brand-50' : 'border-gray-200'}`}
                                     >
                                         <div className="flex justify-between items-start mb-2">
                                             <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center ${req.type === 'identity' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                 {req.type === 'identity' ? <Fingerprint className="w-3 h-3 mr-1"/> : <Home className="w-3 h-3 mr-1"/>}
                                                 {req.type === 'identity' ? 'Identidade' : 'Propriedade'}
                                             </span>
                                             <span className="text-[10px] text-gray-400 font-mono">{req.submittedAt}</span>
                                         </div>
                                         <div className="flex items-center mt-2">
                                             <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3 text-xs font-bold text-gray-600">
                                                 {userDetails?.name.charAt(0) || '?'}
                                             </div>
                                             <div className="overflow-hidden">
                                                 <p className="text-sm font-bold text-gray-900 truncate">{userDetails?.name || req.userId}</p>
                                                 <p className="text-xs text-gray-500 truncate">{userDetails?.email}</p>
                                             </div>
                                         </div>
                                         {req.status === 'review_needed' && (
                                             <div className="mt-2 bg-yellow-50 text-yellow-700 text-xs p-2 rounded border border-yellow-200 flex items-center">
                                                 <AlertTriangle className="w-3 h-3 mr-1" /> Em Revisão
                                             </div>
                                         )}
                                     </div>
                                 );
                             })}
                        </div>
                        
                        {/* Inspector Panel - Fixed Height */}
                        {inspectingRequest ? (
                            <div className="flex-[1.5] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col h-full">
                                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                    <div>
                                        <h3 className="font-bold text-gray-800">Inspecionar Documento</h3>
                                        <p className="text-xs text-gray-500">ID: {inspectingRequest.id} • {inspectingRequest.type === 'identity' ? 'BI/Passaporte' : 'Título de Propriedade'}</p>
                                    </div>
                                    <button onClick={() => setInspectingRequest(null)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6"/></button>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto bg-gray-900 relative group flex items-center justify-center">
                                    <img 
                                        src={inspectingRequest.documentUrl} 
                                        className="max-w-full max-h-full object-contain shadow-lg" 
                                        alt="Documento" 
                                    />
                                    <div className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full backdrop-blur-sm">
                                        <ZoomIn className="w-5 h-5" />
                                    </div>
                                </div>

                                <div className="p-4 bg-white border-t border-gray-200 space-y-4">
                                    {/* Quick Actions Tags */}
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-2">Motivos Rápidos</p>
                                        <div className="flex flex-wrap gap-2">
                                            {rejectionReasons.map(reason => (
                                                <button 
                                                    key={reason}
                                                    onClick={() => setVerificationActionNote(reason)}
                                                    className="px-2 py-1 bg-red-50 text-red-600 border border-red-100 rounded text-xs hover:bg-red-100 transition-colors flex items-center"
                                                >
                                                    <Tag className="w-3 h-3 mr-1" /> {reason}
                                                </button>
                                            ))}
                                            {reviewReasons.map(reason => (
                                                <button 
                                                    key={reason}
                                                    onClick={() => setVerificationActionNote(reason)}
                                                    className="px-2 py-1 bg-yellow-50 text-yellow-700 border border-yellow-100 rounded text-xs hover:bg-yellow-100 transition-colors flex items-center"
                                                >
                                                    <Tag className="w-3 h-3 mr-1" /> {reason}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nota da Ação (Obrigatória para Rejeição)</label>
                                        <input 
                                            type="text" 
                                            className="w-full border border-gray-300 p-2 rounded text-sm focus:ring-brand-500 focus:border-brand-500"
                                            placeholder="Ex: Documento legível e válido."
                                            value={verificationActionNote}
                                            onChange={e => setVerificationActionNote(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex space-x-2">
                                        <button 
                                            onClick={() => handleProcessVerification('approve')}
                                            className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold text-sm hover:bg-green-700 shadow-sm flex items-center justify-center transition-transform hover:-translate-y-0.5"
                                        >
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Aprovar
                                        </button>
                                        <button 
                                            onClick={() => handleProcessVerification('review_needed')}
                                            className="flex-1 bg-yellow-500 text-white py-3 rounded-lg font-bold text-sm hover:bg-yellow-600 shadow-sm flex items-center justify-center transition-transform hover:-translate-y-0.5"
                                        >
                                            <AlertTriangle className="w-4 h-4 mr-2" />
                                            Revisão
                                        </button>
                                        <button 
                                            onClick={() => handleProcessVerification('reject')}
                                            className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold text-sm hover:bg-red-700 shadow-sm flex items-center justify-center transition-transform hover:-translate-y-0.5"
                                        >
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Rejeitar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-[1.5] bg-gray-50 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 p-8">
                                <FileSearch className="w-16 h-16 mb-4 opacity-50" />
                                <p className="font-medium">Selecione um item da fila para inspecionar</p>
                            </div>
                        )}
                     </div>
                </div>
            )}

            {securityTab === 'audits' && hasPermission('audit_chats') && (
                 <div className="space-y-4">
                     {auditChats.length === 0 ? (
                         <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
                             <ShieldCheck className="w-12 h-12 mx-auto text-green-500 mb-3" />
                             <p className="font-medium">Nenhum alerta de segurança ativo.</p>
                         </div>
                     ) : (
                         <div className="grid grid-cols-1 gap-4">
                             {auditChats.map(chat => (
                                 <div key={chat.id} className="bg-white border-l-4 border-red-500 rounded-r-xl shadow-sm p-4 flex justify-between items-start hover:shadow-md transition-shadow">
                                     <div>
                                         <div className="flex items-center text-red-700 font-bold mb-1">
                                             <AlertTriangle className="w-4 h-4 mr-2" />
                                             {chat.reason === 'phone_sharing' ? 'Partilha de Contacto (Telefone)' : 'Linguagem Ofensiva / Scam'}
                                         </div>
                                         <p className="text-sm text-gray-600 mb-2">
                                             Participantes: <span className="font-mono bg-gray-100 px-1 rounded text-xs">{chat.participants.join(', ')}</span>
                                         </p>
                                         <div className="bg-red-50 p-3 rounded text-sm text-gray-800 font-mono border border-red-100 italic">
                                             "{chat.snippet}"
                                         </div>
                                         <p className="text-xs text-gray-400 mt-2 flex items-center">
                                             <Clock className="w-3 h-3 mr-1" /> {chat.timestamp}
                                         </p>
                                     </div>
                                     <div className="flex flex-col space-y-2">
                                         <button 
                                            onClick={() => setViewingChatLog(chat)}
                                            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-gray-800 flex items-center shadow-sm"
                                         >
                                             <Eye className="w-3 h-3 mr-2" />
                                             Ver Contexto
                                         </button>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     )}
                 </div>
            )}
        </div>
    );
  };

  const renderIT = () => {
    // Mock Data for IT
    const systemLogs = [
        { id: 'log1', level: 'error', message: 'Failed to sync with Multicaixa Gateway: Timeout', timestamp: '2023-10-26 14:20' },
        { id: 'log2', level: 'warning', message: 'High memory usage on Image Processor Node', timestamp: '2023-10-26 13:45' },
        { id: 'log3', level: 'info', message: 'Daily backup completed successfully', timestamp: '2023-10-26 04:00' },
    ];

    const serviceStatus = [
        { name: 'API Server', status: 'online', uptime: '99.9%' },
        { name: 'Database (Postgres)', status: 'online', uptime: '99.99%' },
        { name: 'Storage (S3)', status: 'online', uptime: '100%' },
        { name: 'Payment Gateway (MCX)', status: 'degraded', uptime: '98.5%' },
    ];

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {serviceStatus.map(service => (
                     <div key={service.name} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                         <div>
                             <p className="text-sm font-medium text-gray-500">{service.name}</p>
                             <div className="flex items-center mt-1">
                                 <div className={`w-2.5 h-2.5 rounded-full mr-2 ${service.status === 'online' ? 'bg-green-500' : service.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                                 <span className="font-bold text-gray-900 capitalize">{service.status}</span>
                             </div>
                         </div>
                         <div className="text-right">
                             <span className="text-xs text-gray-400">Uptime</span>
                             <p className="font-mono font-bold text-gray-700">{service.uptime}</p>
                         </div>
                     </div>
                 ))}
            </div>

            <div className="bg-gray-900 rounded-xl overflow-hidden shadow-md text-gray-300 font-mono text-sm">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950">
                    <h3 className="font-bold text-gray-100 flex items-center">
                        <Server className="w-4 h-4 mr-2" /> Logs do Sistema
                    </h3>
                    <button className="text-xs text-brand-400 hover:text-brand-300">Ver Todos</button>
                </div>
                <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
                    {systemLogs.map(log => (
                        <div key={log.id} className="flex space-x-3 hover:bg-gray-800 p-1 rounded">
                            <span className="text-gray-500 w-36 shrink-0">{log.timestamp}</span>
                            <span className={`w-16 font-bold uppercase shrink-0 ${
                                log.level === 'error' ? 'text-red-500' : 
                                log.level === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                            }`}>[{log.level}]</span>
                            <span className="text-gray-300">{log.message}</span>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-800 mb-4">Ações de Manutenção</h3>
                <div className="flex space-x-4">
                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700">Limpar Cache</button>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700">Reiniciar Serviços de Imagem</button>
                    <button className="px-4 py-2 border border-red-200 bg-red-50 rounded-lg text-sm font-medium hover:bg-red-100 text-red-700 ml-auto">Modo de Manutenção</button>
                </div>
            </div>
        </div>
    );
  };

  const renderContracts = () => {
    // Filter logic
    const filteredContracts = contracts.filter(c => {
        const matchSearch = c.propertyTitle.toLowerCase().includes(contractFilters.search.toLowerCase()) || 
                            c.tenantName.toLowerCase().includes(contractFilters.search.toLowerCase()) ||
                            c.ownerName.toLowerCase().includes(contractFilters.search.toLowerCase());
        const matchStatus = contractFilters.status === 'all' || c.status === contractFilters.status;
        return matchSearch && matchStatus;
    });

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Contratos Ativos" value={contracts.filter(c => c.status === 'active').length} icon={FileText} color="green" />
                <StatCard title="Pendentes Assinatura" value={contracts.filter(c => c.status === 'pending_signature').length} icon={PenTool} color="orange" />
                <StatCard title="Terminados/Expirados" value={contracts.filter(c => c.status === 'terminated' || c.status === 'expired').length} icon={XCircle} color="red" />
                <StatCard title="Valor Total (Mensal)" value="Kz 12.5M" icon={DollarSign} color="blue" />
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pesquisar</label>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Propriedade, Inquilino ou Proprietário" 
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
                            value={contractFilters.search}
                            onChange={e => setContractFilters({...contractFilters, search: e.target.value})}
                        />
                    </div>
                </div>
                <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Estado</label>
                     <select 
                        value={contractFilters.status}
                        onChange={e => setContractFilters({...contractFilters, status: e.target.value as any})}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white"
                     >
                         <option value="all">Todos</option>
                         <option value="active">Ativos</option>
                         <option value="expired">Expirados</option>
                         <option value="terminated">Rescindidos</option>
                     </select>
                </div>
                <div>
                    <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200">
                        <Filter className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Contracts List */}
            <div className="space-y-4">
                {filteredContracts.map(contract => (
                    <div key={contract.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                    <FileSignature className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{contract.propertyTitle}</h4>
                                    <p className="text-sm text-gray-500">
                                        <span className="font-medium">{contract.tenantName}</span> (Inquilino) • <span className="font-medium">{contract.ownerName}</span> (Proprietário)
                                    </p>
                                    <div className="flex items-center mt-2 text-xs text-gray-400 space-x-3">
                                        <span className="flex items-center"><Hash className="w-3 h-3 mr-1"/> {contract.id}</span>
                                        <span className="flex items-center"><Calendar className="w-3 h-3 mr-1"/> {contract.startDate} a {contract.endDate || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-4 md:mt-0 flex flex-col items-end space-y-2 w-full md:w-auto">
                                <div className="flex items-center space-x-2">
                                     <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                          contract.status === 'active' ? 'bg-green-100 text-green-700' :
                                          contract.status === 'pending_signature' ? 'bg-yellow-100 text-yellow-700' :
                                          'bg-red-100 text-red-700'
                                      }`}>
                                          {contract.status === 'active' ? 'Ativo' : contract.status === 'pending_signature' ? 'Pendente' : contract.status}
                                     </span>
                                     <p className="font-bold text-gray-900">{new Intl.NumberFormat('pt-AO', { style: 'currency', currency: contract.currency }).format(contract.value)}</p>
                                </div>
                                
                                <div className="flex space-x-2 w-full">
                                    <button 
                                        onClick={() => handleDownloadContract(contract.id)}
                                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 flex items-center"
                                    >
                                        <Download className="w-3 h-3 mr-1" /> PDF
                                    </button>
                                    {contract.status === 'active' && hasPermission('manage_contracts') && (
                                        <>
                                            <button 
                                                onClick={() => handleContractAction(contract.id, 'renew')}
                                                className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-medium hover:bg-green-100"
                                            >
                                                Renovar
                                            </button>
                                            <button 
                                                onClick={() => handleContractAction(contract.id, 'terminate')}
                                                className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-medium hover:bg-red-100"
                                            >
                                                Rescindir
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {filteredContracts.length === 0 && (
                     <div className="text-center py-10 text-gray-500 bg-white border border-gray-200 rounded-xl border-dashed">
                         <FileSearch className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                         Nenhum contrato encontrado com os filtros atuais.
                     </div>
                )}
            </div>
        </div>
    );
  };

  const renderCommunications = () => {
      return (
          <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Sender Form */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                          <Megaphone className="w-5 h-5 mr-2 text-brand-600" />
                          Nova Notificação Push
                      </h3>
                      <div className="space-y-4">
                          <div>
                              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Título</label>
                              <input 
                                  type="text" 
                                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-brand-500 focus:border-brand-500"
                                  placeholder="Ex: Manutenção do Sistema"
                                  value={notifForm.title}
                                  onChange={e => setNotifForm({...notifForm, title: e.target.value})}
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Mensagem</label>
                              <textarea 
                                  className="w-full border border-gray-300 rounded-lg p-2 text-sm h-24 resize-none focus:ring-brand-500 focus:border-brand-500"
                                  placeholder="A sua mensagem aqui..."
                                  value={notifForm.message}
                                  onChange={e => setNotifForm({...notifForm, message: e.target.value})}
                              ></textarea>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Público Alvo</label>
                                  <select 
                                      className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                                      value={notifForm.target}
                                      onChange={e => setNotifForm({...notifForm, target: e.target.value as any})}
                                  >
                                      <option value="all">Todos os Utilizadores</option>
                                      <option value="tenant">Inquilinos</option>
                                      <option value="owner">Proprietários</option>
                                      <option value="broker">Corretores</option>
                                  </select>
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Tipo</label>
                                  <select 
                                      className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                                      value={notifForm.type}
                                      onChange={e => setNotifForm({...notifForm, type: e.target.value as any})}
                                  >
                                      <option value="info">Informativo (Azul)</option>
                                      <option value="warning">Alerta (Amarelo)</option>
                                      <option value="promo">Promoção (Verde)</option>
                                  </select>
                              </div>
                          </div>
                          <div className="pt-2">
                              <button 
                                  onClick={handleSendPushNotification}
                                  className="w-full bg-brand-600 text-white py-2 rounded-lg font-bold shadow-md hover:bg-brand-700 flex items-center justify-center"
                              >
                                  <Send className="w-4 h-4 mr-2" /> Enviar Notificação
                              </button>
                          </div>
                      </div>
                  </div>

                  {/* History */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full">
                      <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                          <Clock className="w-5 h-5 mr-2 text-gray-500" />
                          Histórico de Envios
                      </h3>
                      <div className="flex-1 overflow-y-auto space-y-3 pr-2 max-h-[400px]">
                          {notificationHistory.map(notif => (
                              <div key={notif.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                  <div className="flex justify-between items-start mb-1">
                                      <h4 className="font-bold text-sm text-gray-900">{notif.title}</h4>
                                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                                          notif.type === 'info' ? 'bg-blue-100 text-blue-700' :
                                          notif.type === 'warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                                      }`}>{notif.type}</span>
                                  </div>
                                  <p className="text-xs text-gray-600 mb-2">{notif.message}</p>
                                  <div className="flex justify-between items-center text-[10px] text-gray-400">
                                      <span>Alvo: {notif.target}</span>
                                      <span>{notif.date}</span>
                                  </div>
                              </div>
                          ))}
                          {notificationHistory.length === 0 && (
                              <p className="text-center text-gray-400 text-sm py-10">Sem histórico.</p>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  const renderChatAuditModal = () => {
      if (!viewingChatLog) return null;

      return (
          <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
              <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="bg-red-50 p-4 border-b border-red-100 flex justify-between items-center">
                      <div className="flex items-center text-red-800">
                          <ShieldAlert className="w-6 h-6 mr-2" />
                          <div>
                              <h3 className="font-bold">Auditoria de Segurança</h3>
                              <p className="text-xs text-red-600">ID do Chat: {viewingChatLog.id}</p>
                          </div>
                      </div>
                      <button onClick={() => setViewingChatLog(null)} className="text-red-400 hover:text-red-600">
                          <X className="w-6 h-6" />
                      </button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto">
                      <div className="mb-6">
                          <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">Detalhes da Infração</h4>
                          <div className="bg-white border border-red-200 rounded-lg p-4 shadow-sm">
                              <div className="grid grid-cols-2 gap-4 mb-3">
                                  <div>
                                      <span className="text-xs text-gray-400 block">Tipo de Alerta</span>
                                      <span className="font-bold text-gray-800 text-sm">{viewingChatLog.reason === 'phone_sharing' ? 'Partilha de Contacto' : 'Linguagem Imprópria'}</span>
                                  </div>
                                  <div>
                                      <span className="text-xs text-gray-400 block">Data/Hora</span>
                                      <span className="font-bold text-gray-800 text-sm">{viewingChatLog.timestamp}</span>
                                  </div>
                              </div>
                              <div>
                                  <span className="text-xs text-gray-400 block mb-1">Snippet Detetado (Contexto)</span>
                                  <div className="bg-gray-100 p-3 rounded font-mono text-sm text-gray-700 border-l-4 border-red-400">
                                      "... {viewingChatLog.snippet} ..."
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
                          <h4 className="font-bold flex items-center mb-1"><Info className="w-4 h-4 mr-2"/> Ação Recomendada</h4>
                          <p>
                              Verifique se os participantes tentaram contornar o sistema de pagamentos ou agendamento (Escrow).
                              Se confirmado, suspenda os utilizadores envolvidos.
                          </p>
                      </div>
                  </div>

                  <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end space-x-3">
                      <button 
                          onClick={() => handleResolveAudit(viewingChatLog.id, 'false_positive')}
                          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 shadow-sm"
                      >
                          Marcar como Seguro (Falso Positivo)
                      </button>
                      <button 
                          onClick={() => handleResolveAudit(viewingChatLog.id, 'confirm_violation')}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 shadow-sm flex items-center"
                      >
                          <Ban className="w-4 h-4 mr-2" /> Confirmar Violação
                      </button>
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="bg-white rounded-lg shadow min-h-screen">
       <div className="border-b px-6 py-4 flex justify-between items-center bg-gray-50 rounded-t-lg sticky top-16 z-10">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <LayoutDashboard className="w-6 h-6 mr-2 text-brand-600" />
              Painel Administrativo
          </h2>
          {/* Module Selector - Simplified for mobile responsiveness */}
          <div className="flex space-x-1 overflow-x-auto no-scrollbar max-w-[60%] md:max-w-none">
               {hasPermission('view_operations_module') && (
                   <button onClick={() => setActiveModule('operations')} className={`px-3 py-1.5 rounded-md text-sm font-bold transition-colors whitespace-nowrap ${activeModule === 'operations' ? 'bg-white shadow text-brand-600 ring-1 ring-gray-200' : 'text-gray-500 hover:bg-gray-200'}`}>Operações</button>
               )}
               {hasPermission('view_finance_module') && (
                   <button onClick={() => setActiveModule('finance')} className={`px-3 py-1.5 rounded-md text-sm font-bold transition-colors whitespace-nowrap ${activeModule === 'finance' ? 'bg-white shadow text-brand-600 ring-1 ring-gray-200' : 'text-gray-500 hover:bg-gray-200'}`}>Finanças</button>
               )}
               {hasPermission('view_contracts_module') && (
                   <button onClick={() => setActiveModule('contracts')} className={`px-3 py-1.5 rounded-md text-sm font-bold transition-colors whitespace-nowrap ${activeModule === 'contracts' ? 'bg-white shadow text-brand-600 ring-1 ring-gray-200' : 'text-gray-500 hover:bg-gray-200'}`}>Contratos</button>
               )}
               {hasPermission('view_communication_module') && (
                   <button onClick={() => setActiveModule('communication')} className={`px-3 py-1.5 rounded-md text-sm font-bold transition-colors whitespace-nowrap ${activeModule === 'communication' ? 'bg-white shadow text-brand-600 ring-1 ring-gray-200' : 'text-gray-500 hover:bg-gray-200'}`}>Comunicação</button>
               )}
               {hasPermission('view_security_module') && (
                   <button onClick={() => setActiveModule('security')} className={`px-3 py-1.5 rounded-md text-sm font-bold transition-colors whitespace-nowrap ${activeModule === 'security' ? 'bg-white shadow text-brand-600 ring-1 ring-gray-200' : 'text-gray-500 hover:bg-gray-200'}`}>Segurança</button>
               )}
               {hasPermission('view_infrastructure_module') && (
                   <button onClick={() => setActiveModule('infrastructure')} className={`px-3 py-1.5 rounded-md text-sm font-bold transition-colors whitespace-nowrap ${activeModule === 'infrastructure' ? 'bg-white shadow text-brand-600 ring-1 ring-gray-200' : 'text-gray-500 hover:bg-gray-200'}`}>Infra</button>
               )}
          </div>
       </div>

       <div className="p-6">
           {activeModule === 'operations' && renderOperations()}
           {activeModule === 'finance' && renderFinance()}
           {activeModule === 'contracts' && renderContracts()}
           {activeModule === 'communication' && renderCommunications()}
           {activeModule === 'security' && renderSecurity()}
           {activeModule === 'infrastructure' && renderIT()}
       </div>

       {/* Modals */}
       <SecurityConfirmationModal 
           isOpen={confirmation.isOpen}
           title={confirmation.title}
           description={confirmation.description}
           onConfirm={handleConfirmAction}
           onCancel={() => setConfirmation({ ...confirmation, isOpen: false })}
           variant={confirmation.variant}
       />
       
       {renderChatAuditModal()}

       {rejectDialog.isOpen && (
            <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
                    <div className="bg-red-50 p-4 border-b border-red-100 flex items-center">
                        <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                        <h3 className="font-bold text-red-900">Rejeitar Anúncio</h3>
                    </div>
                    <div className="p-6">
                        <p className="text-sm text-gray-600 mb-4">
                            Por favor, indique o motivo da rejeição. <span className="font-bold">Esta mensagem será enviada ao proprietário</span> para que ele possa corrigir o anúncio.
                        </p>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                            Motivo da Rejeição <span className="text-red-500">*</span>
                        </label>
                        <textarea 
                            className="w-full border border-gray-300 p-3 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 h-32 resize-none"
                            placeholder="Ex: As fotos não estão nítidas; O preço parece incorreto; Faltam documentos..."
                            value={rejectDialog.reason}
                            onChange={e => setRejectDialog({...rejectDialog, reason: e.target.value})}
                        ></textarea>
                    </div>
                    <div className="bg-gray-50 p-4 flex justify-end space-x-3">
                        <button onClick={() => setRejectDialog({...rejectDialog, isOpen: false})} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm">Cancelar</button>
                        <button 
                            onClick={confirmRejection} 
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-sm text-sm flex items-center"
                        >
                            <XCircle className="w-4 h-4 mr-2" />
                            Confirmar Rejeição
                        </button>
                    </div>
                </div>
            </div>
       )}
    </div>
  );
};

export default AdminPanel;
