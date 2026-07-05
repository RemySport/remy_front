export default function TopBarMain() {
  return (
    <>
      <div className="h-[57px]" />
      <header className="flex h-16 items-center justify-between border-b border-dashed border-line px-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/remy-logo.svg"
          alt="REMY Performance Soccer"
          className="h-[27px] w-[76px]"
        />
        <div className="flex h-[38px] w-20 items-center rounded-full border border-[#222222] bg-[#555555]">
          <button
            type="button"
            aria-label="더보기"
            className="flex h-full flex-1 items-center justify-center gap-[3px]"
          >
            <span className="h-[2px] w-[2px] bg-white" />
            <span className="h-[2px] w-[2px] bg-white" />
            <span className="h-[2px] w-[2px] bg-white" />
          </button>
          <span className="h-4 w-[2px] bg-[#666666]" />
          <button
            type="button"
            aria-label="닫기"
            className="flex h-full flex-1 items-center justify-center"
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M1 1L10 10M10 1L1 10" stroke="white" strokeWidth="1.6" />
            </svg>
          </button>
        </div>
      </header>
    </>
  );
}
