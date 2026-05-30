const CHO = [
  "ㄱ",
  "ㄲ",
  "ㄴ",
  "ㄷ",
  "ㄸ",
  "ㄹ",
  "ㅁ",
  "ㅂ",
  "ㅃ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅉ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
];

export function extractChosung(text: string): string {
  let result = "";
  for (const char of text) {
    const code = char.charCodeAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) {
      const choIndex = Math.floor((code - 0xac00) / 588);
      result += CHO[choIndex] ?? "";
    } else if (/[a-zA-Z0-9]/.test(char)) {
      result += char.toLowerCase();
    }
  }
  return result;
}

/** 초성 부분열 매칭: query의 각 글자가 순서대로 target에 있으면 true */
export function matchesChosungSubsequence(
  target: string,
  query: string,
): boolean {
  if (!query) return true;
  let qi = 0;
  for (let ti = 0; ti < target.length && qi < query.length; ti++) {
    if (target[ti] === query[qi]) qi++;
  }
  return qi === query.length;
}

export function isChosungQuery(query: string): boolean {
  return /^[ㄱ-ㅎ]+$/.test(query.trim());
}
