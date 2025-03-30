"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import Link from "next/link"
import { pageLinks } from "@/constants/links"
import { UtilityHandler } from "@/helpers/form-handler"
import * as z from "zod"
import { forgetPasswordFormScheme } from "@/lib/form"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { useState } from "react"
import { OTPEmailProps } from "@/interfaces/email"
import { OTPGeneratorUtil } from "@/helpers/otp-generator"
import { toast } from "sonner"


export function ForgetPasswordForm() {
    const [sendOTP, setSendOTP] = useState(false);

    const form = useForm<z.infer<typeof forgetPasswordFormScheme>>({
        resolver: zodResolver(forgetPasswordFormScheme),
        defaultValues: {
            email_id: "",
            password: "",
            confirmPassword: "",
            sendPin: "",
            pin: "",
        }
    })
    const showButton = form.watch("email_id")?.length > 12 ? false : true;
    const sendOTPButton = async () => {
        const email = form.watch("email_id").trim();
        if (!email) {
            toast.error("Please enter a valid email address.");
            return;
        }
        const sendPin = OTPGeneratorUtil();
        setSendOTP(true);
        form.setValue("sendPin", sendPin);
        const payload: OTPEmailProps = { emailId: email, code: sendPin, task: "Sign Up" };
        UtilityHandler.onSubmitPost('/api/emails/otp', payload, `An OTP is being sent to ${email}. Please check your email.`, 'Please check your email for the OTP and enter it to proceed');
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit((payload) =>
                UtilityHandler.onSubmitPut('/api/auth', payload, `Trying to update your password`, 'You have successfully update for password try to login'))}
                className="row-span-2 py-10 mx-auto space-y-8 text-green-950">
                <div>
                    <div className="font-sans text-3xl">Forget Password</div>
                    <div className="flex items-center text-sm text-neutral-600">
                        <span>Doesn&apos;t have an account yet?</span>
                        <Link href={pageLinks.sign_up}>
                            <Button variant={"link"}>Sign Up</Button>
                        </Link>
                    </div>
                </div>

                <FormField
                    control={form.control}
                    name="email_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email Address<span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                                <Input
                                    required
                                    placeholder="user@example.com"
                                    type="email"
                                    {...field} />
                            </FormControl>
                            <FormDescription>Enter your email-id</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {
                    sendOTP ?
                        <>
                            <FormField
                                control={form.control}
                                name="pin"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>One-Time Password<span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <InputOTP maxLength={7} {...field}>
                                                <InputOTPGroup>
                                                    <InputOTPSlot index={0} />
                                                    <InputOTPSlot index={1} />
                                                    <InputOTPSlot index={2} />
                                                    <InputOTPSlot index={3} />
                                                    <InputOTPSlot index={4} />
                                                    <InputOTPSlot index={5} />
                                                    <InputOTPSlot index={6} />
                                                </InputOTPGroup>
                                            </InputOTP>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password<span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <PasswordInput required placeholder="U$er123" {...field} />
                                        </FormControl>
                                        <FormDescription>Enter your password.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password<span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <PasswordInput required placeholder="U$er123" {...field} />
                                        </FormControl>
                                        <FormDescription>Enter your password again.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </>
                        :
                        <div className="space-y-2">
                            <Button disabled={showButton} onClick={sendOTPButton}>Send OTP</Button>
                            <div className="text-sm text-neutral-600">
                                Please enter your email address to receive the one-time password.
                            </div>
                        </div>
                }
                {sendOTP && <Button type="submit">Submit</Button>}
            </form>
        </Form >
    )
}