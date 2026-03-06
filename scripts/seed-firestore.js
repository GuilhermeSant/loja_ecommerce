/**
 * Script para popular o Firestore com produtos iniciais (seed).
 * Execute uma vez: npm run seed
 * Requer variáveis de ambiente do Firebase no .env (VITE_FIREBASE_*).
 *
 * No Firebase Console:
 * 1. Crie um projeto e ative Authentication (Google, Email/Senha)
 * 2. Crie o Firestore
 * 3. Copie as credenciais para .env (veja .env.example)
 *
 * Para rodar: npm run seed (carrega .env automaticamente)
 */

import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey) {
  console.error('Erro: defina VITE_FIREBASE_* no .env (copie de .env.example).');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const produtosIniciais = [
  {
    nome: 'Camiseta Básica Masculina',
    preco: 79.9,
    descricao: 'Camiseta de algodão 100%, corte regular. Ideal para o dia a dia.',
    marca: 'BasicWear',
    material: 'Algodão',
    estilo: 'Casual',
    categoria: 'masculino',
    fotos: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400',
    ],
    tamanhos: ['P', 'M', 'G', 'GG'],
    cores: ['Branco', 'Preto', 'Cinza', 'Azul Marinho'],
    createdAt: new Date().toISOString(),
  },
  {
    nome: 'Calça Jeans Slim',
    preco: 189.9,
    descricao: 'Calça jeans slim fit, elastano para conforto.',
    marca: 'DenimCo',
    material: 'Jeans com elastano',
    estilo: 'Casual',
    categoria: 'masculino',
    fotos: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400',
    ],
    tamanhos: ['38', '40', '42', '44'],
    cores: ['Azul', 'Preto'],
    createdAt: new Date().toISOString(),
  },
  {
    nome: 'Vestido Floral Feminino',
    preco: 159.9,
    descricao: 'Vestido midi com estampa floral, tecido leve.',
    marca: 'FloralStyle',
    material: 'Viscose',
    estilo: 'Feminino',
    categoria: 'feminino',
    fotos: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400',
    ],
    tamanhos: ['P', 'M', 'G'],
    cores: ['Rosa', 'Azul', 'Verde'],
    createdAt: new Date().toISOString(),
  },
  {
    nome: 'Blusa Feminina Manga Longa',
    preco: 99.9,
    descricao: 'Blusa básica manga longa, ótima para layering.',
    marca: 'BasicWear',
    material: 'Algodão',
    estilo: 'Casual',
    categoria: 'feminino',
    fotos: [
      'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400',
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400',
    ],
    tamanhos: ['P', 'M', 'G', 'GG'],
    cores: ['Branco', 'Preto', 'Bege', 'Rosa'],
    createdAt: new Date().toISOString(),
  },
  {
    nome: 'Jaqueta Jeans Unissex',
    preco: 249.9,
    descricao: 'Jaqueta jeans clássica, cor azul médio.',
    marca: 'DenimCo',
    material: 'Jeans',
    estilo: 'Casual',
    categoria: 'masculino',
    fotos: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400',
    ],
    tamanhos: ['P', 'M', 'G', 'GG'],
    cores: ['Azul', 'Preto'],
    createdAt: new Date().toISOString(),
  },
  {
    nome: 'Camiseta Infantil Estampada',
    preco: 59.9,
    descricao: 'Camiseta infantil com estampa divertida, algodão macio.',
    marca: 'KidsFun',
    material: 'Algodão',
    estilo: 'Infantil',
    categoria: 'kids',
    fotos: [
      'https://images.unsplash.com/photo-1519237193534-2fa0ea400181?w=400',
      'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=400',
    ],
    tamanhos: ['4', '6', '8', '10', '12'],
    cores: ['Amarelo', 'Vermelho', 'Azul', 'Verde'],
    createdAt: new Date().toISOString(),
  },
  {
    nome: 'Short Feminino Cintura Alta',
    preco: 89.9,
    descricao: 'Short de cintura alta, tecido leve para o verão.',
    marca: 'SummerWear',
    material: 'Linho',
    estilo: 'Verão',
    categoria: 'feminino',
    fotos: [
      'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400',
      'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400',
    ],
    tamanhos: ['P', 'M', 'G'],
    cores: ['Branco', 'Bege', 'Azul Claro'],
    createdAt: new Date().toISOString(),
  },
  {
    nome: 'Moletom Masculino',
    preco: 169.9,
    descricao: 'Moletom com capuz, fleece interno, super confortável.',
    marca: 'ComfortZone',
    material: 'Algodão + fleece',
    estilo: 'Casual',
    categoria: 'masculino',
    fotos: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
      'https://images.unsplash.com/photo-1578768079052-aa76e52d6ea3?w=400',
    ],
    tamanhos: ['P', 'M', 'G', 'GG'],
    cores: ['Cinza', 'Preto', 'Azul Marinho'],
    createdAt: new Date().toISOString(),
  },
];

async function seed() {
  console.log('Iniciando seed do Firestore...');
  const col = collection(db, 'Products');
  for (const produto of produtosIniciais) {
    await addDoc(col, produto);
    console.log('Adicionado:', produto.nome);
  }
  console.log('Seed concluído. Total:', produtosIniciais.length, 'produtos.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Erro no seed:', err);
  process.exit(1);
});
