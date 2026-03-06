import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

const categoryLabel = {
  masculino: 'Masculino',
  feminino: 'Feminino',
  kids: 'Kids',
};

export default function Category() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const q = slug
        ? query(collection(db, 'Products'), where('categoria', '==', slug))
        : collection(db, 'Products');
      const snap = await getDocs(q);
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const title = slug ? categoryLabel[slug] || slug : 'Todos';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{title}</h1>
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
      {products.length === 0 && (
        <p className="text-gray-500 text-center py-12">Nenhum produto nesta categoria.</p>
      )}
    </div>
  );
}
