import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const firebaseConfig = {
    apiKey: config.public.firebaseApiKey,
    authDomain: config.public.firebaseAuthDomain,
    projectId: config.public.firebaseProjectId,
    storageBucket: config.public.firebaseStorageBucket,
    messagingSenderId: config.public.firebaseMessagingSenderId,
    appId: config.public.firebaseAppId,
  };

  const hasRequiredConfig = Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId,
  );

  if (!hasRequiredConfig) {
    return {
      provide: {
        firebaseAuth: null,
      },
    };
  }

  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

  return {
    provide: {
      firebaseAuth: getAuth(app),
    },
  };
});
