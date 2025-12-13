
export type UserRole = 
  | 'tenant' 
  | 'owner' 
  | 'broker' 
  | 'legal_rep' 
  // Cargos Internos (Staff)
  | 'admin'              // Administrador (Acesso Total)
  | 'commercial_manager' // Gestor/Manager (Aprovações, Relatórios)
  | 'collaborator'       // Colaborador (Cria posts, submete para aprovação)
  | 'security_manager'   // Gestor de Segurança
  | 'it_tech';           // Técnico de TI

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  isAuthenticated: boolean;
  // New profile fields from Registration
  phone?: string;
  dob?: string; // Date of Birth
  nationality?: string;
  bi?: string; // Bilhete de Identidade OR NIF for companies
  
  // Corporate / Broker specific
  companyName?: string;
  repName?: string;
  repType?: string;
  licenseNumber?: string; // For Brokers

  // Third-Party Representative Specific
  representedEntityName?: string;
  representedEntityID?: string; // NIF/BI of the person being represented

  profileImage?: string;
  idDocumentUrl?: string;
  isIdentityVerified?: boolean; // Admin verification status
  status?: 'active' | 'suspended'; // Account status management
  
  // Security
  is2FAEnabled?: boolean;
  tempSecret2FA?: string; // For mock purposes

  address?: {
    province: string;
    municipality: string;
    street: string;
  };
  paymentInfo?: {
    type: 'multicaixa_express' | 'bank_transfer';
    value: string; // Phone number or IBAN
  };
}

export interface Property {
  id: string;
  title: string;
  price: number;
  currency: 'AOA' | 'USD';
  location: {
    province: string;
    municipality: string;
    address: string;
  };
  features: string[];
  type: 'Apartamento' | 'Vivenda' | 'Escritório' | 'Loja' | 'Terreno';
  listingType: 'Arrendar' | 'Comprar';
  status: 'available' | 'rented' | 'sold' | 'pending' | 'rejected' | 'archived'; // Updated statuses
  rejectionReason?: string; // New field for moderation
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: string[];
  videoUrl?: string; // New field for video tour
  documents?: {
    identity?: string;
    propertyOwnership?: string;
  };
  isGuaranteed: boolean; // Kiá Verify/Contract
  isVerified: boolean;
  ownerId: string;
  description: string;
  createdAt?: string; // Timestamp for moderation queue
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  isBlocked?: boolean; // For NLP warnings
  isEncrypted?: boolean; // New: E2EE Flag
}

export interface FilterState {
  province: string;
  municipality: string;
  type: string;
  listingType: string;
  minPrice: number;
  maxPrice: number;
}

// --- NEW TYPES FOR ADMIN MODULES ---

export interface Transaction {
  id: string;
  type: 'listing_fee' | 'escrow_deposit' | 'service_fee';
  amount: number;
  currency: 'AOA';
  // Updated statuses for Escrow workflow
  status: 'pending' | 'completed' | 'failed' | 'escrow_held' | 'released' | 'refunded';
  date: string;
  userId: string;
  userName?: string; // Added for display convenience
  propertyId?: string;
  propertyTitle?: string; // Added for display convenience
  reference?: string; // Multicaixa Ref
  invoiceUrl?: string;
}

export interface Contract {
  id: string;
  propertyId: string;
  propertyTitle: string;
  tenantId: string; // Or Buyer ID
  tenantName: string;
  ownerId: string;
  ownerName: string;
  type: 'lease' | 'sale';
  status: 'draft' | 'pending_signature' | 'active' | 'terminated' | 'expired'; // Added pending_signature
  startDate: string;
  endDate?: string;
  value: number;
  currency: 'AOA' | 'USD';
  signedAt?: string;
  pdfUrl: string;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  type: 'identity' | 'property_ownership';
  documentUrl: string;
  // Added 'review_needed' status
  status: 'pending' | 'approved' | 'rejected' | 'review_needed';
  submittedAt: string;
  // Audit fields
  reviewedBy?: string; // Staff ID
  reviewedAt?: string; // Timestamp
  reviewNotes?: string; // Reason for rejection or review
}

export interface SystemLog {
  id: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
}

export interface FlaggedChat {
  id: string;
  participants: string[];
  reason: 'phone_sharing' | 'offensive_language';
  snippet: string;
  timestamp: string;
}

// Mock Content Post for Collaborators
export interface BlogPost {
  id: string;
  title: string;
  author: string;
  status: 'draft' | 'pending_approval' | 'published';
  date: string;
  excerpt?: string;
  image?: string;
}

// --- NEW TYPE FOR VISITS ---
export interface VisitRequest {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  tenantId: string;
  tenantName: string;
  ownerId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: 'pending' | 'confirmed' | 'rejected' | 'completed';
  message?: string;
}
