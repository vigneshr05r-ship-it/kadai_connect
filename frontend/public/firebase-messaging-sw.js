importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
const firebaseConfig = {
  apiKey: "AIzaSyARULudL-8KS2bENDO0XIUvMWMYNA8wALE",
  authDomain: "kadai-connect.firebaseapp.com",
  projectId: "kadai-connect",
  storageBucket: "kadai-connect.firebasestorage.app",
  messagingSenderId: "20971706718",
  appId: "1:20971706718:web:a09c348deacc3e5b8497cf"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();
