import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export default function Home() {
  const { searchQuery } = useOutletContext() || {};
  const [products, setProducts] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    async function load() {
      const snap = await getDocs(
        query(
          collection(db, 'Products'),
          orderBy('createdAt', 'desc'),
          limit(20)
        )
      );
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setProducts(list);
      const top = list.slice(0, 5);
      setFeatured(top);
      setActiveIndex(0);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (!featured.length) return;
    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % featured.length);
    }, 5000);
    return () => clearInterval(id);
  }, [featured.length]);

  const filtered = searchQuery
    ? products.filter(
        (p) =>
          p.nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.marca?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.categoria?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pb-16">
      {/* Hero carrossel - até 5 em destaque com setas e seletor */}
      {featured.length > 0 && (
        <section className="rounded-3xl overflow-hidden shadow-lg mb-12 bg-surface-100 relative">
          <div className="relative h-[320px] sm:h-[420px] overflow-hidden">
            {/* Faixa deslizante: uma slide “empurra” a outra */}
            <div
              className="carousel-track flex h-full"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {featured.map((item) => (
                <div
                  key={item.id}
                  className="w-full shrink-0 h-full flex flex-col-reverse sm:flex-row items-center sm:justify-between gap-4 sm:gap-8 px-4 sm:px-12"
                >
                  <Link
                    to={`/produto/${item.id}`}
                    className="flex flex-col-reverse sm:flex-row items-center sm:justify-between gap-4 sm:gap-8 w-full"
                  >
                    <div className="flex-1 max-w-md text-center sm:text-left">
                      <h2 className="text-xl sm:text-3xl font-bold text-gray-800 mb-2">
                        {item.nome}
                      </h2>
                      <p className="text-primary-600 font-semibold text-base sm:text-lg">
                        R$ {typeof item.preco === 'number' ? item.preco.toFixed(2) : item.preco}
                      </p>
                      <span className="inline-block mt-4 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-medium transition-transform duration-300 hover:scale-105">
                        Ver produto
                      </span>
                    </div>
                    <div className="w-40 h-40 sm:w-64 sm:h-64 rounded-2xl overflow-hidden shrink-0 bg-white shadow-inner mb-4 sm:mb-0">
                      {item.fotos?.[0] && (
                        <img
                          src={item.fotos[0]}
                          alt={item.nome}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            {/* Setas anterior / próximo */}
            <button
              type="button"
              onClick={() => setActiveIndex((prev) => (prev === 0 ? featured.length - 1 : prev - 1))}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-white/90 shadow-md hover:bg-white hover:shadow-lg text-gray-700 transition-all duration-300"
              aria-label="Slide anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={() => setActiveIndex((prev) => (prev + 1) % featured.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-white/90 shadow-md hover:bg-white hover:shadow-lg text-gray-700 transition-all duration-300"
              aria-label="Próximo slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Seletor (dots) */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {featured.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  idx === activeIndex
                    ? 'bg-primary-500 scale-125'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Ir para slide ${idx + 1}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* Grid de produtos */}
      <section>
        <div className="inline-block px-4 py-2 bg-white rounded-xl border border-gray-200 mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {searchQuery ? `Resultados para "${searchQuery}"` : 'Produtos'}
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filtered.map((product) => (
            <Link
              key={product.id}
              to={`/produto/${product.id}`}
              className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md hover:border-primary-200 transition-all"
            >
              <div className="aspect-square bg-surface-100 relative overflow-hidden">
                {product.fotos?.[0] ? (
                  <img
                    src={product.fotos[0]}
                    alt={product.nome}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    Sem imagem
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-800 truncate">{product.nome}</h3>
                <p className="text-primary-600 font-semibold mt-1">
                  R$ {typeof product.preco === 'number' ? product.preco.toFixed(2) : product.preco}
                </p>
              </div>
            </Link>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-gray-500 text-center py-12">Nenhum produto encontrado.</p>
        )}
      </section>
    </div>
  );
}
