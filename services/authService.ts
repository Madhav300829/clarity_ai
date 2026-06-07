const OTP_STORAGE_KEY = 'clarity-ai-otp';

// To address the environment variable error and make the sign-up flow functional
// as requested, the user-provided token is used here directly.
const ULTRMSG_TOKEN = 'b2a3enl7lvrnjltb';

export type AuthErrorCode = 'TOKEN_MISSING' | 'SESSION_ERROR' | 'INVALID_PHONE' | 'NETWORK_ERROR' | 'SESSION_EXPIRED' | 'INVALID_OTP' | 'ACCOUNT_CREATION_FAILED';
export type AuthResult = { success: true } | { success: false, errorCode: AuthErrorCode };


/**
 * Sends an OTP to a phone number using the UltraMsg API.
 * This function generates a random 6-digit OTP, stores it in sessionStorage for verification,
 * and then calls the UltraMsg API to send it to the user's phone.
 * @param fullPhoneNumber The full phone number including country code.
 * @returns A promise that resolves to an AuthResult object.
 */
export const sendOtp = async (fullPhoneNumber: string): Promise<AuthResult> => {
    console.log(`[Auth Service] Sending OTP to ${fullPhoneNumber}`);

    if (!ULTRMSG_TOKEN) {
        console.error("[Auth Service] UltraMsg API token is not configured.");
        return { success: false, errorCode: 'TOKEN_MISSING' };
    }
    
    // 1. Generate a secure random 6-digit OTP.
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Store the OTP in sessionStorage. It will be cleared after one verification attempt.
    try {
        sessionStorage.setItem(OTP_STORAGE_KEY, otp);
    } catch (e) {
        console.error("Failed to save OTP to sessionStorage", e);
        return { success: false, errorCode: 'SESSION_ERROR' };
    }

    // 3. Prepare and send the API request to UltraMsg.
    const apiUrl = 'https://api.ultramsg.com/instance145031/messages/chat';
    const params = new URLSearchParams();
    params.append('token', ULTRMSG_TOKEN);
    // Most APIs require the phone number without the '+' prefix.
    params.append('to', fullPhoneNumber.replace(/\+/g, ''));
    params.append('body', `Your ClarityAI verification code is: ${otp}`);

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params,
        });

        const data = await response.json();

        if (response.ok && !data.error) {
            console.log("[Auth Service] OTP sent successfully via UltraMsg:", data);
            return { success: true };
        } else {
            console.error("[Auth Service] Failed to send OTP via UltraMsg:", data.error || 'Unknown API error');
            // This could be an invalid phone number or an issue with the API service.
            return { success: false, errorCode: 'INVALID_PHONE' };
        }
    } catch (error) {
        console.error("[Auth Service] Network error sending OTP:", error);
        return { success: false, errorCode: 'NETWORK_ERROR' };
    }
};


/**
 * Verifies the user-entered OTP against the one stored in sessionStorage.
 * The stored OTP is cleared after the first attempt for security.
 * @param fullPhoneNumber The full phone number (for logging purposes).
 * @param otp The 6-digit OTP code entered by the user.
 * @returns A promise that resolves to an AuthResult object.
 */
export const verifyOtp = async (fullPhoneNumber: string, otp: string): Promise<AuthResult> => {
    console.log(`[Auth Service] Verifying OTP ${otp} for ${fullPhoneNumber}`);

    try {
        const storedOtp = sessionStorage.getItem(OTP_STORAGE_KEY);
        
        // IMPORTANT: For security, immediately remove the OTP after retrieving it,
        // so it cannot be used for replay attacks.
        sessionStorage.removeItem(OTP_STORAGE_KEY);

        if (storedOtp && storedOtp === otp) {
            console.log(`[Auth Service] OTP verified successfully.`);
            return { success: true };
        } else {
            console.log(`[Auth Service] OTP verification failed. Stored: ${storedOtp}, Provided: ${otp}`);
            return { success: false, errorCode: 'INVALID_OTP' };
        }
    } catch (e) {
        console.error("Failed to read OTP from sessionStorage", e);
        return { success: false, errorCode: 'SESSION_EXPIRED' };
    }
};

export interface UserAccount {
    name: string;
    email: string;
    phone: string;
    role: 'consumer' | 'expert';
    password?: string;
    degree?: string;
    category?: string;
}

export const getRegisteredUsers = (): UserAccount[] => {
    if (typeof window === 'undefined') return [];
    try {
        const usersJson = localStorage.getItem('clarity-ai-registered-users');
        if (usersJson) {
            return JSON.parse(usersJson);
        }
    } catch (e) {
        console.error("Failed to parse registered users", e);
    }
    // Return default test user
    return [
        {
            name: 'Madhav Kalsiya',
            email: 'test@example.com',
            phone: '+15551234567',
            role: 'expert',
            password: 'password',
            degree: 'Full Stack AI Specialist',
            category: 'Computer Science & IT'
        }
    ];
};

/**
 * Simulates the final step of creating a user account after OTP verification.
 * In a real app, this would be a final call to your user creation endpoint.
 * @param userData - The user's registration data.
 * @returns A promise that resolves to an AuthResult object.
 */
export const createUserAccount = async (userData: any): Promise<AuthResult> => {
    console.log(`[Auth Service] Creating account for ${userData.email}`);
    
    // Simulate network delay for the final step.
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (typeof window !== 'undefined') {
        try {
            const users = getRegisteredUsers();
            
            // Check if email already exists
            const emailExists = users.some((u: any) => u.email.toLowerCase() === userData.email.toLowerCase());
            if (emailExists) {
                console.error("[Auth Service] Email already registered:", userData.email);
                return { success: false, errorCode: 'ACCOUNT_CREATION_FAILED' };
            }
            
            users.push(userData);
            localStorage.setItem('clarity-ai-registered-users', JSON.stringify(users));
            
            // Also automatically store this newly registered user as the active user session!
            localStorage.setItem('clarity_user_name', userData.name);
            localStorage.setItem('clarity_user_role', userData.category || (userData.role === 'expert' ? 'Specialist Expert' : 'Regular Consumer'));
            localStorage.setItem('clarity_user_email', userData.email);
            localStorage.setItem('clarity_user_status', userData.degree || 'Bringing clarity to complex challenges.');
            
            // Trigger state update event
            window.dispatchEvent(new Event('settings_updated'));
        } catch (e) {
            console.error("Failed to store user in localStorage", e);
            return { success: false, errorCode: 'SESSION_ERROR' };
        }
    }

    console.log('[Auth Service] User account created:', userData);
    return { success: true };
};

/**
 * Authenticate user with email and password.
 */
export const authenticateUser = async (email: string, password: string): Promise<{ success: boolean; user?: UserAccount; error?: string }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const users = getRegisteredUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
    if (user) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('clarity_user_name', user.name);
            localStorage.setItem('clarity_user_role', user.category || (user.role === 'expert' ? 'Specialist Expert' : 'Regular Consumer'));
            localStorage.setItem('clarity_user_email', user.email);
            localStorage.setItem('clarity_user_status', user.degree || 'Bringing clarity to complex challenges.');
            window.dispatchEvent(new Event('settings_updated'));
        }
        return { success: true, user };
    }
    return { success: false, error: 'invalidCredentials' };
};

/**
 * Authenticate user by phone number (if matching digits after clean-up)
 */
export const authenticateUserByPhone = async (phone: string): Promise<{ success: boolean; user?: UserAccount }> => {
    const users = getRegisteredUsers();
    const cleanedPhone = phone.replace(/[^\d]/g, '');
    const user = users.find(u => u.phone.replace(/[^\d]/g, '') === cleanedPhone);
    
    if (user) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('clarity_user_name', user.name);
            localStorage.setItem('clarity_user_role', user.category || (user.role === 'expert' ? 'Specialist Expert' : 'Regular Consumer'));
            localStorage.setItem('clarity_user_email', user.email);
            localStorage.setItem('clarity_user_status', user.degree || 'Bringing clarity to complex challenges.');
            window.dispatchEvent(new Event('settings_updated'));
        }
        return { success: true, user };
    }
    return { success: false };
};

/**
 * Resets the password of a registered user by email in local storage.
 */
export const resetUserPassword = async (email: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (typeof window !== 'undefined') {
        try {
            const users = getRegisteredUsers();
            
            // Allow resetting test@example.com too
            const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
            
            if (userIndex !== -1) {
                users[userIndex].password = newPassword;
                localStorage.setItem('clarity-ai-registered-users', JSON.stringify(users));
                return { success: true };
            }
            
            // If it's test@example.com and somehow wasn't backed up in localStorage yet, we seed it first
            if (email.toLowerCase() === 'test@example.com') {
                const defaultUser = {
                    name: 'Madhav Kalsiya',
                    email: 'test@example.com',
                    phone: '+15551234567',
                    role: 'expert' as const,
                    password: newPassword,
                    degree: 'Full Stack AI Specialist',
                    category: 'Computer Science & IT'
                };
                users.push(defaultUser);
                localStorage.setItem('clarity-ai-registered-users', JSON.stringify(users));
                return { success: true };
            }
            
            return { success: false, error: 'No account found with this email. Please check your spelling.' };
        } catch (e) {
            console.error("Failed to update password in localStorage", e);
            return { success: false, error: 'Database or storage error.' };
        }
    }
    return { success: false, error: 'Platform not available.' };
};
