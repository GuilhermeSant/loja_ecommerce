import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';

// Email para conceder role admin (deixe comentado ou altere conforme necessário)
// const ADMIN_EMAIL = 'admin@loja.com';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const ADMIN_EMAIL = 'admin@loja.com'; // Altere para o email do admin

  async function ensureUserInFirestore(uid, displayName, email, photoURL) {
    const userRef = doc(db, 'Users', uid);
    const snap = await getDoc(userRef);
    const isAdmin = email === ADMIN_EMAIL;
    const role = isAdmin ? 'admin' : 'user';
    if (!snap.exists()) {
      await setDoc(userRef, {
        nome: displayName || '',
        email: email || '',
        foto: photoURL || '',
        role,
        endereco: '',
        telefone: '',
        bloqueado: false,
        createdAt: new Date().toISOString(),
      });
    } else {
      const data = snap.data();
      if (data.role !== 'admin' && isAdmin) {
        await setDoc(userRef, { ...data, role: 'admin' }, { merge: true });
      }
    }
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await ensureUserInFirestore(
          firebaseUser.uid,
          firebaseUser.displayName,
          firebaseUser.email,
          firebaseUser.photoURL
        );
        const userRef = doc(db, 'Users', firebaseUser.uid);
        const snap = await getDoc(userRef);
        setUserProfile(snap.exists() ? { id: snap.id, ...snap.data() } : null);
        setUser(firebaseUser);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function signInWithGoogle() {
    await signInWithPopup(auth, googleProvider);
  }

  async function signInWithEmail(email, password) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function signUpWithEmail(email, password, displayName) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await ensureUserInFirestore(cred.user.uid, displayName, email, null);
  }

  async function signOut() {
    await firebaseSignOut(auth);
  }

  async function refreshProfile() {
    if (!user) return;
    const userRef = doc(db, 'Users', user.uid);
    const snap = await getDoc(userRef);
    setUserProfile(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  }

  const value = {
    user,
    userProfile,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    refreshProfile,
    isAdmin: userProfile?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
