import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatBRL, slugify, slugSchema } from './index.js';

test('slugify remove acentos e símbolos', () => {
  assert.equal(slugify('  Fone Bluetooth Ágil 2.0! '), 'fone-bluetooth-agil-2-0');
  assert.ok(slugSchema.safeParse(slugify('Copo Térmico 900ml')).success);
});

test('formatBRL usa centavos', () => {
  assert.equal(formatBRL(8990).replace(/\s/g, ' '), 'R$ 89,90');
});

test('PATCH parcial não injeta valores padrão', async () => {
  const { productUpdateSchema, categoryUpdateSchema } = await import('./index.js');
  assert.deepEqual(productUpdateSchema.parse({ status: 'ACTIVE' }), { status: 'ACTIVE' });
  assert.deepEqual(categoryUpdateSchema.parse({ name: 'Casa' }), { name: 'Casa' });
});

test('parseBRLToCents', async () => {
  const { parseBRLToCents } = await import('./index.js');
  assert.equal(parseBRLToCents('89,90'), 8990);
  assert.equal(parseBRLToCents('R$ 1.299,9'), 129990);
  assert.equal(parseBRLToCents('59'), 5900);
  for (const bad of ['', 'abc', '1,999', '-5', '0', '12.5'])
    assert.equal(parseBRLToCents(bad), null, bad);
});
