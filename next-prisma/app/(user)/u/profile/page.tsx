"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { PasswordInput } from "@/components/ui/password-input"
import { Separator } from "@/components/ui/separator"

// Mock user data - in production, this would come from an API or context
const mockUser = {
  id: "usr_123456789",
  name: "John Doe",
  email: "john.doe@example.com",
  password: "hashedPassword123",
  accountNumber: "ACC123456789",
  accountType: "SAVINGS",
  maxAmountLimit: 10000,
  pin: "123456",
  transactionsSent: 24,
  transactionsReceived: 18,
  fraudReports: 0,
  recentTransactions: [
    { id: "txn_1", amount: 1500, date: "2025-03-28", type: "sent", to: "Jane Smith" },
    { id: "txn_2", amount: 2500, date: "2025-03-25", type: "received", from: "Alex Johnson" },
    { id: "txn_3", amount: 500, date: "2025-03-20", type: "sent", to: "Michael Brown" }
  ]
}

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
})

const passwordFormSchema = z.object({
  currentPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
  newPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

const accountFormSchema = z.object({
  maxAmountLimit: z.coerce.number().min(1000, { message: "Limit must be at least ₹1,000." }),
  pin: z.string().min(6, { message: "PIN must be at least 6 characters." }).max(6, { message: "PIN must be maximum 6 characters." }),
})

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: mockUser.name,
      email: mockUser.email,
    },
  })

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const accountForm = useForm<z.infer<typeof accountFormSchema>>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      maxAmountLimit: mockUser.maxAmountLimit,
      pin: mockUser.pin,
    },
  })

  function onProfileSubmit(values: z.infer<typeof profileFormSchema>) {
    // In a real app, you would update the profile using an API
    console.log(values)
    setIsEditing(false)
  }

  function onPasswordSubmit(values: z.infer<typeof passwordFormSchema>) {
    // In a real app, you would update the password using an API
    console.log(values)
  }

  function onAccountSubmit(values: z.infer<typeof accountFormSchema>) {
    // In a real app, you would update the account info using an API
    console.log(values)
  }

  const accountTypeLabel = {
    "SAVINGS": "Savings Account",
    "CURRENT": "Current Account",
    "BUSINESS": "Business Account"
  }[mockUser.accountType]

  return (
    <div className="container py-10 mx-auto space-y-8 text-green-950">
      <div>
        <h1 className="font-sans text-3xl mb-2">My Profile</h1>
        <p className="text-sm text-neutral-600">Manage your account information and settings</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="bg-green-100 rounded-lg overflow-hidden shadow-sm">
          <div className="bg-green-200 p-4 border-b border-green-300">
            <h2 className="text-xl font-medium text-green-950">Personal Information</h2>
            <p className="text-sm text-green-800">Your basic account information</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-green-800">User ID</h3>
                <p className="text-base font-medium">{mockUser.id}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-green-800">Name</h3>
                <p className="text-base font-medium">{mockUser.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-green-800">Email</h3>
                <p className="text-base font-medium">{mockUser.email}</p>
              </div>
            </div>

            <div className="mt-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button size="sm" variant="outline" className="border-green-400 text-green-700 bg-white hover:bg-green-50 hover:text-green-800">Edit Profile</Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md border-l border-green-200 p-0 overflow-hidden">
                  <SheetHeader className="bg-green-200 p-6 border-b border-green-300">
                    <SheetTitle className="text-green-950">Edit Profile</SheetTitle>
                    <SheetDescription className="text-green-800">
                      Update your personal information
                    </SheetDescription>
                  </SheetHeader>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6 p-6 bg-white">
                      <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name<span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" className="border-green-300 focus:border-green-400 focus:ring-green-200" {...field} />
                            </FormControl>
                            <FormDescription>Your full name</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email<span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input placeholder="john.doe@example.com" className="border-green-300 focus:border-green-400 focus:ring-green-200" {...field} />
                            </FormControl>
                            <FormDescription>Your email address</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end mt-8">
                        <Button type="submit" className="bg-green-600 hover:bg-green-700">Save Changes</Button>
                      </div>
                    </form>
                  </Form>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        <div className="bg-green-100 rounded-lg overflow-hidden shadow-sm">
          <div className="bg-green-200 p-4 border-b border-green-300">
            <h2 className="text-xl font-medium text-green-950">Account Information</h2>
            <p className="text-sm text-green-800">Your bank account details</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-green-800">Account Number</h3>
                <p className="text-base font-medium">{mockUser.accountNumber}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-green-800">Account Type</h3>
                <p className="text-base font-medium">{accountTypeLabel}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-green-800">Maximum Transaction Limit</h3>
                <p className="text-base font-medium">₹{mockUser.maxAmountLimit.toLocaleString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-green-800">PIN</h3>
                <p className="text-base font-medium">••••••</p>
              </div>
            </div>

            <div className="mt-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button size="sm" variant="outline" className="border-green-400 text-green-700 bg-white hover:bg-green-50 hover:text-green-800">Edit Account Info</Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md border-l border-green-200 p-0 overflow-hidden">
                  <SheetHeader className="bg-green-200 p-6 border-b border-green-300">
                    <SheetTitle className="text-green-950">Edit Account Information</SheetTitle>
                    <SheetDescription className="text-green-800">
                      Update your account settings and limits
                    </SheetDescription>
                  </SheetHeader>
                  <Form {...accountForm}>
                    <form onSubmit={accountForm.handleSubmit(onAccountSubmit)} className="space-y-6 p-6 bg-white">
                      <FormField
                        control={accountForm.control}
                        name="maxAmountLimit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maximum Transaction Limit<span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="10000" className="border-green-300 focus:border-green-400 focus:ring-green-200" {...field} />
                            </FormControl>
                            <FormDescription>Maximum amount for a single transaction (in ₹)</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={accountForm.control}
                        name="pin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account PIN<span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <PasswordInput maxLength={6} placeholder="123456" className="border-green-300 focus:border-green-400 focus:ring-green-200" {...field} />
                            </FormControl>
                            <FormDescription>6-digit PIN for account transactions</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end mt-8">
                        <Button type="submit" className="bg-green-600 hover:bg-green-700">Update Account</Button>
                      </div>
                    </form>
                  </Form>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        <div className="bg-green-100 rounded-lg overflow-hidden shadow-sm">
          <div className="bg-green-200 p-4 border-b border-green-300">
            <h2 className="text-xl font-medium text-green-950">Transaction Activity</h2>
            <p className="text-sm text-green-800">Overview of your transaction history</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-green-800">Transactions Sent</h3>
                <p className="text-base font-medium">{mockUser.transactionsSent}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-green-800">Transactions Received</h3>
                <p className="text-base font-medium">{mockUser.transactionsReceived}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-green-800">Fraud Reports</h3>
                <p className="text-base font-medium">{mockUser.fraudReports}</p>
              </div>
            </div>

            <div className="mt-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button size="sm" variant="outline" className="border-green-400 text-green-700 bg-white hover:bg-green-50 hover:text-green-800">View Transactions</Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md border-l border-green-200 p-0 overflow-hidden">
                  <SheetHeader className="bg-green-200 p-6 border-b border-green-300">
                    <SheetTitle className="text-green-950">Recent Transactions</SheetTitle>
                    <SheetDescription className="text-green-800">
                      Your recent transaction activity
                    </SheetDescription>
                  </SheetHeader>
                  <div className="p-6 space-y-6 bg-white">
                    <div className="rounded-md border border-green-200 overflow-hidden shadow-sm">
                      <table className="min-w-full divide-y divide-green-200">
                        <thead className="bg-green-100">
                          <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-green-800 uppercase">Date</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-green-800 uppercase">Amount</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-green-800 uppercase">Type</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-green-800 uppercase">With</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-green-100">
                          {mockUser.recentTransactions.map((transaction) => (
                            <tr key={transaction.id} className="hover:bg-green-50">
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{transaction.date}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                <span className={transaction.type === 'received' ? 'text-green-600' : 'text-red-600'}>
                                  {transaction.type === 'received' ? '+' : '-'}₹{transaction.amount}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 capitalize">{transaction.type}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                {transaction.type === 'received' ? transaction.from : transaction.to}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="text-center">
                      <Button variant="outline" className="w-full border-green-400 text-green-700 bg-white hover:bg-green-50 hover:text-green-800">View All Transactions</Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        <div className="bg-green-100 rounded-lg overflow-hidden shadow-sm">
          <div className="bg-green-200 p-4 border-b border-green-300">
            <h2 className="text-xl font-medium text-green-950">Security</h2>
            <p className="text-sm text-green-800">Change your password</p>
          </div>
          <div className="p-6 space-y-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="sm" variant="outline" className="border-green-400 text-green-700 bg-white hover:bg-green-50 hover:text-green-800">Change Password</Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md border-l border-green-200 p-0 overflow-hidden">
                <SheetHeader className="bg-green-200 p-6 border-b border-green-300">
                  <SheetTitle className="text-green-950">Change Password</SheetTitle>
                  <SheetDescription className="text-green-800">
                    Update your password to keep your account secure
                  </SheetDescription>
                </SheetHeader>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6 p-6 bg-white">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password<span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <PasswordInput required placeholder="••••••••" className="border-green-300 focus:border-green-400 focus:ring-green-200" {...field} />
                          </FormControl>
                          <FormDescription>Enter your current password</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password<span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <PasswordInput required placeholder="••••••••" className="border-green-300 focus:border-green-400 focus:ring-green-200" {...field} />
                          </FormControl>
                          <FormDescription>Enter your new password</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password<span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <PasswordInput required placeholder="••••••••" className="border-green-300 focus:border-green-400 focus:ring-green-200" {...field} />
                          </FormControl>
                          <FormDescription>Confirm your new password</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end mt-8">
                      <Button type="submit" className="bg-green-600 hover:bg-green-700">Update Password</Button>
                    </div>
                  </form>
                </Form>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  )
}
