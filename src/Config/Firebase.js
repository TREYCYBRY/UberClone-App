
// Initialize Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBil96k8lylvfYue8rXi3W5dewAbSbH2tI",
  authDomain: "uberclone-8df93.firebaseapp.com",
  projectId: "uberclone-8df93",
  storageBucket: "uberclone-8df93.firebasestorage.app",
  messagingSenderId: "586617677163",
  appId: "1:586617677163:web:9f7c710076301db3fbd82e",
  measurementId: "G-CD8ZMSFERH"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
