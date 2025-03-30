import { DefaultSession } from "next-auth";

// Extend the default User type
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name: string;
            email: string;
            isAdmin: boolean;
        } & DefaultSession["user"];
    }

    interface User {
        id: string;
        name: string;
        email: string;
        isAdmin: boolean;
    }
}
