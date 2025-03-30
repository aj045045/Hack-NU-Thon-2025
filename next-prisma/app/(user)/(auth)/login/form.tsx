"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import Link from "next/link"
import { pageLinks } from "@/constants/links"
// import { UtilityHandler } from "@/helpers/form-handler"
import * as z from "zod"
import { loginFormScheme } from "@/lib/form"
import { signIn } from "next-auth/react";

interface LoginForm {
    email_id: string;
    password: string;
}

export function LoginForm() {
    const form = useForm<z.infer<typeof loginFormScheme>>({
        resolver: zodResolver(loginFormScheme),
        defaultValues: {
            email_id: "",
            password: "",
        }
    })

    const onSubmit = async (data: LoginForm) => {
        const res = await signIn("credentials", { email: data.email_id, password: data.password, redirect: false });
        if (!res?.error) window.location.href = pageLinks.home;
    };

    // SESSIONS DATAS
    // const { data: session } = useSession();
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}
                // UtilityHandler.onSubmitPost('/api/auth', payload, 'Handling Sign-Up Form Submission', 'You have successfully sign up try to login'))}
                className="row-span-2 py-10 mx-auto space-y-8 text-green-950">
                <div>
                    <div className="font-sans text-3xl">Login</div>
                    <div className="flex items-center text-sm text-neutral-600">
                        <span>Doesn&apos;t have an account yet? </span>
                        <Link href={pageLinks.sign_up}>
                            <Button variant={"link"}>Sign Up</Button>
                        </Link>
                        {/* <div>Welcome, {session?.user?.name}</div> */}
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
                            <Link href={pageLinks.forget_password}>
                                <Button variant={"link"}>Forget Password?</Button>
                            </Link>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit">Submit</Button>

            </form>
        </Form >
    )
}