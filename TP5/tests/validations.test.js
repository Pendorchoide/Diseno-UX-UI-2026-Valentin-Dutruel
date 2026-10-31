import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validarAntiguedad,
  validarCelular,
  validarCvv,
  validarDni,
  validarEmail,
  validarMarca,
  validarModelo,
  validarNacimiento,
  validarTarjeta,
  validarTerminos,
  validarValor,
  validarVencimiento,
} from '../src/validations.js';

test('valida marca, modelo, monto y antigüedad', () => {
  assert.equal(validarMarca('Samsung'), null);
  assert.match(validarMarca(''), /marca/);
  assert.equal(validarModelo('Galaxy A55'), null);
  assert.match(validarModelo('X'), /modelo/);
  assert.equal(validarValor('600.000'), null);
  assert.notEqual(validarValor('abc600.000'), null);
  assert.notEqual(validarValor('2.500.001'), null);
  assert.equal(validarAntiguedad('menos-1'), null);
  assert.notEqual(validarAntiguedad(''), null);
});

test('valida identidad y datos de contacto', () => {
  const today = new Date(2026, 9, 30);
  assert.equal(validarDni('30123456'), null);
  assert.notEqual(validarDni('30.123.456'), null);
  assert.equal(validarNacimiento('30/10/2008', today), null);
  assert.equal(validarNacimiento('2008-10-30', today), null);
  assert.notEqual(validarNacimiento('31/10/2008', today), null);
  assert.notEqual(validarNacimiento('2008-10-31', today), null);
  assert.notEqual(validarNacimiento('31/02/1990', today), null);
  assert.notEqual(validarNacimiento('1990-02-31', today), null);
  assert.equal(validarEmail('juan.perez@mail.com'), null);
  assert.notEqual(validarEmail('juan.perez@'), null);
  assert.equal(validarCelular('11 5555-1234'), null);
  assert.notEqual(validarCelular('15 5555-1234'), null);
  assert.equal(validarTerminos(true), null);
  assert.notEqual(validarTerminos(false), null);
});

test('valida datos simulados de tarjeta', () => {
  const today = new Date(2026, 9, 30);
  assert.equal(validarTarjeta('4111 1111 1111 1111'), null);
  assert.equal(validarTarjeta('4000 0000 0000 0002'), null);
  assert.notEqual(validarTarjeta('4111'), null);
  assert.equal(validarVencimiento('12/28', today), null);
  assert.notEqual(validarVencimiento('09/26', today), null);
  assert.equal(validarCvv('123'), null);
  assert.notEqual(validarCvv('12'), null);
});
