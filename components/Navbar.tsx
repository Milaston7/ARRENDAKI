
import React from 'react';
import { User, PlusCircle, MessageSquare, Menu, X, Settings, LayoutDashboard, BookOpen, Info, Activity } from 'lucide-react';
import { User as UserType } from '../types';
import Logo from './Logo';

interface NavbarProps {
  user: UserType | null;
  onNavigate: (view: string) => void;
  onLoginClick: () => void;
  onLogout: () => void;
  currentView: string;
}

const Navbar: React.FC<NavbarProps> = ({ user, onNavigate, onLoginClick, onLogout, currentView }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navItemClass = (view: string) => 
    `flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      currentView === view 
        ? 'bg-brand-50 text-brand-600' 
        : 'text-gray-600 hover:text-brand-500 hover:bg-gray-50'
    }`;

  const isInternal = user?.group === 'internal';

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center cursor-pointer group" onClick={() => onNavigate('home')}>
            <Logo className="h-10 w-auto" />
            
            {/* System Status Indicator (Simulated Real-Time) */}
            <div className="flex items-center space-x-1 mt-1 ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                </span>
                <span className="text-[9px] text-gray-400 font-medium uppercase tracking-wide">Live</span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            
            {/* Group A (External) Links */}
            {!isInternal && (
              <>
                <button onClick={() => onNavigate('home')} className={navItemClass('home')}>
                  <span>Explorar</span>
                </button>

                <button onClick={() => onNavigate('about')} className={navItemClass('about')}>
                  <Info className="h-4 w-4" />
                  <span>Sobre Nós</span>
                </button>

                <button onClick={() => onNavigate('blog')} className={navItemClass('blog')}>
                  <BookOpen className="h-4 w-4" />
                  <span>Blog</span>
                </button>
                
                {(user?.role === 'owner' || user?.role === 'broker' || user?.role === 'legal_rep') && (
                  <button onClick={() => onNavigate('add-property')} className={navItemClass('add-property')}>
                    <PlusCircle className="h-4 w-4" />
                    <span>Anunciar Imóvel</span>
                  </button>
                )}

                {user && (
                   <button onClick={() => onNavigate('chat')} className={navItemClass('chat')}>
                     <MessageSquare className="h-4 w-4" />
                     <span>Mensagens</span>
                   </button>
                )}
              </>
            )}

            {/* Group B (Internal) Links */}
            {isInternal && (
              <button onClick={() => onNavigate('admin')} className={navItemClass('admin')}>
                <LayoutDashboard className="h-4 w-4" />
                <span>Admin Panel (Staff)</span>
              </button>
            )}

            {/* User Profile / Login */}
            {user ? (
              <div className="flex items-center ml-4 space-x-4">
                {!isInternal && (
                  <button 
                    onClick={() => onNavigate('profile')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-colors ${currentView === 'profile' ? 'bg-gray-100 ring-2 ring-brand-200' : 'hover:bg-gray-50'}`}
                  >
                      <div className="h-8 w-8 bg-brand-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                          {user.profileImage ? (
                              <img src={user.profileImage} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
                          ) : (
                              user.name.charAt(0)
                          )}
                      </div>
                      <div className="flex flex-col items-start">
                          <span className="text-sm font-semibold text-gray-800 leading-none">{user.name.split(' ')[0]}</span>
                          <span className="text-[10px] text-gray-500 capitalize leading-none mt-1">{user.role.replace('_', ' ')}</span>
                      </div>
                  </button>
                )}
                {isInternal && (
                   <div className="flex flex-col items-end mr-2">
                      <span className="text-sm font-bold text-gray-800">{user.name}</span>
                      <span className="text-[10px] bg-gray-200 px-2 rounded-full text-gray-600 uppercase font-bold">{user.role.replace('_', ' ')}</span>
                   </div>
                )}
                <button 
                  onClick={onLogout}
                  className="text-sm text-red-500 hover:text-red-700 font-medium"
                >
                  Sair
                </button>
              </div>
            ) : (
              <button 
                onClick={onLoginClick}
                className="ml-4 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center"
              >
                <User className="h-4 w-4 mr-2" />
                Entrar / Registar
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu with Smooth Transition */}
      <div 
        className={`md:hidden bg-white border-gray-100 overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-screen opacity-100 border-t' : 'max-h-0 opacity-0 border-none'
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
           
           {!isInternal && (
              <>
                 <button onClick={() => {onNavigate('home'); setIsMenuOpen(false)}} className={`w-full text-left ${navItemClass('home')}`}>
                  Explorar
                </button>
                 <button onClick={() => {onNavigate('about'); setIsMenuOpen(false)}} className={`w-full text-left ${navItemClass('about')}`}>
                  Sobre Nós
                </button>
                 <button onClick={() => {onNavigate('blog'); setIsMenuOpen(false)}} className={`w-full text-left ${navItemClass('blog')}`}>
                  Blog
                </button>
                {(user?.role === 'owner' || user?.role === 'broker' || user?.role === 'legal_rep') && (
                  <button onClick={() => {onNavigate('add-property'); setIsMenuOpen(false)}} className={`w-full text-left ${navItemClass('add-property')}`}>
                    Anunciar Imóvel
                  </button>
                )}
                {user && (
                   <button onClick={() => {onNavigate('chat'); setIsMenuOpen(false)}} className={`w-full text-left ${navItemClass('chat')}`}>
                     Mensagens
                   </button>
                )}
                {user && (
                   <button onClick={() => {onNavigate('profile'); setIsMenuOpen(false)}} className={`w-full text-left ${navItemClass('profile')}`}>
                     Minha Conta / Perfil
                   </button>
                )}
              </>
           )}

           {isInternal && (
            <button onClick={() => {onNavigate('admin'); setIsMenuOpen(false)}} className={`w-full text-left ${navItemClass('admin')}`}>
              Admin Panel (Staff)
            </button>
          )}

          {!user && (
            <button onClick={() => {onLoginClick(); setIsMenuOpen(false)}} className="w-full text-left px-3 py-2 text-brand-600 font-bold">
              Entrar / Registar
            </button>
          )}
           {user && (
            <button onClick={() => {onLogout(); setIsMenuOpen(false)}} className="w-full text-left px-3 py-2 text-red-600 font-bold">
              Sair
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
