"use client";

export default function TogglePill({
  options,
  value,
  onChange,
}: {
  options: [string, string];
  value: 0 | 1;
  onChange: (v: 0 | 1) => void;
}) {
  return (
    <div className="relative mx-auto h-[42px] w-[146px] rounded-full border border-line bg-[#EFF0F2]">
      <span
        className="absolute top-[2px] h-9 w-[70px] rounded-full border border-line bg-white transition-all duration-200"
        style={{ left: value === 0 ? 2 : 73 }}
      />
      {options.map((label, i) => (
        <button
          key={label}
          type="button"
          onClick={() => onChange(i as 0 | 1)}
          className={`absolute top-0 h-full w-[70px] text-xs font-extrabold ${
            i === 0 ? "left-[2px]" : "left-[73px]"
          } ${value === i ? "text-black" : "text-soft"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
