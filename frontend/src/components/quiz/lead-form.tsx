import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const leadFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().regex(/^\d{10,11}$/, 'Telefone inválido (10-11 dígitos)'),
});

type LeadFormData = z.infer<typeof leadFormSchema>;

interface LeadFormProps {
  onSubmit: (data: { name: string; email: string; phone: string }) => void;
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
    onSubmit({
      name: data.name,
      email: data.email,
      phone: data.phone,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Nome
        </label>
        <input
          {...register('name')}
          id="name"
          type="text"
          className="mt-1 w-full rounded-lg border border-border p-3"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          {...register('email')}
          id="email"
          type="email"
          className="mt-1 w-full rounded-lg border border-border p-3"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium">
          Telefone
        </label>
        <input
          {...register('phone')}
          id="phone"
          type="tel"
          placeholder="11999999999"
          className="mt-1 w-full rounded-lg border border-border p-3"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-destructive">{errors.phone.message}</p>
        )}
      </div>

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
