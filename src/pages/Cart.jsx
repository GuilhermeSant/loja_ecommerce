import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

export default function Cart() {
  const navigate = useNavigate();
  const { items, removeItem, setQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const [finishing, setFinishing] = useState(false);

  const subtotal = items.reduce((acc, i) => acc + (Number(i.price) || 0) * i.quantity, 0);

  async function handleCheckout() {
    if (!user) {
      navigate('/');
      return;
    }
    setFinishing(true);
    try {
      const { collection, addDoc } = await import('firebase/firestore');
      const { db } = await import('../firebase');
      await addDoc(collection(db, 'Orders'), {
        userId: user.uid,
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          size: i.size,
          color: i.color,
        })),
        total: subtotal,
        status: 'Entregue',
        createdAt: new Date().toISOString(),
      });
      clearCart();
      navigate('/profile?tab=orders');
    } catch (err) {
      console.error(err);
    } finally {
      setFinishing(false);
    }
  }

  if (items.length === 0 && !finishing) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Carrinho vazio</h1>
        <p className="text-gray-500 mb-6">Adicione produtos para finalizar sua compra.</p>
        <Link
          to="/"
          className="inline-block px-6 py-3 rounded-2xl bg-primary-500 text-white font-medium hover:bg-primary-600"
        >
          Continuar comprando
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Carrinho</h1>
      <div className="space-y-4">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm"
          >
            {item.image ? (
              <img
                src={item.image}
                alt=""
                className="w-24 h-24 rounded-xl object-cover shrink-0"
              />
            ) : (
              <div className="w-24 h-24 rounded-xl bg-surface-200 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 truncate">{item.name}</p>
              <p className="text-sm text-gray-500">
                {item.color && `${item.color} • `}
                {item.size && `Tam. ${item.size}`}
              </p>
              <p className="text-primary-600 font-semibold mt-1">
                R$ {typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setQuantity(
                    item.productId,
                    item.size,
                    item.color,
                    item.quantity - 1
                  )
                }
                className="p-2 rounded-lg hover:bg-surface-100"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-medium">{item.quantity}</span>
              <button
                type="button"
                onClick={() =>
                  setQuantity(
                    item.productId,
                    item.size,
                    item.color,
                    item.quantity + 1
                  )
                }
                className="p-2 rounded-lg hover:bg-surface-100"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => removeItem(item.productId, item.size, item.color)}
              className="p-2 rounded-lg text-red-500 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-8 p-6 bg-white rounded-2xl border border-gray-100">
        <div className="flex justify-between text-lg font-semibold text-gray-800">
          <span>Total</span>
          <span>R$ {subtotal.toFixed(2)}</span>
        </div>
        <button
          type="button"
          onClick={handleCheckout}
          disabled={finishing}
          className="mt-6 w-full py-4 rounded-2xl bg-primary-500 text-white font-semibold hover:bg-primary-600 disabled:opacity-50"
        >
          {finishing ? 'Finalizando...' : 'Finalizar compra'}
        </button>
      </div>
    </div>
  );
}
