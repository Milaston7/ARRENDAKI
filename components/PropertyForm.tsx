
import React, { useState, useRef } from 'react';
import { ChevronRight, ChevronLeft, Upload, CheckCircle, AlertTriangle, AlertCircle, X, Film, Image as ImageIcon, Trash2, FileText, ShieldCheck, Scale } from 'lucide-react';
import { PROVINCES, PROPERTY_TYPES, AMENITIES, MUNICIPALITIES_MOCK } from '../constants';
import { Property } from '../types';

interface PropertyFormProps {
  onSubmit: (property: Partial<Property>) => void;
  onCancel: () => void;
}

const PropertyForm: React.FC<PropertyFormProps> = ({ onSubmit, onCancel }) => {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Partial<Property>>({
    features: [],
    location: { province: 'Luanda', municipality: '', address: '' },
    isGuaranteed: false,
    images: [],
    videoUrl: '',
    documents: { identity: '', propertyOwnership: '' },
    listingType: undefined,
    type: undefined,
    currency: 'AOA'
  });

  // Refs for hidden file inputs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const identityInputRef = useRef<HTMLInputElement>(null);
  const ownershipInputRef = useRef<HTMLInputElement>(null);

  // Drag state
  const [dragActive, setDragActive] = useState<{identity: boolean; ownership: boolean; video: boolean}>({
    identity: false,
    ownership: false,
    video: false
  });

  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    // Real-time error clearing
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const updateLocation = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location!, [key]: value }
    }));
    // Real-time error clearing for location fields
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const toggleFeature = (feature: string) => {
    const currentFeatures = formData.features || [];
    if (currentFeatures.includes(feature)) {
      updateFormData('features', currentFeatures.filter(f => f !== feature));
    } else {
      updateFormData('features', [...currentFeatures, feature]);
    }
  };

  // --- File Handling Logic ---

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages: string[] = [];
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB

      Array.from(e.target.files).forEach((file: File) => {
        if (file.size > MAX_SIZE) {
          alert(`A imagem ${file.name} é muito grande (Máx 5MB).`);
          return;
        }
        const objectUrl = URL.createObjectURL(file);
        newImages.push(objectUrl);
      });

      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...newImages]
      }));
    }
  };

  const removeImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, index) => index !== indexToRemove) || []
    }));
  };

  const processVideoFile = (file: File) => {
    const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
    if (file.size > MAX_VIDEO_SIZE) {
      alert("O vídeo excede o tamanho máximo de 50MB.");
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, videoUrl: objectUrl }));
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processVideoFile(file);
  };

  const removeVideo = () => {
    setFormData(prev => ({ ...prev, videoUrl: '' }));
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  // --- Document Upload Logic ---

  const handleDocUpload = (file: File, type: 'identity' | 'propertyOwnership') => {
    const MAX_DOC_SIZE = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      alert("Formato inválido. Apenas PDF, JPG ou PNG.");
      return;
    }

    if (file.size > MAX_DOC_SIZE) {
      alert("O documento excede o tamanho máximo de 10MB.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setFormData(prev => ({
      ...prev,
      documents: { ...prev.documents, [type]: objectUrl }
    }));
    
    // Clear specific error if exists
    if (errors[type]) {
       const newErrors = { ...errors };
       delete newErrors[type];
       setErrors(newErrors);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'identity' | 'propertyOwnership') => {
    if (e.target.files && e.target.files[0]) {
      handleDocUpload(e.target.files[0], type);
    }
  };

  const removeDoc = (type: 'identity' | 'propertyOwnership') => {
    setFormData(prev => ({
      ...prev,
      documents: { ...prev.documents, [type]: undefined }
    }));
    if (type === 'identity' && identityInputRef.current) identityInputRef.current.value = '';
    if (type === 'propertyOwnership' && ownershipInputRef.current) ownershipInputRef.current.value = '';
  };

  // Drag Events
  const handleDrag = (e: React.DragEvent, type: 'identity' | 'ownership' | 'video', active: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [type]: active }));
  };

  const handleDrop = (e: React.DragEvent, type: 'identity' | 'propertyOwnership' | 'video') => {
    e.preventDefault();
    e.stopPropagation();
    
    const dragKey = type === 'identity' ? 'identity' : type === 'propertyOwnership' ? 'ownership' : 'video';
    setDragActive(prev => ({ ...prev, [dragKey]: false }));
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if (type === 'video') {
         processVideoFile(e.dataTransfer.files[0]);
      } else {
         handleDocUpload(e.dataTransfer.files[0], type);
      }
    }
  };

  // --- Validation Logic ---

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (currentStep === 1) {
      if (!formData.listingType) newErrors.listingType = "Selecione o objetivo da transação.";
      if (!formData.type) newErrors.type = "Selecione o tipo de imóvel.";
      if (!formData.location?.province) newErrors.province = "Selecione a província.";
      if (!formData.location?.municipality) newErrors.municipality = "Selecione o município.";
      if (!formData.location?.address?.trim()) newErrors.address = "O endereço é obrigatório.";
    }

    if (currentStep === 2) {
      if (!formData.title?.trim()) {
        newErrors.title = "Defina um título para o anúncio.";
      } else if (formData.title.trim().length < 5) {
        newErrors.title = "O título deve ter pelo menos 5 caracteres.";
      }
      
      if (!formData.area || formData.area <= 0) newErrors.area = "Indique a área do imóvel (m²).";
      
      if (formData.type !== 'Terreno' && formData.type !== 'Loja' && formData.type !== 'Escritório') {
         if (formData.bedrooms === undefined || formData.bedrooms < 0) newErrors.bedrooms = "Indique o nº de quartos.";
         if (formData.bathrooms === undefined || formData.bathrooms < 0) newErrors.bathrooms = "Indique o nº de WCs.";
      }
    }

    if (currentStep === 3) {
      if (!formData.price || formData.price <= 0) newErrors.price = "Defina um preço válido.";
    }

    if (currentStep === 4) {
      if (!formData.images || formData.images.length === 0) {
        newErrors.images = "Adicione pelo menos uma fotografia do imóvel.";
      }
    }

    if (currentStep === 5) {
        if (!formData.documents?.identity) newErrors.identity = "O Bilhete de Identidade é obrigatório.";
        if (!formData.documents?.propertyOwnership) newErrors.propertyOwnership = "O documento do imóvel é obrigatório.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      isValid = false;
    }

    return isValid;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handleBack = () => setStep(prev => Math.max(prev - 1, 1));
  
  const handleSubmit = () => {
    if (validateStep(step)) {
        onSubmit({
            ...formData,
            id: Math.random().toString(36).substr(2, 9),
        });
    }
  };

  const municipalities = MUNICIPALITIES_MOCK[formData.location?.province || 'Default'] || MUNICIPALITIES_MOCK['Default'];

  const getInputClass = (errorKey: string) => `w-full p-2 border rounded-md transition-colors ${
    errors[errorKey] ? 'border-red-500 bg-red-50 focus:ring-red-200 focus:border-red-500' : 'border-gray-300 focus:border-brand-500'
  }`;

  const ErrorMsg = ({ errorKey }: { errorKey: string }) => errors[errorKey] ? (
    <p className="text-red-500 text-xs mt-1 flex items-center">
      <AlertCircle className="w-3 h-3 mr-1" /> {errors[errorKey]}
    </p>
  ) : null;

  const renderDocUploadArea = (
      type: 'identity' | 'propertyOwnership', 
      label: string, 
      subLabel: string, 
      ref: React.RefObject<HTMLInputElement>,
      errorKey: string
  ) => {
      const isDragActive = type === 'identity' ? dragActive.identity : dragActive.ownership;
      const fileUrl = formData.documents?.[type];
      const hasError = !!errors[errorKey];

      return (
        <div className="flex flex-col">
            <input 
                type="file" 
                ref={ref}
                onChange={(e) => onFileChange(e, type)}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
            />
            
            {!fileUrl ? (
                <div 
                    className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                        isDragActive 
                            ? 'border-brand-500 bg-brand-50 scale-[1.02] shadow-md' 
                            : hasError 
                                ? 'border-red-300 bg-red-50' 
                                : 'border-gray-300 hover:bg-gray-50 hover:border-brand-300'
                    }`}
                    onDragEnter={(e) => handleDrag(e, type === 'identity' ? 'identity' : 'ownership', true)}
                    onDragOver={(e) => handleDrag(e, type === 'identity' ? 'identity' : 'ownership', true)}
                    onDragLeave={(e) => handleDrag(e, type === 'identity' ? 'identity' : 'ownership', false)}
                    onDrop={(e) => handleDrop(e, type)}
                    onClick={() => ref.current?.click()}
                >
                    {/* Pointer events none prevents child elements from triggering dragLeave unexpectedly */}
                    <div className="pointer-events-none flex flex-col items-center">
                        {isDragActive ? (
                            <>
                                <Upload className="h-10 w-10 text-brand-600 mb-2 animate-bounce" />
                                <h4 className="font-bold text-brand-700">Solte o ficheiro aqui</h4>
                            </>
                        ) : (
                            <>
                                <Upload className={`h-8 w-8 mb-3 ${hasError ? 'text-red-400' : 'text-gray-400'}`} />
                                <h4 className={`font-medium ${hasError ? 'text-red-700' : 'text-gray-800'}`}>{label}</h4>
                                <p className="text-xs text-gray-500 mt-1">{subLabel}</p>
                                <p className="text-[10px] text-gray-400 mt-2">Arrastar ou Clicar (PDF, JPG, PNG)</p>
                            </>
                        )}
                    </div>
                </div>
            ) : (
                <div className="border border-green-200 bg-green-50 rounded-lg p-4 flex items-center justify-between animate-fadeIn">
                    <div className="flex items-center overflow-hidden">
                        <div className="bg-white p-2 rounded-full border border-green-100 mr-3 shrink-0">
                            <FileText className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="min-w-0">
                            <p className="font-medium text-green-800 text-sm truncate">{label}</p>
                            <p className="text-xs text-green-600 flex items-center">
                                <CheckCircle className="h-3 w-3 mr-1" /> Carregado com sucesso
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={() => removeDoc(type)}
                        className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors"
                        title="Remover documento"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            )}
            <ErrorMsg errorKey={errorKey} />
        </div>
      );
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Progress Bar */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800">Novo Anúncio</h2>
        <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map(s => (
                <div key={s} className={`h-2 w-8 rounded-full ${s <= step ? 'bg-brand-500' : 'bg-gray-200'}`}></div>
            ))}
        </div>
      </div>

      <div className="p-6 min-h-[400px]">
        {/* Step 1: Type & Location */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-xl font-semibold mb-4">Onde fica o seu imóvel?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Objetivo <span className="text-red-500">*</span></label>
                <select 
                  className={getInputClass('listingType')}
                  value={formData.listingType || ''}
                  onChange={e => updateFormData('listingType', e.target.value)}
                >
                  <option value="">Selecionar...</option>
                  <option value="Arrendar">Arrendar</option>
                  <option value="Comprar">Vender</option>
                </select>
                <ErrorMsg errorKey="listingType" />
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Imóvel <span className="text-red-500">*</span></label>
                <select 
                  className={getInputClass('type')}
                  value={formData.type || ''}
                  onChange={e => updateFormData('type', e.target.value)}
                >
                  <option value="">Selecionar...</option>
                  {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <ErrorMsg errorKey="type" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Província <span className="text-red-500">*</span></label>
                <select 
                  className={getInputClass('province')}
                  value={formData.location?.province}
                  onChange={e => updateLocation('province', e.target.value)}
                >
                  {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <ErrorMsg errorKey="province" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Município <span className="text-red-500">*</span></label>
                <select 
                  className={getInputClass('municipality')}
                  value={formData.location?.municipality}
                  onChange={e => updateLocation('municipality', e.target.value)}
                >
                   <option value="">Selecionar...</option>
                   {municipalities.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <ErrorMsg errorKey="municipality" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço / Ponto de Referência <span className="text-red-500">*</span></label>
                <input 
                    type="text" 
                    className={getInputClass('address')}
                    placeholder="Ex: Rua Direita do Camama, junto à Farmácia X"
                    value={formData.location?.address}
                    onChange={e => updateLocation('address', e.target.value)}
                />
                <ErrorMsg errorKey="address" />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
             <div className="space-y-4 animate-fadeIn">
             <h3 className="text-xl font-semibold mb-4">Detalhes do Imóvel</h3>
             
             <div className="grid grid-cols-2 gap-4">
                 <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título do Anúncio <span className="text-red-500">*</span></label>
                    <input 
                        type="text" 
                        className={getInputClass('title')}
                        placeholder="Ex: T3 Moderno no Kilamba"
                        value={formData.title || ''}
                        onChange={e => updateFormData('title', e.target.value)}
                    />
                    <ErrorMsg errorKey="title" />
                 </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Área (m²) <span className="text-red-500">*</span></label>
                    <input 
                        type="number" 
                        className={getInputClass('area')}
                        value={formData.area || ''}
                        onChange={e => updateFormData('area', Number(e.target.value))}
                    />
                    <ErrorMsg errorKey="area" />
                 </div>
                 
                 {formData.type !== 'Terreno' && formData.type !== 'Loja' && formData.type !== 'Escritório' && (
                  <>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quartos <span className="text-red-500">*</span></label>
                        <input 
                            type="number" 
                            className={getInputClass('bedrooms')}
                            value={formData.bedrooms || ''}
                            onChange={e => updateFormData('bedrooms', Number(e.target.value))}
                        />
                        <ErrorMsg errorKey="bedrooms" />
                     </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Casas de Banho <span className="text-red-500">*</span></label>
                        <input 
                            type="number" 
                            className={getInputClass('bathrooms')}
                            value={formData.bathrooms || ''}
                            onChange={e => updateFormData('bathrooms', Number(e.target.value))}
                        />
                        <ErrorMsg errorKey="bathrooms" />
                     </div>
                  </>
                 )}
             </div>

             <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Comodidades (Infraestrutura)</label>
                 <div className="grid grid-cols-2 gap-2">
                    {AMENITIES.map(amenity => (
                        <label key={amenity} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={formData.features?.includes(amenity)}
                                onChange={() => toggleFeature(amenity)}
                                className="rounded text-brand-600 focus:ring-brand-500"
                            />
                            <span className="text-sm text-gray-700">{amenity}</span>
                        </label>
                    ))}
                 </div>
             </div>
           </div>
        )}

        {/* Step 3: Price & Guarantee */}
        {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
                <h3 className="text-xl font-semibold mb-4">Preço e Segurança</h3>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Moeda</label>
                        <select 
                            className="w-full p-2 border rounded-md"
                            value={formData.currency}
                            onChange={e => updateFormData('currency', e.target.value)}
                        >
                            <option value="AOA">Kwanzas (AOA)</option>
                            <option value="USD">Dólares (USD)</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preço {formData.listingType === 'Arrendar' ? '/ Mês' : ''} <span className="text-red-500">*</span></label>
                        <input 
                            type="number" 
                            className={getInputClass('price')}
                            placeholder="0.00"
                            value={formData.price || ''}
                            onChange={e => updateFormData('price', Number(e.target.value))}
                        />
                        <ErrorMsg errorKey="price" />
                    </div>
                </div>

                <div className="bg-brand-50 border border-brand-100 rounded-lg p-4">
                    <label className="flex items-start space-x-3 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={formData.isGuaranteed}
                            onChange={e => updateFormData('isGuaranteed', e.target.checked)}
                            className="mt-1 h-5 w-5 text-brand-600 rounded border-gray-300 focus:ring-brand-500" 
                        />
                        <div>
                            <span className="block font-bold text-gray-900">Ativar Transação Garantida (2.5%)</span>
                            <span className="block text-sm text-gray-600 mt-1">
                                Aumente a confiança dos inquilinos. O valor é mantido numa conta segura (escrow) até à assinatura do contrato. Inclui o serviço <b>Kiá Contract</b>.
                            </span>
                        </div>
                    </label>
                </div>
            </div>
        )}

        {/* Step 4: Multimedia */}
        {step === 4 && (
             <div className="space-y-6 animate-fadeIn">
                 <h3 className="text-xl font-semibold">Fotografias & Vídeo</h3>
                 
                 {/* Image Upload Section */}
                 <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">Galeria de Fotos <span className="text-red-500">*</span></label>
                        <span className="text-xs text-gray-500">{formData.images?.length || 0} selecionadas</span>
                    </div>

                    <input 
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        ref={imageInputRef}
                        onChange={handleImageUpload}
                    />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                         {/* Upload Button Block */}
                        <div 
                            onClick={() => imageInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-brand-400 transition-all"
                        >
                             <ImageIcon className="h-8 w-8 text-gray-400 mb-1" />
                             <span className="text-xs text-brand-600 font-bold">Adicionar Fotos</span>
                             <span className="text-[10px] text-gray-400">JPG/PNG (Max 5MB)</span>
                        </div>

                        {/* Previews */}
                        {formData.images?.map((img, index) => (
                            <div key={index} className="relative group h-32 rounded-lg overflow-hidden border border-gray-200">
                                <img src={img} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                <button 
                                    onClick={() => removeImage(index)}
                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                                {index === 0 && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-0.5">
                                        Capa Principal
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <ErrorMsg errorKey="images" />
                 </div>

                 {/* Video Upload Section */}
                 <div className="pt-4 border-t border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vídeo Tour (Opcional)</label>
                    <input 
                        type="file"
                        accept="video/*"
                        className="hidden"
                        ref={videoInputRef}
                        onChange={handleVideoUpload}
                    />
                    
                    {!formData.videoUrl ? (
                         <div 
                            onClick={() => videoInputRef.current?.click()}
                            onDragOver={(e) => handleDrag(e, 'video', true)}
                            onDragLeave={(e) => handleDrag(e, 'video', false)}
                            onDrop={(e) => handleDrop(e, 'video')}
                            className={`border-2 border-dashed rounded-lg p-6 flex items-center justify-center cursor-pointer transition-colors ${
                                dragActive.video ? 'border-brand-500 bg-brand-50' : 'border-gray-300 hover:bg-gray-50'
                            }`}
                         >
                            <div className="pointer-events-none flex flex-col items-center">
                                <Film className="h-6 w-6 text-gray-400 mr-2" />
                                <div className="text-center">
                                    <span className="text-sm text-gray-700 block">Carregar Vídeo do Imóvel</span>
                                    <span className="text-xs text-gray-400 block">Arrastar ou Clicar (MP4, MOV, Máx 50MB)</span>
                                </div>
                            </div>
                         </div>
                    ) : (
                        <div className="relative bg-black rounded-lg overflow-hidden h-48 flex items-center justify-center group">
                            <video src={formData.videoUrl} className="h-full w-full object-contain" controls />
                             <button 
                                    onClick={removeVideo}
                                    className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs flex items-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="w-3 h-3 mr-1" /> Remover Vídeo
                            </button>
                        </div>
                    )}
                 </div>

                 <div className="bg-blue-50 p-4 rounded-md text-left flex items-start mt-4">
                    <CheckCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                    <p className="text-sm text-blue-700">Dica: Imóveis com muitas fotos e vídeo tour são validados 2x mais rápido.</p>
                 </div>
             </div>
        )}

         {/* Step 5: Documents (Kiá Verify) */}
         {step === 5 && (
            <div className="space-y-6 animate-fadeIn">
                 <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-accent-500/10 rounded-lg">
                        <ShieldCheck className="h-8 w-8 text-accent-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Kiá Verify</h3>
                        <p className="text-gray-600 text-xs uppercase tracking-wide font-medium">Validação de Segurança Rigorosa</p>
                    </div>
                 </div>
                 
                 <div className="bg-accent-50 p-4 rounded-lg border border-accent-200 mb-6">
                    <div className="flex items-start">
                        <Scale className="h-5 w-5 text-accent-600 mr-2 mt-0.5" />
                        <p className="text-sm text-accent-800">
                            <strong>Garantia Antifraude:</strong> Os seus documentos serão analisados pelos nossos parceiros legais. Esta verificação confere ao seu anúncio o selo "Verificado", aumentando a confiança dos inquilinos.
                        </p>
                    </div>
                 </div>
                 
                 <div className="space-y-4">
                    {renderDocUploadArea(
                        'identity', 
                        'Bilhete de Identidade / Passaporte', 
                        'Deve estar válido e legível. Cópia frente e verso.', 
                        identityInputRef,
                        'identity'
                    )}
                    
                    {renderDocUploadArea(
                        'propertyOwnership', 
                        'Título de Propriedade / Registo Predial', 
                        'Certidão do Registo Predial, Contrato Promessa Compra e Venda ou Escritura.', 
                        ownershipInputRef,
                        'propertyOwnership'
                    )}
                 </div>

                 <div className="mt-6 bg-yellow-50 p-4 rounded-md border border-yellow-100">
                     <div className="flex">
                         <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                         <div className="text-sm text-yellow-800">
                             <p className="font-bold">Taxa de Publicação: 3.000 AOA</p>
                             <p>O pagamento será solicitado após a conclusão da verificação documental.</p>
                         </div>
                     </div>
                 </div>
            </div>
        )}

      </div>

      {/* Footer / Navigation */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between">
         {step > 1 ? (
             <button onClick={handleBack} className="flex items-center text-gray-600 hover:text-gray-900 px-4 py-2">
                 <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
             </button>
         ) : (
            <button onClick={onCancel} className="text-gray-600 hover:text-gray-900 px-4 py-2">Cancelar</button>
         )}

         {step < 5 ? (
             <button onClick={handleNext} className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-2 rounded-md font-medium flex items-center shadow-sm">
                 Próximo <ChevronRight className="h-4 w-4 ml-1" />
             </button>
         ) : (
             <button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-bold shadow-sm flex items-center">
                 <ShieldCheck className="h-4 w-4 mr-2" />
                 Submeter para Verificação
             </button>
         )}
      </div>
    </div>
  );
};

export default PropertyForm;
