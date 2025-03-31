"use client"
import { useState } from "react"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle,
  SheetTrigger,
  SheetFooter
} from "@/components/ui/sheet"
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { UserPlus } from "lucide-react"

// Define a schema for the add user form
const addUserFormSchema = z.object({
  user_name: z.string().min(6, { message: "Username must be at least 6 characters long." }),
  email_id: z.string().email({ message: "Invalid email format." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long." }),
  account_number: z.string().min(11, { message: "Account number must be at least 11 characters." }),
  account_type: z.string(),
  isAdmin: z.boolean().default(true)
});

type AddUserFormValues = z.infer<typeof addUserFormSchema>;

export function AddUserSheet() {
  const [open, setOpen] = useState(false);
  
  const form = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserFormSchema),
    defaultValues: {
      user_name: "",
      email_id: "",
      password: "",
      account_number: "",
      account_type: "SAVINGS",
      isAdmin: true
    }
  });

  const onSubmit = async (data: AddUserFormValues) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }
      
      toast.success('Admin user created successfully');
      form.reset();
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create admin user');
      console.error(error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="flex h-8 w-full items-center justify-start gap-2 rounded-md p-2 text-sm transition-colors data-[state=open]:bg-green-400/30 hover:bg-green-400 hover:border hover:border-green-600 focus-visible:outline-none">
          <UserPlus className="h-4 w-4 shrink-0" />
          <span data-sidebar-trigger-content>Add Admin</span>
        </button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md px-5">
        <SheetHeader>
          <SheetTitle>Add New Admin</SheetTitle>
          <SheetDescription>
            Create a new user account with admin privileges.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        {...field} 
                      />
                    </FormControl>
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
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="account_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number<span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input
                        required
                        placeholder="Account Number"
                        type="text"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="account_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Type<span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <select
                        className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs focus-visible:border-ring focus-visible:ring-lime-600/40 focus-visible:ring-[3px]"
                        {...field}
                      >
                        <option value="SAVINGS">Savings</option>
                        <option value="CURRENT">Current</option>
                      </select>
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
                      <PasswordInput required placeholder="Password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <SheetFooter>
                <Button type="submit" className="w-full">Create Admin</Button>
              </SheetFooter>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
} 