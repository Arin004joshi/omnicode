import { db } from '../firebase'; // Import the db instance from Task 2.1.1
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

// Fetches the chat session document for a given user ID
export async function getChatSession(uid) {
    // 1. Reference the document using the user's uid as the Document ID
    const sessionRef = doc(db, 'chatSessions', uid);

    // 2. Fetch the document snapshot
    const sessionSnap = await getDoc(sessionRef);

    // 3. Return the data if it exists, otherwise return null
    if (sessionSnap.exists()) {
        return sessionSnap.data();
    } else {
        return null;
    }
}

// Initializes a new chat session document for a new user
export async function initializeChatSession(uid) {
    const sessionRef = doc(db, 'chatSessions', uid);
    const initialSessionData = {
        userId: uid,
        history: [], // Starts with an empty conversation array
        updatedAt: serverTimestamp(),
    };

    // Set the document data (setDoc creates or overwrites)
    await setDoc(sessionRef, initialSessionData);
    return initialSessionData;
}

// Appends a new message to the history array and updates the timestamp
export async function updateChatHistory(uid, newHistoryEntry) {
    const sessionRef = doc(db, 'chatSessions', uid);

    // Use the Firestore updateDoc function to append the new message
    await updateDoc(sessionRef, {
        // 'history': arrayUnion(newHistoryEntry) - OR use transaction for safety

        // OPTION 2 (Simpler): Update the entire history array (requires reading it first)
        // For the MVP, we will assume the full array is sent back from the front-end
        history: newHistoryEntry,
        updatedAt: serverTimestamp(),
    });
}