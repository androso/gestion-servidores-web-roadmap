'use client';

import { useSyncExternalStore, useMemo, useCallback } from 'react';
import type { TopicProgressMap, TopicProgressStatus } from './types';

function subscribeToStorage(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('course-roadmap-progress-update', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('course-roadmap-progress-update', callback);
  };
}

export function useRoadmapProgress(slug: string) {
  const getSnapshot = useCallback(() => {
    if (typeof window === 'undefined') return '{}';
    return localStorage.getItem(`course-roadmap:v1:${slug}:progress`) || '{}';
  }, [slug]);

  const getServerSnapshot = useCallback(() => '{}', []);

  const raw = useSyncExternalStore(subscribeToStorage, getSnapshot, getServerSnapshot);

  const progress: TopicProgressMap = useMemo(() => {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const valid: TopicProgressMap = {};
        for (const [k, v] of Object.entries(parsed)) {
          if (v === 'pending' || v === 'learning' || v === 'done' || v === 'skipped') {
            valid[k] = v as TopicProgressStatus;
          }
        }
        return valid;
      }
    } catch {
      // ignore
    }
    return {};
  }, [raw]);

  const setTopicStatus = useCallback(
    (nodeId: string, status: TopicProgressStatus) => {
      if (typeof window === 'undefined') return;
      try {
        const key = `course-roadmap:v1:${slug}:progress`;
        const currentRaw = localStorage.getItem(key) || '{}';
        let current: Record<string, string> = {};
        try {
          current = JSON.parse(currentRaw) || {};
        } catch {
          current = {};
        }
        current[nodeId] = status;
        localStorage.setItem(key, JSON.stringify(current));
        window.dispatchEvent(new Event('course-roadmap-progress-update'));
      } catch {
        // ignore storage errors
      }
    },
    [slug]
  );

  const resetProgress = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const key = `course-roadmap:v1:${slug}:progress`;
      localStorage.removeItem(key);
      window.dispatchEvent(new Event('course-roadmap-progress-update'));
    } catch {
      // ignore
    }
  }, [slug]);

  return { progress, setTopicStatus, resetProgress };
}
