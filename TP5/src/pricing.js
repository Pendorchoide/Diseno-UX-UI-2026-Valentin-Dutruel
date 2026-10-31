export const FACTORES_ANTIGUEDAD = Object.freeze({
  'menos-1': 1,
  '1-2': 1.1,
  'mas-2': 1.25,
});

export function calcularCuota(valor, tasaAnual, factorAntiguedad) {
  if (!Number.isFinite(valor) || !Number.isFinite(tasaAnual) || !Number.isFinite(factorAntiguedad)) {
    throw new TypeError('Los valores para calcular la cuota deben ser números finitos.');
  }

  return Math.round((valor * tasaAnual / 12) * factorAntiguedad);
}

export function formatearMoneda(valor) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(valor);
}
