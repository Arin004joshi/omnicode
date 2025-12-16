import { https } from "firebase-functions";
import { withExponentialBackoff } from "./utils/retryHelper.js";
import admin from 'firebase-admin';
import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Initialize the Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

// 2. Initialize the Gemini Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Configuration - Notice the "models/" prefix
const MODEL_NAME = "gemini-1.5-flash";

const SYSTEM_INSTRUCTION = `You are the OmniCode Agent, an expert programming assistant. 
Your primary function is to analyze the user's provided code block and explain it in detail, focusing on how it works, its purpose, and best practices. 
Keep your explanations concise, professional, and markdown-formatted. 
If a user asks a general question, answer briefly and guide them to provide a code block.`;

export const omniCodeChatGateway = https.onRequest(async (request, response) => {

    // --- CORS Configuration ---
    const allowedOrigins = ['https://omnicode-f652d.web.app', 'http://localhost:5173'];
    const origin = request.headers.origin;
    if (allowedOrigins.includes(origin)) {
        response.set('Access-Control-Allow-Origin', origin);
    }

    response.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (request.method === 'OPTIONS') {
        return response.status(204).send('');
    }
    if (request.method !== 'POST') {
        return response.status(405).send('Method Not Allowed. Use POST.');
    }

    const { history, message, uid } = request.body;

    if (!uid || !message || !Array.isArray(history)) {
        return response.status(400).json({ status: 'error', message: 'Missing required fields.' });
    }

    try {
        const chatProcessHandler = async () => {
            // A. Authentication
            const authHeader = request.headers.authorization;
            if (!authHeader) throw new Error("No authorization header");
            const idToken = authHeader.split('Bearer ')[1];
            const decodedToken = await auth.verifyIdToken(idToken);
            if (decodedToken.uid !== uid) throw new Error("UID mismatch.");

            const sessionRef = db.collection('chatSessions').doc(uid);

            // B. Filter History
            const geminiHistory = history
                .filter(msg => msg.type !== 'welcome_message' && msg.type !== 'status_message')
                .map(msg => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.text }]
                }));

            // C. Initialize Model with the explicit string
            const model = genAI.getGenerativeModel({ model: MODEL_NAME });

            // D. Start Chat - We inject the System Instruction as the first "model" parts if history is empty
            const chat = model.startChat({
                history: geminiHistory.length > 0 ? geminiHistory.slice(0, -1) : [
                    { role: 'user', parts: [{ text: "Context: " + SYSTEM_INSTRUCTION }] },
                    { role: 'model', parts: [{ text: "Understood. I am the OmniCode Agent." }] }
                ],
            });

            // E. Send Message
            const result = await chat.sendMessage(message);
            const chatResponse = await result.response;
            const agentResponseText = chatResponse.text();

            // F. Prepare Response
            const agentResponse = {
                role: "agent",
                text: agentResponseText,
                timestamp: new Date().toISOString(),
                type: 'ai_response'
            };

            // G. Update Firestore
            await sessionRef.set({
                history: [...history, agentResponse],
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            }, { merge: true });

            return agentResponse;
        };

        const agentResponse = await withExponentialBackoff(chatProcessHandler);
        return response.status(200).json(agentResponse);

    } catch (error) {
        console.error("omniCodeChatGateway critical failure: ", error);
        return response.status(500).json({
            status: 'error',
            message: 'A critical server error occurred.',
            details: error.message
        });
    }
});