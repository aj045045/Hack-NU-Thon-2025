"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { PasswordInput } from "@/components/ui/password-input"
import { useSession } from "next-auth/react"
import { useEffect, useState, Suspense, useCallback } from "react"
import { User, AccountType } from "@prisma/client"
import { toast } from "sonner"

// Define the type for user data from Prisma
type UserWithCounts = User & {
  _count: {
    transactionsSent: number;
    transactionsReceived: number;
    fraudReports: number;
  }
  recentTransactions?: {
    id: string;
    amount: number;
    date: string;
    type: 'sent' | 'received';
    to?: string;
    from?: string;
  }[];
};

// Fallback mock user data
const mockUser = {
  id: "usr_123456789",
  name: "John Doe",
  email: "john.doe@example.com",
  password: "hashedPassword123",
  accountNumber: "ACC123456789",
  accountType: "SAVINGS" as AccountType,
  maxAmountLimit: 10000,
  pin: "123456",
  _count: {
  transactionsSent: 24,
  transactionsReceived: 18,
  fraudReports: 0,
  },
  recentTransactions: [
    { id: "txn_1", amount: 1500, date: "2025-03-28", type: 'sent' as const, to: "Jane Smith" },
    { id: "txn_2", amount: 2500, date: "2025-03-25", type: 'received' as const, from: "Alex Johnson" },
    { id: "txn_3", amount: 500, date: "2025-03-20", type: 'sent' as const, to: "Michael Brown" }
  ]
};

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
})

// Loading component
function LoadingProfile() {
  return (
    <div className="container py-20 mx-auto text-center">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-green-200 border-t-green-600 animate-spin"></div>
        <h2 className="text-xl font-medium text-green-800">Loading your profile...</h2>
        <p className="text-sm text-green-600">Please wait while we fetch your information</p>
      </div>
    </div>
  );
}

// Not logged in component
function NotLoggedIn() {
  return (
    <div className="container py-20 mx-auto text-center">
      <div className="max-w-md mx-auto bg-green-100 rounded-lg p-8 shadow-sm">
        <h2 className="text-2xl font-medium text-green-800 mb-4">Not Logged In</h2>
        <p className="text-green-700 mb-6">Please log in to view your profile information.</p>
        <Button className="bg-green-600 hover:bg-green-700" onClick={() => window.location.href = "/login"}>
          Go to Login
        </Button>
      </div>
    </div>
  );
}

// The main profile content component
function ProfileContent({ user, updateUserData }: { user: UserWithCounts; updateUserData: () => void }) {
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [isSubmittingAccount, setIsSubmittingAccount] = useState(false);
  const [sheetOpen, setSheetOpen] = useState<{ profile: boolean; password: boolean; account: boolean }>({
    profile: false,
    password: false,
    account: false
  });

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
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
      maxAmountLimit: user.maxAmountLimit || 0,
    },
  })

  async function onProfileSubmit(values: z.infer<typeof profileFormSchema>) {
    try {
      // Only send data that has actually changed
      const changedValues = {} as any;
      if (values.name !== user.name) {
        changedValues.name = values.name;
      }
      
      // Don't allow email to be changed as it's tied to authentication
      // We'll make the email field read-only in the form

      // If nothing has changed, show a message and return
      if (Object.keys(changedValues).length === 0) {
        toast.info('No changes were made');
        setSheetOpen(prev => ({ ...prev, profile: false }));
        return;
      }

      setIsSubmittingProfile(true);
      const response = await fetch('/api/user/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(changedValues),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }
      
      toast.success('Profile updated successfully');
      setSheetOpen(prev => ({ ...prev, profile: false }));
      updateUserData(); // Refresh user data
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsSubmittingProfile(false);
    }
  }

  async function onPasswordSubmit(values: z.infer<typeof passwordFormSchema>) {
    try {
      setIsSubmittingPassword(true);
      const response = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update password');
      }
      
      toast.success('Password updated successfully');
      passwordForm.reset();
      setSheetOpen(prev => ({ ...prev, password: false }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update password');
    } finally {
      setIsSubmittingPassword(false);
    }
  }

  async function onAccountSubmit(values: z.infer<typeof accountFormSchema>) {
    try {
      // Only send data that has actually changed
      const changedValues = {} as any;
      if (values.maxAmountLimit !== user.maxAmountLimit) {
        changedValues.maxAmountLimit = values.maxAmountLimit;
      }
      
      // If nothing has changed, show a message and return
      if (Object.keys(changedValues).length === 0) {
        toast.info('No changes were made');
        setSheetOpen(prev => ({ ...prev, account: false }));
        return;
      }

      setIsSubmittingAccount(true);
      const response = await fetch('/api/user/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(changedValues),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update account information');
      }
      
      toast.success('Account information updated successfully');
      setSheetOpen(prev => ({ ...prev, account: false }));
      updateUserData(); // Refresh user data
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update account information');
    } finally {
      setIsSubmittingAccount(false);
    }
  }

  const accountTypeLabel = {
    "SAVINGS": "Savings Account",
    "CURRENT": "Current Account",
    "BUSINESS": "Business Account"
  }[user.accountType || "SAVINGS"]

  return (
    <div className="container py-10 mx-auto space-y-8 text-green-950">
      <div>
        <h1 className="font-sans text-3xl mb-2">Welcome, {user.name}</h1>
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
                <p className="text-base font-medium">{user.id}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-green-800">Name</h3>
                <p className="text-base font-medium">{user.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-green-800">Email</h3>
                <p className="text-base font-medium">{user.email}</p>
              </div>
            </div>

            <div className="mt-4">
              <Sheet open={sheetOpen.profile} onOpenChange={(open) => setSheetOpen(prev => ({ ...prev, profile: open }))}>
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
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input 
                                readOnly 
                                disabled
                                placeholder="john.doe@example.com" 
                                className="border-green-300 focus:border-green-400 focus:ring-green-200 bg-gray-50" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>Your email address (cannot be changed)</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end mt-8">
                        <Button 
                          type="submit" 
                          className="bg-green-600 hover:bg-green-700"
                          disabled={isSubmittingProfile}
                        >
                          {isSubmittingProfile ? "Saving..." : "Save Changes"}
                        </Button>
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
                <p className="text-base font-medium">{user.accountNumber}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-green-800">Account Type</h3>
                <p className="text-base font-medium">{accountTypeLabel}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-green-800">Maximum Transaction Limit</h3>
                <p className="text-base font-medium">₹{user.maxAmountLimit?.toLocaleString() || '0'}</p>
              </div>
            </div>

            <div className="mt-4">
              <Sheet open={sheetOpen.account} onOpenChange={(open) => setSheetOpen(prev => ({ ...prev, account: open }))}>
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
                      <div className="flex justify-end mt-8">
                        <Button 
                          type="submit" 
                          className="bg-green-600 hover:bg-green-700"
                          disabled={isSubmittingAccount}
                        >
                          {isSubmittingAccount ? "Updating..." : "Update Account"}
                        </Button>
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
                <p className="text-base font-medium">{user._count?.transactionsSent || 0}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-green-800">Transactions Received</h3>
                <p className="text-base font-medium">{user._count?.transactionsReceived || 0}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-green-800">Fraud Reports</h3>
                <p className="text-base font-medium">{user._count?.fraudReports || 0}</p>
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
                          {user.recentTransactions?.map((transaction) => (
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
            <Sheet open={sheetOpen.password} onOpenChange={(open) => setSheetOpen(prev => ({ ...prev, password: open }))}>
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
                      <Button 
                        type="submit" 
                        className="bg-green-600 hover:bg-green-700"
                        disabled={isSubmittingPassword}
                      >
                        {isSubmittingPassword ? "Updating..." : "Update Password"}
                      </Button>
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

// Main component that handles state and renders appropriate content
export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<UserWithCounts | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Function to fetch user data
  const fetchUserData = useCallback(async () => {
    if (!session?.user?.email) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/user?email=${encodeURIComponent(session.user.email)}`);
      const data = await response.json();
      
      if (data.user) {
        setUserData(data.user);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      toast.error('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  }, [session]);
  
  // Fetch user data on load and when session changes
  useEffect(() => {
    if (session?.user?.email) {
      fetchUserData();
    } else if (status !== "loading") {
      // If session is done loading but no user exists
      setIsLoading(false);
    }
  }, [session, status, fetchUserData]);
  
  // Render appropriate component based on state
  if (isLoading || status === "loading") {
    return <LoadingProfile />;
  }
  
  if (!session) {
    return <NotLoggedIn />;
  }
  
  return <ProfileContent user={userData || mockUser} updateUserData={fetchUserData} />;
}
