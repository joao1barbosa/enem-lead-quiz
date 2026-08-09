import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { formatPhoneInput } from '@/lib/format-phone';

const leadFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  // Valida apenas os dígitos (móvel com 11 dígitos); a máscara é exibida no input.
  phone: z.string().regex(/^\d{11}$/, 'Telefone inválido (11 dígitos)'),
  honeypot: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadFormSchema>;

interface LeadFormProps {
  onSubmit: (data: { name: string; email: string; phone: string }) => void;
  /** Submissão pendente no backend (ex.: mutation React Query). */
  isSubmitting?: boolean;
}

interface FormFieldProps {
  id: keyof LeadFormData;
  label: string;
  type?: 'text' | 'email' | 'tel';
  placeholder?: string;
  error?: string;
  /** Props de registro do react-hook-form (campos sem máscara). */
  registration?: ReturnType<ReturnType<typeof useForm<LeadFormData>>['register']>;
  /** Valor controlado (campos com máscara). */
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function FormField({
  id,
  label,
  type = 'text',
  placeholder,
  error,
  registration,
  value,
  onChange,
}: FormFieldProps) {
  return (
    <div>
      <Label htmlFor={id} className="block">
        {label}
      </Label>
      <Input
        {...(registration ?? {})}
        id={id}
        type={type}
        placeholder={placeholder}
        {...(value !== undefined ? { value } : {})}
        {...(onChange ? { onChange } : {})}
        className="mt-1 h-auto rounded-lg p-3"
      />
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function LeadForm({ onSubmit, isSubmitting: submitting = false }: LeadFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting: formSubmitting },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
  });

  // Valor exibido no input de telefone (com máscara); o form guarda apenas os dígitos.
  const [phoneDisplay, setPhoneDisplay] = useState('');

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneInput(event.target.value);
    setPhoneDisplay(formatted);
    // Guarda apenas os dígitos no react-hook-form (enviado ao backend em plain text).
    setValue('phone', formatted.replace(/\D/g, ''), { shouldValidate: true });
  };

  const handleFormSubmit = (data: LeadFormData) => {
    // Honeypot preenchido = bot: descarta silenciosamente (RNF-01).
    if (data.honeypot) {
      return;
    }

    onSubmit({
      name: data.name,
      email: data.email,
      phone: data.phone,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="space-y-6">
      <FormField
        id="name"
        label="Nome"
        placeholder="Seu nome completo"
        error={errors.name?.message}
        registration={register('name')}
      />
      <FormField
        id="email"
        label="Email"
        type="email"
        placeholder="seu@email.com"
        error={errors.email?.message}
        registration={register('email')}
      />
      <FormField
        id="phone"
        label="Telefone"
        type="tel"
        placeholder="(11) 99999-9999"
        error={errors.phone?.message}
        value={phoneDisplay}
        onChange={handlePhoneChange}
      />

      {/* Honeypot: invisível para humanos, detecta bots preenchendo (RNF-01) */}
      <input
        {...register('honeypot')}
        type="text"
        name="honeypot"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        data-testid="honeypot-field"
        style={{ position: 'absolute', left: '-9999px' }}
      />

      <Button
        type="submit"
        data-testid="submit-button"
        disabled={formSubmitting || submitting}
        className="w-full h-auto rounded-lg px-6 py-3 text-base font-semibold"
      >
        Ver Resultado
      </Button>
    </form>
  );
}
