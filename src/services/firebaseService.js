import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAzHGWwaRYQWZh6qWkU29lK5rPNAQAA-lc",
  authDomain: "dietaai-75085.firebaseapp.com",
  projectId: "dietaai-75085",
  storageBucket: "dietaai-75085.firebasestorage.app",
  messagingSenderId: "773936796279",
  appId: "1:773936796279:web:8d038e4a36bc4f5259ac72"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

const provider = new GoogleAuthProvider();

export function loginWithGoogle() {
  return signInWithRedirect(auth, provider);
}

export function getGoogleRedirectResult() {
  return getRedirectResult(auth);
}

export function logout() {
  return signOut(auth);
}

export function listenAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function loadCloudState(uid) {
  const ref = doc(db, "users", uid, "app", "state");
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return null;
  }

  return snap.data()?.state || null;
}

export async function saveCloudState(uid, state) {
  const ref = doc(db, "users", uid, "app", "state");

  await setDoc(ref, {
    state,
    updatedAt: serverTimestamp()
  });
}