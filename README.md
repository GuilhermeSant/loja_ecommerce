<<<<<<< HEAD
# Loja Fashion - E-commerce de Roupas

Projeto de e-commerce em React (Vite) com Tailwind CSS, Firebase (Auth + Firestore) e roteamento com React Router.

## Tecnologias

- **React 18** + **Vite**
- **Tailwind CSS** – estilos
- **Lucide React** – ícones
- **react-router-dom** – rotas
- **Firebase** – Autenticação (Google, Facebook, Email/Senha) e Firestore (Users, Products, Orders)

## Configuração

1. **Clone e instale as dependências**

   ```bash
   cd loja-ecommerce
   npm install
   ```

2. **Firebase**

   - Crie um projeto em [Firebase Console](https://console.firebase.google.com).
   - Ative **Authentication** e os provedores: **Google**, **Facebook** e **E-mail/Senha**.
   - Crie um banco **Firestore** (modo produção ou teste).
   - Copie `.env.example` para `.env` e preencha com as credenciais do projeto:

   ```env
   VITE_FIREBASE_API_KEY=
   VITE_FIREBASE_AUTH_DOMAIN=
   VITE_FIREBASE_PROJECT_ID=
   VITE_FIREBASE_STORAGE_BUCKET=
   VITE_FIREBASE_MESSAGING_SENDER_ID=
   VITE_FIREBASE_APP_ID=
   ```

3. **Admin**

   - No código, o e-mail de admin está em `src/contexts/AuthContext.jsx`:
   - `const ADMIN_EMAIL = 'admin@loja.com';` — altere para o e-mail que deve ter acesso à rota `/admin`.

4. **Seed (produtos iniciais)**

   - Para popular o Firestore com produtos de exemplo, configure as variáveis de ambiente (ou edite `scripts/seed-firestore.js` com suas credenciais) e rode:

   ```bash
   npm run seed
   ```

   - O script adiciona documentos na coleção `Products`. As coleções `Users` e `Orders` são criadas pelo uso da aplicação (login e finalizar compra).

5. **Índice no Firestore (opcional)**

   - Na **Home**, os produtos são ordenados por `createdAt`. Se o Firestore pedir um índice, use o link que aparece no console do navegador para criar o índice no Firebase Console.

## Scripts

- `npm run dev` – servidor de desenvolvimento
- `npm run build` – build de produção
- `npm run preview` – preview do build
- `npm run seed` – popula o Firestore com produtos iniciais (rode uma vez)

## Estrutura principal

- `src/firebase.js` – configuração do Firebase
- `src/contexts/AuthContext.jsx` – estado do usuário (Firebase Auth + Firestore Users)
- `src/contexts/CartContext.jsx` – carrinho (localStorage + Context)
- `src/components/Layout.jsx` – layout com Header e Footer
- `src/components/Header.jsx` – logo, busca, login, carrinho (dropdown no hover)
- `src/components/Footer.jsx` – Sobre, Contato, tecnologias, GitHub, LinkedIn
- `src/components/LoginModal.jsx` – login com Google, Facebook e E-mail/Senha
- `src/components/ProtectedRoute.jsx` – rota protegida (perfil e admin)
- Páginas: Home, Produto, Cart, Profile, Admin, Categoria, Wishlist, Sobre, Contato

## Coleções Firestore

- **Users** – documento por UID do Auth: nome, email, foto, role ('user' ou 'admin'), endereco, telefone, bloqueado.
- **Products** – nome, preco, descricao, marca, material, estilo, categoria, fotos (array de URLs), tamanhos, cores, createdAt.
- **Orders** – userId, items, total, status, createdAt.

## Licença

Uso livre para fins educacionais e portfólio.
=======
# loja_ecommerce
Exemplo de pagina de loja para portifolio
>>>>>>> c8655c88f98a1f9946925f1b484204bc10b4d6f1
