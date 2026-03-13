// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  // Yahan apni wahi purani config keys rehne dena jo pehle thi
  // Agar keys yaad nahi, toh wapas Firebase console se le aa
  apiKey: "AIzaSyDBhj6QcXqTyZmFNRXM2hu3pogIlD9Ngg4",
  authDomain: "gdgdu-auditorium-booking.firebaseapp.com",
  projectId: "gdgdu-auditorium-booking",
  storageBucket: "gdgdu-auditorium-booking.firebasestorage.app",
  messagingSenderId: "764066545364",
  appId: "1:764066545364:web:898cbe73f48297fb044541"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider(); // ✅ Naam googleProvider rakha hai

export { auth, googleProvider, db }; // ✅ Export bhi googleProvider kiya hai