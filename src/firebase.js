import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCQDmqdzG9eY2X8bVa-3lEAhW29AMiylok",
    authDomain: "omnicode-f652d.firebaseapp.com",
    projectId: "omnicode-f652d",
    storageBucket: "omnicode-f652d.firebasestorage.app",
    messagingSenderId: "693188393152",
    appId: "1:693188393152:web:e97f48b2bd67fe5b1a5525",
    measurementId: "G-SV9LD61BX7"
};

const app = initializeApp(firebaseConfig);

// Export the initialized services
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;