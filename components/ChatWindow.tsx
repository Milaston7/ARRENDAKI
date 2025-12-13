
import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Lock, ShieldAlert, MoreVertical, ShieldCheck, Calendar, FileText, Flag, Info } from 'lucide-react';
import { ChatMessage } from '../types';

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
  const phoneRegex = /(?:(?:\+244|00244)\s?)?(?:9\d{2}[\s-]?\d{3}[\s-]?\d{3}|9\d{8})\b/;
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|(\b\.com\b|\b\.ao\b)/;
  const suspiciousKeywords = ['pagamento direto', 'transferência direta', 'fora da plataforma', 'me liga', 'meu zap', 'meu whatsapp'];

  if (phoneRegex.test(text)) return { isSafe: false, reason: 'phone_sharing', snippet: text.match(phoneRegex)?.[0] };
  if (emailRegex.test(text)) return { isSafe: false, reason: 'email_sharing', snippet: text.match(emailRegex)?.[0] };
  if (urlRegex.test(text)) return { isSafe: false, reason: 'link_sharing', snippet: 'External Link' };
  if (suspiciousKeywords.some(kw => lowerText.includes(kw))) return { isSafe: false, reason: 'suspicious_keywords', snippet: 'Suspicious Keyword' };

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
  const [securityAlert, setSecurityAlert] = useState<{show: boolean, reason?: string}>({ show: false });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showMenu, setShowMenu] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const securityCheck = analyzeMessageContent(inputText);

    if (!securityCheck.isSafe) {
      setSecurityAlert({ show: true, reason: securityCheck.reason });
      return; 
    }

    const encryptedText = encryptMessage(inputText);

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: currentUser,
      text: encryptedText,
      timestamp: Date.now(),
      isEncrypted: true
    };

    setMessages([...messages, newMessage]);
    setInputText('');
    setSecurityAlert({ show: false });

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
  };

  // Wrapper to inject message when proposal is sent
  const handleProposalClick = () => {
      if (onSendProposal) {
          const proposalMsg: ChatMessage = {
              id: Date.now().toString(),
              senderId: 'system',
              text: '📄 **Proposta Enviada**: O utilizador iniciou um processo de negociação segura.',
              timestamp: Date.now(),
              isEncrypted: false
          };
          setMessages(prev => [...prev, proposalMsg]);
          onSendProposal();
      }
  };

  return (
    <div className="flex flex-col h-[600px] bg-[#e5ddd5] rounded-xl shadow-lg border border-gray-200 overflow-hidden relative">
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
                <div className="absolute right-0 top-10 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50 animate-fadeIn">
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                        <User className="w-4 h-4 mr-2" /> Ver Perfil
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center font-medium">
                        <Flag className="w-4 h-4 mr-2" /> Denunciar Utilizador
                    </button>
                </div>
            )}
        </div>
      </div>

      {/* Security Banner (E2EE) */}
      <div className="bg-[#f0f2f5] text-gray-500 text-[10px] md:text-xs py-1.5 px-4 text-center shadow-inner flex items-center justify-center border-b border-gray-200">
          <Lock className="w-3 h-3 mr-1.5 text-gray-400" />
          <span>Encriptação ponta-a-ponta. Nem o Arrendaki pode ler o conteúdo exato das mensagens.</span>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat opacity-50">
        {messages.map(msg => {
            const isMe = msg.senderId === currentUser;
            const isSystem = msg.senderId === 'system';
            
            const displayText = msg.isEncrypted ? decryptMessage(msg.text) : msg.text;

            if (isSystem) {
                return (
                    <div key={msg.id} className="flex justify-center my-4 px-4">
                        <div className="bg-[#fff5c4] text-gray-800 text-xs p-3 rounded-lg text-center max-w-sm shadow-sm border border-yellow-200 flex flex-col items-center">
                            <Info className="w-4 h-4 text-yellow-600 mb-1" />
                            {displayText}
                        </div>
                    </div>
                );
            }

            return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] md:max-w-[60%] rounded-lg px-3 py-2 shadow-sm relative ${
                        isMe 
                        ? 'bg-[#d9fdd3] text-gray-900 rounded-tr-none border border-[#c9eub7]' 
                        : 'bg-white text-gray-900 rounded-tl-none border border-white'
                    }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{displayText}</p>
                        <div className="flex justify-end items-center mt-1 space-x-1 opacity-70">
                             {msg.isEncrypted && <Lock className="w-2.5 h-2.5 text-gray-500" />}
                             <span className="text-[10px] text-gray-500">
                                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                        </div>
                    </div>
                </div>
            );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Warning Alert (Blocking) */}
      {securityAlert.show && (
        <div className="absolute bottom-[110px] left-4 right-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-xl animate-fadeIn z-30">
            <div className="flex items-start">
                <ShieldAlert className="h-6 w-6 text-red-600 mr-3 flex-shrink-0" />
                <div className="flex-1">
                    <p className="text-sm font-bold text-red-800">Mensagem Bloqueada por Segurança</p>
                    <p className="text-xs text-red-700 mt-1 leading-relaxed">
                        O sistema detetou a partilha de {securityAlert.reason?.replace('_', ' ')}. 
                        <br/>
                        Para evitar fraudes, partilhe contactos apenas após <b>agendar visita</b> ou pagar a taxa de reserva.
                    </p>
                    <div className="mt-2 flex space-x-3">
                        <button 
                            onClick={() => setSecurityAlert({ show: false })}
                            className="text-xs font-bold text-red-600 hover:text-red-800 underline"
                        >
                            Entendi, vou editar
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

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
            className="flex items-center space-x-1.5 bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-gray-100 whitespace-nowrap shadow-sm transition-colors"
          >
              <FileText className="w-3.5 h-3.5" /> <span>Enviar Proposta</span>
          </button>
      </div>

      {/* Input Area */}
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
  );
};

export default ChatWindow;
