import test from 'node:test';
import assert from 'node:assert/strict';
import { calcularCuota, FACTORES_ANTIGUEDAD } from '../src/pricing.js';

test('calcula las tres tarifas base para un equipo de $600.000', () => {
  assert.equal(calcularCuota(600000, 0.04, FACTORES_ANTIGUEDAD['menos-1']), 2000);
  assert.equal(calcularCuota(600000, 0.06, FACTORES_ANTIGUEDAD['menos-1']), 3000);
  assert.equal(calcularCuota(600000, 0.09, FACTORES_ANTIGUEDAD['menos-1']), 4500);
  assert.equal(calcularCuota(600000, 0.04, FACTORES_ANTIGUEDAD['1-2']), 2200);
  assert.equal(calcularCuota(600000, 0.06, FACTORES_ANTIGUEDAD['1-2']), 3300);
  assert.equal(calcularCuota(600000, 0.09, FACTORES_ANTIGUEDAD['1-2']), 4950);
});

test('aplica el factor de antigüedad y redondea la cuota', () => {
  assert.equal(calcularCuota(600000, 0.04, FACTORES_ANTIGUEDAD['1-2']), 2200);
  assert.equal(calcularCuota(1200000, 0.04, FACTORES_ANTIGUEDAD['mas-2']), 5000);
  assert.equal(calcularCuota(1200000, 0.06, FACTORES_ANTIGUEDAD['mas-2']), 7500);
  assert.equal(calcularCuota(1200000, 0.09, FACTORES_ANTIGUEDAD['mas-2']), 11250);
});

test('rechaza valores no numéricos al calcular la cuota', () => {
  assert.throws(() => calcularCuota(Number.NaN, 0.04, 1), TypeError);
});
