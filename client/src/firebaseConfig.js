import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ✅ Put your real config here (from Firebase Console -> Project settings -> Web app)
const firebaseConfig = {
   apiKey: "AIzaSyAZnu9cq__9QpRNgqXIut7jpggr2jSII4M",
  authDomain: "ringbuilder-cfae9.firebaseapp.com",
  projectId: "ringbuilder-cfae9",
  storageBucket: "ringbuilder-cfae9.firebasestorage.app",
  messagingSenderId: "634893711264",
  appId: "1:634893711264:web:e575b64aa78fdfda8196c5",
  measurementId: "G-6B7R4VWJJ2"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
