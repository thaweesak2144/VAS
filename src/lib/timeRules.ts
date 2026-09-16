/**
 * Centralized business logic for session time windows and late check-in rules.
 * 
 * Rules:
 * - Auto-open window: 10 minutes before session startTime
 * - On-time check-in: scannedAt <= endTime
 * - Late check-in: scannedAt > endTime (within 30 minutes after endTime)
 * - Window close / expired: now > endTime + 30 minutes
 */

export interface SessionTimeWindows {
  windowStart: Date;
  sessionStart: Date;
  sessionEnd: Date;
  windowEndWithLate: Date;
}

/**
 * Parses a sessionDate (Date or ISO string) and a "HH:mm" time string into a Date object.
 */
export function parseSessionDateTime(sessionDate: string | Date, timeStr: string): Date {
  const d = new Date(sessionDate);
  const [hours, minutes] = timeStr.split(':').map(Number);
  const result = new Date(d);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

/**
 * Computes all relevant time window boundaries for a session:
 * - sessionStart: The exact scheduled start time
 * - windowStart: 10 minutes prior to sessionStart (early check-in allowed)
 * - sessionEnd: The scheduled end time (handles cross-midnight if end < start)
 * - windowEndWithLate: 30 minutes after sessionEnd (grace period deadline)
 */
export function getSessionTimeWindows(
  sessionDate: string | Date,
  startTime: string,
  endTime: string
): SessionTimeWindows {
  const sessionStart = parseSessionDateTime(sessionDate, startTime);
  
  // Early check-in window opens 10 minutes before start
  const windowStart = new Date(sessionStart.getTime() - 10 * 60 * 1000);

  const sessionEnd = parseSessionDateTime(sessionDate, endTime);
  // Handle cross-midnight sessions where endTime is earlier than startTime (e.g. 23:30 - 01:00)
  if (sessionEnd < sessionStart) {
    sessionEnd.setDate(sessionEnd.getDate() + 1);
  }

  // Late check-in window extends 30 minutes past sessionEnd
  const windowEndWithLate = new Date(sessionEnd.getTime() + 30 * 60 * 1000);

  return {
    windowStart,
    sessionStart,
    sessionEnd,
    windowEndWithLate,
  };
}

/**
 * Determines whether a session is currently within its active check-in window
 * (from 10 mins before startTime until 30 mins after endTime).
 */
export function isSessionWindowOpen(
  sessionDate: string | Date,
  startTime: string,
  endTime: string,
  now: Date = new Date()
): boolean {
  const { windowStart, windowEndWithLate } = getSessionTimeWindows(sessionDate, startTime, endTime);
  return now >= windowStart && now <= windowEndWithLate;
}

/**
 * Determines whether a check-in scan was late (> endTime).
 */
export function isCheckinLate(
  sessionDate: string | Date,
  endTime: string,
  scannedAt: Date = new Date(),
  startTime?: string
): boolean {
  const sEnd = parseSessionDateTime(sessionDate, endTime);
  if (startTime) {
    const sStart = parseSessionDateTime(sessionDate, startTime);
    if (sEnd < sStart) {
      sEnd.setDate(sEnd.getDate() + 1);
    }
  }
  return scannedAt > sEnd;
}

/**
 * Determines whether the 30-minute late grace period has expired for a session.
 */
export function isGracePeriodExpired(
  sessionDate: string | Date,
  endTime: string,
  now: Date = new Date(),
  startTime?: string
): boolean {
  const sEnd = parseSessionDateTime(sessionDate, endTime);
  if (startTime) {
    const sStart = parseSessionDateTime(sessionDate, startTime);
    if (sEnd < sStart) {
      sEnd.setDate(sEnd.getDate() + 1);
    }
  }
  const lateDeadline = new Date(sEnd.getTime() + 30 * 60 * 1000);
  return now > lateDeadline;
}
