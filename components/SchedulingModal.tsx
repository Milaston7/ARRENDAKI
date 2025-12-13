
import React, { useState } from 'react';
import { X, Calendar, Clock, MessageSquare, CheckCircle } from 'lucide-react';
import { Property, User, VisitRequest } from '../types';

interface SchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
  user: User;
  onSubmit: (visitData: Partial<VisitRequest>) => void;
}

const SchedulingModal: React.FC<SchedulingModalProps> = ({ isOpen, onClose, property, user, onSubmit }) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) return;

    onSubmit({
        propertyId: property.id,
        propertyTitle: property.title,
        propertyImage: property.images[0],
        ownerId: property.ownerId,
        tenantId: user.id,
        tenantName: user.name,
        date,
        time,
        message,
        status: 'pending'
    });
    setStep('success');
  };

  const handleClose = () => {
      setStep('form');
      setDate('');
      setTime('');
      setMessage('');
      onClose();
  };

  // Generate next 7 days for selection (simplified)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Simple time slots
  const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-fadeIn">
        <button 
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
            <X className="w-6 h-6" />
        </button>

        {step === 'form' ? (
            <form onSubmit={handleSubmit} className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Agendar Visita</h3>
                <p className="text-sm text-gray-500 mb-6">{property.title}</p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-brand-500" /> Selecione a Data
                        </label>
                        <input 
                            type="date" 
                            min={minDate}
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-brand-500" /> Selecione a Hora
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {timeSlots.map(slot => (
                                <button
                                    key={slot}
                                    type="button"
                                    onClick={() => setTime(slot)}
                                    className={`py-2 text-sm rounded-md transition-colors ${
                                        time === slot 
                                        ? 'bg-brand-500 text-white font-bold' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {slot}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <MessageSquare className="w-4 h-4 mr-2 text-brand-500" /> Mensagem (Opcional)
                        </label>
                        <textarea 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Alguma dúvida específica ou preferência?"
                            className="w-full p-3 border border-gray-300 rounded-lg h-24 resize-none focus:ring-brand-500 focus:border-brand-500"
                        />
                    </div>
                </div>

                <button 
                    type="submit"
                    disabled={!date || !time}
                    className="w-full mt-6 bg-brand-500 text-white py-3 rounded-lg font-bold hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all"
                >
                    Solicitar Agendamento
                </button>
            </form>
        ) : (
            <div className="p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Pedido Enviado!</h3>
                <p className="text-gray-600 mb-6">
                    O proprietário recebeu a sua solicitação para dia <strong>{new Date(date).toLocaleDateString()}</strong> às <strong>{time}</strong>.
                    <br/>Receberá uma confirmação em breve.
                </p>
                <button 
                    onClick={handleClose}
                    className="bg-gray-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors"
                >
                    Fechar
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default SchedulingModal;
