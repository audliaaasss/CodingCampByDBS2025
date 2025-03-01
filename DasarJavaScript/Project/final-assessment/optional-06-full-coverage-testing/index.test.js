import test from 'node:test';
import assert from 'node:assert';
import sum from './index.js';

test('Menjumlahkan dua angka positif', () => {
  assert.strictEqual(sum(5, 10), 15);
});

test('Mengembalikan 0 jika salah satu angka negatif', () => {
  assert.strictEqual(sum(-5, 10), 0);
  assert.strictEqual(sum(5, -10), 0);
});

test('Mengembalikan 0 jika kedua angka negatif', () => {
  assert.strictEqual(sum(-5, -10), 0);
});

test('Mengembalikan 0 jika salah satu parameter bukan angka', () => {
  assert.strictEqual(sum('5', 10), 0);
  assert.strictEqual(sum(5, '10'), 0);
  assert.strictEqual(sum(true, 10), 0);
  assert.strictEqual(sum(5, null), 0);
});

test('Mengembalikan 0 jika kedua parameter bukan angka', () => {
  assert.strictEqual(sum('5', '10'), 0);
  assert.strictEqual(sum(true, false), 0);
  assert.strictEqual(sum(null, undefined), 0);
});

test('Mengembalikan 0 jika salah satu parameter tidak diberikan', () => {
  assert.strictEqual(sum(5), 0);
});

test('Mengembalikan 0 jika kedua parameter tidak diberikan', () => {
  assert.strictEqual(sum(), 0);
});
