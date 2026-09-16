import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

async function backup() {
  const prisma = new PrismaClient();
  try {
    const admins = await prisma.admin.findMany();
    const students = await prisma.student.findMany();
    const sessions = await prisma.session.findMany();
    const attendances = await prisma.attendance.findMany();

    const snapshot = {
      exportedAt: new Date().toISOString(),
      counts: {
        admins: admins.length,
        students: students.length,
        sessions: sessions.length,
        attendances: attendances.length,
      },
      admins,
      students,
      sessions,
      attendances,
    };

    const outPath = path.resolve(process.cwd(), 'prisma', 'sqlite_backup_snapshot.json');
    fs.writeFileSync(outPath, JSON.stringify(snapshot, null, 2), 'utf-8');

    console.log('SNAPSHOT_SUCCESS', snapshot.counts);
  } finally {
    await prisma.$disconnect();
  }
}

backup().catch((err) => {
  console.error('Backup error:', err);
  process.exit(1);
});