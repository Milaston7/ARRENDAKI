import { Property, Transaction, FlaggedChat, User, BlogPost, Contract, VisitRequest } from '../types';

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
    // Escrow Transaction 1: Active/Held
    {
        id: 'tx_escrow_1',
        type: 'escrow_deposit',
        amount: 450000, // 3 months rent + deposit? Or just full payment
        currency: 'AOA',
        status: 'escrow_held', 
        date: '2023-10-24',
        userId: 'tenant1',
        userName: 'Maria Inquilina',
        propertyId: '1',
        propertyTitle: 'Apartamento T3 Moderno no Kilamba',
        reference: 'REF-ESC-001'
    },
    // Escrow Transaction 2: Released to Owner
    {
        id: 'tx_escrow_2',
        type: 'escrow_deposit',
        amount: 12000000,
        currency: 'AOA',
        status: 'released',
        date: '2023-10-15',
        userId: 'buyer_investor',
        userName: 'Grupo Investidor Sul',
        propertyId: '5',
        propertyTitle: 'Terreno para Construção na Tundavala',
        reference: 'REF-ESC-002'
    },
    // Escrow Transaction 3: Refunded
    {
        id: 'tx_escrow_3',
        type: 'escrow_deposit',
        amount: 650000,
        currency: 'AOA',
        status: 'refunded',
        date: '2023-09-10',
        userId: 'tenant_cancelled',
        userName: 'Ana Desistência',
        propertyId: '4',
        propertyTitle: 'Vivenda V3 no Condomínio Vereda',
        reference: 'REF-ESC-003'
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
    },
    {
        id: 'CT-2023-003',
        propertyId: '5',
        propertyTitle: 'Terreno para Construção na Tundavala',
        tenantId: 'buyer_investor',
        tenantName: 'Grupo Investidor Sul',
        ownerId: 'broker2',
        ownerName: 'Huíla Imóveis',
        type: 'sale',
        status: 'active', // Completed sale contract
        startDate: '2023-10-15',
        value: 12000000,
        currency: 'AOA',
        signedAt: '2023-10-15',
        pdfUrl: '#'
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
    { id: 'owner1', name: 'João Proprietário', email: 'joao@example.com', role: 'owner', isAuthenticated: true, status: 'active', phone: '923111222', isIdentityVerified: true },
    { id: 'broker1', name: 'Imobiliária Horizonte', email: 'contato@horizonte.ao', role: 'broker', isAuthenticated: true, status: 'active', phone: '933444555', isIdentityVerified: true },
    { id: 'tenant1', name: 'Maria Inquilina', email: 'maria@example.com', role: 'tenant', isAuthenticated: true, status: 'active', phone: '944888777', isIdentityVerified: true },
    { id: 'owner_new', name: 'Pedro Pendente', email: 'pedro@example.com', role: 'owner', isAuthenticated: true, status: 'active', phone: '999000111', isIdentityVerified: false },
    { id: 'tenant_suspicious', name: 'Carlos Suspeito', email: 'carlos@fraude.com', role: 'tenant', isAuthenticated: true, status: 'suspended', phone: '912345678', isIdentityVerified: false },
];

export const MOCK_BLOG_POSTS: BlogPost[] = [
    { 
        id: '1', 
        title: '5 Dicas para Arrendar em Luanda sem Complicações', 
        author: 'Equipa Arrendaki', 
        status: 'published', 
        date: '20 Out 2023',
        image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
        excerpt: 'Saiba o que verificar antes de assinar o contrato e como o Kiá Verify protege os seus interesses.'
    },
    { 
        id: '2', 
        title: 'O que é a Transação Garantida (Escrow)?', 
        author: 'Departamento Jurídico', 
        status: 'published', 
        date: '15 Out 2023',
        image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80',
        excerpt: 'Entenda como guardamos o seu dinheiro de forma segura até à entrega das chaves do imóvel.'
    },
    { 
        id: '3', 
        title: 'Mercado Imobiliário: Tendências para 2024 em Angola', 
        author: 'Gestão Comercial', 
        status: 'published', 
        date: '10 Out 2023',
        image: 'https://images.unsplash.com/photo-1596766629910-c1e79cb798f0?auto=format&fit=crop&w=800&q=80',
        excerpt: 'Uma análise sobre a valorização das zonas de Talatona, Kilamba e a nova centralidade do Bengo.'
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
    },
    {
        id: 'v2',
        propertyId: '4',
        propertyTitle: 'Vivenda V3 no Condomínio Vereda',
        propertyImage: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?auto=format&fit=crop&w=800&q=80',
        tenantId: 'tenant1',
        tenantName: 'Maria Inquilina',
        ownerId: 'owner3',
        date: '2023-11-12',
        time: '10:00',
        status: 'confirmed',
        message: 'Posso levar o meu cão?'
    }
];
