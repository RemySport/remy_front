import Link from "next/link";
import { ArrowRightIcon } from "./icons";

export default function BottomCTA({
  label,
  href,
  arrow = false,
}: {
  label: string;
  href: string;
  arrow?: boolean;
}) {
  return (
    <div className="fixed bottom-0 left-1/2 z-40 h-[100px] w-full max-w-[402px] -translate-x-1/2 bg-[#EEEEEE] pt-[15px]">
      <Link
        href={href}
        className="mx-auto flex h-[50px] w-[348px] items-center justify-center gap-3 rounded-md bg-primary text-sm font-bold text-white"
      >
        {label}
        {arrow && <ArrowRightIcon className="h-[14px] w-[15px] text-white" />}
      </Link>
    </div>
  );
}
