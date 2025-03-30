import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    if (token.isAdmin) {
        if (!new URL(req.url).pathname.startsWith("/admin")) {
            return NextResponse.redirect(new URL("/admin/dashboard", req.url));
        }
        return NextResponse.next();
    }

    if (!token.isAdmin) {
        if (new URL(req.url).pathname.startsWith("/admin")) {
            return NextResponse.redirect(new URL("/u/dashboard", req.url));
        }
        if (!new URL(req.url).pathname.startsWith("/u")) {
            return NextResponse.redirect(new URL("/u/dashboard", req.url));
        }
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/u/:path*"],
};
