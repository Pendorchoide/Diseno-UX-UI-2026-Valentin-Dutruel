export const TARJETA_RECHAZADA = '4000000000000002';

export function simularPago(numero) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(numero.replace(/\s/g, '') === TARJETA_RECHAZADA
        ? { ok: false, motivo: 'Tarjeta rechazada' }
        : { ok: true });
    }, 1500);
  });
}

export function generarPoliza(today = new Date(), random = Math.random) {
  const sequence = String(Math.floor(random() * 999999) + 1).padStart(6, '0');
  return `POL-${today.getFullYear()}-${sequence}`;
}
