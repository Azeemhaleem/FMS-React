// src/types/auth.d.ts
export interface User {
    email_verified_at?: {
        data?: boolean;
    };
    username: string;
    email: string;
    receives_email_notifications?: boolean;
    // Add other user properties
}

export interface AuthData {
    token: string;
    user: User;
}