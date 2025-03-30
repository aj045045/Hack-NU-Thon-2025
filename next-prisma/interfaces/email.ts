export interface OTPEmailProps {
    task: string;
    code: string;
    emailId: string;
}

export interface WelcomeEmailProps {
    name: string;
    email: string;
    createdAt: string;
}