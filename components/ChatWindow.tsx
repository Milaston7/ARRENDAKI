
import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Lock, ShieldAlert, MoreVertical, ShieldCheck, Calendar, FileText, Flag, Info, AlertTriangle, XCircle, Check, CheckCircle, Eye, EyeOff, Terminal } from 'lucide-react';
import { ChatMessage, Proposal } from '../types';
import ProposalModal from './ProposalModal';

interface ChatWindowProps {
  chatId: string;
  currentUser: string;
  onScheduleVisit?: () => void;
  onSendProposal?: () => void;
}

// --- CRYPTOGRAPHY SIMULATION SERVICES ---
const encryptMessage = (text: string): string => {
  try {
    return `ENC::${btoa(encodeURIComponent(text))}`;
  } catch (e) {
    console.error("Encryption failed", e);
    return text;
  }
};

const decryptMessage = (cipher: string): string => {
  try {
    if (!cipher.startsWith('ENC::')) return cipher; // Fallback for legacy messages
    const payload = cipher.split('ENC::')[1];
    return decodeURIComponent(atob(payload));
  } catch (e) {
    return '*** Mensagem Não Desencriptada ***';
  }
};

// --- NLP & SECURITY SERVICES ---
interface SecurityCheckResult {
  isSafe: boolean;
  reason?: 'phone_sharing' | 'email_sharing' | 'link_sharing' | 'suspicious_keywords';
  snippet?: string;
}

const analyzeMessageContent = (text: string): SecurityCheckResult => {
  const lowerText = text.toLowerCase();
  // Regex simplificado para deteção de 9 digitos (Angola)
  const phoneRegex = /(?:(?:\+244|00244)\s?)?(?:9\d{2}[\s-]?\d{3}[\s-]?\d{3}|9\d{8})\b/;
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|(\b\.com\b|\b\.ao\b)/;
  const suspiciousKeywords = ['pagamento direto', 'transferência direta', 'fora da plataforma', 'me liga', 'meu zap', 'meu whatsapp', 'mbway'];

  if (phoneRegex.test(text)) return { isSafe: false, reason: 'phone_sharing', snippet: text.match(phoneRegex)?.[0] };
  if (emailRegex.test(text)) return { isSafe: false, reason: 'email_sharing', snippet: text.match(emailRegex)?.[0] };
  if (urlRegex.test(text)) return { isSafe: false, reason: 'link_sharing', snippet: 'Link Externo' };
  if (suspiciousKeywords.some(kw => lowerText.includes(kw))) {
      const found = suspiciousKeywords.find(kw => lowerText.includes(kw));
      return { isSafe: false, reason: 'suspicious_keywords', snippet: found };
  }

  return { isSafe: true };
};

const ChatWindow: React.FC<ChatWindowProps> = ({ chatId, currentUser, onScheduleVisit, onSendProposal }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
        id: '1', 
        senderId: 'system', 
        text: 'Bem-vindo ao chat seguro Arrendaki. Todas as mensagens são encriptadas e monitorizadas por IA para sua segurança. Não partilhe contactos pessoais antes de agendar uma visita.', 
        timestamp: Date.now(),
        isEncrypted: false 
    },
    { 
        id: '2', 
        senderId: 'other', 
        text: encryptMessage('Bom dia! O imóvel ainda está disponível?'), 
        timestamp: Date.now() + 1000,
        isEncrypted: true
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [securityAlert, setSecurityAlert] = useState<{show: boolean, reason?: string, snippet?: string}>({ show: false });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [showProposalSuccess, setShowProposalSuccess] = useState(false);
  
  // NEW STATE: Toggle Raw Data View (Simulation of Server-Side View)
  const [showRawData, setShowRawData] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const securityCheck = analyzeMessageContent(inputText);

    if (!securityCheck.isSafe) {
      setSecurityAlert({ 
          show: true, 
          reason: securityCheck.reason, 
          snippet: securityCheck.snippet 
      });
      return; 
    }

    sendMessage(inputText);
  };

  const sendMessage = (text: string, isSystemReview = false) => {
    const encryptedText = isSystemReview ? text : encryptMessage(text); // Don't encrypt system messages standardly

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: isSystemReview ? 'system' : currentUser,
      text: encryptedText,
      timestamp: Date.now(),
      isEncrypted: !isSystemReview,
      isBlocked: isSystemReview // Flag logic
    };

    setMessages([...messages, newMessage]);
    setInputText('');
    setSecurityAlert({ show: false });

    if (!isSystemReview) {
        // Mock response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                senderId: 'other',
                text: encryptMessage('Obrigado pelo interesse. Utilize o botão "Agendar Visita" acima para marcarmos um horário.'),
                timestamp: Date.now(),
                isEncrypted: true
            }]);
        }, 2000);
    }
  };

  const handleAppealReview = () => {
      // Send the message but mark it as withheld/pending review
      const blockedMsg = `🚫 Mensagem retida para análise de segurança: "${inputText}"`;
      sendMessage(blockedMsg, true);
      alert("A sua mensagem foi enviada para a equipa de moderação. Se for aprovada, será libertada em breve.");
  };

  // Opens the proposal modal
  const handleProposalClick = () => {
      setIsProposalModalOpen(true);
  };

  // Processes the proposal submission
  const handleProposalSubmit = (proposal: Proposal) => {
      setIsProposalModalOpen(false);
      setShowProposalSuccess(true);

      const formattedValue = new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(proposal.value);
      const formattedDeposit = new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(proposal.deposit);

      const proposalText = `
📄 **PROPOSTA FORMAL ENVIADA**

**Valor Proposto:** ${formattedValue}
**Início:** ${new Date(proposal.startDate).toLocaleDateString()}
**Duração:** ${proposal.duration} Meses
**Caução/Sinal:** ${formattedDeposit}

**Condições Adicionais:**
"${proposal.conditions || 'Nenhuma'}"

---
*A aguardar aceitação do proprietário para iniciar o Fecho Arrendaki.*
      `.trim();

      // Inject system message representing the proposal
      const proposalMsg: ChatMessage = {
          id: Date.now().toString(),
          senderId: 'me', // User sent it, but it's a special format
          text: proposalText, // Store plain text for special rendering or encrypt if needed. For now plain to display nicely.
          timestamp: Date.now(),
          isEncrypted: false // System messages or special blocks might skip encryption for display logic here, or wrap in ENC
      };
      
      setMessages(prev => [...prev, proposalMsg]);

      // Trigger external handler if provided (for backend sync)
      if (onSendProposal) {
          onSendProposal();
      }

      // Hide success banner after 8 seconds
      setTimeout(() => setShowProposalSuccess(false), 8000);
  };

  const getReasonText = (reason?: string) => {
      switch(reason) {
          case 'phone_sharing': return 'Partilha de número de telefone';
          case 'email_sharing': return 'Partilha de email';
          case 'link_sharing': return 'Links externos';
          case 'suspicious_keywords': return 'Palavras-chave de risco';
          default: return 'Conteúdo suspeito';
      }
  };

  return (
    <div className="flex flex-col h-[600px] bg-[#e5ddd5] rounded-xl shadow-lg border border-gray-200 overflow-hidden relative">
      
      <ProposalModal 
        isOpen={isProposalModalOpen}
        onClose={() => setIsProposalModalOpen(false)}
        onSubmit={handleProposalSubmit}
      />

      {/* Proposal Success Banner */}
      {showProposalSuccess && (
          <div className="absolute top-16 left-4 right-4 z-30 bg-green-600 text-white p-4 rounded-lg shadow-xl animate-fadeIn border border-green-400">
              <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                      <h4 className="font-bold text-lg">Proposta Enviada com Sucesso!</h4>
                      <p className="text-sm text-green-100 mt-1">
                          O Proprietário foi notificado e tem 48 horas para Aceitar ou Rejeitar. 
                          Se aceite, a nossa equipa inicia o Kiá Verify para garantir o fecho seguro.
                      </p>
                  </div>
                  <button onClick={() => setShowProposalSuccess(false)} className="ml-auto text-green-200 hover:text-white">
                      <XCircle className="w-5 h-5" />
                  </button>
              </div>
          </div>
      )}

      {/* Header */}
      <div className="bg-white p-3 border-b border-gray-200 flex items-center justify-between shadow-sm z-10 relative">
        <div className="flex items-center space-x-3">
            <div className="relative">
                <div className="h-10 w-10 bg-brand-100 rounded-full flex items-center justify-center overflow-hidden border border-brand-200">
                    <User className="h-6 w-6 text-brand-600" />
                </div>
                <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
                <h3 className="font-bold text-sm text-gray-900">Proprietário</h3>
                <div className="flex items-center text-xs text-green-600 font-medium">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Arrendaki Shield Ativo
                </div>
            </div>
        </div>
        <div className="relative">
            <button 
                onClick={() => setShowMenu(!showMenu)}
                className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100"
            >
                <MoreVertical className="w-5 h-5" />
            </button>
            {showMenu && (
                <div className="absolute right-0 top-10 w-64 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50 animate-fadeIn">
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                        <User className="w-4 h-4 mr-2" /> Ver Perfil
                    </button>
                    {/* NEW: Toggle Raw Data */}
                    <button 
                        onClick={() => { setShowRawData(!showRawData); setShowMenu(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-brand-600 hover:bg-brand-50 flex items-center font-medium border-t border-gray-100"
                    >
                        {showRawData ? <EyeOff className="w-4 h-4 mr-2" /> : <Terminal className="w-4 h-4 mr-2" />}
                        {showRawData ? 'Ocultar Dados Brutos' : 'Simular Visão do Servidor'}
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center font-medium">
                        <Flag className="w-4 h-4 mr-2" /> Denunciar Utilizador
                    </button>
                </div>
            )}
        </div>
      </div>

      {/* Security Banner (E2EE) */}
      <div className={`text-[10px] md:text-xs py-1.5 px-4 text-center shadow-inner flex items-center justify-center border-b border-gray-200 transition-colors duration-300 ${showRawData ? 'bg-gray-900 text-green-400' : 'bg-[#f0f2f5] text-gray-500'}`}>
          {showRawData ? (
              <>
                <Terminal className="w-3 h-3 mr-1.5" />
                <span>MODO DEBUG: Visualizando Ciphertext (O que o servidor vê)</span>
              </>
          ) : (
              <>
                <Lock className="w-3 h-3 mr-1.5 text-gray-400" />
                <span>As mensagens são protegidas com encriptação de ponta-a-ponta.</span>
              </>
          )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat opacity-50">
        {messages.map(msg => {
            const isMe = msg.senderId === currentUser || msg.senderId === 'me';
            const isSystem = msg.senderId === 'system';
            
            // Logic for E2EE Simulation
            let displayText = msg.text;
            let isRaw = false;

            if (msg.isEncrypted) {
                if (showRawData) {
                    displayText = msg.text; // Show ENC::...
                    isRaw = true;
                } else {
                    displayText = decryptMessage(msg.text); // Show Plaintext
                }
            }

            // Render Special Proposal Message
            if (displayText.includes('PROPOSTA FORMAL ENVIADA') && !isRaw) {
                return (
                    <div key={msg.id} className="flex justify-center my-4">
                        <div className="bg-white border-2 border-brand-200 rounded-xl p-4 shadow-md max-w-sm w-full">
                            <div className="flex items-center text-brand-600 font-bold mb-2 border-b border-brand-100 pb-2">
                                <FileText className="w-5 h-5 mr-2" /> Proposta Formal Kiá
                            </div>
                            <div className="text-sm text-gray-700 whitespace-pre-wrap font-mono bg-gray-50 p-2 rounded mb-2">
                                {displayText.replace('📄 **PROPOSTA FORMAL ENVIADA**', '').trim()}
                            </div>
                            <div className="text-center">
                                <span className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-bold">
                                    PENDENTE DE ACEITAÇÃO
                                </span>
                            </div>
                            <div className="text-right mt-2 text-[10px] text-gray-400">
                                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                        </div>
                    </div>
                );
            }

            if (isSystem) {
                return (
                    <div key={msg.id} className="flex justify-center my-4 px-4">
                        <div className={`text-xs p-3 rounded-lg text-center max-w-sm shadow-sm border flex flex-col items-center ${
                            msg.text.includes('retida') 
                            ? 'bg-red-50 text-red-800 border-red-200' 
                            : 'bg-[#fff5c4] text-gray-800 border-yellow-200'
                        }`}>
                            {msg.text.includes('retida') 
                                ? <AlertTriangle className="w-4 h-4 text-red-600 mb-1" />
                                : <Info className="w-4 h-4 text-yellow-600 mb-1" />
                            }
                            {displayText}
                        </div>
                    </div>
                );
            }

            return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] md:max-w-[60%] rounded-lg px-3 py-2 shadow-sm relative transition-all duration-300 ${
                        isMe 
                        ? 'bg-[#d9fdd3] text-gray-900 rounded-tr-none border border-[#c9eub7]' 
                        : 'bg-white text-gray-900 rounded-tl-none border border-white'
                    } ${isRaw ? 'font-mono text-xs bg-gray-800 text-green-400 border-gray-700' : ''}`}>
                        
                        {/* E2EE Indicator Logic */}
                        {isRaw && (
                            <div className="text-[9px] text-gray-500 mb-1 flex items-center uppercase tracking-wider border-b border-gray-700 pb-1">
                                <Lock className="w-3 h-3 mr-1" /> Encrypted Payload
                            </div>
                        )}

                        <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isRaw ? 'break-all' : ''}`}>{displayText}</p>
                        
                        <div className="flex justify-end items-center mt-1 space-x-1 opacity-70">
                             {msg.isEncrypted && !isRaw && <Lock className="w-2.5 h-2.5 text-gray-500" />}
                             <span className={`text-[10px] ${isRaw ? 'text-gray-500' : 'text-gray-500'}`}>
                                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                        </div>
                    </div>
                </div>
            );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex space-x-2 overflow-x-auto no-scrollbar">
          <button 
            onClick={onScheduleVisit}
            className="flex items-center space-x-1.5 bg-white border border-brand-200 text-brand-700 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-brand-50 whitespace-nowrap shadow-sm transition-colors"
          >
              <Calendar className="w-3.5 h-3.5" /> <span>Agendar Visita</span>
          </button>
          <button 
            onClick={handleProposalClick}
            className="flex items-center space-x-1.5 bg-brand-600 border border-brand-700 text-white px-3 py-1.5 rounded-full text-xs font-bold hover:bg-brand-700 whitespace-nowrap shadow-sm transition-colors"
          >
              <FileText className="w-3.5 h-3.5" /> <span>Enviar Proposta Formal</span>
          </button>
      </div>

      {/* Input Area with Security Overlay */}
      <div className="relative">
          {/* Security Blocking Overlay */}
          {securityAlert.show && (
            <div className="absolute inset-0 z-20 bg-red-50/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 border-t-4 border-red-500 animate-fadeIn">
                <div className="flex items-center text-red-700 mb-2">
                    <ShieldAlert className="w-6 h-6 mr-2 animate-pulse" />
                    <h3 className="font-bold text-lg">Ação Bloqueada</h3>
                </div>
                <p className="text-sm text-gray-700 text-center mb-1 max-w-md">
                    Detetamos a tentativa de <strong>{getReasonText(securityAlert.reason)}</strong>.
                </p>
                {securityAlert.snippet && (
                    <div className="bg-white border border-red-200 px-3 py-1 rounded text-red-600 font-mono text-xs mb-3">
                        "{securityAlert.snippet}"
                    </div>
                )}
                <p className="text-xs text-gray-500 text-center mb-4 max-w-sm">
                    Para sua proteção contra fraudes, é proibido partilhar contactos fora da plataforma antes de uma visita agendada.
                </p>
                <div className="flex space-x-3">
                    <button 
                        onClick={() => setSecurityAlert({ show: false })}
                        className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 flex items-center"
                    >
                        <XCircle className="w-4 h-4 mr-2" />
                        Vou Editar
                    </button>
                    <button 
                        onClick={handleAppealReview}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 flex items-center shadow-sm"
                    >
                        <Check className="w-4 h-4 mr-2" />
                        Enviar para Análise
                    </button>
                </div>
            </div>
          )}

          <div className="p-3 bg-white border-t border-gray-200">
            <div className="flex space-x-2 items-center">
                <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => {
                        setInputText(e.target.value);
                        if(securityAlert.show) setSecurityAlert({ show: false });
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Escreva uma mensagem..."
                    className="flex-1 border border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-shadow"
                />
                <button 
                    onClick={handleSend}
                    disabled={!inputText.trim()}
                    className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full p-3 transition-colors flex-shrink-0 shadow-md"
                >
                    <Send className="h-5 w-5" />
                </button>
            </div>
          </div>
      </div>
    </div>
  );
};

export default ChatWindow;
