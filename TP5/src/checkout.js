import { calcularCuota, FACTORES_ANTIGUEDAD, formatearMoneda } from './pricing.js';
import { generarPoliza, simularPago, TARJETA_RECHAZADA } from './payment.js';
import {
  validarAntiguedad,
  validarCelular,
  validarCvv,
  validarDni,
  validarEmail,
  validarMarca,
  validarModelo,
  validarNacimiento,
  validarNombre,
  validarTarjeta,
  validarTerminos,
  validarTitularTarjeta,
  validarValor,
  validarVencimiento,
} from './validations.js';

const STORAGE_KEY = 'cubri-solicitud';
const PLANES_URL = '/data/planes.json';

function crearSolicitudInicial() {
  return {
    paso: 0,
    equipo: {
      marca: 'Samsung',
      modelo: 'Galaxy A55',
      valor: 600000,
      antiguedad: 'menos-1',
    },
    plan: 'plus',
    titular: {
      nombre: 'Juan',
      apellido: 'Pérez',
      dni: '30123456',
      nacimiento: '',
      email: 'juan.perez@',
      celular: '11 5555-1234',
      terminos: true,
    },
    pago: {
      metodo: 'credito',
      tarjetaPrueba: null,
      motivo: '',
    },
    poliza: null,
  };
}

function esObjeto(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function textoGuardado(value, fallback) {
  return typeof value === 'string' ? value : fallback;
}

function cargarSolicitud() {
  const raw = localStorage.getItem(STORAGE_KEY);
  const inicial = crearSolicitudInicial();
  if (!raw) return inicial;

  let guardada;
  try {
    guardada = JSON.parse(raw);
  } catch (error) {
    console.warn('Se descartó el estado guardado porque no es JSON válido.', error);
    localStorage.removeItem(STORAGE_KEY);
    return inicial;
  }

  if (!esObjeto(guardada)) {
    console.error('Se descartó el estado guardado porque tiene un formato inválido.');
    localStorage.removeItem(STORAGE_KEY);
    return inicial;
  }

  const equipo = esObjeto(guardada.equipo) ? guardada.equipo : {};
  const titular = esObjeto(guardada.titular) ? guardada.titular : {};
  const pago = esObjeto(guardada.pago) ? guardada.pago : {};
  const valorEquipo = typeof equipo.valor === 'number' && Number.isFinite(equipo.valor)
    ? equipo.valor
    : inicial.equipo.valor;

  return {
    ...inicial,
    paso: Number.isInteger(guardada.paso) ? guardada.paso : inicial.paso,
    equipo: {
      marca: textoGuardado(equipo.marca, inicial.equipo.marca),
      modelo: textoGuardado(equipo.modelo, inicial.equipo.modelo),
      valor: valorEquipo,
      antiguedad: textoGuardado(equipo.antiguedad, inicial.equipo.antiguedad),
    },
    plan: textoGuardado(guardada.plan, inicial.plan),
    titular: {
      nombre: textoGuardado(titular.nombre, inicial.titular.nombre),
      apellido: textoGuardado(titular.apellido, inicial.titular.apellido),
      dni: textoGuardado(titular.dni, inicial.titular.dni),
      nacimiento: textoGuardado(titular.nacimiento, inicial.titular.nacimiento),
      email: textoGuardado(titular.email, inicial.titular.email),
      celular: textoGuardado(titular.celular, inicial.titular.celular),
      terminos: typeof titular.terminos === 'boolean' ? titular.terminos : inicial.titular.terminos,
    },
    pago: {
      ...inicial.pago,
      metodo: pago.metodo === 'debito' ? 'debito' : 'credito',
      tarjetaPrueba: ['aprobada', 'rechazada'].includes(pago.tarjetaPrueba)
        ? pago.tarjetaPrueba
        : null,
      motivo: typeof pago.motivo === 'string' ? pago.motivo : '',
    },
    poliza: typeof guardada.poliza === 'string' ? guardada.poliza : null,
  };
}

export const solicitud = cargarSolicitud();
let planes = [];
let intentoDePagoEnCurso = false;
const camposTocados = new Set();

function guardarSolicitud() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(solicitud));
}

function formatearNumero(value) {
  return new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(value);
}

function leerValorNumerico(value) {
  const digits = String(value).replace(/\D/g, '');
  return digits ? Number(digits) : 0;
}

function obtenerPlan(planId = solicitud.plan) {
  return planes.find((plan) => plan.id === planId) ?? null;
}

export function obtenerCuota(plan) {
  const ageKey = solicitud.equipo.antiguedad;
  if (!plan || !Object.hasOwn(FACTORES_ANTIGUEDAD, ageKey)) return null;
  const antiguedad = FACTORES_ANTIGUEDAD[ageKey];
  return calcularCuota(solicitud.equipo.valor, plan.tasaAnual, antiguedad);
}

function actualizarSalidas() {
  const plan = obtenerPlan();
  const precio = obtenerCuota(plan);
  const nombreCompleto = `${solicitud.titular.nombre} ${solicitud.titular.apellido}`.trim();
  const equipo = `${solicitud.equipo.marca} ${solicitud.equipo.modelo}`.trim();
  const fechaPoliza = new Intl.DateTimeFormat('es-AR').format(new Date());
  const valores = {
    device: equipo,
    'insured-value': formatearMoneda(solicitud.equipo.valor),
    plan: plan?.nombre ?? '—',
    'monthly-price': precio === null ? '—' : formatearMoneda(precio),
    'mobile-plan': `Plan ${plan?.nombre ?? '—'} · ${solicitud.equipo.modelo}`,
    'mobile-price': precio === null ? '—' : `${formatearMoneda(precio)}/mes`,
    'mobile-product-plan': `Celular · Plan ${plan?.nombre ?? '—'}`,
    'customer-name': nombreCompleto,
    'first-name': solicitud.titular.nombre,
    email: solicitud.titular.email,
    'policy-number': solicitud.poliza ?? 'POL-2026-000123',
    'policy-date': fechaPoliza,
    'payment-error': solicitud.pago.motivo
      ? `${solicitud.pago.motivo}. Tus datos quedaron guardados; podés reintentar o cambiar el medio de pago.`
      : 'Tarjeta de prueba que fuerza el error: 4000 0000 0000 0002',
  };

  document.querySelectorAll('[data-output]').forEach((element) => {
    const value = valores[element.dataset.output];
    if (value !== undefined) element.textContent = value;
  });

  document.querySelectorAll('[data-plan-price]').forEach((element) => {
    const pricePlan = obtenerPlan(element.dataset.planPrice);
    const amount = obtenerCuota(pricePlan);
    element.textContent = amount === null ? '—' : formatearMoneda(amount);
  });

  const quoteMessage = document.querySelector('[data-output="quote-message"]');
  if (quoteMessage) {
    const quoteValid = !validarMarca(solicitud.equipo.marca)
      && !validarModelo(solicitud.equipo.modelo)
      && !validarValor(String(solicitud.equipo.valor))
      && !validarAntiguedad(solicitud.equipo.antiguedad);
    const lowestPrice = planes.length
      ? Math.min(...planes.map((availablePlan) => obtenerCuota(availablePlan)))
      : null;
    quoteMessage.textContent = quoteValid && lowestPrice !== null
      ? `Desde ${formatearMoneda(lowestPrice)}/mes. Elegí un plan para ver la cuota exacta.`
      : 'Completá los datos del equipo para ver el precio.';
  }
}

function actualizarStepper() {
  const step = Number(document.body.dataset.step);
  if (!step) return;

  document.querySelectorAll('.step-item').forEach((item, index) => {
    const number = index + 1;
    const isComplete = number < step;
    const isActive = number === step;
    item.classList.toggle('step-complete', isComplete);
    item.classList.toggle('step-active', isActive);
    if (isActive) item.setAttribute('aria-current', 'step');
    else item.removeAttribute('aria-current');

    const stepNumber = item.querySelector('.step-number');
    if (stepNumber) stepNumber.textContent = isComplete ? '✓' : String(number);
  });
}

function render() {
  actualizarStepper();
  actualizarSalidas();
}

function setFieldError(input, errorId, message, show) {
  const errorElement = document.getElementById(errorId);
  const field = input.closest('.field, .terms-field');
  const invalid = show && Boolean(message);

  input.setAttribute('aria-invalid', String(invalid));
  field?.toggleAttribute('data-invalid', invalid);
  if (errorElement) {
    errorElement.hidden = !invalid;
    if (invalid) errorElement.textContent = message;
  }
}

function updateDisabledMessage(buttons, message, isDisabled) {
  buttons.forEach((button) => {
    button.disabled = isDisabled;
    button.classList.toggle('btn-disabled', isDisabled);
  });
  document.querySelectorAll('.disabled-message').forEach((element) => {
    element.hidden = !isDisabled;
    element.textContent = message;
  });
}

function iniciarCotizacion() {
  const form = document.getElementById('quote-form');
  if (!form) return;

  const brand = form.elements.marca;
  const model = form.elements.modelo;
  const value = form.elements.valor;
  const ageInputs = [...form.querySelectorAll('[name="antiguedad"]')];
  const submitButtons = [...document.querySelectorAll('[form="quote-form"], #quote-form button[type="submit"]')];

  brand.value = solicitud.equipo.marca;
  model.value = solicitud.equipo.modelo;
  value.value = formatearNumero(solicitud.equipo.valor);
  ageInputs.forEach((input) => {
    input.checked = input.value === solicitud.equipo.antiguedad;
  });

  function leerFormulario() {
    solicitud.equipo.marca = brand.value;
    solicitud.equipo.modelo = model.value.trim();
    solicitud.equipo.valor = leerValorNumerico(value.value);
    solicitud.equipo.antiguedad = ageInputs.find((input) => input.checked)?.value ?? '';
    guardarSolicitud();
    render();
    validarFormulario();
  }

  function validarFormulario(revealAll = false) {
    const errors = [
      [brand, 'marca-error', validarMarca(brand.value), 'marca'],
      [model, 'modelo-error', validarModelo(model.value), 'modelo'],
      [value, 'valor-error', validarValor(value.value), 'valor'],
    ];
    let valid = errors.every(([, , message]) => message === null)
      && validarAntiguedad(ageInputs.find((input) => input.checked)?.value ?? '') === null;

    errors.forEach(([input, errorId, message, key]) => {
      setFieldError(input, errorId, message, revealAll || camposTocados.has(key));
    });

    const ageError = validarAntiguedad(ageInputs.find((input) => input.checked)?.value ?? '');
    const ageField = form.querySelector('.age-field');
    const ageMessage = document.getElementById('antiguedad-error');
    if (ageMessage) ageMessage.hidden = !(revealAll || camposTocados.has('antiguedad')) || !ageError;
    ageField?.toggleAttribute('data-invalid', Boolean(ageError && (revealAll || camposTocados.has('antiguedad'))));

    updateDisabledMessage(submitButtons, 'Completá los campos para ver los planes', !valid);
    return valid;
  }

  form.addEventListener('input', leerFormulario);
  form.addEventListener('change', leerFormulario);
  form.addEventListener('focusout', (event) => {
    const control = event.target;
    if (!(control instanceof HTMLInputElement || control instanceof HTMLSelectElement)) return;
    camposTocados.add(control.name === 'antiguedad' ? 'antiguedad' : control.name);
    if (control === value && !validarValor(value.value)) {
      const amount = leerValorNumerico(value.value);
      if (amount) value.value = formatearNumero(amount);
    }
    leerFormulario();
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validarFormulario(true)) {
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    solicitud.paso = 2;
    guardarSolicitud();
    window.location.assign('/views/planes.html');
  });

  validarFormulario();
}

function iniciarPlanes() {
  const radios = [...document.querySelectorAll('input[name="plan"]')];
  if (!radios.length) return;

  radios.forEach((radio) => {
    radio.checked = radio.value === solicitud.plan;
    radio.addEventListener('change', () => {
      if (!radio.checked) return;
      solicitud.plan = radio.value;
      solicitud.paso = 2;
      guardarSolicitud();
      render();
    });
  });

  document.querySelectorAll('a[href="/views/datos.html"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (!obtenerPlan()) {
        event.preventDefault();
        mostrarErrorCargaPlanes();
        return;
      }
      solicitud.paso = 3;
      guardarSolicitud();
    });
  });
}

function leerTitularDesdeFormulario(form) {
  solicitud.titular = {
    nombre: form.elements.firstName.value.trim(),
    apellido: form.elements.lastName.value.trim(),
    dni: form.elements.dni.value.trim(),
    nacimiento: form.elements.birthDate.value.trim(),
    email: form.elements.email.value.trim(),
    celular: form.elements.phone.value.trim(),
    terminos: form.elements.terms.checked,
  };
}

function iniciarDatosPersonales() {
  const form = document.getElementById('customer-form');
  if (!form) return;

  const fields = [
    { input: form.elements.firstName, key: 'nombre', errorId: 'nombre-error', validate: validarNombre, label: 'nombre' },
    { input: form.elements.lastName, key: 'apellido', errorId: 'apellido-error', validate: validarNombre, label: 'apellido' },
    { input: form.elements.dni, key: 'dni', errorId: 'dni-error', validate: validarDni },
    { input: form.elements.birthDate, key: 'nacimiento', errorId: 'nacimiento-error', validate: validarNacimiento },
    { input: form.elements.email, key: 'email', errorId: 'email-error', validate: validarEmail },
    { input: form.elements.phone, key: 'celular', errorId: 'celular-error', validate: validarCelular },
    { input: form.elements.terms, key: 'terminos', errorId: 'terms-error', validate: validarTerminos },
  ];
  const submitButtons = [...document.querySelectorAll('[form="customer-form"], #customer-form button[type="submit"]')];

  form.elements.firstName.value = solicitud.titular.nombre;
  form.elements.lastName.value = solicitud.titular.apellido;
  form.elements.dni.value = solicitud.titular.dni;
  form.elements.birthDate.value = solicitud.titular.nacimiento.replace(
    /^(\d{2})\/(\d{2})\/(\d{4})$/,
    '$3-$2-$1',
  );
  form.elements.email.value = solicitud.titular.email;
  form.elements.phone.value = solicitud.titular.celular;
  form.elements.terms.checked = solicitud.titular.terminos;
  if (validarEmail(form.elements.email.value)) camposTocados.add('email');

  function validarFormulario(revealAll = false) {
    let valid = true;
    fields.forEach(({ input, key, errorId, validate, label }) => {
      const value = input.type === 'checkbox' ? input.checked : input.value;
      const message = key === 'apellido'
        ? validate(value, label)
        : validate(value);
      const show = revealAll || camposTocados.has(key);
      setFieldError(input, errorId, message, show);
      if (message) valid = false;
    });
    updateDisabledMessage(submitButtons, 'Completá los campos para continuar', !valid);
    return valid;
  }

  form.addEventListener('input', () => {
    leerTitularDesdeFormulario(form);
    guardarSolicitud();
    render();
    validarFormulario();
  });
  form.addEventListener('change', () => {
    leerTitularDesdeFormulario(form);
    guardarSolicitud();
    render();
    validarFormulario();
  });
  form.addEventListener('focusout', (event) => {
    const field = fields.find(({ input }) => input === event.target);
    if (!field) return;
    camposTocados.add(field.key);
    leerTitularDesdeFormulario(form);
    guardarSolicitud();
    validarFormulario();
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    leerTitularDesdeFormulario(form);
    if (!validarFormulario(true)) {
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    solicitud.paso = 4;
    guardarSolicitud();
    window.location.assign('/views/pago.html');
  });

  validarFormulario();
}

function iniciarPago() {
  const form = document.getElementById('payment-form');
  if (!form) return;

  const cardNumber = form.elements.cardNumber;
  const expiry = form.elements.expiry;
  const cvv = form.elements.cvv;
  const cardholder = form.elements.cardholder;
  const methodRadios = [...form.querySelectorAll('[name="metodo"]')];
  const fields = [
    { input: cardNumber, key: 'tarjeta', errorId: 'tarjeta-error', validate: validarTarjeta },
    { input: expiry, key: 'vencimiento', errorId: 'vencimiento-error', validate: validarVencimiento },
    { input: cvv, key: 'cvv', errorId: 'cvv-error', validate: validarCvv },
    { input: cardholder, key: 'titular-tarjeta', errorId: 'titular-error', validate: validarTitularTarjeta },
  ];

  methodRadios.forEach((radio) => {
    radio.checked = radio.value === solicitud.pago.metodo;
    radio.addEventListener('change', () => {
      if (!radio.checked) return;
      solicitud.pago.metodo = radio.value;
      guardarSolicitud();
    });
  });

  cardholder.value = `${solicitud.titular.nombre} ${solicitud.titular.apellido}`.trim().toLocaleUpperCase('es-AR');
  if (solicitud.pago.tarjetaPrueba === 'rechazada') cardNumber.value = '4000 0000 0000 0002';
  else if (solicitud.pago.tarjetaPrueba === 'aprobada') cardNumber.value = '4111 1111 1111 1111';

  function validarFormulario(revealAll = false) {
    let valid = true;
    fields.forEach(({ input, key, errorId, validate }) => {
      const message = validate(input.value.trim());
      const show = revealAll || camposTocados.has(key);
      setFieldError(input, errorId, message, show);
      if (message) valid = false;
    });
    return valid;
  }

  form.addEventListener('input', (event) => {
    const control = event.target;
    if (control === cardNumber) {
      const digits = cardNumber.value.replace(/\D/g, '').slice(0, 16);
      cardNumber.value = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    } else if (control === expiry) {
      const digits = expiry.value.replace(/\D/g, '').slice(0, 4);
      expiry.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    } else if (control === cvv) {
      cvv.value = cvv.value.replace(/\D/g, '').slice(0, 3);
    }

    const field = fields.find(({ input }) => input === control);
    if (field && camposTocados.has(field.key)) validarFormulario();
  });
  form.addEventListener('focusout', (event) => {
    const field = fields.find(({ input }) => input === event.target);
    if (!field) return;
    camposTocados.add(field.key);
    validarFormulario();
  });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (intentoDePagoEnCurso || !validarFormulario(true)) {
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    intentoDePagoEnCurso = true;
    const buttons = [...document.querySelectorAll('#payment-form button[type="submit"], [form="payment-form"]')];
    const originalLabels = buttons.map((button) => button.textContent);
    buttons.forEach((button) => {
      button.disabled = true;
      button.textContent = 'Procesando…';
    });

    const resultado = await simularPago(cardNumber.value);
    solicitud.paso = resultado.ok ? 5 : 6;
    solicitud.pago.tarjetaPrueba = cardNumber.value.replace(/\s/g, '') === TARJETA_RECHAZADA
      ? 'rechazada'
      : 'aprobada';
    solicitud.pago.motivo = resultado.ok ? '' : resultado.motivo;

    if (resultado.ok) solicitud.poliza = generarPoliza();
    guardarSolicitud();
    window.location.assign(resultado.ok ? '/views/exito.html' : '/views/error-pago.html');

    buttons.forEach((button, index) => {
      button.disabled = false;
      button.textContent = originalLabels[index];
    });
    intentoDePagoEnCurso = false;
  });
}

function mostrarErrorCargaPlanes() {
  document.querySelectorAll('[data-plan-load-error]').forEach((element) => {
    element.hidden = false;
  });
}

async function cargarPlanes() {
  const response = await fetch(PLANES_URL);
  if (!response.ok) {
    throw new Error(`No se pudo cargar ${PLANES_URL}: HTTP ${response.status}`);
  }

  const data = await response.json();
  if (
    !Array.isArray(data)
    || data.length === 0
    || data.some((plan) => (
      !plan.id
      || !plan.nombre
      || !Number.isFinite(plan.tasaAnual)
      || !Array.isArray(plan.coberturas)
    ))
  ) {
    throw new Error('El archivo de planes tiene un formato inválido.');
  }
  planes = data;
}

function iniciarResultados() {
  document.querySelector('[data-download-policy]')?.addEventListener('click', () => {
    const policy = [
      'CONSTANCIA DE CONTRATACIÓN SIMULADA',
      'Documento de demostración sin validez legal ni cobertura real.',
      `Póliza: ${solicitud.poliza ?? '—'}`,
      `Titular: ${solicitud.titular.nombre} ${solicitud.titular.apellido}`,
      `Email: ${solicitud.titular.email}`,
      `Equipo: ${solicitud.equipo.marca} ${solicitud.equipo.modelo}`,
      `Plan: ${obtenerPlan()?.nombre ?? '—'}`,
      `Cuota mensual: ${formatearMoneda(obtenerCuota(obtenerPlan()) ?? 0)}`,
      `Vigencia desde: ${new Intl.DateTimeFormat('es-AR').format(new Date())}`,
    ].join('\n');
    const link = document.createElement('a');
    const url = URL.createObjectURL(new Blob([policy], { type: 'text/plain;charset=utf-8' }));
    link.href = url;
    link.download = `${solicitud.poliza ?? 'constancia'}-simulacion.txt`;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  document.querySelector('[data-reset-request]')?.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
  });
}

function obtenerPasoActual() {
  const path = window.location.pathname;
  if (path.endsWith('/cotizar.html')) return 1;
  if (path.endsWith('/planes.html')) return 2;
  if (path.endsWith('/datos.html')) return 3;
  if (path.endsWith('/pago.html')) return 4;
  if (path.endsWith('/exito.html')) return 5;
  if (path.endsWith('/error-pago.html')) return 6;
  return 0;
}

export async function initializeCheckout() {
  solicitud.paso = obtenerPasoActual();
  if (solicitud.paso === 0) localStorage.removeItem(STORAGE_KEY);
  else guardarSolicitud();

  try {
    await cargarPlanes();
  } catch (error) {
    console.error('No se pudieron cargar las tarifas de los planes.', error);
    mostrarErrorCargaPlanes();
  }

  if (planes.length && !obtenerPlan()) solicitud.plan = planes.find((plan) => plan.recomendado)?.id ?? planes[0].id;
  render();
  iniciarCotizacion();
  iniciarPlanes();
  iniciarDatosPersonales();
  iniciarPago();
  iniciarResultados();
}
