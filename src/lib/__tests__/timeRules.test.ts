import { describe, it, expect } from 'vitest';
import {
  parseSessionDateTime,
  getSessionTimeWindows,
  isSessionWindowOpen,
  isCheckinLate,
  isGracePeriodExpired,
} from '../timeRules';

describe('timeRules - Core Time Logic & Calculations', () => {
  const sessionDate = '2026-09-16';
  const startTime = '08:30';
  const endTime = '10:00';

  describe('parseSessionDateTime', () => {
    it('correctly parses sessionDate and time string into a Date', () => {
      const dt = parseSessionDateTime(sessionDate, '08:30');
      expect(dt.getFullYear()).toBe(2026);
      expect(dt.getMonth()).toBe(8); // September (0-indexed)
      expect(dt.getDate()).toBe(16);
      expect(dt.getHours()).toBe(8);
      expect(dt.getMinutes()).toBe(30);
      expect(dt.getSeconds()).toBe(0);
    });
  });

  describe('getSessionTimeWindows', () => {
    it('calculates correct start, -10m early window, end, and +30m late window', () => {
      const windows = getSessionTimeWindows(sessionDate, startTime, endTime);

      // Window start: 10 minutes before 08:30 -> 08:20
      expect(windows.windowStart.getHours()).toBe(8);
      expect(windows.windowStart.getMinutes()).toBe(20);

      // Session start: 08:30
      expect(windows.sessionStart.getHours()).toBe(8);
      expect(windows.sessionStart.getMinutes()).toBe(30);

      // Session end: 10:00
      expect(windows.sessionEnd.getHours()).toBe(10);
      expect(windows.sessionEnd.getMinutes()).toBe(0);

      // Late window: 30 minutes after 10:00 -> 10:30
      expect(windows.windowEndWithLate.getHours()).toBe(10);
      expect(windows.windowEndWithLate.getMinutes()).toBe(30);
    });

    it('handles cross-midnight session properly', () => {
      const windows = getSessionTimeWindows(sessionDate, '23:30', '01:30');
      expect(windows.sessionEnd.getDate()).toBe(17);
      expect(windows.sessionEnd.getHours()).toBe(1);
      expect(windows.sessionEnd.getMinutes()).toBe(30);
      expect(windows.windowEndWithLate.getHours()).toBe(2);
      expect(windows.windowEndWithLate.getMinutes()).toBe(0);
    });
  });

  describe('isSessionWindowOpen', () => {
    it('returns false when earlier than 10 minutes before start', () => {
      const now = parseSessionDateTime(sessionDate, '08:15');
      expect(isSessionWindowOpen(sessionDate, startTime, endTime, now)).toBe(false);
    });

    it('returns true exactly 10 minutes before start (08:20)', () => {
      const now = parseSessionDateTime(sessionDate, '08:20');
      expect(isSessionWindowOpen(sessionDate, startTime, endTime, now)).toBe(true);
    });

    it('returns true during session (09:15)', () => {
      const now = parseSessionDateTime(sessionDate, '09:15');
      expect(isSessionWindowOpen(sessionDate, startTime, endTime, now)).toBe(true);
    });

    it('returns true at exact end time (10:00)', () => {
      const now = parseSessionDateTime(sessionDate, '10:00');
      expect(isSessionWindowOpen(sessionDate, startTime, endTime, now)).toBe(true);
    });

    it('returns true during late window (10:20)', () => {
      const now = parseSessionDateTime(sessionDate, '10:20');
      expect(isSessionWindowOpen(sessionDate, startTime, endTime, now)).toBe(true);
    });

    it('returns false after 30 minutes past end time (10:31)', () => {
      const now = parseSessionDateTime(sessionDate, '10:31');
      expect(isSessionWindowOpen(sessionDate, startTime, endTime, now)).toBe(false);
    });
  });

  describe('isCheckinLate', () => {
    it('returns false for scans before or at endTime (On Time)', () => {
      const scan1 = parseSessionDateTime(sessionDate, '08:25');
      const scan2 = parseSessionDateTime(sessionDate, '09:45');
      const scan3 = parseSessionDateTime(sessionDate, '10:00');

      expect(isCheckinLate(sessionDate, endTime, scan1, startTime)).toBe(false);
      expect(isCheckinLate(sessionDate, endTime, scan2, startTime)).toBe(false);
      expect(isCheckinLate(sessionDate, endTime, scan3, startTime)).toBe(false);
    });

    it('returns true for scans after endTime (Late)', () => {
      const scanLate1 = new Date(parseSessionDateTime(sessionDate, '10:00').getTime() + 1000); // 10:00:01
      const scanLate2 = parseSessionDateTime(sessionDate, '10:15');

      expect(isCheckinLate(sessionDate, endTime, scanLate1, startTime)).toBe(true);
      expect(isCheckinLate(sessionDate, endTime, scanLate2, startTime)).toBe(true);
    });
  });

  describe('isGracePeriodExpired', () => {
    it('returns false before or at 30 minutes after endTime', () => {
      const now1 = parseSessionDateTime(sessionDate, '10:15');
      const now2 = parseSessionDateTime(sessionDate, '10:30');

      expect(isGracePeriodExpired(sessionDate, endTime, now1, startTime)).toBe(false);
      expect(isGracePeriodExpired(sessionDate, endTime, now2, startTime)).toBe(false);
    });

    it('returns true when now > endTime + 30 minutes', () => {
      const expired1 = new Date(parseSessionDateTime(sessionDate, '10:30').getTime() + 1000);
      const expired2 = parseSessionDateTime(sessionDate, '11:00');

      expect(isGracePeriodExpired(sessionDate, endTime, expired1, startTime)).toBe(true);
      expect(isGracePeriodExpired(sessionDate, endTime, expired2, startTime)).toBe(true);
    });
  });
});