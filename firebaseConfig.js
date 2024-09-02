import { initializeApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCiseLapLaXmisj-Yk4wlVxXhSdPJXoP44",
  authDomain: "healthbuddie-7223f.firebaseapp.com",
  projectId: "healthbuddie-7223f",
  storageBucket: "healthbuddie-7223f.appspot.com",
  messagingSenderId: "87578726638",
  appId: "1:87578726638:web:9057631208f42e58a223ff",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firestore and get a reference to the service
const db = getFirestore(app);

// Initialize Storage and get a reference to the service
const storage = getStorage(app);

export { auth, db, storage };
