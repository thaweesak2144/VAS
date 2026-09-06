import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ROUNDS, TOTAL_DAYS } from '@/lib/sessions';

export async function GET() {
  const sessions = await prisma.session.findMany({
    orderBy: [
      { dayNumber: 'asc' },
      { roundNumber: 'asc' },
    ],
    include: {
      _count: {
        select: { attendances: true }
      }
    }
  });
  return NextResponse.json(sessions);
}

export async function POST(req: Request) {
  try {
    const { startDate } = await req.json();
    if (!startDate) return NextResponse.json({ error: 'startDate required' }, { status: 400 });

    const start = new Date(startDate);
    let sessionCount = 0;

    for (let day = 1; day <= TOTAL_DAYS; day++) {
      const currentDay = new Date(start);
      currentDay.setDate(start.getDate() + (day - 1));

      for (const round of ROUNDS) {
        await prisma.session.upsert({
          where: {
            dayNumber_roundNumber: {
              dayNumber: day,
              roundNumber: round.roundNumber
            }
          },
          update: {
            sessionDate: currentDay,
            roundName: round.roundName,
            startTime: round.startTime,
            endTime: round.endTime,
          },
          create: {
            dayNumber: day,
            roundNumber: round.roundNumber,
            sessionDate: currentDay,
            roundName: round.roundName,
            startTime: round.startTime,
            endTime: round.endTime,
          }
        });
        sessionCount++;
      }
    }

    return NextResponse.json({ success: true, count: sessionCount });
  } catch {
    return NextResponse.json({ error: 'Failed to generate sessions' }, { status: 500 });
  }
}
