import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { students } = await req.json();
    if (!Array.isArray(students) || students.length === 0) {
      return NextResponse.json({ error: 'No students data' }, { status: 400 });
    }

    let imported = 0;
    let skipped = 0;

    for (const s of students) {
      if (!s.studentCode || !s.fullName || !s.groupName) { skipped++; continue; }
      try {
        await prisma.student.upsert({
          where: { studentCode: String(s.studentCode) },
          update: { fullName: s.fullName, groupName: s.groupName },
          create: { studentCode: String(s.studentCode), fullName: s.fullName, groupName: s.groupName }
        });
        imported++;
      } catch {
        skipped++;
      }
    }

    return NextResponse.json({ success: true, imported, skipped });
  } catch {
    return NextResponse.json({ error: 'Import failed' }, { status: 500 });
  }
}
