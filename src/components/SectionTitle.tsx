export default function SectionTitle({
  label,
  title,
}: {
  label: string;
  title: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-[6px]">
        <span className="h-[10px] w-[3px] bg-primary" />
        <span className="text-[10px] font-extrabold leading-[11px]">{label}</span>
      </div>
      <h2 className="mt-[10px] whitespace-pre-line text-lg font-extrabold leading-[23px]">
        {title}
      </h2>
    </div>
  );
}
