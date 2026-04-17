import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
// Replace these values with your Firebase project credentials
const firebaseConfig = {
  apiKey: "AIzaSyC8NeY7Su-NLS_Imx2lxCS3NmHGTQxBkbU",
  authDomain: "meetingscheduler-web.firebaseapp.com",
  projectId: "meetingscheduler-web",
  storageBucket: "meetingscheduler-web.firebasestorage.app",
  messagingSenderId: "242274015552",
  appId: "1:242274015552:web:a50f3d21509533e456c2a5",
  measurementId: "G-Z7NQ65CERV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
