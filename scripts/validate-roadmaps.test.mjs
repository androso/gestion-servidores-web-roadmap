import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateRoadmapCollection, validateRoadmapDocument } from './validate-roadmaps.mjs';

function createValidMinimalDoc() {
  return {
    schemaVersion: 1,
    slug: 'minimal-course',
    title: 'Minimal Course',
    description: 'A minimal valid course roadmap for testing',
    canvas: {
      width: 800,
      height: 600,
      minZoom: 0.5,
      maxZoom: 2.0,
      initialViewport: { x: 0, y: 0, zoom: 1.0 },
    },
    nodes: [
      {
        id: 'title-node',
        type: 'title',
        position: { x: 50, y: 30 },
        size: { width: 400, height: 60 },
        data: { text: 'Minimal Course' },
      },
      {
        id: 'topic-1',
        type: 'topic',
        position: { x: 50, y: 150 },
        size: { width: 250, height: 50 },
        data: { label: 'Intro Topic', order: '01' },
      },
      {
        id: 'subtopic-1',
        type: 'subtopic',
        position: { x: 350, y: 150 },
        size: { width: 250, height: 50 },
        data: { label: 'Subtopic Detail', order: '02' },
      },
    ],
    edges: [
      {
        id: 'e-t1-s1',
        source: 'topic-1',
        target: 'subtopic-1',
        sourceHandle: 'right',
        targetHandle: 'left',
        route: 'smoothstep',
      },
    ],
    topics: {
      'topic-1': {
        title: 'Intro Topic',
        content: '# Intro Topic\n\nIntroductory content.',
        sourceRefs: [
          {
            label: 'Lesson 1',
            locator: 'Slides 1-5',
          },
        ],
      },
      'subtopic-1': {
        title: 'Subtopic Detail',
        content: '# Subtopic Detail\n\nDetailed content.',
        sourceRefs: [
          {
            label: 'Lesson 1',
            locator: 'Slides 6-10',
          },
        ],
      },
    },
  };
}

test('accepts a valid minimal roadmap document', () => {
  const doc = createValidMinimalDoc();
  const result = validateRoadmapDocument(doc);
  assert.equal(result.valid, true, `Expected valid, got errors: ${result.errors.join(', ')}`);
  assert.equal(result.errors.length, 0);
});

test('rejects invalid schemaVersion', () => {
  const doc = createValidMinimalDoc();
  doc.schemaVersion = 2;
  const result = validateRoadmapDocument(doc);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes('Expected schemaVersion to be 1')));
});

test('rejects duplicate node IDs', () => {
  const doc = createValidMinimalDoc();
  doc.nodes.push({
    id: 'topic-1',
    type: 'topic',
    position: { x: 50, y: 250 },
    size: { width: 200, height: 50 },
    data: { label: 'Duplicate Topic' },
  });
  const result = validateRoadmapDocument(doc);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes("Duplicate node id 'topic-1'")));
});

test('rejects missing edge source or target', () => {
  const doc = createValidMinimalDoc();
  doc.edges.push({
    id: 'e-invalid',
    source: 'topic-1',
    target: 'non-existent-node',
  });
  const result = validateRoadmapDocument(doc);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes("Edge target 'non-existent-node' does not exist")));
});

test('rejects missing topic details for trackable nodes', () => {
  const doc = createValidMinimalDoc();
  delete doc.topics['subtopic-1'];
  const result = validateRoadmapDocument(doc);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes("Missing topic details entry for node 'subtopic-1'")));
});

test('rejects topic details without source references', () => {
  const doc = createValidMinimalDoc();
  doc.topics['topic-1'].sourceRefs = [];
  const result = validateRoadmapDocument(doc);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes('at least one source reference in sourceRefs')));
});

test('rejects orphan topic details', () => {
  const doc = createValidMinimalDoc();
  doc.topics['orphan-topic'] = {
    title: 'Orphan',
    content: 'No matching node',
    sourceRefs: [{ label: 'Source', locator: 'p. 1' }],
  };
  const result = validateRoadmapDocument(doc);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes("Orphan topic detail 'orphan-topic'")));
});

test('rejects out-of-bounds nodes', () => {
  const doc = createValidMinimalDoc();
  doc.nodes.push({
    id: 'out-of-bounds-topic',
    type: 'topic',
    position: { x: 750, y: 580 },
    size: { width: 200, height: 50 },
    data: { label: 'Out of bounds' },
  });
  doc.topics['out-of-bounds-topic'] = {
    title: 'Out of bounds',
    content: 'Content',
    sourceRefs: [{ label: 'Source', locator: 'p. 1' }],
  };
  const result = validateRoadmapDocument(doc);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes('exceeds canvas width') || e.includes('exceeds canvas height')));
});

test('rejects an edge attached to a non-connectable node', () => {
  const doc = createValidMinimalDoc();
  doc.nodes.push({
    id: 'section-1',
    type: 'section',
    position: { x: 50, y: 250 },
    size: { width: 200, height: 120 },
    data: { label: 'Module' },
  });
  doc.edges.push({
    id: 'e-section-topic',
    source: 'section-1',
    target: 'topic-1',
    sourceHandle: 'bottom',
    targetHandle: 'top',
  });
  const result = validateRoadmapDocument(doc);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes('non-connectable type')));
});

test('rejects an edge with a missing handle', () => {
  const doc = createValidMinimalDoc();
  doc.edges.push({
    id: 'e-missing-handle',
    source: 'topic-1',
    target: 'title-node',
    targetHandle: 'top',
  });
  const result = validateRoadmapDocument(doc);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes('valid sourceHandle')));
});

test('rejects a disconnected topic', () => {
  const doc = createValidMinimalDoc();
  doc.nodes.push({
    id: 'orphan-card',
    type: 'topic',
    position: { x: 50, y: 280 },
    size: { width: 200, height: 50 },
    data: { label: 'Disconnected topic' },
  });
  doc.topics['orphan-card'] = {
    title: 'Disconnected topic',
    content: 'Content',
    sourceRefs: [{ label: 'Source', locator: 'p. 1' }],
  };
  const result = validateRoadmapDocument(doc);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes('orphan-card') && e.includes('topic/subtopic is disconnected')));
});

test('rejects a local PDF url that is missing from public/', () => {
  const doc = createValidMinimalDoc();
  doc.topics['topic-1'].sourceRefs = [
    {
      label: 'Missing.pdf',
      locator: 'p. 1',
      url: '/minimal-course/materiales/Missing.pdf',
    },
  ];
  const result = validateRoadmapDocument(doc, { publicDir: '/tmp' });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes('Source PDF is missing on disk')));
});

test('rejects an invalid URL protocol', () => {
  const doc = createValidMinimalDoc();
  doc.topics['topic-1'].resources = [
    { type: 'official', title: 'Unsafe', url: 'ftp://example.com/manual' },
  ];
  const result = validateRoadmapDocument(doc);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes("Invalid URL 'ftp://example.com/manual'")));
});

test('rejects duplicate document slugs through validateRoadmapCollection', () => {
  const result = validateRoadmapCollection([
    { directory: 'course-a', document: { slug: 'shared-slug' } },
    { directory: 'course-b', document: { slug: 'shared-slug' } },
  ]);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes("Duplicate document slug 'shared-slug'")));
});

test('rejects a directory/document slug mismatch', () => {
  const result = validateRoadmapCollection([
    { directory: 'course-folder', document: { slug: 'other-slug' } },
  ]);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes("Directory 'course-folder' does not match document slug 'other-slug'")));
});

test('rejects invalid initial zoom', () => {
  const doc = createValidMinimalDoc();
  doc.canvas.initialViewport = { x: 0, y: 0, zoom: 3 };
  const result = validateRoadmapDocument(doc);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes('outside canvas range')));
});

test('rejects a topic without a study order', () => {
  const doc = createValidMinimalDoc();
  delete doc.nodes[1].data.order;
  const result = validateRoadmapDocument(doc);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes('must declare a study order')));
});

test('rejects a study order that decreases along an edge', () => {
  const doc = createValidMinimalDoc();
  doc.nodes[1].data.order = '05';
  doc.nodes[2].data.order = '03';
  const result = validateRoadmapDocument(doc);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes('Study order must increase along an edge')));
});

test('rejects duplicate study orders', () => {
  const doc = createValidMinimalDoc();
  doc.nodes[2].data.order = '01';
  const result = validateRoadmapDocument(doc);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes('Duplicate study order')));
});

test('accepts parallel branch steps that share a number with different suffixes', () => {
  const doc = createValidMinimalDoc();
  doc.nodes[1].data.order = '01';
  doc.nodes[2].data.order = '02a';
  const result = validateRoadmapDocument(doc);
  assert.equal(result.valid, true, `Expected valid, got errors: ${result.errors.join(', ')}`);
});

test('rejects a minZoom that stops Fit View from showing the whole document', () => {
  const doc = createValidMinimalDoc();
  doc.canvas.height = 4000;
  const result = validateRoadmapDocument(doc);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes('prevents Fit View from showing the whole')));
});

test('rejects overlapping content blocks', () => {
  const doc = createValidMinimalDoc();
  doc.nodes.push({
    id: 'overlap-topic',
    type: 'topic',
    position: { x: 80, y: 160 },
    size: { width: 250, height: 50 },
    data: { label: 'Overlapping topic' },
  });
  doc.topics['overlap-topic'] = {
    title: 'Overlapping topic',
    content: 'Content',
    sourceRefs: [{ label: 'Source', locator: 'p. 1' }],
  };
  doc.edges.push({
    id: 'e-topic-overlap',
    source: 'subtopic-1',
    target: 'overlap-topic',
    sourceHandle: 'bottom',
    targetHandle: 'top',
  });
  const result = validateRoadmapDocument(doc);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes('overlaps')));
});
