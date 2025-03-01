function fibonacci(n, sequence = [0, 1]) {
  if (n === 0) return [0];
  if (n === 1) return [0, 1];

  if (sequence.length <= n) {
    sequence.push(sequence[sequence.length - 1] + sequence[sequence.length - 2]);
    return fibonacci(n, sequence);
  }

  return sequence;
}

// Jangan hapus kode di bawah ini!
export default fibonacci;
