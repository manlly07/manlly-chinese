import { useEffect, useState } from "react";
import { type HanziParts, loadHanziParts } from "@/lib/hanzi-parts";

/** Cấu tạo chữ + thông tin bộ thủ (tải một lần, dùng chung). `null` khi đang tải. */
export function useHanziParts(): HanziParts | null {
  const [hp, setHp] = useState<HanziParts | null>(null);
  useEffect(() => {
    let alive = true;
    void loadHanziParts().then((x) => alive && setHp(x));
    return () => {
      alive = false;
    };
  }, []);
  return hp;
}
