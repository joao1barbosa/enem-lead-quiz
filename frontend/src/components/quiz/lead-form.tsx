import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const leadFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().regex(/^\d{10,11}$/, 'Telefone inválido (10-11 dígitos)'),
  honeypot: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadFormSchema>;

interface LeadFormProps {
  onSubmit: (data: { name: string; email: string; phone: string }) => void;
}

interface FormFieldProps {
  id: keyof LeadFormData;
  label: string;
  type?: 'text' | 'email' | 'tel';
  placeholder?: string;
  error?: string;
  registration: ReturnType<ReturnType<typeof useForm<LeadFormData>>['register']>;
}

const inputClassName =
  'mt-1 w-full rounded-lg border border-border p-3';

function FormField({
  id,
  label,
  type = 'text',
  placeholder,
  error,
  registration,
}: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <input
        {...registration}
        id={id}
        type={type}
        placeholder={placeholder}
        className={inputClassName}
      />
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function LeadForm({ onSubmit }: LeadFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
  });

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
        error={errors.name?.message}
        registration={register('name')}
      />
      <FormField
        id="email"
        label="Email"
        type="email"
        error={errors.email?.message}
        registration={register('email')}
      />
      <FormField
        id="phone"
        label="Telefone"
        type="tel"
        placeholder="11999999999"
        error={errors.phone?.message}
        registration={register('phone')}
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

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-primary px-6 py-3 text-primary-foreground font-semibold disabled:opacity-50"
      >
        Ver Resultado
      </button>
    </form>
  );
}
