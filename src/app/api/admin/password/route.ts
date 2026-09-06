import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const admin = await prisma.admin.findUnique({
      where: { username: session.user?.name ?? '' }
    });

    if (!admin) return NextResponse.json({ error: 'Admin not found' }, { status: 404 });

    const isValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isValid) return NextResponse.json({ error: 'Wrong current password' }, { status: 400 });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.admin.update({ where: { id: admin.id }, data: { password: hashed } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
