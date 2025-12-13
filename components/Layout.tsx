import React from 'react';
import Navbar from './Navbar';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onNavigate: (view: string) => void;
  onLoginClick: () => void;
  onLogout: () => void;
  currentView: string;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onNavigate, onLoginClick, onLogout, currentView }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar user={user} onNavigate={onNavigate} onLoginClick={onLoginClick} onLogout={onLogout} currentView={currentView} />
      <main className="flex-grow">
        {children}
      </main>
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center sm:text-left grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
                <h3 className="text-xl font-bold mb-4">Arrendaki</h3>
                <p className="text-gray-400 text-sm">O futuro do imobiliário em Angola.</p>
            </div>
            <div>
                <h4 className="font-bold mb-4">Empresa</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                    <li>Sobre Nós</li>
                    <li>Termos de Uso</li>
                    <li>Privacidade</li>
                </ul>
            </div>
            <div>
                <h4 className="font-bold mb-4">Serviços</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                    <li>Transação Garantida</li>
                    <li>Kiá Verify</li>
                    <li>Kiá Contract</li>
                </ul>
            </div>
            <div>
                <h4 className="font-bold mb-4">Contactos</h4>
                <p className="text-gray-400 text-sm">Luanda, Angola</p>
                <p className="text-gray-400 text-sm">suporte@arrendaki.ao</p>
            </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-gray-800 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} Arrendaki. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};

export default Layout;