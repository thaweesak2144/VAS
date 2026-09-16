import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isCheckinLate } from '@/lib/timeRules';

export async function POST(req: Request) {
  try {
    const { studentCode } = await req.json();
    if (!studentCode) return NextResponse.json({ error: 'studentCode required' }, { status: 400 });

    const activeSession = await prisma.session.findFirst({
      where: { isActive: true }
    });

    if (!activeSession) {
      return NextResponse.json({ error: 'NO_SESSION', message: 'ยังไม่มีรอบที่เปิดสแกน' }, { status: 400 });
    }

    const student = await prisma.student.findUnique({
      where: { studentCode }
    });

    if (!student) {
      return NextResponse.json({ error: 'NOT_FOUND', message: 'ไม่พบข้อมูลนิสิต' }, { status: 404 });
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
      return NextResponse.json({ error: 'DUPLICATE', message: 'สแกนเช็คชื่อในรอบนี้ไปแล้ว' }, { status: 409 });
    }

    // Check if check-in time is late (> endTime)
    const now = new Date();
    const isLate = isCheckinLate(activeSession.sessionDate, activeSession.endTime, now, activeSession.startTime);

    const attendance = await prisma.attendance.create({
      data: {
        studentId: student.id,
        sessionId: activeSession.id,
        scannedAt: now,
      }
    });

    // Count total attendances for this student
    const attendedCount = await prisma.attendance.count({
      where: { studentId: student.id }
    });

    return NextResponse.json({
      success: true,
      attendance,
      isLate,
      statusLabel: isLate ? 'สาย (Late)' : 'เข้าตรงเวลา (On Time)',
      student: {
        id: student.id,
        studentCode: student.studentCode,
        fullName: student.fullName,
        groupName: student.groupName,
        attended: attendedCount,
      }
    });
  } catch (error) {
    console.error('Checkin error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
