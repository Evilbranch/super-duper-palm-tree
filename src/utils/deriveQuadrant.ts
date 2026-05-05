import type { Task } from '@/types';

export const deriveQuadrant = (
  urgency: number,
  importance: number,
): Task['quadrant'] => {
  if (urgency >= 2 && importance >= 2) return 'Q1';
  if (urgency <  2 && importance >= 2) return 'Q2';
  if (urgency >= 2 && importance <  2) return 'Q3';
  return 'Q4';
};
