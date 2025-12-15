
import React, { useState, useRef } from 'react';
import { UserRole } from '../types';
import { 
  User, Briefcase, Key, Shield, UserCircle, AlertCircle, 
  Eye, EyeOff, Upload, CheckCircle, Building, MapPin, 
  Phone, Mail, FileText, ChevronRight, ChevronLeft, ArrowRight, Info
} from 'lucide-react';

interface RegistrationFormProps {
  onRegister: (userData: any) => void;
  onCancel: () => void;
}

type EntityType = 'individual' | 'corporate';

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onRegister, onCancel }) => {
  // Navigation State
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole | null>(null);
  const [entityType, setEntityType] = useState<EntityType>('individual');
  
  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState(false);

  // Form Data State
  const [formData, setFormData] = useState({
    // Personal / Identity
    name: '',
    dob: '',
    nationality: 'Angolana',
    bi: '', // NIF for companies
    
    // Corporate Specific
    companyName: '',
    repName: '',
    repBi: '',
    repType: 'Procurador',

    // Broker Specific
    professionalDesignation: 'Agente Imobiliário',
    licenseNumber: '',

    // Third-Party Rep Specific (Updated)
    representedEntityName: '', // Owner Name
    representedEntityID: '',   // Owner BI/NIF
    repRelation: 'Procurador', // Type of Representation
    repAgentName: '',          // Agent Name (if explicitly different)
    
    // Contact
    email: '',
    phone: '',
    province: 'Luanda',
    municipality: '',
    address: '',
    
    // Security
    password: '',
    confirmPassword: '',
    
    // Documents (URLs mock)
    docIdentity: '', // BI Frente/Verso do Utilizador
    docResidency: '',
    docCommercial: '', // Certidão
    docStatutes: '',
    docProxy: '', // Procuração (Genérica)
    docLicense: '', // INH
    
    // New Specific Rep Docs
    docAuthorization: '', // Procuração Notarial / Autorização de Venda
    docOwnerID: '',       // BI do Proprietário Original
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Handlers ---

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileUpload = (field: string, file: File) => {
    // Validation Constants
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

    // Validate Type
    if (!ALLOWED_TYPES.includes(file.type)) {
        setErrors(prev => ({ ...prev, [field]: "Formato inválido. Apenas PDF, JPG ou PNG." }));
        return;
    }

    // Validate Size
    if (file.size > MAX_SIZE) {
        setErrors(prev => ({ ...prev, [field]: "O ficheiro excede o tamanho máximo de 10MB." }));
        return;
    }

    // Mock upload - in real app would upload to server
    const objectUrl = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, [field]: objectUrl }));
    
    // Clear error if exists
    if (errors[field]) {
        const newErrors = { ...errors };
        delete newErrors[field];
        setErrors(newErrors);
    }
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Step 2: Entity Type (Owner only) - No validation needed, just selection
    
    // Step 3: Basic Info
    if (currentStep === 3) {
        if (entityType === 'individual') {
            if (!formData.name.trim()) newErrors.name = "Nome completo deve corresponder ao BI.";
            if (!formData.dob) newErrors.dob = "Data de nascimento obrigatória.";
            if (!formData.bi.trim()) newErrors.bi = "Nº do BI obrigatório.";
        } else {
            // Validation Logic: Company Name Required
            if (!formData.companyName.trim()) newErrors.companyName = "Razão Social (Nome da Empresa) é obrigatória.";
            if (!formData.bi.trim()) newErrors.bi = "NIF da Empresa obrigatório.";
            if (!formData.repName.trim()) newErrors.repName = "Nome do Representante obrigatório.";
        }
        
        if (role === 'broker') {
             if (!formData.licenseNumber.trim()) newErrors.licenseNumber = "Nº da Licença/Carteira obrigatório.";
        }

        if (role === 'legal_rep') {
            if (!formData.representedEntityName.trim()) newErrors.representedEntityName = "Nome do proprietário (representado) obrigatório.";
            if (!formData.representedEntityID.trim()) newErrors.representedEntityID = "NIF/BI do proprietário obrigatório.";
            if (!formData.repRelation) newErrors.repRelation = "Tipo de representação obrigatório.";
        }
    }

    // Step 4: Contacts
    if (currentStep === 4) {
        if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email inválido.";
        if (!formData.phone.trim()) newErrors.phone = "Contacto telefónico obrigatório (+244).";
        if (!formData.address.trim()) newErrors.address = "Endereço físico obrigatório.";
    }

    // Step 5: Documents (Kiá Verify)
    if (currentStep === 5) {
        // Identity Document for the USER registering
        if (entityType === 'individual') {
            if (!formData.docIdentity) newErrors.docIdentity = "O seu BI (Frente e Verso) é obrigatório.";
        } else {
            if (!formData.docCommercial) newErrors.docCommercial = "Certidão Comercial é obrigatória.";
        }
        
        if (role === 'broker') {
            if (!formData.docLicense) newErrors.docLicense = "Cópia da Licença INH/Carteira é obrigatória.";
        }

        // Specific Validation for Legal Reps
        if (role === 'legal_rep') {
            if (!formData.docAuthorization) newErrors.docAuthorization = "Procuração Notarial ou Autorização é obrigatória.";
            if (!formData.docOwnerID) newErrors.docOwnerID = "BI do Proprietário Original é obrigatório.";
        }
    }

    // Step 6: Security
    if (currentStep === 6) {
        if (formData.password.length < 8) newErrors.password = "Mínimo 8 caracteres, com números e símbolos.";
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "As senhas não coincidem.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      isValid = false;
    }

    return isValid;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => setStep(prev => prev - 1);

  const getStepTitle = () => {
      switch(step) {
          case 1: return "Escolha o seu Perfil";
          case 2: return "Tipo de Entidade";
          case 3: return "Dados de Identificação";
          case 4: return "Contactos e Localização";
          case 5: return "Documentação Kiá Verify";
          case 6: return "Segurança e Acesso";
          case 7: return "Bem-vindo ao Arrendaki";
          default: return "";
      }
  };

  // --- Render Components ---

  const renderRoleSelection = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
            { id: 'tenant', label: 'Inquilino / Comprador', icon: User, desc: 'Procuro imóvel para viver ou investir.' },
            { id: 'owner', label: 'Proprietário', icon: Key, desc: 'Tenho imóveis para arrendar ou vender.' },
            { id: 'broker', label: 'Corretor / Mediador', icon: Briefcase, desc: 'Sou profissional do setor imobiliário.' },
            { id: 'legal_rep', label: 'Representante de Terceiros', icon: Shield, desc: 'Administro imóveis em nome de outrem.' },
        ].map((r) => (
            <button
                key={r.id}
                type="button"
                onClick={() => {
                    setRole(r.id as UserRole);
                    if (r.id === 'owner' || r.id === 'broker') {
                        setStep(2); // Ask Entity Type
                    } else {
                        setEntityType('individual');
                        setStep(3); // Skip to Basic Info
                    }
                }}
                className="flex flex-col items-start p-4 border-2 border-gray-100 rounded-xl hover:border-brand-500 hover:bg-brand-50 transition-all text-left group"
            >
                <div className="p-3 bg-gray-100 rounded-full mb-3 group-hover:bg-white group-hover:text-brand-600 transition-colors">
                    <r.icon className="w-6 h-6 text-gray-600 group-hover:text-brand-600" />
                </div>
                <h3 className="font-bold text-gray-900 group-hover:text-brand-700">{r.label}</h3>
                <p className="text-sm text-gray-500 mt-1">{r.desc}</p>
            </button>
        ))}
    </div>
  );

  const renderEntityTypeSelection = () => (
      <div className="space-y-4">
          <button
            type="button"
            onClick={() => { setEntityType('individual'); setStep(3); }}
            className="w-full flex items-center p-4 border-2 border-gray-100 rounded-xl hover:border-brand-500 hover:bg-brand-50 transition-all"
          >
              <div className="p-3 bg-blue-100 text-blue-600 rounded-full mr-4">
                  <UserCircle className="w-6 h-6" />
              </div>
              <div className="text-left">
                  <h3 className="font-bold text-gray-900">Pessoa Singular</h3>
                  <p className="text-sm text-gray-500">Cadastro com Bilhete de Identidade (BI)</p>
              </div>
              <ChevronRight className="ml-auto text-gray-400" />
          </button>

          <button
            type="button"
            onClick={() => { setEntityType('corporate'); setStep(3); }}
            className="w-full flex items-center p-4 border-2 border-gray-100 rounded-xl hover:border-brand-500 hover:bg-brand-50 transition-all"
          >
              <div className="p-3 bg-purple-100 text-purple-600 rounded-full mr-4">
                  <Building className="w-6 h-6" />
              </div>
              <div className="text-left">
                  <h3 className="font-bold text-gray-900">Pessoa Coletiva (Empresa)</h3>
                  <p className="text-sm text-gray-500">Cadastro com NIF e Certidão Comercial</p>
              </div>
              <ChevronRight className="ml-auto text-gray-400" />
          </button>
      </div>
  );

  const renderBasicInfo = () => (
      <div className="space-y-4 animate-fadeIn">
          {entityType === 'individual' ? (
              <>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo <span className="text-red-500">*</span></label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className={`w-full p-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`} placeholder="Conforme o seu BI" />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento <span className="text-red-500">*</span></label>
                        <input type="date" name="dob" value={formData.dob} onChange={handleChange} className={`w-full p-2 border rounded-md ${errors.dob ? 'border-red-500' : 'border-gray-300'}`} />
                        {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nacionalidade</label>
                        <select name="nationality" value={formData.nationality} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md">
                            <option value="Angolana">Angolana</option>
                            <option value="Estrangeira">Estrangeira</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nº Bilhete de Identidade <span className="text-red-500">*</span></label>
                    <input type="text" name="bi" value={formData.bi} onChange={handleChange} maxLength={14} className={`w-full p-2 border rounded-md ${errors.bi ? 'border-red-500' : 'border-gray-300'}`} placeholder="000000000LA000" />
                    {errors.bi && <p className="text-red-500 text-xs mt-1">{errors.bi}</p>}
                </div>
              </>
          ) : (
              <>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Razão Social / Nome da Empresa <span className="text-red-500">*</span></label>
                    <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className={`w-full p-2 border rounded-md ${errors.companyName ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NIF da Empresa <span className="text-red-500">*</span></label>
                    <input type="text" name="bi" value={formData.bi} onChange={handleChange} className={`w-full p-2 border rounded-md ${errors.bi ? 'border-red-500' : 'border-gray-300'}`} placeholder="NIF" />
                    {errors.bi && <p className="text-red-500 text-xs mt-1">{errors.bi}</p>}
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-4">
                    <h4 className="text-sm font-bold text-blue-800 mb-2 flex items-center"><Shield className="w-4 h-4 mr-1"/> Representante Legal (Empresa)</h4>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Nome do Representante</label>
                            <input type="text" name="repName" value={formData.repName} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md text-sm" placeholder="Quem assinará os contratos?" />
                            {errors.repName && <p className="text-red-500 text-xs mt-1">{errors.repName}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Função / Tipo</label>
                            <select name="repType" value={formData.repType} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md text-sm">
                                <option value="Procurador">Procurador</option>
                                <option value="Administrador">Administrador</option>
                                <option value="Sócio-Gerente">Sócio-Gerente</option>
                            </select>
                        </div>
                    </div>
                </div>
              </>
          )}

          {role === 'broker' && (
              <div className="pt-4 border-t border-gray-100">
                  <h4 className="font-bold text-gray-800 mb-3">Dados Profissionais</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nº Licença INH / Carteira <span className="text-red-500">*</span></label>
                    <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} className={`w-full p-2 border rounded-md ${errors.licenseNumber ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.licenseNumber && <p className="text-red-500 text-xs mt-1">{errors.licenseNumber}</p>}
                  </div>
              </div>
          )}

          {/* Third-Party Representative Block */}
          {role === 'legal_rep' && (
              <div className="pt-4 border-t border-gray-100 animate-fadeIn">
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 mb-4">
                      <div className="flex items-start">
                          <Info className="w-5 h-5 text-orange-600 mr-2 mt-0.5" />
                          <p className="text-xs text-orange-800">
                              <strong>Representante Legal (Autorização para Transação):</strong> Esta secção é obrigatória para quem age em nome de um proprietário (Singular ou Coletivo).
                          </p>
                      </div>
                  </div>

                  <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                      <Shield className="w-4 h-4 mr-2 text-brand-600" />
                      Detalhes da Representação
                  </h4>
                  
                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo do Agente/Procurador</label>
                        <input 
                            type="text" 
                            name="repAgentName" 
                            value={formData.repAgentName} 
                            onChange={handleChange} 
                            placeholder="Se diferente do nome de utilizador acima"
                            className="w-full p-2 border border-gray-300 rounded-md" 
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Representação <span className="text-red-500">*</span></label>
                        <select 
                            name="repRelation" 
                            value={formData.repRelation} 
                            onChange={handleChange} 
                            className={`w-full p-2 border rounded-md ${errors.repRelation ? 'border-red-500' : 'border-gray-300'}`}
                        >
                            <option value="Procurador">Procurador (Com Procuração)</option>
                            <option value="Administrador">Administrador de Imóveis</option>
                            <option value="Herdeiro">Herdeiro (Cabeça de Casal)</option>
                            <option value="Advogado">Advogado Representante</option>
                            <option value="Familiar">Familiar com Autorização</option>
                        </select>
                        {errors.repRelation && <p className="text-red-500 text-xs mt-1">{errors.repRelation}</p>}
                      </div>

                      <div className="pt-2 border-t border-gray-200 mt-2">
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Dados do Proprietário Real (Representado)</label>
                          <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Proprietário <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    name="representedEntityName" 
                                    value={formData.representedEntityName} 
                                    onChange={handleChange} 
                                    placeholder="Nome da pessoa ou empresa proprietária"
                                    className={`w-full p-2 border rounded-md ${errors.representedEntityName ? 'border-red-500' : 'border-gray-300'}`} 
                                />
                                {errors.representedEntityName && <p className="text-red-500 text-xs mt-1">{errors.representedEntityName}</p>}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">NIF/BI do Proprietário <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    name="representedEntityID" 
                                    value={formData.representedEntityID} 
                                    onChange={handleChange} 
                                    className={`w-full p-2 border rounded-md ${errors.representedEntityID ? 'border-red-500' : 'border-gray-300'}`} 
                                />
                                {errors.representedEntityID && <p className="text-red-500 text-xs mt-1">{errors.representedEntityID}</p>}
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          )}
      </div>
  );

  const renderContacts = () => (
      <div className="space-y-4 animate-fadeIn">
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email {entityType === 'corporate' ? 'Corporativo' : ''} <span className="text-red-500">*</span></label>
              <div className="relative">
                  <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className={`pl-10 w-full p-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`} placeholder="Será usado como Login" />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telemóvel <span className="text-red-500">*</span></label>
              <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm font-bold">+244</span>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border ${errors.phone ? 'border-red-500' : 'border-gray-300'}`} placeholder="9XX XXX XXX" />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          <div className="pt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Província</label>
              <select name="province" value={formData.province} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md">
                  <option value="Luanda">Luanda</option>
                  <option value="Benguela">Benguela</option>
                  <option value="Huambo">Huambo</option>
                  <option value="Huíla">Huíla</option>
                  {/* Add others */}
              </select>
          </div>

          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Endereço Completo <span className="text-red-500">*</span></label>
              <div className="relative">
                  <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                  <input type="text" name="address" value={formData.address} onChange={handleChange} className={`pl-10 w-full p-2 border rounded-md ${errors.address ? 'border-red-500' : 'border-gray-300'}`} placeholder="Rua, Bairro, Nº Casa / Edifício" />
              </div>
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
          </div>
      </div>
  );

  const renderDocUpload = (key: string, label: string, desc: string, errorKey?: string) => (
      <div className="mb-4">
          <label className="block text-sm font-bold text-gray-700 mb-1">{label} <span className="text-red-500">*</span></label>
          <p className="text-xs text-gray-500 mb-2">{desc}</p>
          
          <div className="relative">
              <input 
                type="file" 
                id={key}
                onChange={(e) => e.target.files && handleFileUpload(key, e.target.files[0])}
                className="hidden"
                accept=".pdf,.jpg,.png"
              />
              {!formData[key as keyof typeof formData] ? (
                  <label 
                    htmlFor={key}
                    className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors ${errors[errorKey || ''] ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                  >
                      <Upload className="w-6 h-6 text-gray-400 mb-1" />
                      <span className="text-xs text-brand-600 font-bold">Carregar Documento</span>
                      <span className="text-[10px] text-gray-400">PDF ou JPG (Max 10MB)</span>
                  </label>
              ) : (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 p-3 rounded-lg">
                      <div className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                          <span className="text-sm text-green-800 font-medium">Carregado</span>
                      </div>
                      <button onClick={() => setFormData(prev => ({...prev, [key]: ''}))} className="text-xs text-red-500 hover:underline">Remover</button>
                  </div>
              )}
          </div>
          {errorKey && errors[errorKey] && <p className="text-red-500 text-xs mt-1">{errors[errorKey]}</p>}
      </div>
  );

  const renderDocuments = () => (
      <div className="space-y-2 animate-fadeIn">
          <div className="bg-brand-50 p-4 rounded-lg border border-brand-100 mb-6 flex items-start">
              <Shield className="w-6 h-6 text-brand-600 mr-3 shrink-0 mt-1" />
              <div>
                  <h4 className="font-bold text-brand-800 text-sm">Verificação Kiá Verify</h4>
                  <p className="text-xs text-brand-700 mt-1">
                      Para garantir a segurança de todos, validamos manualmente a identidade de cada utilizador. Os seus documentos estão encriptados.
                  </p>
              </div>
          </div>

          {entityType === 'individual' && (
              <>
                {renderDocUpload('docIdentity', 'Seu Bilhete de Identidade (BI)', 'Cópia colorida frente e verso.', 'docIdentity')}
                {renderDocUpload('docResidency', 'Comprovativo de Residência', 'Opcional, mas recomendado (ex: Fatura de Serviços).')}
              </>
          )}

          {entityType === 'corporate' && (
              <>
                {renderDocUpload('docCommercial', 'Certidão Comercial', 'Documento atualizado.', 'docCommercial')}
                {renderDocUpload('docStatutes', 'Estatutos da Empresa', 'Documento completo.')}
                {renderDocUpload('docIdentity', 'BI do Representante', 'Cópia frente e verso.')}
              </>
          )}

          {role === 'broker' && (
              <>
                 <div className="border-t border-gray-100 my-4 pt-4">
                    <h4 className="font-bold text-gray-800 mb-3">Credenciação Profissional</h4>
                    {renderDocUpload('docLicense', 'Licença INH / Carteira Profissional', 'Obrigatório para atuar como mediador.', 'docLicense')}
                 </div>
              </>
          )}

          {/* Documentação de Autorização para Representante de Terceiro */}
          {role === 'legal_rep' && (
              <div className="border-t border-gray-100 my-4 pt-4 bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h4 className="font-bold text-gray-800 mb-1 flex items-center">
                      <Shield className="w-4 h-4 mr-2 text-brand-600" />
                      Documentação de Autorização
                  </h4>
                  <p className="text-xs text-gray-500 mb-4">
                      Obrigatório para provar que tem permissão legal para agir em nome do proprietário.
                  </p>
                  
                  {renderDocUpload(
                      'docAuthorization', 
                      'Procuração Notarial ou Autorização', 
                      'Documento que autoriza explicitamente a venda/arrendamento pelo representante.', 
                      'docAuthorization'
                  )}
                  
                  {renderDocUpload(
                      'docOwnerID', 
                      'BI do Proprietário Original', 
                      'Cópia do documento de identificação do proprietário real (representado).', 
                      'docOwnerID'
                  )}
              </div>
          )}
      </div>
  );

  const renderSecurity = () => {
      const calculatePasswordStrength = (pass: string) => {
          if (!pass) return { label: '', color: '', width: '0%' };
          if (pass.length < 8) return { label: 'Fraca (Mín. 8 caracteres)', color: 'bg-red-500', width: '33%' };
          
          const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
          const hasNumber = /[0-9]/.test(pass);
          const hasUpper = /[A-Z]/.test(pass);
          
          const complexity = (hasSpecial ? 1 : 0) + (hasNumber ? 1 : 0) + (hasUpper ? 1 : 0);

          if (complexity < 2) return { label: 'Média', color: 'bg-yellow-500', width: '66%' };
          return { label: 'Forte', color: 'bg-green-500', width: '100%' };
      };

      const strength = calculatePasswordStrength(formData.password);
      const confirmStrength = calculatePasswordStrength(formData.confirmPassword);

      return (
          <div className="space-y-6 animate-fadeIn">
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Criar Senha <span className="text-red-500">*</span></label>
                  <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        name="password" 
                        value={formData.password} 
                        onChange={handleChange} 
                        className={`w-full p-3 border rounded-lg pr-10 ${errors.password ? 'border-red-500' : 'border-gray-300'}`} 
                        placeholder="Mínimo 8 caracteres"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-400">
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                      <div className="mt-2 transition-all duration-300">
                          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                  className={`h-full ${strength.color} transition-all duration-500`} 
                                  style={{ width: strength.width }}
                              ></div>
                          </div>
                          <p className={`text-xs mt-1 font-bold ${strength.color.replace('bg-', 'text-')}`}>
                              {strength.label}
                          </p>
                      </div>
                  )}

                  {!formData.password && <p className="text-xs text-gray-500 mt-1">Deve incluir letras, números e símbolos.</p>}
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha <span className="text-red-500">*</span></label>
                  <input 
                    type="password" 
                    name="confirmPassword" 
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                    className={`w-full p-3 border rounded-lg ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`} 
                  />
                  
                  {/* Confirm Password Strength Indicator */}
                  {formData.confirmPassword && (
                      <div className="mt-2 transition-all duration-300">
                          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                  className={`h-full ${confirmStrength.color} transition-all duration-500`} 
                                  style={{ width: confirmStrength.width }}
                              ></div>
                          </div>
                          <p className={`text-xs mt-1 font-bold ${confirmStrength.color.replace('bg-', 'text-')}`}>
                              {confirmStrength.label}
                          </p>
                      </div>
                  )}

                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg text-xs text-gray-600">
                  <p className="mb-2"><strong>Medidas de Segurança Adicionais:</strong></p>
                  <ul className="list-disc pl-4 space-y-1">
                      <li>Verificação de contacto via SMS (Código enviado após registo).</li>
                      <li>Confirmação de email (Link de ativação).</li>
                      <li>Análise humana dos documentos carregados.</li>
                  </ul>
              </div>
          </div>
      );
  };

  const renderSuccess = () => (
      <div className="text-center py-8 animate-fadeIn">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-4">Bem-vindo(a) à Confiança, Kiá!</h2>
          
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-left mb-8">
              {role === 'broker' ? (
                  <>
                    <h3 className="font-bold text-gray-800 mb-2">Corretor:</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        Sua credibilidade começa aqui. O seu perfil está em análise pela nossa equipa de conformidade. 
                        Assim que os documentos forem validados, terá acesso total aos <strong>leads qualificados</strong> e ferramentas profissionais.
                    </p>
                  </>
              ) : (
                  <>
                    <h3 className="font-bold text-gray-800 mb-2">{role === 'owner' ? 'Proprietário' : 'Inquilino'}:</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        O seu painel é o seu centro de comando. Agora que se juntou à plataforma, o seu primeiro passo é essencial: 
                        a nossa equipa irá validar os seus documentos para ativar o selo <strong>Kiá Verified</strong>. 
                        <br/><br/>
                        Apenas utilizadores verificados podem aceder ao chat seguro e iniciar um "Fecho Arrendaki".
                    </p>
                  </>
              )}
              <div className="mt-4 pt-4 border-t border-gray-100 text-center text-xs font-bold text-brand-600">
                  Lembre-se: Sem Confiança, Não Há Transação. O Arrendaki Garante Ambas.
              </div>
          </div>

          <button 
            onClick={() => onRegister({ ...formData, role, entityType })}
            className="w-full bg-brand-500 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-brand-600 transition-transform hover:-translate-y-1"
          >
              Aceder ao Meu Painel
          </button>
      </div>
  );

  return (
    <div className="max-w-2xl mx-auto my-8">
        {/* Step Progress */}
        {step < 7 && (
            <div className="mb-8">
                <div className="flex justify-between mb-2 px-2">
                    <span className="text-xs font-bold text-brand-600">Passo {step} de 6</span>
                    <span className="text-xs font-bold text-gray-400">{getStepTitle()}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-brand-500 transition-all duration-500" 
                        style={{ width: `${(step / 6) * 100}%` }}
                    ></div>
                </div>
            </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gray-900 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center">
                    {step === 7 ? 'Cadastro Concluído' : getStepTitle()}
                </h2>
                {step < 7 && <div className="text-xs text-gray-400 font-mono">ARRENDAKI ID</div>}
            </div>

            <div className="p-6 md:p-8">
                {step === 1 && renderRoleSelection()}
                {step === 2 && renderEntityTypeSelection()}
                {step === 3 && renderBasicInfo()}
                {step === 4 && renderContacts()}
                {step === 5 && renderDocuments()}
                {step === 6 && renderSecurity()}
                {step === 7 && renderSuccess()}
            </div>

            {/* Footer Navigation */}
            {step < 7 && (
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center">
                    {step > 1 ? (
                        <button onClick={prevStep} className="text-gray-500 font-medium hover:text-gray-800 flex items-center">
                            <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
                        </button>
                    ) : (
                        <button onClick={onCancel} className="text-gray-500 font-medium hover:text-gray-800">
                            Cancelar
                        </button>
                    )}

                    <button 
                        onClick={nextStep} 
                        className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-2 rounded-lg font-bold shadow-sm flex items-center transition-colors"
                    >
                        {step === 6 ? 'Criar Conta' : 'Continuar'} <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};

export default RegistrationForm;
