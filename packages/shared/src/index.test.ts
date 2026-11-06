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
