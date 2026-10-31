const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DNI_PATTERN = /^\d{7,8}$/;
const MODEL_PATTERN = /^.{2,40}$/u;
const AGE_OPTIONS = new Set(['menos-1', '1-2', 'mas-2']);

export function validarMarca(value) {
  return value ? null : 'Elegí una marca';
}

export function validarModelo(value) {
  return MODEL_PATTERN.test(value.trim()) ? null : 'Ingresá el modelo del equipo';
}

export function validarValor(value) {
  const raw = String(value).trim();
  const amount = Number(raw.replace(/\D/g, ''));
  return /^[\d.,\s$]+$/.test(raw)
    && Number.isFinite(amount)
    && amount >= 100000
    && amount <= 2500000
    ? null
    : 'El valor debe estar entre $100.000 y $2.500.000';
}

export function validarAntiguedad(value) {
  return AGE_OPTIONS.has(value)
    ? null
    : 'Indicá la antigüedad';
}

export function validarNombre(value, label = 'nombre') {
  const letters = value.trim().match(/\p{L}/gu) ?? [];
  return letters.length >= 2 ? null : `Ingresá tu ${label}`;
}

export function validarDni(value) {
  return DNI_PATTERN.test(value)
    ? null
    : 'El DNI debe tener 7 u 8 números';
}

export function validarNacimiento(value, today = new Date()) {
  const dateValue = value.trim();
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);
  const localMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dateValue);
  if (!isoMatch && !localMatch) return 'Tenés que ser mayor de edad';

  const [, yearText, monthText, dayText] = isoMatch ?? [
    localMatch[0],
    localMatch[3],
    localMatch[2],
    localMatch[1],
  ];
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);
  const birthDate = new Date(year, month - 1, day);

  if (
    birthDate.getFullYear() !== year
    || birthDate.getMonth() !== month - 1
    || birthDate.getDate() !== day
    || birthDate > today
  ) {
    return 'Tenés que ser mayor de edad';
  }

  let age = today.getFullYear() - year;
  if (
    today.getMonth() < month - 1
    || (today.getMonth() === month - 1 && today.getDate() < day)
  ) {
    age -= 1;
  }

  return age >= 18 ? null : 'Tenés que ser mayor de edad';
}

export function validarEmail(value) {
  return EMAIL_PATTERN.test(value.trim()) ? null : 'Ingresá un email válido';
}

export function validarCelular(value) {
  const digits = value.replace(/[\s-]/g, '');
  return /^\d{10}$/.test(digits) && !digits.startsWith('0') && !digits.startsWith('15')
    ? null
    : 'Ingresá un celular de 10 dígitos sin 0 ni 15';
}

export function validarTarjeta(value) {
  return value.replace(/\s/g, '').length === 16 && /^\d{16}$/.test(value.replace(/\s/g, ''))
    ? null
    : 'Número de tarjeta inválido';
}

export function validarVencimiento(value, today = new Date()) {
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(value.trim());
  if (!match) return 'Vencimiento inválido';

  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  return year > today.getFullYear()
    || (year === today.getFullYear() && month >= today.getMonth() + 1)
    ? null
    : 'Vencimiento inválido';
}

export function validarCvv(value) {
  return /^\d{3}$/.test(value) ? null : 'CVV inválido';
}

export function validarTitularTarjeta(value) {
  return value.trim() ? null : 'Ingresá el nombre del titular';
}

export function validarTerminos(accepted) {
  return accepted ? null : 'Tenés que aceptar los términos';
}
