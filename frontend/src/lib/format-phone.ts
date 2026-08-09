/**
 * Formata um telefone brasileiro no padrão (xx) xxxxx-xxxx.
 * Remove caracteres não numéricos e aplica a formatação.
 * Retorna o valor original se não for possível formatar.
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length !== 11) return phone;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/**
 * Formata progressivamente um telefone enquanto o usuário digita:
 * - 0-2 dígitos: `(xx`
 * - 3-7 dígitos: `(xx) xxxxx`
 * - 8-11 dígitos: `(xx) xxxxx-xxxx`
 * Remove não-dígitos e limita a 11 dígitos (telefone móvel).
 */
export function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}
