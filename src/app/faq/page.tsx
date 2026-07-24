"use client";

import { useEffect, useState } from "react";
import TopBarSub from "@/components/TopBarSub";
import { ArrowDownIcon } from "@/components/icons";
import { getFaqs, type FaqResponse } from "@/lib/api/support";
import { ApiError } from "@/lib/api/client";

const CATEGORIES = [
  { value: undefined, label: "전체" },
  { value: "TICKET", label: "티켓" },
  { value: "PAYMENT", label: "결제" },
  { value: "ACCOUNT", label: "계정" },
] as const;

export default function FaqPage() {
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [faqs, setFaqs] = useState<FaqResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    Promise.resolve()
      .then(() => {
        setFaqs(null);
        return getFaqs(category);
      })
      .then(setFaqs)
      .catch((e) => setError(e instanceof ApiError ? e.message : "FAQ를 불러오지 못했습니다."));
  }, [category]);

  return (
    <div className="pb-16">
      <TopBarSub title="자주 묻는 질문" icon="back" href="/menu" />

      <div className="flex gap-[10px] overflow-x-auto px-4 pb-1 pt-6">
        {CATEGORIES.map((c) => (
          <button
            key={c.label}
            type="button"
            onClick={() => setCategory(c.value)}
            className={`h-[34px] shrink-0 whitespace-nowrap rounded-full px-6 text-xs font-bold ${
              category === c.value ? "bg-primary text-white" : "border border-line bg-white text-black"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-4 px-4">
        {error && <p className="text-center text-xs text-soft">{error}</p>}
        {!error && faqs === null && <p className="text-center text-xs text-soft">불러오는 중...</p>}
        {!error && faqs !== null && faqs.length === 0 && (
          <p className="text-center text-xs text-soft">등록된 FAQ가 없습니다.</p>
        )}
        {(faqs ?? []).map((f) => (
          <div key={f.faqId} className="border-b border-line py-4">
            <button
              type="button"
              onClick={() => setOpenId((id) => (id === f.faqId ? null : f.faqId))}
              className="flex w-full items-center justify-between gap-3 text-left text-xs font-bold"
            >
              {f.question}
              <ArrowDownIcon
                className={`h-[10px] w-[10px] shrink-0 text-black transition-transform ${
                  openId === f.faqId ? "rotate-180" : ""
                }`}
              />
            </button>
            {openId === f.faqId && <p className="mt-3 text-xs text-soft">{f.answer}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
