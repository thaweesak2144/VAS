import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { studentCode } = await req.json();
    if (!studentCode) return NextResponse.json({ error: 'studentCode required' }, { status: 400 });

    const activeSession = await prisma.session.findFirst({
      where: { isActive: true }
    });

    if (!activeSession) {
      return NextResponse.json({ error: 'NO_SESSION', message: 'No active session' }, { status: 400 });
    }

    const student = await prisma.student.findUnique({
      where: { studentCode }
    });

    if (!student) {
      return NextResponse.json({ error: 'NOT_FOUND', message: 'Student not found' }, { status: 404 });
    }

    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        studentId_sessionId: {
          studentId: student.id,
          sessionId: activeSession.id
        }
      }
    });

    if (existingAttendance) {
      return NextResponse.json({ error: 'DUPLICATE', message: 'Already checked in' }, { status: 409 });
    }

    const attendance = await prisma.attendance.create({
      data: {
        studentId: student.id,
        sessionId: activeSession.id
      }
    });

    return NextResponse.json({ success: true, attendance, student });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
