
import { Property, Transaction, FlaggedChat, User, BlogPost, Contract, VisitRequest, ChatConversation, DocumentRecord, AuditLog, LegalClause, LegalAlert, SystemLog, ServiceHealth, DatabaseQuery } from '../types';

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
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80', // Living room
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80', // Another room
      'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=800&q=80'  // Exterior/Balcony look
    ],
    isGuaranteed: true,
    isVerified: true,
    ownerId: 'owner1',
    description: 'Excelente apartamento T3 na centralidade do Kilamba. O imóvel conta com cozinha equipada, sala ampla com varanda e acesso a elevador funcional. Zona calma e com fácil acesso a supermercados.'
  },
  {
    id: '2',
    title: 'Vivenda V4 de Luxo na Restinga',
    price: 85000000,
    currency: 'AOA',
    location: {
      province: 'Benguela',
      municipality: 'Lobito',
      address: 'Restinga, Lobito'
    },
    features: ['Gerador Próprio', 'Vista Mar', 'Piscina', 'Ar Condicionado', 'Quintal Vasto'],
    type: 'Vivenda',
    listingType: 'Comprar',
    status: 'available',
    bedrooms: 4,
    bathrooms: 4,
    area: 450,
    images: [
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80', // Beach house exterior
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80', // Pool area
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'  // Modern interior
    ],
    isGuaranteed: true,
    isVerified: true,
    ownerId: 'owner2',
    description: 'Oportunidade única na Restinga do Lobito. Vivenda de alto padrão com vista frontal para o mar, piscina privada e acabamentos de luxo. Documentação pronta para escritura.'
  },
  {
    id: '3',
    title: 'Escritório Open Space no Centro',
    price: 500000,
    currency: 'AOA',
    location: {
      province: 'Huambo',
      municipality: 'Huambo',
      address: 'Av. da Independência, Edifício Granito'
    },
    features: ['Internet Fibra', 'Segurança 24h', 'Gerador Próprio', 'Sala de Reuniões'],
    type: 'Escritório',
    listingType: 'Arrendar',
    status: 'rented',
    bedrooms: 0,
    bathrooms: 2,
    area: 85,
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80', // Office
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80'  // Meeting room
    ],
    isGuaranteed: false,
    isVerified: true,
    ownerId: 'broker1',
    description: 'Espaço comercial moderno e pronto a entrar, ideal para startups ou representações comerciais. Localizado no coração do Huambo.'
  },
  {
    id: '4',
    title: 'Vivenda V3 no Condomínio Vereda',
    price: 650000,
    currency: 'AOA',
    location: {
      province: 'Luanda',
      municipality: 'Talatona',
      address: 'Condomínio Vereda das Flores'
    },
    features: ['Segurança 24h', 'Piscina Comum', 'Jardim', 'Cozinha Montada'],
    type: 'Vivenda',
    listingType: 'Arrendar',
    status: 'available',
    bedrooms: 3,
    bathrooms: 3,
    area: 200,
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?auto=format&fit=crop&w=800&q=80', // Villa exterior
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80'  // Kitchen
    ],
    isGuaranteed: true,
    isVerified: true,
    ownerId: 'owner3',
    description: 'Vivenda acolhedora em condomínio fechado de prestígio em Talatona. Segurança máxima e áreas de lazer completas.'
  },
  {
    id: '5',
    title: 'Terreno para Construção na Tundavala',
    price: 12000000,
    currency: 'AOA',
    location: {
      province: 'Huíla',
      municipality: 'Lubango',
      address: 'Estrada da Tundavala'
    },
    features: ['Água da Rede', 'Acesso Asfaltado'],
    type: 'Terreno',
    listingType: 'Comprar',
    status: 'sold',
    bedrooms: 0,
    bathrooms: 0,
    area: 1000,
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80', // Land/Nature
    ],
    isGuaranteed: false,
    isVerified: true,
    ownerId: 'broker2',
    description: 'Terreno vasto com vista privilegiada para a Serra da Leba. Ideal para projeto turístico ou casa de férias.'
  },
  {
    id: '6',
    title: '[PENDENTE] Apartamento T2 Maianga',
    price: 250000,
    currency: 'AOA',
    location: {
      province: 'Luanda',
      municipality: 'Luanda',
      address: 'Rua Marien Ngouabi'
    },
    features: ['Ar Condicionado', 'Varanda'],
    type: 'Apartamento',
    listingType: 'Arrendar',
    status: 'pending', // Pending status for Admin test
    bedrooms: 2,
    bathrooms: 1,
    area: 90,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'
    ],
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
        invoiceUrl: '#'
    },
    {
        id: 'tx2',
        type: 'listing_fee',
        amount: 3000,
        currency: 'AOA',
        status: 'pending',
        date: '2023-10-26',
        userId: 'owner_new',
        userName: 'Pedro Pendente',
        reference: '923 999 111'
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
        reference: 'REF-ESC-001'
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
    },
    {
        id: 'CT-2023-002',
        propertyId: '3',
        propertyTitle: 'Escritório Open Space no Centro',
        tenantId: 'tenant_biz',
        tenantName: 'Startup Tech Lda',
        ownerId: 'broker1',
        ownerName: 'Imobiliária Horizonte',
        type: 'lease',
        status: 'expired',
        startDate: '2022-09-01',
        endDate: '2023-09-01',
        value: 500000,
        currency: 'AOA',
        signedAt: '2022-08-25',
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
    },
    {
        id: 'RC-2023-089',
        type: 'receipt',
        title: 'Recibo - Taxa de Publicação',
        date: '2023-10-25',
        url: '#',
        relatedEntityId: 'tx1',
        amount: 3000,
        status: 'available'
    },
    {
        id: 'CT-2023-001',
        type: 'contract',
        title: 'Contrato de Arrendamento - T3 Kilamba',
        date: '2023-09-28',
        url: '#',
        relatedEntityId: 'CT-2023-001',
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
    // External Users (Group A)
    { id: 'owner1', name: 'João Proprietário', email: 'joao@example.com', role: 'owner', group: 'external', accountStatus: 'active', isAuthenticated: true, phone: '923111222', isIdentityVerified: true, joinedAt: '2023-01-15' },
    { id: 'broker1', name: 'Imobiliária Horizonte', email: 'contato@horizonte.ao', role: 'broker', group: 'external', accountStatus: 'active', isAuthenticated: true, phone: '933444555', isIdentityVerified: true, joinedAt: '2023-03-22' },
    { id: 'tenant1', name: 'Maria Inquilina', email: 'maria@example.com', role: 'tenant', group: 'external', accountStatus: 'active', isAuthenticated: true, phone: '944888777', isIdentityVerified: true, joinedAt: '2023-09-10' },
    { id: 'owner_new', name: 'Pedro Pendente', email: 'pedro@new.ao', role: 'owner', group: 'external', accountStatus: 'pending_onboarding', isAuthenticated: true, phone: '911222333', isIdentityVerified: false, joinedAt: '2023-10-27' },
    { id: 'usr_suspicious_99', name: 'Carlos Fraude', email: 'bad@actor.com', role: 'tenant', group: 'external', accountStatus: 'suspended_legal', isAuthenticated: true, phone: '999999999', isIdentityVerified: false, joinedAt: '2023-10-27' },

    // Internal Staff (Group B)
    { id: 'staff_admin', name: 'Admin Principal', email: 'admin@arrendaki.ao', role: 'admin', group: 'internal', accountStatus: 'active', isAuthenticated: true },
    { id: 'staff_1', name: 'Ana Compliance', email: 'ana@arrendaki.ao', role: 'security_manager', group: 'internal', accountStatus: 'active', isAuthenticated: true },
    { id: 'staff_colab', name: 'Carlos Marketing', email: 'carlos@arrendaki.ao', role: 'collaborator', group: 'internal', accountStatus: 'active', isAuthenticated: true },
    { id: 'staff_legal', name: 'Dr. Jurídico', email: 'legal@arrendaki.ao', role: 'legal_compliance', group: 'internal', accountStatus: 'active', isAuthenticated: true },
];

export const MOCK_BLOG_POSTS: BlogPost[] = [
    { 
        id: '1', 
        title: '5 Sinais de Burla Imobiliária (e como o Kiá Verify o protege)',
        subtitle: 'Aprenda a identificar anúncios falsos e proteja o seu dinheiro.',
        slug: '5-sinais-burla-imobiliaria',
        author: 'Equipa de Segurança Kiá', 
        category: 'safety',
        status: 'published', 
        date: '20 Out 2023',
        image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
        excerpt: 'O mercado informal está cheio de riscos. Saiba o que verificar antes de transferir qualquer valor e como a nossa tecnologia elimina esses perigos.',
        content: '<p>Lorem ipsum dolor sit amet...</p>',
        metaTitle: '5 Sinais de Burla Imobiliária em Angola - Arrendaki Blog',
        metaDescription: 'Guia completo para evitar fraudes no arrendamento e compra de imóveis em Luanda e províncias.'
    },
    { 
        id: '2', 
        title: 'O que diz a lei sobre a Taxa de Serviço de 2,5%',
        subtitle: 'Transparência total sobre os custos do Arrendaki.',
        slug: 'lei-taxa-servico-imobiliario',
        author: 'Departamento Jurídico', 
        category: 'legal',
        status: 'published', 
        date: '22 Out 2023',
        image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=800&q=80',
        excerpt: 'Entenda a base legal da nossa comissão e porque é muito inferior aos 10% cobrados pelas agências tradicionais.',
        content: '<p>Conteúdo jurídico detalhado...</p>',
        metaTitle: 'Taxas Imobiliárias em Angola: A Verdade sobre os 2,5%',
        metaDescription: 'Análise legal sobre a cobrança de serviços de mediação tecnológica em Angola.'
    },
    { 
        id: '3', 
        title: 'Como preparar o seu imóvel para arrendar rápido',
        subtitle: 'Dicas de Home Staging e Fotografia.',
        slug: 'preparar-imovel-arrendamento',
        author: 'Carlos Marketing', 
        category: 'tips',
        status: 'draft', 
        date: '25 Out 2023',
        image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
        excerpt: 'Imóveis com boas fotos e descrições claras arrendam 3x mais rápido. Veja o nosso guia.',
        content: '<p>Dicas de decoração...</p>',
    },
    { 
        id: '4', 
        title: 'Novas regras do Arrendamento Urbano em 2024',
        subtitle: 'Atualização legislativa importante.',
        slug: 'regras-arrendamento-urbano-2024',
        author: 'Departamento Jurídico', 
        category: 'legal',
        status: 'pending_legal', 
        date: '26 Out 2023',
        excerpt: 'Análise das propostas de alteração à Lei do Arrendamento Urbano e impacto para senhorios.',
        content: '<p>Análise da proposta de lei...</p>',
    }
];

export const MOCK_VISITS: VisitRequest[] = [
    {
        id: 'v1',
        propertyId: '1',
        propertyTitle: 'Apartamento T3 Moderno no Kilamba',
        propertyImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
        tenantId: 'tenant1',
        tenantName: 'Maria Inquilina',
        ownerId: 'owner1',
        date: '2023-11-10',
        time: '14:30',
        status: 'pending',
        message: 'Gostaria de ver o estado da cozinha.'
    }
];

export const MOCK_CONVERSATIONS: ChatConversation[] = [
    {
        id: 'conv_1',
        otherUserId: 'owner1',
        otherUserName: 'João Proprietário',
        otherUserRole: 'owner',
        propertyId: '1',
        propertyTitle: 'Apartamento T3 Moderno no Kilamba',
        propertyImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=120&q=80',
        lastMessage: 'Bom dia, o apartamento ainda está disponível para visitas?',
        lastMessageTimestamp: '10:30',
        unreadCount: 2,
        isVerified: true
    }
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
    {
        id: 'audit_001',
        action: 'VERIFY_IDENTITY_DOC',
        actor: 'security_manager',
        target: 'owner1',
        timestamp: '2023-10-26 14:20:00',
        status: 'SUCCESS',
        details: 'BI verificado com base de dados do MIREX (Simulado). Validação biométrica: OK.',
        ip: '197.230.12.44'
    },
    {
        id: 'audit_002',
        action: 'APPROVE_PROPERTY',
        actor: 'commercial_manager',
        target: 'prop_123',
        timestamp: '2023-10-26 15:30:00',
        status: 'SUCCESS',
        details: 'Imóvel aprovado após revisão de fotos e preço. Aguardando pagamento.',
        ip: '197.230.12.44'
    },
    {
        id: 'audit_003',
        action: 'PAYMENT_FAILURE',
        actor: 'SYSTEM',
        target: 'tx_failed_99',
        timestamp: '2023-10-26 16:05:12',
        status: 'FAIL',
        details: 'Timeout na resposta do Gateway MCX Express.',
        ip: '10.0.0.1'
    }
];

// --- MOCK LEGAL DATA ---

export const MOCK_LEGAL_CLAUSES: LegalClause[] = [
    {
        id: 'lc_001',
        category: 'lease',
        title: 'Cláusula de Resolução por Falta de Pagamento',
        content: 'O não pagamento da renda por período superior a 30 dias constitui fundamento para a resolução imediata do presente contrato, sem necessidade de aviso prévio adicional.',
        version: '1.2',
        lastUpdated: '2023-10-01',
        status: 'approved',
        approvedBy: 'admin_legal'
    },
    {
        id: 'lc_002',
        category: 'sale',
        title: 'Cláusula de Sinal e Princípio de Pagamento',
        content: 'Como sinal e princípio de pagamento, o Segundo Outorgante entrega nesta data a quantia de [VALOR_SINAL], cuja quitação é dada pela assinatura deste contrato.',
        version: '1.0',
        lastUpdated: '2023-09-15',
        status: 'approved',
        approvedBy: 'admin_legal'
    },
    {
        id: 'lc_003',
        category: 'lease',
        title: 'Cláusula de Benfeitorias (Rascunho)',
        content: 'Quaisquer obras de melhoramento carecem de autorização por escrito do Senhorio e, uma vez realizadas, passam a integrar o imóvel sem direito a indemnização.',
        version: '2.0-draft',
        lastUpdated: '2023-10-27',
        status: 'draft'
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
        status: 'open'
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

// --- MOCK SYSTEM LOGS & IT DATA ---

export const MOCK_SYSTEM_LOGS: SystemLog[] = [
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
    },
    {
        id: 'sys_004', level: 'warning', action: 'PERMISSION_CHANGE', 
        message: 'Promoted user to Commercial Manager', 
        timestamp: '2023-10-26 16:20:00', userId: 'staff_admin', details: 'Promoted: staff_1'
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
