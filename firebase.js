import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA7AAegnJr64f7NWvM3xUEdj7Tfv3QCg7M",
  authDomain: "cineworld-org.firebaseapp.com",
  projectId: "cineworld-org",
  storageBucket: "cineworld-org.firebasestorage.app",
  messagingSenderId: "254263514197",
  appId: "1:254263514197:web:108dfe5e5b09b65deeb0dc",
  measurementId: "G-CMLQMSYB6Y"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, auth };
