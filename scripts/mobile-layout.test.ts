import { test } from 'node:test';
import assert from 'node:assert/strict';
import { layoutRoadmapForMobile } from '../lib/roadmap-engine/mobile-layout.ts';
import type { RoadmapNode } from '../lib/roadmap-engine/types.ts';

function node(
  partial: Pick<RoadmapNode, 'id' | 'type'> & {
    x: number;
    y: number;
    width?: number;
    height?: number;
    data?: Record<string, unknown>;
  }
): RoadmapNode {
  return {
    id: partial.id,
    type: partial.type,
    position: { x: partial.x, y: partial.y },
    size: { width: partial.width ?? 200, height: partial.height ?? 50 },
    data: partial.data ?? {},
  } as RoadmapNode;
}

test('stacks numbered topics, indents subtopics, and skips intro paragraphs', () => {
  const nodes: RoadmapNode[] = [
    node({ id: 'title', type: 'title', x: 40, y: 10, data: { text: 'Course' } }),
    node({
      id: 'intro',
      type: 'paragraph',
      x: 40,
      y: 70,
      data: { text: 'Read left to right on desktop.' },
    }),
    node({
      id: 'legend',
      type: 'legend',
      x: 500,
      y: 10,
      data: { title: 'Leyenda', items: [{ label: 'Tema', color: '#f9d95c' }] },
    }),
    node({
      id: 'section-a',
      type: 'section',
      x: 20,
      y: 200,
      width: 800,
      height: 400,
      data: { label: 'Unidad 1' },
    }),
    node({
      id: 'topic-01',
      type: 'topic',
      x: 40,
      y: 240,
      data: { label: 'Cliente', order: '01' },
    }),
    node({
      id: 'support-01',
      type: 'subtopic',
      x: 400,
      y: 240,
      data: { label: 'HTTP', order: '01a' },
    }),
    node({
      id: 'topic-02',
      type: 'topic',
      x: 40,
      y: 340,
      data: { label: 'Servidor', order: '02' },
    }),
    node({
      id: 'note-15',
      type: 'paragraph',
      x: 400,
      y: 338,
      data: {
        text: 'En la Clase 2 un solo proceso mezclaba ambos roles a propósito.',
      },
    }),
    node({
      id: 'label-19',
      type: 'label',
      x: 40,
      y: 420,
      data: { text: 'Paso 19 · elige tu rama' },
    }),
    node({
      id: 'topic-19',
      type: 'topic',
      x: 40,
      y: 460,
      data: { label: 'IIS y Express', order: '19' },
    }),
    node({
      id: 'line-1',
      type: 'line',
      x: 100,
      y: 300,
      data: { orientation: 'vertical' },
    }),
    node({
      id: 'refs',
      type: 'linkGroup',
      x: 500,
      y: 240,
      data: { title: 'Referencias', links: [{ label: 'MDN', url: 'https://example.com' }] },
    }),
    node({
      id: 'closing',
      type: 'button',
      x: 40,
      y: 700,
      data: { label: 'Recursos', href: 'https://example.com' },
    }),
  ];

  const stack = layoutRoadmapForMobile(nodes);
  const ids = stack.map((item) => item.node.id);

  assert.deepEqual(ids, [
    'title',
    'legend',
    'section-a',
    'topic-01',
    'support-01',
    'topic-02',
    'note-15',
    'label-19',
    'topic-19',
    'refs',
    'closing',
  ]);
  assert.equal(
    stack.find((item) => item.node.id === 'intro'),
    undefined
  );
  assert.equal(
    stack.find((item) => item.node.id === 'line-1'),
    undefined
  );
  assert.equal(stack.find((item) => item.node.id === 'support-01')?.indent, true);
  assert.equal(stack.find((item) => item.node.id === 'topic-01')?.indent, false);
  assert.equal(stack.find((item) => item.node.id === 'section-a')?.indent, false);
  assert.ok(
    ids.indexOf('refs') > ids.indexOf('topic-19'),
    'side materials should follow the numbered steps, not sit at their authored Y'
  );
  assert.ok(
    ids.indexOf('note-15') === ids.indexOf('topic-02') + 1,
    'a comment sits after the step it was authored beside'
  );
  assert.ok(
    ids.indexOf('label-19') === ids.indexOf('topic-19') - 1,
    'a label authored above a step stays above that step'
  );
  assert.equal(stack.find((item) => item.node.id === 'note-15')?.indent, true);
});

test('gestion-servidores-web comments sit next to the closest numbered step', async () => {
  const { default: doc } = await import('../roadmaps/gestion-servidores-web/roadmap.json', {
    with: { type: 'json' },
  });
  const stack = layoutRoadmapForMobile(doc.nodes as RoadmapNode[]);
  const ids = stack.map((item) => item.node.id);

  assert.equal(ids[ids.indexOf('manual-container') + 1], 'foundations-note');
  assert.equal(ids[ids.indexOf('static-dynamic-lab') + 1], 'roles-note');
  assert.equal(ids[ids.indexOf('technology-choice') - 1], 'decision-label');
  assert.equal(ids[ids.indexOf('technology-choice') + 1], 'fork-note');
  assert.equal(ids[ids.indexOf('attacker-mindset') + 1], 'convergence-note');
  assert.ok(ids.indexOf('materials-links') > ids.indexOf('parcial-scope'));
});

const COURSE_SLUGS = [
  'ciencia-de-datos',
  'estructura-de-datos',
  'programacion-orientada-a-eventos',
  'gestion-servidores-web',
] as const;

test('every course keeps numbered steps in order and only skips the poster intro', async () => {
  for (const slug of COURSE_SLUGS) {
    const { default: doc } = await import(`../roadmaps/${slug}/roadmap.json`, {
      with: { type: 'json' },
    });
    const nodes = doc.nodes as RoadmapNode[];
    const firstSectionY = Math.min(
      ...nodes.filter((node) => node.type === 'section').map((node) => node.position.y),
      Number.POSITIVE_INFINITY
    );
    const stack = layoutRoadmapForMobile(nodes);
    const stackedIds = new Set(stack.map((item) => item.node.id));

    const introIds = nodes
      .filter(
        (node) =>
          node.type === 'paragraph' && node.position.y + node.size.height / 2 < firstSectionY
      )
      .map((node) => node.id);

    for (const id of introIds) {
      assert.equal(stackedIds.has(id), false, `${slug}: intro ${id} should stay off the phone path`);
    }

    const inSectionNotes = nodes.filter(
      (node) =>
        (node.type === 'paragraph' || node.type === 'label') &&
        node.position.y + node.size.height / 2 >= firstSectionY
    );
    for (const note of inSectionNotes) {
      assert.ok(stackedIds.has(note.id), `${slug}: in-section note ${note.id} should stay in the path`);
    }

    const orders = stack
      .map((item) => item.node)
      .filter((node) => node.type === 'topic' || node.type === 'subtopic')
      .map((node) => node.data.order)
      .filter((order): order is string => Boolean(order));

    if (slug === 'gestion-servidores-web') {
      assert.deepEqual(
        orders.slice(orders.indexOf('20a'), orders.indexOf('27') + 1),
        [
          '20a',
          '21a',
          '22a',
          '23a',
          '24a',
          '25a',
          '26a',
          '20b',
          '21b',
          '22b',
          '23b',
          '24b',
          '25b',
          '26b',
          '27',
        ],
        'gestion-servidores-web: walk fork A, then fork B, then reconverge'
      );
      continue;
    }

    const sorted = orders.slice().sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    assert.deepEqual(orders, sorted, `${slug}: numbered cards should stay in study order`);
  }
});
