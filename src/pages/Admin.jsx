import { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';

// Upload gratuito via ImgBB (api.imgbb.com) — crie uma API key grátis e coloque no .env como VITE_IMGBB_API_KEY
async function uploadToImgBB(file) {
  const key = import.meta.env.VITE_IMGBB_API_KEY;
  if (!key) return null;
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const body = new FormData();
  body.set('key', key);
  body.append('image', base64.replace(/^data:image\/\w+;base64,/, ''));
  const res = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Falha no upload');
  return data.data?.url || data.data?.display_url || null;
}
import { UserPlus, Trash2, Edit2, Plus, X } from 'lucide-react';

const CATEGORIAS = ['Masculino', 'Feminino', 'Infantil', 'Unissex'];
const MATERIAIS = ['Algodão', 'Poliéster', 'Jeans', 'Malha', 'Seda', 'Brim', 'Outro'];
const TAMANHOS = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'Único'];
const CORES = [
  { nome: 'Preto', hex: '#000000' },
  { nome: 'Branco', hex: '#ffffff' },
  { nome: 'Azul', hex: '#2563eb' },
  { nome: 'Vermelho', hex: '#dc2626' },
  { nome: 'Verde', hex: '#16a34a' },
  { nome: 'Amarelo', hex: '#eab308' },
  { nome: 'Rosa', hex: '#ec4899' },
  { nome: 'Cinza', hex: '#6b7280' },
  { nome: 'Marrom', hex: '#92400e' },
  { nome: 'Bege', hex: '#d4b896' },
  { nome: 'Laranja', hex: '#ea580c' },
];

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [tab, setTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [productForm, setProductForm] = useState({
    nome: '',
    preco: '',
    descricao: '',
    marca: '',
    material: '',
    estilo: '',
    categoria: '',
    fotos: ['', '', '', ''],
    tamanhos: [],
    cores: [],
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [showProductForm, setShowProductForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingPhotoIndex, setUploadingPhotoIndex] = useState(null);

  async function loadUsers() {
    const snap = await getDocs(collection(db, 'Users'));
    setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }

  async function loadProducts() {
    const snap = await getDocs(collection(db, 'Products'));
    setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([loadUsers(), loadProducts()]);
      setLoading(false);
    })();
  }, []);

  async function handleBlockUser(userId, bloqueado) {
    await updateDoc(doc(db, 'Users', userId), { bloqueado });
    await loadUsers();
  }

  async function handleDeleteUser(userId) {
    if (!confirm('Excluir este usuário? Não é possível desfazer.')) return;
    await deleteDoc(doc(db, 'Users', userId));
    await loadUsers();
  }

  async function handleAddUser(e) {
    e.preventDefault();
    try {
      const cred = await createUserWithEmailAndPassword(auth, newUserEmail, newUserPassword);
      await setDoc(doc(db, 'Users', cred.user.uid), {
        nome: newUserName,
        email: newUserEmail,
        foto: '',
        role: 'user',
        endereco: '',
        telefone: '',
        bloqueado: false,
        createdAt: new Date().toISOString(),
      });
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserName('');
      await loadUsers();
    } catch (err) {
      alert(err.message);
    }
  }

  function openProductForm(product = null) {
    setShowProductForm(true);
    if (product) {
      setEditingProduct(product.id);
      setProductForm({
        nome: product.nome || '',
        preco: product.preco ?? '',
        descricao: product.descricao || '',
        marca: product.marca || '',
        material: product.material || '',
        estilo: product.estilo || '',
        categoria: product.categoria || '',
        fotos: (product.fotos && [...product.fotos]) || ['', '', '', ''],
        tamanhos: Array.isArray(product.tamanhos) ? [...product.tamanhos] : (typeof product.tamanhos === 'string' ? product.tamanhos.split(',').map((t) => t.trim()).filter(Boolean) : []),
        cores: Array.isArray(product.cores) ? [...product.cores] : (typeof product.cores === 'string' ? product.cores.split(',').map((c) => c.trim()).filter(Boolean) : []),
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        nome: '',
        preco: '',
        descricao: '',
        marca: '',
        material: '',
        estilo: '',
        categoria: '',
        fotos: ['', '', '', ''],
        tamanhos: [],
        cores: [],
      });
    }
  }

  function closeProductForm() {
    setEditingProduct(null);
    setShowProductForm(false);
  }

  async function saveProduct(e) {
    e.preventDefault();
    setUploading(true);
    try {
      const fotos = (productForm.fotos || ['', '', '', '']).filter(Boolean);
      const payload = {
        nome: productForm.nome,
        preco: Number(productForm.preco) || 0,
        descricao: productForm.descricao,
        marca: productForm.marca,
        material: productForm.material,
        estilo: productForm.estilo,
        categoria: productForm.categoria,
        fotos,
        tamanhos: productForm.tamanhos || [],
        cores: productForm.cores || [],
        updatedAt: new Date().toISOString(),
      };
      if (editingProduct) {
        await updateDoc(doc(db, 'Products', editingProduct), payload);
      } else {
        await addDoc(collection(db, 'Products'), {
          ...payload,
          createdAt: new Date().toISOString(),
        });
      }
      closeProductForm();
      await loadProducts();
    } finally {
      setUploading(false);
    }
  }

  async function deleteProduct(id) {
    if (!confirm('Excluir este produto?')) return;
    await deleteDoc(doc(db, 'Products', id));
    await loadProducts();
    closeProductForm();
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Admin</h1>
      <div className="flex gap-2 mb-8 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setTab('users')}
          className={`px-4 py-2 rounded-t-xl font-medium ${
            tab === 'users' ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Usuários
        </button>
        <button
          type="button"
          onClick={() => setTab('products')}
          className={`px-4 py-2 rounded-t-xl font-medium ${
            tab === 'products' ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Produtos
        </button>
      </div>

      {tab === 'users' && (
        <div className="space-y-6">
          <form onSubmit={handleAddUser} className="p-6 bg-white rounded-2xl border border-gray-100 flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Nome"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-200"
            />
            <input
              type="email"
              placeholder="E-mail"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-200"
              required
            />
            <input
              type="password"
              placeholder="Senha"
              value={newUserPassword}
              onChange={(e) => setNewUserPassword(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-200"
              required
            />
            <button type="submit" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white">
              <UserPlus className="w-4 h-4" /> Adicionar usuário
            </button>
          </form>
          <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white">
            <table className="w-full">
              <thead className="bg-surface-50">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-700">Nome</th>
                  <th className="text-left p-4 font-medium text-gray-700">E-mail</th>
                  <th className="text-left p-4 font-medium text-gray-700">Role</th>
                  <th className="text-left p-4 font-medium text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-gray-100">
                    <td className="p-4">{u.nome || '-'}</td>
                    <td className="p-4">{u.email}</td>
                    <td className="p-4">{u.role || 'user'}</td>
                    <td className="p-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleBlockUser(u.id, !u.bloqueado)}
                        className="px-3 py-1 rounded-lg text-sm bg-amber-100 text-amber-800 hover:bg-amber-200"
                      >
                        {u.bloqueado ? 'Desbloquear' : 'Bloquear'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'products' && (
        <div className="space-y-6">
          <button
            type="button"
            onClick={() => openProductForm()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white"
          >
            <Plus className="w-4 h-4" /> Novo produto
          </button>

          {showProductForm && (
            <form
              onSubmit={saveProduct}
              className="p-6 bg-white rounded-2xl border border-gray-100 space-y-4"
            >
              {editingProduct ? (
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold text-gray-800">Editar produto</h2>
                  <button type="button" onClick={closeProductForm}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold text-gray-800">Novo produto</h2>
                  <button type="button" onClick={closeProductForm}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nome"
                  value={productForm.nome}
                  onChange={(e) => setProductForm((f) => ({ ...f, nome: e.target.value }))}
                  className="px-4 py-2 rounded-xl border border-gray-200"
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Preço"
                  value={productForm.preco}
                  onChange={(e) => setProductForm((f) => ({ ...f, preco: e.target.value }))}
                  className="px-4 py-2 rounded-xl border border-gray-200"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Marca</label>
                  <input
                    type="text"
                    placeholder="Ex: Nike, Renner"
                    value={productForm.marca}
                    onChange={(e) => setProductForm((f) => ({ ...f, marca: e.target.value }))}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Estilo</label>
                  <input
                    type="text"
                    placeholder="Ex: Social, Casual"
                    value={productForm.estilo}
                    onChange={(e) => setProductForm((f) => ({ ...f, estilo: e.target.value }))}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Categoria</label>
                <select
                  value={productForm.categoria}
                  onChange={(e) => setProductForm((f) => ({ ...f, categoria: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white"
                >
                  <option value="">Selecione a categoria</option>
                  {CATEGORIAS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Material</label>
                <select
                  value={productForm.material}
                  onChange={(e) => setProductForm((f) => ({ ...f, material: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white"
                >
                  <option value="">Selecione o material</option>
                  {MATERIAIS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Fotos (até 4) — cole o link da imagem ou envie arquivo (ImgBB grátis)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[0, 1, 2, 3].map((i) => {
                    const url = productForm.fotos[i] || '';
                    const isUploading = uploadingPhotoIndex === i;
                    const hasImgBB = !!import.meta.env.VITE_IMGBB_API_KEY;
                    return (
                      <div key={i} className="flex gap-2 items-start">
                        <div className="flex-1 min-w-0">
                          <input
                            type="url"
                            placeholder={`Foto ${i + 1} — cole a URL`}
                            value={url}
                            onChange={(e) => {
                              const f = [...(productForm.fotos || ['', '', '', ''])];
                              f[i] = e.target.value;
                              setProductForm((prev) => ({ ...prev, fotos: f }));
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
                          />
                          {url && (
                            <img src={url} alt="" className="mt-1 h-16 w-full object-cover rounded-lg bg-gray-100" onError={(e) => { e.target.style.display = 'none'; }} />
                          )}
                        </div>
                        <label className={`shrink-0 flex flex-col items-center justify-center gap-0.5 px-2 py-2 rounded-xl border-2 border-dashed border-gray-200 text-xs ${hasImgBB ? 'cursor-pointer hover:border-primary-400 hover:bg-primary-50/50' : 'opacity-60'}`}>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={!hasImgBB || isUploading}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file || !hasImgBB) {
                                if (!hasImgBB) alert('Para enviar arquivo: crie uma API key grátis em api.imgbb.com e adicione no .env como VITE_IMGBB_API_KEY');
                                return;
                              }
                              setUploadingPhotoIndex(i);
                              try {
                                const uploadedUrl = await uploadToImgBB(file);
                                if (uploadedUrl) {
                                  const f = [...(productForm.fotos || ['', '', '', ''])];
                                  f[i] = uploadedUrl;
                                  setProductForm((prev) => ({ ...prev, fotos: f }));
                                }
                              } catch (err) {
                                alert('Falha no upload: ' + (err.message || err));
                              } finally {
                                setUploadingPhotoIndex(null);
                                e.target.value = '';
                              }
                            }}
                          />
                          {isUploading ? '...' : 'Enviar'}
                        </label>
                      </div>
                    );
                  })}
                </div>
                {!import.meta.env.VITE_IMGBB_API_KEY && (
                  <p className="text-xs text-gray-500 mt-1">Link grátis: use ImgBB, Imgur ou Google Drive (link público) e cole a URL. Ou adicione VITE_IMGBB_API_KEY no .env para enviar arquivos.</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Tamanhos</label>
                <div className="flex flex-wrap gap-2">
                  {TAMANHOS.map((t) => {
                    const selected = (productForm.tamanhos || []).includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          const atuais = productForm.tamanhos || [];
                          const next = selected ? atuais.filter((x) => x !== t) : [...atuais, t];
                          setProductForm((f) => ({ ...f, tamanhos: next }));
                        }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                          selected ? 'bg-primary-500 text-white border-primary-500' : 'border-gray-300 text-gray-700 hover:border-primary-400'
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Cores</label>
                <div className="flex flex-wrap gap-2">
                  {CORES.map((c) => {
                    const selected = (productForm.cores || []).includes(c.nome);
                    return (
                      <button
                        key={c.nome}
                        type="button"
                        title={c.nome}
                        onClick={() => {
                          const atuais = productForm.cores || [];
                          const next = selected ? atuais.filter((x) => x !== c.nome) : [...atuais, c.nome];
                          setProductForm((f) => ({ ...f, cores: next }));
                        }}
                        className={`w-8 h-8 rounded-lg border-2 transition-all ${
                          selected ? 'border-primary-600 ring-2 ring-primary-300 scale-110' : 'border-gray-300 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: c.hex }}
                      />
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Descrição</label>
                <textarea
                  value={productForm.descricao}
                  onChange={(e) => setProductForm((f) => ({ ...f, descricao: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200"
                  rows={3}
                  placeholder="Ex: Camisa social masculina em algodão, gola italiana. Ideal para escritório e eventos. Composição: 100% algodão. Lavar à mão ou máquina."
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 rounded-xl bg-primary-500 text-white disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Salvando...' : editingProduct ? 'Salvar' : 'Adicionar'}
                </button>
                {editingProduct && (
                  <button
                    type="button"
                    onClick={() => deleteProduct(editingProduct)}
                    className="px-4 py-2 rounded-xl bg-red-500 text-white"
                  >
                    Excluir
                  </button>
                )}
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((p) => (
              <div key={p.id} className="p-4 bg-white rounded-2xl border border-gray-100 flex justify-between items-start">
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 truncate">{p.nome}</p>
                  <p className="text-primary-600 font-semibold">R$ {Number(p.preco).toFixed(2)}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openProductForm(p)}
                    className="p-2 rounded-lg text-primary-600 hover:bg-primary-50"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteProduct(p.id)}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
