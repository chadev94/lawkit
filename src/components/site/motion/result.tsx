/**
 * "1심 유죄 → 항소심 무죄" 같은 결과 문장을 앞/뒤로 나눈다.
 * 뒤(결과)만 강조·밑줄 움직임을 준다. 화살표가 없으면 전체를 결과로 본다.
 */
export function splitResult(
  text: string | null | undefined,
): { from: string | null; to: string } | null {
  if (!text) return null;
  const parts = text.split(/\s*(?:→|->)\s*/);
  if (parts.length >= 2) {
    return {
      from: parts[0].trim() || null,
      to: parts.slice(1).join(" → ").trim(),
    };
  }
  return { from: null, to: text.trim() };
}

export function ResultText({ text }: { text: string | null | undefined }) {
  const res = splitResult(text);
  if (!res) return null;
  return (
    <span className="m-result">
      {res.from && <span className="m-from">{res.from}</span>}
      <span className="m-to">{res.to}</span>
    </span>
  );
}
