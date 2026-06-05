import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  collection, 
  query, 
  where,
  onSnapshot,
  getDocFromServer
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD_GZGMNXb-Zl6psFu5NhT-7u0fU9Mid5M",
  authDomain: "aethervault-b207c.firebaseapp.com",
  databaseURL: "https://aethervault-b207c-default-rtdb.firebaseio.com",
  projectId: "aethervault-b207c",
  storageBucket: "aethervault-b207c.firebasestorage.app",
  messagingSenderId: "687440054840",
  appId: "1:687440054840:web:48d3a61d6f8f6c4eed34cd"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
       })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration or network status.");
    }
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.warn("Logout failed:", error);
  }
}

export async function syncUserProfile(email: string, name: string, avatar: string, wishlistIds: string[]) {
  const userId = email.replace(/[^a-zA-Z0-9_\-]/g, '_');
  const path = `users/${userId}`;
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { email, name, avatar, wishlistIds }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getUserProfile(email: string) {
  const userId = email.replace(/[^a-zA-Z0-9_\-]/g, '_');
  const path = `users/${userId}`;
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function recordPurchase(email: string, purchase: any) {
  const userId = email.replace(/[^a-zA-Z0-9_\-]/g, '_');
  const path = `users/${userId}/purchases/${purchase.id}`;
  try {
    const purchaseRef = doc(db, 'users', userId, 'purchases', purchase.id);
    await setDoc(purchaseRef, purchase);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getUserPurchases(email: string) {
  const userId = email.replace(/[^a-zA-Z0-9_\-]/g, '_');
  const path = `users/${userId}/purchases`;
  try {
    const collRef = collection(db, 'users', userId, 'purchases');
    const snap = await getDocs(collRef);
    const purchases: any[] = [];
    snap.forEach((doc) => {
      purchases.push(doc.data());
    });
    return purchases;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function getPaymentDetails() {
  const path = 'settings/paymentDetails';
  try {
    const docRef = doc(db, 'settings', 'paymentDetails');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data();
    }
    return { easypaisaNumber: '', jazzcashNumber: '', cryptoAddress: '' };
  } catch (error) {
    console.warn('Silent fallback for payment details (uninitialized or restricted):', error);
    return { easypaisaNumber: '03000000000', jazzcashNumber: '03000000000', cryptoAddress: '0x0000000000000000000000000000000000000000' };
  }
}

export async function updatePaymentDetails(details: { easypaisaNumber: string, jazzcashNumber: string, cryptoAddress: string }) {
  const path = 'settings/paymentDetails';
  try {
    const docRef = doc(db, 'settings', 'paymentDetails');
    await setDoc(docRef, details, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getPromoCodes() {
  const path = 'settings/promoCodes';
  try {
    const docRef = doc(db, 'settings', 'promoCodes');
    const snap = await getDoc(docRef);
    if (snap.exists() && snap.data()?.codes) {
      return snap.data().codes as { code: string; percent: number; description?: string }[];
    }
  } catch (error) {
    console.warn('Silent fallback for promo codes (uninitialized or restricted):', error);
  }
  return [
    { code: 'AETHER20', percent: 20, description: '20% off direct license discount' },
    { code: 'WELCOME20', percent: 20, description: 'Welcome code subtracted 20%' },
    { code: 'FREEBIE', percent: 100, description: '100% full asset unlock' }
  ];
}

export async function updatePromoCodes(codes: { code: string; percent: number; description?: string }[]) {
  const path = 'settings/promoCodes';
  try {
    const docRef = doc(db, 'settings', 'promoCodes');
    await setDoc(docRef, { codes }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
