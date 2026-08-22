'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { InteractiveRoadmap, useRoadmapProgress } from '../lib/roadmap-engine';
import type { RoadmapDocument } from '../lib/roadmap-engine/types';
import { roadmaps, getRoadmapBySlug } from '../roadmaps';

function RoadmapViewerContent() {
  const searchParams = useSearchParams();
  const querySlug = searchParams.get('roadmap');

  const [manualSlug, setManualSlug] = useState<string | null>(null);

  const selectedSlug = useMemo(() => {
    if (manualSlug && roadmaps.some((r) => r.slug === manualSlug)) {
      return manualSlug;
    }
    if (querySlug && roadmaps.some((r) => r.slug === querySlug)) {
      return querySlug;
    }
    return roadmaps[0].slug;
  }, [manualSlug, querySlug]);

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const slugParam = params.get('roadmap');

    if (!slugParam || !roadmaps.some((r) => r.slug === slugParam)) {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('roadmap', selectedSlug);
      window.history.replaceState({}, '', currentUrl.toString());
    }
  }, [selectedSlug]);

  const handleSelectRoadmap = useCallback((slug: string) => {
    setManualSlug(slug);
    if (typeof window !== 'undefined') {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('roadmap', slug);
      window.history.replaceState({}, '', currentUrl.toString());
    }
  }, []);

  const activeRoadmap: RoadmapDocument = useMemo(() => {
    return getRoadmapBySlug(selectedSlug);
  }, [selectedSlug]);

  const { progress, resetProgress } = useRoadmapProgress(activeRoadmap.slug);

  const stats = useMemo(() => {
    const trackableNodes = activeRoadmap.nodes.filter(
      (n) => n.type === 'topic' || n.type === 'subtopic'
    );
    const total = trackableNodes.length;
    let completed = 0;

    for (const node of trackableNodes) {
      const st = progress[node.id];
      if (st === 'done') completed++;
    }

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, percentage };
  }, [activeRoadmap.nodes, progress]);

  return (
    <div className="app-shell flex flex-col bg-[#fbfbf8] font-sans">
      <header className="app-header shrink-0 bg-[#102a43] text-white z-20">
        <div className="app-header-inner">
          <div className="app-header-primary">
            {roadmaps.length > 1 ? (
              <label className="app-course-label min-w-0 flex-1">
                <span className="sr-only">Seleccionar curso</span>
                <select
                  value={selectedSlug}
                  onChange={(e) => handleSelectRoadmap(e.target.value)}
                  className="app-course-select"
                >
                  {roadmaps.map((r) => (
                    <option key={r.slug} value={r.slug} className="text-slate-900">
                      {r.title}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <h1 className="app-title">{activeRoadmap.title}</h1>
            )}

            <div className="app-progress" aria-label="Progreso del curso">
              <span className="font-semibold tabular-nums">
                {stats.completed}/{stats.total}
              </span>
              <span className="app-progress-pct text-white/70 tabular-nums">{stats.percentage}%</span>
              {stats.completed > 0 && (
                <button
                  type="button"
                  onClick={resetProgress}
                  title="Reiniciar progreso guardado"
                  className="app-reset"
                >
                  Reiniciar
                </button>
              )}
            </div>
          </div>

          <div className="app-search">
            <label htmlFor="roadmap-search" className="sr-only">
              Buscar tema
            </label>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="app-search-icon"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3-3" />
            </svg>
            <input
              id="roadmap-search"
              type="search"
              enterKeyHint="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar tema"
              className="app-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Limpiar búsqueda"
                className="app-search-clear"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="app-main">
        <InteractiveRoadmap
          roadmap={activeRoadmap}
          searchQuery={searchQuery}
          className="w-full h-full"
        />
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Cargando mapa...</div>}>
      <RoadmapViewerContent />
    </Suspense>
  );
}
