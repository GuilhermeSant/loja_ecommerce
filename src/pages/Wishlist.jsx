import { Link } from 'react-router-dom';

export default function Wishlist() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Lista de desejos</h1>
      <p className="text-gray-500 mb-6">Sua lista de desejos está vazia.</p>
      <Link
        to="/"
        className="inline-block px-6 py-3 rounded-2xl bg-primary-500 text-white font-medium hover:bg-primary-600"
      >
        Ver produtos
      </Link>
    </div>
  );
}
