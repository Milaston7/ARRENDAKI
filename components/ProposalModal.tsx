
import React, { useState } from 'react';
import { X, FileText, Calendar, DollarSign, Clock, ShieldCheck, CheckCircle } from 'lucide-react';
import { Proposal } from '../types';

interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (proposal: Proposal) => void;
}

const ProposalModal: React.FC<ProposalModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [value, setValue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState('12');
  const [deposit, setDeposit] = useState('');
  const [conditions, setConditions] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value || !startDate || !deposit) return;

    onSubmit({
        value: Number(value),
        startDate,
        duration,
        deposit: Number(deposit),
        conditions
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-brand-600 text-white p-4 flex justify-between items-center shrink-0">
            <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-brand-100"/>
                <span className="font-bold text-lg">Proposta Formal Kiá</span>
            </div>
            <button onClick={onClose} className="text-brand-100 hover:text-white transition-colors">
                <X className="w-6 h-6" />
            </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                <h4 className="text-blue-800 font-bold flex items-center text-sm mb-2">
                    <ShieldCheck className="w-4 h-4 mr-2" /> Porquê usar a Proposta Formal?
                </h4>
                <ul className="text-xs text-blue-700 space-y-1 list-disc pl-4">
                    <li>Regista legalmente o acordo final.</li>
                    <li>Garante que os termos negociados no chat não sofrem alterações.</li>
                    <li>Inicia o processo <strong>Kiá Verify</strong> e a transação segura.</li>
                </ul>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Valor Mensal / Preço (AOA) <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                            <input 
                                type="number" 
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 font-bold text-gray-900"
                                placeholder="0.00"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Caução / Sinal (AOA) <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                            <input 
                                type="number" 
                                value={deposit}
                                onChange={(e) => setDeposit(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500"
                                placeholder="0.00"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Data de Início <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                            <input 
                                type="date" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 text-sm"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Prazo do Contrato <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                            <select 
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 text-sm bg-white"
                            >
                                <option value="6">6 Meses</option>
                                <option value="12">12 Meses (1 Ano)</option>
                                <option value="24">24 Meses (2 Anos)</option>
                                <option value="venda">Venda (Definitivo)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Condições Adicionais Negociadas</label>
                    <textarea 
                        value={conditions}
                        onChange={(e) => setConditions(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg h-24 text-sm focus:ring-brand-500 focus:border-brand-500 resize-none"
                        placeholder='Ex: "Inclui despesas de condomínio", "Pintura nova antes da entrega", "Mobília da sala incluída"...'
                    ></textarea>
                    <p className="text-[10px] text-gray-500 mt-1">Estas condições serão incluídas no Contrato Kiá final.</p>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end space-x-3">
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 font-bold text-sm hover:bg-gray-100 rounded-lg"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit"
                        className="px-6 py-2 bg-brand-500 text-white font-bold rounded-lg hover:bg-brand-600 shadow-md flex items-center"
                    >
                        <CheckCircle className="w-4 h-4 mr-2" /> Enviar Proposta Formal
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default ProposalModal;
