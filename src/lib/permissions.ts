export type UserRole = 'BACKOFFICE' | 'SCANNER' | string;

/**
 * Checks if a given role is BACKOFFICE (administrator).
 */
export function isBackoffice(role?: string | null): boolean {
  return role === 'BACKOFFICE';
}

/**
 * Checks if a given role is SCANNER (check-in staff).
 */
export function isScanner(role?: string | null): boolean {
  return role === 'SCANNER';
}

/**
 * Checks if user is authorized to add, edit, or delete students.
 * Only BACKOFFICE is permitted.
 */
export function canModifyStudents(role?: string | null): boolean {
  return isBackoffice(role);
}

/**
 * Checks if user is authorized to manually toggle attendance in reports.
 * Only BACKOFFICE is permitted.
 */
export function canToggleAttendance(role?: string | null): boolean {
  return isBackoffice(role);
}

/**
 * Checks if user is authorized to manage user accounts and system settings.
 * Only BACKOFFICE is permitted.
 */
export function canManageUsers(role?: string | null): boolean {
  return isBackoffice(role);
}