import { describe, expect, it } from 'vitest';
import {
  checklistProgress,
  sortSavedByStage,
  toggleChecklistItem,
} from './my-space';

describe('checklistProgress', () => {
  it('counts only known items', () => {
    expect(checklistProgress([])).toEqual({ done: 0, total: 6, percent: 0 });
    expect(checklistProgress(['read_bases', 'keep_receipt', 'unknown'])).toEqual({
      done: 2,
      total: 6,
      percent: 33,
    });
  });
});

describe('toggleChecklistItem', () => {
  it('adds and removes items keeping the canonical order', () => {
    expect(toggleChecklistItem(['keep_receipt'], 'read_bases')).toEqual([
      'read_bases',
      'keep_receipt',
    ]);
    expect(toggleChecklistItem(['read_bases', 'keep_receipt'], 'read_bases')).toEqual([
      'keep_receipt',
    ]);
  });
});

describe('sortSavedByStage', () => {
  it('puts active work first and discarded last', () => {
    const sorted = sortSavedByStage([
      { id: 'a', stage: 'discarded', createdAt: '2026-10-03' },
      { id: 'b', stage: 'interested', createdAt: '2026-10-01' },
      { id: 'c', stage: 'preparing', createdAt: '2026-10-02' },
      { id: 'd', stage: 'interested', createdAt: '2026-10-05' },
    ] as const);
    expect(sorted.map((item) => item.id)).toEqual(['c', 'd', 'b', 'a']);
  });
});
