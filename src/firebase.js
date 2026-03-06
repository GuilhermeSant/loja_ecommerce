import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configure as variáveis no arquivo .env (copie .env.example para .env).
function getEnv(key) {
  const v = import.meta.env[key];
  if (v && v !== '' && v !== 'sua-api-key' && !v.startsWith('seu-')) return v;
  return '';
}

const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('VITE_FIREBASE_APP_ID'),
};

if (!firebaseConfig.apiKey) {
  console.warn(
    'Firebase: copie .env.example para .env, preencha com as chaves do Firebase Console e reinicie (npm run dev).'
  );
} else if (import.meta.env.DEV) {
  console.info('Firebase: config carregada do .env (API key presente).');
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
