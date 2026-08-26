'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { isPdfUrl, pdfViewUrl } from './pdf-source';
import type { TopicDetails, TopicProgressStatus, TopicResource } from './types';

type PdfViewerState = {
  url: string;
  title: string;
};

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
  const pdfCloseButtonRef = useRef<HTMLButtonElement>(null);
  const [pdfViewer, setPdfViewer] = useState<PdfViewerState | null>(null);

  const handleClose = useCallback(() => {
    setPdfViewer(null);
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
        if (pdfViewer) {
          setPdfViewer(null);
          return;
        }
        handleClose();
        return;
      }

      if (e.key === 'Tab' && panelRef.current) {
        const trapRoot = pdfViewer
          ? panelRef.current.querySelector<HTMLElement>('.topic-pdf-viewer')
          : panelRef.current;
        if (!trapRoot) return;
        const focusableElements = trapRoot.querySelectorAll<HTMLElement>(
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
    [handleClose, pdfViewer]
  );

  useEffect(() => {
    if (topic) {
      document.addEventListener('keydown', handleKeyDown);
      // Focus the close button initially
      const timer = setTimeout(() => {
        if (pdfViewer) {
          pdfCloseButtonRef.current?.focus();
          return;
        }
        closeButtonRef.current?.focus();
      }, 50);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        clearTimeout(timer);
      };
    }
  }, [topic, handleKeyDown, pdfViewer]);

  if (!topic) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="topic-drawer-title"
      className="topic-drawer-root"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        ref={panelRef}
        className="topic-drawer-panel"
      >
        {/* Header */}
        <div className="topic-drawer-head">
          <div className="topic-drawer-handle" aria-hidden="true" />
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
              {step ? `Paso ${step}` : `Tema #${nodeId}`}
            </span>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={handleClose}
              aria-label="Cerrar panel de tema"
              className="topic-drawer-close"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="topic-status-row">
          <span className="sr-only">Estado de aprendizaje</span>
          <div className="topic-status-grid">
            {statusOptions.map((opt) => {
              const isActive = status === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onStatusChange(opt.id)}
                  title={opt.label}
                  className={`topic-status-btn ${
                    isActive ? opt.activeClass : 'bg-white text-slate-600'
                  }`}
                >
                  <span aria-hidden="true">{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="topic-drawer-body">
          <div>
            <h2
              id="topic-drawer-title"
              className="topic-drawer-title"
            >
              {topic.title}
            </h2>
          </div>

          {/* Markdown Content */}
          <div className="topic-drawer-prose prose prose-slate prose-sm max-w-none leading-relaxed border-b border-slate-200 pb-6">
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
                {topic.sourceRefs.map((ref, idx) => {
                  const href = ref.url ? pdfViewUrl(ref.url, ref.locator) : undefined;
                  const openPdf = href && isPdfUrl(href);
                  return (
                    <div key={idx} className="p-3 text-xs flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-2">
                        {openPdf && href ? (
                          <button
                            type="button"
                            onClick={() => setPdfViewer({ url: href, title: ref.label })}
                            className="text-left font-semibold text-blue-700 hover:underline"
                          >
                            {ref.label}
                          </button>
                        ) : href ? (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-blue-700 hover:underline"
                          >
                            {ref.label}
                          </a>
                        ) : (
                          <span className="font-semibold text-slate-900">{ref.label}</span>
                        )}
                        <span className="font-mono text-[11px] text-slate-600 bg-slate-200/70 px-1.5 py-0.5 rounded shrink-0">
                          {ref.locator}
                        </span>
                      </div>
                    </div>
                  );
                })}
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
                  const href = pdfViewUrl(res.url);
                  const openPdf = isPdfUrl(href);
                  const itemClass =
                    'group flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white hover:border-blue-400 transition-all text-xs no-underline text-left w-full';
                  const inner = (
                    <>
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
                        {openPdf ? 'PDF' : '↗'}
                      </span>
                    </>
                  );
                  if (openPdf) {
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPdfViewer({ url: href, title: res.title })}
                        className={itemClass}
                      >
                        {inner}
                      </button>
                    );
                  }
                  return (
                    <a
                      key={idx}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={itemClass}
                    >
                      {inner}
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        {pdfViewer && (
          <div className="topic-pdf-viewer" role="document" aria-label={pdfViewer.title}>
            <div className="topic-pdf-toolbar">
              <p className="topic-pdf-title">{pdfViewer.title}</p>
              <div className="topic-pdf-actions">
                <a href={pdfViewer.url} target="_blank" rel="noopener noreferrer">
                  Abrir pestaña
                </a>
                <button
                  ref={pdfCloseButtonRef}
                  type="button"
                  onClick={() => setPdfViewer(null)}
                  aria-label="Cerrar documento"
                  className="topic-drawer-close"
                >
                  ✕
                </button>
              </div>
            </div>
            <iframe
              title={pdfViewer.title}
              src={pdfViewer.url}
              className="topic-pdf-frame"
            />
          </div>
        )}
      </div>
    </div>
  );
}
