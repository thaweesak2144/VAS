import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const firstSession = await prisma.session.findFirst({ orderBy: { sessionDate: 'asc' } });
  if (!firstSession) return NextResponse.json({ eligible: false, message: 'No sessions found' });

  const startDate = new Date(firstSession.sessionDate);
  const cutoffDate = new Date(startDate);
  cutoffDate.setDate(cutoffDate.getDate() + 30);
  const now = new Date();
  const eligible = now >= cutoffDate;
  const daysLeft = Math.max(0, Math.ceil((cutoffDate.getTime() - now.getTime()) / 86400000));

  return NextResponse.json({ eligible, daysLeft, cutoffDate });
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const firstSession = await prisma.session.findFirst({ orderBy: { sessionDate: 'asc' } });
  if (!firstSession) return NextResponse.json({ error: 'No sessions found' }, { status: 400 });

  const startDate = new Date(firstSession.sessionDate);
  const cutoffDate = new Date(startDate);
  cutoffDate.setDate(cutoffDate.getDate() + 30);
  const now = new Date();

  if (now < cutoffDate) {
    return NextResponse.json({ error: 'Not eligible yet', daysLeft: Math.ceil((cutoffDate.getTime() - now.getTime()) / 86400000) }, { status: 400 });
  }

  await prisma.attendance.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.student.deleteMany({});

  return NextResponse.json({ success: true });
}
