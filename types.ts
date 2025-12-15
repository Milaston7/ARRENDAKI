
export type UserRole = 
  | 'tenant' 
  | 'owner' 
  | 'broker' 
  | 'legal_rep' 
  // Cargos Internos (Staff)
  | 'admin'              // Administrador (Acesso Total)
  | 'commercial_manager' // Gestor/Manager (Aprovações, Relatórios)
  | 'collaborator'       // Colaborador (Cria posts, submete para aprovação)
  | 'security_manager'   // Gestor de Segurança (Analista de Conformidade)
  | 'legal_compliance'   // Jurídico e Compliance (Contratos, Risco, Fraude)
  | 'it_tech';           // Técnico de TI

export interface User {
  id: string;
  name: string;
  role: UserRole;
  group: 'internal' | 'external'; // IAM Separation
  email: string;
  isAuthenticated: boolean;
  
  // Account Status for IAM
  accountStatus: 'active' | 'blocked' | 'suspended_legal' | 'pending_onboarding';
  lastLogin?: string;
  
  // New profile fields from Registration
  phone?: string;
  dob?: string; // Date of Birth
  nationality?: string;
  bi?: string; // Bilhete de Identidade OR NIF for companies
  joinedAt?: string; // Data de criação da conta
  
  // Corporate / Broker specific
  companyName?: string;
  repName?: string;
  repType?: string;
  licenseNumber?: string; // For Brokers
  
  // Extended Corporate Fields
  companyPhone?: string;
  companyEmail?: string;
  companyWebsite?: string;

  // Third-Party Representative Specific
  representedEntityName?: string;
  representedEntityID?: string; // NIF/BI of the person being represented

  profileImage?: string;
  idDocumentUrl?: string;
  isIdentityVerified?: boolean; // Admin verification status
  
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

export interface Notification {
  id: string;
  userId: string; // Target user
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  isRead: boolean;
  timestamp: string;
  actionLink?: string; // Deep link to view (e.g., 'profile', 'property_id')
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
  type: 'Apartamento' | 'Vivenda' | 'Escritório' | 'Loja' | 'Terreno' | 'Prédio Rústico' | 'Prédio Urbano';
  listingType: 'Arrendar' | 'Comprar';
  // Updated status to include payment_processing
  status: 'available' | 'rented' | 'sold' | 'pending' | 'rejected' | 'archived' | 'approved_waiting_payment' | 'payment_processing' | 'suspended_legal'; 
  rejectionReason?: string; // New field for moderation
  internalNotes?: string; // Notes for operations team
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

export interface ChatConversation {
  id: string;
  propertyId?: string;
  propertyTitle?: string;
  propertyImage?: string;
  otherUserId: string;
  otherUserName: string;
  otherUserRole: UserRole;
  lastMessage: string;
  lastMessageTimestamp: string; // ISO or human readable
  unreadCount: number;
  isVerified: boolean; // If the other user is verified
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
  status: 'pending' | 'completed' | 'failed' | 'escrow_held' | 'released' | 'refunded' | 'suspended_fraud' | 'reconciled';
  date: string;
  userId: string;
  userName?: string; // Added for display convenience
  propertyId?: string;
  propertyTitle?: string; // Added for display convenience
  reference?: string; // Multicaixa Ref
  invoiceUrl?: string;
  proofUrl?: string; // URL to payment proof image
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

export interface DocumentRecord {
  id: string;
  type: 'invoice' | 'receipt' | 'contract';
  title: string;
  date: string;
  url: string; // Mock URL or blob reference
  relatedEntityId?: string; // Transaction ID or Contract ID
  amount?: number; // For invoices/receipts
  status: 'available' | 'processing';
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

// --- IT & SYSTEM LOGS ---
export interface SystemLog {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical' | 'security';
  action: string; // e.g., "LOGIN_ATTEMPT", "API_ERROR"
  message: string;
  timestamp: string;
  userId?: string;
  ip?: string;
  module?: string; // e.g., "/admin/contracts"
  statusCode?: number; // e.g., 500, 403
  stackTrace?: string; // Limited stack trace for errors
  details?: string;
}

export interface ServiceHealth {
  id: string;
  name: string; // e.g., "Database", "Payment Gateway"
  status: 'healthy' | 'degraded' | 'down';
  latency: number; // ms
  lastChecked: string;
}

export interface DatabaseQuery {
  id: string;
  query: string;
  duration: number; // ms
  timestamp: string;
  origin: string;
}

export interface FlaggedChat {
  id: string;
  participants: string[];
  reason: 'phone_sharing' | 'offensive_language';
  snippet: string;
  timestamp: string;
}

// CMS / Blog Post - Updated for Kiá Content
export interface BlogPost {
  id: string;
  title: string;
  subtitle?: string; // Hook for SEO
  author: string;
  category: 'legal' | 'safety' | 'market' | 'news' | 'tips';
  status: 'draft' | 'pending_legal' | 'published' | 'rejected'; // Approval Flow
  date: string;
  content: string; // HTML or Markdown
  excerpt?: string;
  image?: string;
  
  // SEO Fields
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  
  // Compliance
  rejectionReason?: string;
  approvedBy?: string;
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

// --- NEW TYPE FOR PROPOSALS ---
export interface Proposal {
  value: number;
  startDate: string;
  duration: string;
  deposit: number;
  conditions?: string;
}

// --- NEW: AUDIT & COMPLIANCE ---
export interface AuditLog {
  id: string;
  action: string; // e.g., "Verify Document", "Release Escrow"
  actor: string; // Staff ID or User ID
  target: string; // Property ID or User ID
  timestamp: string;
  status: 'SUCCESS' | 'FAIL' | 'WARNING';
  details: string;
  ip: string;
}

// --- NEW: LEGAL MODULE TYPES ---
export interface LegalClause {
  id: string;
  category: 'lease' | 'sale';
  title: string;
  content: string;
  version: string; // e.g., "1.0", "1.1"
  lastUpdated: string;
  status: 'draft' | 'approved' | 'deprecated';
  approvedBy?: string;
}

export interface LegalAlert {
  id: string;
  severity: 'critical' | 'high' | 'medium';
  type: 'document_fraud' | 'suspicious_activity' | 'contract_breach';
  targetUser: string;
  targetUserName: string;
  transactionId?: string;
  description: string;
  timestamp: string;
  status: 'open' | 'investigating' | 'resolved' | 'suspended_transaction';
}

// --- NEW: FEEDBACK ---
export interface Feedback {
  transactionId: string;
  userId: string;
  rating: number; // 1-5
  comment: string;
  date: string;
}
