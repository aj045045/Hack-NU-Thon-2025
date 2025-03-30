// import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'

// export function middleware(request: NextRequest) {
//     const path = request.nextUrl.pathname;
//     const isCustomer = path.startsWith("/u");
//     // const isAdmin = path.startsWith("/admin",);
//     const token = request.cookies.get('token');
//     if (isCustomer && !token) {
//         return NextResponse.redirect(new URL('/login', request.url));
//     }
//     // if (isAdmin && !token) {
//     // return NextResponse.redirect(new URL('/login', request.url));
//     // }
//     NextResponse.next();
// }

// export const config = {
//     matcher: ['/admin/:path*', '/u/:path*']
// }



import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware() {
        return NextResponse.next(); // Allow the request if authenticated
    },
    {
        pages: {
            signIn: "/login", // Redirect to /login if not signed in
        },
    }
);

export const config = {
    matcher: ["/admin/:path*", "/u/:path*"], // Protect these routes
};
