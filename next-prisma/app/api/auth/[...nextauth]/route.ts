// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { PrismaAdapter } from "@next-auth/prisma-adapter";
// import bcrypt from "bcryptjs";
// import { prisma } from "@/lib/prisma";


// const handler = NextAuth({
//     adapter: PrismaAdapter(prisma),
//     session: { strategy: "jwt" },
//     providers: [
//         CredentialsProvider({
//             name: "Credentials",
//             credentials: {
//                 email: { label: "Email", type: "text" },
//                 password: { label: "Password", type: "password" },
//             },
//             async authorize(credentials) {
//                 if (!credentials?.email || !credentials?.password) {
//                     throw new Error("Invalid credentials");
//                 }

//                 const user = await prisma.user.findUnique({
//                     where: { email: credentials.email },
//                 });

//                 if (!user) throw new Error("User not found");

//                 const isValid = await bcrypt.compare(credentials.password, user.password);
//                 if (!isValid) throw new Error("Invalid password");

//                 return { id: user.id, name: user.name, email: user.email };
//             },
//         }),
//     ],
//     secret: process.env.NEXTAUTH_SECRET,
// });

// export { handler as GET, handler as POST };


import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// const handler = NextAuth({
//     adapter: PrismaAdapter(prisma),
//     session: { strategy: "jwt" },
//     providers: [
//         CredentialsProvider({
//             name: "Credentials",
//             credentials: {
//                 email: { label: "Email", type: "text" },
//                 password: { label: "Password", type: "password" },
//             },
//             async authorize(credentials) {
//                 if (!credentials?.email || !credentials?.password) {
//                     throw new Error("Invalid credentials");
//                 }

//                 const user = await prisma.user.findUnique({
//                     where: { email: credentials.email },
//                 });

//                 if (!user) throw new Error("User not found");

//                 const isValid = await bcrypt.compare(credentials.password, user.password);
//                 if (!isValid) throw new Error("Invalid password");

//                 // Check if the user is an admin
//                 const isAdmin = user.isAdmin || false; // Assuming 'isAdmin' is a boolean in your user model

//                 return {
//                     id: user.id,
//                     name: user.name,
//                     email: user.email,
//                     isAdmin: isAdmin
//                 };
//             },
//         }),
//     ],
//     secret: process.env.NEXTAUTH_SECRET,
//     // callbacks: {
//     //     // Customize JWT token to include the 'isAdmin' flag
//     //     async jwt({ token, user }) {
//     //         if (user) {
//     //             token.isAdmin = user.isAdmin; // Store isAdmin flag in the JWT token
//     //         }
//     //         return token;
//     //     },

//     //     // Customize session to include the 'isAdmin' flag
//     //     async session({ session, token }) {
//     //         if (token) {
//     //             session.user.isAdmin = token.isAdmin; // Attach isAdmin to session
//     //         }
//     //         return session;
//     //     },
//     // },
// });

// export { handler as GET, handler as POST };

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user) throw new Error("User not found");

                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (!isValid) throw new Error("Invalid password");

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    isAdmin: user.isAdmin || false,
                };
            },
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        // Define a proper type for token
        async jwt({ token, user }) {
            if (user) {
                token.isAdmin = user.isAdmin as boolean; // Explicitly cast it to boolean
            }
            return token;
        },

        async session({ session, token }) {
            session.user.isAdmin = token.isAdmin as boolean; // Explicitly cast it to boolean
            return session;
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
