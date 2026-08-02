import { useEffect, useState } from 'react';
import { Handshake, Loader2, MapPin, Save } from 'lucide-react';

import { useCreateSalePoint } from '@/features/sale-points/hooks/use-sale-points';
import { useUsers } from '@/features/users/hooks/use-users';
import { UserRole } from '@/features/users/types';
import { cn } from '@/shared/lib/cn';
import { Modal } from '@/shared/ui/modal';
import { Select } from '@/shared/ui/select';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface FormState {
  name: string;
  code: string;
  ownerPartnerId: string;
}

const EMPTY: FormState = {
  name: '',
  code: '',
  ownerPartnerId: '',
};

export function CreateSalePointModal({ open, onClose }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const { mutateAsync, isPending, error, reset } = useCreateSalePoint();

  // We need the list of partners to populate the owner dropdown. Only fetch
  // when the modal is actually open so the list refreshes on every use.
  const { data: partnersPage, isLoading: loadingPartners } = useUsers({
    role: UserRole.PARTNER,
    limit: 100,
    offset: 0,
  });

  useEffect(() => {
    if (open) {
      setForm(EMPTY);
      reset();
    }
  }, [open, reset]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const trimmed = {
    name: form.name.trim(),
    code: form.code.trim(),
  };
  const isValid =
    trimmed.name.length > 0 &&
    trimmed.code.length >= 2 &&
    /^[A-Za-z0-9-]+$/.test(trimmed.code);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isPending) return;
    // El % de pago del encargado ya no se configura acá — vive en el
    // usuario socio (users.payment_percentage). Ver movements-balance
    // use-case: usa owner.paymentPercentage con fallback al legacy.
    await mutateAsync({
      name: trimmed.name,
      code: trimmed.code,
      ownerPartnerId: form.ownerPartnerId || undefined,
    });
    onClose();
  };

  const partners = partnersPage?.items ?? [];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nueva sucursal"
      description="Crea un puesto de venta y opcionalmente asigna un encargado."
      size="max-w-xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="create-sale-point-form"
            disabled={!isValid || isPending}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition',
              !isValid || isPending
                ? 'cursor-not-allowed opacity-60'
                : 'hover:bg-primary/90',
            )}
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" strokeWidth={2.4} />
            )}
            Guardar
          </button>
        </>
      }
    >
      <form
        id="create-sale-point-form"
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <Field label="Nombre" required>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="ej. Sucursal León"
              maxLength={120}
              autoFocus
              className={cn(inputClass, 'pl-9')}
            />
          </div>
        </Field>

        <Field
          label="Código"
          required
          hint="Solo letras, números y guiones. Mínimo 2 caracteres."
        >
          <input
            type="text"
            value={form.code}
            onChange={(e) => set('code', e.target.value.toUpperCase())}
            placeholder="LEON-01"
            maxLength={30}
            className={cn(inputClass, 'font-mono uppercase')}
          />
        </Field>

        <Field
          label="Encargado de sucursal"
          hint={
            partners.length === 0
              ? 'Aún no hay socios. Crea uno desde Usuarios primero.'
              : 'Opcional — déjalo sin asignar para operarla tú mismo.'
          }
        >
          <Select
            value={form.ownerPartnerId}
            onChange={(v) => set('ownerPartnerId', v)}
            leadingIcon={<Handshake className="size-4" />}
            placeholder={
              loadingPartners
                ? 'Cargando socios…'
                : 'Sin encargado (opera el owner)'
            }
            disabled={loadingPartners}
            options={[
              { value: '', label: 'Sin encargado (opera el owner)' },
              ...partners.map((p) => ({ value: p.id, label: p.name })),
            ]}
          />
        </Field>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error.message}
          </div>
        )}
      </form>
    </Modal>
  );
}

const inputClass =
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60';

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-center gap-1 text-sm font-semibold text-foreground">
        {label}
        {required && <span className="text-destructive">*</span>}
      </span>
      {children}
      {hint && (
        <span className="block text-xs text-muted-foreground">{hint}</span>
      )}
    </label>
  );
}
