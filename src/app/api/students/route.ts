import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const students = await prisma.student.findMany({
    orderBy: { studentCode: 'asc' },
    include: { _count: { select: { attendances: true } } }
  });
  return NextResponse.json(students);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { studentCode, fullName, groupName } = await req.json();
    if (!studentCode || !fullName || !groupName) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const student = await prisma.student.create({
      data: { studentCode, fullName, groupName }
    });
    return NextResponse.json(student, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'studentCode already exists' }, { status: 409 });
  }
}
