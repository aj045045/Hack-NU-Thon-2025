import * as z from "zod"

export const signUpFromScheme = z.object({
    user_name: z.string().min(1).min(6).max(50),
    email_id: z.string().email(),
    password: z.string().min(6),
    pin: z.string().min(6, {
        message: "Your one-time password must be 6 characters.",
    }),
    sendPin: z.string().min(6)
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