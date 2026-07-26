// firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; 

const firebaseConfig = {
  apiKey: "AIzaSyBkJNJxyRvvMQrGNBHoRlyW0hDJN2WYl0Q",
  authDomain: "cineworldofficial-org.firebaseapp.com",
  projectId: "cineworldofficial-org",
  storageBucket: "cineworldofficial-org.firebasestorage.app",
  messagingSenderId: "744126415050",
  appId: "1:744126415050:web:3e502d454f5a56ea4b3433",
  measurementId: "G-F0WG7P2W09"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app); 

export { app, auth };
