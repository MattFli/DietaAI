import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "...",
  authDomain: "dieta-ai-five.vercel.app",
  projectId: "dietaai-75085",
  storageBucket: "dietaai-75085.firebasestorage.app",
  messagingSenderId: "773936796279",
  appId: "..."
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Errore persistenza auth:", error);
});

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