import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { calcularCuota, FACTORES_ANTIGUEDAD } from '../src/pricing.js';

const planes = JSON.parse(readFileSync(new URL('../public/data/planes.json', import.meta.url), 'utf8'));

test('calcula las cuotas exactas de los casos requeridos usando planes.json', () => {
  const cases = [
    {
      valor: 600000,
      antiguedad: 'menos-1',
      cuotas: { basico: 2000, plus: 3000, premium: 4500 },
    },
    {
      valor: 600000,
      antiguedad: '1-2',
      cuotas: { basico: 2200, plus: 3300, premium: 4950 },
    },
    {
      valor: 1200000,
      antiguedad: 'mas-2',
      cuotas: { basico: 5000, plus: 7500, premium: 11250 },
    },
  ];

  cases.forEach(({ valor, antiguedad, cuotas }) => {
    planes.forEach((plan) => {
      assert.equal(
        calcularCuota(valor, plan.tasaAnual, FACTORES_ANTIGUEDAD[antiguedad]),
        cuotas[plan.id],
        `${plan.nombre}, $${valor}, antigüedad ${antiguedad}`,
      );
    });
  });
});

test('redondea la cuota al entero más cercano', () => {
  assert.equal(calcularCuota(600100, 0.04, FACTORES_ANTIGUEDAD['menos-1']), 2000);
  assert.equal(calcularCuota(600100, 0.06, FACTORES_ANTIGUEDAD['menos-1']), 3001);
});

test('rechaza valores no numéricos al calcular la cuota', () => {
  assert.throws(() => calcularCuota(Number.NaN, 0.04, 1), TypeError);
});
