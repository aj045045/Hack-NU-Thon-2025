import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    const url = new URL(req.url);
    const pathname = url.pathname;

    // If user is not authenticated, redirect to login
    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    // Admin user logic: Only allow access to "/admin/*" routes
    if (token.isAdmin) {
        if (!pathname.startsWith("/admin")) {
            return NextResponse.redirect(new URL("/admin/dashboard", req.url));
        }
        return NextResponse.next();
    }

    // Non-admin user logic: Redirect away from "/admin/*"
    if (pathname.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/u/dashboard", req.url));
    }

    // Regular users should only access "/u/*" routes
    if (!pathname.startsWith("/u")) {
        return NextResponse.redirect(new URL("/u/dashboard", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/u/:path*"], // Apply middleware to all routes
};
