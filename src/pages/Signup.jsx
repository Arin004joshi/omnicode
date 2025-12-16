import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { signUp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const trimmedEmail = email.trim();

        try {
            await signUp(trimmedEmail, password);
            navigate('/chat');
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                setError('This email address is already in use.');
            } else if (err.code === 'auth/weak-password') {
                setError('Password should be at least 6 characters.');
            } else {
                setError('Failed to create an account: ' + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.pageContainer}>
            <div style={styles.formContainer}>
                <h2 style={styles.title}>Create OmniCode Agent Account</h2>
                {error && <p style={styles.error}>{error}</p>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={styles.inputField}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={styles.inputField}
                        />
                    </div>

                    <button type="submit" disabled={loading} style={styles.primaryButton}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <div style={styles.linkContainer}>
                    <p>Already have an account? <span onClick={() => navigate('/login')} style={styles.link}>Log In</span></p>
                </div>
            </div>
        </div>
    );
};

const styles = {
    // --- General / Forms ---
    pageContainer: { 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh', 
        backgroundColor: '#f4f7f9' 
    },
    formContainer: { 
        padding: '30px', 
        maxWidth: '400px', 
        width: '90%', 
        backgroundColor: '#fff', 
        borderRadius: '8px', 
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' 
    },
    title: { 
        textAlign: 'center', 
        color: '#1e3a8a', 
        marginBottom: '20px' 
    },
    error: { 
        color: '#dc2626', 
        textAlign: 'center', 
        marginBottom: '15px' 
    },
    form: { 
        display: 'flex', 
        flexDirection: 'column' 
    },
    inputGroup: { 
        marginBottom: '15px' 
    },
    label: { 
        display: 'block', 
        marginBottom: '5px', 
        fontWeight: 'bold', 
        color: '#4b5563' 
    },
    inputField: { 
        width: '100%', 
        padding: '10px', 
        border: '1px solid #d1d5db', 
        borderRadius: '4px', 
        boxSizing: 'border-box' 
    },
    primaryButton: { 
        width: '100%', 
        padding: '12px', 
        marginTop: '10px', 
        backgroundColor: '#1e3a8a', 
        color: 'white', 
        border: 'none', 
        borderRadius: '4px', 
        cursor: 'pointer', 
        fontSize: '1em' 
    },
    linkContainer: { 
        marginTop: '20px', 
        textAlign: 'center' 
    },
    link: { 
        cursor: 'pointer', 
        color: '#2563eb', 
        textDecoration: 'underline' 
    },

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
        backgroundColor: '#f4f7f9'
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
    userMessage: { 
        textAlign: 'right', 
        marginBottom: '15px', 
        padding: '10px', 
        borderRadius: '15px 15px 0 15px', 
        backgroundColor: '#dbeafe', 
        maxWidth: '70%',
        marginLeft: 'auto',
    },
    agentMessage: { 
        textAlign: 'left', 
        marginBottom: '15px', 
        padding: '10px', 
        borderRadius: '15px 15px 15px 0', 
        backgroundColor: '#e5e7eb', 
        maxWidth: '70%',
        marginRight: 'auto',
    },
    inputFooter: { 
        display: 'flex', 
        padding: '15px', 
        borderTop: '1px solid #d1d5db', 
        backgroundColor: '#ffffff' 
    },
    chatInputField: { 
        flexGrow: 1, 
        padding: '10px', 
        border: '1px solid #d1d5db', 
        borderRadius: '20px', 
        marginRight: '10px' 
    },
    chatSendButton: { 
        padding: '10px 20px', 
        backgroundColor: '#1e3a8a', 
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

export default Signup;