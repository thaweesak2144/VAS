import { describe, it, expect } from 'vitest';
import {
  isBackoffice,
  isScanner,
  canModifyStudents,
  canToggleAttendance,
  canManageUsers,
} from '../permissions';

describe('permissions - RBAC Access Control Matrix', () => {
  describe('BACKOFFICE Role', () => {
    const role = 'BACKOFFICE';

    it('identifies BACKOFFICE role correctly', () => {
      expect(isBackoffice(role)).toBe(true);
      expect(isScanner(role)).toBe(false);
    });

    it('grants permission to modify students', () => {
      expect(canModifyStudents(role)).toBe(true);
    });

    it('grants permission to manually toggle attendance', () => {
      expect(canToggleAttendance(role)).toBe(true);
    });

    it('grants permission to manage users and settings', () => {
      expect(canManageUsers(role)).toBe(true);
    });
  });

  describe('SCANNER Role', () => {
    const role = 'SCANNER';

    it('identifies SCANNER role correctly', () => {
      expect(isScanner(role)).toBe(true);
      expect(isBackoffice(role)).toBe(false);
    });

    it('DENIES permission to modify students (Read-Only)', () => {
      expect(canModifyStudents(role)).toBe(false);
    });

    it('DENIES permission to toggle attendance in reports', () => {
      expect(canToggleAttendance(role)).toBe(false);
    });

    it('DENIES permission to manage users and settings', () => {
      expect(canManageUsers(role)).toBe(false);
    });
  });

  describe('Undefined or Invalid Roles', () => {
    it('denies all write operations for undefined or null role', () => {
      expect(canModifyStudents(undefined)).toBe(false);
      expect(canModifyStudents(null)).toBe(false);
      expect(canToggleAttendance(undefined)).toBe(false);
      expect(canManageUsers(undefined)).toBe(false);
    });

    it('denies all write operations for unknown guest role', () => {
      expect(canModifyStudents('GUEST')).toBe(false);
      expect(canToggleAttendance('GUEST')).toBe(false);
      expect(canManageUsers('GUEST')).toBe(false);
    });
  });
});