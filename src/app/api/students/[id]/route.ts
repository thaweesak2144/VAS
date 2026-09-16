import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { canModifyStudents } from '@/lib/permissions';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!canModifyStudents(session.user?.role)) {
    return NextResponse.json({ error: 'Forbidden: เจ้าหน้าที่สแกนไม่มีสิทธิ์แก้ไขรายชื่อนิสิต' }, { status: 403 });
  }

  try {
    const { studentCode, fullName, groupName } = await req.json();
    const student = await prisma.student.update({
      where: { id: Number(params.id) },
      data: { studentCode, fullName, groupName }
    });
    return NextResponse.json(student);
  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!canModifyStudents(session.user?.role)) {
    return NextResponse.json({ error: 'Forbidden: เจ้าหน้าที่สแกนไม่มีสิทธิ์ลบรายชื่อนิสิต' }, { status: 403 });
  }

  try {
    await prisma.student.delete({ where: { id: Number(params.id) } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
