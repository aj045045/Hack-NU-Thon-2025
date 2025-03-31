import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function PATCH(request: NextRequest) {
  try {
    // Get the session to verify authentication
    const session = await getServerSession();
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the request body
    const data = await request.json();
    const { name, maxAmountLimit } = data;
    
    // If email is in the request body, reject the request
    if ('email' in data) {
      return NextResponse.json({ 
        error: 'Email cannot be changed through this endpoint' 
      }, { status: 400 });
    }

    // Validate the input data
    if (name !== undefined && (typeof name !== 'string' || name.length < 2)) {
      return NextResponse.json({ 
        error: 'Name must be at least 2 characters long' 
      }, { status: 400 });
    }

    if (maxAmountLimit !== undefined) {
      const limit = parseFloat(maxAmountLimit);
      if (isNaN(limit) || limit < 1000) {
        return NextResponse.json({ 
          error: 'Maximum amount limit must be at least 1,000' 
        }, { status: 400 });
      }
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prepare update data with only the fields that are provided
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (maxAmountLimit !== undefined) updateData.maxAmountLimit = parseFloat(maxAmountLimit);

    // If no data to update, return early
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ 
        message: 'No changes to apply',
        user: { 
          id: user.id,
          name: user.name,
          email: user.email,
          accountNumber: user.accountNumber,
          accountType: user.accountType,
          maxAmountLimit: user.maxAmountLimit
        }
      });
    }

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData
    });

    // Return the updated user (without password)
    const { password, ...userWithoutPassword } = updatedUser;
    return NextResponse.json({ 
      message: 'Profile updated successfully',
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 