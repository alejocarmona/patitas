// Máscara para escribir fechas como AAAA-MM-DD solo con el teclado numérico.
export function maskDateInput(text) {
  const digits = String(text ?? '').replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}
