import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { Star, Share2 } from 'lucide-react';
import { db } from '../firebase';
import { useCart } from '../contexts/CartContext';

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, 'Products', id));
      if (snap.exists()) {
        setProduct({ id: snap.id, ...snap.data() });
        setSelectedSize(snap.data().tamanhos?.[0] || '');
        setSelectedColor(snap.data().cores?.[0] || '');
      }
    }
    if (id) load();
  }, [id]);

  function handleShare() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 1000);
    });
  }

  function handleBuy() {
    if (!product) return;
    const size = selectedSize || product.tamanhos?.[0];
    const color = selectedColor || product.cores?.[0];
    addItem({
      productId: product.id,
      name: product.nome,
      price: product.preco,
      image: product.fotos?.[0],
      size,
      color,
      quantity: 1,
    });
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const photos = product.fotos?.length ? product.fotos : [null];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Centro: foto principal + miniaturas */}
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden bg-surface-100 relative group">
            {photos[selectedImage] ? (
              <img
                src={photos[selectedImage]}
                alt={product.nome}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                Sem imagem
              </div>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {photos.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedImage(i)}
                className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                  selectedImage === i ? 'border-primary-500' : 'border-gray-200'
                }`}
              >
                {src ? (
                  <img src={src} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-surface-200" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-[1fr,1fr] lg:gap-x-8">
          {/* Esquerda: estrelas, detalhes, compartilhar - janela com fundo branco */}
          <div className="space-y-4 mb-8 lg:mb-0 p-6 rounded-2xl border border-gray-200 bg-white">
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <span className="text-gray-500 text-sm">(0 avaliações)</span>
            </div>
            <dl className="space-y-2 text-sm">
              {product.marca && (
                <>
                  <dt className="text-gray-500">Marca</dt>
                  <dd className="font-medium text-gray-800">{product.marca}</dd>
                </>
              )}
              {product.material && (
                <>
                  <dt className="text-gray-500">Material</dt>
                  <dd className="font-medium text-gray-800">{product.material}</dd>
                </>
              )}
              {product.estilo && (
                <>
                  <dt className="text-gray-500">Estilo</dt>
                  <dd className="font-medium text-gray-800">{product.estilo}</dd>
                </>
              )}
            </dl>
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-2 text-gray-600 hover:text-primary-600"
            >
              <Share2 className="w-4 h-4" />
              {linkCopied ? (
                <span className="text-green-600">Link copiado!</span>
              ) : (
                'Compartilhar'
              )}
            </button>
          </div>

          {/* Direita: nome, cor, tamanho, preço, comprar - janela com fundo branco */}
          <div className="space-y-6 p-6 rounded-2xl border border-gray-200 bg-white">
            <h1 className="text-2xl font-bold text-gray-800">{product.nome}</h1>

            {product.cores?.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Cor</p>
                <div className="flex flex-wrap gap-2">
                  {product.cores.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className={`px-4 py-2 rounded-xl border-2 text-sm font-medium ${
                        selectedColor === c
                          ? 'border-primary-500 text-primary-600 bg-primary-50'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.tamanhos?.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Tamanho</p>
                <div className="flex flex-wrap gap-2">
                  {product.tamanhos.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedSize(t)}
                      className={`px-4 py-2 rounded-xl border-2 text-sm font-medium ${
                        selectedSize === t
                          ? 'border-primary-500 text-primary-600 bg-primary-50'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="text-2xl font-bold text-primary-600">
              R$ {typeof product.preco === 'number' ? product.preco.toFixed(2) : product.preco}
            </p>

            <button
              type="button"
              onClick={handleBuy}
              className="w-full py-4 rounded-2xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors"
            >
              Comprar
            </button>
          </div>
        </div>
      </div>

      {/* Descrição logo abaixo de comprar/compartilhar - fundo branco e tamanho maior */}
      <div className="mt-8 p-8 rounded-2xl border border-gray-200 bg-white">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Descrição</h3>
        <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-wrap">
          {product.descricao || 'Sem descrição.'}
        </p>
      </div>

      {/* Avaliações */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Avaliações</h3>
        <p className="text-gray-500">Nenhuma avaliação ainda.</p>
      </div>
    </div>
  );
}
