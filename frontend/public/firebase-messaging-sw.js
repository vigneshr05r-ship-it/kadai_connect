import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging/sw";

// Initialize the Firebase app in the service worker
const firebaseConfig = {
  apiKey: "AIzaSyARULudL-8KS2bENDO0XIUvMWMYNA8wALE",
  authDomain: "kadai-connect.firebaseapp.com",
  projectId: "kadai-connect",
  storageBucket: "kadai-connect.firebasestorage.app",
  messagingSenderId: "20971706718",
  appId: "1:20971706718:web:a09c348deacc3e5b8497cf"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
