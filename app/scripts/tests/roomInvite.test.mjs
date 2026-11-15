import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const source = fs.readFileSync(new URL('../../src/features/pvp/roomInvite.ts', import.meta.url), 'utf8');
const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const exports = {}; new Function('exports', output)(exports);
const { readRoomInvite, buildRoomInvite } = exports;
const base = 'https://nihongo.onrender.com/api';

test('same-server link opens the requested room with no extra setup', () => {
  const link = buildRoomInvite('https://nihongo.vercel.app/', 'abc123', base, base);
  assert.equal(link, 'https://nihongo.vercel.app/?room=ABC123');
  assert.deepEqual(readRoomInvite(link, base), { invite: { code: 'ABC123', base }, error: '' });
});
test('custom backend is preserved, without previous URL parameters or tokens', () => {
  const link = buildRoomInvite('https://site.app/?room=OLD123&token=secret#old', 'def456', 'https://another.app/api/', base);
  assert.ok(!link.includes('secret')); assert.ok(!link.includes('#'));
  assert.deepEqual(readRoomInvite(link, base).invite, { code: 'DEF456', base: 'https://another.app/api' });
});
test('normal home URL does not activate an invitation', () => {
  assert.deepEqual(readRoomInvite('https://site.app/', base), { invite: null, error: '' });
});
test('invalid room codes produce a useful error', () => {
  const result = readRoomInvite('https://site.app/?room=bad', base);
  assert.equal(result.invite, null); assert.match(result.error, /Mã phòng/);
});
test('rejects unsafe protocols, credentials, query parameters and mixed-content APIs', () => {
  for (const api of ['javascript:alert(1)', 'https://user:pass@site.app/api', 'https://site.app/api?token=secret', 'http://site.app/api']) {
    const result = readRoomInvite(`https://site.app/?room=ABC123&api=${encodeURIComponent(api)}`, base);
    assert.equal(result.invite, null); assert.ok(result.error);
  }
});
test('localhost and relative API deployments remain supported', () => {
  const local = 'http://localhost:8088/api';
  const link = buildRoomInvite('http://localhost:1420/', 'ABC123', local, local);
  assert.equal(readRoomInvite(link, local).invite.base, local);
  const relative = buildRoomInvite('https://site.app/app/', 'ABC123', '/api', '/api');
  assert.equal(readRoomInvite(relative, '/api').invite.base, 'https://site.app/api');
});
