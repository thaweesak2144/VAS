import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { canManageUsers } from '@/lib/permissions';

// GET all users
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canManageUsers(session.user?.role)) {
    return NextResponse.json({ error: 'Forbidden: สิทธิ์เฉพาะผู้ดูแลระบบเท่านั้น' }, { status: 403 });
  }

  const users = await prisma.admin.findMany({
    select: {
      id: true,
      username: true,
      displayName: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(users);
}

// POST create user
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canManageUsers(session.user?.role)) {
    return NextResponse.json({ error: 'Forbidden: สิทธิ์เฉพาะผู้ดูแลระบบเท่านั้น' }, { status: 403 });
  }

  try {
    const { username, password, displayName, role } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' }, { status: 400 });
    }

    const existing = await prisma.admin.findUnique({
      where: { username: username.trim() },
    });

    if (existing) {
      return NextResponse.json({ error: 'ชื่อผู้ใช้นี้มีในระบบแล้ว' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.admin.create({
      data: {
        username: username.trim(),
        password: hashedPassword,
        displayName: displayName ? displayName.trim() : null,
        role: role === 'SCANNER' ? 'SCANNER' : 'BACKOFFICE',
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT update user (username, displayName, role, or password)
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canManageUsers(session.user?.role)) {
    return NextResponse.json({ error: 'Forbidden: สิทธิ์เฉพาะผู้ดูแลระบบเท่านั้น' }, { status: 403 });
  }

  try {
    const { id, username, password, displayName, role } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const existing = await prisma.admin.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if new username conflicts with another user
    if (username && username.trim() !== existing.username) {
      const conflict = await prisma.admin.findUnique({
        where: { username: username.trim() },
      });
      if (conflict) {
        return NextResponse.json({ error: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว' }, { status: 400 });
      }
    }

    const updateData: {
      username?: string;
      displayName?: string | null;
      role?: string;
      password?: string;
    } = {};

    if (username) updateData.username = username.trim();
    if (displayName !== undefined) updateData.displayName = displayName ? displayName.trim() : null;
    if (role) updateData.role = role === 'SCANNER' ? 'SCANNER' : 'BACKOFFICE';

    if (password && password.trim().length > 0) {
      if (password.trim().length < 6) {
        return NextResponse.json({ error: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร' }, { status: 400 });
      }
      updateData.password = await bcrypt.hash(password.trim(), 10);
    }

    const updated = await prisma.admin.update({
      where: { id: Number(id) },
      data: updateData,
      select: {
        id: true,
        username: true,
        displayName: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE user
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canManageUsers(session.user?.role)) {
    return NextResponse.json({ error: 'Forbidden: สิทธิ์เฉพาะผู้ดูแลระบบเท่านั้น' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Prevent deleting the last backoffice admin
    const totalAdmins = await prisma.admin.count();
    if (totalAdmins <= 1) {
      return NextResponse.json({ error: 'ไม่สามารถลบผู้ดูแลระบบคนสุดท้ายได้' }, { status: 400 });
    }

    await prisma.admin.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
