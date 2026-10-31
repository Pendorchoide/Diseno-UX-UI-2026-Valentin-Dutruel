import test from 'node:test';
import assert from 'node:assert/strict';
import { generarPoliza, simularPago } from '../src/payment.js';

test('simula el rechazo solo para la tarjeta indicada', async () => {
  assert.deepEqual(await simularPago('4000 0000 0000 0002'), {
    ok: false,
    motivo: 'Tarjeta rechazada',
  });
  assert.deepEqual(await simularPago('4111 1111 1111 1111'), { ok: true });
  assert.deepEqual(await simularPago('1234 5678 9012 3456'), { ok: true });
});

test('genera números de póliza con formato POL-AAAA-NNNNNN', () => {
  assert.equal(generarPoliza(new Date(2026, 0, 1), () => 0.123456), 'POL-2026-123456');
});
