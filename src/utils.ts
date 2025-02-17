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

const parseTag = (response: string, tagName: string) => {
  const startTag = `<${tagName}>`;
  const endTag = `</${tagName}>`;
  const startIndex = response.indexOf(startTag);

  if (startIndex === -1) return { content: "", rest: response };

  const endIndex = response.indexOf(endTag);
  if (endIndex === -1) {
    return {
      content: response.substring(startIndex + startTag.length).trim(),
      rest: "",
      incomplete: true,
    };
  }

  const content = response.substring(startIndex + startTag.length, endIndex);
  const rest = response.substring(endIndex + endTag.length);
  return { content: content.trim(), rest, incomplete: false };
};

interface ParsedResponse {
  completeResponse: string;
  isThinking: boolean;
  [key: string]: any;
}

export const parseResponse = (response: string, tags: string[] = ["think"]) => {
  const result: ParsedResponse = {
    completeResponse: response,
    isThinking: false,
  };

  let currentResponse = response;
  for (let i = 0; i < tags.length; i++) {
    const tag = tags[i];
    const parseResult = parseTag(currentResponse, tag);

    result[tag] = parseResult.content;

    if (i === 0 && parseResult.incomplete) {
      result.isThinking = true;
      return result;
    }

    if (parseResult.incomplete) {
      return result;
    }

    currentResponse = parseResult.rest;
  }
  if (currentResponse) {
    result.response = currentResponse.trim();
  }
  return result;
};
