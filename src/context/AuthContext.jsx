import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase'; // Import 'auth' from 2.1.1 setup
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

// Add these functions to the AuthContext value:
const signUp = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
};

const logIn = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
};

const logOut = () => {
    return signOut(auth);
};

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Observer that manages user state changes
        const unsubscribe = onAuthStateChanged(auth, user => {
            setCurrentUser(user);
            setLoading(false);
        });
        // Cleanup subscription on unmount
        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        loading,
        signUp,
        logIn,
        logOut
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
            {/* Render children only after checking auth status */}
        </AuthContext.Provider>
    );
}