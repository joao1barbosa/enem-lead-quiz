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
