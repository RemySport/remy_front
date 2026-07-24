"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import TopBarMain from "@/components/TopBarMain";
import BottomNav from "@/components/BottomNav";
import SectionTitle from "@/components/SectionTitle";
import { ArrowRightIcon } from "@/components/icons";
import { useAuth } from "@/lib/auth/AuthContext";

const LINKS = [
  { href: "/profile", label: "마이페이지", authOnly: true },
  { href: "/myteam", label: "마이팀 설정", authOnly: true },
  { href: "/goods", label: "굿즈", authOnly: false },
  { href: "/notices", label: "공지사항", authOnly: false },
  { href: "/faq", label: "자주 묻는 질문", authOnly: false },
] as const;

export default function MenuPage() {
  const { status, user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <div className="pb-[130px]">
      <TopBarMain />

      <section className="px-4 pt-7">
        <SectionTitle
          label="메뉴"
          title={status === "authenticated" ? `${user?.nickname ?? ""}님, 안녕하세요.` : "로그인이 필요해요."}
        />
      </section>

      <div className="mx-4 mt-7 border-t border-line" />

      <nav className="px-4">
        {LINKS.filter((l) => !l.authOnly || status === "authenticated").map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="flex items-center justify-between border-b border-line py-5 text-sm font-bold last:border-b-0"
          >
            {l.label}
            <ArrowRightIcon className="h-[13px] w-[14px] text-soft" />
          </Link>
        ))}

        {status === "authenticated" ? (
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-between border-b border-line py-5 text-left text-sm font-bold text-primary last:border-b-0"
          >
            로그아웃
          </button>
        ) : (
          <Link
            href="/login"
            className="flex items-center justify-between border-b border-line py-5 text-sm font-bold text-primary last:border-b-0"
          >
            로그인
            <ArrowRightIcon className="h-[13px] w-[14px] text-primary" />
          </Link>
        )}
      </nav>

      <BottomNav active="grid" />
    </div>
  );
}
