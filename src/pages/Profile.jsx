import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'cadastro';
  const { user, userProfile, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    nome: '',
    email: '',
    foto: '',
    endereco: '',
    telefone: '',
  });
  const [orders, setOrders] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setForm({
        nome: userProfile.nome || '',
        email: userProfile.email || user?.email || '',
        foto: userProfile.foto || '',
        endereco: userProfile.endereco || '',
        telefone: userProfile.telefone || '',
      });
    }
  }, [userProfile, user?.email]);

  useEffect(() => {
    if (tab === 'orders' && user?.uid) {
      setLoadingOrders(true);
      getDocs(query(collection(db, 'Orders'), where('userId', '==', user.uid)))
        .then((snap) => {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
          setOrders(list);
        })
        .finally(() => setLoadingOrders(false));
    }
  }, [tab, user?.uid]);

  async function handleSave(e) {
    e.preventDefault();
    if (!user?.uid) return;
    setSaving(true);
    try {
      const ref = doc(db, 'Users', user.uid);
      await updateDoc(ref, {
        nome: form.nome,
        endereco: form.endereco,
        telefone: form.telefone,
        foto: form.foto,
      });
      await refreshProfile();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Faça login para acessar seu perfil.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Meu perfil</h1>
      <div className="flex gap-2 mb-8 border-b border-gray-200">
        <Link
          to="/profile"
          className={`px-4 py-2 rounded-t-xl font-medium ${
            tab !== 'orders'
              ? 'bg-primary-50 text-primary-600 border-b-2 border-primary-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Cadastro
        </Link>
        <Link
          to="/profile?tab=orders"
          className={`px-4 py-2 rounded-t-xl font-medium ${
            tab === 'orders'
              ? 'bg-primary-50 text-primary-600 border-b-2 border-primary-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Meus Pedidos
        </Link>
      </div>

      {tab !== 'orders' ? (
        <form onSubmit={handleSave} className="space-y-6 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Foto (URL)</label>
            <input
              type="url"
              value={form.foto}
              onChange={(e) => setForm((f) => ({ ...f, foto: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-400 outline-none"
            />
            {form.foto && (
              <img
                src={form.foto}
                alt=""
                className="mt-2 w-20 h-20 rounded-full object-cover"
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-400 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input
              type="email"
              value={form.email}
              readOnly
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-surface-50 text-gray-500"
            />
            <p className="text-xs text-gray-400 mt-1">Alteração de e-mail não disponível aqui.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
            <input
              type="text"
              value={form.endereco}
              onChange={(e) => setForm((f) => ({ ...f, endereco: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-400 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
            <input
              type="tel"
              value={form.telefone}
              onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-400 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          {loadingOrders ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full" />
            </div>
          ) : orders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhum pedido encontrado.</p>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm text-gray-500">Pedido #{order.id.slice(-8)}</span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary-50 text-primary-600">
                    {order.status}
                  </span>
                </div>
                <ul className="space-y-2 text-gray-700">
                  {order.items?.map((item, i) => (
                    <li key={i}>
                      {item.name} × {item.quantity} — R$ {(item.price * item.quantity).toFixed(2)}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 font-semibold text-primary-600">
                  Total: R$ {typeof order.total === 'number' ? order.total.toFixed(2) : order.total}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
