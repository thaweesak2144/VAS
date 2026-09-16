import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { canToggleAttendance } from '@/lib/permissions';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!canToggleAttendance(session.user?.role)) {
    return NextResponse.json({ error: 'Forbidden: เจ้าหน้าที่สแกนไม่มีสิทธิ์แก้ไขข้อมูลตารางประเมินผล' }, { status: 403 });
  }

  try {
    const { studentId, sessionId } = await req.json();

    if (!studentId || !sessionId) {
      return NextResponse.json({ error: 'Missing studentId or sessionId' }, { status: 400 });
    }

    const existing = await prisma.attendance.findUnique({
      where: {
        studentId_sessionId: {
          studentId: Number(studentId),
          sessionId: Number(sessionId),
        },
      },
    });

    if (existing) {
      await prisma.attendance.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ status: 'removed' });
    } else {
      const created = await prisma.attendance.create({
        data: {
          studentId: Number(studentId),
          sessionId: Number(sessionId),
        },
      });
      return NextResponse.json({ status: 'added', attendance: created });
    }
  } catch (error) {
    console.error('Toggle attendance error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
