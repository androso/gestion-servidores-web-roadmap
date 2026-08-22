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
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#fbfbf8] font-sans">
      <header className="h-14 shrink-0 bg-[#102a43] text-white px-3 sm:px-4 z-20">
        <div className="flex items-center justify-between gap-3 h-full">
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-sm font-semibold truncate leading-tight">
              {activeRoadmap.title}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 ml-auto min-w-0">
            {roadmaps.length > 1 && (
              <select
                value={selectedSlug}
                onChange={(e) => handleSelectRoadmap(e.target.value)}
                aria-label="Seleccionar curso"
                className="text-xs bg-white/10 border border-white/25 rounded px-2 py-1 text-white outline-none focus:ring-2 focus:ring-white/60"
              >
                {roadmaps.map((r) => (
                  <option key={r.slug} value={r.slug} className="text-slate-900">
                    {r.title}
                  </option>
                ))}
              </select>
            )}

            <div className="relative flex items-center">
              <label htmlFor="roadmap-search" className="sr-only">
                Buscar tema
              </label>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute left-2 pointer-events-none opacity-70"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3-3" />
              </svg>
              <input
                id="roadmap-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar…"
                className="w-32 sm:w-44 text-xs bg-white/10 border border-white/25 rounded pl-7 pr-7 py-1.5 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-white/60"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-2 text-white/70 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs shrink-0 tabular-nums">
              <span className="font-semibold">
                {stats.completed}/{stats.total}
              </span>
              <span className="text-white/70 hidden sm:inline">{stats.percentage}%</span>
              {stats.completed > 0 && (
                <button
                  type="button"
                  onClick={resetProgress}
                  title="Reiniciar progreso guardado"
                  className="ml-1 text-[10px] text-white/60 hover:text-white"
                >
                  Reiniciar
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full relative overflow-hidden">
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
