import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const leadFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().regex(/^\d{10,11}$/, 'Telefone inválido (10-11 dígitos)'),
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
  registration: ReturnType<ReturnType<typeof useForm<LeadFormData>>['register']>;
}

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
      <Label htmlFor={id} className="block">
        {label}
      </Label>
      <Input
        {...registration}
        id={id}
        type={type}
        placeholder={placeholder}
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
    formState: { errors, isSubmitting: formSubmitting },
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
