import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  type Auth,
} from "firebase/auth";

const getFirebaseAuth = () => {
  const { $firebaseAuth } = useNuxtApp();

  if (!$firebaseAuth) {
    throw new Error("Firebase is not configured. Please set the NUXT_PUBLIC_FIREBASE_* values.");
  }

  return $firebaseAuth as Auth;
};

export const useFirebaseAuth = () => {
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    const result = await signInWithPopup(getFirebaseAuth(), provider);
    return result.user.getIdToken();
  };

  const signInWithEmail = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
    return result.user.getIdToken();
  };

  const registerWithEmail = async (name: string, email: string, password: string) => {
    const result = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);

    if (name.trim()) {
      await updateProfile(result.user, { displayName: name.trim() });
    }

    return result.user.getIdToken();
  };

  const sendResetEmail = (email: string) => {
    return sendPasswordResetEmail(getFirebaseAuth(), email);
  };

  return {
    signInWithGoogle,
    signInWithEmail,
    registerWithEmail,
    sendResetEmail,
  };
};
