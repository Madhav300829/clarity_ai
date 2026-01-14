import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// A simple way to get a persistent anonymous user ID from localStorage
export const getUserId = (): string => {
    const USER_ID_KEY = 'clarity-ai-user-id';
    let userId = localStorage.getItem(USER_ID_KEY);
    if (!userId) {
        userId = `anonymous_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
        localStorage.setItem(USER_ID_KEY, userId);
    }
    return userId;
};

export enum ActivityType {
    CHAT_MESSAGE = 'CHAT_MESSAGE',
    SEARCH_QUERY = 'SEARCH_QUERY',
    HIRE_CONTACT_INITIATED = 'HIRE_CONTACT_INITIATED',
    KNOWLEDGE_HUB_QUESTION_VIEWED = 'KNOWLEDGE_HUB_QUESTION_VIEWED',
    KNOWLEDGE_HUB_QUESTION_ASKED = 'KNOWLEDGE_HUB_QUESTION_ASKED',
    KNOWLEDGE_HUB_ANSWER_SUBMITTED = 'KNOWLEDGE_HUB_ANSWER_SUBMITTED',
    KNOWLEDGE_HUB_ANSWER_LIKED = 'KNOWLEDGE_HUB_ANSWER_LIKED',
}

interface ActivityLog {
    userId: string;
    type: ActivityType;
    timestamp: any; // Using `any` for serverTimestamp()
    details: Record<string, any>;
}

/**
 * Logs a user activity to Firestore.
 * @param type - The type of activity.
 * @param details - An object containing activity-specific data.
 */
export const logActivity = async (type: ActivityType, details: Record<string, any>): Promise<void> => {
    // If Firebase is not configured, log to console and exit.
    if (!db) {
        console.log(`[LOG DISABLED] Activity: ${type}`, details);
        return;
    }

    try {
        const logData: ActivityLog = {
            userId: getUserId(),
            type,
            details,
            timestamp: serverTimestamp(),
        };
        await addDoc(collection(db, "userActivities"), logData);
    } catch (error) {
        console.error("Error logging activity to Firestore:", error);
        // In a production app, you might want to send this error to a monitoring service.
    }
};
