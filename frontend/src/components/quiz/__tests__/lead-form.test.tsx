import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LeadForm } from '../lead-form';

describe('LeadForm', () => {
  it('should render form fields', () => {
    render(<LeadForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/telefone/i)).toBeInTheDocument();
  });

  it('should show validation error for empty name', async () => {
    render(<LeadForm onSubmit={vi.fn()} />);

    fireEvent.click(screen.getByText(/ver resultado/i));

    await waitFor(() => {
      expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument();
    });
  });

  it('should show validation error for invalid email', async () => {
    render(<LeadForm onSubmit={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'invalid-email' },
    });
    fireEvent.click(screen.getByText(/ver resultado/i));

    await waitFor(() => {
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
    });
  });

  it('should show validation error for invalid phone', async () => {
    render(<LeadForm onSubmit={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/telefone/i), {
      target: { value: '123' },
    });
    fireEvent.click(screen.getByText(/ver resultado/i));

    await waitFor(() => {
      expect(screen.getByText(/telefone inválido/i)).toBeInTheDocument();
    });
  });

  it('should call onSubmit with valid data', async () => {
    const onSubmit = vi.fn();
    render(<LeadForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/nome/i), {
      target: { value: 'João Silva' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'joao@email.com' },
    });
    fireEvent.change(screen.getByLabelText(/telefone/i), {
      target: { value: '11999999999' },
    });
    fireEvent.click(screen.getByText(/ver resultado/i));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'João Silva',
        email: 'joao@email.com',
        phone: '11999999999',
      });
    });
  });

  it('should have hidden honeypot field', () => {
    render(<LeadForm onSubmit={vi.fn()} />);

    const honeypot = screen.getByTestId('honeypot-field');
    expect(honeypot).toBeInTheDocument();
    expect(honeypot).toHaveStyle({ position: 'absolute', left: '-9999px' });
  });

  it('should not call onSubmit when honeypot is filled', async () => {
    const onSubmit = vi.fn();
    render(<LeadForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/nome/i), {
      target: { value: 'João Silva' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'joao@email.com' },
    });
    fireEvent.change(screen.getByLabelText(/telefone/i), {
      target: { value: '11999999999' },
    });
    fireEvent.change(screen.getByTestId('honeypot-field'), {
      target: { value: 'bot-payload' },
    });
    fireEvent.click(screen.getByText(/ver resultado/i));

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });
});
