import Link from "next/link";

export default function TopBarMain() {
  return (
    <>
      <div className="h-[57px]" />
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-dashed border-line bg-white px-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/remy-logo.svg"
          alt="REMY Performance Soccer"
          className="h-[27px] w-[76px]"
        />
        <Link
          href="/menu"
          aria-label="메뉴"
          className="flex h-[38px] w-[38px] items-center justify-center gap-[3px] rounded-full border border-[#222222] bg-[#555555]"
        >
          <span className="h-[2px] w-[2px] bg-white" />
          <span className="h-[2px] w-[2px] bg-white" />
          <span className="h-[2px] w-[2px] bg-white" />
        </Link>
      </header>
    </>
  );
}
