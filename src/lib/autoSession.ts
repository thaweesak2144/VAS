import { prisma } from '@/lib/prisma';
import { isSessionWindowOpen, isGracePeriodExpired } from '@/lib/timeRules';

export async function syncAndGetActiveSession() {
  const now = new Date();

  // 1. Get all sessions
  const sessions = await prisma.session.findMany({
    include: {
      _count: {
        select: { attendances: true }
      }
    }
  });

  if (!sessions || sessions.length === 0) {
    return null;
  }

  // Find a session that should be open right now (from 10 mins before startTime until endTime + 30 mins late window)
  const matchingSession = sessions.find(sess => 
    isSessionWindowOpen(sess.sessionDate, sess.startTime, sess.endTime, now)
  ) || null;

  // Check current active session in DB
  const currentlyActive = sessions.find(s => s.isActive);

  if (matchingSession) {
    // If matchingSession is not currently active, set it as active
    if (!currentlyActive || currentlyActive.id !== matchingSession.id) {
      await prisma.session.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });
      const updated = await prisma.session.update({
        where: { id: matchingSession.id },
        data: { isActive: true },
        include: {
          _count: {
            select: { attendances: true }
          }
        }
      });
      return updated;
    }
    return currentlyActive;
  } else {
    // If no session matches the current time window, but one was manually activated, check if it was explicitly manually opened
    // If an active session has completely passed its late window, auto-close it:
    if (currentlyActive) {
      if (isGracePeriodExpired(currentlyActive.sessionDate, currentlyActive.endTime, now, currentlyActive.startTime)) {
        await prisma.session.update({
          where: { id: currentlyActive.id },
          data: { isActive: false }
        });
        return null;
      }
      return currentlyActive;
    }
    return null;
  }
}
