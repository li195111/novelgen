import { MAX_TEAXTAREA_HEIGHT } from "@/constant";

export const dynamicHeight = (
  ref: React.RefObject<HTMLTextAreaElement>,
  limit?: number
) => {
  if (!limit) {
    limit = MAX_TEAXTAREA_HEIGHT;
    if (ref.current && ref.current.scrollHeight < limit) {
      // 重置高度避免縮小時的問題
      ref.current.style.height = "auto";
      // 設置新的高度
      ref.current.style.height = `${ref.current.scrollHeight + 2}px`;
    }
  } else if (limit == -1) {
    if (ref.current) {
      // 重置高度避免縮小時的問題
      ref.current.style.height = "auto";
      // 設置新的高度
      ref.current.style.height = `${ref.current.scrollHeight + 2}px`;
    }
  }
};
