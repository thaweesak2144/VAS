import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  if (!code) return NextResponse.json({ error: 'code required' }, { status: 400 });

  const student = await prisma.student.findUnique({
    where: { studentCode: code },
    include: {
      attendances: {
        include: { session: true },
        orderBy: { scannedAt: 'asc' }
      }
    }
  });

  if (!student) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });

  const sessions = await prisma.session.findMany({
    orderBy: [{ dayNumber: 'asc' }, { roundNumber: 'asc' }]
  });

  const total = sessions.length;
  const attended = student.attendances.length;
  const percent = total > 0 ? Math.round((attended / total) * 100) : 0;

  return NextResponse.json({ student, sessions, attended, total, percent });
}
