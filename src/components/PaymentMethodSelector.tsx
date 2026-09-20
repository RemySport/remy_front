import type { PaymentMethod } from "@/lib/api/payments";

const METHODS: Array<{ value: PaymentMethod; title: string; description: string }> = [
  { value: "CARD", title: "앱카드·간편결제", description: "카드사 앱 또는 간편결제로 결제" },
  { value: "TRANSFER", title: "계좌결제", description: "본인 계좌 인증 후 즉시 출금" },
];

export default function PaymentMethodSelector({
  value,
  onChange,
  disabled = false,
}: {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  disabled?: boolean;
}) {
  return (
    <fieldset disabled={disabled}>
      <legend className="mb-[10px] text-[8px] font-bold leading-[9px]">
        결제수단 <span className="text-soft">(필수)</span>
      </legend>
      <div className="grid grid-cols-2 gap-[10px]">
        {METHODS.map((method) => {
          const selected = value === method.value;
          return (
            <button
              key={method.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(method.value)}
              className={`min-h-[72px] rounded border p-3 text-left transition ${
                selected ? "border-primary bg-primary/5" : "border-line bg-white"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <span className="block text-xs font-extrabold">{method.title}</span>
              <span className="mt-1 block text-[9px] leading-[13px] text-soft">{method.description}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
