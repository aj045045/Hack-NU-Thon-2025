// "use client"


// import { prisma } from "@/lib/prisma";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Home"
};

export default async function ProfilePage() {
    const users = await prisma.user.findMany();
    return (
        <div>
            Profile Page
            <ul>
                {users.map((user) => (
                    <li key={user.id}>{user.name} - {user.email} : {user.password}</li>
                ))}
            </ul>
        </div>
    )
}