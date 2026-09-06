import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const activeSession = await prisma.session.findFirst({
    where: { isActive: true },
    include: {
      _count: {
        select: { attendances: true }
      }
    }
  });
  return NextResponse.json(activeSession || { message: 'No active session' });
}

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId) return NextResponse.json({ error: 'sessionId required' }, { status: 400 });

    await prisma.session.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });

    const activated = await prisma.session.update({
      where: { id: sessionId },
      data: { isActive: true }
    });

    return NextResponse.json(activated);
  } catch {
    return NextResponse.json({ error: 'Failed to activate session' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await prisma.session.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to close session' }, { status: 500 });
  }
}
