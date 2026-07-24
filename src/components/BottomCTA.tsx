import Link from "next/link";
import { ArrowRightIcon } from "./icons";

type BottomCTAProps =
  | { label: string; href: string; arrow?: boolean; onClick?: never; disabled?: never }
  | { label: string; href?: never; arrow?: boolean; onClick: () => void; disabled?: boolean };

export default function BottomCTA(props: BottomCTAProps) {
  const { label, arrow = false } = props;
  const className =
    "mx-auto flex h-[50px] w-[348px] items-center justify-center gap-3 rounded-md bg-primary text-sm font-bold text-white disabled:opacity-50";

  return (
    <div className="fixed bottom-0 left-1/2 z-40 h-[100px] w-full max-w-[402px] -translate-x-1/2 bg-[#EEEEEE] pt-[15px]">
      {props.href ? (
        <Link href={props.href} className={className}>
          {label}
          {arrow && <ArrowRightIcon className="h-[14px] w-[15px] text-white" />}
        </Link>
      ) : (
        <button type="button" onClick={props.onClick} disabled={props.disabled} className={className}>
          {label}
          {arrow && <ArrowRightIcon className="h-[14px] w-[15px] text-white" />}
        </button>
      )}
    </div>
  );
}
