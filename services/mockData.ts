
// ... (Previous imports)
import { Property, Transaction, FlaggedChat, User, BlogPost, Contract, VisitRequest, ChatConversation, DocumentRecord, AuditLog, LegalClause, LegalAlert, SystemLog, ServiceHealth, DatabaseQuery, Invoice, FinancialMetric, DebtAging } from '../types';

// ... (Keep existing MOCK_PROPERTIES, MOCK_TRANSACTIONS, MOCK_CONTRACTS, etc.)

// --- MOCK FINANCIAL DATA ---

export const MOCK_FINANCIAL_STATS: FinancialMetric = {
    totalRevenue: 2450000,
    totalVTT: 98000000,
    pendingCollections: 150000,
    overdueAmount: 45000,
    gatewayBalance: 2600000 // Slightly higher due to float/pending settlements
};

export const MOCK_DEBT_AGING: DebtAging[] = [
    { range: '0-7 days', count: 12, totalValue: 300000 },
    { range: '8-15 days', count: 5, totalValue: 120000 },
    { range: '15+ days', count: 2, totalValue: 45000 }
];

export const MOCK_INVOICES: Invoice[] = [
    {
        id: 'INV-2023-001',
        type: 'tax_invoice',
        contractId: 'CT-2023-001',
        userId: 'owner1',
        userName: 'João Proprietário',
        amount: 4500, // 2.5% of 180,000
        description: 'Taxa de Serviço Kiá Verify (2.5%) - Contrato CT-2023-001',
        dueDate: '2023-10-25',
        status: 'paid',
        fiscalHash: 'AH12-33XJ-99KL',
        issuedAt: '2023-10-20'
    },
    {
        id: 'PF-2023-045',
        type: 'proforma',
        contractId: 'CT-2023-005',
        userId: 'owner_check_2',
        userName: 'Maria Verificação',
        amount: 7500,
        description: 'Taxa de Serviço Kiá Verify (2.5%) - Contrato CT-2023-005',
        dueDate: '2023-10-30',
        status: 'issued',
        issuedAt: '2023-10-27'
    },
    {
        id: 'PF-2023-040',
        type: 'proforma',
        contractId: 'CT-2023-004',
        userId: 'owner_late',
        userName: 'Pedro Atrasado',
        amount: 5000,
        description: 'Taxa de Serviço Kiá Verify (2.5%) - Contrato CT-2023-004',
        dueDate: '2023-10-15',
        status: 'overdue',
        issuedAt: '2023-10-08'
    }
];

// Re-export properties etc.
export const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    title: 'Apartamento T3 Moderno no Kilamba',
    price: 180000,
    currency: 'AOA',
    location: {
      province: 'Luanda',
      municipality: 'Belas',
      address: 'Centralidade do Kilamba, Bloco Q, 5º Andar'
    },
    features: ['Água da Rede', 'Estacionamento', 'Segurança 24h', 'Cozinha Montada', 'Elevador'],
    type: 'Apartamento',
    listingType: 'Arrendar',
    status: 'available',
    bedrooms: 3,
    bathrooms: 2,
    area: 110,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=800&q=80'
    ],
    isGuaranteed: true,
    isVerified: true,
    ownerId: 'owner1',
    description: 'Excelente apartamento T3 na centralidade do Kilamba.'
  },
  // ... (Add other properties here or import them if keeping file small, assuming full replacement)
  {
    id: '6',
    title: '[PENDENTE] Apartamento T2 Maianga',
    price: 250000,
    currency: 'AOA',
    location: { province: 'Luanda', municipality: 'Luanda', address: 'Rua Marien Ngouabi' },
    features: ['Ar Condicionado', 'Varanda'],
    type: 'Apartamento',
    listingType: 'Arrendar',
    status: 'pending',
    bedrooms: 2,
    bathrooms: 1,
    area: 90,
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'],
    isGuaranteed: true,
    isVerified: false,
    ownerId: 'owner_new',
    description: 'Apartamento pendente de aprovação.'
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
    {
        id: 'tx1',
        type: 'listing_fee',
        amount: 3000,
        currency: 'AOA',
        status: 'completed',
        date: '2023-10-25',
        userId: 'owner1',
        userName: 'João Proprietário',
        reference: '923 881 223',
        invoiceUrl: '#',
        vtt: 0,
        feeCalculated: 3000,
        gatewayId: 'MCX_998877'
    },
    {
        id: 'tx_service_fee_1',
        type: 'service_fee', // 2.5% Fee
        amount: 4500,
        currency: 'AOA',
        status: 'reconciled',
        date: '2023-10-26',
        userId: 'owner1',
        userName: 'João Proprietário',
        propertyId: '1',
        reference: 'REF-FEE-001',
        vtt: 180000,
        feeCalculated: 4500,
        gatewayId: 'MCX_112233',
        reconciledAt: '2023-10-27',
        reconciledBy: 'staff_finance'
    },
    {
        id: 'tx_escrow_1',
        type: 'escrow_deposit',
        amount: 450000, 
        currency: 'AOA',
        status: 'escrow_held', 
        date: '2023-10-24',
        userId: 'tenant1',
        userName: 'Maria Inquilina',
        propertyId: '1',
        propertyTitle: 'Apartamento T3 Moderno no Kilamba',
        reference: 'REF-ESC-001',
        gatewayId: 'MCX_554433'
    }
];

export const MOCK_CONTRACTS: Contract[] = [
    {
        id: 'CT-2023-001',
        propertyId: '1',
        propertyTitle: 'Apartamento T3 Moderno no Kilamba',
        tenantId: 'tenant1',
        tenantName: 'Maria Inquilina',
        ownerId: 'owner1',
        ownerName: 'João Proprietário',
        type: 'lease',
        status: 'active',
        startDate: '2023-10-01',
        endDate: '2024-10-01',
        value: 180000,
        currency: 'AOA',
        signedAt: '2023-09-28',
        pdfUrl: '#'
    }
];

export const MOCK_DOCUMENTS: DocumentRecord[] = [
    {
        id: 'FT-2023-089',
        type: 'invoice',
        title: 'Fatura de Serviço - Taxa de Publicação',
        date: '2023-10-25',
        url: '#',
        relatedEntityId: 'tx1',
        amount: 3000,
        status: 'available'
    }
];

export const MOCK_FLAGGED_CHATS: FlaggedChat[] = [
    {
        id: 'chat_audit_1',
        participants: ['owner1', 'tenant_suspicious'],
        reason: 'phone_sharing',
        snippet: '...liga para o meu unitel 923...',
        timestamp: '2023-10-26 10:30'
    }
];

export const MOCK_USERS: User[] = [
    { id: 'owner1', name: 'João Proprietário', email: 'joao@example.com', role: 'owner', group: 'external', accountStatus: 'active', isAuthenticated: true, phone: '923111222', isIdentityVerified: true, joinedAt: '2023-01-15' },
    { id: 'tenant1', name: 'Maria Inquilina', email: 'maria@example.com', role: 'tenant', group: 'external', accountStatus: 'active', isAuthenticated: true, phone: '944888777', isIdentityVerified: true, joinedAt: '2023-09-10' },
    { id: 'staff_admin', name: 'Admin Principal', email: 'admin@arrendaki.ao', role: 'admin', group: 'internal', accountStatus: 'active', isAuthenticated: true },
    { id: 'staff_legal', name: 'Dr. Jurídico', email: 'legal@arrendaki.ao', role: 'legal_compliance', group: 'internal', accountStatus: 'active', isAuthenticated: true },
    { id: 'usr_suspicious_99', name: 'Carlos Fraude', email: 'bad@actor.com', role: 'tenant', group: 'external', accountStatus: 'suspended_legal', isAuthenticated: true, phone: '999999999', isIdentityVerified: false, joinedAt: '2023-10-27' },
];

export const MOCK_BLOG_POSTS: BlogPost[] = [
    { 
        id: '1', 
        title: '5 Sinais de Burla Imobiliária',
        subtitle: 'Aprenda a identificar anúncios falsos.',
        slug: '5-sinais-burla-imobiliaria',
        author: 'Equipa de Segurança Kiá', 
        category: 'safety',
        status: 'published', 
        date: '20 Out 2023',
        image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
        content: '<p>Lorem ipsum...</p>'
    }
];

export const MOCK_VISITS: VisitRequest[] = [];
export const MOCK_CONVERSATIONS: ChatConversation[] = [];
export const MOCK_AUDIT_LOGS: AuditLog[] = [];
export const MOCK_FORENSIC_LOGS: SystemLog[] = [
    {
        id: 'log_991', level: 'security', action: 'DOC_UPLOAD_HASH_MISMATCH', 
        message: 'Uploaded document hash matches known forged file DB.', 
        timestamp: '2023-10-27 11:45:00', userId: 'usr_suspicious_99', ip: '41.220.10.2', 
        hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        details: 'File: bi_fake.pdf'
    },
    {
        id: 'log_992', level: 'warning', action: 'SUSPICIOUS_LOGIN_VELOCITY', 
        message: 'Login attempts from 3 different provinces in 1 hour.', 
        timestamp: '2023-10-27 10:15:22', userId: 'owner_check_2', ip: '102.12.33.1',
        details: 'Locations: Luanda, Huíla, Cabinda'
    }
];

export const MOCK_LEGAL_CLAUSES: LegalClause[] = [
    {
        id: 'lc_001',
        category: 'lease',
        title: 'Cláusula de Resolução por Falta de Pagamento',
        content: 'O não pagamento da renda por período superior a 30 dias constitui fundamento para a resolução imediata do presente contrato, sem necessidade de aviso prévio adicional.',
        version: '1.2',
        lastUpdated: '2023-10-01',
        status: 'approved',
        approvedBy: 'staff_legal',
        history: [
            { version: '1.0', content: 'O atraso de 60 dias implica resolução.', updatedAt: '2022-01-01', updatedBy: 'staff_legal', approvedBy: 'staff_admin', changeNote: 'Initial version' },
            { version: '1.1', content: 'O atraso de 45 dias implica resolução.', updatedAt: '2023-05-10', updatedBy: 'staff_legal', approvedBy: 'staff_admin', changeNote: 'Reduced tolerance period' }
        ]
    },
    {
        id: 'lc_002',
        category: 'sale',
        title: 'Cláusula de Sinal e Princípio de Pagamento',
        content: 'Como sinal e princípio de pagamento, o Segundo Outorgante entrega nesta data a quantia de [VALOR_SINAL], cuja quitação é dada pela assinatura deste contrato. Em caso de desistência, perde o sinal.',
        version: '1.0',
        lastUpdated: '2023-09-15',
        status: 'approved',
        approvedBy: 'staff_legal',
        history: []
    },
    {
        id: 'lc_003',
        category: 'lease',
        title: 'Cláusula de Benfeitorias',
        content: 'Quaisquer obras de melhoramento carecem de autorização por escrito do Senhorio e, uma vez realizadas, passam a integrar o imóvel sem direito a indemnização.',
        version: '2.0-draft',
        lastUpdated: '2023-10-27',
        status: 'draft',
        history: [
             { version: '1.0', content: 'Benfeitorias podem ser removidas se não danificarem o imóvel.', updatedAt: '2022-01-01', updatedBy: 'staff_legal', approvedBy: 'staff_admin' }
        ]
    }
];

export const MOCK_LEGAL_ALERTS: LegalAlert[] = [
    {
        id: 'alert_001',
        severity: 'critical',
        type: 'document_fraud',
        targetUser: 'usr_suspicious_99',
        targetUserName: 'Carlos Fraude',
        transactionId: 'tx_fraud_attempt',
        description: 'Tentativa de upload de Documento de Identidade falsificado detetada pelo sistema biométrico (Tentativa 3/3).',
        timestamp: '2023-10-27 09:45:00',
        status: 'open',
        assignedTo: 'staff_legal'
    },
    {
        id: 'alert_002',
        severity: 'high',
        type: 'suspicious_activity',
        targetUser: 'owner_check_2',
        targetUserName: 'Maria Verificação',
        description: 'Múltiplas alterações de IBAN bancário num curto espaço de tempo antes de receber o Escrow.',
        timestamp: '2023-10-26 18:30:00',
        status: 'investigating'
    }
];

export const MOCK_SYSTEM_LOGS: SystemLog[] = [
    ...MOCK_FORENSIC_LOGS,
    {
        id: 'sys_001', level: 'critical', action: 'DB_CONNECTION_ERROR', 
        message: 'Failed to connect to primary replica', 
        timestamp: '2023-10-27 10:15:22', module: 'Database', statusCode: 500, stackTrace: 'Error: Connection timeout at pg.connect()'
    },
    {
        id: 'sys_002', level: 'security', action: 'UNAUTHORIZED_ACCESS', 
        message: 'Access denied to /admin/contracts', 
        timestamp: '2023-10-27 09:45:00', userId: 'usr_suspicious_99', ip: '41.220.10.2', statusCode: 403
    },
    {
        id: 'sys_003', level: 'info', action: 'LOGIN_SUCCESS', 
        message: 'Staff member logged in', 
        timestamp: '2023-10-27 08:30:00', userId: 'staff_admin', ip: '197.230.12.44'
    }
];

export const MOCK_SERVICE_HEALTH: ServiceHealth[] = [
    { id: 'srv_1', name: 'Database Primary', status: 'healthy', latency: 45, lastChecked: 'Just now' },
    { id: 'srv_2', name: 'API Gateway', status: 'healthy', latency: 20, lastChecked: 'Just now' },
    { id: 'srv_3', name: 'Kiá Verify Engine', status: 'degraded', latency: 850, lastChecked: '1 min ago' },
    { id: 'srv_4', name: 'Payment Gateway (MCX)', status: 'healthy', latency: 120, lastChecked: 'Just now' },
    { id: 'srv_5', name: 'CDN (Images)', status: 'healthy', latency: 15, lastChecked: 'Just now' },
];

export const MOCK_SLOW_QUERIES: DatabaseQuery[] = [
    { id: 'q_1', query: 'SELECT * FROM transactions WHERE status = "pending" JOIN users ...', duration: 2500, timestamp: '10:15:22', origin: '/admin/finance' },
    { id: 'q_2', query: 'UPDATE properties SET status = "expired" WHERE ...', duration: 1200, timestamp: '03:00:00', origin: 'CRON_JOB' },
];
