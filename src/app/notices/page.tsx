"use client";

import { useEffect, useState } from "react";
import TopBarSub from "@/components/TopBarSub";
import { getNotices, type NoticeSummary } from "@/lib/api/support";
import { ApiError } from "@/lib/api/client";

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function NoticesPage() {
  const [notices, setNotices] = useState<NoticeSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getNotices({ size: 50 })
      .then((res) => setNotices(res.notices))
      .catch((e) => setError(e instanceof ApiError ? e.message : "공지사항을 불러오지 못했습니다."));
  }, []);

  return (
    <div className="pb-16">
      <TopBarSub title="공지사항" icon="back" href="/menu" />
      <div className="px-4 pt-6">
        {error && <p className="text-center text-xs text-soft">{error}</p>}
        {!error && notices === null && <p className="text-center text-xs text-soft">불러오는 중...</p>}
        {!error && notices !== null && notices.length === 0 && (
          <p className="text-center text-xs text-soft">등록된 공지사항이 없습니다.</p>
        )}
        {(notices ?? []).map((n) => (
          <div key={n.noticeId} className="flex items-center justify-between border-b border-line py-4">
            <span className="text-xs font-bold">
              {n.isImportant && (
                <span className="mr-2 rounded bg-primary px-2 py-1 text-[9px] text-white">중요</span>
              )}
              {n.title}
            </span>
            <span className="shrink-0 text-[10px] text-soft">{formatDate(n.createdAt)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
