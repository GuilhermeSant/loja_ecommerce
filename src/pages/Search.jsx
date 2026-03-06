import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

export default function Search() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!q.trim()) {
      setProducts([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      const snap = await getDocs(
        query(
          collection(db, 'Products'),
          orderBy('createdAt', 'desc'),
          limit(100)
        )
      );
      if (cancelled) return;
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const term = q.toLowerCase().trim();
      const filtered = list.filter(
        (p) =>
          p.nome?.toLowerCase().includes(term) ||
          p.marca?.toLowerCase().includes(term) ||
          p.categoria?.toLowerCase().includes(term)
      );
      setProducts(filtered);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [q]);

  if (!q.trim()) {
    return (
      <div className="w-full px-4 py-12 text-center text-gray-500">
        <p>Digite algo na busca para ver os resultados.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full px-4 py-12 flex justify-center">
        <div className="animate-spin w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-8">
      <h1 className="text-xl font-bold text-gray-800 mb-4">
        Resultados para &quot;{q}&quot;
      </h1>
      {products.length === 0 ? (
        <p className="text-gray-500 py-8">Nenhum produto encontrado.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {products.map((product) => (
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
      )}
    </div>
  );
}
