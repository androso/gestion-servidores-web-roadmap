'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { TopicDetails, TopicProgressStatus, TopicResource } from './types';
export interface TopicDrawerProps {
  topic: TopicDetails | null;
  nodeId: string | null;
  step?: string;
  status: TopicProgressStatus;
  onClose: () => void;
  onStatusChange: (status: TopicProgressStatus) => void;
  triggerElement?: HTMLElement | null;
}

const statusOptions: Array<{ id: TopicProgressStatus; label: string; activeClass: string; icon: string }> = [
  {
    id: 'pending',
    label: 'Por empezar',
    activeClass: 'bg-amber-100 text-amber-900 border-amber-400 font-bold',
    icon: '○',
  },
  {
    id: 'learning',
    label: 'En progreso',
    activeClass: 'bg-purple-100 text-purple-900 border-purple-400 font-bold',
    icon: '●',
  },
  {
    id: 'done',
    label: 'Completado',
    activeClass: 'bg-emerald-100 text-emerald-900 border-emerald-400 font-bold',
    icon: '✓',
  },
  {
    id: 'skipped',
    label: 'Omitido',
    activeClass: 'bg-slate-200 text-slate-800 border-slate-400 font-bold',
    icon: '—',
  },
];

function getResourceBadge(type: TopicResource['type']) {
  switch (type) {
    case 'official':
      return { label: 'Oficial', bg: 'bg-blue-100 text-blue-800 border-blue-300' };
    case 'article':
      return { label: 'Artículo', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    case 'video':
      return { label: 'Video', bg: 'bg-rose-100 text-rose-800 border-rose-300' };
    case 'guide':
      return { label: 'Guía', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
    case 'repository':
      return { label: 'Código', bg: 'bg-purple-100 text-purple-800 border-purple-300' };
    default:
      return { label: 'Recurso', bg: 'bg-slate-100 text-slate-800 border-slate-300' };
  }
}

// Authored topic content opens with the same title the drawer header renders.
function stripLeadingHeading(content: string) {
  return content.replace(/^\s*#\s+[^\n]*\n+/, '');
}

export function TopicDrawer({
  topic,
  nodeId,
  step,
  status,
  onClose,
  onStatusChange,
  triggerElement,
}: TopicDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const handleClose = useCallback(() => {
    onClose();
    if (triggerElement && typeof triggerElement.focus === 'function') {
      setTimeout(() => {
        triggerElement.focus();
      }, 50);
    }
  }, [onClose, triggerElement]);

  // Focus trap and escape key handler — Escape uses the same close path as backdrop and button
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
        return;
      }

      if (e.key === 'Tab' && panelRef.current) {
        const focusableElements = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    },
    [handleClose]
  );

  useEffect(() => {
    if (topic) {
      document.addEventListener('keydown', handleKeyDown);
      // Focus the close button initially
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        clearTimeout(timer);
      };
    }
  }, [topic, handleKeyDown]);

  if (!topic) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="topic-drawer-title"
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        ref={panelRef}
        className="w-full sm:max-w-xl md:max-w-2xl h-full bg-white border-l border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-slate-50/75 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
              {step ? `Paso ${step}` : `Tema #${nodeId}`}
            </span>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={handleClose}
            aria-label="Cerrar panel de tema"
            className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex items-center gap-2 px-6 py-2 border-b border-slate-200 bg-white shrink-0">
          <span className="sr-only">Estado de aprendizaje</span>
          <div className="flex flex-1 rounded-md border border-slate-200 overflow-hidden">
            {statusOptions.map((opt) => {
              const isActive = status === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onStatusChange(opt.id)}
                  title={opt.label}
                  className={`flex-1 min-w-0 flex items-center justify-center gap-1 px-1.5 py-1 text-[11px] leading-tight border-r border-slate-200 last:border-r-0 transition-colors ${
                    isActive
                      ? opt.activeClass
                      : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span aria-hidden="true">{opt.icon}</span>
                  <span className="truncate">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <h2
              id="topic-drawer-title"
              className="text-2xl font-bold tracking-tight text-slate-900 leading-tight font-sans"
            >
              {topic.title}
            </h2>
          </div>

          {/* Markdown Content */}
          <div className="prose prose-slate prose-sm max-w-none leading-relaxed border-b border-slate-200 pb-6">
            <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>
              {stripLeadingHeading(topic.content)}
            </ReactMarkdown>
          </div>

          {/* Source References (Academic traceability) */}
          {topic.sourceRefs && topic.sourceRefs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <span>📖</span>
                <span>Referencias de Clase</span>
              </h3>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50">
                {topic.sourceRefs.map((ref, idx) => (
                  <div key={idx} className="p-3 text-xs flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">
                        {ref.label}
                      </span>
                      <span className="font-mono text-[11px] text-slate-600 bg-slate-200/70 px-1.5 py-0.5 rounded">
                        {ref.locator}
                      </span>
                    </div>
                    {ref.url && (
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <span className="truncate">{ref.url}</span>
                        <span className="text-[10px]">↗</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Structured External Resources */}
          {topic.resources && topic.resources.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <span>🔗</span>
                <span>Recursos de Apoyo</span>
              </h3>
              <div className="grid gap-2">
                {topic.resources.map((res, idx) => {
                  const badge = getResourceBadge(res.type);
                  return (
                    <a
                      key={idx}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white hover:border-blue-400 transition-all text-xs no-underline"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border shrink-0 ${badge.bg}`}
                        >
                          {badge.label}
                        </span>
                        <span className="font-medium text-slate-800 group-hover:text-blue-600 truncate">
                          {res.title}
                        </span>
                      </div>
                      <span className="text-slate-400 group-hover:text-blue-500 shrink-0 font-bold">
                        ↗
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
