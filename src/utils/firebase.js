import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"

const getEnv = (key, defaultValue) => {
  const value = import.meta.env[key] || defaultValue

  if (value === undefined) {
    throw Error(`Missing String environment variable for ${key}`)
  }

  return value
}

const firebaseConfig = {
  apiKey: getEnv("VITE_APIKEY"),
  authDomain:getEnv("VITE_AUTHDOMAIN"),
  projectId: getEnv("VITE_PROJECTID"),
  storageBucket: getEnv("VITE_STORAGEBUCKET"),
  messagingSenderId: getEnv("VITE_MESSAGINGSENDEID"),
  appId: getEnv("VITE_APPID"),
  measurementId:getEnv("VITE_MEASUREMENTID"),
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 