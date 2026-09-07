export interface VerificationToken {
    id: string;
    user_id: string; 
    type: 'PASSWORD_RESET' | 'EMAIL_VERIFICATION';
    token_hash: string;
    created_at: Date;
    expires_at: Date;
}