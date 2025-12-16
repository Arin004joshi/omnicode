import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    getChatSession,
    initializeChatSession,
    updateChatHistory
} from '../services/firestoreService';

// Placeholder for a basic message structure
const initialMessage = {
    role: "agent",
    text: "Hello! I'm the OmniCode Agent. Type /explain followed by a code block to get started.",
    timestamp: new Date().toISOString(),
    type: "welcome_message"
};

// --- API Endpoint Configuration ---
// IMPORTANT: Use the local emulator URL for local testing. 
// Replace 'omnicode-f652d' with your actual Firebase Project ID if different.
const API_ENDPOINT = "http://localhost:5005/omnicode-f652d/us-central1/omniCodeChatGateway";


const ChatInterface = () => {
    // 1. Authentication State
    const { currentUser, logOut } = useAuth();
    const uid = currentUser?.uid;

    // 2. Chat State Management
    const [history, setHistory] = useState([initialMessage]); // Local array of messages
    const [input, setInput] = useState(''); // Current text in the input box
    const [loading, setLoading] = useState(true); // Loading state for initial fetch
    const messagesEndRef = useRef(null); // Ref for automatic scrolling

    // --- Persistence: Load History on Component Mount (Task 2.2.1) ---
    useEffect(() => {
        if (!uid) return;

        async function loadHistory() {
            setLoading(true);
            try {
                let session = await getChatSession(uid);

                if (!session) {
                    console.log("Initializing new chat session for user:", uid);
                    session = await initializeChatSession(uid);
                }

                if (session.history && session.history.length > 0) {
                    setHistory(session.history);
                } else {
                    setHistory([initialMessage]);
                }

            } catch (error) {
                console.error("Error loading chat session:", error);
            } finally {
                setLoading(false);
            }
        }

        loadHistory();
    }, [uid]);

    // --- Auto-scroll to the bottom ---
    useEffect(() => {
        // Scrolls the dummy div into view when history updates
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [history]);


    // --- UPDATED: Interaction: Send Message Handler (Task 4.1.1) ---
    const handleSendMessage = async (e) => {
        e.preventDefault();
        const messageText = input.trim();
        if (messageText === '' || !uid || !currentUser) return;

        setLoading(true); // Disable input while waiting for AI response
        setInput(''); // Clear the input field

        const userMessage = {
            role: "user",
            text: messageText,
            timestamp: new Date().toISOString(),
            type: messageText.startsWith('/explain') ? 'explain_command' : 'text',
        };

        // 1. Optimistic UI Update: Add user message locally
        const updatedHistoryWithUser = [...history, userMessage];
        setHistory(updatedHistoryWithUser);

        // 2. Prepare API Request Body
        const requestBody = {
            uid: uid,
            message: messageText,
            history: updatedHistoryWithUser
        };

        let agentResponse = null;

        try {
            // Get the ID token for secure API call
            const idToken = await currentUser.getIdToken();

            // 3. Make the secure fetch call to the Cloud Function
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();

            if (!response.ok || data.status === 'error') {
                throw new Error(data.message || 'API call failed');
            }

            // 4. Update UI with AI Agent's response
            agentResponse = data; // The function returns the new message object

            const finalHistory = [...updatedHistoryWithUser, agentResponse];
            setHistory(finalHistory);

        } catch (error) {
            console.error("API Call Error:", error);
            // Display an error message to the user
            const errorMsg = {
                role: "agent",
                text: `Error: Failed to get a response from the agent. (${error.message}). Check the local emulator logs.`,
                timestamp: new Date().toISOString(),
                type: "error"
            };
            setHistory(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    // --- Render Content ---
    if (loading) {
        return <h1 style={styles.loading}>Loading Chat History...</h1>;
    }

    return (
        <div style={styles.chatContainer}>
            {/* Header with Log Out */}
            <header style={styles.header}>
                <h1 style={styles.title}>OmniCode Agent</h1>
                <p style={styles.user}>Logged in as: {currentUser?.email}</p>
                <button onClick={logOut} style={styles.logoutButton}>Log Out</button>
            </header>

            {/* Chat History Area (Scrollable) */}
            <div style={styles.historyContainer}>
                {history.map((message, index) => (
                    <div
                        key={index}
                        // Use a utility style to correctly align the text inside the bubbles
                        style={message.role === 'user' ? styles.userMessage : styles.agentMessage}
                    >
                        {/* If it's a user message, show the 'user:' tag inside the bubble */}
                        {message.role === 'user' && <span style={styles.userRoleTag}>user: </span>}
                        {message.text}
                    </div>
                ))}
                <div ref={messagesEndRef} /> {/* Auto-scroll target */}
            </div>

            {/* Input Footer (Fixed) */}
            <form onSubmit={handleSendMessage} style={styles.inputFooter}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type /explain <code block> or a message..."
                    disabled={loading}
                    style={styles.chatInputField}
                />
                <button type="submit" disabled={loading} style={styles.chatSendButton}>Send</button>
            </form>
        </div>
    );
};

// --- UPDATED STYLES ---
const styles = {
    // ... (General styles remain the same)

    // --- Chat Interface Specific ---
    chatContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        maxWidth: '800px',
        margin: '0 auto',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#ffffff'
    },
    header: {
        padding: '15px',
        borderBottom: '1px solid #d1d5db',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#ffffff'
    },
    user: {
        fontSize: '0.9em',
        color: '#6b7280'
    },
    logoutButton: {
        padding: '6px 12px',
        backgroundColor: '#ef4444',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    historyContainer: {
        flexGrow: 1,
        overflowY: 'auto',
        padding: '20px',
        backgroundColor: '#ffffff'
    },
    // User Message Styles (Right aligned, Blue, Black text)
    userMessage: {
        textAlign: 'right', // Aligns the bubble container to the right
        marginBottom: '15px',
        padding: '10px',
        borderRadius: '15px 15px 0 15px',
        backgroundColor: '#4A78D7',
        color: '#000000',
        maxWidth: '70%',
        marginLeft: 'auto', // Pushes the bubble to the right
        display: 'flex', // Use flex to position the 'user:' tag
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: '5px'
    },
    // Agent Message Styles (Left aligned, Gray, Black text)
    agentMessage: {
        textAlign: 'left', // Aligns the bubble container to the left
        marginBottom: '15px',
        padding: '10px',
        borderRadius: '15px 15px 15px 0',
        backgroundColor: '#D3D3D3',
        color: '#000000',
        maxWidth: '70%',
        marginRight: 'auto', // Pushes the bubble to the left
    },
    // Style for the 'user:' tag inside the user message bubble
    userRoleTag: {
        fontWeight: 'bold',
        fontSize: '0.9em',
        opacity: 0.8, // Make it slightly less prominent than the text
        // Ensure the text itself is styled nicely if needed
    },
    inputFooter: {
        display: 'flex',
        padding: '15px',
        borderTop: '1px solid #d1d5db',
        backgroundColor: '#333333',
    },
    chatInputField: {
        flexGrow: 1,
        padding: '10px',
        border: '1px solid #555555',
        borderRadius: '20px',
        marginRight: '10px',
        backgroundColor: '#333333',
        color: 'white',
    },
    chatSendButton: {
        padding: '10px 20px',
        backgroundColor: '#4A78D7',
        color: 'white',
        border: 'none',
        borderRadius: '20px',
        cursor: 'pointer'
    },
    loading: {
        textAlign: 'center',
        paddingTop: '50px',
        color: '#4b5563'
    }
};

export default ChatInterface;