import test from 'node:test';
import assert from 'node:assert/strict';
import { extractIncomingMessages } from '../src/services/whatsapp.js';

test('extrait un message texte du webhook WhatsApp', () => {
  const messages = extractIncomingMessages({ entry: [{ changes: [{ value: { messages: [{ id: 'wamid.1', from: '22997000000', type: 'text', text: { body: 'Bonjour' } }] } }] }] });
  assert.equal(messages.length, 1);
  assert.deepEqual(messages[0], { id: 'wamid.1', from: '22997000000', type: 'text', text: 'Bonjour', timestamp: undefined });
});
