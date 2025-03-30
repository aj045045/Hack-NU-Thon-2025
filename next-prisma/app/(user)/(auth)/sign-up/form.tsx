"use client"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import Link from "next/link"
import { pageLinks } from "@/constants/links"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { useState } from "react"
import { UtilityHandler } from "@/helpers/form-handler"
import { OTPGeneratorUtil } from "@/helpers/otp-generator"
import { OTPEmailProps } from "@/interfaces/email"
import { signUpFormSchema } from "@/lib/form"
import * as z from "zod"
import { Check, ChevronsUpDown } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"


export function SignUpForm() {
    const [sendOTP, setSendOTP] = useState(false);
    const form = useForm<z.infer<typeof signUpFormSchema>>({
        resolver: zodResolver(signUpFormSchema),
        defaultValues: {
            user_name: "",
            email_id: "",
            password: "",
            account_number: "",
            account_type: "",
            pin: "",
            sendPin: ""
        }
    })

    const languages = [
        {
            label: 'Savings',
            value: 'SAVINGS'
        },
        {
            label: 'Current',
            value: 'CURRENT'
        }
    ];
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
                UtilityHandler.onSubmitPost('/api/auth', payload, `Handling Sign-Up Form Submission`, 'You have successfully sign up try to login now'))}
                className="row-span-2 py-10 mx-auto space-y-8 text-green-950">
                <div>
                    <div className="font-sans text-3xl">Sign Up</div>
                    <div className="flex items-center text-sm text-neutral-600">
                        <span>Already have an account? </span>
                        <Link href={pageLinks.login}>
                            <Button variant={"link"}>Login</Button>
                        </Link>
                    </div>
                </div>
                <FormField
                    control={form.control}
                    name="user_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Username<span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="John Wick"
                                    required
                                    type="text"
                                    {...field} />
                            </FormControl>
                            <FormDescription>Enter your user name</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

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
                    name="account_number"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Account number<span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                                <Input
                                    required
                                    placeholder="Account Number"
                                    type="text"
                                    {...field} />
                            </FormControl>
                            <FormDescription>Enter your account number </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="account_type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Account Type</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className={cn(
                                                "w-[200px] justify-between",
                                                !field.value && "text-muted-foreground"
                                            )}

                                        >
                                            {field.value
                                                ? languages.find(
                                                    (language) => language.value === field.value
                                                )?.label
                                                : "Select Account"}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[200px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search Account..." />
                                        <CommandList>
                                            <CommandEmpty>No Account found.</CommandEmpty>
                                            <CommandGroup>
                                                {languages.map((language) => (
                                                    <CommandItem
                                                        value={language.label}
                                                        key={language.value}
                                                        onSelect={() => {
                                                            form.setValue("account_type", language.value);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                language.value === field.value
                                                                    ? "opacity-100"
                                                                    : "opacity-0"
                                                            )}
                                                        />
                                                        {language.label}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            <FormDescription>This is the account type that will be used for account detail.</FormDescription>
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
                {
                    sendOTP ?
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
                                    <FormDescription>
                                        Please enter the one-time password sent to your email.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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

