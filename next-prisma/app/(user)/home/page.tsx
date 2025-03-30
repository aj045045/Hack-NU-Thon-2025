import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Home"
};

// Mock user data
const mockUsers = [
    {
        id: "usr_123456789",
        name: "John Doe",
        email: "john.doe@example.com",
        password: "hashedPassword123",
        accountNumber: "ACC123456789",
        accountType: "SAVINGS",
        maxAmountLimit: 10000
    },
    {
        id: "usr_987654321",
        name: "Jane Smith",
        email: "jane.smith@example.com",
        password: "hashedPassword456",
        accountNumber: "ACC987654321",
        accountType: "CURRENT",
        maxAmountLimit: 25000
    },
    {
        id: "usr_456789123",
        name: "Alex Johnson",
        email: "alex.johnson@example.com",
        password: "hashedPassword789",
        accountNumber: "ACC456789123",
        accountType: "BUSINESS",
        maxAmountLimit: 50000
    }
];

export default function HomePage() {
    return (
        <div className="container py-10 mx-auto space-y-8 text-green-950">
            <div>
                <h1 className="font-sans text-3xl mb-2">Welcome to Fraud Detection System</h1>
                <p className="text-sm text-neutral-600">Manage your accounts and transactions securely</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Registered Users</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-green-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">Email</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">Account Number</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">Account Type</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">Max Transaction Limit</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {mockUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-green-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.accountNumber}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.accountType === "SAVINGS" ? "Savings Account" : 
                                         user.accountType === "CURRENT" ? "Current Account" : "Business Account"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{user.maxAmountLimit.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}