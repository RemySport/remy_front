"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const CART_KEY = "remy.cart";

export type CartItem = {
  goodsId: number;
  variantId: number;
  name: string;
  /** 예: "사이즈: M / 컬러: 레드" — 담을 때 스냅샷으로 저장해둔다. */
  optionLabel: string;
  price: number;
  thumbnailUrl: string | null;
  quantity: number;
  /** 담을 당시의 재고 스냅샷. 수량 조정 상한으로만 쓰고, 최종 재고 검증은 주문 생성 API가 한다. */
  stock: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity: number) => void;
  setQuantity: (goodsId: number, variantId: number, quantity: number) => void;
  removeItem: (goodsId: number, variantId: number) => void;
  clear: () => void;
  totalCount: number;
  totalAmount: number;
};

const CartContext = createContext<CartContextValue | null>(null);

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {
    // 용량 초과 등은 "저장이 안 될 뿐"이라 조용히 넘긴다.
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  /*
   * output: "export" 정적 배포라 이 컴포넌트는 localStorage 없이 빌드된 정적 HTML로 먼저
   * 그려진다. 초기 state를 localStorage 값으로 바로 채우면 그 정적 HTML과 클라이언트 첫
   * 렌더가 달라져 하이드레이션 에러가 나므로, 초기값은 항상 빈 배열로 맞추고 마운트 후
   * useEffect에서 복원한다.
   */
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    void Promise.resolve().then(() => setItems(readCart()));
  }, []);

  useEffect(() => {
    writeCart(items);
  }, [items]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">, quantity: number) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.goodsId === item.goodsId && i.variantId === item.variantId);
      if (!existing) {
        return [...prev, { ...item, quantity: Math.min(quantity, item.stock) }];
      }
      return prev.map((i) =>
        i === existing ? { ...i, quantity: Math.min(i.quantity + quantity, item.stock) } : i
      );
    });
  }, []);

  const setQuantity = useCallback((goodsId: number, variantId: number, quantity: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.goodsId === goodsId && i.variantId === variantId
          ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) }
          : i
      )
    );
  }, []);

  const removeItem = useCallback((goodsId: number, variantId: number) => {
    setItems((prev) => prev.filter((i) => !(i.goodsId === goodsId && i.variantId === variantId)));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const totalCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const totalAmount = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);

  return (
    <CartContext.Provider value={{ items, addItem, setQuantity, removeItem, clear, totalCount, totalAmount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart는 CartProvider 내부에서만 사용할 수 있습니다.");
  return ctx;
}
