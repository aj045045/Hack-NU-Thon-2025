import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma as db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { AccountType } from "@prisma/client";

// Update a user by ID
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if the current user is admin
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized: Admin privileges required" },
        { status: 403 }
      );
    }

    const userId = params.id;
    const body = await req.json();
    
    // Extract only the fields that are provided
    const {
      user_name,
      email_id,
      password,
      account_number,
      account_type,
      isAdmin,
    } = body;

    // Prepare the update data
    const updateData: any = {};
    
    if (user_name !== undefined) updateData.name = user_name;
    if (email_id !== undefined) updateData.email = email_id;
    if (account_number !== undefined) updateData.accountNumber = account_number;
    if (account_type !== undefined) updateData.accountType = account_type as AccountType;
    if (isAdmin !== undefined) updateData.isAdmin = isAdmin;
    
    // Hash password if provided
    if (password) {
      updateData.password = await hash(password, 10);
    }

    // Validate if the user exists
    const existingUser = await db.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if the email is already in use by another user
    if (email_id && email_id !== existingUser.email) {
      const userWithEmail = await db.user.findUnique({
        where: { email: email_id },
      });

      if (userWithEmail) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 409 }
        );
      }
    }

    // Check if the account number is already in use by another user
    if (account_number && account_number !== existingUser.accountNumber) {
      const userWithAccountNumber = await db.user.findFirst({
        where: { accountNumber: account_number },
      });

      if (userWithAccountNumber) {
        return NextResponse.json(
          { error: "Account number already in use" },
          { status: 409 }
        );
      }
    }

    // Update the user
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        accountNumber: true,
        accountType: true,
        isAdmin: true,
      },
    });

    return NextResponse.json(
      { 
        message: "User updated successfully", 
        user: updatedUser 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  } finally {
    await db.$disconnect();
  }
}

// Delete a user by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if the current user is admin
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized: Admin privileges required" },
        { status: 403 }
      );
    }

    const userId = params.id;

    // Check if the user exists
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Delete the user
    await db.user.delete({
      where: { id: userId },
    });

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  } finally {
    await db.$disconnect();
  }
}

// Get a user by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if the current user is admin
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized: Admin privileges required" },
        { status: 403 }
      );
    }

    const userId = params.id;

    // Get the user
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        accountNumber: true,
        accountType: true,
        isAdmin: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  } finally {
    await db.$disconnect();
  }
} 