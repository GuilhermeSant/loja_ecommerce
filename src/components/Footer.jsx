import { Link } from 'react-router-dom';
import { Github, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto bg-surface-200 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Loja Fashion</h3>
            <p className="text-gray-600 text-sm">
              Moda com qualidade e preço justo. Encontre looks para o dia a dia e ocasiões especiais.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/sobre" className="text-gray-600 hover:text-primary-600">Sobre Nós</Link>
              </li>
              <li>
                <Link to="/contato" className="text-gray-600 hover:text-primary-600">Contato</Link>
              </li>
              <li>
                <a href="/#categorias" className="text-gray-600 hover:text-primary-600">Categorias</a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Tecnologias</h3>
            <p className="text-gray-600 text-sm mb-3">
              React • Vite • Tailwind CSS • Firebase • Lucide Icons
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.linkedin.com/in/guilherme-vinicius-santana/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-primary-600 hover:border-primary-200"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/guilherme-vinicius-santana/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-primary-600 hover:border-primary-200"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          Criado por{' '}
          <a
            href="https://www.linkedin.com/in/guilherme-vinicius-santana/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-300"
          >
            Guilherme Vinicius Santana
          </a>
        </div>
      </div>
    </footer>
  );
}
