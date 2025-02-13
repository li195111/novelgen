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

export const parseResponse = (response: string) => {
  // 找出 <think> 的起始位置
  const thinkStart = response.indexOf("<think>");
  if (thinkStart === -1) return null;

  // 找出 </think> 的結束位置
  const thinkEnd = response.indexOf("</think>");

  // 如果找到 <think> 但還沒有 </think>，代表正在思考中
  if (thinkEnd === -1) {
    return {
      thinking: response.substring(thinkStart + 7).trim(),
      response: "",
      isThinking: true,
    };
  }

  // 擷取思考內容和回應內容
  const thinkContent = response.substring(thinkStart + 7, thinkEnd);
  const restContent = response.substring(thinkEnd + 8);

  return {
    thinking: thinkContent.trim(),
    response: restContent.trim(),
    isThinking: false,
  };
};
