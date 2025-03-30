import * as z from "zod"

export const signUpFormSchema = z.object({
    user_name: z.string().min(6, { message: "User name must be at least 6 characters long." }).max(50, { message: "User name cannot be longer than 50 characters." }),
    email_id: z.string().email({ message: "Invalid email format." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters long." }),
    account_number: z.string().min(11, { message: "Account number must be at least 11 characters long." }).max(20, { message: "Account number cannot exceed 20 characters." }),
    account_type: z.string().min(11, { message: "Account type must be at least 11 characters long." }).max(20, { message: "Account type cannot exceed 20 characters." }),
    pin: z.string().length(6, { message: "Your one-time password must be exactly 6 characters." }),  // Exact length for pin
    sendPin: z.string().length(6, { message: "Send Pin must be exactly 6 characters." }),  // Ensuring sendPin is also exactly 6 characters
});

export const loginFormScheme = z.object({
    email_id: z.string().email(),
    password: z.string().min(6),
});

export const forgetPasswordFormScheme = z.object({
    email_id: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
    pin: z.string().min(6, {
        message: "Your one-time password must be 6 characters.",
    }),
    sendPin: z.string().min(6)
});