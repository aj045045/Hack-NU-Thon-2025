import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { forgetPasswordFormScheme, signUpFormSchema } from '@/lib/form';
import { AccountType } from '@prisma/client';

// Sign-up User API
export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    // Validate input
    const validatedData = signUpFormSchema.parse(body);
    const { email_id, pin, sendPin, user_name, password, account_number, account_type } = validatedData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email_id },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Validate OTP
    if (sendPin !== pin) {
      return NextResponse.json(
        { message: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: user_name,
        email: email_id,
        password: hashedPassword,
        accountNumber: account_number,
        accountType: account_type as AccountType,
      },
      select: {
        id: true,
        name: true,
        email: true,
        accountNumber: true,
        accountType: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body: unknown = await req.json();

    // Validate input
    const validatedData = forgetPasswordFormScheme.parse(body);
    const { email_id, password, confirmPassword, pin, sendPin } = validatedData;

    // Ensure passwords match
    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    // Validate OTP
    if (sendPin !== pin) {
      return NextResponse.json(
        { message: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email_id },
      select: { id: true },
    });

    if (!existingUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and clear reset PIN
    const updatedUser = await prisma.user.update({
      where: { email: email_id },
      data: { password: hashedPassword },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({ message: 'Password updated successfully', user: updatedUser }, { status: 200 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}