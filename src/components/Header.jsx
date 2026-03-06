import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingCart, User, FileText, LogOut, ChevronDown, X } from 'lucide-react';
import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import LoginModal from './LoginModal';

export default function Header({ searchQuery, onSearchChange }) {
  const navigate = useNavigate();
  const { user, userProfile, signOut, isAdmin } = useAuth();
  const { items, removeItem, totalItems } = useCart();
  const [loginOpen, setLoginOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [cartDropdown, setCartDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const searchRef = useRef(null);
  const cartRef = useRef(null);
  const mobileSearchInputRef = useRef(null);

  useEffect(() => {
    if (searchOverlayOpen && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus();
    }
  }, [searchOverlayOpen]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchDropdownOpen(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const snap = await getDocs(
        query(
          collection(db, 'Products'),
          orderBy('createdAt', 'desc'),
          limit(50)
        )
      );
      if (cancelled) return;
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const q = searchQuery.toLowerCase().trim();
      const filtered = list.filter(
        (p) =>
          p.nome?.toLowerCase().includes(q) ||
          p.marca?.toLowerCase().includes(q) ||
          p.categoria?.toLowerCase().includes(q)
      );
      setSearchResults(filtered.slice(0, 8));
      setSearchDropdownOpen(true);
    })();
    return () => { cancelled = true; };
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchDropdownOpen(false);
      }
      if (cartRef.current && !cartRef.current.contains(e.target)) {
        setCartDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleMobileSearchSubmit(e) {
    e.preventDefault();
    const term = mobileSearchQuery.trim();
    if (term) {
      navigate(`/busca?q=${encodeURIComponent(term)}`);
      setSearchOverlayOpen(false);
      setMobileSearchQuery('');
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm w-full">
        <div className="w-full px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <span className="text-2xl font-bold text-primary-600">Loja</span>
              <span className="text-2xl font-bold text-gray-700">Fashion</span>
            </Link>

            {/* Desktop: campo de busca */}
            <div className="flex-1 max-w-xl mx-4 hidden md:block" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="search"
                  placeholder="Buscar produtos..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onFocus={() => searchQuery.trim() && setSearchDropdownOpen(true)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none bg-surface-50 transition-all duration-300"
                />
                {searchDropdownOpen && searchQuery.trim() && (
                  <div className="absolute left-0 right-0 top-full mt-1 py-2 bg-white rounded-2xl shadow-xl border-2 border-gray-200 max-h-80 overflow-auto z-50">
                    {searchResults.length === 0 ? (
                      <p className="px-4 py-3 text-gray-500 text-sm">Nenhum produto encontrado.</p>
                    ) : (
                      <ul className="divide-y divide-gray-100">
                        {searchResults.map((p) => (
                          <li key={p.id}>
                            <Link
                              to={`/produto/${p.id}`}
                              onClick={() => { setSearchDropdownOpen(false); onSearchChange(''); }}
                              className="flex items-center gap-3 px-4 py-3 hover:bg-surface-50 transition-colors duration-300"
                            >
                              <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-100 shrink-0">
                                {p.fotos?.[0] ? (
                                  <img src={p.fotos[0]} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Sem img</div>
                                )}
                              </div>
                              <span className="font-medium text-gray-800 truncate flex-1">{p.nome}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile: só ícone da lupa; clique abre overlay */}
            <div className="md:hidden">
              <button
                type="button"
                onClick={() => setSearchOverlayOpen(true)}
                className="p-2.5 rounded-xl hover:bg-surface-100 text-gray-600"
                aria-label="Buscar"
              >
                <Search className="w-6 h-6" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/wishlist"
                className="p-2.5 rounded-xl hover:bg-surface-100 text-gray-600"
                aria-label="Lista de desejos"
              >
                <Heart className="w-5 h-5" />
              </Link>

              {user ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setUserDropdown(!userDropdown)}
                    className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-surface-100 text-gray-700"
                  >
                    {userProfile?.foto ? (
                      <img
                        src={userProfile.foto}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                    <span className="hidden sm:inline max-w-[120px] truncate">
                      {userProfile?.nome || user.email}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {userDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setUserDropdown(false)}
                      />
                      <div className="absolute right-0 mt-1 w-56 py-2 bg-white rounded-2xl shadow-lg border border-gray-100 z-20">
                        <Link
                          to="/profile"
                          className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-surface-50"
                          onClick={() => setUserDropdown(false)}
                        >
                          <User className="w-4 h-4" /> Meu Cadastro
                        </Link>
                        <Link
                          to="/profile?tab=orders"
                          className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-surface-50"
                          onClick={() => setUserDropdown(false)}
                        >
                          <FileText className="w-4 h-4" /> Meus Pedidos
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2 px-4 py-2.5 text-primary-600 hover:bg-primary-50"
                            onClick={() => setUserDropdown(false)}
                          >
                            Admin
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            signOut();
                            setUserDropdown(false);
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4" /> Sair
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setLoginOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600"
                >
                  <User className="w-4 h-4" /> Login
                </button>
              )}

              <div className="relative" ref={cartRef}>
                <button
                  type="button"
                  onClick={() => setCartDropdown(!cartDropdown)}
                  className="relative p-2.5 rounded-xl hover:bg-surface-100 text-gray-600"
                  aria-label="Ver prévia do carrinho"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center font-medium">
                      {totalItems}
                    </span>
                  )}
                </button>
                {cartDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-80 max-h-96 overflow-auto bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-30">
                    {items.length === 0 ? (
                      <p className="px-4 py-6 text-gray-500 text-center">Carrinho vazio</p>
                    ) : (
                      <ul className="divide-y divide-gray-100">
                        {items.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-50">
                            {item.image && (
                              <img
                                src={item.image}
                                alt=""
                                className="w-14 h-14 rounded-xl object-cover shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-800 truncate">{item.name}</p>
                              <p className="text-sm text-primary-600">
                                R$ {typeof item.price === 'number' ? item.price.toFixed(2) : item.price} × {item.quantity}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(item.productId, item.size, item.color)}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                              aria-label="Remover"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    {items.length > 0 && (
                      <div className="p-3 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => { navigate('/cart'); setCartDropdown(false); }}
                          className="w-full py-2.5 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600"
                        >
                          Abrir carrinho
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <nav className="border-t border-gray-100 bg-white w-full">
          <div className="w-full px-4 flex items-center gap-6 h-12">
            <Link
              to="/"
              className="text-gray-700 font-medium hover:text-primary-600 rounded-lg px-2 py-1"
            >
              Home
            </Link>
            <div className="relative group">
              <button
                type="button"
                className="flex items-center gap-1 text-gray-700 font-medium hover:text-primary-600 rounded-lg px-2 py-1"
              >
                Categorias <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute left-0 top-full pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 py-2 min-w-[160px]">
                  <Link
                    to="/categoria/masculino"
                    className="block px-4 py-2 text-gray-700 hover:bg-surface-50 rounded-lg mx-1"
                  >
                    Masculino
                  </Link>
                  <Link
                    to="/categoria/feminino"
                    className="block px-4 py-2 text-gray-700 hover:bg-surface-50 rounded-lg mx-1"
                  >
                    Feminino
                  </Link>
                  <Link
                    to="/categoria/kids"
                    className="block px-4 py-2 text-gray-700 hover:bg-surface-50 rounded-lg mx-1"
                  >
                    Kids
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Overlay de busca mobile: campo grande + teclado */}
      {searchOverlayOpen && (
        <div className="fixed inset-0 z-50 bg-white md:hidden">
          <form onSubmit={handleMobileSearchSubmit} className="flex flex-col h-full">
            <div className="flex items-center gap-2 p-4 border-b border-gray-100">
              <button
                type="button"
                onClick={() => { setSearchOverlayOpen(false); setMobileSearchQuery(''); }}
                className="p-2 rounded-xl hover:bg-surface-100 text-gray-600"
                aria-label="Fechar"
              >
                <X className="w-6 h-6" />
              </button>
              <input
                ref={mobileSearchInputRef}
                type="search"
                inputMode="search"
                autoComplete="off"
                placeholder="Buscar produtos..."
                value={mobileSearchQuery}
                onChange={(e) => setMobileSearchQuery(e.target.value)}
                className="flex-1 min-w-0 py-3 px-4 text-base rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none"
              />
              <button
                type="submit"
                className="py-3 px-5 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600"
              >
                Buscar
              </button>
            </div>
          </form>
        </div>
      )}

      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
