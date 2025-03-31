import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma as db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { AccountType } from "@prisma/client";

export async function POST(req: Request) {
  try {
    // Check if the current user is admin
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized: Admin privileges required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { user_name, email_id, password, account_number, account_type, isAdmin } = body;

    // Check if user with the email already exists
    const existingUserByEmail = await db.user.findUnique({
      where: { email: email_id },
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Check if user with the account number already exists
    const existingUserByAccount = await db.user.findFirst({
      where: { accountNumber: account_number },
    });

    if (existingUserByAccount) {
      return NextResponse.json(
        { error: "User with this account number already exists" },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await hash(password, 10);

    // Create the user
    const newUser = await db.user.create({
      data: {
        name: user_name,
        email: email_id,
        accountNumber: account_number,
        accountType: account_type as AccountType,
        password: hashedPassword,
        isAdmin: true,
      },
    });

    // Return the user without the password
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      { 
        message: "User created successfully", 
        user: userWithoutPassword 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
  
  finally {
    await db.$disconnect();
  }
}

// Get all users (for admin only)
export async function GET() {
  try {
    // Check if the current user is admin
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized: Admin privileges required" },
        { status: 403 }
      );
    }

    // Get all users
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        accountNumber: true,
        accountType: true,
        isAdmin: true,
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
  
  finally {
    await db.$disconnect();
  }
} 