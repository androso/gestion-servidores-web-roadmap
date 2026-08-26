import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isPdfUrl, pageFromLocator, pdfViewUrl } from '../lib/roadmap-engine/pdf-source.ts';

test('detects local and remote PDF urls', () => {
  assert.equal(isPdfUrl('/ciencia-de-datos/materiales/Clase%2001%20-%20S1%20-%20CDD.pdf'), true);
  assert.equal(isPdfUrl('/estructura-de-datos/clases/clase-1-14-de-julio-2026.html'), false);
  assert.equal(isPdfUrl('https://example.com/notes.pdf#page=3'), true);
});

test('reads the first page or slide from a locator', () => {
  assert.equal(pageFromLocator('p. 5/14 — Descripción de la asignatura'), 5);
  assert.equal(pageFromLocator('pp. 2–6/31 — Introducción a Data Science'), 2);
  assert.equal(pageFromLocator('Diapositiva 03 — ¿Qué es la arquitectura de software?'), 3);
  assert.equal(pageFromLocator('3. - Mini glosario'), null);
});

test('appends #page when the locator has a number', () => {
  assert.equal(
    pdfViewUrl('/diseno-arquitectura-de-sistemas/materiales/Clase%20Bienvenida.pdf', 'Diapositiva 5 — Metodología'),
    '/diseno-arquitectura-de-sistemas/materiales/Clase%20Bienvenida.pdf#page=5'
  );
  assert.equal(
    pdfViewUrl('/gestion-servidores-web/materiales/clase-02-gsw.pdf', '3. - Mini glosario'),
    '/gestion-servidores-web/materiales/clase-02-gsw.pdf'
  );
});
