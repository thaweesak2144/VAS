import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const group = searchParams.get('group');

  const students = await prisma.student.findMany({
    where: group ? { groupName: group } : undefined,
    orderBy: { studentCode: 'asc' },
    include: {
      attendances: {
        select: { sessionId: true, scannedAt: true }
      }
    }
  });

  const sessions = await prisma.session.findMany({
    orderBy: [{ dayNumber: 'asc' }, { roundNumber: 'asc' }]
  });

  const groups = await prisma.student.findMany({
    select: { groupName: true },
    distinct: ['groupName'],
    orderBy: { groupName: 'asc' }
  });

  return NextResponse.json({ students, sessions, groups: groups.map(g => g.groupName) });
}
