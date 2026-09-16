import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

async function importSnapshot() {
  const prisma = new PrismaClient();
  try {
    const snapshotPath = path.resolve(process.cwd(), 'prisma', 'sqlite_backup_snapshot.json');
    if (!fs.existsSync(snapshotPath)) {
      throw new Error(`Snapshot file not found at ${snapshotPath}`);
    }

    const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));
    console.log('Restoring from snapshot:', snapshot.counts);

    // 1. Restore Admins
    for (const a of snapshot.admins) {
      await prisma.admin.upsert({
        where: { username: a.username },
        update: {
          password: a.password,
          displayName: a.displayName,
          role: a.role,
        },
        create: {
          id: a.id,
          username: a.username,
          password: a.password,
          displayName: a.displayName,
          role: a.role,
          createdAt: new Date(a.createdAt),
        },
      });
    }

    // 2. Restore Students
    for (const s of snapshot.students) {
      await prisma.student.upsert({
        where: { studentCode: s.studentCode },
        update: {
          fullName: s.fullName,
          groupName: s.groupName,
        },
        create: {
          id: s.id,
          studentCode: s.studentCode,
          fullName: s.fullName,
          groupName: s.groupName,
          createdAt: new Date(s.createdAt),
        },
      });
    }

    // 3. Restore Sessions
    for (const sess of snapshot.sessions) {
      await prisma.session.upsert({
        where: {
          dayNumber_roundNumber: {
            dayNumber: sess.dayNumber,
            roundNumber: sess.roundNumber,
          },
        },
        update: {
          roundName: sess.roundName,
          sessionDate: new Date(sess.sessionDate),
          startTime: sess.startTime,
          endTime: sess.endTime,
          isActive: sess.isActive,
        },
        create: {
          id: sess.id,
          dayNumber: sess.dayNumber,
          roundNumber: sess.roundNumber,
          roundName: sess.roundName,
          sessionDate: new Date(sess.sessionDate),
          startTime: sess.startTime,
          endTime: sess.endTime,
          isActive: sess.isActive,
          createdAt: new Date(sess.createdAt),
        },
      });
    }

    // 4. Restore Attendances
    for (const att of snapshot.attendances) {
      await prisma.attendance.upsert({
        where: {
          studentId_sessionId: {
            studentId: att.studentId,
            sessionId: att.sessionId,
          },
        },
        update: {
          scannedAt: new Date(att.scannedAt),
        },
        create: {
          id: att.id,
          studentId: att.studentId,
          sessionId: att.sessionId,
          scannedAt: new Date(att.scannedAt),
        },
      });
    }

    // 5. Reset PostgreSQL auto-increment sequences
    const tables = ['Admin', 'Student', 'Session', 'Attendance'];
    for (const table of tables) {
      try {
        await prisma.$executeRawUnsafe(
          `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), coalesce(max(id), 1)) FROM "${table}";`
        );
      } catch (seqErr) {
        console.warn(`Note: Could not reset sequence for ${table} (may not be PostgreSQL or sequence empty):`, seqErr);
      }
    }

    const currentCounts = {
      admins: await prisma.admin.count(),
      students: await prisma.student.count(),
      sessions: await prisma.session.count(),
      attendances: await prisma.attendance.count(),
    };

    console.log('MIGRATION_COMPLETE_SUCCESS', currentCounts);
  } finally {
    await prisma.$disconnect();
  }
}

importSnapshot().catch((err) => {
  console.error('Import error:', err);
  process.exit(1);
});